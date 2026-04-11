import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
  image?: string;
  subcategory?: string;
  type?: string;
  prices?: any;
}

interface CartStore {
  items: CartItem[];
  lang: 'en' | 'ru';
  setLang: (lang: 'en' | 'ru') => void;
  addItem: (newItem: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, weight: string) => void;
  updateQuantity: (id: string, weight: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      lang: 'en',

      setLang: (lang) => set({ lang }),

      addItem: (newItem) => set((state) => {
        // Ищем индекс товара с таким же ID и таким же ВЕСОМ
        const existingIndex = state.items.findIndex(
          (i) => i.id === newItem.id && i.weight === newItem.weight
        );

        if (existingIndex > -1) {
          // Иммутабельно обновляем количество через map
          const updatedItems = state.items.map((item, index) => 
            index === existingIndex 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
          return { items: updatedItems };
        }

        // Если товара нет, добавляем новый с количеством 1
        return { items: [...state.items, { ...newItem, quantity: 1 }] };
      }),

      removeItem: (id, weight) => set((state) => ({
        items: state.items.filter((i) => !(i.id === id && i.weight === weight))
      })),

      updateQuantity: (id, weight, delta) => set((state) => {
        const newItems = state.items.map((i) => {
          if (i.id === id && i.weight === weight) {
            const newQty = Math.max(1, i.quantity + delta);
            return { ...i, quantity: newQty };
          }
          return i;
        });
        return { items: newItems };
      }),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (acc, item) => acc + (item.price * item.quantity), 
          0
        );
      },
    }),
    { 
      name: "bnd-global-cart-v1" 
    }
  )
);
