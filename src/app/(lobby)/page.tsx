"use client"
import * as React from "react"
import Link from "next/link"
import { 
  Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, TrendingDown, 
  ShoppingBag, Send, MessageCircle, Instagram, SendHorizontal, Gift, Info, Trash2
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getProducts } from "@/lib/product"

// --- STORE (Ключ bnd-cart-v12 объединяет корзину с концентратами) ---
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

const GRADES = [
  { id: "silver", title: "SILVER GRADE", color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", color: "#FEC107", icon: Sparkles },
  { id: "premium", title: "PREMIUM GRADE", color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", color: "#A855F7", icon: Crown }
];

const STORIES = [
  { id: "new", label: "New Arrivals", icon: Sparkles, color: "#2DD4BF" },
  { id: "sale", label: "Gifts & Promos", icon: Gift, color: "#FEC107" },
  { id: "info", label: "Service Info", icon: Info, color: "#A855F7" },
];

const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, ph: "@username or phone number" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, ph: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, ph: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, ph: "@username or phone number" },
];

const TYPE_SHORT: Record<string, string> = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };
const TYPE_COLORS: Record<string, string> = { "indica": "#A855F7", "sativa": "#FBBF24", "hybrid": "#2DD4BF" };

const getInterpolatedPrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  if (weight <= 1) return prices[1] * weight;
  if (weight <= 5) return prices[1] + (prices[5] - prices[1]) * ((weight - 1) / 4);
  if (weight <= 10) return prices[5] + (prices[10] - prices[5]) * ((weight - 5) / 5);
  if (weight <= 20) return prices[10] + (prices[20] - prices[10]) * ((weight - 10) / 10);
  return (prices[20] / 20) * weight;
};

// --- MODALS ---

