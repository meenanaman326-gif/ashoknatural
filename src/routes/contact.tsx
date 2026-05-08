import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Ashok Naturals" },
      { name: "description", content: "Get in touch with Ashok Naturals — we'd love to hear from you." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container-x">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Say hello</p>
          <h1 className="font-display text-5xl md:text-7xl">We'd love to hear from you</h1>
          <p className="mt-4 max-w-xl text-primary-foreground/80">Questions about an order, recipe ideas, or just want to chat about spices? Drop us a line.</p>
        </div>
      </section>

      <section className="container-x py-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-3xl p-8 shadow-card">
          <h2 className="font-display text-3xl text-primary mb-6">Send a message</h2>
          {sent ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-gold mx-auto grid place-items-center mb-4"><Send className="w-7 h-7 text-primary" /></div>
              <h3 className="font-display text-2xl text-primary">Message received</h3>
              <p className="text-muted-foreground mt-2">We'll reply within 24 hours.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); toast.success("Message sent!"); }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <input required placeholder="Your name" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
                <input required type="email" placeholder="Email address" className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              </div>
              <input placeholder="Subject" className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <textarea required rows={6} placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
              <button className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-gold hover:text-gold-foreground transition-colors inline-flex items-center gap-2">
                Send message <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          {[
            { icon: MapPin, t: "Visit us", d: "24, Spice Market Rd,\nErode, Tamil Nadu 638001" },
            { icon: Phone, t: "Call us", d: "+91 98765 43210\nMon–Sat, 9am–7pm IST" },
            { icon: Mail, t: "Email", d: "care@ashoknaturals.in\nReplies within 24 hours" },
            { icon: Clock, t: "Store hours", d: "Monday – Saturday\n9:00 AM – 7:00 PM IST" },
          ].map(c => (
            <div key={c.t} className="bg-card rounded-2xl p-5 shadow-card flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-gold grid place-items-center shrink-0"><c.icon className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold">{c.t}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
