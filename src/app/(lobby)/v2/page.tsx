"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { ShoppingCart, X, Trash2, MapPin, Leaf, Wind, Eye } from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG & STYLE GRADES ---
const GRADES = [
  { id: "silver", title: "SILVER GRADE", desc: "Максимум за минимум", color: "#C1C1C1", bg: "bg-white/5", border: "border-white/10" },
  { id: "golden", title: "GOLDEN GRADE", desc: "Золотая середина", color: "#FEC107", bg: "bg-[#FEC107]/5", border: "border-[#FEC107]/20" },
  { id: "premium", title: "PREMIUM GRADE", desc: "Высшее качество", color: "#34D399", bg: "bg-[#34D399]/10", border: "border-[#34D399]/20" },
  { id: "selected", title: "SELECTED GRADE", desc: "Эксклюзивные лоты", color: "#A855F7", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" }
];

// Цветовая кодировка генотипа
const TYPE_COLORS: Record<string, string> = {
  "indica": "#EF4444", // Красный
  "sativa": "#3B82F6", // Синий
  "hybrid": "#10B981"  // Зеленый
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
  removeItem: (id: string, weight: any) => set((state: any) => ({
    items: state.items.filter((i: any) => !(i.id === id && i.weight === weight))
  })),
  clearCart: () => set({ items: [] })
}), { name: "bnd-cart-v8" }));

// --- POP-UP MODAL (Детальная) ---
function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase().trim()] || "#FFF";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50"><X size={20}/></button>
        
        <div className="aspect-square w-full bg-black/20 relative">
          <img src={product.image} className="w-full h-full object-contain" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1" style={{ color: typeColor }}>
                {product.type} • {product.subcategory} Grade
             </p>
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

// --- PRODUCT CARD (2-в-ряд, с полями) ---
function ProductCard({ product, style, onOpen }: { product: any, style: any, onOpen: (p: any) => void }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  const currentPrice = getInterpolatedPrice(weight, product.prices);
  
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase().trim()] || "rgba(255,255,255,0.4)";

  return (
    <div className={`group relative flex flex-col rounded-[1.5rem] border p-3 md:p-6 backdrop-blur-3xl transition-all ${style.bg} ${style.border} hover:border-white/20 active:scale-[0.98]`}>
      
      {/* Кликабельная зона (фото + инфо) */}
      <div className="cursor-pointer space-y-3" onClick={() => onOpen(product)}>
        <div className="aspect-square relative overflow-hidden rounded-[1.2rem] bg-black/40 border border-white/5">
          <img src={product.image} alt="" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
          {/* Намек на клик (Глаз) */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-md"><Eye size={20} className="text-white/70"/></div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-1">
            <h3 className="font-bold text-white/90 text-[11px] md:text-lg uppercase italic line-clamp-1">{product.name}</h3>
            {/* Type с подкраской */}
            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${typeColor}20`, color: typeColor }}>
                {product.type}
            </span>
          </div>
          <div className="text-lg md:text-4xl font-black italic tracking-tight" style={{ color: style.color }}>{currentPrice}฿</div>
        </div>

        {/* НОВЫЕ ПОЛЯ: Taste & Terpenes (скрыты на совсем мелких, видны от md) */}
        {product.category === 'buds' && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
             <div className="space-y-1">
               <div className="flex items-center gap-1 opacity-30"><Leaf size={10}/></div>
               <p className="text-[9px] font-bold italic line-clamp-2 leading-tight">{product.taste}</p>
             </div>
             <div className="space-y-1">
               <div className="flex items-center gap-1 opacity-30"><Wind size={10}/></div>
               <p className="text-[9px] font-bold italic line-clamp-2 leading-tight">{product.terpenes}</p>
             </div>
          </div>
        )}
      </div>

      {/* Зона выбора веса и кнопки */}
      <div className="flex-1 space-y-3 pt-3 mt-3 border-t border-white/5">
        <div className="space-y-2">
          <input type="range" min="0.5" max="20" step="0.5" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
          <div className="flex justify-between text-[10px] font-black"><span className="opacity-20 uppercase">Wt</span><span className="font-black">{weight}g</span></div>
        </div>
        <button 
          onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => setIsAdded(false), 1000); }}
          className="w-full py-3 md:py-5 rounded-[1rem] md:rounded-[1.5rem] font-black uppercase text-[10px] md:text-[11px] transition-all border border-white/10"
          style={{ backgroundColor: isAdded ? '#34D399' : style.color, color: '#000' }}>
          {isAdded ? "Added" : `Add ${weight}g`}
        </button>
      </div>
    </div>
  );
}

// --- MAIN PAGE (V2) ---
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

              {/* СЕТКА: 2 В РЯД НА МОБИЛКЕ */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
                {gradeProducts.map(p => (
                  <ProductCard key={p.id} product={p} style={grade} onOpen={setSelectedProduct} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="pt-16 border-t border-white/5">
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white/20 mb-8 px-2">Gear & Accessories</h2>
           <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
