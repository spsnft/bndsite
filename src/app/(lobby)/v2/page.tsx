"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { ShoppingCart, X, Trash2, MapPin, Leaf, Wind, Info, ChevronRight } from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG ---
const GRADES = [
  { id: "silver", title: "SILVER GRADE", desc: "Максимум за минимум", color: "#C1C1C1", bg: "bg-white/5", border: "border-white/10" },
  { id: "golden", title: "GOLDEN GRADE", desc: "Золотая середина", color: "#FEC107", bg: "bg-[#FEC107]/5", border: "border-[#FEC107]/20" },
  { id: "premium", title: "PREMIUM GRADE", desc: "Высшее качество", color: "#34D399", bg: "bg-[#34D399]/10", border: "border-[#34D399]/20" },
  { id: "selected", title: "SELECTED GRADE", desc: "Эксклюзивные лоты", color: "#A855F7", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" }
];

const TYPE_COLORS: Record<string, string> = {
  "indica": "#EF4444", "sativa": "#3B82F6", "hybrid": "#10B981"
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
const useCart = create<any>()(persist((set) => ({
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
  removeItem: (id: string, weight: any) => set((state: any) => ({
    items: state.items.filter((i: any) => !(i.id === id && i.weight === weight))
  })),
  clearCart: () => set({ items: [] })
}), { name: "bnd-cart-v8" }));

// --- POP-UP MODAL ---
function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase().trim()] || "#FFF";
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50"><X size={20}/></button>
        <div className="aspect-square w-full relative">
          <img src={product.image} className="w-full h-full object-contain p-8" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1" style={{ color: typeColor }}>{product.type} • {product.subcategory} Grade</p>
          </div>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-3 gap-6">
             <div className="space-y-1.5"><div className="flex items-center gap-1.5 opacity-20"><MapPin size={12}/><span className="text-[8px] font-black uppercase">Farm</span></div><p className="text-[11px] font-bold italic text-white/90">{product.farm}</p></div>
             <div className="space-y-1.5"><div className="flex items-center gap-1.5 opacity-20"><Leaf size={12}/><span className="text-[8px] font-black uppercase">Taste</span></div><p className="text-[11px] font-bold italic text-white/90">{product.taste}</p></div>
             <div className="space-y-1.5"><div className="flex items-center gap-1.5 opacity-20"><Wind size={12}/><span className="text-[8px] font-black uppercase">Terps</span></div><p className="text-[11px] font-bold italic text-white/90">{product.terpenes}</p></div>
          </div>
          <div className="space-y-3"><span className="text-[9px] font-black uppercase opacity-20 tracking-widest">Description</span><p className="text-sm leading-relaxed text-white/60 italic font-medium">{product.description || "Description coming soon..."}</p></div>
        </div>
      </div>
    </div>
  );
}

// --- PRODUCT CARD (V2 CLEAN) ---
function ProductCard({ product, style, onOpen }: { product: any, style: any, onOpen: (p: any) => void }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  const currentPrice = getInterpolatedPrice(weight, product.prices);
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase().trim()] || "rgba(255,255,255,0.4)";

  return (
    <div className={`group relative flex flex-col rounded-[1.5rem] border p-3 md:p-5 backdrop-blur-3xl transition-all ${style.bg} ${style.border} hover:border-white/20`}>
      
      {/* КЛИКАБЕЛЬНАЯ ЗОНА */}
      <div className="cursor-pointer space-y-3" onClick={() => onOpen(product)}>
        <div className="aspect-square relative overflow-hidden rounded-[1.2rem]">
          <img src={product.image} alt="" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <h3 className="font-black text-white/90 text-[10px] md:text-lg uppercase italic line-clamp-1">{product.name}</h3>
            <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${typeColor}20`, color: typeColor }}>{product.type}</span>
          </div>
          {/* Явный намек на клик */}
          <div className="flex items-center gap-1 text-[8px] font-bold uppercase opacity-30 group-hover:opacity-100 group-hover:text-white transition-all">
            <Info size={10} /> <span>View Details</span> <ChevronRight size={10} />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 pt-3 mt-2 border-t border-white/5">
        <div className="text-xl md:text-4xl font-black italic tracking-tighter" style={{ color: style.color }}>{currentPrice}฿</div>
        
        {product.category === 'buds' && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-1">
              {[1, 5, 10, 20].map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-1.5 text-[8px] font-black rounded-lg border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/30"}`}>{v}g</button>
              ))}
            </div>
            <input type="range" min="0.5" max="20" step="0.5" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            <div className="flex justify-between text-[8px] font-black uppercase"><span className="opacity-20">Weight</span><span className="text-white">{weight}g</span></div>
          </div>
        )}

        <button 
          onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => setIsAdded(false), 1000); }}
          className="w-full py-3 md:py-4 rounded-[1rem] font-black uppercase text-[9px] md:text-[11px] transition-all border border-white/10"
          style={{ backgroundColor: isAdded ? '#34D399' : style.color, color: '#000' }}>
          {isAdded ? "Added" : `Add to Cart`}
        </button>
      </div>
    </div>
  );
}

export default function V2Page() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const { items } = useCart();

  React.useEffect(() => {
    getProducts().then(data => setProducts(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white pb-40">
      <header className="sticky top-0 z-[100] bg-[#193D2E]/80 backdrop-blur-xl p-5 border-b border-white/5 flex justify-between items-center px-8">
        <span className="text-2xl font-black italic tracking-tighter uppercase">BND v2</span>
        <button onClick={() => setIsCartOpen(true)} className="p-4 bg-white/5 rounded-2xl border border-white/10 relative active:scale-95 transition-all">
          <ShoppingCart size={22} />
          {items.length > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">{items.length}</span>}
        </button>
      </header>

      <div className="p-4 space-y-16 max-w-7xl mx-auto">
        {GRADES.map((grade) => {
          const gradeProducts = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeProducts.length === 0) return null;
          return (
            <section key={grade.id} className="space-y-8">
              <div className="space-y-2 px-3 border-l-[6px]" style={{ borderColor: grade.color }}>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                <p className="text-[11px] text-white/30 font-bold italic max-w-xs leading-relaxed">{grade.desc}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {gradeProducts.map(p => <ProductCard key={p.id} product={p} style={grade} onOpen={setSelectedProduct} />)}
              </div>
            </section>
          );
        })}
      </div>

      {selectedProduct && <ProductModal product={selectedProduct} style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
