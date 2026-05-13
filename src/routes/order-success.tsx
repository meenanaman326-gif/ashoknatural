import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Home, Package, RefreshCw, Truck } from "lucide-react";
import { getRazorpayOrderStatus } from "@/lib/razorpay.functions";
import { getStoredOrder, markStoredOrderFailed, markStoredOrderPaid } from "@/lib/order-storage";
import { useCart } from "@/lib/cart-store";

type Search = { id?: string; payment?: "success" | "failed"; paymentId?: string; signature?: string; reason?: string };

export const Route = createFileRoute("/order-success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    id: typeof s.id === "string" ? s.id : undefined,
    payment: s.payment === "success" || s.payment === "failed" ? s.payment : undefined,
    paymentId: typeof s.paymentId === "string" ? s.paymentId : undefined,
    signature: typeof s.signature === "string" ? s.signature : undefined,
    reason: typeof s.reason === "string" ? s.reason : undefined,
  }),
  head: () => ({ meta: [{ title: "Order Confirmed — Ashok Naturals" }] }),
  component: Success,
});

function Success() {
  const { id, payment, paymentId, signature, reason } = Route.useSearch();
  const checkStatus = useServerFn(getRazorpayOrderStatus);
  const { clear } = useCart();
  const storedOrder = useMemo(() => getStoredOrder(id), [id]);
  const [paymentState, setPaymentState] = useState<"processing" | "paid" | "failed" | "confirmed">(
    payment === "failed" ? "failed" : storedOrder?.status === "paid" ? "paid" : storedOrder?.status === "confirmed" ? "confirmed" : payment === "success" ? "processing" : "confirmed",
  );

  useEffect(() => {
    if (!id || storedOrder?.method === "cod") return;
    if (payment === "failed") {
      markStoredOrderFailed(id, reason ?? "Payment failed");
      setPaymentState("failed");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      while (!cancelled && attempts < 10) {
        attempts += 1;
        try {
          const result = await checkStatus({ data: { orderId: id, paymentId, signature } });
          if (result.paid) {
            markStoredOrderPaid(id, result.paymentId ?? paymentId);
            clear();
            setPaymentState("paid");
            return;
          }
          if (result.status === "failed") {
            markStoredOrderFailed(id, "Payment failed");
            setPaymentState("failed");
            return;
          }
        } catch (error) {
          console.error("Payment status check failed:", error);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (!cancelled) setPaymentState("processing");
    };

    poll();
    return () => { cancelled = true; };
  }, [checkStatus, clear, id, payment, paymentId, reason, signature, storedOrder?.method]);

  const isFailed = paymentState === "failed";
  const isProcessing = paymentState === "processing";

  return (
    <section className="container-x py-20 max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-gold mx-auto grid place-items-center shadow-gold mb-6 animate-fade-up">
        {isFailed ? <AlertCircle className="w-10 h-10 text-primary" /> : isProcessing ? <RefreshCw className="w-10 h-10 text-primary animate-spin" /> : <CheckCircle2 className="w-10 h-10 text-primary" />}
      </div>
      <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">{isFailed ? "Payment failed" : isProcessing ? "Payment processing" : "Order confirmed"}</p>
      <h1 className="font-display text-4xl md:text-5xl text-primary">{isFailed ? "Please try payment again" : isProcessing ? "Confirming your payment" : "Thank you for your order!"}</h1>
      <p className="text-muted-foreground mt-3">{isFailed ? reason ?? "Your payment was not completed." : isProcessing ? "We're checking the final payment status. This usually takes a few seconds." : "We've sent a confirmation email with all the details."}</p>

      <div className="bg-card rounded-2xl p-6 shadow-card mt-8 text-left">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order number</p>
            <p className="font-display text-xl text-primary">#{id ?? "AN000000"}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-gold/20 text-primary text-xs font-semibold">{isFailed ? "Failed" : isProcessing ? "Processing" : "Confirmed"}</span>
        </div>
        <div className="space-y-3">
          {[
            { icon: CheckCircle2, t: isFailed ? "Payment retry needed" : "Order placed", d: isFailed ? "No amount was captured" : isProcessing ? "Awaiting payment confirmation" : "We've received your order", done: !isFailed && !isProcessing },
            { icon: Package, t: "Packing", d: "Within 24 hours", done: false },
            { icon: Truck, t: "Out for delivery", d: "3–5 business days", done: false },
            { icon: Home, t: "Delivered", d: "Right to your door", done: false },
          ].map(s => (
            <div key={s.t} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full grid place-items-center ${s.done ? "bg-gradient-gold text-primary" : "bg-muted text-muted-foreground"}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{s.t}</p>
                <p className="text-xs text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-center mt-8">
        {isFailed ? <Link to="/checkout" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Retry payment</Link> : <Link to="/products" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Continue shopping</Link>}
        <Link to="/auth" className="px-6 py-3 rounded-full border border-border font-semibold">Track order</Link>
      </div>
    </section>
  );
}
