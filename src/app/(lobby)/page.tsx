"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { 
  LayoutGrid, Zap, Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, TrendingDown, ShoppingBag, Send, MessageCircle, Instagram, SendHorizontal
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG ---
const GRADES = [
  { id: "silver", title: "SILVER GRADE", prices: [ {w:1, p:150}, {w:5, p:700}, {w:10, p:1200}, {w:20, p:2000} ], color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", prices: [ {w:1, p:250}, {w:5, p:1100}, {w:10, p:1700}, {w:20, p:3000} ], color: "#FEC107", icon: Sparkles },
  { id: "premium", title: "PREMIUM GRADE", prices: [ {w:1, p:300}, {w:5, p:1300}, {w:10, p:2000}, {w:20, p:3500} ], color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", prices: [ {w:1, p:350}, {w:5, p:1500}, {w:10, p:2500}, {w:20, p:4000} ], color: "#A855F7", icon: Crown }
];

const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "line", label: "Line", icon: MessageCircle },
  { id: "instagram", label: "Instagram", icon: Instagram },
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

// --- COMPONENTS ---
const BadgeIcon = ({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30"><Sparkles size={10} className="text-blue-400" /></div>;
    case "HIT": return <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30"><Flame size={10} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"><Percent size={10} className="text-emerald-400" /></div>;
    default: return null;
  }
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
    const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec"; // ВСТАВЬ СЮДА СВОЙ URL

    try {
      await fetch(GOOGLE_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ contact, method, orderText, total })
      });
      alert("Заказ отправлен! Мы свяжемся с вами.");
      clearCart();
      onClose();
    } catch (e) {
      alert("Ошибка. Попробуйте снова.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 p-8 space-y-6" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Оформление</h2>
          <p className="text-[10px] font-bold opacity-30 mt-1 uppercase italic tracking-widest">{total}฿ Total</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CONTACT_METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30"}`}>
              <m.icon size={18} />
              <span className="text-[8px] font-black uppercase">{m.label}</span>
            </button>
          ))}
        </div>
        <input 
          type="text" 
          placeholder={method === "telegram" ? "@username или номер" : "Ваш контакт"}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white"
        />
        <button onClick={handleSubmit} disabled={isSending} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-95 transition-all">
          {isSending ? "Отправка..." : "Заказать"}
        </button>
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
        <div className="flex gap-3 w-full max-sm:flex-col sm:max-w-sm">
          <button className="flex-1 flex gap-2 justify-center items-center bg-white/5 border border-white/10 text-white/20 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest cursor-default">
            <LayoutGrid size={14} /> Full Menu
          </button>
          <button className="flex-1 flex gap-2 justify-center items-center bg-white/5 border border-white/10 text-white/10 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest cursor-default">
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
                    <div className="col-span-6 flex items-center gap-4">
                      {p.badge && <BadgeIcon type={p.badge} />}
                      <span className="text-[12px] font-black uppercase italic text-white/90">{p.name}</span>
                    </div>
                    <div className="col-span-2 text-center text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</div>
                    <div className="col-span-4 text-right text-[10px] font-bold opacity-30 italic">{p.farm}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E]">
            <div className="flex items-center gap-4">
               <ShoppingBag size={20}/>
               <div className="text-left"><p className="text-[10px] font-black uppercase">Оформить заказ</p><p className="text-[16px] font-black italic">{getTotal()}฿</p></div>
            </div>
            <Send size={18}/>
          </button>
        </div>
      )}

      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
