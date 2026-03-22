"use client"
import * as React from "react"
import Link from "next/link"
import { 
  ArrowLeft, ShoppingBag, Send, Zap, Flame, X, TrendingDown, Sparkles, Percent, Crown, MessageCircle, Instagram, SendHorizontal
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getProducts } from "@/lib/product"

// --- CONFIG ---
const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, ph: "@username" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, ph: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, ph: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, ph: "@username" },
];

// --- STORE (v12.1 - Должен совпадать с главной) ---
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
    items: state.items.map(i => 
      (i.id === id && i.weight === weight) 
        ? { ...i, quantity: Math.max(1, i.quantity + delta) } 
        : i
    )
  })),
  removeItem: (id, weight) => set((state) => ({
    items: state.items.filter((i) => !(i.id === id && i.weight === weight))
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
}), { name: "bnd-cart-v12" }));

// --- HELPER ---
const getSubStyle = (subName = "") => {
  const name = subName.toLowerCase();
  if (name.includes("old school")) return { color: "#C1C1C1", icon: Percent };
  if (name.includes("premium")) return { color: "#34D399", icon: Flame };
  if (name.includes("fresh frozen")) return { color: "#FEC107", icon: Sparkles };
  if (name.includes("rosin")) return { color: "#A855F7", icon: Crown };
  return { color: "#FFF", icon: Zap };
};

const getInterpolatedPrice = (weight, prices) => {
  if (!prices) return 0;
  const p1 = Number(prices[1]) || 0;
  const p5 = Number(prices[5]) || 0;
  const p10 = Number(prices[10]) || 0;
  if (weight <= 1) return p1 * weight;
  if (weight <= 5) return p1 + (p5 - p1) * ((weight - 1) / 4);
  if (weight <= 10) return p5 + (p10 - p5) * ((weight - 5) / 5);
  return (p10 / 10) * weight;
};

// --- COMPONENTS ---
function CheckoutModal({ items, total, onClose }) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { updateQuantity, removeItem, clearCart } = useCart();

  const handleSubmit = async () => {
    if (!contact) return alert("Введите данные");
    setIsSending(true);
    const orderDetails = items.map(i => `[${(i.subcategory || 'CONC').toUpperCase()}] ${i.name} (${i.weight}) x${i.quantity} = ${i.price * i.quantity}฿`).join("\n");
    const finalMessage = `${orderDetails}\n\nTOTAL: ${total}฿`;

    try {
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ contact, method, orderText: finalMessage, total }) });
      alert("Success!"); clearCart(); onClose();
    } catch (e) { alert("Error!"); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Your Order</h2>
          <button onClick={onClose} className="p-2 opacity-30 hover:opacity-100"><X size={24} className="text-white"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {items.map((item) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase opacity-30 leading-none mb-1">{item.subcategory}</p>
                <p className="text-[12px] font-bold truncate text-white">{item.name}</p>
                <p className="text-[11px] font-black text-emerald-400 mt-1">{item.price * item.quantity}฿ <span className="text-white/20 ml-1">({item.weight})</span></p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-1 border border-white/5">
                <button onClick={() => updateQuantity(item.id, item.weight, -1)} className="w-7 h-7 flex items-center justify-center text-white/40">-</button>
                <span className="text-[12px] font-black text-white">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.weight, 1)} className="w-7 h-7 flex items-center justify-center text-white/40">+</button>
              </div>
              <button onClick={() => removeItem(item.id, item.weight)} className="p-2 text-red-400/50"><X size={16}/></button>
            </div>
          ))}
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4 shrink-0">
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30 text-white"}`}>
                <m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>
          <input type="text" placeholder={CONTACT_METHODS.find(m => m.id === method)?.ph} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-[12px] font-bold outline-none focus:border-emerald-400 text-white" />
          <button onClick={handleSubmit} disabled={isSending} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl active:scale-95 disabled:opacity-50">
            {isSending ? "Sending..." : `Send Order • ${total}฿`}
          </button>
        </div>
      </div>
    </div>
  );
}

