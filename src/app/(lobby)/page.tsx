"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, 
  TrendingDown, ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Gift, Info, Trash2 
} from "lucide-react"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getProducts } from "@/lib/product"

// --- СКЕЛЕТОН (Заглушка для загрузки) ---
const SkeletonGrade = () => (
  <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/10 animate-pulse mb-8">
    <div className="p-6 h-20 bg-white/5 border-b border-white/5" />
    <div className="divide-y divide-white/5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 rounded-full bg-white/10" />
            <div className="w-32 h-4 bg-white/10 rounded" />
          </div>
          <div className="w-12 h-4 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ... (Тут твой Store, GRADES, CONTACT_METHODS и HELPERS без изменений, пропускаю для краткости) ...
// (Оставляй их как были в твоем исходнике)

const useCart = create<any>()(persist((set, get) => ({
  items: [],
  addItem: (newItem: any) => set((state: any) => {
    const ex = state.items.findIndex((i: any) => i.id === newItem.id && i.weight === newItem.weight);
    if (ex > -1) {
      const newItems = [...state.items];
      newItems[ex].quantity += 1;
      return { items: newItems };
    }
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),
  removeItem: (id: string, weight: string) => set((state: any) => ({
    items: state.items.filter((i: any) => !(i.id === id && i.weight === weight))
  })),
  updateQuantity: (id: string, weight: string, delta: number) => set((state: any) => {
    const newItems = state.items.map((i: any) => {
      if (i.id === id && i.weight === weight) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    });
    return { items: newItems };
  }),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
}), { name: "bnd-cart-v12" }));

// (Вставь сюда все константы и функции: GRADES, CONTACT_METHODS, getInterpolatedPrice, getOptimizedImg, StoryModal, ProductModal, CheckoutModal, BadgeIcon — они у тебя норм)

// --- MAIN PAGE ---
export default function LandingPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [stories, setStories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true); // НОВОЕ: состояние загрузки
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [activeStory, setActiveStory] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const { items, getTotal } = useCart();

  React.useEffect(() => { 
    async function fetchData() {
      try {
        const data = await getProducts();
        setProducts(data.products || []);
        setStories(data.stories || []);
      } catch (e) {
        console.error("Ошибка загрузки:", e);
      } finally {
        setIsLoading(false); // Выключаем загрузку
      }
    }
    fetchData();
  }, []);

  const STORY_CONFIG = [
    { id: "new", label: "New Arrivals", icon: Sparkles, color: "#2DD4BF" },
    { id: "sale", label: "Gifts & Promos", icon: Gift, color: "#FEC107" },
    { id: "info", label: "Service Info", icon: Info, color: "#A855F7" },
  ];

  const optimizedLogoUrl = `https://res.cloudinary.com/dpjwbcgrq/image/upload/w_192,c_limit,e_bgremoval,f_auto,q_auto/v1774704686/IMG_0036_t5cnic.png`;

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="flex flex-col items-center mb-10 pt-4">
        <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[40px] z-0"></div>
          <img 
            src={optimizedLogoUrl} 
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl" 
            alt="Logo"
            width={192}
            height={192}
          />
        </div>

        {/* Сторис */}
        <div className="flex gap-6 mb-10 overflow-x-auto w-full max-w-md px-4 no-scrollbar justify-center">
          {STORY_CONFIG.map((config) => {
            const tableData = stories.find(s => s.id === config.id);
            return (
              <button key={config.id} onClick={() => setActiveStory({ ...config, image: tableData?.image })} className="flex flex-col items-center gap-3 shrink-0 group">
                <div className="w-16 h-16 rounded-full bg-white/5 border-2 flex items-center justify-center transition-all active:scale-90" style={{ borderColor: `${config.color}40` }}>
                  <config.icon size={22} style={{ color: config.color }} />
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60 text-center leading-tight max-w-[65px]">{config.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* ЕСЛИ ГРУЗИТСЯ — ПОКАЗЫВАЕМ СКЕЛЕТОНЫ */}
        {isLoading ? (
          <>
            <SkeletonGrade />
            <SkeletonGrade />
          </>
        ) : (
          GRADES.map((grade) => {
            const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
            if (gradeItems.length === 0) return null;
            return (
              <div key={grade.id} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
                <div className="p-6 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner"><grade.icon size={18} style={{ color: grade.color }} /></div>
                </div>
                <div className="divide-y divide-white/5">
                  {gradeItems.map((p: any) => (
                    <div key={p.id} onClick={() => setSelectedProduct(p)} className="grid grid-cols-12 gap-2 px-6 py-5 items-center hover:bg-white/5 transition-all group cursor-pointer active:bg-white/10">
                      <div className="col-span-6 flex items-center gap-4 relative">
                        <div className="w-5 flex justify-center shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
                        <span className="text-[12px] font-black uppercase italic tracking-tight text-white/90 group-hover:text-white leading-tight">{p.name}</span>
                      </div>
                      <div className="col-span-2 text-center text-[10px] font-black uppercase shrink-0" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</div>
                      <div className="col-span-4 text-right text-[10px] font-bold opacity-30 italic truncate">{p.farm}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Корзина и Модалки остаются без изменений */}
      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center group active:scale-95 transition-all border-4 border-[#193D2E]">
            <div className="flex items-center gap-4">
              <ShoppingBag size={22}/>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Order Now</p>
                <p className="text-[16px] font-black italic mt-1">{getTotal()}฿ Total</p>
              </div>
            </div>
            <Send size={20}/>
          </button>
        </div>
      )}

      {activeStory && <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />}
      {selectedProduct && <ProductModal product={selectedProduct} style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }} onClose={() => setSelectedProduct(null)} />}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
