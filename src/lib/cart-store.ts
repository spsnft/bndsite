import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getInterpolatedPrice, isElite } from "./utils"

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
        const existingIndex = state.items.findIndex((i) => i.id === newItem.id);
        
        // Извлекаем числовое значение (например, "3.5G" -> 3.5)
        const addedWeightNum = parseFloat(newItem.weight);

        if (existingIndex > -1) {
          const existingItem = state.items[existingIndex];
          const currentWeightNum = parseFloat(existingItem.weight);
          const totalWeightNum = currentWeightNum + addedWeightNum;

          // Определяем, является ли товар элитным/импортом
          const isEliteProduct = isElite(existingItem) && existingItem.subcategory?.toLowerCase() !== 'import loose';

          // ПРОВЕРКА: Если цены передаются в newItem, используем их, иначе берем из существующего
          const priceData = existingItem.prices || newItem.prices;

          // Пересчитываем цену. 
          // Если getInterpolatedPrice вернет 0 или undefined, ставим старую цену + цену нового (как фоллбек)
          let newTotalPrice = Math.round(
            getInterpolatedPrice(totalWeightNum, priceData, isEliteProduct)
          );

          // Если расчет не удался (вернул 0), просто плюсуем цены (защита от "цены 0")
          if (!newTotalPrice || newTotalPrice === 0) {
            newTotalPrice = existingItem.price + newItem.price;
          }

          const updatedItems = [...state.items];
          updatedItems[existingIndex] = {
            ...existingItem,
            weight: `${totalWeightNum}${existingItem.category === 'joints' ? 'PCS' : 'G'}`,
            price: newTotalPrice,
            quantity: 1
          };

          return { items: updatedItems };
        }

        return { items: [...state.items, { ...newItem, quantity: 1 }] };
      }),

      removeItem: (id, weight) => set((state) => ({
        items: state.items.filter((i) => !(i.id === id && i.weight === weight))
      })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const items = get().items;
        return items.reduce((acc, item) => acc + (item.price || 0), 0);
      },
    }),
    { 
      name: "bnd-global-cart-v1" 
    }
  )
);
