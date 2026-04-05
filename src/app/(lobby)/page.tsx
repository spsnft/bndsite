"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Gift, Info, Trash2, Headset, ChevronDown
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { getProducts } from "@/lib/product"
import { BlurImage } from "@/components/blur-image"

// --- КОНСТАНТЫ ---
const SELECTED_COLOR = "#2DD4BF"; 
const IMPORT_COLOR = "#60A5FA";

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

const getElitePrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  const weightMap: Record<number, number> = { 3.5: 1, 7: 5, 14: 10, 28: 20 };
  return prices[weightMap[weight]] || 0;
};

const getInterpolatedPrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  if (weight <= 1) return (prices[1] || 0) * weight;
  if (weight <= 5) return (prices[1] || 0) + ((prices[5] || 0) - (prices[1] || 0)) * ((weight - 1) / 4);
  if (weight <= 10) return (prices[5] || 0) + ((prices[10] || 0) - (prices[5] || 0)) * ((weight - 5) / 5);
  if (weight <= 20) return (prices[10] || 0) + ((prices[20] || 0) - (prices[10] || 0)) * ((weight - 10) / 10);
  return ((prices[20] || 0) / 20) * weight;
};

const getRandom = (arr: any[], limit: number) => {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, limit);
};

// --- COMPONENTS ---

const BadgeIcon = React.memo(({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0"><span className="text-[6px] font-black text-blue-400 uppercase">New</span></div>;
    case "HIT": return <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0"><Flame size={10} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0"><Percent size={10} className="text-emerald-400" /></div>;
    default: return null;
  }
});
BadgeIcon.displayName = "BadgeIcon";

const ExclusiveCard = React.memo(({ item, onClick, priority }: { item: any, onClick: () => void, priority?: boolean }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const gradeColor = GRADES.find(g => g.id === item.subcategory)?.color || SELECTED_COLOR;
  const accentColor = isElite(item) ? (isImport ? IMPORT_COLOR : SELECTED_COLOR) : gradeColor; 
  const typeColor = TYPE_COLORS[item.type?.toLowerCase()] || "#FFF";
  
  const displayPrice = isElite(item) 
    ? (Object.values(item.prices || {}).find(v => Number(v) > 0) || 0)
    : Math.round(getInterpolatedPrice(1, item.prices));

  return (
    <div 
      onClick={onClick} 
      className="relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group flex flex-col h-[210px] overflow-hidden"
      style={{ 
        boxShadow: `inset 0 0 0 1px ${accentColor}40, 0 0 20px -5px ${accentColor}30`,
        background: `radial-gradient(circle at 50% 0%, ${accentColor}15 0%, rgba(0,0,0,1) 85%)`,
      }}
    >
      <div className="absolute top-3 left-3 z-20">
         {item.badge && <BadgeIcon type={item.badge} />}
      </div>
      
      <div className="relative z-10 p-4 pb-0 flex-1 flex flex-col">
        <div className="min-w-0 mb-1">
          <h3 className="text-[11px] font-black italic uppercase tracking-tighter leading-tight truncate text-white">{item.name}</h3>
          <p className="text-[7px] font-bold mt-0.5 opacity-40 truncate text-white uppercase">{item.farm || "Private Reserve"}</p>
        </div>
        
        <div className="relative aspect-square w-full mt-auto mb-2">
            <BlurImage 
              src={item.image} 
              priority={priority}
              width={200}
              height={200}
              className="w-full h-full object-contain p-1 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-500" 
              alt={item.name} 
            />
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-end p-4 pt-0">
        <span className="px-1.5 py-0.5 rounded-full bg-black/40 border border-white/5 text-[6px] font-black uppercase tracking-widest" style={{ color: typeColor }}>{item.type}</span>
        <div className="text-right">
           <p className="text-[14px] font-black italic tracking-tighter leading-none" style={{ color: accentColor }}>{displayPrice}฿</p>
        </div>
      </div>
    </div>
  );
});
ExclusiveCard.displayName = "ExclusiveCard";

