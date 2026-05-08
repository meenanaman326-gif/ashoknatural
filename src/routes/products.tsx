import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { products, categories } from "@/lib/products";
import { SlidersHorizontal } from "lucide-react";

type Search = { category?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Spices & Natural Foods — Ashok Naturals" },
      { name: "description", content: "Browse our full collection of stone-ground spices, whole spices, blends and natural foods." },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { category } = Route.useSearch();
  const [sort, setSort] = useState("featured");
  const [active, setActive] = useState<string | undefined>(category);

  const filtered = useMemo(() => {
    let list = active ? products.filter(p => p.category === active) : products;
    if (sort === "price-asc") list = [...list].sort((a, b) => a.weights[0].price - b.weights[0].price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.weights[0].price - a.weights[0].price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [active, sort]);

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container-x">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">The Collection</p>
          <h1 className="font-display text-4xl md:text-6xl">Shop all products</h1>
          <p className="mt-3 text-primary-foreground/80 max-w-xl">Stone-ground spices, raw forest honey and natural foods — all 100% pure and lab tested.</p>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActive(undefined)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${!active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
            >
              All ({products.length})
            </button>
            {categories.map(c => (
              <button
                key={c.name}
                onClick={() => setActive(c.name)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${active === c.name ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <select value={sort} onChange={e => setSort(e.target.value)} className="bg-card border border-border rounded-full px-4 py-2 text-sm outline-none">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products in this category yet.</p>
            <Link to="/products" className="text-primary underline mt-2 inline-block">View all</Link>
          </div>
        )}
      </section>
    </>
  );
}
