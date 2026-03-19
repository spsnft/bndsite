"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG & DESCRIPTIONS ---
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

// Логика цен (оставляем твою рабочую)
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

// --- STORE (используем тот же конфиг корзины) ---
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

// --- COMPACT CARD ---
function ProductCard({ product, style }: { product: any, style: any }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart(s => s.addItem);
  const currentPrice = getInterpolatedPrice(weight, product.prices);

  return (
    <div className={`relative flex flex-col rounded-[1rem] border p-2 backdrop-blur-3xl transition-all ${style.bg} ${style.border}`}>
      <div className="aspect-square relative overflow-hidden rounded-[0.7rem] bg-black/40 mb-2 border border-white/5">
        <img src={product.image} alt="" className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-white/90 text-[9px] uppercase italic line-clamp-1">{product.name}</h3>
        <div className="text-sm font-black italic" style={{ color: style.color }}>{currentPrice}฿</div>
        <div className="space-y-1">
          <div className="flex justify-between items-end"><span className="text-[7px] opacity-20 uppercase font-black">Wt</span><span className="text-[10px] font-black">{weight}g</span></div>
          <input type="range" min="0.5" max="20" step="0.5" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
        </div>
      </div>
      <button 
        onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => setIsAdded(false), 1000); }}
        className="w-full mt-2 py-2 rounded-[0.6rem] font-black uppercase text-[8px] border border-white/10"
        style={{ backgroundColor: isAdded ? '#34D399' : style.color, color: '#000' }}>
        {isAdded ? "Added" : "Add"}
      </button>
    </div>
  );
}

export default function V2Page() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const { items } = useCart();

  React.useEffect(() => {
    getProducts().then(data => setProducts(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#193D2E]/80 backdrop-blur-xl p-4 border-b border-white/5 flex justify-between items-center px-6">
        <span className="text-xl font-black italic tracking-tighter">BND MENU</span>
        <button onClick={() => setIsCartOpen(true)} className="p-3 bg-white/5 rounded-xl border border-white/10 relative">
          <ShoppingCart size={20} />
          {items.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">{items.length}</span>}
        </button>
      </header>

      {/* Отрисовка секций по грейдам */}
      <div className="p-4 space-y-12 max-w-7xl mx-auto">
        {GRADES.map((grade) => {
          const gradeProducts = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeProducts.length === 0) return null;

          return (
            <section key={grade.id} className="space-y-6">
              {/* Заголовок и описание секции */}
              <div className="space-y-1 px-2 border-l-4" style={{ borderColor: grade.color }}>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>
                  {grade.title}
                </h2>
                <p className="text-[10px] text-white/40 font-medium leading-relaxed italic max-w-xs">
                  {grade.desc}
                </p>
              </div>

              {/* Сетка 3-в-ряд */}
              <div className="grid grid-cols-3 gap-2">
                {gradeProducts.map(p => (
                  <ProductCard key={p.id} product={p} style={grade} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Секция аксессуаров (Gear) */}
        <section className="pt-10 border-t border-white/5">
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white/20 mb-6">Related Gear</h2>
           <div className="grid grid-cols-3 gap-2">
              {products.filter(p => p.category === 'accessories').map(p => (
                <ProductCard key={p.id} product={p} style={{ color: '#FFF', bg: 'bg-white/5', border: 'border-white/10' }} />
              ))}
           </div>
        </section>
      </div>
      
      {/* Здесь можно добавить модалку корзины из прошлого кода */}
    </div>
  );
}
