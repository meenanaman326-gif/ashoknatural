import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Wallet, Smartphone, Truck, Lock, CheckCircle2 } from "lucide-react";
import { useCart, findProduct, inr } from "@/lib/cart-store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ashok Naturals" }] }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"stripe" | "upi" | "cod">("stripe");
  const [processing, setProcessing] = useState(false);

  const shipping = subtotal > 599 ? 0 : 49;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + gst;

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      const orderId = "AN" + Math.floor(100000 + Math.random() * 900000);
      try {
        localStorage.setItem("an_last_order", JSON.stringify({ orderId, total, method, items }));
      } catch {}
      clear();
      toast.success("Order placed successfully!");
      navigate({ to: "/order-success", search: { id: orderId } as never });
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <section className="container-x py-24 text-center">
        <h1 className="font-display text-3xl text-primary">Your cart is empty</h1>
      </section>
    );
  }

  return (
    <section className="container-x py-12">
      <h1 className="font-display text-4xl md:text-5xl text-primary mb-8">Checkout</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-xl text-primary mb-4">Contact</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required type="email" placeholder="Email address" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <input required placeholder="Phone (+91)" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-xl text-primary mb-4">Shipping address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="First name" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <input required placeholder="Last name" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <input required placeholder="Address line 1" className="sm:col-span-2 px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <input placeholder="Apartment, suite (optional)" className="sm:col-span-2 px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <input required placeholder="City" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <input required placeholder="State" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <input required placeholder="Pincode" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <input value="India" disabled className="px-4 py-3 rounded-xl border border-border bg-muted outline-none" />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-xl text-primary mb-4">Payment method</h2>
            <div className="space-y-2">
              {[
                { id: "stripe", icon: CreditCard, t: "Credit / Debit Card", d: "Secure Stripe checkout · Visa, Mastercard, RuPay" },
                { id: "upi", icon: Smartphone, t: "UPI / Google Pay / PhonePe", d: "Pay instantly from any UPI app" },
                { id: "cod", icon: Truck, t: "Cash on Delivery", d: "Pay when your order arrives" },
              ].map(m => (
                <label key={m.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${method === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <input type="radio" name="pay" checked={method === m.id} onChange={() => setMethod(m.id as typeof method)} className="mt-1.5 accent-[var(--primary)]" />
                  <m.icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">{m.t}</p>
                    <p className="text-xs text-muted-foreground">{m.d}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
              <Lock className="w-3.5 h-3.5" /> SSL secured · Your data is encrypted end-to-end
            </p>
          </div>
        </div>

        <aside className="bg-card rounded-2xl p-6 shadow-card h-fit sticky top-24 space-y-4">
          <h2 className="font-display text-xl text-primary">Order summary</h2>
          <div className="space-y-3 max-h-64 overflow-auto">
            {items.map(it => {
              const p = findProduct(it.productId)!;
              return (
                <div key={it.productId + it.weightLabel} className="flex gap-3 text-sm">
                  <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{it.weightLabel} × {it.qty}</p>
                  </div>
                  <span className="font-semibold">{inr(it.price * it.qty)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : inr(shipping)}</span></div>
            <div className="flex justify-between"><span>GST (5%)</span><span>{inr(gst)}</span></div>
            <div className="flex justify-between font-display text-lg text-primary border-t pt-2 mt-2"><span>Total</span><span>{inr(total)}</span></div>
          </div>
          <button disabled={processing} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-60">
            {processing ? "Processing…" : <>Place Order · {inr(total)}<CheckCircle2 className="w-4 h-4" /></>}
          </button>
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1"><Wallet className="w-3 h-3" /> Stripe · UPI · COD all supported</p>
        </aside>
      </form>
    </section>
  );
}
