import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  lang: 'en' | 'ru'; // Добавили состояние языка
  setLang: (lang: 'en' | 'ru') => void; // Метод переключения
  addItem: (newItem: any) => void;
  removeItem: (id: string, weight: string) => void;
  updateQuantity: (id: string, weight: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      lang: 'en', // Язык по умолчанию

      // Метод для смены языка
      setLang: (lang) => set({ lang }),

      addItem: (newItem: any) => set((state) => {
        const ex = state.items.findIndex(
          (i) => i.id === newItem.id && i.weight === newItem.weight
        );
        if (ex > -1) {
          const newItems = [...state.items];
          newItems[ex].quantity += 1;
          return { items: newItems };
        }
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
