import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Leaf,
  Sprout,
  Heart,
  Users,
  Award,
  Globe,
} from "lucide-react";

import heroImg from "@/assets/hero-spices.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "Our Story — Ashok Naturals",
      },
      {
        name: "description",
        content:
          "Pure farm-grown spices from Dolika, Rajasthan.",
      },
    ],
  }),

  component: About,
});

function About() {
  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-hero text-primary-foreground py-24">
        <div className="container-x max-w-3xl">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
            Since 2025 | Dolika, Rajasthan
          </p>

          <h1 className="font-display text-5xl md:text-7xl text-balance">
            Pure farm-grown spices from Rajasthan.
          </h1>

          <p className="mt-6 text-lg text-primary-foreground/85">
            Unlike most brands that source from multiple vendors,
            Ashok Naturals is built on a single, simple foundation
            — our own farm.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="container-x py-20 grid lg:grid-cols-2 gap-12 items-center">
        <img
          src={heroImg}
          alt=""
          loading="lazy"
          className="rounded-3xl shadow-elegant aspect-[4/5] object-cover"
        />

        <div className="space-y-5">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold">
            Our Beginning
          </p>

          <h2 className="font-display text-4xl text-primary">
            Built on our own farm
          </h2>

          <p className="text-muted-foreground leading-relaxed">
            Located in Dolika, Rajasthan (303304), our journey
            started in 2025 with a clear mission: grow what we
            sell, and sell what we grow.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            No middlemen. No external procurement. No uncertainty
            about origin.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-gradient-cream py-20">
        <div className="container-x text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
            What Makes Us Different
          </p>

          <h2 className="font-display text-4xl md:text-5xl text-primary">
            Absolute Purity
          </h2>
        </div>

        <div className="container-x grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Leaf,
              t: "No Mixing",
              d: "No inferior grains or starch fillers.",
            },

            {
              icon: Heart,
              t: "No Artificial Colors",
              d: "No chemical color enhancers or synthetic aroma.",
            },

            {
              icon: Sprout,
              t: "Farm-Grown",
              d: "Every spice is grown on our own land in Dolika.",
            },

            {
              icon: Globe,
              t: "Traditional Methods",
              d: "Processed carefully using traditional methods.",
            },

            {
              icon: Users,
              t: "Single-Origin",
              d: "100% original product from seed to package.",
            },

            {
              icon: Award,
              t: "Complete Integrity",
              d: "No hidden compromise and no uncertainty of origin.",
            },
          ].map((v) => (
            <div
              key={v.t}
              className="bg-card rounded-2xl p-6 shadow-card"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-gold grid place-items-center mb-4">
                <v.icon className="w-5 h-5 text-primary" />
              </div>

              <h3 className="font-display text-xl text-primary mb-1">
                {v.t}
              </h3>

              <p className="text-sm text-muted-foreground">
                {v.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* INTEGRITY */}
      <section className="container-x py-20">
        <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-20 text-center shadow-elegant">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
            A Small Business With Complete Integrity
          </p>

          <h2 className="font-display text-4xl mb-10">
            Pure, original, unmixed spices.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                n: "100%",
                l: "Original Products",
              },

              {
                n: "Farm",
                l: "Direct Operation",
              },

              {
                n: "Zero",
                l: "Artificial Mixing",
              },

              {
                n: "Trusted",
                l: "By Families",
              },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-5xl md:text-6xl text-gold">
                  {s.n}
                </p>

                <p className="text-sm text-primary-foreground/70 mt-2 uppercase tracking-wider">
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
            We are not a large brand. We are a small,
            farm-direct operation. And that is precisely our
            strength. Being small allows us to control every
            step — from sowing to grinding to packing.
          </p>

          <p className="mt-5 text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
            There is no batch variation, no hidden compromise,
            and no loss of traceability. Our customer knows
            exactly where their spice comes from. Because it
            comes from our field.
          </p>

          <div className="mt-10">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              Our Commitment
            </p>

            <p className="text-lg text-primary-foreground/85 max-w-3xl mx-auto leading-relaxed">
              Ashok Naturals is not a story of decades. It is
              a story of honesty in a crowded market.
            </p>

            <p className="mt-5 text-lg text-primary-foreground/85 max-w-3xl mx-auto leading-relaxed">
              Started in 2025, based in Dolika, Rajasthan —
              we offer what most brands promise but rarely
              deliver:
            </p>

            <p className="mt-5 font-semibold text-gold text-xl">
              Pure, original, unmixed spices. Grown by us.
              Trusted by you.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-block mt-10 px-8 py-4 rounded-full bg-gradient-gold text-gold-foreground font-semibold shadow-gold hover:scale-105 transition-transform"
          >
            Shop the Collection
          </Link>
        </div>
      </section>
    </>
  );
}
