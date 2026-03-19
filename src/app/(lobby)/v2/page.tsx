"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { ShoppingCart, X, Trash2, ArrowRight, Info, Wind, Leaf, MapPin } from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- Грейды и стили (как в прошлом сообщении) ---
const GRADES = [
  { id: "silver", title: "SILVER GRADE", desc: "Максимум за минимум", color: "#C1C1C1", bg: "bg-white/5", border: "border-white/10" },
  { id: "golden", title: "GOLDEN GRADE", desc: "Золотая середина", color: "#FEC107", bg: "bg-[#FEC107]/5", border: "border-[#FEC107]/20" },
  { id: "premium", title: "PREMIUM GRADE", desc: "Высшее качество", color: "#34D399", bg: "bg-[#34D399]/10", border: "border-[#34D399]/20" },
  { id: "selected", title: "SELECTED GRADE", desc: "Эксклюзивные лоты", color: "#A855F7", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" }
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

// --- ДЕТАЛЬНАЯ КАРТОЧКА (POP-UP) ---
function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/20 rounded-full text-white/50"><X size={24}/></button>
        
        <div className="aspect-square w-full bg-black/20 relative">
          <img src={product.image} className="w-full h-full object-contain" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none" style={{ color: style.color }}>{product.name}</h2>
             <p className="text-xs font-bold opacity-40 mt-2 uppercase tracking-[0.3em]">{product.type} • {product.subcategory} grade</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-1">
               <div className="flex items-center gap-1 opacity-30"><MapPin size={10}/><span className="text-[8px] font-black uppercase">Farm</span></div>
               <p className="text-[10px] font-bold italic">{product.farm}</p>
             </div>
             <div className="space-y-1">
               <div className="flex items-center gap-1 opacity-30"><Leaf size={10}/><span className="text-[8px] font-black uppercase">Taste</span></div>
               <p className="text-[10px] font-bold italic">{product.taste}</p>
             </div>
             <div className="space-y-1">
               <div className="flex items-center gap-1 opacity-30"><Wind size={10}/><span className="text-[8px] font-black uppercase">Terps</span></div>
               <p className="text-[10px] font-bold italic">{product.terpenes}</p>
             </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase opacity-30">Description</span>
            <p className="text-xs leading-relaxed text-white/70 italic">{product.description || "No description provided yet."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- СЕТКА ТОВАРОВ ---
function ProductCard({ product, style, onOpen }: { product: any, style: any, onOpen: (p: any) => void }) {
  const [weight, setWeight] = React.useState(1);
  const addItem = useCart(s => s.addItem);
  const currentPrice = getInterpolatedPrice(weight, product.prices);

  return (
    <div className={`relative flex flex-col rounded-[1rem] border p-2 backdrop-blur-3xl ${style.bg} ${style.border}`}>
      <div className="aspect-square relative overflow-hidden rounded-[0.7rem] bg-black/40 mb-2 cursor-pointer" onClick={() => onOpen(product)}>
        <img src={product.image} alt="" className="w-full h-full object-contain" />
        <div className="absolute top-1 right-1 p-1 bg-black/40 rounded-full text-white/20"><Info size={10}/></div>
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-white/90 text-[9px] uppercase italic line-clamp-1 cursor-pointer" onClick={() => onOpen(product)}>{product.name}</h3>
        <div className="text-sm font-black italic" style={{ color: style.color }}>{currentPrice}฿</div>
        <div className="space-y-1">
          <input type="range" min="0.5" max="20" step="0.5" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
        </div>
      </div>
      <button 
        onClick={() => addItem({ ...product, price: currentPrice, weight: `${weight}g` })}
        className="w-full mt-2 py-2 rounded-[0.6rem] font-black uppercase text-[8px] border border-white/10"
        style={{ backgroundColor: style.color, color: '#000' }}>Add {weight}g</button>
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
    <div className="min-h-screen bg-[#193D2E] text-white pb-32">
      <header className="sticky top-0 z-50 bg-[#193D2E]/80 backdrop-blur-xl p-4 border-b border-white/5 flex justify-between items-center px-6">
        <span className="text-xl font-black italic tracking-tighter">BND MENU v2</span>
        <button onClick={() => setIsCartOpen(true)} className="p-3 bg-white/5 rounded-xl border border-white/10 relative">
          <ShoppingCart size={20} />
          {items.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">{items.length}</span>}
        </button>
      </header>

      <div className="p-4 space-y-12 max-w-7xl mx-auto">
        {GRADES.map((grade) => {
          const gradeProducts = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeProducts.length === 0) return null;
          return (
            <section key={grade.id} className="space-y-6">
              <div className="space-y-1 px-2 border-l-4" style={{ borderColor: grade.color }}>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                <p className="text-[10px] text-white/40 font-medium italic max-w-xs">{grade.desc}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {gradeProducts.map(p => <ProductCard key={p.id} product={p} style={grade} onOpen={setSelectedProduct} />)}
              </div>
            </section>
          );
        })}
      </div>

      {/* Отображение модалки, если выбран товар */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          style={GRADES.find(g => g.id === selectedProduct.subcategory) || GRADES[2]} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
