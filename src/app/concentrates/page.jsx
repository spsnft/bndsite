"use client"
import * as React from "react"
import Link from "next/link"
import { 
  ArrowLeft, Flame, ShoppingBag, Send, X, MessageCircle, Instagram, SendHorizontal, Info, Zap
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- ДАННЫЕ (из твоего скриншота) ---
const CONCENTRATES_DATA = [
  {
    id: "hash-old-school",
    title: "HASH | OLD SCHOOL",
    color: "#795548",
    items: [
      { id: "wild-runtz-hash", name: "WILD RUNTZ", prices: { 1: 350, 5: 1500, 10: 2500 } }
    ]
  },
  {
    id: "hash-fresh-frozen-1",
    title: "HASH | FRESH FROZEN",
    color: "#4DB6AC",
    items: [
      { id: "papaya-90u", name: "PAPAYA 90U", prices: { 1: 900, 5: 4000, 10: 7000 }, badge: "NEW" },
      { id: "apple-banana-zoap-90u", name: "APPLE BANANA ZOAP 90U", prices: { 1: 900, 5: 4000, 10: 7000 }, badge: "NEW" },
      { id: "cherry-gelato-90u", name: "CHERRY GELATO 90U", prices: { 1: 900, 5: 4000, 10: 7000 }, badge: "NEW" }
    ]
  },
  {
    id: "hash-fresh-frozen-2",
    title: "HASH | FRESH FROZEN",
    color: "#455A64",
    items: [
      { id: "papaya-fs", name: "PAPAYA FS", prices: { 1: 700, 5: 3000, 10: 5500 }, badge: "NEW" },
      { id: "apple-banana-z", name: "APPLE BANANA Z 73-140U", prices: { 1: 700, 5: 3000, 10: 5500 }, badge: "NEW" },
      { id: "cherry-gelato-z", name: "CHERRY GELATO 73-140U", prices: { 1: 700, 5: 3000, 10: 5500 }, badge: "NEW" },
      { id: "blueberry-cake-hash", name: "BLUEBERRY CAKE", prices: { 1: 700, 5: 3000, 10: 5500 } }
    ]
  }
];

// --- STORE (Синхронизирован с главной) ---
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
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
}), { name: "bnd-cart-v12" }));

// --- MODAL COMPONENT ---
function OrderModal({ product, onClose }) {
  const [weight, setWeight] = React.useState(1);
  const addItem = useCart(s => s.addItem);
  const price = product.prices[weight] || (product.prices[10] / 10 * weight);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#1a2e26] border border-white/10 rounded-[2.5rem] p-8 space-y-6" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <h2 className="text-2xl font-black italic uppercase text-emerald-400">{product.name}</h2>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-2">Select Weight</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {[1, 5, 10].map(v => (
            <button key={v} onClick={() => setWeight(v)} className={`py-4 rounded-2xl font-black transition-all border ${weight === v ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"}`}>
              {v}g
            </button>
          ))}
        </div>

        <div className="text-center py-4">
          <span className="text-4xl font-black italic">{price}฿</span>
        </div>

        <button 
          onClick={() => { addItem({ ...product, price, weight: `${weight}g` }); onClose(); }}
          className="w-full bg-emerald-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all"
        >
          Add to Order
        </button>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function ConcentratesPage() {
  const [selected, setSelected] = React.useState(null);
  const { items, getTotal } = useCart();

  return (
    <div className="min-h-screen bg-[#0f1a15] text-white p-4 pb-32">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8 pt-4">
        <Link href="/" className="p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Concentrates</h1>
          <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Premium Quality Only</p>
        </div>
        <div className="w-11"></div> {/* Spacer */}
      </header>

      {/* LIST */}
      <div className="max-w-2xl mx-auto space-y-6">
        {CONCENTRATES_DATA.map((group) => (
          <div key={group.id} className="rounded-[2rem] overflow-hidden border border-white/5 bg-black/20">
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5" style={{ backgroundColor: `${group.color}20` }}>
              <h2 className="text-[12px] font-black italic uppercase tracking-widest" style={{ color: group.color }}>{group.title}</h2>
              <Zap size={14} style={{ color: group.color }} />
            </div>
            <div className="divide-y divide-white/5">
              {group.items.map((item) => (
                <div key={item.id} onClick={() => setSelected(item)} className="p-6 flex justify-between items-center active:bg-white/5 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    {item.badge && <span className="text-[7px] font-black bg-emerald-500 text-black px-1.5 py-0.5 rounded-sm">NEW</span>}
                    <span className="font-bold text-[13px] group-hover:text-emerald-400 transition-colors uppercase italic">{item.name}</span>
                  </div>
                  <div className="text-[11px] font-black opacity-40">
                    from {item.prices[10]}฿
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CART BUTTON (Copy-paste from main) */}
      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <Link href="/" className="w-full bg-emerald-400 text-black p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#0f1a15]">
            <div className="flex items-center gap-4">
              <ShoppingBag size={20}/>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase leading-none">In Cart</p>
                <p className="text-[16px] font-black italic">{getTotal()}฿ Total</p>
              </div>
            </div>
            <div className="bg-black/10 p-3 rounded-full flex items-center gap-2">
               <span className="text-[10px] font-black">CHECKOUT</span>
               <Send size={16}/>
            </div>
          </Link>
        </div>
      )}

      {selected && <OrderModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