const BadgeIcon = ({ type }) => {
  switch (type?.toUpperCase()) {
    case "NEW": return <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0"><span className="text-[6px] font-black text-blue-400 leading-none">NEW</span></div>;
    case "HIT": return <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0"><Flame size={10} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0"><Percent size={10} className="text-emerald-400" /></div>;
    default: return null;
  }
};

function ProductModal({ product, style, onClose }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices));
  const pricePerGram = Math.round(currentPrice / weight);
  const tip = weight < 5 ? { next: 5, p: Math.round(Number(product.prices?.[5] || 0)/5) } : weight < 10 ? { next: 10, p: Math.round(Number(product.prices?.[10] || 0)/10) } : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in-95 duration-200" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50 hover:text-white transition-colors"><X size={20}/></button>
        <div className="aspect-square w-full relative bg-black/10">
          <img src={product.image} className="w-full h-full object-contain p-10" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1 text-white opacity-40">{product.subcategory}</p>
          </div>
        </div>
        <div className="p-6 space-y-6 text-white">
          <div className="flex justify-between items-end">
             <div>
               <div className="text-4xl font-black italic tracking-tighter">{currentPrice}฿</div>
               <div className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-1">Price per gram: {pricePerGram}฿</div>
             </div>
             <div className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full mb-1">{weight}g</div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[1, 5, 10].map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-2 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>
              ))}
            </div>
            <input type="range" min="1" max="10" step="1" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            {tip && tip.p > 0 && (
              <div className="flex items-center gap-2 py-2 px-4 bg-emerald-400/5 rounded-xl border border-emerald-400/10">
                <TrendingDown size={12} className="text-emerald-400" />
                <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-tighter">Add {tip.next - weight}g more for {tip.p}฿ per gram!</p>
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

export default function ConcentratesPage() {
  const [products, setProducts] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const { items, getTotal } = useCart();

  React.useEffect(() => {
    getProducts().then(data => {
      const concs = data.filter(p => p.category?.toLowerCase() !== 'buds');
      setProducts(concs);
    });
  }, []);

  const grouped = products.reduce((acc, p) => {
    const key = p.subcategory || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="flex items-center justify-between mb-10 pt-4 max-w-4xl mx-auto">
        <Link href="/" className="p-4 bg-white/5 rounded-[1.5rem] border border-white/10 active:scale-90 transition-all text-white">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Concentrates</h1>
          <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] mt-1 italic text-white/50">Extraction Menu</p>
        </div>
        <div className="w-14"></div>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        {Object.entries(grouped).map(([subCat, items]) => {
          const style = getSubStyle(subCat);
          return (
            <div key={subCat} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl">
              <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${style.color}10` }}>
                <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{subCat}</h2>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <style.icon size={18} style={{ color: style.color }} />
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {items.map((p) => {
                  const priceFrom = p.prices?.[10] ? Math.round(Number(p.prices[10]) / 10) : 0;
                  return (
                    <div key={p.id} onClick={() => setSelected(p)} className="grid grid-cols-12 gap-2 px-6 py-5 items-center hover:bg-white/5 transition-all group cursor-pointer active:bg-white/10">
                      <div className="col-span-8 flex items-center gap-4">
                        <div className="w-5 flex justify-center shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
                        <span className="text-[12px] font-black uppercase italic tracking-tight text-white/90 group-hover:text-white leading-tight">{p.name}</span>
                      </div>
                      <div className="col-span-4 text-right text-[10px] font-bold opacity-30 italic">от {priceFrom}฿</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E] group active:scale-95 transition-all">
            <div className="flex items-center gap-4 text-left text-[#193D2E]">
              <ShoppingBag size={20}/>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Checkout</p>
                <p className="text-[16px] font-black italic">{getTotal()}฿ Total</p>
              </div>
            </div>
            <Send size={18} className="text-[#193D2E]"/>
          </button>
        </div>
      )}

      {selected && <ProductModal product={selected} style={getSubStyle(selected.subcategory)} onClose={() => setSelected(null)} />}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
      
      <footer className="mt-20 pb-12 text-center text-white/5 italic text-[9px] font-black uppercase tracking-[0.5em]">
        BND • PHUKET • 2026
      </footer>
    </div>
  );
}
