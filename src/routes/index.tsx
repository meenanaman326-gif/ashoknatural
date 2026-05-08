import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, ShieldCheck, Truck, Award, Sprout, Star, CheckCircle2 } from "lucide-react";
import heroImg from "@/assets/hero-spices.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { bestsellers, categories } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ashok Naturals — Pure Indian Spices & Natural Foods" },
      { name: "description", content: "Stone-ground spices, raw forest honey & natural foods sourced directly from Indian farms. 100% pure, lab tested." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Leaf, title: "100% Pure", desc: "No fillers, colors or preservatives." },
  { icon: ShieldCheck, title: "Lab Tested", desc: "FSSAI certified & third-party verified." },
  { icon: Truck, title: "Free Shipping", desc: "On all orders above ₹599 across India." },
  { icon: Award, title: "Farm Direct", desc: "Sourced straight from small Indian farms." },
];

const testimonials = [
  { name: "Priya Menon", city: "Bengaluru", rating: 5, text: "The turmeric is unbelievably fragrant — you can smell it the moment you open the jar. Tastes like my grandmother's kitchen." },
  { name: "Rahul Sharma", city: "Mumbai", rating: 5, text: "Switched my entire spice rack to Ashok Naturals. The garam masala is on another level — never going back." },
  { name: "Aisha Khan", city: "Delhi", rating: 5, text: "Raw honey is genuinely raw. Crystallized naturally in winter just like real honey should. Beautiful packaging too." },
];

const certs = ["FSSAI", "ISO 22000", "USDA Organic*", "AGMARK", "GMP", "HACCP"];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-30">
          <img src={heroImg} alt="" className="w-full h-full object-cover" width={1600} height={1100} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
        </div>
        <div className="relative container-x py-24 lg:py-36 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-up">
            <p className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-gold">
              <Sprout className="w-4 h-4" /> Stone-ground · Farm direct
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance">
              The soul of <span className="italic text-gold">Indian</span> kitchens, in every jar.
            </h1>
            <p className="text-lg text-primary-foreground/85 max-w-xl">
              Hand-picked spices, raw forest honey and natural foods — sourced directly from small Indian farms and ground in small batches to preserve every drop of flavor.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/products" className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-gradient-gold text-gold-foreground font-semibold shadow-gold hover:scale-105 transition-transform">
                Shop the Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-primary-foreground/30 hover:bg-primary-foreground/10 transition-colors">
                Our Story
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-6 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 fill-gold text-gold" /> 4.8 / 5 · 12,400+ reviews</div>
              <div className="hidden sm:flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gold" /> FSSAI certified</div>
            </div>
          </div>
          <div className="hidden lg:block animate-float">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-elegant">
              <img src={heroImg} alt="Premium Indian spices" width={900} height={900} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-x py-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(f => (
          <div key={f.title} className="bg-card rounded-2xl p-6 shadow-card text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-gold mx-auto grid place-items-center mb-3"><f.icon className="w-5 h-5 text-primary" /></div>
            <h3 className="font-display text-base">{f.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Featured Categories</p>
            <h2 className="font-display text-4xl md:text-5xl text-primary">Shop by collection</h2>
          </div>
          <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:text-gold">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(c => (
            <Link
              key={c.name}
              to="/products"
              search={{ category: c.name } as never}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all"
            >
              <img src={c.image} alt={c.name} loading="lazy" width={900} height={900} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold">{c.count} products</p>
                <h3 className="font-display text-xl">{c.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="bg-gradient-cream py-20">
        <div className="container-x">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Loved by 50,000+ kitchens</p>
            <h2 className="font-display text-4xl md:text-5xl text-primary">Best Sellers</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {bestsellers().map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="container-x py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant">
          <img src={heroImg} alt="Spice farm" loading="lazy" width={900} height={1100} className="w-full h-full object-cover" />
          <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-5">
            <p className="font-display text-2xl text-primary">4 generations</p>
            <p className="text-sm text-muted-foreground">of spice craft, since 1947</p>
          </div>
        </div>
        <div className="space-y-5">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold">Our Story</p>
          <h2 className="font-display text-4xl md:text-5xl text-primary text-balance">From an Erode farm to your kitchen.</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ashok Naturals began as a single-acre turmeric farm in Erode, Tamil Nadu. Four generations later, we work directly with 200+ small farms across India — paying fair prices, refusing fillers, and stone-grinding everything in small batches the way our grandfathers taught us.
          </p>
          <ul className="space-y-2 text-sm">
            {["Direct trade with 200+ small farms", "Stone-ground in small 50kg batches", "Lab-tested for purity & potency", "Plastic-free packaging by 2026"].map(t => (
              <li key={t} className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-gold shrink-0" /> {t}</li>
            ))}
          </ul>
          <Link to="/about" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-gold">
            Read our story <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-x">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Kind Words</p>
            <h2 className="font-display text-4xl md:text-5xl">What our customers say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.name} className="glass-dark border border-primary-foreground/10 rounded-2xl p-6 space-y-4">
                <div className="flex gap-1">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}</div>
                <p className="text-primary-foreground/90 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-primary-foreground/60">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTS */}
      <section className="container-x py-16">
        <p className="text-center text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-6">Certified · Trusted · Verified</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {certs.map(c => (
            <span key={c} className="font-display text-xl md:text-2xl text-primary/40 hover:text-primary transition-colors">{c}</span>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-x pb-24">
        <div className="bg-gradient-hero text-primary-foreground rounded-3xl p-10 md:p-16 text-center shadow-elegant relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Stay in the kitchen</p>
            <h2 className="font-display text-3xl md:text-5xl mb-3">Recipes, harvest stories & 10% off your first order</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">Once-a-month notes from our farms. No spam, ever.</p>
            <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
              <input type="email" required placeholder="your@email.com" className="flex-1 px-5 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/60 outline-none focus:border-gold" />
              <button className="px-6 py-3 rounded-full bg-gradient-gold text-gold-foreground font-semibold hover:scale-105 transition-transform">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