const ProductRow = React.memo(({ p, onClick, priceRef }: { p: any, onClick: () => void, priceRef: any }) => {
  const isSale = p.badge?.toUpperCase() === 'SALE';
  return (
    <div onClick={onClick} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-all cursor-pointer group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-5 flex justify-center shrink-0">
          {p.badge && <BadgeIcon type={p.badge} />}
        </div>
        <span className="text-[11px] font-black uppercase italic tracking-tight text-white/90 truncate leading-tight">{p.name}</span>
      </div>
      
      <div className="flex items-center gap-3 shrink-0 ml-auto">
         {isSale && priceRef && (
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
             <span className="text-[9px] font-black italic line-through opacity-20 text-white">{Math.round(getInterpolatedPrice(1, priceRef.prices))}฿</span>
             <span className="text-[10px] font-black italic text-emerald-400">{Math.round(getInterpolatedPrice(1, p.prices))}฿</span>
           </div>
         )}
         {p.farm && p.farm !== '-' && <div className="text-[9px] font-bold opacity-20 italic truncate max-w-[80px] uppercase">{p.farm}</div>}
         <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</span>
      </div>
    </div>
  );
});
ProductRow.displayName = "ProductRow";

// --- MODALS (STORY, PRODUCT, CHECKOUT) ---
// (Вставь сюда функции StoryModal, ProductModal и CheckoutModal из предыдущего сообщения)

// --- MAIN LANDING PAGE ---

