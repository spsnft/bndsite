"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Gift, Info, Trash2, Headset
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { getProducts } from "@/lib/product"

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

const getOptimizedImg = (url: string, w = 400) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
};

// --- OPTIMIZED COMPONENTS ---

const BadgeIcon = React.memo(({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0"><span className="text-[7px] font-black text-blue-400">NEW</span></div>;
    case "HIT": return <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0"><Flame size={10} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0"><Percent size={10} className="text-emerald-400" /></div>;
    default: return null;
  }
});
BadgeIcon.displayName = "BadgeIcon";

const ExclusiveCard = React.memo(({ item, onClick, priority }: { item: any, onClick: () => void, priority?: boolean }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const accentColor = isImport ? IMPORT_COLOR : SELECTED_COLOR; 
  const typeColor = TYPE_COLORS[item.type?.toLowerCase()] || "#FFF";
  const displayPrice = Object.values(item.prices || {}).find(v => Number(v) > 0) || 0;

  return (
    <div 
      onClick={onClick} 
      className="relative rounded-[2rem] border border-white/10 bg-black/40 active:scale-[0.98] transition-all cursor-pointer group shadow-2xl flex flex-col justify-between h-full hover:border-white/20 overflow-hidden"
    >
      <div 
        className="absolute inset-x-0 top-0 h-3/4 opacity-20 blur-[40px] pointer-events-none z-0" 
        style={{ background: `radial-gradient(circle at center top, ${accentColor}, transparent)` }}
      />
      
      <div className="relative z-10 space-y-3 p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="text-[17px] font-black italic uppercase tracking-tight leading-tight">{item.name}</h3>
            <p className="text-[9px] font-bold mt-0.5 opacity-40 truncate tracking-wide">{item.farm || "Private Reserve"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded-xl shrink-0">
            {isImport ? <Crown size={15} style={{ color: accentColor }} /> : <Flame size={15} style={{ color: accentColor }} />}
          </div>
        </div>
        <div className="aspect-square w-full bg-black/20 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/5 shadow-inner">
            <img 
              src={getOptimizedImg(item.image, 300)} 
              loading={priority ? "eager" : "lazy"}
              className="h-[88%] object-contain drop-shadow-[0_12px_25px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-700" 
              alt={item.name} 
            />
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-end p-4 pt-0 mt-1">
        <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-wider" style={{ color: typeColor }}>{item.type}</span>
        <div className="text-right ml-2">
           <p className="text-[8px] font-black uppercase opacity-20 leading-none mb-0.5">Starting at</p>
           <p className="text-[20px] font-black italic tracking-tight leading-none" style={{ color: accentColor }}>{displayPrice}฿</p>
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
        <span className="text-[13px] font-black uppercase italic tracking-tight text-white/90 truncate leading-tight">{p.name}</span>
      </div>
      
      <div className="flex items-center gap-3 shrink-0 ml-auto">
         {isSale && priceRef && (
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
             <span className="text-[9px] font-black italic line-through opacity-20 text-white">{Math.round(getInterpolatedPrice(1, priceRef.prices))}฿</span>
             <span className="text-[10px] font-black italic text-emerald-400">{Math.round(getInterpolatedPrice(1, p.prices))}฿</span>
           </div>
         )}
         {p.farm && p.farm !== '-' && <div className="text-[9px] font-bold opacity-20 italic truncate max-w-[85px] tracking-tighter">{p.farm}</div>}
         <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/5" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</span>
      </div>
    </div>
  );
});
ProductRow.displayName = "ProductRow";

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
      } catch (e) { console.error(e); } 
      finally { setIsLoading(false); }
    }
    fetchData();
  }, []);

  const gradeSections = React.useMemo(() => {
    return GRADES.map(grade => {
      const items = products.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
      const priceRef = items.find(p => p.badge?.toUpperCase() !== 'SALE') || items[0];
      return { grade, items, priceRef };
    }).filter(g => g.items.length > 0);
  }, [products]);

  const eliteLocal = React.useMemo(() => products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), [products]);
  const eliteImport = React.useMemo(() => products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')), [products]);

  const STORY_CONFIG = [
    { id: "new", label: "New Arrivals", icon: Sparkles, color: "#2DD4BF" },
    { id: "sale", label: "Gifts & Promos", icon: Gift, color: "#FEC107" },
    { id: "info", label: "Service Info", icon: Info, color: "#A855F7" },
  ];

  const logoUrl = `https://res.cloudinary.com/dpjwbcgrq/image/upload/w_192,c_limit,e_bgremoval,f_auto,q_auto/v1774704686/IMG_0036_t5cnic.png`;

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="max-w-xl mx-auto mb-10 pt-4">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[20px] z-0"></div>
                <img src={logoUrl} loading="eager" className="w-full h-full object-contain relative z-10" alt="Logo" />
              </div>
              <h1 className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40 leading-none">Premium Phuket delivery service</h1>
           </div>
           <div className="flex gap-2">
              <Link href="https://t.me/bshk_phuket" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 hover:bg-[#229ED9]/20 transition-all"><SendHorizontal size={16} className="text-[#229ED9]"/></Link>
              <Link href="https://bndeliveryphuket.click/wa" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 hover:bg-[#25D366]/20 transition-all"><MessageCircle size={16} className="text-[#25D366]"/></Link>
              <Link href="https://www.instagram.com/boshkunadoroshku" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 hover:bg-[#E4405F]/20 transition-all"><Instagram size={16} className="text-[#E4405F]"/></Link>
           </div>
        </div>

        <div className="flex gap-6 mb-10 overflow-x-auto w-full no-scrollbar justify-center">
          {STORY_CONFIG.map((config) => {
            const tableData = stories.find(s => s.id === config.id);
            return (
              <button key={config.id} onClick={() => setActiveStory({ ...config, image: tableData?.image })} className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-16 h-16 rounded-full bg-white/5 border-2 flex items-center justify-center transition-all active:scale-90" style={{ borderColor: `${config.color}40` }}>
                  <config.icon size={22} style={{ color: config.color }} />
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60 text-center max-w-[65px]">{config.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 w-full px-2">
          <Link href="/concentrates" className="flex-1 py-4 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/30 font-black uppercase text-[9px] tracking-widest text-[#a855f7] italic flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Flame size={12} /> Concentrates
          </Link>
          <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 font-black uppercase text-[9px] tracking-widest opacity-30 italic cursor-not-allowed">Accessories</button>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-4">
        {isLoading ? (
          <>
            {/* Skeleton components... */}
          </>
        ) : (
          <>
            {gradeSections.map(({ grade, items, priceRef }) => (
              <div key={grade.id} className="rounded-[1.5rem] overflow-hidden border border-white/10 bg-black/20 shadow-xl">
                <div className="px-5 py-3 flex items-center border-b border-white/5 bg-white/[0.02]">
                  <grade.icon size={16} style={{ color: grade.color }} className="mr-3 shrink-0" />
                  <h2 className="text-sm font-black italic uppercase tracking-tight" style={{ color: grade.color }}>{grade.title}</h2>
                  <div className="flex items-center gap-3 ml-auto mr-1">
                    {[1, 5, 10, 20].map(w => (
                      <div key={w} className="flex flex-col items-center min-w-[32px]">
                        <span className="text-[7px] font-black opacity-25 uppercase">{w}g</span>
                        <span className="text-[11px] font-black italic tracking-tighter text-white/90">{Math.round(getInterpolatedPrice(w, priceRef.prices))}฿</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {items.map((p: any) => (
                    <ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} priceRef={priceRef} />
                  ))}
                </div>
              </div>
            ))}

            {/* Exclusive blocks... */}
            {/* Остальной код из предыдущего сообщения с фиксом ExclusiveCard */}
          </>
        )}
      </div>
    </div>
  );
}
