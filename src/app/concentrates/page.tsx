"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft, ShoppingBag, Send, Zap, Flame, X, TrendingDown, Sparkles,
  Percent, Crown, MapPin, Wind, MessageCircle, Instagram, SendHorizontal, Trash2
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";

// --- STORE ---
const useCart = create<any>()(persist((set, get) => ({
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
}), { name: "bnd-cart-v12" }));

// --- HELPERS ---
const getSubStyle = (subName = "") => {
  const name = subName.toLowerCase();
  if (name.includes("hash") || name.includes("frozen")) return { color: "#FEC107", icon: Sparkles };
  if (name.includes("rosin")) return { color: "#A855F7", icon: Crown };
  if (name.includes("premium")) return { color: "#34D399", icon: Flame };
  return { color: "#FFF", icon: Zap };
};

const getPriceByWeight = (weight: number, p: any) => {
  const p1 = Number(p.price_1g) || 0;
  const p5 = Number(p.price_5g) || 0;
  const p10 = Number(p.price_10g) || 0;
  const p20 = Number(p.price_20g) || 0;
  
  if (weight === 1) return p1;
  if (weight === 5) return p5;
  if (weight === 10) return p10;
  if (weight === 20) return p20;
  
  if (weight < 5) return p1 + (p5 - p1) * ((weight - 1) / 4);
  if (weight < 10) return p5 + (p10 - p5) * ((weight - 5) / 5);
  return (p10 / 10) * weight;
};

// --- MODALS ---
function CheckoutModal({ items, total, onClose }: { items: any[], total: number, onClose: () => void }) {
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { clearCart } = useCart();

  const handleSubmit = async () => {
    if (!contact) return alert("Enter contact info");
    setIsSending(true);
    const orderText = items.map(i => `${i.name} (${i.weight}) x${i.quantity}`).join("\n");
    try {
      await fetch(GOOGLE_SCRIPT_URL, { 
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, method: "direct", orderText, total }) 
      });
      alert("Order sent!"); clearCart(); onClose();
    } catch (e) { alert("Error."); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10 text-white">
          <h2 className="text-xl font-black italic uppercase">Basket</h2>
          <button onClick={onClose} className="opacity-20 hover:opacity-100"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar text-white">
          {items.map((item: any) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5">
              <img src={item.photo} className="w-12 h-12 rounded-lg object-contain bg-black/20" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-black uppercase italic truncate">{item.name}</h3>
                <p className="text-[9px] opacity-40 font-bold uppercase">{item.weight} • {item.price}฿</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <input type="text" placeholder="Telegram @username" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white text-[12px] font-bold outline-none" />
          <div className="flex justify-between items-baseline text-white font-black italic uppercase">
            <span className="text-[10px] opacity-40">Total:</span>
            <span className="text-3xl">{total}฿</span>
          </div>
          <button onClick={handleSubmit} disabled={isSending || items.length === 0} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] shadow-xl active:scale-95 transition-all">
            {isSending ? "Processing..." : "Confirm & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const [weight, setWeight] = React.useState(1);
  const addItem = useCart((s: any) => s.addItem);
  const currentPrice = Math.round(getPriceByWeight(weight, product));
  const pricePerGram = Math.round(currentPrice / weight);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl text-white" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50"><X size={20}/></button>
        <div className="aspect-square w-full relative bg-black/10">
          <img src={product.photo} className="w-full h-full object-contain p-10" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{product.subcategory}</p>
          </div>
        </div>
        <div className="p-8 pt-0 space-y-6">
          <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4 opacity-40 text-[9px] font-black uppercase italic tracking-widest">
             <div className="flex items-center gap-2"><MapPin size={10}/> Farm: {product.farm || "N/A"}</div>
             <div className="flex items-center gap-2"><Wind size={10}/> Microns: {product.microns || "N/A"}</div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-4xl font-black italic tracking-tighter">{currentPrice}฿</div>
              <div className="text-[9px] font-bold opacity-30 uppercase mt-1">Per gram: {pricePerGram}฿</div>
            </div>
            <div className="text-[11px] font-black uppercase bg-white/10 px-4 py-1 rounded-full mb-1">{weight}g</div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[1, 5, 10].map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-3 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>
              ))}
            </div>
            <input type="range" min="1" max="10" step="1" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            <button onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); onClose(); }} className="w-full py-5 rounded-2xl font-black uppercase text-[12px] bg-white text-[#193D2E] active:scale-95 transition-all shadow-xl tracking-[0.2em]">Add to Order</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const BadgeIcon = ({ type }: { type: string }) => {
  if (type?.toUpperCase() === "HIT") return <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0"><Flame size={10} className="text-orange-400" /></div>;
  if (type?.toUpperCase() === "NEW") return <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0"><span className="text-[6px] font-black text-blue-400">NEW</span></div>;
  return null;
};

export default function ConcentratesPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const { items, getTotal } = useCart();

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?v=${Date.now()}`, { cache: 'no-store' });
        const data = await response.json();
        
        // Надежный фильтр: убираем лишние пробелы и сравниваем как в JSON
        const filtered = Array.isArray(data) 
          ? data.filter((p: any) => String(p.category || "").trim() === 'Concentrates') 
          : [];
        
        setProducts(filtered);
      } catch (e) { 
        console.error("Fetch error:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, []);

  const grouped = products.reduce((acc: any, p: any) => {
    const key = p.subcategory || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32 font-sans">
      <header className="flex items-center justify-between mb-10 pt-4 max-w-4xl mx-auto">
        <Link href="/" className="p-4 bg-white/5 rounded-2xl border border-white/10 active:scale-90"><ArrowLeft size={20} /></Link>
        <div className="text-center">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Concentrates</h1>
          <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] mt-1 italic">Extraction Menu</p>
        </div>
        <div className="w-14"></div>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        {loading ? (
          <div className="text-center py-20 opacity-20 animate-pulse font-black uppercase text-xs tracking-widest">Loading Stock...</div>
        ) : products.length > 0 ? (
          Object.entries(grouped).map(([subCat, subItems]: [string, any]) => {
            const style = getSubStyle(subCat);
            return (
              <div key={subCat} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
                <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${style.color}10` }}>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{subCat}</h2>
                  <style.icon size={18} style={{ color: style.color }} />
                </div>
                <div className="divide-y divide-white/5">
                  {subItems.map((p: any) => (
                    <div key={p.id} onClick={() => setSelected(p)} className="flex justify-between items-center px-6 py-5 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <BadgeIcon type={p.badge} />
                        <span className="text-[12px] font-black uppercase italic tracking-tight">{p.name}</span>
                      </div>
                      <span className="text-[10px] font-bold opacity-30 italic">from {Math.round(Number(p.price_10g)/10 || 0)}฿/g</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-24 opacity-30 font-black uppercase text-[10px] tracking-[0.3em]">
            <Zap size={40} className="mx-auto mb-4 opacity-10"/>
            Stock is empty
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E] font-black uppercase italic active:scale-95 transition-all">
            <div className="flex items-center gap-4"><ShoppingBag size={20}/> <span>Basket ({items.length})</span></div>
            <span>{getTotal()}฿</span>
          </button>
        </div>
      )}

      {selected && <ProductModal product={selected} style={getSubStyle(selected.subcategory)} onClose={() => setSelected(null)} />}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
