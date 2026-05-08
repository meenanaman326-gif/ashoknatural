import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart, findProduct, inr } from "@/lib/cart-store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Ashok Naturals" }] }),
  component: Cart,
});

function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const apply = () => {
    if (coupon.toUpperCase() === "WELCOME10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success("Coupon applied — 10% off");
    } else {
      toast.error("Invalid coupon. Try WELCOME10");
    }
  };

  const shipping = subtotal > 599 ? 0 : 49;
  const gst = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + gst;

  if (items.length === 0) {
    return (
      <section className="container-x py-24 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-muted grid place-items-center mx-auto mb-6"><ShoppingBag className="w-9 h-9 text-muted-foreground" /></div>
        <h1 className="font-display text-4xl text-primary">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="inline-block mt-6 px-7 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Start shopping</Link>
      </section>
    );
  }

  return (
    <>
      <section className="container-x py-12">
        <h1 className="font-display text-4xl md:text-5xl text-primary mb-8">Your Cart ({items.length})</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map(it => {
              const p = findProduct(it.productId)!;
              return (
                <div key={it.productId + it.weightLabel} className="bg-card rounded-2xl p-4 shadow-card flex gap-4">
                  <img src={p.image} alt={p.name} className="w-24 h-24 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <Link to="/products/$slug" params={{ slug: p.slug }} className="font-display text-lg text-primary hover:text-gold">{p.name}</Link>
                    <p className="text-xs text-muted-foreground">Weight: {it.weightLabel}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-full">
                        <button onClick={() => setQty(it.productId, it.weightLabel, it.qty - 1)} className="w-8 h-8 grid place-items-center"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                        <button onClick={() => setQty(it.productId, it.weightLabel, it.qty + 1)} className="w-8 h-8 grid place-items-center"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-lg text-primary">{inr(it.price * it.qty)}</span>
                        <button onClick={() => remove(it.productId, it.weightLabel)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="bg-card rounded-2xl p-6 shadow-card h-fit sticky top-24 space-y-4">
            <h2 className="font-display text-2xl text-primary">Order summary</h2>
            <div className="flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon code" className="flex-1 px-4 py-2 rounded-full border border-border bg-background text-sm outline-none focus:border-primary" />
              <button onClick={apply} className="px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Apply</button>
            </div>
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-gold"><span>Discount</span><span>-{inr(discount)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : inr(shipping)}</span></div>
              <div className="flex justify-between"><span>GST (5%)</span><span>{inr(gst)}</span></div>
              <div className="flex justify-between font-display text-xl text-primary border-t pt-3 mt-3"><span>Total</span><span>{inr(total)}</span></div>
            </div>
            <Link to="/checkout" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-gold hover:text-gold-foreground transition-colors">
              Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/products" className="block text-center text-sm text-muted-foreground hover:text-primary">Continue shopping</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
