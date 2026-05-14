import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

// Simple cart store - replace with your actual cart import
const useCart = () => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const clear = () => {
    setItems([]);
    localStorage.setItem("cart", "[]");
  };
  
  return { items, subtotal, clear };
};

const inr = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");
  const [processing, setProcessing] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);

  const shipping = subtotal > 599 ? 0 : 49;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + gst;

  const validateForm = (): boolean => {
    const form = formRef.current;
    if (!form) return false;

    const errors: Record<string, string> = {};
    
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value;
    const firstName = (form.elements.namedItem("firstName") as HTMLInputElement)?.value;
    const address = (form.elements.namedItem("address1") as HTMLInputElement)?.value;
    const pincode = (form.elements.namedItem("pincode") as HTMLInputElement)?.value;

    if (!email || !email.includes("@")) {
      errors.email = "Valid email is required";
    }
    if (!phone || phone.length !== 10) {
      errors.phone = "Valid 10-digit phone number is required";
    }
    if (!firstName) errors.firstName = "First name is required";
    if (!address) errors.address = "Address is required";
    if (!pincode || pincode.length !== 6) {
      errors.pincode = "Valid 6-digit pincode is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveOrder = (orderId: string, paymentId?: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push({
      id: orderId,
      paymentId: paymentId || null,
      date: new Date().toISOString(),
      total: total,
      items: items,
      status: method === "cod" ? "confirmed" : "paid",
      method: method,
    });
    localStorage.setItem("orders", JSON.stringify(orders));
  };

  const completeOrder = (orderId: string, paymentId?: string) => {
    saveOrder(orderId, paymentId);
    clear();
    toast.success(method === "cod" ? "Order placed successfully!" : "Payment successful!");
    navigate({ to: "/order-success", search: { id: orderId } as never });
  };

  const placeCodOrder = () => {
    const orderId = "AN" + Math.floor(100000 + Math.random() * 900000);
    completeOrder(orderId);
  };

  const placeRazorpayOrder = async () => {
    setPaymentFailed(false);
    
    try {
      // Load script with retry
      let scriptLoaded = false;
      for (let i = 0; i < 3; i++) {
        scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded) break;
        await new Promise(r => setTimeout(r, 1000));
      }
      
      if (!scriptLoaded || !(window as any).Razorpay) {
        throw new Error("Payment gateway failed to load");
      }

      // Get form data
      const form = formRef.current;
      const get = (name: string) =>
        (form?.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";

      // IMPORTANT: Replace with your actual Razorpay key
      const RAZORPAY_KEY = "rzp_test_YOUR_KEY_HERE";
      
      const orderId = "order_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

      const timeoutId = setTimeout(() => {
        setPaymentFailed(true);
        setProcessing(false);
        toast.error("Payment is taking too long. Please retry or use COD.");
      }, 45000);

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "Ashok Naturals",
        description: "Pure Indian Spices & Natural Foods",
        order_id: orderId,
        prefill: {
          name: `${get("firstName")} ${get("lastName")}`.trim(),
          email: get("email"),
          contact: get("phone"),
        },
        theme: { color: "#1f3d2b" },
        modal: {
          ondismiss: () => {
            clearTimeout(timeoutId);
            setPaymentFailed(true);
            setProcessing(false);
            toast.info("Payment cancelled. You can retry or use COD.");
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      
      razorpay.on("payment.failed", (response: any) => {
        clearTimeout(timeoutId);
        console.error("Payment failed:", response);
        setPaymentFailed(true);
        setProcessing(false);
        toast.error("Payment failed. Please try again.");
      });

      razorpay.on("payment.success", (response: any) => {
        clearTimeout(timeoutId);
        completeOrder(orderId, response.razorpay_payment_id);
      });

      razorpay.open();
      
    } catch (error) {
      console.error("Razorpay error:", error);
      setPaymentFailed(true);
      setProcessing(false);
      toast.error("Payment failed. Please use COD or try again.");
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setProcessing(true);
    setPaymentFailed(false);

    if (method === "cod") {
      setTimeout(() => {
        placeCodOrder();
        setProcessing(false);
      }, 500);
    } else {
      await placeRazorpayOrder();
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-green-800 mb-4">Your cart is empty</h1>
        <button 
          onClick={() => navigate({ to: "/products" })} 
          className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-green-800 mb-8">Checkout</h1>

        <form ref={formRef} onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div className="mt-3">
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Phone number (10 digits)"
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <input
                    name="firstName"
                    required
                    placeholder="First name"
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                </div>
                <input name="lastName" placeholder="Last name" className="w-full px-4 py-3 rounded-lg border border-gray-300" />
              </div>
              <div className="mt-3">
                <input
                  name="address1"
                  required
                  placeholder="Street address"
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
              </div>
              <input name="address2" placeholder="Apartment, suite (optional)" className="w-full px-4 py-3 rounded-lg border border-gray-300 mt-3" />
              <div className="grid md:grid-cols-3 gap-3 mt-3">
                <input name="city" placeholder="City" className="w-full px-4 py-3 rounded-lg border border-gray-300" />
                <input name="state" placeholder="State" className="w-full px-4 py-3 rounded-lg border border-gray-300" />
                <div>
                  <input
                    name="pincode"
                    placeholder="Pincode"
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setMethod("razorpay")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    method === "razorpay" ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <div className="font-bold text-lg">📱 UPI / Card / NetBanking</div>
                  <div className="text-sm text-gray-500">Google Pay • PhonePe • PayTM • Credit/Debit Card</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("cod")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    method === "cod" ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <div className="font-bold text-lg">💰 Cash on Delivery</div>
                  <div className="text-sm text-gray-500">Pay when you receive your order</div>
                </button>
              </div>

              {paymentFailed && method === "razorpay" && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-red-800 font-medium">⚠️ Payment Issue</p>
                  <p className="text-sm text-gray-600 mb-3">You can still complete your order:</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={placeRazorpayOrder}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      🔄 Retry Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("cod")}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                    >
                      💰 Switch to COD
                    </button>
                  </div>
                </div>
              )}

              {processing && method === "razorpay" && !paymentFailed && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
                  <div className="animate-spin text-2xl mb-2">⏳</div>
                  <p className="text-blue-800">Opening payment window...</p>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 text-sm text-green-800">
              <span>🔒</span>
              <span>100% Secure Payments • UPI • Cards • NetBanking</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{inr(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : inr(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>{inr(gst)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-700">{inr(total)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full mt-6 bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : `Place Order • ${inr(total)}`}
              </button>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                By placing your order, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </form>
      </div>
    </div> 
  );
}
  
    
    
  
