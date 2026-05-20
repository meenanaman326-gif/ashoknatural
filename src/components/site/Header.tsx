import { Link } from "@tanstack/react-router";
import { ShoppingBag, Heart, User, Menu, X, Leaf } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="bg-primary text-primary-foreground text-xs py-2 text-center container-x">
        Free shipping on orders above ₹599 · 100% Pure · Lab Tested
      </div>
      <div className="container-x flex items-center justify-between h-18 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-10 h-10 rounded-full bg-gradient-gold grid place-items-center shadow-gold">
            <Leaf className="w-5 h-5 text-primary" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl text-primary">Ashok Naturals</span>
            <span className="block text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Pure · Natural · Premium</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map(n => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative"
              activeProps={{ className: "text-primary after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-gold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/auth" className="hidden sm:grid w-10 h-10 place-items-center rounded-full hover:bg-secondary transition-colors" aria-label="Account">
            <User className="w-5 h-5" />
          </Link>
          <Link to="/auth" className="hidden sm:grid w-10 h-10 place-items-center rounded-full hover:bg-secondary transition-colors" aria-label="Wishlist">
            <Heart className="w-5 h-5" />
          </Link>
          <Link to="/cart" className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-secondary transition-colors" aria-label="Cart">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-gold-foreground text-[10px] font-bold rounded-full w-5 h-5 grid place-items-center">
                {count}
              </span>
            )}
          </Link>
          <button className="lg:hidden w-10 h-10 grid place-items-center" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container-x py-4 flex flex-col gap-1">
            {nav.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 text-base font-medium border-b border-border/50 last:border-0">
                {n.label}
              </Link>
            ))}
            <Link to="/auth" onClick={() => setOpen(false)} className="py-3 text-base font-medium">Account</Link>
            
          </nav>
        </div>
      )}
    </header>
  );
}
