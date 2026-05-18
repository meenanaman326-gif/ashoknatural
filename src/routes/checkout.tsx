/* eslint-disable */
// @ts-nocheck

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
  markStoredOrderFailed,
  markStoredOrderPaid,
  saveLastOrder,
  savePendingOrder,
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
  head: () => ({
    meta: [{ title: "Checkout — Ashok Naturals" }],
  }),
  component: Checkout,
});

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

const generateOrderId = () => {
  return "AN" + Date.now();
};

function Checkout() {
  const { items, subtotal, clear } = useCart();

  const navigate = useNavigate();

  const createOrderFn = useServerFn(createRazorpayOrder);

  const verifyFn = useServerFn(verifyRazorpayPayment);

  const [processing, setProcessing] = useState(false);

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
    method: "razorpay" | "cod";
    status?: "paid" | "confirmed";
  }) => {
    saveLastOrder({
      ...paymentInfo,
      status:
        paymentInfo.status ??
        (paymentInfo.method === "cod"
          ? "confirmed"
          : "paid"),
      total,
      items,
    });

    clear();

    toast.success("Order placed successfully!");

    navigate({
      to: "/order-success",
      search: {
        id: paymentInfo.orderId,
      } as never,
    });
  };

  const placeOrder = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setProcessing(true);

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
        throw new Error("Invalid payment order");
      }

      const form = formRef.current;

      const get = (name: string) =>
        (
          form?.elements.namedItem(
            name
          ) as HTMLInputElement | null
        )?.value ?? "";

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

        prefill: {
          name: `${get("firstName")} ${get(
            "lastName"
          )}`.trim(),

          email: get("email"),

          contact: get("phone"),
        },

        notes: {
          address: `${get(
            "address1"
          )} ${get("city")} ${get(
            "state"
          )} ${get("pincode")}`,
        },

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
        className="grid lg:grid-cols-2 gap-8"
      >
        <div className="space-y-4">
          <input
            name="firstName"
            placeholder="First Name"
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            name="lastName"
            placeholder="Last Name"
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            name="address1"
            placeholder="Address"
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            name="city"
            placeholder="City"
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            name="state"
            placeholder="State"
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            name="pincode"
            placeholder="Pincode"
            className="w-full border p-3 rounded-xl"
            required
          />
        </div>

        <div className="border rounded-2xl p-6 h-fit">
          <h2 className="text-2xl font-bold mb-4">
            Order Summary
          </h2>

          <div className="space-y-2">
            <p>
              Subtotal: {inr(subtotal)}
            </p>

            <p>
              Shipping: {inr(shipping)}
            </p>

            <p>
              GST: {inr(gst)}
            </p>

            <p className="font-bold text-xl pt-3">
              Total: {inr(total)}
            </p>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full mt-6 bg-black text-white py-3 rounded-xl"
          >
            {processing
              ? "Processing..."
              : `Pay ${inr(total)}`}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Checkout;
