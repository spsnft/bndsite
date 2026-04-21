import * as React from "react"
import { Plus, Tag, Zap } from "lucide-react"
import { BlurImage } from "@/components/blur-image"
import { GRADES, TYPE_COLORS, SELECTED_COLOR, IMPORT_COLOR, GOLDEN_COLOR } from "./constants"
import { triggerHaptic, getFirstAvailablePrice, getInterpolatedPrice, isElite } from "@/lib/utils"

export const Baht = ({ className = "" }: { className?: string }) => (
  <span className={`inline-block text-[0.85em] -translate-y-[0.05em] ml-0.5 font-sans ${className}`}>฿</span>
);

export const BadgeIcon = React.memo(({ type, isSmall }: { type: string, isSmall?: boolean }) => {
  const iconSize = isSmall ? 13 : 18;
  const colorClass = { NEW: "text-blue-400", SALE: "text-emerald-400", HIT: "text-orange-400" }[type.toUpperCase()] || "text-white";
  const iconWrapper = (icon: React.ReactNode) => (
    <div className={`${isSmall ? '' : 'p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg'}`}>
      {icon}
    </div>
  );
  switch (type.toUpperCase()) {
    case "NEW": return iconWrapper(<Plus size={iconSize} className={colorClass} strokeWidth={3} />);
    case "SALE": return iconWrapper(<Tag size={iconSize} className={colorClass} strokeWidth={2.5} />);
    case "HIT": return iconWrapper(<Zap size={iconSize} className={colorClass} strokeWidth={2.5} fill="currentColor" fillOpacity={0.2} />);
    default: return null;
  }
});

export const HighlightCard = React.memo(({ item, onClick, priority, hideBadge, isMini, showSubcategory }: any) => {
  const sub = item.subcategory?.toLowerCase() || "";
  
  // Определяем основной цвет. Если это classic — берем золотой.
  const accentColor = item.category === 'concentrates' 
    ? (sub.includes('fresh frozen premium') ? "#34D399" : sub.includes('fresh frozen') ? "#FEC107" : SELECTED_COLOR)
    : (isElite(item) ? (sub.includes('import') ? IMPORT_COLOR : SELECTED_COLOR) : (sub === 'classic' ? GOLDEN_COLOR : (GRADES.find(g => g.id === sub)?.color || SELECTED_COLOR)));
  
  const { price: currentPrice, weight: firstWeight } = getFirstAvailablePrice(item);
  const oldPrice = item.old_prices ? Math.round(getInterpolatedPrice(firstWeight, item.old_prices, isElite(item))) : 0;

  return (
    <div 
      onClick={() => { triggerHaptic('light'); onClick(); }} 
      className={`relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer flex flex-col overflow-hidden border border-white/5 ${isMini ? 'h-[180px]' : 'h-[240px]'} bg-[#1d4837]/60 backdrop-blur-xl`} 
      style={{ boxShadow: `inset 0 0 0 1px ${accentColor}20` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
      {!hideBadge && item.badge && (<div className="absolute top-3 right-3 z-20"><BadgeIcon type={item.badge} /></div>)}
      <div className="relative z-10 p-5 flex-1 flex flex-col">
        <h3 className="text-[14px] font-black uppercase text-white leading-tight">{item.name}</h3>
        {showSubcategory && <p className="text-[10px] font-bold mt-1 text-white/40 uppercase">{item.subcategory}</p>}
        <div className="flex-1 flex items-center justify-center my-2">
            <BlurImage src={item.image} priority={priority} width={200} height={200} className="max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]" alt={item.name} />
        </div>
      </div>
      <div className="relative z-10 flex justify-between items-end px-5 pb-5">
        <span className="text-[9px] font-black uppercase" style={{ color: TYPE_COLORS[item.type?.toLowerCase()] }}>{item.type}</span>
        <div className="flex flex-col items-end">
          {oldPrice > currentPrice && <span className="text-[12px] line-through opacity-30 text-white">{oldPrice}<Baht /></span>}
          <p className="text-[20px] font-black" style={{ color: accentColor }}>{currentPrice > 0 ? <>{currentPrice}<Baht /></> : '—'}</p>
        </div>
      </div>
    </div>
  );
});

export const ProductRow = React.memo(({ p, onClick }: any) => (
  <div onClick={() => { triggerHaptic('light'); onClick(); }} className="flex items-center justify-between gap-3 px-4 py-4 active:bg-white/5 transition-colors cursor-pointer text-white border-b border-white/5 last:border-none">
    <div className="flex items-center gap-4 truncate flex-1">
      <div className="w-8 flex justify-center">{p.badge && <BadgeIcon type={p.badge} isSmall={true} />}</div>
      <div className="flex flex-col truncate">
        <span className="text-[14px] font-black uppercase truncate">{p.name}</span>
        {p.badge?.toUpperCase() === 'SALE' && <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-tighter">Special Offer</span>}
      </div>
    </div>
    <div className="flex items-center gap-5 shrink-0 pr-4">
      <span className="text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] }}>{p.type}</span>
    </div>
  </div>
));
