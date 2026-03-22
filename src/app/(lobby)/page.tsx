"use client"
import * as React from "react"
import Link from "next/link"
import { 
  Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, ShoppingBag, Send, MessageCircle, Instagram, SendHorizontal, Info
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getProducts } from "@/lib/product"

// --- CONFIG ---
const GRADES = [
  { id: "silver", title: "SILVER GRADE", color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", color: "#FEC107", icon: Sparkles },
  { id: "premium", title: "PREMIUM GRADE", color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", color: "#A855F7", icon: Crown }
];
const STORIES = [
  { id: "new", label: "New Arrivals", icon: Sparkles, color: "#2DD4BF" },
  { id: "sale", label: "Gifts & Promos", icon: Percent, color: "#FEC107" },
  { id: "info", label: "Service Info", icon: Info, color: "#A855F7" },
];
const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, ph: "@username" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, ph: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, ph: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, ph: "@username" },
];
const TYPE_SHORT = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };
const TYPE_COLORS = { "indica": "#A855F7", "sativa": "#FBBF24", "hybrid": "#2DD4BF" };

// --- STORE (v12 - Updated with controls) ---
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

// --- COMPONENTS ---
function CheckoutModal({ items, total, onClose }) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { updateQuantity, removeItem, clearCart } = useCart();

  const handleSubmit = async () => {
    if (!contact) return alert("Enter contact info");
    setIsSending(true);
    const orderDetails = items.map(i => `[${(i.subcategory || 'Buds').toUpperCase()}] ${i.name} (${i.weight}) x${i.quantity} = ${i.price * i.quantity}฿`).join("\n");
    const finalMessage = `${orderDetails}\n\nTOTAL: ${total}฿`;
    try {
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ contact, method, orderText: finalMessage, total }) });
      alert("Order Sent!"); clearCart(); onClose();
    } catch (e) { alert("Error!"); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black uppercase italic text-white">Your Order</h2>
          <button onClick={onClose} className="p-2 opacity-30 hover:opacity-100 text-white"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {items.map((item) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase opacity-30 mb-1">{item.subcategory}</p>
                <p className="text-[12px] font-bold truncate text-white">{item.name}</p>
                <p className="text-[11px] font-black text-emerald-400 mt-1">{item.price * item.quantity}฿ <span className="text-white/20 ml-1">({item.weight})</span></p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-1 border border-white/5">
                <button onClick={() => updateQuantity(item.id, item.weight, -1)} className="w-7 h-7 flex items-center justify-center text-white/40">-</button>
                <span className="text-[12px] font-black text-white">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.weight, 1)} className="w-7 h-7 flex items-center justify-center text-white/40">+</button>
              </div>
              <button onClick={() => removeItem(item.id, item.weight)} className="p-2 text-red-400/50 hover:text-red-400"><X size={16}/></button>
            </div>
          ))}
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-black" : "bg-white/5 opacity-30 text-white"}`}><m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span></button>
            ))}
          </div>
          <input type="text" placeholder={CONTACT_METHODS.find(m => m.id === method)?.ph} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-[12px] font-bold outline-none focus:border-emerald-400 text-white" />
          <button onClick={handleSubmit} disabled={isSending} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl active:scale-95 disabled:opacity-50">{isSending ? "Sending..." : `Send Order • ${total}฿`}</button>
        </div>
      </div>
    </div>
  );
}

// Вспомогательные функции (StoryModal, ProductModal, BadgeIcon и т.д. остаются из твоего кода)
// [Здесь должны быть StoryModal, ProductModal, BadgeIcon, getInterpolatedPrice] - вставь их из своего page.tsx

export default function LandingPage() {
  const [products, setProducts] = React.useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [activeStory, setActiveStory] = React.useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false); 
  const { items, getTotal } = useCart();
  const total = getTotal();

  React.useEffect(() => { getProducts().then(data => setProducts(data)); }, []);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      {/* HEADER & STORIES — как у тебя */}
      
      {/* КНОПКИ КАТЕГОРИЙ */}
      <header className="flex flex-col items-center mb-10 pt-4">
        <div className="relative w-24 h-24 mb-10"><img src="/icon.png" className="w-full h-full relative z-10" /></div>
        <div className="flex gap-6 mb-10 overflow-x-auto w-full max-w-md px-4 no-scrollbar justify-center">
          {STORIES.map((s) => (
            <button key={s.id} onClick={() => setActiveStory(s)} className="flex flex-col items-center gap-3 shrink-0">
              <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center" style={{ borderColor: `${s.color}40` }}><s.icon size={22} style={{ color: s.color }} /></div>
              <span className="text-[9px] font-black uppercase opacity-60">{s.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full max-w-sm px-2">
          <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 font-black uppercase text-[9px] tracking-widest opacity-30 italic">Accessories</button>
          <Link href="/concentrates" className="flex-1 py-4 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/30 font-black uppercase text-[9px] tracking-widest text-[#a855f7] italic flex items-center justify-center gap-2 active:scale-95">
            <Flame size={12} /> Concentrates
          </Link>
        </div>
      </header>

      {/* ТАБЛИЦА ТОВАРОВ — как у тебя */}
      <div className="max-w-4xl mx-auto space-y-8">
        {GRADES.map((grade) => {
          const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeItems.length === 0) return null;
          return (
            <div key={grade.id} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 shadow-xl">
              <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><grade.icon size={18} style={{ color: grade.color }} /></div>
              </div>
              <div className="divide-y divide-white/5">
                {gradeItems.map((p) => (
                  <div key={p.id} onClick={() => setSelectedProduct(p)} className="grid grid-cols-12 gap-2 px-6 py-5 items-center cursor-pointer active:bg-white/10">
                    <div className="col-span-6 flex items-center gap-4"><BadgeIcon type={p.badge} /><span className="text-[12px] font-black uppercase italic text-white/90">{p.name}</span></div>
                    <div className="col-span-2 text-center text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</div>
                    <div className="col-span-4 text-right text-[10px] font-bold opacity-30 truncate">{p.farm}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ПЛАВАЮЩАЯ КОРЗИНА */}
      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E] active:scale-95 transition-all">
            <div className="flex items-center gap-4 text-left"><ShoppingBag size={22}/><div><p className="text-[10px] font-black uppercase leading-none">Order Now</p><p className="text-[18px] font-black italic mt-1">{total}฿ Total</p></div></div>
            <Send size={20}/>
          </button>
        </div>
      )}

      {activeStory && <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />}
      {selectedProduct && <ProductModal product={selectedProduct} style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }} onClose={() => setSelectedProduct(null)} />}
      {isCheckoutOpen && <CheckoutModal items={items} total={total} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
