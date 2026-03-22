"use client"
import * as React from "react"
import Link from "next/link"
import { 
  ArrowLeft, ShoppingBag, Send, Zap, Flame, X, MessageCircle, Instagram, SendHorizontal
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getProducts } from "@/lib/product"

// --- STORE (Тот же, что на главной, для синхронизации) ---
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
  removeItem: (id, weight) => set((state) => ({
    items: state.items.filter((i) => !(i.id === id && i.weight === weight))
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
}), { name: "bnd-cart-v12" }));

// Стили подкатегорий (цвета из твоих скринов)
const SUB_STYLES = {
  "Hash | Old School": { color: "#795548", bg: "rgba(121, 85, 72, 0.1)" },
  "Hash | Fresh Frozen Sale": { color: "#4DB6AC", bg: "rgba(77, 182, 172, 0.1)" },
  "Hash | Fresh Frozen Premium": { color: "#455A64", bg: "rgba(69, 90, 100, 0.1)" },
  "Live Rosin": { color: "#FFB300", bg: "rgba(255, 179, 0, 0.1)" }
};

export default function ConcentratesPage() {
  const [products, setProducts] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const { items, getTotal, addItem } = useCart();

  // Грузим данные ровно так же, как на главной
  React.useEffect(() => {
    getProducts().then(data => {
      // Фильтруем только то, что НЕ "buds"
      const concs = data.filter(p => p.category?.toLowerCase() !== 'buds');
      setProducts(concs);
    });
  }, []);

  // Группируем по subcategory
  const grouped = products.reduce((acc, p) => {
    const key = p.subcategory || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between mb-10 pt-4 max-w-4xl mx-auto">
        <Link href="/" className="p-4 bg-white/5 rounded-[1.5rem] border border-white/10 active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Concentrates</h1>
          <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] mt-1">Premium Selection</p>
        </div>
        <div className="w-14"></div>
      </header>

      {/* Product List */}
      <div className="max-w-4xl mx-auto space-y-8">
        {Object.entries(grouped).map(([subCat, items]) => {
          const style = SUB_STYLES[subCat] || { color: "#FFF", bg: "rgba(255,255,255,0.05)" };
          return (
            <div key={subCat} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
              <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: style.bg }}>
                <h2 className="text-sm font-black italic uppercase tracking-widest" style={{ color: style.color }}>{subCat}</h2>
                <Zap size={16} style={{ color: style.color }} />
              </div>
              <div className="divide-y divide-white/5">
                {items.map((p) => (
                  <div key={p.id} onClick={() => setSelected(p)} className="p-6 flex justify-between items-center hover:bg-white/5 transition-all group cursor-pointer active:bg-white/10">
                    <div className="flex items-center gap-4">
                      {/* Картинка из колонки I (photo) */}
                      <div className="w-14 h-14 rounded-2xl bg-black/20 border border-white/5 overflow-hidden shadow-inner">
                        {p.image ? (
                          <img src={p.image} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-10"><Flame size={20}/></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-[14px] font-black uppercase italic tracking-tight group-hover:text-emerald-400 transition-colors leading-none mb-1">
                          {p.name}
                        </h3>
                        <p className="text-[10px] font-bold opacity-30 uppercase">from {p.prices?.[10] || 0}฿</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-all">
                          <Zap size={14} className="opacity-20 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart (та же, что на главной) */}
      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <Link href="/" className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E]">
            <div className="flex items-center gap-4">
              <ShoppingBag size={20}/>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Checkout</p>
                <p className="text-[16px] font-black italic">{getTotal()}฿ Total</p>
              </div>
            </div>
            <Send size={18}/>
          </Link>
        </div>
      )}

      {/* Selection Modal */}
      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-sm bg-[#193D2E] rounded-[3rem] border border-white/10 p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-6 right-6 opacity-20 hover:opacity-100"><X size={20}/></button>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-emerald-400">{selected.name}</h2>
              <p className="text-[10px] font-black opacity-30 uppercase mt-1 tracking-widest">Select Quantity</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 5, 10].map(w => (
                <button 
                  key={w} 
                  onClick={() => {
                    addItem({ ...selected, weight: `${w}g`, price: selected.prices[w] });
                    setSelected(null);
                  }}
                  className="flex flex-col items-center justify-center py-5 bg-white/5 border border-white/10 rounded-[1.5rem] hover:bg-white hover:text-black transition-all group"
                >
                  <span className="text-xl font-black italic">{w}g</span>
                  <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100">{selected.prices[w]}฿</span>
                </button>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="w-full py-4 text-[9px] font-black opacity-20 uppercase tracking-[0.4em]">Cancel</button>
          </div>
        </div>
      )}

      <footer className="mt-20 pb-12 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] italic text-white/10">BND • PHUKET • 2022</p>
      </footer>
    </div>
  );
}
