"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG ---
const GRADE_STYLES: Record<string, any> = {
  "silver": { color: "#C1C1C1", bg: "bg-white/5", border: "border-white/10" },
  "golden": { color: "#FEC107", bg: "bg-[#FEC107]/5", border: "border-[#FEC107]/20" },
  "premium": { color: "#34D399", bg: "bg-[#34D399]/10", border: "border-[#34D399]/20" },
  "selected": { color: "#A855F7", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" },
};

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

// --- STORE ---
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

// --- CARD COMPONENT (ULTRA COMPACT) ---
function ProductCard({ product }: { product: any }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  
  const subcat = String(product.subcategory || "").toLowerCase().trim();
  const isBuds = String(product.category || "").toLowerCase().trim() === "buds";
  const style = isBuds ? (GRADE_STYLES[subcat] || GRADE_STYLES["premium"]) : { color: "#FFF", bg: "bg-white/5", border: "border-white/10" };
  const currentPrice = isBuds ? getInterpolatedPrice(weight, product.prices) : (Number(product.price) || 0);

  return (
    <div className={`relative flex flex-col rounded-[1rem] md:rounded-[2.5rem] border p-2 md:p-6 backdrop-blur-3xl transition-all ${style.bg} ${style.border}`}>
      <div className="aspect-square relative overflow-hidden rounded-[0.7rem] md:rounded-[2rem] bg-black/40 mb-2 md:mb-6 border border-white/5">
        <img 
          src={product.image?.startsWith('http') ? product.image : `/images/${product.image}`} 
          alt="" className="w-full h-full object-contain" 
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.webp' }}
        />
      </div>
      <div className="flex-1 space-y-1 md:space-y-4">
        <h3 className="font-bold text-white/90 text-[9px] md:text-lg uppercase italic line-clamp-1">{product.name}</h3>
        <div className="text-sm md:text-4xl font-black italic" style={{ color: style.color }}>{currentPrice}฿</div>
        
        {isBuds && (
          <div className="space-y-1 md:space-y-4">
            <div className="flex justify-between items-end"><span className="text-[7px] md:text-[10px] opacity-20 uppercase font-black">Wt</span><span className="text-[10px] md:text-xl font-black">{weight}g</span></div>
            <input type="range" min="0.5" max="20" step="0.5" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
          </div>
        )}
      </div>
      <button 
        onClick={() => { addItem({ ...product, price: currentPrice, weight: isBuds ? `${weight}g` : '1pc' }); setIsAdded(true); setTimeout(() => setIsAdded(false), 1000); }}
        className="w-full mt-2 md:mt-6 py-2 md:py-5 rounded-[0.6rem] md:rounded-[1.5rem] font-black uppercase text-[8px] md:text-[11px] transition-all active:scale-95 border border-white/10"
        style={{ backgroundColor: isAdded ? '#34D399' : style.color, color: '#000' }}>
        {isAdded ? "Added" : "Add"}
      </button>
    </div>
  );
}

export default function IndexPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [view, setView] = React.useState<"landing" | "shop">("landing");
  const [activeCategory, setActiveCategory] = React.useState("Buds");
  const [activeSubcat, setActiveSubcat] = React.useState("All Grades");
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [tgUser, setTgUser] = React.useState("");

  const { items, removeItem, clearCart } = useCart();
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  React.useEffect(() => {
    getProducts().then(data => { if (data && data.length > 0) setProducts(data); });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = String(p.category || "").toLowerCase() === activeCategory.toLowerCase();
    const matchSub = activeSubcat === "All Grades" || String(p.subcategory || "").toLowerCase() === activeSubcat.toLowerCase();
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(String(p.type || "").toLowerCase().trim());
    return matchCat && matchSub && matchType;
  });

  if (view === "landing") {
    return (
      <div className="fixed inset-0 bg-[#193D2E] flex flex-col items-center justify-center p-8">
        <div className="w-40 h-40 mb-12 flex items-center justify-center bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl shadow-2xl">
           <span className="text-5xl font-black italic text-white tracking-tighter">BND</span>
        </div>
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          {["Buds", "Accessories"].map((cat) => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setView("shop"); }} className="group flex justify-between items-center bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white hover:text-[#193D2E] transition-all">
              <span className="text-xl font-black uppercase italic tracking-widest">{cat === "Accessories" ? "Gear" : cat}</span>
              <ArrowRight size={24} className="opacity-20 group-hover:opacity-100 transition-all" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#193D2E] text-white pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#193D2E]/80 backdrop-blur-xl p-4 border-b border-white/5 flex justify-between items-center px-6">
        <button onClick={() => setView("landing")} className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 font-black uppercase text-[8px]">Back</button>
        <span className="text-xl font-black italic tracking-tighter">BND</span>
        <button 
          onClick={() => setIsCartOpen(true)} // Кнопка открытия корзины
          className="p-3 bg-white/5 rounded-xl border border-white/10 relative active:scale-95 transition-all"
        >
          <ShoppingCart size={20} />
          {items.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">{items.length}</span>}
        </button>
      </header>

      {/* ГРЕЙДЫ (Selected без Premium) */}
      <div className="p-4 overflow-x-auto flex gap-2 no-scrollbar bg-black/10 border-b border-white/5">
        {["All Grades", "Silver", "Golden", "Premium", "Selected"].map(sub => (
          <button key={sub} onClick={() => setActiveSubcat(sub)} className={`px-5 py-2.5 rounded-xl text-[8px] font-black uppercase flex-shrink-0 transition-all ${activeSubcat === sub ? "bg-white text-black" : "bg-white/5 text-white/30"}`}>{sub}</button>
        ))}
      </div>

      {/* ТИПЫ */}
      {activeCategory === "Buds" && (
        <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar">
          {["indica", "sativa", "hybrid"].map(t => (
            <button key={t} onClick={() => setSelectedTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${selectedTypes.includes(t) ? "bg-emerald-400 border-emerald-400 text-black" : "bg-white/5 border-white/10 text-white/40"}`}>{t}</button>
          ))}
        </div>
      )}

      {/* СЕТКА: 3 В РЯД НА МОБИЛКЕ */}
      <div className="p-2 md:p-10 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-10 max-w-7xl mx-auto">
        {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* МОДАЛКА КОРЗИНЫ */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex justify-end" onClick={() => setIsCartOpen(false)}>
          <div className="h-full w-full max-w-md bg-[#193D2E] border-l border-white/10 p-8 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black uppercase italic">My Cart</h2><button onClick={() => setIsCartOpen(false)}><X size={32}/></button></div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {items.map(i => (
                <div key={`${i.id}-${i.weight}`} className="flex gap-4 p-4 bg-white/5 rounded-2xl items-center border border-white/5">
                  <div className="flex-1 text-left"><p className="font-black uppercase italic text-sm">{i.name}</p><p className="text-[10px] opacity-30">{i.weight} • {i.price * i.quantity}฿</p></div>
                  <button onClick={() => removeItem(i.id, i.weight)} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-white/10 space-y-4">
              <input type="text" placeholder="@Username" value={tgUser} onChange={(e) => setTgUser(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none" />
              <div className="flex justify-between items-end py-4"><span className="text-[10px] uppercase opacity-20">Total</span><span className="text-5xl font-black italic">{totalPrice}฿</span></div>
              <button disabled={totalPrice === 0 || !tgUser} className="w-full py-6 bg-white text-[#193D2E] rounded-full font-black uppercase italic shadow-2xl disabled:opacity-20 transition-all">Send Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
