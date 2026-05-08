import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag, Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart, inr } from "@/lib/cart-store";

export function ProductCard({ product }: { product: Product }) {
  const { add, toggleWishlist, wishlist } = useCart();
  const w = product.weights[0];
  const off = Math.round(((w.mrp - w.price) / w.mrp) * 100);
  const wished = wishlist.includes(product.id);

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-1">
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={900}
            height={900}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {product.badges?.[0] && (
            <span className="absolute top-3 left-3 bg-gradient-gold text-gold-foreground text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-gold">
              {product.badges[0]}
            </span>
          )}
          {off > 0 && (
            <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
              {off}% OFF
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 mt-9 w-9 h-9 grid place-items-center rounded-full glass hover:bg-card transition-colors"
        aria-label="Wishlist"
      >
        <Heart className={`w-4 h-4 ${wished ? "fill-destructive text-destructive" : ""}`} />
      </button>

      <div className="p-5 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
        <Link to="/products/$slug" params={{ slug: product.slug }}>
          <h3 className="font-display text-lg leading-tight hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2">{product.shortDescription}</p>
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          <span className="font-medium">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="font-display text-xl text-primary">{inr(w.price)}</span>
            <span className="ml-2 text-xs text-muted-foreground line-through">{inr(w.mrp)}</span>
          </div>
          <button
            onClick={() => add(product, w.label)}
            className="w-10 h-10 grid place-items-center rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
