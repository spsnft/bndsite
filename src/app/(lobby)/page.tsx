"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { 
  ShoppingCart, X, Trash2, ArrowRight
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG & STYLES ---
const TG_TOKEN = process.env.NEXT_PUBLIC_TG_TOKEN;
const TG_CHAT_ID = process.env.NEXT_PUBLIC_TG_CHAT_ID;

const GRADE_STYLES: Record<string, any> = {
  "silver": { color: "#C1C1C1", bg: "bg-white/5", border: "border-white/10" },
  "golden": { color: "#FEC107", bg: "bg-[#FEC107]/5", border: "border-[#FEC107]/20" },
  "premium": { color: "#34D399", bg: "bg-[#34D399]/10", border: "border-[#34D399]/20" },
  "selected premium": { color: "#A855F7", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" },
};

// --- PRICE CALCULATION (INTERPOLATION) ---
const getInterpolatedPrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  let price = 0;
  if (weight <= 1) price = prices[1] * weight;
  else if (weight <= 5) price = prices[1] + (prices[5] - prices[1]) * ((weight - 1) / 4);
  else if (weight <= 10) price = prices[5] + (prices[10] - prices[5]) * ((weight - 5) / 5);
  else if (weight <= 20) price = prices[10] + (prices[20] - prices[10]) * ((weight - 10) / 10);
  else price = (prices[20] / 20) * weight;
  return Math.round(price);
};

