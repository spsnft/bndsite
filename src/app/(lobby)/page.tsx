"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, 
  TrendingDown, ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Gift, Info, Trash2 
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { getProducts } from "@/lib/product"

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

const getInterpolatedPrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  const p1 = Number(prices[1]) || 0;
  const p5 = Number(prices[5]) || 0;
  const p10 = Number(prices[10]) || 0;
  const p20 = Number(prices[20]) || 0;
  if (weight <= 1) return p1 * weight;
  if (weight <= 5) return p1 + (p5 - p1) * ((weight - 1) / 4);
  if (weight <= 10) return p5 + (p10 - p5) * ((weight - 5) / 5);
  if (weight <= 20) return p10 + (p20 - p10) * ((weight - 10) / 10);
  return (p20 / 20) * weight;
};

const getOptimizedImg = (url: string, w = 800) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
};

const BadgeIcon = ({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0"><span className="text-[5px] font-black text-blue-400 uppercase">NEW</span></div>;
    case "HIT": return <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0"><Flame size={8} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0"><Percent size={8} className="text-emerald-400" /></div>;
    default: return null;
  }
};

// --- МОДАЛКИ (ВЕРНУЛИ ФУНКЦИОНАЛ) ---
function StoryModal({ story, onClose }: { story: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-xl" onClick={onClose}>
      <div className="w-full max-w-sm h-[80vh] px-4 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-12 right-4 p-2 text-white/50 hover:text-white"><X size={32}/></button>
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black/20">
          <img src={getOptimizedImg(story.image, 800)} className="w-full h-full object-cover" alt="" />
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const [weight, setWeight] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices));
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase()] || "#FFF";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50"><X size={20}/></button>
        <div className="aspect-square w-full relative bg-black/10">
          <img src={getOptimizedImg(product.image, 600)} className="w-full h-full object-contain p-10" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent text-white">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-1">
              <span style={{ color: typeColor }}>{product.type}</span> • {product.subcategory} Grade
            </p>
          </div>
        </div>
        <div className="p-8 pt-0 space-y-6 text-white">
          <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4">
             <div className="space-y-1 text-center"><span className="text-[7px] opacity-20 uppercase tracking-widest block">Farm</span><p className="text-[9px] font-bold italic truncate">{product.farm || "—"}</p></div>
             <div className="space-y-1 text-center"><span className="text-[7px] opacity-20 uppercase tracking-widest block">Taste</span><p className="text-[9px] font-bold italic truncate">{product.taste || "—"}</p></div>
             <div className="space-y-1 text-center"><span className="text-[7px] opacity-20 uppercase tracking-widest block">Terps</span><p className="text-[9px] font-bold italic truncate">{product.terpenes || "—"}</p></div>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-4xl font-black italic tracking-tighter">{currentPrice}฿</div>
            <div className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full">{weight}g</div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, 20].map(v => (
                <button key={v} onClick={() => setWeight(v)} className={`py-3 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black" : "border-white/10 text-white/40"}`}>{v}g</button>
              ))}
            </div>
            <button onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} className={`w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest transition-all shadow-xl ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}>
              {isAdded ? "Added to Cart" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    getProducts().then(data => {
      setProducts(data.products || []);
      setStories(data.stories || []);
      setIsLoading(false);
    });
  }, []);

  const STORY_CONFIG = [
    { id: "new", label: "New", icon: Sparkles, color: "#2DD4BF" },
    { id: "sale", label: "Promos", icon: Gift, color: "#FEC107" },
    { id: "info", label: "Info", icon: Info, color: "#A855F7" },
  ];

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32">
      <header className="flex flex-col items-center mb-6 pt-2">
        <img src="https://res.cloudinary.com/dpjwbcgrq/image/upload/w_160,f_auto,q_auto/v1774704686/IMG_0036_t5cnic.png" className="w-20 h-20 object-contain mb-6 drop-shadow-2xl" alt="Logo" />
        <div className="flex gap-4 mb-8 overflow-x-auto w-full max-w-sm px-4 no-scrollbar justify-center">
          {STORY_CONFIG.map((config) => {
            const tableData = stories.find(s => s.id === config.id);
            return (
              <button key={config.id} onClick={() => setActiveStory({ ...config, image: tableData?.image })} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-14 h-14 rounded-full bg-white/5 border flex items-center justify-center active:scale-90 transition-all" style={{ borderColor: `${config.color}30` }}>
                  <config.icon size={20} style={{ color: config.color }} />
                </div>
                <span className="text-[8px] font-black uppercase opacity-40">{config.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 w-full max-w-sm">
          <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/5 font-black uppercase text-[8px] tracking-widest opacity-20 italic">Accessories</button>
          <Link href="/concentrates" className="flex-1 py-3 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 font-black uppercase text-[8px] tracking-widest text-[#a855f7] italic flex items-center justify-center gap-2 active:scale-95 transition-all"><Flame size={10} /> Concentrates</Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-4">
        {isLoading ? (
          <div className="text-center py-10 opacity-20 font-black uppercase text-[10px]">Loading...</div>
        ) : (
          GRADES.map((grade) => {
            const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
            if (gradeItems.length === 0) return null;
            return (
              <div key={grade.id} className="rounded-[1.5rem] overflow-hidden border border-white/10 bg-black/20 shadow-xl">
                <div className="px-5 py-3 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                  <h2 className="text-sm font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                  <grade.icon size={14} style={{ color: grade.color }} />
                </div>
                <div className="divide-y divide-white/5">
                  {gradeItems.map((p: any) => {
                    const farmText = p.farm && p.farm.toLowerCase() !== 'unknown' ? p.farm : "";
                    return (
                      <div key={p.id} onClick={() => setSelectedProduct(p)} className="grid grid-cols-3 gap-2 px-5 py-3 hover:bg-white/5 active:bg-white/10 transition-all cursor-pointer group items-center">
                        {/* Слева: Шильдик и Название */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-4 shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
                          <span className="text-[11px] font-black uppercase italic tracking-tight text-white/90 truncate">{p.name}</span>
                        </div>
                        {/* Центр: Ферма (если есть) */}
                        <div className="text-center text-[9px] font-bold opacity-20 italic truncate px-2">{farmText}</div>
                        {/* Справа: Тип */}
                        <div className="flex justify-end">
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 shrink-0" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#FFF' }}>
                            {TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#193D2E] p-4 rounded-2xl shadow-2xl flex justify-between items-center active:scale-95 transition-all border-4 border-[#193D2E]">
            <div className="flex items-center gap-3"><ShoppingBag size={18}/><div className="text-left leading-none"><p className="text-[12px] font-black italic">{getTotal()}฿ Total</p></div></div>
            <Send size={16}/>
          </button>
        </div>
      )}

      {activeStory && <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />}
      {selectedProduct && <ProductModal product={selectedProduct} style={GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }} onClose={() => setSelectedProduct(null)} />}
      {/* Здесь должна быть твоя CheckoutModal, если она в отдельном файле или была в коде выше */}
    </div>
  );
}
