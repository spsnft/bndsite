"use client"
import * as React from "react"
import Link from "next/link"
import { getProducts } from "@/lib/product" 
import { 
  LayoutGrid, 
  Zap, 
  Sparkles, 
  Flame, 
  Percent, 
  X, 
  MapPin, 
  Leaf, 
  Wind,
  Crown,
  TrendingDown
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

const TYPE_SHORT: Record<string, string> = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };
const TYPE_COLORS: Record<string, string> = { 
  "indica": "#A855F7", 
  "sativa": "#FBBF24", 
  "hybrid": "#2DD4BF" 
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
  clearCart: () => set({ items: [] })
}), { name: "bnd-cart-v11" }));

const getInterpolatedPrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  if (weight <= 1) return prices[1] * weight;
  if (weight <= 5) return prices[1] + (prices[5] - prices[1]) * ((weight - 1) / 4);
  if (weight <= 10) return prices[5] + (prices[10] - prices[5]) * ((weight - 5) / 5);
  if (weight <= 20) return prices[10] + (prices[20] - prices[10]) * ((weight - 10) / 10);
  return (prices[20] / 20) * weight;
};

// --- MODAL SHOP ---
function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices));
  const pricePerGram = Math.round(currentPrice / weight);
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase()] || "#FFF";

  // Логика подсказки (Upsell)
  const getUpsellTip = () => {
    if (weight < 5) return { next: 5, p: Math.round(product.prices[5]/5) };
    if (weight < 10) return { next: 10, p: Math.round(product.prices[10]/10) };
    if (weight < 20) return { next: 20, p: Math.round(product.prices[20]/20) };
    return null;
  };
  const tip = getUpsellTip();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50 hover:text-white transition-colors"><X size={20}/></button>
        
        <div className="aspect-square w-full relative bg-black/10">
          <img src={product.image} className="w-full h-full object-contain p-10" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                <span style={{ color: typeColor }}>{product.type}</span>
                <span className="mx-2 opacity-20 text-white">•</span>
                <span style={{ color: style.color }}>{product.subcategory} Grade</span>
             </p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-6 text-center sm:text-left">
             <div className="space-y-1"><div className="flex items-center justify-center sm:justify-start gap-1.5 opacity-20"><MapPin size={10}/><span className="text-[7px] font-black uppercase">Farm</span></div><p className="text-[10px] font-bold italic truncate">{product.farm}</p></div>
             <div className="space-y-1"><div className="flex items-center justify-center sm:justify-start gap-1.5 opacity-20"><Leaf size={10}/><span className="text-[7px] font-black uppercase">Taste</span></div><p className="text-[10px] font-bold italic truncate">{product.taste}</p></div>
             <div className="space-y-1"><div className="flex items-center justify-center sm:justify-start gap-1.5 opacity-20"><Wind size={10}/><span className="text-[7px] font-black uppercase">Terps</span></div><p className="text-[10px] font-bold italic truncate">{product.terpenes}</p></div>
          </div>
          
          <div className="space-y-4 pt-2 relative">
            <div className="flex justify-between items-end gap-2 relative">
               <div>
                 <div className="text-4xl font-black italic tracking-tighter text-white whitespace-nowrap">{currentPrice}฿</div>
                 <div className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-1">Price per gram: {pricePerGram}฿</div>
               </div>
               <div className="text-[11px] font-black uppercase bg-white/10 px-3 py-1 rounded-full mb-1">{weight}g</div>
            </div>

            <div className="grid grid-cols-4 gap-2.5 pt-2">
              {[1, 5, 10, 20].map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>
              ))}
            </div>
            
            <div className="pt-2"><input type="range" min="1" max="20" step="1" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" /></div>

            {tip && (
              <div className="flex items-center gap-2 py-2.5 px-4 bg-emerald-400/5 rounded-xl border border-emerald-400/10 mt-2">
                <TrendingDown size={12} className="text-emerald-400" />
                <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-tight">
                  Add {(tip.next - weight).toFixed(0)}g more to drop price to {tip.p}฿ per gram!
                </p>
              </div>
            )}

            <button 
              onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }}
              className={`w-full py-4.5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl active:scale-95 mt-2 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}>
              {isAdded ? "Added to Cart" : "Add to Order"}
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

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-48">
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 mb-6 flex items-center justify-center bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl shadow-2xl relative">
           <span className="text-2xl font-black italic text-white tracking-tighter uppercase">BND</span>
           {items.length > 0 && <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">{items.length}</div>}
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

      <div className="max-w-4xl mx-auto space-y-12">
        {GRADES.map((grade) => {
          const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeItems.length === 0) return null;
          const GradeIcon = grade.icon;

          return (
            <div key={grade.id} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl">
              <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                <div>
                  <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                  <p className="text-[9px] font-bold opacity-30 mt-1.5 uppercase tracking-widest flex items-center gap-1.5">
                    {grade.prices.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <span>{item.w}g—{item.p}฿</span>
                        {idx !== grade.prices.length - 1 && <span className="opacity-20 px-0.5">/</span>}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                   <GradeIcon size={18} style={{ color: grade.color }} />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 px-6 py-4 text-[7px] font-black uppercase opacity-20 tracking-[0.2em] bg-white/5">
                <div className="col-span-6">Strain Name</div>
                <div className="col-span-2 text-center">Type</div>
                <div className="col-span-4 text-right">Farm Origin</div>
              </div>

              <div className="divide-y divide-white/5">
                {gradeItems.map((p) => {
                  const typeColor = TYPE_COLORS[p.type?.toLowerCase()] || '#10B981';
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedProduct(p)}
                      className="grid grid-cols-12 gap-2 px-6 py-5 items-center hover:bg-white/5 transition-all group cursor-pointer active:bg-white/10"
                    >
                      <div className="col-span-6 flex items-center gap-4">
                        <div className="w-5 flex justify-center shrink-0">
                          {p.badge && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor, boxShadow: `0 0 8px ${typeColor}` }} />}
                        </div>
                        <span className="text-[12px] font-black uppercase italic tracking-tight text-white/90 group-hover:text-white truncate">
                          {p.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-center text-[10px] font-black uppercase" style={{ color: typeColor }}>
                        {TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}
                      </div>
                      <div className="col-span-4 text-right text-[10px] font-bold opacity-30 italic truncate">
                        {p.farm}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      
      <p className="mt-24 text-center text-[9px] font-black uppercase tracking-[0.6em] text-white/5 italic">Premium Delivery Phuket • Since 2024</p>
    </div>
  );
}
