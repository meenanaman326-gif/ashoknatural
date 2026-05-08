import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Ashok Naturals" }] }),
  component: Terms,
});

function Terms() {
  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container-x">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Legal</p>
          <h1 className="font-display text-5xl">Terms & Conditions</h1>
          <p className="mt-3 text-primary-foreground/80">Last updated: November 2025</p>
        </div>
      </section>
      <section className="container-x py-16 max-w-3xl mx-auto space-y-6 text-muted-foreground leading-relaxed">
        <Block t="1. Acceptance">By using ashoknaturals.in, you agree to these terms. If you don't agree, please don't use the site.</Block>
        <Block t="2. Products & pricing">Prices are in INR and include applicable GST unless stated. We reserve the right to correct pricing errors and adjust availability without notice.</Block>
        <Block t="3. Orders">An order is confirmed only after payment is successful (or COD is verified). We may cancel orders that violate these terms or appear fraudulent.</Block>
        <Block t="4. Payments">We accept Stripe (cards, UPI, wallets) and Cash on Delivery. All transactions are encrypted and PCI-DSS compliant.</Block>
        <Block t="5. Shipping">See our Shipping & Return Policy for delivery timelines and charges.</Block>
        <Block t="6. Intellectual property">All content, images, logos and copy on this site are the property of Ashok Naturals and may not be used without written permission.</Block>
        <Block t="7. Liability">Our products are food items — please check ingredients and consult a doctor if you have allergies. We are not liable for misuse or allergic reactions.</Block>
        <Block t="8. Governing law">These terms are governed by the laws of India. Disputes are subject to the jurisdiction of courts in Erode, Tamil Nadu.</Block>
      </section>
    </>
  );
}

function Block({ t, children }: { t: string; children: React.ReactNode }) {
  return <div><h2 className="font-display text-2xl text-primary mb-2">{t}</h2><p>{children}</p></div>;
}
