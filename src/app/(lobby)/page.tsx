"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Gift, Info, Trash2, Headset, Star
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { getProducts } from "@/lib/product"

// --- КОНСТАНТЫ ---
const GRADES = [
  { id: "silver", title: "SILVER GRADE", color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", color: "#FEC107", icon: Sparkles },
  { id: "premium", title: "PREMIUM GRADE", color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", color: "#A855F7", icon: Crown }
];

const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, ph: "@username or phone number" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, ph: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, ph: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, ph: "@username or phone number" },
];

const TYPE_SHORT: Record<string, string> = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };
const TYPE_COLORS: Record<string, string> = { "indica": "#A855F7", "sativa": "#FBBF24", "hybrid": "#2DD4BF" };

// --- HELPERS ---
const isElite = (product: any) => {
  const sub = product?.subcategory?.toLowerCase() || "";
  return sub.includes('exclusive') || sub.includes('import');
};

const getInterpolatedPrice = (weight: number, prices: any, isEliteProduct: boolean) => {
  if (!prices) return 0;
  if (isEliteProduct) {
    const p = { 3.5: prices[1] || 0, 7: prices[5] || 0, 14: prices[10] || 0, 28: prices[20] || 0 };
    if (weight <= 3.5) return p[3.5];
    if (weight <= 7) return p[3.5] + (p[7] - p[3.5]) * ((weight - 3.5) / 3.5);
    if (weight <= 14) return p[7] + (p[14] - p[7]) * ((weight - 7) / 7);
    if (weight <= 28) return p[14] + (p[28] - p[14]) * ((weight - 14) / 14);
    return (p[28] / 28) * weight;
  }
  if (weight <= 1) return (prices[1] || 0) * weight;
  if (weight <= 5) return (prices[1] || 0) + ((prices[5] || 0) - (prices[1] || 0)) * ((weight - 1) / 4);
  if (weight <= 10) return (prices[5] || 0) + ((prices[10] || 0) - (prices[5] || 0)) * ((weight - 5) / 5);
  if (weight <= 20) return (prices[10] || 0) + ((prices[20] || 0) - (prices[10] || 0)) * ((weight - 10) / 10);
  return ((prices[20] || 0) / 20) * weight;
};

const getOptimizedImg = (url: string, w = 800) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
};

// --- НОВЫЙ КОМПОНЕНТ ЭКСКЛЮЗИВНОЙ КАРТОЧКИ (КОМПАКТНЫЙ, 2 В РЯД, ИСПРАВЛЕННЫЙ GLOW) ---
const ExclusiveCard = ({ item, onClick }: { item: any, onClick: () => void }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const accentColor = isImport ? "#60A5FA" : "#FEC107";
  const typeColor = TYPE_COLORS[item.type?.toLowerCase()] || "#FFF";
  
  // Берем первую доступную цену из объекта
  const displayPrice = Object.values(item.prices || {}).find(v => Number(v) > 0) || 0;

  return (
    <div onClick={onClick} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-md p-4 active:scale-[0.98] transition-all cursor-pointer group shadow-2xl flex flex-col justify-between h-full">
      {/* ИСПРАВЛЕННЫЙ GLOW: Внутренний элемент с градиентом, overflow:hidden родителя его обрежет мягко */}
      <div className="absolute -top-12 -right-12 w-32 h-32 opacity-30 transition-opacity group-hover:opacity-60" style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`, borderRadius: '50%' }}></div>
      
      <div className="relative z-10 space-y-3">
        {/* Хедер карточки */}
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1 opacity-40">
              <Star size={9} style={{ color: accentColor }} fill={accentColor} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] truncate">{item.subcategory}</span>
            </div>
            <h3 className="text-[16px] font-black italic uppercase tracking-tighter leading-tight group-hover:text-white transition-colors">{item.name}</h3>
            <p className="text-[9px] font-bold mt-0.5 opacity-60 truncate">{item.farm || "Private Reserve"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded-xl shrink-0 mt-1">
             <Crown size={14} style={{ color: accentColor }} />
          </div>
        </div>

        {/* Изображение */}
        <div className="aspect-[1/1] w-full bg-black/20 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:bg-black/30 transition-colors border border-white/5">
            <img src={getOptimizedImg(item.image, 300)} className="h-[90%] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-700" alt="" />
        </div>
      </div>

      {/* Футер карточки */}
      <div className="relative z-10 flex justify-between items-end mt-4">
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest shrink-0" style={{ color: typeColor }}>
          {item.type}
        </span>
        <div className="text-right ml-2">
           <p className="text-[8px] font-black uppercase opacity-20 leading-none mb-0.5">Starting at</p>
           <p className="text-[20px] font-black italic tracking-tighter leading-none" style={{ color: accentColor }}>{displayPrice}฿</p>
        </div>
      </div>
    </div>
  );
};

// --- СКЕЛЕТОН ---
const SkeletonGrade = () => (
  <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/10 animate-pulse mb-8">
    <div className="p-6 h-16 bg-white/5 border-b border-white/5" />
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

// --- MODALS (STORY, PRODUCT, CHECKOUT) - ОСТАВЛЯЕМ БЕЗ ИЗМЕНЕНИЙ ---
// ... (код модалок опускаю для краткости, они идентичны оригиналу) ...

// --- MAIN PAGE ---
export default function LandingPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [stories, setStories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
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
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    }
    fetchData();
  }, []);

  const STORY_CONFIG = [
    { id: "new", label: "New Arrivals", icon: Sparkles, color: "#2DD4BF" },
    { id: "sale", label: "Gifts & Promos", icon: Gift, color: "#FEC107" },
    { id: "info", label: "Service Info", icon: Info, color: "#A855F7" },
  ];

  const eliteProducts = products.filter(p => p.category === 'buds' && isElite(p));
  const optimizedLogoUrl = `https://res.cloudinary.com/dpjwbcgrq/image/upload/w_192,c_limit,e_bgremoval,f_auto,q_auto/v1774704686/IMG_0036_t5cnic.png`;

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="max-w-xl mx-auto mb-10 pt-4">
        {/* Хедер без изменений */}
      </header>

      <div className="max-w-xl mx-auto space-y-10">
        {isLoading ? (
          <div className="space-y-4"><div className="h-40 bg-white/5 rounded-3xl animate-pulse" /><div className="h-40 bg-white/5 rounded-3xl animate-pulse" /></div>
        ) : (
          <>
            <div className="space-y-4">
              {GRADES.map((grade) => {
                const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
                if (gradeItems.length === 0) return null;
                return (
                  <div key={grade.id} className="rounded-[1.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
                    {/* ... (твой оригинальный код отрисовки грейдов) ... */}
                  </div>
                );
              })}
            </div>

            {/* ЭЛИТНАЯ СЕКЦИЯ: ИЗМЕНЕНО НА 2 В РЯД */}
            {eliteProducts.length > 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-4 px-2">
                  <h2 className="text-[12px] font-black uppercase italic tracking-[0.3em] text-[#FEC107] shrink-0">Local & Import Exclusives</h2>
                  <div className="h-[1px] flex-1 bg-[#FEC107]/20"></div>
                  <Crown size={14} className="text-[#FEC107]" />
                </div>
                {/* МЕНЯЕМ grid-cols-1 на grid-cols-2 */}
                <div className="grid grid-cols-2 gap-4">
                  {eliteProducts.map(p => (
                    <ExclusiveCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Кнопка корзины и модалки */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          style={isElite(selectedProduct) ? {color: '#FEC107'} : (GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' })} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      {/* ... Остальное как было ... */}
    </div>
  );
}
