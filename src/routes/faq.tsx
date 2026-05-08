import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Ashok Naturals" }] }),
  component: FAQ,
});

const faqs = [
  { q: "Are your spices really 100% pure?", a: "Yes. Every batch is third-party lab tested for purity, pesticide residue and microbial safety. We never add fillers, artificial colors or preservatives." },
  { q: "How are the spices ground?", a: "Stone-ground in small 50kg batches at low RPM to keep temperatures low and preserve the volatile aromatic oils that supermarket-style steel grinders destroy." },
  { q: "What is your shipping time?", a: "Orders ship within 24 hours. Delivery takes 3–5 business days across India. Express delivery (1–2 days) available in metros for ₹99." },
  { q: "Do you offer Cash on Delivery?", a: "Yes, COD is available across India for orders up to ₹3,000. A small ₹49 handling fee applies." },
  { q: "What is the shelf life?", a: "Whole spices: 18 months. Ground spices: 12 months. Honey: 24 months. All from the date of packing, when stored in a cool, dry place." },
  { q: "Can I return a product?", a: "If you're not satisfied, contact us within 7 days of delivery for a full refund or replacement — no questions asked." },
  { q: "Do you ship internationally?", a: "Currently we ship within India only. International shipping is coming in 2026." },
  { q: "Are your products organic certified?", a: "Many products are USDA Organic and India Organic certified. Look for the badge on each product page. All products, certified or not, are grown without synthetic pesticides." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container-x">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Help Center</p>
          <h1 className="font-display text-5xl md:text-6xl">Frequently asked</h1>
        </div>
      </section>
      <section className="container-x py-16 max-w-3xl mx-auto">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-card rounded-2xl shadow-card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-display text-lg text-primary">{f.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform shrink-0 ${open === i ? "rotate-180 text-gold" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
