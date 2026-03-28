"use client"

import * as React from "react"
import Link from "next/link"
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left"
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag"
import Send from "lucide-react/dist/esm/icons/send"
import Zap from "lucide-react/dist/esm/icons/zap"
import Flame from "lucide-react/dist/esm/icons/flame"
import X from "lucide-react/dist/esm/icons/x"
import TrendingDown from "lucide-react/dist/esm/icons/trending-down"
import Sparkles from "lucide-react/dist/esm/icons/sparkles"
import Percent from "lucide-react/dist/esm/icons/percent"
import Crown from "lucide-react/dist/esm/icons/crown"
import MapPin from "lucide-react/dist/esm/icons/map-pin"
import Wind from "lucide-react/dist/esm/icons/wind"
import MessageCircle from "lucide-react/dist/esm/icons/message-circle"
import Instagram from "lucide-react/dist/esm/icons/instagram"
import SendHorizontal from "lucide-react/dist/esm/icons/send-horizontal"
import Trash2 from "lucide-react/dist/esm/icons/trash-2"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getProducts } from "@/lib/product"

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

const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, ph: "@username or phone number" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, ph: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, ph: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, ph: "@username or phone number" },
];

const getInterpolatedPrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  const p1 = Number(prices[1]) || 0;
  const p5 = Number(prices[5]) || 0;
  const p10 = Number(prices[10]) || 0;
  if (weight <= 1) return p1 * weight;
  if (weight <= 5) return p1 + (p5 - p1) * ((weight - 1) / 4);
  if (weight <= 10) return p5 + (p10 - p5) * ((weight - 5) / 5);
  return (p10 / 10) * weight;
};

const getOptimizedImg = (url: string, w = 600) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
};

