import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Truck, ShieldCheck, RotateCcw, Minus, Plus, Heart, ChevronRight, CheckCircle2 } from "lucide-react";
import { getProduct, related, type Product } from "@/lib/products";
import { useCart, inr } from "@/lib/cart-store";
import { ProductCard } from "@/components/site/ProductCard";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name} — Ashok Naturals` },
      { name: "description", content: loaderData?.product.shortDescription },
      { property: "og:title", content: loaderData?.product.name },
      { property: "og:image", content: loaderData?.product.image },
    ],
  }),
  notFoundComponent: () => (
    <div className="container-x py-32 text-center">
      <h1 className="font-display text-4xl text-primary">Product not found</h1>
      <Link to="/products" className="text-gold mt-4 inline-block">Back to shop</Link>
    </div>
  ),
  component: PDP,
});

function PDP() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [weight, setWeight] = useState(product.weights[0].label);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const w = product.weights.find(x => x.label === weight) ?? product.weights[0];

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) add(product, weight);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <>
      <div className="container-x py-4 text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-primary">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <section className="container-x grid lg:grid-cols-2 gap-12 py-8">
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden shadow-elegant bg-muted">
            <img src={product.image} alt={product.name} width={900} height={900} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-primary cursor-pointer">
                <img src={product.image} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold">{product.category}</p>
            <h1 className="font-display text-4xl md:text-5xl text-primary mt-1">{product.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-gold text-gold" : "text-border"}`} />)}</div>
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted-foreground">({product.reviews} reviews)</span>
            {product.inStock && <span className="ml-auto inline-flex items-center gap-1 text-xs text-primary"><CheckCircle2 className="w-3.5 h-3.5" /> In stock</span>}
          </div>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl text-primary">{inr(w.price)}</span>
            <span className="text-muted-foreground line-through">{inr(w.mrp)}</span>
            <span className="text-sm font-semibold text-gold">{Math.round(((w.mrp - w.price) / w.mrp) * 100)}% OFF</span>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Weight</p>
            <div className="flex gap-2">
              {product.weights.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setWeight(opt.label)}
                  className={`px-5 py-3 rounded-xl border text-sm font-medium transition-colors ${weight === opt.label ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
                >
                  {opt.label}
                  <span className="block text-xs opacity-70">{inr(opt.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 grid place-items-center"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 grid place-items-center"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAdd} className="flex-1 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-gold hover:text-gold-foreground transition-colors">
              Add to Cart · {inr(w.price * qty)}
            </button>
            <button className="w-12 h-12 grid place-items-center rounded-full border border-border hover:border-primary"><Heart className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { icon: Truck, t: "Free shipping ₹599+" },
              { icon: ShieldCheck, t: "Lab tested" },
              { icon: RotateCcw, t: "Easy returns" },
            ].map(({ icon: I, t }) => (
              <div key={t} className="flex items-center gap-2 text-xs bg-muted rounded-xl p-3">
                <I className="w-4 h-4 text-primary shrink-0" /> {t}
              </div>
            ))}
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-display text-lg text-primary mb-1">Ingredients</h3>
              <p className="text-sm text-muted-foreground">{product.ingredients}</p>
            </div>
            <div>
              <h3 className="font-display text-lg text-primary mb-1">How to use</h3>
              <p className="text-sm text-muted-foreground">{product.usage}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x py-12 border-t">
        <h2 className="font-display text-3xl text-primary mb-6">Customer Reviews</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { n: "Meera S.", r: 5, t: "Aroma is incredible. The jar lasted me 2 months and stayed fresh till the last spoon." },
            { n: "Vikram R.", r: 5, t: "Quality is genuinely premium. Worth every rupee compared to supermarket brands." },
            { n: "Anjali P.", r: 4, t: "Beautiful packaging, fast delivery. Will reorder for sure." },
          ].map(rv => (
            <div key={rv.n} className="bg-card rounded-2xl p-5 shadow-card">
              <div className="flex gap-0.5 mb-2">{Array.from({length:rv.r}).map((_,i)=><Star key={i} className="w-4 h-4 fill-gold text-gold" />)}</div>
              <p className="text-sm leading-relaxed">"{rv.t}"</p>
              <p className="text-xs text-muted-foreground mt-3 font-semibold">{rv.n}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-12">
        <h2 className="font-display text-3xl text-primary mb-6">You may also like</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {related(product.id, product.category).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </>
  );
}
