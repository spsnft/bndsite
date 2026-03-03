"use client"
import * as React from "react"
import { 
  ShoppingCart, X, Trash2, Info, CheckCircle2, ArrowRight, Leaf, Zap, Phone
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- STORE ---
interface CartStore {
  items: any[];
  addItem: (item: any) => void;
  removeItem: (id: string, weight: any) => void;
  clearCart: () => void;
}

const useCart = create<CartStore>()(persist((set) => ({
  items: [],
  addItem: (newItem) => set((state) => {
    const ex = state.items.find(i => i.id === newItem.id && i.weight === newItem.weight);
    if (ex) return { items: state.items.map(i => i === ex ? { ...i, quantity: i.quantity + 1 } : i) };
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),
  removeItem: (id, weight) => set((state) => ({
    items: state.items.filter(i => !(i.id === id && i.weight === weight))
  })),
  clearCart: () => set({ items: [] })
}), { name: "bnd-cart-v6" }));

export default function IndexPage() {
  // Заглушка для продуктов, чтобы не было ошибок импорта
  const [products] = React.useState<any[]>([]);
  const [view, setView] = React.useState<"landing" | "shop">("landing");
  const [activeCategory, setActiveCategory] = React.useState("Buds");
  
  const { items } = useCart();

  if (view === "landing") {
    return (
      <div className="min-h-screen bg-[#193D2E] flex flex-col items-center justify-center p-6 overflow-hidden relative">
        {/* Фоновое свечение */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="w-48 h-48 mb-16 relative z-10 flex items-center justify-center bg-white/5 rounded-full backdrop-blur-xl border border-white/10">
           <span className="text-4xl font-black italic text-white/20">BND</span>
        </div>
        
        {/* Квадратные кнопки "Лево-Право" */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg relative z-10">
          {[
            { id: "Buds", icon: <Leaf size={32} />, label: "Buds" },
            { id: "Accessories", icon: <Zap size={32} />, label: "Gear" }
          ].map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => { setActiveCategory(cat.id); setView("shop"); window.scrollTo(0,0); }} 
              className="aspect-square flex flex-col items-center justify-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] hover:bg-white hover:text-black transition-all active:scale-95 group shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-black/5 transition-colors">
                {cat.icon}
              </div>
              <span className="text-xl font-black uppercase italic tracking-widest">{cat.label}</span>
              <ArrowRight size={20} className="mt-4 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
            </button>
          ))}
        </div>

        <p className="mt-16 text-[8px] font-black uppercase tracking-[0.5em] text-white/10 italic">Premium Delivery Service</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-8">
      <button onClick={() => setView("landing")} className="mb-8 flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity">
        <ArrowRight size={16} className="rotate-180" /> Назад
      </button>
      <h1 className="text-4xl font-black italic uppercase mb-4">{activeCategory}</h1>
      <p className="opacity-50 italic">Раздел находится в разработке...</p>
    </div>
  );
}
