"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { ShoppingCart, X, Trash2, ArrowRight, Filter } from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG ---
const GRADE_STYLES: Record<string, any> = {
  "silver": { color: "#C1C1C1", bg: "bg-white/5", border: "border-white/10" },
  "golden": { color: "#FEC107", bg: "bg-[#FEC107]/5", border: "border-[#FEC107]/20" },
  "premium": { color: "#34D399", bg: "bg-[#34D399]/10", border: "border-[#34D399]/20" },
  "selected premium": { color: "#A855F7", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" },
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

// --- CARD COMPONENT ---
function ProductCard({ product }: { product: any }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  
  const subcat = String(product.subcategory || "").toLowerCase().trim();
  const isBuds = String(product.category || "").toLowerCase().trim() === "buds";
  const style = isBuds ? (GRADE_STYLES[subcat] || GRADE_STYLES["premium"]) : { color: "#FFF", bg: "bg-white/5", border: "border-white/10" };
  const currentPrice = isBuds ? getInterpolatedPrice(weight, product.prices) : (Number(product.price) || 0);

  return (
    <div className={`relative flex flex-col rounded-[1.5rem] md:rounded-[2.5rem] border p-3 md:p-6 backdrop-blur-3xl transition-all ${style.bg} ${style.border}`}>
      <div className="aspect-square relative overflow-hidden rounded-[1rem] md:rounded-[2rem] bg-black/40 mb-3 md:mb-6 border border-white/5 shadow-inner">
        <img 
          src={product.image?.startsWith('http') ? product.image : `/images/${product.image}`} 
          alt="" className="w-full h-full object-contain" 
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.webp' }}
        />
      </div>
      <div className="flex-1 space-y-2 md:space-y-4">
        <div className="flex justify-between items-start gap-1">
          <h3 className="font-bold text-white/90 text-xs md:text-lg uppercase italic tracking-tight line-clamp-1">{product.name}</h3>
          <span className="text-[7px] md:text-[9px] font-black uppercase text-white/40 border border-white/10 px-1.5 py-0.5 rounded-full shrink-0">
            {product.type || 'Top'}
          </span>
        </div>
        <div className="text-xl md:text-4xl font-black italic tracking-tighter" style={{ color: style.color }}>{currentPrice}฿</div>
        
        {isBuds && (
          <div className="space-y-2 md:space-y-4 pt-1">
            <div className="flex justify-between items-end"><span className="text-[8px] md:text-[10px] font-black uppercase opacity-20">Weight</span><span className="text-xs md:text-xl font-black italic">{weight}g</span></div>
            <input type="range" min="0.5" max="20" step="0.5" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
          </div>
        )}
      </div>
      <button 
        onClick={() => { addItem({ ...product, price: currentPrice, weight: isBuds ? `${weight}g` : '1pc' }); setIsAdded(true); setTimeout(() => setIsAdded(false), 1000); }}
        className="w-full mt-3 md:mt-6 py-3 md:py-5 rounded-[1rem] md:rounded-[1.5rem] font-black uppercase text-[9px] md:text-[11px] tracking-widest transition-all active:scale-95 border border-white/10"
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
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]); // Мульти-фильтр
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  React.useEffect(() => {
    getProducts().then(data => { if (data && data.length > 0) setProducts(data); });
  }, []);

  // Логика переключения типа (добавить/удалить из массива)
  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const filteredProducts = products.filter(p => {
    const matchCat = String(p.category || "").toLowerCase() === activeCategory.toLowerCase();
    const matchSub = activeSubcat === "All Grades" || String(p.subcategory || "").toLowerCase() === activeSubcat.toLowerCase();
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(String(p.type || "").toLowerCase().trim());
    return matchCat && matchSub && matchType;
  });

  if (view === "landing") {
    return (
      <div className="fixed inset-0 bg-[#193D2E] flex flex-col items-center justify-center p-8">
        <div className="w-40 h-40 md:w-52 md:h-52 mb-12 flex items-center justify-center bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl shadow-2xl">
           <span className="text-5xl md:text-7xl font-black italic text-white tracking-tighter">BND</span>
        </div>
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          {["Buds", "Accessories"].map((cat) => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setView("shop"); }} className="group flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] hover:bg-white hover:text-[#193D2E] transition-all active:scale-95">
              <span className="text-xl md:text-2xl font-black uppercase italic tracking-widest">{cat === "Accessories" ? "Gear" : cat}</span>
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
      <header className="sticky top-0 z-50 bg-[#193D2E]/80 backdrop-blur-xl p-4 md:p-6 border-b border-white/5 flex justify-between items-center px-6 md:px-8">
        <button onClick={() => setView("landing")} className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 font-black uppercase italic text-[8px] md:text-[10px]">Back</button>
        <span className="text-xl md:text-2xl font-black italic tracking-tighter">BND</span>
        <button onClick={() => setIsCartOpen(true)} className="p-3 bg-white/5 rounded-xl border border-white/10 relative">
          <ShoppingCart size={20} />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">!</div>
        </button>
      </header>

      {/* ФИЛЬТР ГРЕЙДОВ (Scrollable) */}
      <div className="p-4 overflow-x-auto flex gap-2 no-scrollbar bg-black/10 border-b border-white/5">
        {["All Grades", "Silver", "Golden", "Premium", "Selected Premium"].map(sub => (
          <button key={sub} onClick={() => setActiveSubcat(sub)} className={`px-5 py-2.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase flex-shrink-0 transition-all ${activeSubcat === sub ? "bg-white text-black" : "bg-white/5 text-white/30"}`}>{sub}</button>
        ))}
      </div>

      {/* МУЛЬТИ-ФИЛЬТР TYPE (Indica/Sativa/Hybrid) */}
      {activeCategory === "Buds" && (
        <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar">
          {["indica", "sativa", "hybrid"].map(type => (
            <button 
              key={type} onClick={() => toggleType(type)}
              className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${selectedTypes.includes(type) ? "bg-emerald-400 border-emerald-400 text-black" : "bg-white/5 border-white/10 text-white/40"}`}
            >
              {type}
            </button>
          ))}
          {selectedTypes.length > 0 && (
            <button onClick={() => setSelectedTypes([])} className="px-4 py-2 text-[8px] font-black uppercase text-red-400">Reset</button>
          )}
        </div>
      )}

      {/* СЕТКА ТОВАРОВ: 2 в ряд на мобилке, 3 на планшете, 4 на десктопе */}
      <div className="p-4 md:p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-10 max-w-7xl mx-auto">
        {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      
      {/* КАРТИНКА ПУСТОТЫ */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-40 opacity-10 italic uppercase text-[10px] tracking-widest">No matches found</div>
      )}
    </div>
  );
}
