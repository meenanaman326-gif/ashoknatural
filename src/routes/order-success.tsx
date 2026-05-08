import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, Truck, Home } from "lucide-react";

type Search = { id?: string };

export const Route = createFileRoute("/order-success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  head: () => ({ meta: [{ title: "Order Confirmed — Ashok Naturals" }] }),
  component: Success,
});

function Success() {
  const { id } = Route.useSearch();
  return (
    <section className="container-x py-20 max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-gold mx-auto grid place-items-center shadow-gold mb-6 animate-fade-up">
        <CheckCircle2 className="w-10 h-10 text-primary" />
      </div>
      <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Order confirmed</p>
      <h1 className="font-display text-4xl md:text-5xl text-primary">Thank you for your order!</h1>
      <p className="text-muted-foreground mt-3">We've sent a confirmation email with all the details.</p>

      <div className="bg-card rounded-2xl p-6 shadow-card mt-8 text-left">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order number</p>
            <p className="font-display text-xl text-primary">#{id ?? "AN000000"}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-gold/20 text-primary text-xs font-semibold">Confirmed</span>
        </div>
        <div className="space-y-3">
          {[
            { icon: CheckCircle2, t: "Order placed", d: "We've received your order", done: true },
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
        <Link to="/products" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Continue shopping</Link>
        <Link to="/auth" className="px-6 py-3 rounded-full border border-border font-semibold">Track order</Link>
      </div>
    </section>
  );
}