// --- STATE STORE ---
interface CartStore {
  items: any[];
  addItem: (item: any) => void;
  removeItem: (id: string, weight: any) => void;
  clearCart: () => void;
}
const useCart = create<CartStore>()(persist((set) => ({
  items: [],
  addItem: (newItem) => set((state) => {
    const ex = state.items.findIndex(i => i.id === newItem.id && i.weight === newItem.weight);
    if (ex > -1) {
      const newItems = [...state.items];
      newItems[ex].quantity += 1;
      return { items: newItems };
    }
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),
  removeItem: (id, weight) => set((state) => ({
    items: state.items.filter(i => !(i.id === id && i.weight === weight))
  })),
  clearCart: () => set({ items: [] })
}), { name: "bnd-cart-v8" }));

// --- COMPONENTS ---
function ProductCard({ product }: { product: any }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  
  const subcat = String(product.subcategory || "").toLowerCase().trim();
  const isBuds = String(product.category || "").toLowerCase().trim() === "buds";
  const style = isBuds ? (GRADE_STYLES[subcat] || GRADE_STYLES["premium"]) : { color: "#FFF", bg: "bg-white/5", border: "border-white/10" };
  
  const currentPrice = isBuds 
    ? getInterpolatedPrice(weight, product.prices) 
    : (Number(product.price) || 0);

  return (
    <div className={`relative flex flex-col rounded-[2.5rem] border p-6 backdrop-blur-3xl transition-all ${style.bg} ${style.border}`}>
      <div className="aspect-square relative overflow-hidden rounded-[2rem] bg-black/40 mb-6 border border-white/5 shadow-inner">
        <img 
          src={product.image?.startsWith('http') ? product.image : `/images/${product.image}`} 
          alt="" 
          className="w-full h-full object-contain" 
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.webp' }}
        />
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white/90 text-lg uppercase italic tracking-tight">{product.name}</h3>
          <span className="text-[9px] font-black uppercase text-white/40 border border-white/10 px-2 py-1 rounded-full">
            {product.type || (isBuds ? 'Top' : 'Gear')}
          </span>
        </div>
        <div className="text-4xl font-black italic tracking-tighter" style={{ color: style.color }}>{currentPrice}฿</div>
        
        {isBuds && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase opacity-20">Weight</span>
              <span className="text-xl font-black italic">{weight}g</span>
            </div>
            <input 
              type="range" min="0.5" max="20" step="0.5" value={weight} 
              onChange={(e) => setWeight(parseFloat(e.target.value))} 
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" 
            />
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, 20].map(v => (
                <button 
                  key={v} onClick={() => setWeight(v)} 
                  className={`py-2 text-[10px] font-black rounded-lg border transition-all ${weight === v ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "border-white/10 text-white/30 bg-white/5"}`}
                >
                  {v}g
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <button 
        onClick={() => { 
          addItem({ ...product, price: currentPrice, weight: isBuds ? `${weight}g` : '1pc' }); 
          setIsAdded(true); 
          setTimeout(() => setIsAdded(false), 1000); 
        }}
        className="w-full mt-6 py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest transition-all shadow-xl active:scale-95 border border-white/10"
        style={{ backgroundColor: isAdded ? '#34D399' : style.color, color: '#000' }}
      >
        {isAdded ? "Added" : "Add to Cart"}
      </button>
    </div>
  );
}

export default function IndexPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [view, setView] = React.useState<"landing" | "shop">("landing");
  const [activeCategory, setActiveCategory] = React.useState("Buds");
  const [activeSubcat, setActiveSubcat] = React.useState("All Grades");
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [tgUser, setTgUser] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const { items, removeItem, clearCart } = useCart();
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  React.useEffect(() => {
    getProducts().then(data => {
      if (data && data.length > 0) setProducts(data);
    });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = String(p.category || "").toLowerCase() === activeCategory.toLowerCase();
    const matchSub = activeSubcat === "All Grades" || String(p.subcategory || "").toLowerCase() === activeSubcat.toLowerCase();
    return matchCat && matchSub;
  });

  const handleSendOrder = async () => {
    const message = `🚀 *NEW ORDER*\n\n👤 TG: ${tgUser || "—"}\n📞 Phone: ${phone || "—"}\n\n🛒 *Items:*\n${items.map(i => `• ${i.name} (${i.weight}) x${i.quantity}`).join('\n')}\n\n💰 *TOTAL: ${totalPrice}฿*`;
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: message, parse_mode: "Markdown" })
    });
    clearCart(); setIsCartOpen(false);
  };

  if (view === "landing") {
    return (
      <div className="fixed inset-0 bg-[#193D2E] flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="w-52 h-52 mb-16 flex items-center justify-center bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl shadow-2xl">
           <span className="text-7xl font-black italic text-white tracking-tighter">BND</span>
        </div>
        <div className="grid grid-cols-1 gap-6 w-full max-w-sm relative z-10">
          {["Buds", "Accessories"].map((cat) => (
            <button 
              key={cat} onClick={() => { setActiveCategory(cat); setView("shop"); window.scrollTo(0,0); }} 
              className="group flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] hover:bg-white hover:text-[#193D2E] transition-all shadow-2xl active:scale-95"
            >
              <span className="text-2xl font-black uppercase italic tracking-widest">{cat === "Accessories" ? "Gear" : cat}</span>
              <ArrowRight size={28} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-3 transition-all" />
            </button>
          ))}
        </div>
        <p className="mt-20 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Premium Delivery Service</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#193D2E] text-white pb-32">
      <header className="sticky top-0 z-50 bg-[#193D2E]/80 backdrop-blur-xl p-6 border-b border-white/5 flex justify-between items-center px-8">
        <button onClick={() => setView("landing")} className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-xl border border-white/10 font-black uppercase italic text-[10px] active:scale-95 transition-all">Back</button>
        <span className="text-2xl font-black italic tracking-tighter">BND</span>
        <button onClick={() => setIsCartOpen(true)} className="relative p-4 bg-white/5 rounded-xl border border-white/10 active:scale-95 transition-all">
          <ShoppingCart size={22} />
          {items.length > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.5)]">{items.length}</span>}
        </button>
      </header>

      <div className="p-6 overflow-x-auto flex gap-3 no-scrollbar bg-black/10 border-b border-white/5">
        {["All Grades", "Silver", "Golden", "Premium", "Selected Premium"].map(sub => (
          <button 
            key={sub} onClick={() => setActiveSubcat(sub)} 
            className={`px-7 py-3 rounded-xl text-[10px] font-black uppercase flex-shrink-0 transition-all ${activeSubcat === sub ? "bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.2)]" : "bg-white/5 text-white/30"}`}
          >
            {sub}
          </button>
        ))}
      </div>

      <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {filteredProducts.map(p => <ProductCard key={`${p.id}-${p.subcategory}`} product={p} />)}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-32 space-y-4 opacity-20 italic">
            <p className="text-lg">Connecting to database...</p>
            <p className="text-[10px] uppercase tracking-widest">Check if your spreadsheet is public</p>
          </div>
        )}
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex justify-end" onClick={() => setIsCartOpen(false)}>
          <div className="h-full w-full max-w-md bg-[#193D2E] border-l border-white/10 p-12 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">My Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={32}/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar">
              {items.map(i => (
                <div key={`${i.id}-${i.weight}`} className="flex gap-5 p-6 bg-white/5 rounded-[2.5rem] items-center border border-white/5 group shadow-xl backdrop-blur-md">
                  <div className="flex-1 text-left">
                    <p className="font-black uppercase italic text-base text-white/90">{i.name}</p>
                    <p className="text-[11px] font-bold opacity-30 tracking-widest">{i.weight} • {i.price * i.quantity}฿</p>
                  </div>
                  <button onClick={() => removeItem(i.id, i.weight)} className="p-5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"><Trash2 size={20}/></button>
                </div>
              ))}
              {items.length === 0 && <p className="text-center py-20 opacity-20 italic tracking-widest uppercase text-[11px]">Cart is empty</p>}
            </div>
            <div className="pt-10 border-t border-white/10 space-y-4">
              <input 
                type="text" placeholder="@Telegram Username" value={tgUser} 
                onChange={(e) => setTgUser(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-bold outline-none focus:border-emerald-400 focus:bg-white/10 transition-all" 
              />
              <div className="flex justify-between items-end py-8 px-4">
                <span className="text-[12px] font-black uppercase opacity-20 tracking-widest italic">Total Payment</span>
                <span className="text-7xl font-black italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{totalPrice}฿</span>
              </div>
              <button 
                onClick={handleSendOrder} disabled={totalPrice === 0 || !tgUser} 
                className="w-full py-10 bg-white text-[#193D2E] rounded-[3rem] font-black uppercase italic tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-20 transition-all border border-white/10 text-sm"
              >
                Send Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
