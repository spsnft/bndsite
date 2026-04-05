"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Flame, Percent, X, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Trash2, ChevronDown, Star, Phone
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { BlurImage } from "@/components/blur-image"

// --- КОНСТАНТЫ ---
const SELECTED_COLOR = "#A855F7"; 
const IMPORT_COLOR = "#60A5FA";

// Строгий порядок категорий
const GRADES = [
  { id: "silver", title: "SILVER GRADE", color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", color: "#FEC107", icon: Star },
  { id: "premium", title: "PREMIUM GRADE", color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", color: "#A855F7", icon: Crown }
];

const INFO_CARDS = [
  { id: 1, title: "DAILY SUPPORT", value: "12:00—00:00", color: "#A855F7" },
  { id: 3, title: "MINIMAL ORDER", value: "1000฿", color: "#FBBF24" },
  { id: 2, title: "PHUKET DELIVERY", value: "60 MINUTES", color: "#2DD4BF" },
  { id: 4, title: "NATIONWIDE", value: "2-3 DAYS", color: "#60A5FA" },
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
    const eliteMap: Record<number, number> = { 3.5: 1, 7: 5, 14: 10, 28: 20 };
    const steps = [3.5, 7, 14, 28];
    const baseTier = [...steps].reverse().find(s => s <= weight) || 3.5;
    const priceAtTier = Number(prices[eliteMap[baseTier]]) || 0;
    return priceAtTier > 0 ? (priceAtTier / baseTier) * weight : 0;
  }
  const tiers = [1, 5, 10, 20];
  const lowerTier = [...tiers].reverse().find(t => t <= weight) || 1;
  const upperTier = tiers.find(t => t > weight) || 20;
  const val1 = Number(prices[lowerTier]) || 0;
  const val2 = Number(prices[upperTier]) || val1; 
  if (val1 === 0) return 0;
  if (lowerTier === upperTier) return val1;
  return val1 + (val2 - val1) * ((weight - lowerTier) / (upperTier - lowerTier));
};

// --- COMPONENTS ---
const BadgeIcon = React.memo(({ type }: { type: string }) => {
  // Унифицированный размер w-5 h-5 для всех иконок
  const baseClass = "w-5 h-5 flex items-center justify-center shrink-0 border rounded-full";
  
  switch (type.toUpperCase()) {
    case "NEW": return (
      <div className={`${baseClass} border-blue-400/30 bg-blue-500/10 rounded-lg`}>
        <span className="text-[5px] font-black text-blue-400 uppercase leading-none tracking-tighter">NEW</span>
      </div>
    );
    case "HIT": return (
      <div className={`${baseClass} border-orange-400/30 bg-orange-500/20`}>
        <Flame size={10} className="text-orange-400" />
      </div>
    );
    case "SALE": return (
      <div className={`${baseClass} border-emerald-500/30 bg-emerald-500/20`}>
        <Percent size={10} className="text-emerald-400" />
      </div>
    );
    default: return null;
  }
});

const ProductRow = React.memo(({ p, onClick }: { p: any, onClick: () => void }) => (
  <div onClick={onClick} className="flex items-center justify-between gap-3 px-6 py-3.5 active:bg-white/5 transition-colors cursor-pointer group">
    <div className="flex items-center gap-3 truncate flex-1">
      <div className="w-8 flex justify-start shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
      <span className="text-[12px] font-black uppercase italic tracking-tight text-white/90 truncate leading-tight">{p.name}</span>
    </div>
    <div className="flex items-center gap-4 shrink-0">
      {p.farm && p.farm !== "-" && (
        <span className="text-[8px] font-bold text-white/70 uppercase tracking-widest italic truncate max-w-[100px]">{p.farm}</span>
      )}
      <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-white/5 min-w-[36px] text-center" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</span>
    </div>
  </div>
));

const ExclusiveCard = React.memo(({ item, onClick }: { item: any, onClick: () => void }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const accentColor = isImport ? IMPORT_COLOR : SELECTED_COLOR;
  const displayPrice = Math.round(getInterpolatedPrice(3.5, item.prices, true));

  return (
    <div onClick={onClick} className="flex items-center gap-4 p-4 active:bg-white/5 transition-colors cursor-pointer group border-b border-white/5 last:border-0">
      <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex-shrink-0 overflow-hidden p-2 relative">
        <BlurImage src={item.image} width={64} height={64} className="w-full h-full object-contain relative z-10" alt={item.name} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
           <h3 className="text-[11px] font-black italic uppercase tracking-tight text-white leading-tight truncate">{item.name}</h3>
           <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 shrink-0" style={{ color: TYPE_COLORS[item.type?.toLowerCase()] }}>{TYPE_SHORT[item.type?.toLowerCase()]}</span>
        </div>
        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest truncate">
          {item.farm && item.farm !== "-" ? item.farm : (isImport ? 'USA IMPORT' : 'LOCAL TOP SHELF')}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[14px] font-black italic tracking-tighter" style={{ color: accentColor }}>{displayPrice > 0 ? `${displayPrice}฿` : '—'}</p>
        <p className="text-[7px] font-bold opacity-20 uppercase tracking-widest">3.5g</p>
      </div>
    </div>
  );
});

const HighlightCard = React.memo(({ item, onClick, priority }: { item: any, onClick: () => void, priority?: boolean }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const gradeColor = GRADES.find(g => g.id === item.subcategory)?.color || SELECTED_COLOR;
  const accentColor = isElite(item) ? (isImport ? IMPORT_COLOR : SELECTED_COLOR) : gradeColor; 
  const displayPrice = Math.round(getInterpolatedPrice(isElite(item) ? 3.5 : 1, item.prices, isElite(item)));

  return (
    <div onClick={onClick} className="relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group flex flex-col h-[200px] overflow-hidden" style={{ boxShadow: `inset 0 0 0 1px ${accentColor}30`, background: `radial-gradient(circle at 50% 0%, ${accentColor}10 0%, rgba(0,0,0,1) 90%)` }}>
      <div className="relative z-10 p-4 pb-0 flex-1 flex flex-col">
        <div className="min-w-0">
          <h3 className="text-[10px] font-black italic uppercase tracking-tighter leading-tight truncate text-white">{item.name}</h3>
          <p className="text-[7px] font-black mt-1 text-white/40 truncate uppercase italic tracking-widest">{item.subcategory || "Buds"}</p>
        </div>
        <div className="relative aspect-square w-full mt-auto mb-1">
            <BlurImage src={item.image} priority={priority} width={180} height={180} className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]" alt={item.name} />
        </div>
      </div>
      <div className="relative z-10 flex justify-between items-center p-4 pt-0">
        <span className="text-[6px] font-black uppercase tracking-widest opacity-60" style={{ color: TYPE_COLORS[item.type?.toLowerCase()] }}>{TYPE_SHORT[item.type?.toLowerCase()]}</span>
        <p className="text-[11px] font-black italic tracking-tighter" style={{ color: accentColor }}>{displayPrice > 0 ? `${displayPrice}฿` : '—'}</p>
      </div>
    </div>
  );
});

