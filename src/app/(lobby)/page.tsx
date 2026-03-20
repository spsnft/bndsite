"use client"
import * as React from "react"
import Link from "next/link"
import { getProducts } from "@/lib/product" 
import { 
  LayoutGrid, 
  Zap, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Percent, 
  X, 
  MapPin, 
  Leaf, 
  Wind,
  Medal 
} from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG ---
const GRADES_CONFIG: Record<string, any> = {
  silver: { title: "SILVER GRADE", priceLine: "1g—150 / 5g—700 / 10g—1200 / 20g—2000", color: "#C1C1C1" },
  golden: { title: "GOLDEN GRADE", priceLine: "1g—250 / 5g—1100 / 10g—1700 / 20g—3000", color: "#FEC107" },
  premium: { title: "PREMIUM GRADE", priceLine: "1g—300 / 5g—1300 / 10g—2000 / 20g—3500", color: "#34D399" },
  selected: { title: "SELECTED GRADE", priceLine: "1g—350 / 5g—1500 / 10g—2500 / 20g—4000", color: "#A855F7" }
};

const TYPE_SHORT: Record<string, string> = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };
const TYPE_COLORS: Record<string, string> = { 
  "indica": "#A855F7", 
  "sativa": "#FBBF24", 
  "hybrid": "#2DD4BF" 
};

// --- COMPONENTS: BEAUTIFUL NEON ICONS ---
const BadgeIcon = ({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return (
      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
        <Sparkles size={10} className="text-blue-400" />
      </div>
    );
    case "HIT": return (
      <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
        <Flame size={10} className="text-orange-400" />
      </div>
    );
    case "SALE": return (
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
        <Percent size={10} className="text-emerald-400" />
      </div>
    );
    default: return null;
  }
};

// --- STORE (Basket) ---
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
  clearCart: () => set({ items: [] })
}), { name: "bnd-cart-v8" }));

const getInterpolatedPrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  if (weight <= 1) return prices[1] * weight;
  if (weight <= 5) return prices[1] + (prices[5] - prices[1]) * ((weight - 1) / 4);
  if (weight <= 10) return prices[5] + (prices[10] - prices[5]) * ((weight - 5) / 5);
  if (weight <= 20) return prices[10] + (prices[20] - prices[10]) * ((weight - 10) / 10);
  return (prices[20] / 20) * weight;
};

// --- PRODUCT ROW ---
function ProductRow({ product, onOpen, showFarm }: { product: any, onOpen: (p: any) => void, showFarm: boolean }) {
  const badge = String(product.badge || "").toUpperCase();
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase()] || "#FFF";

  return (
    <div 
      onClick={() => onOpen(product)}
      className="grid grid-cols-12 gap-2 px-4 py-4 items-center hover:bg-white/5 transition-all group cursor-pointer active:bg-white/10"
    >
      <div className={showFarm ? "col-span-6 flex items-center gap-4" : "col-span-9 flex items-center gap-3"}>
        <div className="w-5 flex justify-center shrink-0">
          {badge && <BadgeIcon type={badge} />}
        </div>
        <span className="text-[12px] font-black uppercase italic tracking-tight text-white/90 group-hover:text-white truncate">
          {product.name}
        </span>
      </div>

      <div className={showFarm ? "col-span-2 text-center" : "col-span-3 text-right"}>
        <span className="text-[10px] font-black uppercase" style={{ color: typeColor }}>
          {TYPE_SHORT[product.type?.toLowerCase()] || 'IND'}
        </span>
      </div>

      {showFarm && (
        <div className="col-span-4 text-right flex items-center justify-end gap-2 overflow-hidden">
          <span className="text-[10px] font-bold opacity-30 italic truncate">{product.farm}</span>
          <ChevronRight size={10} className="opacity-10 group-hover:translate-x-1 transition-all" />
        </div>
      )}
    </div>
  );
}

