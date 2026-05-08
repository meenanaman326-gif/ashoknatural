import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Ashok Naturals" }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container-x">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Legal</p>
          <h1 className="font-display text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-primary-foreground/80">Last updated: November 2025</p>
        </div>
      </section>
      <section className="container-x py-16 max-w-3xl mx-auto prose-content space-y-6 text-muted-foreground leading-relaxed">
        <Block t="1. Information we collect">We collect the information you provide when placing orders, creating an account, or contacting us — including name, email, phone, shipping address, and payment details (processed securely via Stripe; we never store card numbers).</Block>
        <Block t="2. How we use your data">To process orders, send shipping updates, respond to support requests, and (if you opt in) share recipes and offers. We never sell your data to third parties.</Block>
        <Block t="3. Cookies">We use essential cookies to keep your cart and session working, plus optional analytics cookies to improve the site. You can disable cookies in your browser settings.</Block>
        <Block t="4. Third parties">We share limited data with shipping partners (delivery), payment processors (Stripe, Razorpay), and email providers — only as required to fulfill your order.</Block>
        <Block t="5. Your rights">You can request to view, update, or delete your data at any time by emailing care@ashoknaturals.in. We respond within 7 business days.</Block>
        <Block t="6. Security">All data is encrypted in transit (TLS 1.3) and at rest. Payment is PCI-DSS compliant via Stripe.</Block>
        <Block t="7. Contact">Questions? Email us at care@ashoknaturals.in or call +91 98765 43210.</Block>
      </section>
    </>
  );
}

function Block({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-primary mb-2">{t}</h2>
      <p>{children}</p>
    </div>
  );
}