// --- MAIN LANDING ---
export default function LandingClient({ initialProducts }: { initialProducts: any[] }) {
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [openGrades, setOpenGrades] = React.useState<string[]>([]);
  const { items, getTotal } = useCart();

  const recentUpdates = React.useMemo(() => 
    initialProducts.filter(p => p.category === 'buds' && p.badge?.toUpperCase() === 'NEW')
    .sort((a, b) => getInterpolatedPrice(1, b.prices, false) - getInterpolatedPrice(1, a.prices, false)), 
  [initialProducts]);

  // Секции Elite (Local + Import)
  const eliteSections = [
    { id: 'local', title: 'Local Exclusives', items: initialProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), color: SELECTED_COLOR, icon: MapPin },
    { id: 'import', title: 'USA Import', items: initialProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')), color: IMPORT_COLOR, icon: Star }
  ];

  const gradeSections = React.useMemo(() => {
    return GRADES.map(grade => {
      const items = initialProducts.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
      const priceRef = items.find(p => p.badge?.toUpperCase() !== 'SALE') || items[0];
      return { grade, items, priceRef };
    }).filter(g => g.items.length > 0);
  }, [initialProducts]);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32">
      <header className="max-w-xl mx-auto pt-4">
        <div className="flex items-center justify-between mb-4"> 
           <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[20px]"></div>
                <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={64} height={64} className="w-full h-full object-contain relative z-10" alt="Logo" />
              </div>
              <h1 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none text-emerald-400/80">Premium Service</h1>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {INFO_CARDS.map((card) => (
            <div key={card.id} className="relative p-5 rounded-[2.2rem] border border-white/5 bg-black/20 flex flex-col items-center justify-center text-center">
              <p className="text-[15px] font-black italic tracking-[0.1em] text-white uppercase">{card.value}</p>
              <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">{card.title}</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full" style={{ backgroundColor: card.color }}></div>
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-8">
        {recentUpdates.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <BadgeIcon type="NEW" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Recent Updates</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
              {recentUpdates.map((p, idx) => (<div key={p.id} className="w-[160px] shrink-0 snap-start"><HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} /></div>))}
            </div>
          </section>
        )}

        <div className="space-y-5 pt-2">
          {/* Рехдеринг категорий в нужном порядке: Silver -> Golden -> Premium -> Selected */}
          {gradeSections.map(({ grade, items, priceRef }) => (
            <div key={grade.id} className="rounded-[1.8rem] overflow-hidden border border-white/5 bg-black/20">
              <button onClick={() => setOpenGrades(p => p.includes(grade.id) ? p.filter(x => x !== grade.id) : [...p, grade.id])} className="w-full px-6 py-6 flex flex-col items-start active:bg-white/5 transition-colors">
                <div className="w-full flex items-center justify-between mb-5">
                  <div className="flex items-center"><grade.icon size={18} style={{ color: grade.color }} className="mr-3" /><h2 className="text-[13px] font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2></div>
                  <ChevronDown size={16} className={`opacity-20 transition-transform duration-300 ${openGrades.includes(grade.id) ? 'rotate-180' : ''}`} />
                </div>
                <div className="w-full flex flex-row justify-between items-center opacity-80 px-1">
                   {[1, 5, 10, 20].map(w => (
                     <div key={w} className="flex items-baseline gap-1">
                       <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">{w}g</span>
                       <span className="text-[16px] font-black italic text-white tracking-tighter leading-none">{Math.round(getInterpolatedPrice(w, priceRef.prices, false)) || '—'}฿</span>
                     </div>
                   ))}
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ${openGrades.includes(grade.id) ? 'max-h-[3000px]' : 'max-h-0'}`}>
                <div className="divide-y divide-white/5 bg-white/5">
                  {items.map((p: any) => <ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />)}
                </div>
              </div>
            </div>
          ))}

          {/* Затем Local и Import */}
          {eliteSections.map(sec => sec.items.length > 0 && (
            <div key={sec.id} className="rounded-[1.8rem] overflow-hidden border border-white/5 bg-black/20">
              <button onClick={() => setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id])} className="w-full px-6 py-5 flex items-center justify-between active:bg-white/5 transition-colors">
                <div className="flex items-center"><sec.icon size={18} style={{ color: sec.color }} className="mr-3" /><h2 className="text-[13px] font-black italic uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                <ChevronDown size={16} className={`opacity-20 transition-transform duration-300 ${openGrades.includes(sec.id) ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-500 ${openGrades.includes(sec.id) ? 'max-h-[3000px]' : 'max-h-0'}`}><div className="bg-white/5">{sec.items.map(p => (<ExclusiveCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />))}</div></div>
            </div>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-white/10 backdrop-blur-2xl text-white p-5 rounded-[2.2rem] border border-white/20 shadow-2xl flex justify-between items-center active:scale-95 transition-all">
            <div className="flex items-center gap-3"><ShoppingBag size={20} className="text-emerald-400"/><span className="font-black uppercase text-[13px] tracking-[0.1em]">{getTotal()}฿ Total</span></div>
            <div className="flex items-center gap-2 text-emerald-400"><span className="text-[10px] font-black uppercase">Order</span><Send size={18}/></div>
          </button>
        </div>
      )}
    </div>
  );
}
