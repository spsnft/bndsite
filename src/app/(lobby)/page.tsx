"use client"
import * as React from "react"
import Link from "next/link"
import { getProducts } from "@/lib/product" 
import { 
  LayoutGrid, Zap, Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, TrendingDown, ShoppingBag, Send, MessageCircle, Instagram, SendHorizontal, Megaphone, Clock3
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG & STYLES ---
const GRADES = [
  { id: "silver", title: "SILVER GRADE", prices: [ {w:1, p:150}, {w:5, p:700}, {w:10, p:1200}, {w:20, p:2000} ], color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", prices: [ {w:1, p:250}, {w:5, p:1100}, {w:10, p:1700}, {w:20, p:3000} ], color: "#FEC107", icon: Sparkles },
  { id: "premium", title: "PREMIUM GRADE", prices: [ {w:1, p:300}, {w:5, p:1300}, {w:10, p:2000}, {w:20, p:3500} ], color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", prices: [ {w:1, p:350}, {w:5, p:1500}, {w:10, p:2500}, {w:20, p:4000} ], color: "#A855F7", icon: Crown }
];

// ГЛАВНЫЙ БАННЕР (ОДИН)
const MAIN_PROMO = {
  title: "BONG FOR FREE",
  desc: "On first order over 4000฿",
  icon: Crown,
  color: "#A855F7",
  bgImage: "" // Сюда путь к картинке 800x300px
};

// ТЕХНИЧЕСКИЙ ТИКЕР (УСКОРЕННЫЙ)
const TECH_TICKER = [
  "14:20 — AMNESIA HAZE BACK IN STOCK",
  "Working today until 03:00 AM",
  "Updated Gold Grade: 3 new strains added",
  "Phuket Delivery: < 60 mins typical",
];

const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, ph: "@username or phone number" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, ph: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, ph: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, ph: "@username or phone number" },
];

const TYPE_SHORT: Record<string, string> = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };
const TYPE_COLORS: Record<string, string> = { "indica": "#A855F7", "sativa": "#FBBF24", "hybrid": "#2DD4BF" };

