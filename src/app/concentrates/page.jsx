"use client"
import * as React from "react"
import Link from "next/link"
import { 
  ArrowLeft, ShoppingBag, Send, Zap, Flame, X, TrendingDown, Sparkles, Percent, Crown, MessageCircle, Instagram, SendHorizontal
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getProducts } from "@/lib/product"

// --- СИНХРОННЫЙ СТОР (v12) ---
const useCart = create()(persist((set, get) => ({
  items: [],
  addItem: (newItem) => set((state) => {
    const ex = state.items.findIndex((i) => i.id === newItem.id && i.weight === newItem.weight);
    if (ex > -1) {
      const newItems = [...state.items];
      newItems[ex].quantity += 1;
      return { items: newItems };
    }
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),
  updateQuantity: (id, weight, delta) => set((state) => ({
    items: state.items.map(i => (i.id === id && i.weight === weight) ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
  })),
  removeItem: (id, weight) => set((state) => ({
    items: state.items.filter((i) => !(i.id === id && i.weight === weight))
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
}), { name: "bnd-cart-v12" }));

// [Вставь сюда ту же самую функцию CheckoutModal из кода выше]
// [Вставь сюда ту же самую константу CONTACT_METHODS]

export default function ConcentratesPage() {
  const [products, setProducts] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false); // НОВЫЙ СТЕЙТ
  const { items, getTotal } = useCart();

  React.useEffect(() => {
    getProducts().then(data => {
      const concs = data.filter(p => p.category?.toLowerCase() !== 'buds');
      setProducts(concs);
    });
  }, []);

  // ... (логика группировки как была) ...

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      {/* HEADER — как был */}

      {/* КАТЕГОРИИ КОНЦЕНТРАТОВ — как были */}

      {/* КОРЗИНА (Исправленная: теперь открывает модалку, а не главную) */}
      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E] active:scale-95 transition-all">
            <div className="flex items-center gap-4 text-left">
              <ShoppingBag size={20}/>
              <div><p className="text-[10px] font-black uppercase leading-none">Checkout</p><p className="text-[16px] font-black italic">{getTotal()}฿ Total</p></div>
            </div>
            <Send size={18}/>
          </button>
        </div>
      )}

      {selected && <ProductModal product={selected} style={getSubStyle(selected.subcategory)} onClose={() => setSelected(null)} />}
      
      {/* МОДАЛКА КОРЗИНЫ */}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
