import { Model_Product } from "@/generated/models";
import { create } from "zustand";

export type CartStoreState = {
  products: Model_Product[];
  appendProduct: (product: Model_Product) => void;
  removeProduct: (id: string) => void;
  reset: () => void;
};

export const useCartStore = create<CartStoreState>((set) => ({
  products: [],
  appendProduct: (product: Model_Product) => {
    return set((state) => {
      const exist = state.products.some((p) => p.id === product.id);
      if (exist) {
        return state;
      }
      return { products: [...state.products, product] };
    });
  },
  removeProduct: (id: string) => {
    return set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    }));
  },
  reset: () => {
    return set({ products: [] });
  },
}));
