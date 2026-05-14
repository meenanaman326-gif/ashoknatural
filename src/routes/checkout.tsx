import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Wallet, Truck, Lock, CheckCircle2 } from "lucide-react";
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
    setProcessing(true);

    if (method === "cod") {
      const orderId = "AN" + Math.floor(100000 + Math.random() * 900000);
      completeOrder({ orderId, method: "cod", status: "confirmed" });
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

      const pollInterval = setInterval(() => {
        const stored = getStoredOrder(order.orderId);
        if (stored?.status === "paid") {
          clearInterval(pollInterval);

          completeOrder({
            orderId: order.orderId,
            paymentId: stored.paymentId,
            method: "razorpay",
          });
        }
      }, 3000);

      setTimeout(() => clearInterval(pollInterval), 120000);

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
            clearInterval(pollInterval);
            toast.info("Payment cancelled");
            setProcessing(false);
          },
        },
      });

      rzp.on("payment.failed", (resp) => {
        clearInterval(pollInterval);
        markStoredOrderFailed(order.orderId, "Payment failed");
        toast.error("Payment failed");
        setProcessing(false);
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
      </section>
    );
  }

  return (
    <section className="container-x py-12">
      <h1 className="font-display text-4xl text-primary mb-8">Checkout</h1>

      <form ref={formRef} onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Contact */}
          <div className="bg-card p-6 rounded-2xl">
            <h2 className="text-xl mb-4">Contact</h2>
            <input name="email" required placeholder="Email" className="input" />
            <input name="phone" required placeholder="Phone" className="input mt-2" />
          </div>

          {/* Shipping */}
          <div className="bg-card p-6 rounded-2xl">
            <h2 className="text-xl mb-4">Shipping</h2>

            <input name="firstName" required placeholder="First name" className="input" />
            <input name="lastName" required placeholder="Last name" className="input mt-2" />
            <input name="address1" required placeholder="Address" className="input mt-2" />
            <input name="city" required placeholder="City" className="input mt-2" />
            <input name="state" required placeholder="State" className="input mt-2" />
            <input name="pincode" required placeholder="Pincode" className="input mt-2" />
          </div>

          {/* Payment */}
          <div className="bg-card p-6 rounded-2xl">
            <h2 className="text-xl mb-4">Payment</h2>

            <label>
              <input
                type="radio"
                checked={method === "razorpay"}
                onChange={() => setMethod("razorpay")}
              />
              Pay Online
            </label>

            <label>
              <input
                type="radio"
                checked={method === "cod"}
                onChange={() => setMethod("cod")}
              />
              Cash on Delivery
            </label>
          </div>
        </div>

        {/* Summary */}
        <aside className="bg-card p-6 rounded-2xl">
          <h2 className="text-xl">Order Summary</h2>

          <p>Subtotal: {inr(subtotal)}</p>
          <p>Shipping: {shipping}</p>
          <p>GST: {inr(gst)}</p>
          <p className="font-bold">Total: {inr(total)}</p>

          <button type="submit" disabled={processing} className="btn w-full mt-4">
            {processing ? "Processing..." : "Place Order"}
          </button>
        </aside>
      </form>
    </section>
    );
}
  );
}