function StoryModal({ story, onClose }: { story: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-sm h-[85vh] px-4 relative flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-4 p-2 text-white/50 hover:text-white transition-colors"><X size={32}/></button>
        <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/20">
          <img src={`/stories/${story.id}.webp`} className="w-full h-full object-cover" alt={story.label} />
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices));
  const pricePerGram = Math.round(currentPrice / weight);
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase()] || "#FFF";

  const tip = (() => {
    if (weight < 5) return { next: 5, p: Math.round(product.prices[5]/5) };
    if (weight < 10) return { next: 10, p: Math.round(product.prices[10]/10) };
    if (weight < 20) return { next: 20, p: Math.round(product.prices[20]/20) };
    return null;
  })();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50 hover:text-white"><X size={20}/></button>
        <div className="aspect-square w-full relative bg-black/10">
          <img src={product.image} className="w-full h-full object-contain p-10" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1 text-white">
                <span style={{ color: typeColor }}>{product.type}</span>
                <span className="mx-2 opacity-20">•</span>
                <span style={{ color: style.color }}>{product.subcategory} Grade</span>
             </p>
          </div>
        </div>
        <div className="p-8 pt-0 space-y-5 text-white">
          <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><MapPin size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Farm</span></div><p className="text-[10px] font-bold italic truncate">{product.farm}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Leaf size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Taste</span></div><p className="text-[10px] font-bold italic truncate">{product.taste}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Wind size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Terps</span></div><p className="text-[10px] font-bold italic truncate">{product.terpenes}</p></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <div>
                 <div className="text-4xl font-black italic tracking-tighter">{currentPrice}฿</div>
                 <div className="text-[9px] font-bold opacity-30 uppercase mt-1">Price per gram: {pricePerGram}฿</div>
               </div>
               <div className="text-[11px] font-black uppercase bg-white/10 px-4 py-1 rounded-full mb-1">{weight}g</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, 20].map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-3 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>
              ))}
            </div>
            <input type="range" min="1" max="20" step="1" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            {tip && (
              <div className="flex items-center gap-2 py-2 px-4 bg-emerald-400/5 rounded-xl border border-emerald-400/10">
                <TrendingDown size={12} className="text-emerald-400" />
                <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-tight">Add {(tip.next - weight).toFixed(0)}g more for {tip.p}฿ per gram!</p>
              </div>
            )}
            <button onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} className={`w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}>
              {isAdded ? "Added to Cart" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ contact, method, orderText, total }) });
      alert("Заказ успешно отправлен!"); clearCart(); onClose();
    } catch (error) { alert("Ошибка отправки."); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10">
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Your Basket</h2>
            <p className="text-[10px] font-bold opacity-30 uppercase text-white tracking-[0.2em]">{items.length} positions</p>
          </div>
          <button onClick={onClose} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={24} className="text-white"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {items.map((item) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5">
              <div className="w-12 h-12 rounded-lg bg-black/20 flex-shrink-0">
                <img src={item.image} className="w-full h-full object-contain" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-black uppercase italic truncate text-white">{item.name}</h3>
                <p className="text-[9px] opacity-40 font-bold text-white uppercase">{item.weight} • {item.price}฿</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-black/20 rounded-xl border border-white/5">
                  <button onClick={() => updateQuantity(item.id, item.weight, -1)} className="px-2 py-1 text-white opacity-40 hover:opacity-100">-</button>
                  <span className="text-[10px] font-black text-white w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.weight, 1)} className="px-2 py-1 text-white opacity-40 hover:opacity-100">+</button>
                </div>
                <button onClick={() => removeItem(item.id, item.weight)} className="text-rose-500/40 hover:text-rose-500 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30 text-white"}`}>
                <m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>
          <input type="text" placeholder={CONTACT_METHODS.find(m => m.id === method)?.ph} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30" />
          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] font-black uppercase opacity-40 text-white tracking-widest">Total Amount</p>
            <p className="text-3xl font-black italic text-white tracking-tighter">{total}฿</p>
          </div>
          <button onClick={handleSubmit} disabled={isSending || items.length === 0} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-95 transition-all disabled:opacity-20 shadow-lg">
            {isSending ? "Sending..." : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

const BadgeIcon = ({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0"><span className="text-[6px] font-black text-blue-400">NEW</span></div>;
    case "HIT": return <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0"><Flame size={10} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0"><Percent size={10} className="text-emerald-400" /></div>;
    default: return null;
  }
};

export default function LandingPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [activeStory, setActiveStory] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false); 
  const { items, getTotal } = useCart();

  React.useEffect(() => { getProducts().then(data => setProducts(data)); }, []);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="flex flex-col items-center mb-10 pt-4">
        <div className="relative w-24 h-24 mb-10 group">
           <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[40px]"></div>
           <img src="/icon.png" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
        </div>
        <div className="flex gap-6 mb-10 overflow-x-auto w-full max-w-md px-4 no-scrollbar justify-center">
          {STORIES.map((s) => (
            <button key={s.id} onClick={() => setActiveStory(s)} className="flex flex-col items-center gap-3 shrink-0 group">
              <div className="w-16 h-16 rounded-full bg-white/5 border-2 flex items-center justify-center transition-all active:scale-90" style={{ borderColor: `${s.color}40` }}><s.icon size={22} style={{ color: s.color }} /></div>
              <span className="text-[9px] font-black tracking-widest uppercase opacity-60 text-center leading-tight max-w-[65px]">{s.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full max-w-sm px-2">
          <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 font-black uppercase text-[9px] tracking-widest opacity-30 italic cursor-not-allowed">Accessories</button>
          <Link href="/concentrates" className="flex-1 py-4 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/30 font-black uppercase text-[9px] tracking-widest text-[#a855f7] italic flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Flame size={12} /> Concentrates
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {GRADES.map((grade) => {
          const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeItems.length === 0) return null;
          return (
            <div key={grade.id} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
              <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner"><grade.icon size={18} style={{ color: grade.color }} /></div>
              </div>
              <div className="divide-y divide-white/5">
                {gradeItems.map((p) => (
                  <div key={p.id} onClick={() => setSelectedProduct(p)} className="grid grid-cols-12 gap-2 px-6 py-5 items-center hover:bg-white/5 transition-all group cursor-pointer active:bg-white/10">
                    <div className="col-span-6 flex items-center gap-4 relative">
                      <div className="w-5 flex justify-center shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
                      <span className="text-[12px] font-black uppercase italic tracking-tight text-white/90 group-hover:text-white leading-tight">{p.name}</span>
                    </div>
                    <div className="col-span-2 text-center text-[10px] font-black uppercase shrink-0" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</div>
                    <div className="col-span-4 text-right text-[10px] font-bold opacity-30 italic truncate">{p.farm}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center group active:scale-95 transition-all border-4 border-[#193D2E]">
            <div className="flex items-center gap-4">
              <ShoppingBag size={22}/>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Order Now</p>
                <p className="text-[16px] font-black italic mt-1">{getTotal()}฿ Total</p>
              </div>
            </div>
            <Send size={20}/>
          </button>
        </div>
      )}

      {activeStory && <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />}
      {selectedProduct && <ProductModal product={selectedProduct} style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }} onClose={() => setSelectedProduct(null)} />}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
      
      <footer className="mt-20 pb-12 flex flex-col items-center gap-4 text-white/40">
        <p className="text-center text-[9px] font-black uppercase tracking-[0.5em] italic">БОШКУНАДОРОЖКУ • PHUKET • 2022</p>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
