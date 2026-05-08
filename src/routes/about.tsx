import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Sprout, Heart, Users, Award, Globe } from "lucide-react";
import heroImg from "@/assets/hero-spices.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Ashok Naturals" },
      { name: "description", content: "Four generations of spice craft, from a single Erode farm to 200+ partner farms across India." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-24">
        <div className="container-x max-w-3xl">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Since 1947</p>
          <h1 className="font-display text-5xl md:text-7xl text-balance">A family of spice farmers, growing wholeheartedly.</h1>
          <p className="mt-6 text-lg text-primary-foreground/85">
            What started as a single acre of turmeric in Erode is today a network of 200+ small Indian farms, all united by one promise — never compromise on purity.
          </p>
        </div>
      </section>

      <section className="container-x py-20 grid lg:grid-cols-2 gap-12 items-center">
        <img src={heroImg} alt="" loading="lazy" className="rounded-3xl shadow-elegant aspect-[4/5] object-cover" />
        <div className="space-y-5">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold">The beginning</p>
          <h2 className="font-display text-4xl text-primary">Where it all started</h2>
          <p className="text-muted-foreground leading-relaxed">
            In 1947, our great-grandfather Ashok began grinding turmeric on a single granite stone in his backyard. He sold it in newspaper-wrapped parcels to his neighbors. Word spread fast — his turmeric was so pure, so potent, that families came from neighboring villages just to buy a few grams.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Four generations later, we still grind on stone. We still refuse to add fillers. And we still believe that the purest spice is the one you'd happily feed your own family.
          </p>
        </div>
      </section>

      <section className="bg-gradient-cream py-20">
        <div className="container-x text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">What we stand for</p>
          <h2 className="font-display text-4xl md:text-5xl text-primary">Our values</h2>
        </div>
        <div className="container-x grid md:grid-cols-3 gap-5">
          {[
            { icon: Leaf, t: "Pure, always", d: "No fillers, no colors, no shortcuts. Period." },
            { icon: Heart, t: "Fair to farmers", d: "We pay 30-40% above market rates to our 200+ partner farms." },
            { icon: Sprout, t: "Slow & traditional", d: "Stone-ground in 50kg batches the way our grandfathers did." },
            { icon: Globe, t: "Earth conscious", d: "Plastic-free packaging by 2026. Carbon-neutral shipping today." },
            { icon: Users, t: "Community first", d: "5% of profits fund education for farming families." },
            { icon: Award, t: "Quality obsessed", d: "Every batch lab-tested for purity, potency and safety." },
          ].map(v => (
            <div key={v.t} className="bg-card rounded-2xl p-6 shadow-card">
              <div className="w-12 h-12 rounded-xl bg-gradient-gold grid place-items-center mb-4"><v.icon className="w-5 h-5 text-primary" /></div>
              <h3 className="font-display text-xl text-primary mb-1">{v.t}</h3>
              <p className="text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-20">
        <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-20 text-center shadow-elegant">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">By the numbers</p>
          <h2 className="font-display text-4xl mb-10">A small brand with a big heart</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { n: "78", l: "Years of craft" },
              { n: "200+", l: "Partner farms" },
              { n: "50K+", l: "Happy kitchens" },
              { n: "4.8★", l: "Average rating" },
            ].map(s => (
              <div key={s.l}>
                <p className="font-display text-5xl md:text-6xl text-gold">{s.n}</p>
                <p className="text-sm text-primary-foreground/70 mt-2 uppercase tracking-wider">{s.l}</p>
              </div>
            ))}
          </div>
          <Link to="/products" className="inline-block mt-10 px-8 py-4 rounded-full bg-gradient-gold text-gold-foreground font-semibold shadow-gold hover:scale-105 transition-transform">
            Shop the Collection
          </Link>
        </div>
      </section>
    </>
  );
}
