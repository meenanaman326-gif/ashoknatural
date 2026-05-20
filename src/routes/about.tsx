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
          "Pure farm-grown spices from Dholika, Rajasthan.",
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
            Since 2025 • Dholika, Rajasthan
          </p>

          <h1 className="font-display text-5xl md:text-7xl text-balance">
            Pure farm-grown spices from the heart of Rajasthan.
          </h1>

          <p className="mt-6 text-lg text-primary-foreground/85">
            Ashok Naturals began in Dholika, Rajasthan
            with one simple mission — grow what we
            sell, and sell what we grow. No middlemen,
            no artificial mixing, and no compromise on
            purity.
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
            Unlike most brands that source from
            multiple vendors, Ashok Naturals is built
            on a single, simple foundation — our own
            farm in Dholika, Rajasthan. Started in
            2025, our mission is clear: grow what we
            sell and deliver completely pure spices
            directly from our fields to your kitchen.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            We do not mix inferior grains,
            artificial colors, starch fillers, or
            synthetic aroma enhancers. Every product
            is harvested, processed, and packed with
            complete transparency using traditional
            methods and absolute attention to purity.
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
            Our Values
          </h2>
        </div>

        <div className="container-x grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Leaf,
              t: "100% Pure",
              d: "No fillers, no starch, no artificial mixing.",
            },

            {
              icon: Heart,
              t: "Farm Direct",
              d: "Every spice comes directly from our own farm in Dholika, Rajasthan.",
            },

            {
              icon: Sprout,
              t: "Traditional Methods",
              d: "Processed carefully using traditional farming and grinding practices.",
            },

            {
              icon: Globe,
              t: "Single Origin",
              d: "Complete traceability from our fields to your kitchen.",
            },

            {
              icon: Users,
              t: "Customer Trust",
              d: "Built on honesty, transparency, and long-term customer relationships.",
            },

            {
              icon: Award,
              t: "No Compromise",
              d: "Every batch is handled with strict quality and purity standards.",
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

      {/* STATS */}
      <section className="container-x py-20">
        <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-20 text-center shadow-elegant">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
            Our Commitment
          </p>

          <h2 className="font-display text-4xl mb-10">
            Pure spices. Honest farming. Real quality.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                n: "100%",
                l: "Pure Products",
              },

              {
                n: "Farm",
                l: "Direct Supply",
              },

              {
                n: "No",
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
