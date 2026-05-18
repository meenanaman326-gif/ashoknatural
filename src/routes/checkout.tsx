/* eslint-disable */
// @ts-nocheck

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CreditCard,
  Wallet,
  Truck,
  Lock,
  CheckCircle2,
  QrCode,
} from "lucide-react";

import { useCart } from "../lib/cart-store";

import { toast } from "sonner";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../lib/razorpay.functions";

import {
  markStoredOrderFailed,
  markStoredOrderPaid,
  saveLastOrder,
  savePendingOrder,
} from "../lib/order-storage";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => {
      open: () => void;
      on: (e: string, cb: (r: unknown) => void) => void;
    };
  }
}

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — Ashok Naturals" }],
  }),
  component: Checkout,
});

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);

    if (window.Razorpay) {
      return resolve(true);
    }

    const s = document.createElement("script");

    s.src = "https://checkout.razorpay.com/v1/checkout.js";

    s.onload = () => resolve(true);

    s.onerror = () => resolve(false);

    document.body.appendChild(s);
  });
}

const generateOrderId = () => "AN" + Date.now();

function Checkout() {
  const { cart, clearCart } = useCart();

  const items = cart;

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const clear = clearCart;

  const inr = (amount: number) => `₹${amount.toFixed(2)}`;

  const navigate = useNavigate();

  const createOrderFn = useServerFn(createRazorpayOrder);

  const verifyFn = useServerFn(verifyRazorpayPayment);

  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");

  const [processing, setProcessing] = useState(false);

  const [showQRPayment, setShowQRPayment] = useState(false);

  const [copied, setCopied] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const shipping = subtotal > 599 ? 0 : 49;

  const gst = Math.round(subtotal * 0.05);

  const total = subtotal + shipping + gst;

  const completeOrder = (paymentInfo: {
    orderId: string;
    paymentId?: string;
    method: "razorpay" | "cod" | "upi_manual";
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

  const handleUPIPayment = () => {
    setShowQRPayment(true);
  };

  const confirmUPIPayment = () => {
    const txnId = prompt("Enter UPI Transaction ID");

    if (!txnId || txnId.trim().length < 8) {
      toast.error("Please enter valid transaction ID");
      return;
    }

    const orderId = generateOrderId();

    setShowQRPayment(false);

    const orders = JSON.parse(
      localStorage.getItem("orders") || "[]"
    );

    orders.push({
      id: orderId,
      txnId: txnId.trim(),
      date: new Date().toISOString(),
      total,
      items,
      status: "payment_pending",
      method: "upi_manual",
    });

    localStorage.setItem(
      "orders",
      JSON.stringify(orders)
    );

    clear();

    toast.success("Payment submitted");

    navigate({
      to: "/order-success",
      search: { id: orderId } as never,
    });
  };

  const copyUPIID = () => {
    navigator.clipboard.writeText(
      "ashoknaturals@okhdfcbank"
    );

    setCopied(true);

    toast.success("UPI ID copied");

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const placeOrder = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setProcessing(true);

    if (method === "cod") {
      const orderId = generateOrderId();

      completeOrder({
        orderId,
        method: "cod",
        status: "confirmed",
      });

      setProcessing(false);

      return;
    }

    try {
      const ok = await loadRazorpayScript();

      if (!ok || !window.Razorpay) {
        throw new Error("Razorpay failed to load");
      }

      const order = await createOrderFn({
        data: {
          items,
          receipt: `AN_${Date.now()}`,
        },
      });

      if (!order?.orderId || !order?.keyId) {
        throw new Error("Invalid order response");
      }

      savePendingOrder({
        orderId: order.orderId,
        method: "razorpay",
        total,
        items,
      });

      const rzp = new window.Razorpay({
        key: order.keyId,

        amount: order.amount,

        currency: order.currency,

        order_id: order.orderId,

        name: "Ashok Naturals",

        description:
          "Pure Indian Spices & Natural Foods",

        handler: async (response: any) => {
          try {
            const verified = await verifyFn({
              data: {
                orderId:
                  response.razorpay_order_id,

                paymentId:
                  response.razorpay_payment_id,

                signature:
                  response.razorpay_signature,
              },
            });

            if (!verified?.valid) {
              throw new Error(
                "Payment verification failed"
              );
            }

            markStoredOrderPaid(
              response.razorpay_order_id,
              response.razorpay_payment_id
            );

            completeOrder({
              orderId:
                response.razorpay_order_id,

              paymentId:
                response.razorpay_payment_id,

              method: "razorpay",

              status: "paid",
            });
          } catch (err) {
            console.error(err);

            toast.error(
              "Payment verification failed"
            );

            setProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");

            setProcessing(false);
          },
        },

        theme: {
          color: "#1f3d2b",
        },
      });

      rzp.on("payment.failed", () => {
        markStoredOrderFailed(
          order.orderId,
          "Payment failed"
        );

        toast.error("Payment failed");

        setProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Payment error"
      );

      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="container-x py-24 text-center">
        <h1 className="text-3xl font-bold">
          Your cart is empty
        </h1>
      </section>
    );
  }

  return (
    <section className="container-x py-12">
      <h1 className="text-4xl font-bold mb-8">
        Checkout
      </h1>

      <form
        ref={formRef}
        onSubmit={placeOrder}
        className="space-y-6"
      >
        <button
          type="submit"
          disabled={processing}
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          {processing
            ? "Processing..."
            : `Pay ${inr(total)}`}
        </button>
      </form>

      {showQRPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-green-600 px-6 py-5 text-white text-center">
              <h3 className="text-2xl font-bold">
                Pay with UPI
              </h3>
            </div>

            <div className="p-6 text-center">
              <img
                src="/images/payment-qr.png"
                className="w-full max-w-xs mx-auto"
              />

              <p className="mt-3 font-bold">
                Amount: {inr(total)}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={copyUPIID}
                  className="flex-1 bg-green-600 text-white py-2 rounded"
                >
                  {copied
                    ? "Copied"
                    : "Copy UPI"}
                </button>

                <button
                  type="button"
                  onClick={confirmUPIPayment}
                  className="flex-1 bg-gray-800 text-white py-2 rounded"
                >
                  I've Paid
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowQRPayment(false)
                }
                className="mt-3 text-sm text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Checkout;
