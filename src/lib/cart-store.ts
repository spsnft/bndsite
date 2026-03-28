import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useCart = create<any>()(persist((set, get) => ({
  items: [],
  addItem: (newItem: any) => set((state: any) => {
    const ex = state.items.findIndex((i: any) => i.id === newItem.id && i.weight === newItem.weight);
    if (ex > -1) {
      const newItems = [...state.items];
      newItems[ex].quantity += 1;
      return { items: newItems };
    }
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),
  removeItem: (id: string, weight: string) => set((state: any) => ({
    items: state.items.filter((i: any) => !(i.id === id && i.weight === weight))
  })),
  updateQuantity: (id: string, weight: string, delta: number) => set((state: any) => {
    const newItems = state.items.map((i: any) => {
      if (i.id === id && i.weight === weight) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    });
    return { items: newItems };
  }),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
}), { name: "bnd-global-cart-v1" })); // Имя v1, чтобы не конфликтовало со старым
