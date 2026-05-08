import { createFileRoute } from "@tanstack/react-router";
import { Truck, RotateCcw, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping & Returns — Ashok Naturals" }] }),
  component: Shipping,
});

function Shipping() {
  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container-x">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Policies</p>
          <h1 className="font-display text-5xl">Shipping & Returns</h1>
          <p className="mt-3 text-primary-foreground/80">Fast delivery, easy returns — across India.</p>
        </div>
      </section>

      <section className="container-x py-16 max-w-4xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: Truck, t: "Free shipping", d: "On all orders above ₹599 across India." },
            { icon: Clock, t: "Fast delivery", d: "Orders ship in 24h. Delivered in 3–5 business days." },
            { icon: MapPin, t: "Pan-India COD", d: "Cash on Delivery available everywhere up to ₹3,000." },
            { icon: RotateCcw, t: "7-day returns", d: "Not happy? Full refund or replacement, no questions." },
          ].map(c => (
            <div key={c.t} className="bg-card rounded-2xl p-5 shadow-card flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-gold grid place-items-center shrink-0"><c.icon className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-display text-lg text-primary">{c.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card space-y-5 text-muted-foreground leading-relaxed">
          <Block t="Shipping rates">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Orders above ₹599 — <b>FREE standard shipping</b></li>
              <li>Orders below ₹599 — flat ₹49 standard shipping</li>
              <li>Express delivery (1–2 days, metros only) — ₹99</li>
              <li>Cash on Delivery — additional ₹49 handling fee</li>
            </ul>
          </Block>
          <Block t="Delivery timelines">
            Metros (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata, Pune): 2–4 business days. Other locations: 3–7 business days. Remote areas may take up to 10 days.
          </Block>
          <Block t="Order tracking">
            You'll receive an email and SMS with your tracking link as soon as your order ships. Track anytime from your account dashboard.
          </Block>
          <Block t="Return policy">
            If you're not satisfied with your order, contact us within 7 days of delivery at care@ashoknaturals.in. We'll arrange a free pickup and issue a full refund or replacement.
          </Block>
          <Block t="Damaged in transit">
            Please photograph the damage and email us within 48 hours of delivery. We'll send a replacement immediately at no cost.
          </Block>
          <Block t="Refunds">
            Refunds are processed within 5–7 business days to the original payment method. COD refunds are issued via UPI or bank transfer.
          </Block>
        </div>
      </section>
    </>
  );
}

function Block({ t, children }: { t: string; children: React.ReactNode }) {
  return <div><h3 className="font-display text-xl text-primary mb-2">{t}</h3><div className="text-sm">{children}</div></div>;
}
