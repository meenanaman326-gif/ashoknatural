import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useCart, inr } from "@/lib/cart-store";
import { toast } from "sonner";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/lib/razorpay.functions";
import {
  markStoredOrderPaid,
  saveLastOrder,
  savePendingOrder,
  getStoredOrder,
} from "@/lib/order-storage";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => {
      open: () => void;
      on: (e: string, cb: (r: unknown) => void) => void;
    };
  }
}

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ashok Naturals" }] }),
  component: Checkout,
});

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

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
  const createOrderFn = useServerFn(createRazorpayOrder);
  const verifyFn = useServerFn(verifyRazorpayPayment);

  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");
  const [processing, setProcessing] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showManualUPI, setShowManualUPI] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Handle payment return from Razorpay
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rzpPaymentId = params.get("razorpay_payment_id");
    const rzpOrderId = params.get("razorpay_order_id");
    const rzpSignature = params.get("razorpay_signature");

    if (rzpPaymentId && rzpOrderId && rzpSignature) {
      handlePaymentReturn(rzpOrderId, rzpPaymentId, rzpSignature);
    }
  }, []);

  const handlePaymentReturn = async (orderId: string, paymentId: string, signature: string) => {
    setProcessing(true);
    try {
      await verifyFn({ data: { orderId, paymentId, signature } });
      
      saveLastOrder({
        orderId,
        paymentId,
        method: "razorpay",
        status: "paid",
        total,
        items,
      });

      clear();
      toast.success("Payment successful!");
      navigate({ to: "/order-success", search: { id: orderId } as never });
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Payment verification failed. Please contact support.");
      setProcessing(false);
    }
  };

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
    const lastName = (form.elements.namedItem("lastName") as HTMLInputElement)?.value;
    const address = (form.elements.namedItem("address1") as HTMLInputElement)?.value;
    const city = (form.elements.namedItem("city") as HTMLInputElement)?.value;
    const state = (form.elements.namedItem("state") as HTMLInputElement)?.value;
    const pincode = (form.elements.namedItem("pincode") as HTMLInputElement)?.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Valid email is required";
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      errors.phone = "Valid 10-digit phone number is required";
    }
    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!address) errors.address = "Address is required";
    if (!city) errors.city = "City is required";
    if (!state) errors.state = "State is required";
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      errors.pincode = "Valid 6-digit pincode is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const completeOrder = (paymentInfo: {
    orderId: string;
    paymentId?: string;
    method: "razorpay" | "cod";
  }) => {
    saveLastOrder({
      ...paymentInfo,
      status: paymentInfo.method === "cod" ? "confirmed" : "paid",
      total,
      items,
    });

    clear();
    toast.success(paymentInfo.method === "cod" ? "Order placed successfully!" : "Payment successful!");
    navigate({ to: "/order-success", search: { id: paymentInfo.orderId } as never });
  };

  const placeCodOrder = () => {
    const orderId = "AN" + Math.floor(100000 + Math.random() * 900000);
    completeOrder({ orderId, method: "cod" });
  };

  const placeRazorpayOrder = async () => {
    setPaymentFailed(false);
    setShowManualUPI(false);
    
    try {
      // Load script with retry
      let scriptLoaded = false;
      for (let i = 0; i < 3; i++) {
        scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded) break;
        await new Promise(r => setTimeout(r, 1000));
      }
      
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Payment gateway failed to load");
      }

      const order = await createOrderFn({
        data: { amount: total, currency: "INR", receipt: `AN_${Date.now()}` },
      });

      if (!order?.orderId || !order?.keyId) {
        throw new Error("Invalid order response");
      }

      const form = formRef.current;
      const get = (name: string) =>
        (form?.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";

      savePendingOrder({ orderId: order.orderId, method: "razorpay", total, items });

      // Set timeout for payment
      const timeoutId = setTimeout(() => {
        setPaymentFailed(true);
        setProcessing(false);
        setShowManualUPI(true);
        toast.error("Payment is taking too long. Please try manual UPI or COD.");
      }, 45000);

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Ashok Naturals",
        description: "Pure Indian Spices & Natural Foods",
        prefill: {
          name: `${get("firstName")} ${get("lastName")}`.trim(),
          email: get("email"),
          contact: get("phone"),
        },
        notes: {
          address: `${get("address1")} ${get("address2") || ""} ${get("city")} ${get("state")} ${get("pincode")}`,
        },
        theme: { color: "#1f3d2b" },
        modal: {
          ondismiss: () => {
            clearTimeout(timeoutId);
            setPaymentFailed(true);
            setProcessing(false);
            setShowManualUPI(true);
            toast.info("Payment window closed. You can retry or use COD.");
          },
        },
      });

      rzp.on("payment.failed", (response: any) => {
        clearTimeout(timeoutId);
        console.error("Payment failed:", response);
        setPaymentFailed(true);
        setProcessing(false);
        setShowManualUPI(true);
        toast.error(`Payment failed: ${response.error?.description || "Please try again"}`);
      });

      rzp.open();
      
      // Poll for payment status
      const pollInterval = setInterval(() => {
        const stored = getStoredOrder(order.orderId);
        if (stored?.status === "paid") {
          clearInterval(pollInterval);
          clearTimeout(timeoutId);
          completeOrder({ orderId: order.orderId, paymentId: stored.paymentId, method: "razorpay" });
        }
      }, 3000);

      setTimeout(() => clearInterval(pollInterval), 120000);
      
    } catch (error) {
      console.error("Razorpay error:", error);
      setPaymentFailed(true);
      setProcessing(false);
      setShowManualUPI(true);
      toast.error(error instanceof Error ? error.message : "Payment failed. Please use COD or try again.");
    }
  };

  const retryPayment = () => {
    setRetryCount(prev => prev + 1);
    setPaymentFailed(false);
    setShowManualUPI(false);
    setProcessing(true);
    placeRazorpayOrder();
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
      placeCodOrder();
    } else {
      await placeRazorpayOrder();
    }
  };

  if (items.length === 0) {
    return (
      <section className="container-x py-24 text-center">
        <h1 className="font-display text-3xl text-primary mb-4">Your cart is empty</h1>
        <button 
          onClick={() => navigate({ to: "/shop" })} 
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
        >
          Continue Shopping
        </button>
      </section>
    );
  }

  return (
    <section className="container-x py-8 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl text-primary mb-8">Checkout</h1>

      <form ref={formRef} onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div>
              <input
                name="email"
                type="email"
                required
                placeholder="Email address"
                className={`w-full px-4 py-3 rounded-xl border ${formErrors.email ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>
            <div className="mt-3">
              <input
                name="phone"
                type="tel"
                required
                placeholder="Phone number (10 digits)"
                className={`w-full px-4 py-3 rounded-xl border ${formErrors.phone ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <input
                  name="firstName"
                  required
                  placeholder="First name"
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.firstName ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
              </div>
              <div>
                <input
                  name="lastName"
                  required
                  placeholder="Last name"
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.lastName ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
              </div>
            </div>
            <div className="mt-3">
              <input
                name="address1"
                required
                placeholder="Street address"
                className={`w-full px-4 py-3 rounded-xl border ${formErrors.address ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
            </div>
            <input
              name="address2"
              placeholder="Apartment, suite, etc. (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary mt-3"
            />
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <div>
                <input
                  name="city"
                  required
                  placeholder="City"
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.city ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
              </div>
              <div>
                <input
                  name="state"
                  required
                  placeholder="State"
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.state ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
              </div>
              <div>
                <input
                  name="pincode"
                  type="text"
                  required
                  placeholder="Pincode"
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.pincode ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Payment Method - FIXED VERSION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
            
            {/* UPI Options - Working */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMethod("razorpay")}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  method === "razorpay" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2">
                      📱 UPI - Google Pay / PhonePe / PayTM
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Pay instantly using any UPI app</div>
                  </div>
                  {method === "razorpay" && <div className="text-green-500 text-sm font-semibold">✓ Selected</div>}
                </div>
              </button>

              {/* COD Option - Backup */}
              <button
                type="button"
                onClick={() => setMethod("cod")}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  method === "cod" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">💰 Cash on Delivery</div>
                    <div className="text-sm text-gray-500 mt-1">Pay when you receive your order</div>
                  </div>
                  {method === "cod" && <div className="text-green-500 text-sm font-semibold">✓ Selected</div>}
                </div>
              </button>
            </div>

            {/* Payment Failed Recovery - Shows when UPI gets stuck */}
            {paymentFailed && method === "razorpay" && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-800 font-medium mb-2">⚠️ UPI Payment Issue</p>
                <p className="text-sm text-gray-600 mb-3">Don't worry! You can still complete your order:</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={retryPayment}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    🔄 Retry UPI Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("cod")}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                  >
                    💰 Switch to Cash on Delivery
                  </button>
                </div>
                
                {showManualUPI && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm font-medium text-gray-700">Manual UPI Payment:</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Send payment to: <span className="font-mono bg-white px-2 py-1 rounded">ashoknaturals@okhdfcbank</span>
                      <br />
                      Then call: <span className="font-semibold">+91 98765 43210</span> to confirm order
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Processing State */}
            {processing && method === "razorpay" && !paymentFailed && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                <p className="text-blue-800 font-medium">Opening UPI payment window...</p>
                <p className="text-sm text-gray-500 mt-1">Please complete payment in the popup</p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 text-sm text-green-800">
            <span className="text-xl">🔒</span>
            <span>100% Secure UPI Payments • No card details required</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span className="font-medium">{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'FREE' : inr(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (5%)</span>
                <span className="font-medium">{inr(gst)}</span>
              </div>
              
              {shipping === 0 && subtotal > 599 && (
                <div className="text-green-600 text-xs py-1">✨ Free shipping applied!</div>
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{inr(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing && method === "razorpay" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Opening UPI...
                </span>
              ) : processing && method === "cod" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Placing Order...
                </span>
              ) : (
                `Place Order • ${inr(total)}`
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              By placing your order, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </form>
    </section>
    );
}
  );
}
