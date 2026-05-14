import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Wallet, Truck, Lock, CheckCircle2, Sparkles } from "lucide-react";
import { useCart, findProduct, inr } from "@/lib/cart-store";
import { toast } from "sonner";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/lib/razorpay.functions";
import {
  markStoredOrderFailed,
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    loadRazorpayScript();

    const params = new URLSearchParams(window.location.search);
    const rzpPaymentId = params.get("razorpay_payment_id");
    const rzpOrderId = params.get("razorpay_order_id");
    const rzpSignature = params.get("razorpay_signature");

    if (rzpPaymentId && rzpOrderId) {
      setProcessing(true);

      (async () => {
        try {
          if (rzpSignature) {
            await verifyFn({
              data: {
                orderId: rzpOrderId,
                paymentId: rzpPaymentId,
                signature: rzpSignature,
              },
            });
          }

          const paid = markStoredOrderPaid(rzpOrderId, rzpPaymentId);

          saveLastOrder({
            orderId: rzpOrderId,
            paymentId: rzpPaymentId,
            method: "razorpay",
            status: "paid",
            total: paid.total,
            items: paid.items,
          });

          clear();
          toast.success("Payment successful!");

          navigate({
            to: "/order-success",
            search: { id: rzpOrderId } as never,
          });
        } catch {
          toast.error("Payment verification failed.");
          setProcessing(false);
        }
      })();
    }
  }, []);

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
    status?: "paid" | "confirmed";
  }) => {
    saveLastOrder({
      ...paymentInfo,
      status:
        paymentInfo.status ??
        (paymentInfo.method === "cod" ? "confirmed" : "paid"),
      total,
      items,
    });

    clear();
    toast.success("Order placed successfully!");

    navigate({
      to: "/order-success",
      search: { id: paymentInfo.orderId } as never,
    });
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setProcessing(true);

    if (method === "cod") {
      const orderId = "AN" + Math.floor(100000 + Math.random() * 900000);
      setTimeout(() => {
        completeOrder({ orderId, method: "cod", status: "confirmed" });
      }, 500);
      return;
    }

    try {
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        throw new Error("Razorpay failed to load");
      }

      const order = await createOrderFn({
        data: {
          amount: total,
          currency: "INR",
          receipt: `AN_${Date.now()}`,
        },
      });

      if (!order?.orderId || !order?.keyId) {
        throw new Error("Invalid order response");
      }

      const form = formRef.current;
      const get = (name: string) =>
        (form?.elements.namedItem(name) as HTMLInputElement | null)?.value ??
        "";

      savePendingOrder({
        orderId: order.orderId,
        method: "razorpay",
        total,
        items,
      });

      let completed = false;

      const pollInterval = setInterval(() => {
        const stored = getStoredOrder(order.orderId);
        if (stored?.status === "paid" && !completed) {
          completed = true;
          clearInterval(pollInterval);

          completeOrder({
            orderId: order.orderId,
            paymentId: stored.paymentId,
            method: "razorpay",
          });
        }
      }, 3000);

      setTimeout(() => {
        if (!completed) clearInterval(pollInterval);
      }, 120000);

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
          address: `${get("address1")} ${get("address2")} ${get(
            "city"
          )} ${get("state")} ${get("pincode")}`,
        },

        theme: { color: "#1f3d2b" },

        retry: {
          enabled: true,
          max_count: 2,
        },

        handler: async (response) => {
          if (completed) return;
          completed = true;
          clearInterval(pollInterval);

          try {
            await verifyFn({
              data: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            });

            markStoredOrderPaid(
              response.razorpay_order_id,
              response.razorpay_payment_id
            );

            completeOrder({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              method: "razorpay",
            });
          } catch {
            toast.error("Payment verification failed");
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            if (!completed) {
              clearInterval(pollInterval);
              toast.info("Payment cancelled");
              setProcessing(false);
            }
          },
        },
      });

      rzp.on("payment.failed", (resp) => {
        if (!completed) {
          clearInterval(pollInterval);
          markStoredOrderFailed(order.orderId, "Payment failed");
          toast.error("Payment failed. Please try again.");
          setProcessing(false);
        }
      });

      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment error");
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="container-x py-24 text-center">
        <h1 className="font-display text-3xl text-primary">
          Your cart is empty
        </h1>
        <button
          onClick={() => navigate({ to: "/shop" })}
          className="btn mt-4"
        >
          Continue Shopping
        </button>
      </section>
    );
  }

  return (
    <section className="container-x py-12">
      <h1 className="font-display text-4xl text-primary mb-8">Checkout</h1>

      <form ref={formRef} onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="bg-card p-6 rounded-2xl border border-border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📞</span> Contact Information
            </h2>
            <div>
              <input 
                name="email" 
                type="email"
                required 
                placeholder="Email address" 
                className={`input w-full ${formErrors.email ? 'border-red-500' : ''}`}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>
            <div className="mt-3">
              <input 
                name="phone" 
                type="tel"
                required 
                placeholder="Phone number (10 digits)" 
                className={`input w-full ${formErrors.phone ? 'border-red-500' : ''}`}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-card p-6 rounded-2xl border border-border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🚚</span> Shipping Address
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <input 
                  name="firstName" 
                  required 
                  placeholder="First name" 
                  className={`input w-full ${formErrors.firstName ? 'border-red-500' : ''}`}
                />
                {formErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                )}
              </div>
              <div>
                <input 
                  name="lastName" 
                  required 
                  placeholder="Last name" 
                  className={`input w-full ${formErrors.lastName ? 'border-red-500' : ''}`}
                />
                {formErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                )}
              </div>
            </div>
            <div className="mt-3">
              <input 
                name="address1" 
                required 
                placeholder="Street address" 
                className={`input w-full ${formErrors.address ? 'border-red-500' : ''}`}
              />
              {formErrors.address && (
                <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
              )}
            </div>
            <input name="address2" placeholder="Apartment, suite, etc. (optional)" className="input w-full mt-3" />
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <div>
                <input 
                  name="city" 
                  required 
                  placeholder="City" 
                  className={`input w-full ${formErrors.city ? 'border-red-500' : ''}`}
                />
                {formErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                )}
              </div>
              <div>
                <input 
                  name="state" 
                  required 
                  placeholder="State" 
                  className={`input w-full ${formErrors.state ? 'border-red-500' : ''}`}
                />
                {formErrors.state && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                )}
              </div>
              <div>
                <input 
                  name="pincode" 
                  type="text"
                  required 
                  placeholder="Pincode" 
                  className={`input w-full ${formErrors.pincode ? 'border-red-500' : ''}`}
                />
                {formErrors.pincode && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-card p-6 rounded-2xl border border-border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>💳</span> Payment Method
            </h2>
            
            <div className="space-y-3">
              {/* Razorpay Option */}
              <label 
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  method === "razorpay" 
                    ? "border-green-500 bg-green-50" 
                    : "border-border hover:border-gray-300"
                }`}
                onClick={() => setMethod("razorpay")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={method === "razorpay"}
                    onChange={() => setMethod("razorpay")}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      Pay Online 
                      <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-sm text-gray-500">Credit/Debit Card • UPI • NetBanking • Wallet</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <img src="https://img.icons8.com/color/24/visa.png" alt="visa" className="w-6 h-6" />
                  <img src="https://img.icons8.com/color/24/mastercard.png" alt="mastercard" className="w-6 h-6" />
                  <span className="text-xs text-gray-400">+ More</span>
                </div>
              </label>

              {/* COD Option */}
              <label 
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  method === "cod" 
                    ? "border-green-500 bg-green-50" 
                    : "border-border hover:border-gray-300"
                }`}
                onClick={() => setMethod("cod")}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={method === "cod"}
                  onChange={() => setMethod("cod")}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-semibold">Cash on Delivery</div>
                  <div className="text-sm text-gray-500">Pay when you receive your order</div>
                </div>
              </label>

              {/* Recommended Badge for UPI Options */}
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <span className="text-sm font-semibold">⭐ Recommended</span>
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <span>📱 Google Pay</span>
                  <span>📱 PhonePe</span>
                  <span>📱 PayTM</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Quick & secure payments via UPI</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 text-sm text-green-800">
            <Lock className="w-5 h-5" />
            <span>Your payment information is processed securely. We do not store your card details.</span>
          </div>
        </div>

        {/* Summary */}
        <aside className="bg-card p-6 rounded-2xl border border-border h-fit sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({items.length} items)</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{shipping === 0 ? 'FREE' : inr(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST (5%)</span>
              <span>{inr(gst)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{inr(total)}</span>
              </div>
              {shipping === 0 && (
                <p className="text-green-600 text-xs mt-1">✨ Free shipping applied!</p>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={processing} 
            className="btn w-full mt-6 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : (
              `Place Order • ${inr(total)}`
            )}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            By placing your order, you agree to our Terms of Service and Privacy Policy
          </p>
        </aside>
      </form>
    </section>
  );
  }