// --- MODALS ---
function CheckoutModal({ items, total, onClose }: { items: any[], total: number, onClose: () => void }) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { clearCart, removeItem, updateQuantity } = useCart();

  const handleSubmit = async () => {
    if (!contact) return alert("Введите данные для связи");
    setIsSending(true);
    const orderText = items.map(i => `${i.name} (${i.weight}) x${i.quantity} — ${i.price * i.quantity}฿`).join("\n");
    try {
      const URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ contact, method, orderText, total }) });
      alert("Заказ успешно отправлен!"); clearCart(); onClose();
    } catch (error) { alert("Ошибка отправки."); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10 text-white">
          <div><h2 className="text-xl font-black italic uppercase tracking-tighter">Your Basket</h2><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{items.length} items</p></div>
          <button onClick={onClose} className="p-2 opacity-20 hover:opacity-100"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {items.map((item: any) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5 text-white">
              <div className="w-12 h-12 rounded-lg bg-black/20 flex-shrink-0"><img src={getOptimizedImg(item.image, 100)} className="w-full h-full object-contain" alt="" /></div>
              <div className="flex-1 min-w-0"><h3 className="text-[11px] font-black uppercase italic truncate">{item.name}</h3><p className="text-[9px] opacity-40 font-bold uppercase">{item.weight} • {item.price}฿</p></div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-black/20 rounded-xl border border-white/5"><button onClick={() => updateQuantity(item.id, item.weight, -1)} className="px-2 py-1 opacity-40 hover:opacity-100">-</button><span className="text-[10px] font-black w-4 text-center">{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.weight, 1)} className="px-2 py-1 opacity-40 hover:opacity-100">+</button></div>
                <button onClick={() => removeItem(item.id, item.weight)} className="text-rose-500/40 hover:text-rose-500 transition-colors p-1"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-black border-white shadow-lg" : "bg-white/5 border-white/10 opacity-30 text-white"}`}><m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span></button>
            ))}
          </div>
          <input type="text" placeholder={CONTACT_METHODS.find(m => m.id === method)?.ph} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30" />
          <div className="flex items-center justify-between pt-2 text-white"><p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Total cost</p><p className="text-3xl font-black italic tracking-tighter">{total}฿</p></div>
          <button onClick={handleSubmit} disabled={isSending || items.length === 0} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-95 transition-all disabled:opacity-20 shadow-lg">{isSending ? "Processing..." : "Confirm & Send Order"}</button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose }: { product: any, onClose: () => void }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices));
  const pricePerGram = Math.round(currentPrice / weight);
  const p5 = Number(product.prices?.[5]) || 0;
  const p10 = Number(product.prices?.[10]) || 0;
  const tip = weight < 5 ? { next: 5, p: Math.round(p5/5) } : weight < 10 ? { next: 10, p: Math.round(p10/10) } : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl text-white" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50 hover:text-white"><X size={20}/></button>
        <div className="aspect-square w-full relative bg-black/10">
          <img src={getOptimizedImg(product.image, 600)} className="w-full h-full object-contain p-10" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">{product.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1 opacity-40">{product.subcategory}</p>
          </div>
        </div>
        <div className="p-8 pt-0 space-y-6">
          <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><MapPin size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Farm</span></div><p className="text-[10px] font-bold italic truncate">{product.farm || "Unknown"}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Wind size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Microns</span></div><p className="text-[10px] font-bold italic truncate">{product.microns || "N/A"}</p></div>
          </div>
          <div className="flex justify-between items-end">
            <div><div className="text-4xl font-black italic tracking-tighter">{currentPrice}฿</div><div className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-1">Price per gram: {pricePerGram}฿</div></div>
            <div className="text-[11px] font-black uppercase bg-white/10 px-4 py-1 rounded-full mb-1">{weight}g</div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">{[1, 5, 10].map(v => (<button key={v} onClick={() => setWeight(v)} className={`py-3 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>))}</div>
            <input type="range" min="1" max="10" step="1" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            {tip && (
              <div className="flex items-center gap-2 py-2 px-4 bg-emerald-400/5 rounded-xl border border-emerald-400/10">
                <TrendingDown size={12} className="text-emerald-400" /><p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-tighter">Add {tip.next - weight}g more for {tip.p}฿ per gram!</p>
              </div>
            )}
            <button
              onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }}
              className={`w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}
            >
              {isAdded ? "Added to Cart" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function ConcentratesPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const { items, getTotal } = useCart();

  React.useEffect(() => {
    getProducts().then(data => {
      const allItems = data.products || [];
      const concs = allItems.filter((p: any) => String(p.category || "").toLowerCase() === 'concentrates');
      setProducts(concs);
      setLoading(false);
    });
  }, []);

  const grouped = products.reduce((acc: any, p: any) => {
    const key = p.subcategory || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="flex items-center justify-between mb-10 pt-4 max-w-4xl mx-auto">
        <Link href="/" className="p-4 bg-white/5 rounded-[1.5rem] border border-white/10 active:scale-90 transition-all"><ArrowLeft size={20} /></Link>
        <div className="text-center"><h1 className="text-2xl font-black italic uppercase tracking-tighter">Concentrates</h1><p className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] mt-1 italic leading-none">Extraction Menu</p></div>
        <div className="w-14"></div>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        {loading ? (
           <div className="text-center py-20 opacity-20 animate-pulse font-black uppercase text-xs tracking-widest">Loading...</div>
        ) : Object.keys(grouped).length > 0 ? (
          Object.entries(grouped).map(([subCat, subItems]: [string, any]) => {
            const name = subCat.toLowerCase();
            let color = "#FFF";
            let Icon = Zap;

            if (name.includes("premium")) { color = "#34D399"; Icon = Flame; }
            else if (name.includes("fresh frozen")) { color = "#FEC107"; Icon = Sparkles; }
            else if (name.includes("old school") || name.includes("hash")) { color = "#C1C1C1"; Icon = Percent; }
            else if (name.includes("rosin")) { color = "#A855F7"; Icon = Crown; }

            return (
              <div key={subCat} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl">
                <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${color}10` }}>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color }}>{subCat}</h2>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                    <Icon size={18} style={{ color }} />
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {subItems.map((p: any) => {
                    const priceFrom = p.prices?.[10] ? Math.round(Number(p.prices[10]) / 10) : 0;
                    return (
                      <div key={p.id} onClick={() => setSelected(p)} className="grid grid-cols-12 gap-2 px-6 py-5 items-center hover:bg-white/5 transition-all group cursor-pointer active:bg-white/10">
                        <div className="col-span-8 flex items-center gap-4">
                          <span className="text-[12px] font-black uppercase italic tracking-tight text-white/90 group-hover:text-white leading-tight">{p.name}</span>
                        </div>
                        <div className="col-span-4 text-right text-[10px] font-bold opacity-30 italic">from {priceFrom}฿/g</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-24 opacity-30 font-black uppercase text-[10px] tracking-[0.3em]">Stock is empty</div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E] group active:scale-95 transition-all">
            <div className="flex items-center gap-4 text-left"><ShoppingBag size={22}/><div><p className="text-[10px] font-black uppercase tracking-widest leading-none">Order Now</p><p className="text-[16px] font-black italic mt-1">{getTotal()}฿ Total</p></div></div>
            <Send size={18}/>
          </button>
        </div>
      )}

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