// --- POP-UP SHOP ---
function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices));
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase()] || "#FFF";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50"><X size={20}/></button>
        <div className="aspect-square w-full relative">
          <img src={product.image} className="w-full h-full object-contain p-12" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1" style={{ color: typeColor }}>{product.type} • {product.subcategory} Grade</p>
          </div>
        </div>
        <div className="p-8 space-y-6 text-center sm:text-left">
          <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-6">
             <div className="space-y-1"><div className="flex items-center justify-center sm:justify-start gap-1.5 opacity-20"><MapPin size={10}/><span className="text-[7px] font-black uppercase">Farm</span></div><p className="text-[10px] font-bold italic truncate">{product.farm}</p></div>
             <div className="space-y-1"><div className="flex items-center justify-center sm:justify-start gap-1.5 opacity-20"><Leaf size={10}/><span className="text-[7px] font-black uppercase">Taste</span></div><p className="text-[10px] font-bold italic truncate">{product.taste}</p></div>
             <div className="space-y-1"><div className="flex items-center justify-center sm:justify-start gap-1.5 opacity-20"><Wind size={10}/><span className="text-[7px] font-black uppercase">Terps</span></div><p className="text-[10px] font-bold italic truncate">{product.terpenes}</p></div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-end gap-2"><div className="text-4xl font-black italic tracking-tighter" style={{ color: style.color }}>{currentPrice}฿</div><div className="text-[10px] font-black opacity-20 uppercase tracking-widest">{weight}g</div></div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 5, 10, 20].map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>
              ))}
            </div>
            <input type="range" min="0.5" max="20" step="0.5" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            <button 
              onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }}
              className="w-full mt-2 py-4.5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-2xl active:scale-95"
              style={{ backgroundColor: isAdded ? '#34D399' : style.color, color: '#000' }}>
              {isAdded ? "Order Created" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- LANDING PAGE ---
export default function LandingPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const items = useCart(s => s.items);

  React.useEffect(() => {
    getProducts().then(data => setProducts(data));
  }, []);

  const renderGradeCard = (gradeId: string, isCompact: boolean) => {
    const config = GRADES_CONFIG[gradeId];
    if (!config) return null;
    const gradeItems = products.filter(p => p.subcategory === gradeId && p.category === 'buds');
    if (gradeItems.length === 0) return null;

    return (
      <div key={gradeId} className={`rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl ${isCompact ? 'col-span-1' : 'w-full'}`}>
        <div className="p-5 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${config.color}10` }}>
          <div>
            <h2 className={`font-black italic uppercase tracking-tighter leading-none ${isCompact ? 'text-[14px] md:text-[18px]' : 'text-xl md:text-2xl'}`} style={{ color: config.color }}>{config.title}</h2>
            <p className={`font-black opacity-30 mt-1.5 uppercase tracking-widest leading-none ${isCompact ? 'text-[7px]' : 'text-[9px]'}`}>{config.priceLine}</p>
          </div>
          {gradeId === 'premium' && <Medal className="w-8 h-8 opacity-20" style={{ color: config.color }}/>}
        </div>

        <div className="grid grid-cols-12 gap-2 px-5 py-3 text-[8px] font-black uppercase opacity-20 tracking-[0.2em] bg-white/5 border-b border-white/5">
          <div className={isCompact ? "col-span-9" : "col-span-6"}>Strain Name</div>
          <div className={isCompact ? "col-span-3 text-right" : "col-span-2 text-center"}>Type</div>
          {!isCompact && <div className="col-span-4 text-right">Farm Origin</div>}
        </div>

        <div className="divide-y divide-white/5">
          {gradeItems.map((p) => <ProductRow key={p.id} product={p} onOpen={setSelectedProduct} showFarm={!isCompact} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-10 pb-40">
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 mb-6 flex items-center justify-center bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl shadow-2xl relative">
           <span className="text-2xl font-black italic text-white tracking-tighter uppercase">BND</span>
           {items.length > 0 && <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.5)]">{items.length}</div>}
        </div>
        
        <div className="flex gap-4 w-full max-w-sm">
          <Link href="/v2" className="flex-1 flex gap-2 justify-center items-center bg-white text-[#193D2E] py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest active:scale-95 transition-all shadow-xl">
            <LayoutGrid size={14} /> Full Menu
          </Link>
          <button className="flex-1 flex gap-2 justify-center items-center bg-white/5 border border-white/10 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest opacity-40 cursor-not-allowed">
            <Zap size={14} /> Concentrates
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Silver & Golden: Компактный ряд */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {renderGradeCard('silver', true)}
          {renderGradeCard('golden', true)}
        </div>

        {/* Premium & Selected: Полноразмерные */}
        <div className="space-y-12">
          {renderGradeCard('premium', false)}
          {renderGradeCard('selected', false)}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          style={GRADES_CONFIG[selectedProduct.subcategory] || { color: '#FFF' }} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      
      <p className="mt-20 text-center text-[9px] font-black uppercase tracking-[0.6em] text-white/5 italic">Premium Delivery Phuket • Since 2024</p>
    </div>
  );
}
