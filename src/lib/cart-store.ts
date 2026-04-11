import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getInterpolatedPrice, isElite } from "./utils" // Убедись, что пути верные

interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string; // Отображаемая строка (напр. "6G")
  quantity: number; // Всегда будет 1, так как мы управляем весом
  image?: string;
  subcategory?: string;
  type?: string;
  prices?: any;
  category?: string;
}

interface CartStore {
  items: CartItem[];
  lang: 'en' | 'ru';
  setLang: (lang: 'en' | 'ru') => void;
  addItem: (newItem: any) => void;
  removeItem: (id: string, weight: string) => void;
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
        // 1. Ищем, есть ли уже этот товар (по ID)
        const existingIndex = state.items.findIndex((i) => i.id === newItem.id);
        
        // Извлекаем числовое значение веса из добавляемого товара (напр. "1G" -> 1)
        const addedWeightNum = parseFloat(newItem.weight);

        if (existingIndex > -1) {
          const existingItem = state.items[existingIndex];
          
          // 2. Считаем новый суммарный вес
          const currentWeightNum = parseFloat(existingItem.weight);
          const totalWeightNum = currentWeightNum + addedWeightNum;

          // 3. Пересчитываем цену за НОВЫЙ суммарный вес
          const isEliteProduct = isElite(existingItem) && existingItem.subcategory?.toLowerCase() !== 'import loose';
          const newTotalPrice = Math.round(
            getInterpolatedPrice(totalWeightNum, existingItem.prices, isEliteProduct)
          );

          // 4. Обновляем товар в корзине
          const updatedItems = [...state.items];
          updatedItems[existingIndex] = {
            ...existingItem,
            weight: `${totalWeightNum}G`,
            price: newTotalPrice,
            quantity: 1 // Оставляем 1, так как вес уже учитывает всё количество
          };

          return { items: updatedItems };
        }

        // Если товара нет, просто добавляем его (quantity всегда 1)
        return { items: [...state.items, { ...newItem, quantity: 1 }] };
      }),

      removeItem: (id, weight) => set((state) => ({
        items: state.items.filter((i) => !(i.id === id && i.weight === weight))
      })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((acc, item) => acc + item.price, 0);
      },
    }),
    { 
      name: "bnd-global-cart-v1" 
    }
  )
);
