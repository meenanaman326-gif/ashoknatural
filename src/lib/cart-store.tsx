import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products, type Product } from "./products";

export type CartItem = {
  productId: string;
  weightLabel: string;
  price: number;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  add: (p: Product, weightLabel: string) => void;
  remove: (productId: string, weightLabel: string) => void;
  setQty: (productId: string, weightLabel: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const c = localStorage.getItem("an_cart");
      const w = localStorage.getItem("an_wish");
      if (c) setItems(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {}
  }, []);
  
  useEffect(() => { localStorage.setItem("an_cart", JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem("an_wish", JSON.stringify(wishlist)); }, [wishlist]);

  const add = (p: Product, weightLabel: string) => {
    const w = p.weights.find(x => x.label === weightLabel) ?? p.weights[0];
    setItems(prev => {
      const i = prev.findIndex(x => x.productId === p.id && x.weightLabel === w.label);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { productId: p.id, weightLabel: w.label, price: w.price, qty: 1 }];
    });
  };
  
  const remove = (id: string, w: string) =>
    setItems(prev => prev.filter(x => !(x.productId === id && x.weightLabel === w)));
    
  const setQty = (id: string, w: string, qty: number) =>
    setItems(prev =>
      prev.map(x => (x.productId === id && x.weightLabel === w ? { ...x, qty: Math.max(1, qty) } : x))
    );
    
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  
  const toggleWishlist = (id: string) =>
    setWishlist(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, subtotal, wishlist, toggleWishlist }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("CartProvider missing");
  return c;
};

export const findProduct = (id: string) => products.find(p => p.id === id);
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
