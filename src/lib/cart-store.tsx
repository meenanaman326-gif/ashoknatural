import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  qty: number;
  price: number;
  weightLabel: string;
};

type CartState = {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (productId: string, weightLabel: string) => void;
  updateQty: (productId: string, weightLabel: string, qty: number) => void;
  clear: () => void;

  subtotal: number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.weightLabel === item.weightLabel
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId &&
                i.weightLabel === item.weightLabel
                  ? { ...i, qty: i.qty + item.qty }
                  : i
              ),
            };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (productId, weightLabel) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.productId === productId && i.weightLabel === weightLabel)
          ),
        })),

      updateQty: (productId, weightLabel, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.weightLabel === weightLabel
              ? { ...i, qty }
              : i
          ),
        })),

      clear: () => set({ items: [] }),

      subtotal: 0,
    }),
    {
      name: "ashok-cart-storage", // 🔥 IMPORTANT
    }
  )
);
