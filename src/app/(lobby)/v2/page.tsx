"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { ShoppingCart, X, Trash2, MapPin, Leaf, Wind, Info } from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG & STYLE GRADES ---
const GRADES = [
  { 
    id: "silver", 
    title: "SILVER GRADE", 
    desc: "Это категория цена-качество. Для тех, кто хочет максимум за минимум",
    color: "#C1C1C1", bg: "bg-white/5", border: "border-white/10" 
  },
  { 
    id: "golden", 
    title: "GOLDEN GRADE", 
    desc: "Золотая середина. Сбалансированные сорта с отличным эффектом",
    color: "#FEC107", bg: "bg-[#FEC107]/5", border: "border-[#FEC107]/20" 
  },
  { 
    id: "premium", 
    title: "PREMIUM GRADE", 
    desc: "Высокое содержание ТГК и исключительный вкус для ценителей",
    color: "#34D399", bg: "bg-[#34D399]/10", border: "border-[#34D399]/20" 
  },
  { 
    id: "selected", 
    title: "SELECTED GRADE", 
    desc: "Эксклюзивные лоты. Лучшее, что можно найти на Пхукете прямо сейчас",
    color: "#A855F7", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" 
  }
];

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
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50"><X size={20}/></button>
        
        <div className="aspect-square w-full bg-black/20 relative">
          <img src={product.image} className="w-full h-full object-contain" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
             <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mt-1">{product.type} • {product.subcategory} Grade</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-3 gap-6">
             <div className="space-y-1.5">
               <div className="flex items-center gap-1.5 opacity-20"><MapPin size={12}/><span className="text-[8px] font-black uppercase">Farm</span></div>
               <p className="text-[11px] font-bold italic text-white/90">{product.farm}</p>
             </div>
             <div className="space-y-1.5">
               <div className="flex items-center gap-1.5 opacity-20"><Leaf size={12}/><span className="text-[8px] font-black uppercase">Taste</span></div>
               <p className="text-[11px] font-bold italic text-white/90">{product.taste}</p>
             </div>
             <div className="space-y-1.5">
               <div className="flex items-center gap-1.5 opacity-20"><Wind size={12}/><span className="text-[8px] font-black uppercase">Terps</span></div>
               <p className="text-[11px] font-bold italic text-white/90">{product.terpenes}</p>
             </div>
          </div>
          
          <div className="space-y-3">
            <span className="text-[9px] font-black uppercase opacity-20 tracking-widest">Description</span>
            <p className="text-sm leading-relaxed text-white/60 italic font-medium">{product.description || "Description coming soon..."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PRODUCT CARD ---
function ProductCard({ product, style, onOpen }: { product: any, style: any, onOpen: (p: any) => void }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  const currentPrice = getInterpolatedPrice(weight, product.prices);

  return (
    <div className={`relative flex flex-col rounded-[1.2rem] border p-2.5 backdrop-blur-3xl transition-all ${style.bg} ${style.border}`}>
      <div className="aspect-square relative overflow-hidden rounded-[0.9rem] bg-black/40 mb-2.5 cursor-pointer group" onClick={() => onOpen(product)}>
        <img src={product.image} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full text-white/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"><Info size={12}/></div>
      </div>
      <div className="flex-1 space-y-1.5">
        <h3 className="font-bold text-white/90 text-[10px] uppercase italic line-clamp-1 cursor-pointer" onClick={() => onOpen(product)}>{product.name}</h3>
        <div className="text-sm font-black italic" style={{ color: style.color }}>{currentPrice}฿</div>
        <div className="space-y-1.5">
          <input type="range" min="0.5" max="20" step="0.5" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
        </div>
      </div>
      <button 
        onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => setIsAdded(false), 1000); }}
        className="w-full mt-2.5 py-2.5 rounded-[0.8rem] font-black uppercase text-[8px] tracking-tighter border border-white/10 transition-all active:scale-95"
        style={{ backgroundColor: isAdded ? '#34D399' : style.color, color: '#000' }}>
        {isAdded ? "Added" : `Add ${weight}g`}
      </button>
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

      <div className="p-5 space-y-16 max-w-7xl mx-auto">
        {GRADES.map((grade) => {
          const gradeProducts = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeProducts.length === 0) return null;

          return (
            <section key={grade.id} className="space-y-8">
              <div className="space-y-2 px-3 border-l-[6px]" style={{ borderColor: grade.color }}>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                <p className="text-[11px] text-white/30 font-bold italic max-w-xs leading-relaxed">{grade.desc}</p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {gradeProducts.map(p => (
                  <ProductCard key={p.id} product={p} style={grade} onOpen={setSelectedProduct} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="pt-16 border-t border-white/5">
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white/20 mb-8 px-2">Gear & Accessories</h2>
           <div className="grid grid-cols-3 gap-2.5">
              {products.filter(p => p.category === 'accessories').map(p => (
                <ProductCard key={p.id} product={p} style={{ color: '#FFF', bg: 'bg-white/5', border: 'border-white/10' }} onOpen={setSelectedProduct} />
              ))}
           </div>
        </section>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