// --- STORE (Basket) ---
const useCart = create<any>()(persist((set, get) => ({
  items: [],
  addItem: (newItem) => set((state: any) => {
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
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
}), { name: "bnd-cart-v12" }));

// --- COMPONENTS ---
const BadgeIcon = ({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return (
      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
        <span className="text-[6px] font-black text-blue-400 leading-none">NEW</span>
      </div>
    );
    case "HIT": return <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30"><Flame size={10} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"><Percent size={10} className="text-emerald-400" /></div>;
    default: return null;
  }
};

const getInterpolatedPrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  if (weight <= 1) return prices[1] * weight;
  if (weight <= 5) return prices[1] + (prices[5] - prices[1]) * ((weight - 1) / 4);
  if (weight <= 10) return prices[5] + (prices[10] - prices[5]) * ((weight - 5) / 5);
  if (weight <= 20) return prices[10] + (prices[20] - prices[10]) * ((weight - 10) / 10);
  return (prices[20] / 20) * weight;
};

// --- MODAL: CHECKOUT ---
function CheckoutModal({ items, total, onClose }: { items: any[], total: number, onClose: () => void }) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const clearCart = useCart(s => s.clearCart);

  const handleSubmit = async () => {
    if (!contact) return alert("Введите данные для связи");
    setIsSending(true);
    const orderText = items.map(i => `${i.name} (${i.weight}) x${i.quantity}`).join(", ");
    try {
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ contact, method, orderText, total })
      });
      alert("Заказ успешно отправлен!");
      clearCart();
      onClose();
    } catch (error) {
      alert("Ошибка отправки. Попробуйте еще раз.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={20} className="text-white"/></button>
        <div className="text-center">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Оформление</h2>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] mt-1 text-white italic">Сумма: {total}฿</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CONTACT_METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30 text-white"}`}>
              <m.icon size={18} />
              <span className="text-[8px] font-black uppercase">{m.label}</span>
            </button>
          ))}
        </div>
        <input 
          type="text" 
          placeholder={CONTACT_METHODS.find(m => m.id === method)?.ph || "Контакт для связи"}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30"
        />
        <button onClick={handleSubmit} disabled={isSending} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-95 transition-all disabled:opacity-50">
          {isSending ? "Отправка..." : "Отправить заказ"}
        </button>
      </div>
    </div>
  );
}

// --- MODAL SHOP ---
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50"><X size={20}/></button>
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
        <div className="p-6 space-y-4 text-white">
          <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><MapPin size={10}/><span className="text-[7px] font-black uppercase">Farm</span></div><p className="text-[10px] font-bold italic truncate">{product.farm}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Leaf size={10}/><span className="text-[7px] font-black uppercase">Taste</span></div><p className="text-[10px] font-bold italic truncate">{product.taste}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Wind size={10}/><span className="text-[7px] font-black uppercase">Terps</span></div><p className="text-[10px] font-bold italic truncate">{product.terpenes}</p></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <div>
                 <div className="text-4xl font-black italic tracking-tighter text-white">{currentPrice}฿</div>
                 <div className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-1 text-white">Price per gram: {pricePerGram}฿</div>
               </div>
               <div className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full mb-1 text-white">{weight}g</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, 20].map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-2 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>
              ))}
            </div>
            <input type="range" min="1" max="20" step="1" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
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

// --- MAIN PAGE ---
export default function LandingPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false); 
  const { items, getTotal } = useCart();

  React.useEffect(() => {
    getProducts().then(data => setProducts(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      {/* HEADER SECTION */}
      <header className="flex flex-col items-center mb-12 relative">
        {/* BIG FLOATING LOGO */}
        <div className="relative w-32 h-32 mb-8 group">
           <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[45px] group-hover:bg-emerald-500/30 transition-all duration-1000"></div>
           <img src="/icon.png" alt="BND Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]" />
        </div>
        
        {/* SINGLE MAIN PROMO BANNER (v3.0) */}
        <div className="w-full max-w-4xl px-2 mb-4">
           <div 
             className="relative overflow-hidden rounded-[2.5rem] border border-white/10 p-8 min-h-[160px] flex flex-col justify-end transition-all active:scale-[0.98] shadow-inner"
             style={{ 
               backgroundColor: MAIN_PROMO.bgImage ? 'transparent' : 'rgba(255,255,255,0.03)',
               backgroundImage: MAIN_PROMO.bgImage ? `url(${MAIN_PROMO.bgImage})` : 'none',
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}
           >
              {/* Overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-0"></div>
              
              <div className="relative z-10 flex items-center gap-6 text-white">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md" style={{ backgroundColor: `${MAIN_PROMO.color}20` }}>
                  <MAIN_PROMO.icon size={24} style={{ color: MAIN_PROMO.color }} />
                </div>
                <div>
                   <h3 className="text-[18px] font-black uppercase tracking-tighter leading-none mb-1.5 italic">{MAIN_PROMO.title}</h3>
                   <p className="text-[11px] font-bold opacity-50 italic uppercase tracking-[0.15em]">{MAIN_PROMO.desc}</p>
                </div>
              </div>
           </div>
        </div>

        {/* ALIGNED & ACCELERATED TECH TICKER (v3.0) */}
        <div className="w-full max-w-4xl px-2 mb-10">
          <div className="bg-emerald-400/5 border border-white/5 rounded-2xl py-3 overflow-hidden shadow-inner">
            <div className="flex whitespace-nowrap animate-marquee_fast">
              {[...TECH_TICKER, ...TECH_TICKER, ...TECH_TICKER].map((text, i) => (
                <div key={i} className="flex items-center mx-3">
                  <Clock3 size={11} className="text-emerald-400 mr-2 opacity-50" />
                  <span className="text-[10px] font-bold uppercase italic tracking-widest text-emerald-400/80">{text}</span>
                  <span className="mx-6 text-white/5 opacity-20">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QUICK CATEGORIES */}
        <div className="flex gap-3 w-full max-w-md px-2">
          <button className="flex-1 flex gap-2 justify-center items-center bg-white/5 border border-white/10 py-5 rounded-2xl font-black uppercase italic text-[10px] tracking-[0.2em] opacity-40 cursor-not-allowed backdrop-blur-md text-white">
            <ShoppingBag size={14} /> Accessories
          </button>
          <button className="flex-1 flex gap-2 justify-center items-center bg-white/5 border border-white/10 py-5 rounded-2xl font-black uppercase italic text-[10px] tracking-[0.2em] opacity-40 cursor-not-allowed backdrop-blur-md text-white">
            <Zap size={14} /> Concentrates
          </button>
        </div>
      </header>

      {/* PRODUCT LIST */}
      <div className="max-w-4xl mx-auto space-y-8">
        {GRADES.map((grade) => {
          const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeItems.length === 0) return null;
          return (
            <div key={grade.id} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
              <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                <div><h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                <p className="text-[9px] font-black opacity-30 mt-1 uppercase tracking-widest flex items-center gap-1.5 text-white">{grade.prices.map((item, idx) => (<React.Fragment key={idx}><span>{item.w}g—{item.p}฿</span>{idx !== grade.prices.length - 1 && <span className="opacity-20 px-0.5">/</span>}</React.Fragment>))}</p></div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><grade.icon size={18} style={{ color: grade.color }} /></div>
              </div>
              <div className="divide-y divide-white/5">
                {gradeItems.map((p) => (
                  <div key={p.id} onClick={() => setSelectedProduct(p)} className="grid grid-cols-12 gap-2 px-6 py-5 items-center hover:bg-white/5 transition-all group cursor-pointer active:bg-white/10 text-white">
                    <div className="col-span-6 flex items-center gap-4 relative">
                      <div className="w-5 flex justify-center shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
                      <span className="text-[12px] font-black uppercase italic tracking-tight text-white/90 group-hover:text-white leading-tight">{p.name}</span>
                    </div>
                    <div className="col-span-2 text-center text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</div>
                    <div className="col-span-4 text-right text-[10px] font-bold opacity-30 italic truncate text-white">{p.farm}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING CART BUTTON */}
      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center group active:scale-95 transition-all border-4 border-[#193D2E]">
            <div className="flex items-center gap-4"><div className="bg-black/10 p-2 rounded-xl"><ShoppingBag size={20}/></div><div className="text-left"><p className="text-[10px] font-black uppercase tracking-widest leading-none">Order Now</p><p className="text-[16px] font-black italic">{getTotal()}฿ Total</p></div></div>
            <div className="bg-black/10 p-3 rounded-full group-hover:translate-x-1 transition-transform"><Send size={18}/></div>
          </button>
        </div>
      )}

      {selectedProduct && <ProductModal product={selectedProduct} style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }} onClose={() => setSelectedProduct(null)} />}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
      
      <div className="mt-20 pb-12 flex flex-col items-center gap-4 text-white/10"><div className="h-px w-16 bg-white/5"></div><p className="text-center text-[10px] font-black uppercase tracking-[0.5em] italic">БошкуНаДорожку • 2022</p></div>

      {/* УСКОРЕННАЯ АНИМАЦИЯ ДЛЯ ТИКЕРА */}
      <style jsx global>{`
        @keyframes marquee_fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); } // Теперь -33%, так как мы дублируем массив 3 раза для плотности
        }
        .animate-marquee_fast {
          animation: marquee_fast 12s linear infinite; // Ускорил с 30с до 12с
        }
      `}</style>
    </div>
  );
}
