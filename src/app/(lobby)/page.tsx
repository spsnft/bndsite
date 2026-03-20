"use client"
import * as React from "react"
import Link from "next/link"
import { getProducts } from "@/lib/product" 
import { 
  LayoutGrid, Zap, Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, TrendingDown, ShoppingBag, Send, MessageCircle, Instagram, SendHorizontal
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

const PROMOS = [
  { id: 1, title: "Free Delivery", desc: "On orders over 3000฿", icon: Zap, color: "#34D399" },
  { id: 2, title: "First Order", desc: "Get 10% off with code BND24", icon: Sparkles, color: "#FEC107" },
  { id: 3, title: "Fast Shipping", desc: "Under 60 mins in Phuket", icon: Flame, color: "#FB7185" },
];

const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, placeholder: "@username or phone number" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, placeholder: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, placeholder: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, placeholder: "@username or phone number" },
];

const TYPE_SHORT: Record<string, string> = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };
const TYPE_COLORS: Record<string, string> = { "indica": "#A855F7", "sativa": "#FBBF24", "hybrid": "#2DD4BF" };

// --- STORE ---
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
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
}), { name: "bnd-cart-v12" }));

// --- HELPERS ---
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
  const [methodId, setMethodId] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const clearCart = useCart(s => s.clearCart);

  const currentMethod = CONTACT_METHODS.find(m => m.id === methodId);

  const handleSubmit = async () => {
    if (!contact) return alert("Please enter your contact info");
    setIsSending(true);
    const orderText = items.map(i => `${i.name} (${i.weight}) x${i.quantity}`).join(", ");
    const GOOGLE_URL = "YOUR_APPS_SCRIPT_URL"; 

    try {
      await fetch(GOOGLE_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ contact, method: methodId, orderText, total })
      });
      alert("Order sent! We will contact you shortly.");
      clearCart();
      onClose();
    } catch (e) {
      alert("Error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 p-8 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 opacity-30 hover:opacity-100 transition-opacity text-white"><X size={20}/></button>
        <div className="text-center">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Checkout</h2>
          <p className="text-[10px] font-bold opacity-30 mt-1 uppercase tracking-widest text-white italic">Total: {total}฿</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CONTACT_METHODS.map(m => (
            <button key={m.id} onClick={() => setMethodId(m.id)} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${methodId === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30 text-white"}`}>
              <m.icon size={18} />
              <span className="text-[8px] font-black uppercase">{m.label}</span>
            </button>
          ))}
        </div>
        <input 
          type="text" 
          placeholder={currentMethod?.placeholder}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white"
        />
        <button onClick={handleSubmit} disabled={isSending} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl active:scale-95 transition-all">
          {isSending ? "Sending..." : "Submit Order"}
        </button>
      </div>
    </div>
  );
}

// --- MODAL: PRODUCT ---
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
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent text-white">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                <span style={{ color: typeColor }}>{product.type}</span>
                <span className="mx-2 opacity-20">•</span>
                <span style={{ color: style.color }}>{product.subcategory} Grade</span>
             </p>
          </div>
        </div>
        <div className="p-8 space-y-8 text-white"> {/* Increased space-y */}
          <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-6">
             <div className="space-y-1"><span className="text-[7px] font-black uppercase opacity-20">Farm</span><p className="text-[10px] font-bold italic truncate">{product.farm}</p></div>
             <div className="space-y-1"><span className="text-[7px] font-black uppercase opacity-20">Taste</span><p className="text-[10px] font-bold italic truncate">{product.taste}</p></div>
             <div className="space-y-1"><span className="text-[7px] font-black uppercase opacity-20">Terps</span><p className="text-[10px] font-bold italic truncate">{product.terpenes}</p></div>
          </div>
          <div className="space-y-6"> {/* Increased inner spacing */}
            <div className="flex justify-between items-end">
               <div>
                 <div className="text-5xl font-black italic tracking-tighter">{currentPrice}฿</div>
                 <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-1">Price per gram: {pricePerGram}฿</div>
               </div>
               <div className="text-[12px] font-black uppercase bg-white/10 px-4 py-1.5 rounded-full mb-1">{weight}g</div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 5, 10, 20].map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-3 text-[11px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>
              ))}
            </div>
            {/* BIGGER SLIDER */}
            <input type="range" min="1" max="20" step="1" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            
            {tip && (
              <div className="flex items-center gap-2 py-3 px-5 bg-emerald-400/5 rounded-xl border border-emerald-400/10">
                <TrendingDown size={14} className="text-emerald-400" />
                <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-tight italic">Add {(tip.next - weight).toFixed(0)}g more for {tip.p}฿ per gram!</p>
              </div>
            )}
            
            {/* BIGGER BUTTON */}
            <button 
              onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }}
              className={`w-full py-6 rounded-[2rem] font-black uppercase text-[13px] tracking-[0.25em] transition-all shadow-2xl active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}>
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
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 mb-6 relative"><img src="/icon.png" className="w-full h-full object-contain relative z-10" /></div>
        <div className="w-full max-w-4xl overflow-x-auto no-scrollbar flex gap-4 pb-8 px-2">
           {PROMOS.map(p => (
             <div key={p.id} className="min-w-[260px] p-5 bg-white/5 border border-white/10 rounded-3xl flex items-start gap-4">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: `${p.color}20` }}><p.icon size={20} style={{ color: p.color }} /></div>
                <div><h4 className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{p.title}</h4><p className="text-[10px] font-bold opacity-30 italic">{p.desc}</p></div>
             </div>
           ))}
        </div>
        <div className="flex gap-3 w-full max-sm:flex-col sm:max-w-sm">
          <button className="flex-1 flex gap-2 justify-center items-center bg-white text-[#193D2E] py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest">
            <LayoutGrid size={14} /> Full Menu
          </button>
          <button className="flex-1 flex gap-2 justify-center items-center bg-white/5 border border-white/10 text-white/20 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest cursor-default">
            <Zap size={14} /> Concentrates
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {GRADES.map((grade) => {
          const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeItems.length === 0) return null;
          return (
            <div key={grade.id} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
              <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                <grade.icon size={18} style={{ color: grade.color }} />
              </div>
              <div className="divide-y divide-white/5">
                {gradeItems.map((p) => (
                  <div key={p.id} onClick={() => setSelectedProduct(p)} className="grid grid-cols-12 gap-2 px-6 py-5 items-center hover:bg-white/5 transition-all cursor-pointer">
                    <div className="col-span-6 flex items-center gap-4 text-white/90 font-black uppercase italic text-[12px]">{p.name}</div>
                    <div className="col-span-2 text-center text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</div>
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
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E] active:scale-95 transition-all">
            <div className="flex items-center gap-4">
               <div className="bg-black/10 p-2 rounded-xl"><ShoppingBag size={20}/></div>
               <div className="text-left"><p className="text-[10px] font-black uppercase tracking-widest leading-none">Checkout</p><p className="text-[16px] font-black italic">{getTotal()}฿</p></div>
            </div>
            <Send size={18}/>
          </button>
        </div>
      )}

      {selectedProduct && <ProductModal product={selectedProduct} style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }} onClose={() => setSelectedProduct(null)} />}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
