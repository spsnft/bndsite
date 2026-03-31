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

// Проверка: является ли товар эксклюзивным/импортным
const isElite = (product: any) => {
  const sub = product?.subcategory?.toLowerCase() || "";
  return sub.includes('exclusive') || sub.includes('import');
};

const getInterpolatedPrice = (weight: number, prices: any, isEliteProduct: boolean) => {
  if (!prices) return 0;

  // Логика для Elite (3.5 / 7 / 14 / 28)
  if (isEliteProduct) {
    const p = { 
      3.5: prices[1] || 0, // В таблице цена за 3.5 лежит в колонке "1"
      7: prices[5] || 0,   // В таблице цена за 7 лежит в колонке "5"
      14: prices[10] || 0, // В таблице цена за 14 лежит в колонке "10"
      28: prices[20] || 0  // В таблице цена за 28 лежит в колонке "20"
    };

    if (weight <= 3.5) return p[3.5];
    if (weight <= 7) return p[3.5] + (p[7] - p[3.5]) * ((weight - 3.5) / 3.5);
    if (weight <= 14) return p[7] + (p[14] - p[7]) * ((weight - 7) / 7);
    if (weight <= 28) return p[14] + (p[28] - p[14]) * ((weight - 14) / 14);
    return (p[28] / 28) * weight;
  }

  // Стандартная логика (1 / 5 / 10 / 20)
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

// --- COMPONENTS ---

const ExclusiveCard = ({ item, onClick }: { item: any, onClick: () => void }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const accentColor = isImport ? "#60A5FA" : "#FBBF24";
  
  return (
    <div 
      onClick={onClick}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-md p-6 active:scale-[0.98] transition-all cursor-pointer group shadow-2xl"
    >
      <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20" style={{ backgroundColor: accentColor }}></div>
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star size={10} style={{ color: accentColor }} fill={accentColor} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">{item.subcategory}</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{item.name}</h3>
            <p className="text-[10px] font-bold mt-1" style={{ color: accentColor }}>{item.farm || "Private Reserve"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded-2xl shrink-0">
            <img src={isImport ? "https://flagcdn.com/us.svg" : "https://flagcdn.com/th.svg"} className="w-5 h-3.5 object-cover rounded-sm opacity-60" alt="" />
          </div>
        </div>
        <div className="aspect-[16/10] w-full bg-black/20 rounded-3xl flex items-center justify-center relative overflow-hidden group-hover:bg-black/40 transition-colors">
            <img src={getOptimizedImg(item.image, 500)} className="h-[90%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500" alt="" />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest opacity-40">{item.type}</span>
          </div>
          <div className="text-right">
             <p className="text-[8px] font-black uppercase opacity-20 leading-none mb-1">Price for 3.5g</p>
             <p className="text-3xl font-black italic tracking-tighter" style={{ color: accentColor }}>{item.prices?.[1]}฿</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const isEliteProduct = isElite(product);
  // Дефолтный вес: 1г для обычных, 3.5г для элиты
  const [weight, setWeight] = React.useState(isEliteProduct ? 3.5 : 1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);
  
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices, isEliteProduct));
  const pricePerGram = Math.round(currentPrice / weight);
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase()] || "#FFF";

  const weights = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50 hover:text-white"><X size={20}/></button>
        <div className="aspect-square w-full relative bg-black/10">
          <img src={getOptimizedImg(product.image, 600)} className="w-full h-full object-contain p-10" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1 text-white">
              <span style={{ color: typeColor }}>{product.type}</span>
              <span className="mx-2 opacity-20">•</span>
              <span style={{ color: style.color }}>{product.subcategory}</span>
            </p>
          </div>
        </div>
        <div className="p-8 pt-0 space-y-5 text-white">
          <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><MapPin size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Farm</span></div><p className="text-[10px] font-bold italic truncate">{product.farm}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Leaf size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Taste</span></div><p className="text-[10px] font-bold italic truncate">{product.taste}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Wind size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Terps</span></div><p className="text-[10px] font-bold italic truncate">{product.terpenes}</p></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-4xl font-black italic tracking-tighter">{currentPrice}฿</div>
                <div className="text-[9px] font-bold opacity-30 uppercase mt-1">Price per gram: {pricePerGram}฿</div>
              </div>
              <div className="text-[11px] font-black uppercase bg-white/10 px-4 py-1 rounded-full mb-1">{weight}g</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {weights.map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-3 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>
              ))}
            </div>
            <input type="range" min={weights[0]} max={weights[3]} step={0.5} value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            
            <button onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} className={`w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}>
              {isAdded ? "Added to Cart" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE & OTHER COMPONENTS ---
// (StoryModal, CheckoutModal, BadgeIcon остаются прежними, их код опускаю для краткости)

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
      } catch (e) { console.error("Fetch error:", e); } 
      finally { setIsLoading(false); }
    }
    fetchData();
  }, []);

  const eliteProducts = products.filter(p => p.category === 'buds' && isElite(p));

  const optimizedLogoUrl = `https://res.cloudinary.com/dpjwbcgrq/image/upload/w_192,c_limit,e_bgremoval,f_auto,q_auto/v1774704686/IMG_0036_t5cnic.png`;

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="max-w-xl mx-auto mb-10 pt-4">
        {/* Хедер и сторис без изменений */}
      </header>

      <div className="max-w-xl mx-auto space-y-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-20 bg-white/5 rounded-3xl animate-pulse" />
            <div className="h-20 bg-white/5 rounded-3xl animate-pulse" />
          </div>
        ) : (
          <>
            {/* СТАНДАРТНОЕ МЕНЮ */}
            <div className="space-y-4">
              {GRADES.map((grade) => {
                const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
                if (gradeItems.length === 0) return null;
                return (
                  <div key={grade.id} className="rounded-[1.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
                    <div className="px-5 py-3 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                      <h2 className="text-sm font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                      <grade.icon size={14} style={{ color: grade.color }} />
                    </div>
                    <div className="divide-y divide-white/5">
                      {gradeItems.map((p: any) => (
                        <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 active:bg-white/10 transition-all cursor-pointer group">
                           {/* Компактная строка товара */}
                           <span className="text-[11px] font-black uppercase italic truncate">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ЭЛИТНАЯ СЕКЦИЯ */}
            {eliteProducts.length > 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-4 px-2">
                  <h2 className="text-[12px] font-black uppercase italic tracking-[0.3em] text-[#FBBF24] shrink-0">Elite Selection</h2>
                  <div className="h-[1px] flex-1 bg-[#FBBF24]/20"></div>
                  <Crown size={14} className="text-[#FBBF24]" />
                </div>
                <div className="grid grid-cols-1 gap-6">
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
          style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: isElite(selectedProduct) ? '#FBBF24' : '#FFF' }} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      {/* ... Остальное как было ... */}
    </div>
  );
}