export default function LandingPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [stories, setStories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [activeStory, setActiveStory] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [openGrades, setOpenGrades] = React.useState<string[]>([]);
  const { items, getTotal } = useCart();

  React.useEffect(() => { 
    async function fetchData() {
      try {
        const data = await getProducts();
        setProducts(data.products || []);
        setStories(data.stories || []);
      } catch (e) { console.error(e); } 
      finally { setIsLoading(false); }
    }
    fetchData();
  }, []);

  // Готовим разделы Хитов и Новинок (по 4 рандомных)
  const highlights = React.useMemo(() => {
    const hits = products.filter(p => p.category === 'buds' && p.badge?.toUpperCase() === 'HIT');
    return getRandom(hits, 4);
  }, [products]);

  const recentUpdates = React.useMemo(() => {
    const news = products.filter(p => p.category === 'buds' && p.badge?.toUpperCase() === 'NEW');
    return getRandom(news, 4);
  }, [products]);

  const gradeSections = React.useMemo(() => {
    return GRADES.map(grade => {
      const items = products.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
      const priceRef = items.find(p => p.badge?.toUpperCase() !== 'SALE') || items[0];
      return { grade, items, priceRef };
    }).filter(g => g.items.length > 0);
  }, [products]);

  const eliteLocal = React.useMemo(() => products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), [products]);
  const eliteImport = React.useMemo(() => products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')), [products]);

  const toggleGrade = (id: string) => {
    setOpenGrades(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const STORY_CONFIG = [
    { id: "new", label: "New Arrivals", icon: Sparkles, color: "#2DD4BF" },
    { id: "sale", label: "Gifts & Promos", icon: Gift, color: "#FEC107" },
    { id: "info", label: "Service Info", icon: Info, color: "#A855F7" },
  ];

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="max-w-xl mx-auto mb-10 pt-4">
        {/* LOGO & SOCIALS */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[20px] z-0"></div>
                <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={64} height={64} className="w-full h-full object-contain relative z-10" alt="Logo" />
              </div>
              <h1 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none">Phuket Premium Delivery</h1>
           </div>
           <div className="flex gap-2">
              <Link href="https://t.me/bshk_phuket" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 transition-all"><SendHorizontal size={16}/></Link>
              <Link href="https://www.instagram.com/boshkunadoroshku" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 transition-all"><Instagram size={16}/></Link>
           </div>
        </div>

        {/* STORIES */}
        <div className="flex gap-6 mb-10 overflow-x-auto w-full no-scrollbar justify-center">
          {STORY_CONFIG.map((config) => {
            const tableData = stories.find(s => s.id === config.id);
            return (
              <button key={config.id} onClick={() => setActiveStory({ ...config, image: tableData?.image })} className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-14 h-14 rounded-full bg-white/5 border flex items-center justify-center transition-all active:scale-90" style={{ borderColor: `${config.color}30` }}>
                  <config.icon size={20} style={{ color: config.color }} />
                </div>
                <span className="text-[8px] font-black tracking-widest uppercase opacity-40">{config.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-12">
        {isLoading ? (
          <div className="animate-pulse space-y-10">
            <div className="h-40 bg-white/5 rounded-3xl"></div>
            <div className="h-40 bg-white/5 rounded-3xl"></div>
          </div>
        ) : (
          <>
            {/* --- СЕКЦИЯ HIGHLIGHTS (HITS) --- */}
            {highlights.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Flame size={14} className="text-orange-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Tonight's Highlights</h2>
                  </div>
                  <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-orange-400/20 to-transparent"></div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                  {highlights.map((p) => (
                    <div key={p.id} className="w-[160px] shrink-0 snap-start">
                      <ExclusiveCard item={p} onClick={() => setSelectedProduct(p)} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* --- СЕКЦИЯ RECENT UPDATES (NEW) --- */}
            {recentUpdates.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Recent Updates</h2>
                  </div>
                  <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                  {recentUpdates.map((p) => (
                    <div key={p.id} className="w-[160px] shrink-0 snap-start">
                      <ExclusiveCard item={p} onClick={() => setSelectedProduct(p)} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* --- FULL CATALOG (ACCORDIONS) --- */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 py-4 opacity-20">
                   <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white"></div>
                   <span className="text-[8px] font-black uppercase tracking-[0.5em] italic">Full Catalog</span>
                   <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white"></div>
                </div>

                {/* EXCLUSIVE ACCORDIONS */}
                {[
                  { id: 'local', title: 'Local Exclusives', items: eliteLocal, color: SELECTED_COLOR, icon: Flame },
                  { id: 'import', title: 'Import Exclusives', items: eliteImport, color: IMPORT_COLOR, icon: Crown }
                ].map(sec => sec.items.length > 0 && (
                  <div key={sec.id} className="rounded-[1.5rem] overflow-hidden border border-white/5 bg-black/20">
                    <button onClick={() => toggleGrade(sec.id)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center">
                        <sec.icon size={16} style={{ color: sec.color }} className="mr-3" />
                        <h2 className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2>
                      </div>
                      <ChevronDown size={14} className={`opacity-20 transition-transform ${openGrades.includes(sec.id) ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ${openGrades.includes(sec.id) ? 'max-h-[1500px]' : 'max-h-0'}`}>
                       <div className="p-4 grid grid-cols-2 gap-3 bg-white/5">
                         {sec.items.map(p => (
                            <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-black/40 rounded-2xl p-3 border border-white/5 flex items-center gap-3 active:scale-95 transition-all cursor-pointer">
                               <div className="w-8 h-8 shrink-0"><BlurImage src={p.image} width={40} height={40} className="w-full h-full object-contain" alt="" /></div>
                               <div className="min-w-0"><p className="text-[10px] font-black uppercase italic truncate text-white">{p.name}</p></div>
                            </div>
                         ))}
                       </div>
                    </div>
                  </div>
                ))}

                {/* GRADE ACCORDIONS */}
                {gradeSections.map(({ grade, items, priceRef }) => {
                  const isOpen = openGrades.includes(grade.id);
                  return (
                    <div key={grade.id} className="rounded-[1.5rem] overflow-hidden border border-white/5 bg-black/20">
                      <button onClick={() => toggleGrade(grade.id)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center">
                          <grade.icon size={16} style={{ color: grade.color }} className="mr-3" />
                          <h2 className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[13px] font-black italic text-white/50">{Math.round(getInterpolatedPrice(1, priceRef.prices))}฿/g</span>
                          <ChevronDown size={14} className={`opacity-20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[1500px]' : 'max-h-0'}`}>
                        <div className="divide-y divide-white/5 bg-white/5">
                          {items.map((p: any) => (
                            <ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} priceRef={priceRef} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>

      {/* FLOAT CART */}
      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-white text-black p-5 rounded-[2rem] shadow-2xl flex justify-between items-center active:scale-95 transition-all">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20}/>
              <span className="font-black uppercase text-[12px] tracking-widest">{getTotal()}฿ Total</span>
            </div>
            <Send size={18}/>
          </button>
        </div>
      )}

      {/* Вставь сюда логику отображения модалок StoryModal, ProductModal и CheckoutModal */}
    </div>
  );
}
