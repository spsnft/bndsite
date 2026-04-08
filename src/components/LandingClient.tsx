"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Plus, Tag, Zap, X, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Trash2, ChevronDown, Star, Phone, 
  Droplets, Snowflake, Box, Sparkles, Flame, Percent,
  ShieldCheck, Clock, CheckCircle2
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { BlurImage } from "@/components/blur-image"
import { translations } from "@/lib/translations"

// --- КОНСТАНТЫ ---
const SELECTED_COLOR = "#2DD4BF"; 
const IMPORT_COLOR = "#60A5FA";
const CONCENTRATES_COLOR = "#F59E0B"; 

const GRADES = [
  { id: "silver", title: "SILVER GRADE", color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", color: "#FEC107", icon: Star },
  { id: "premium", title: "PREMIUM GRADE", color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", color: "#A855F7", icon: Crown }
];

const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, phKey: "contactPh" },
  { id: "whatsapp", label: "WhatsApp", icon: Phone, phKey: "contactPh" },
  { id: "line", label: "Line", icon: MessageCircle, phKey: "contactPh" },
  { id: "instagram", label: "Instagram", icon: Instagram, phKey: "contactPh" },
];

const TYPE_COLORS: Record<string, string> = { "indica": "#A855F7", "sativa": "#FBBF24", "hybrid": "#2DD4BF" };

// --- HELPERS ---

const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
    const haptic = (window as any).Telegram.WebApp.HapticFeedback;
    if (type === 'success') haptic.notificationOccurred('success');
    else haptic.impactOccurred(type);
  }
};

const processProductData = (rawProducts: any[]) => {
  return rawProducts.map(p => {
    const prices: any = {};
    const oldPrices: any = {};
    Object.keys(p).forEach(key => {
      if (key.startsWith('price_')) {
        const weight = key.replace('price_', '').replace('g', '');
        prices[weight] = p[key];
      }
      if (key.startsWith('oldprice_')) {
        const weight = key.replace('oldprice_', '').replace('g', '');
        oldPrices[weight] = p[key];
      }
    });
    return {
      ...p,
      prices: Object.keys(prices).length ? prices : p.prices,
      old_prices: Object.keys(oldPrices).length ? oldPrices : null
    };
  });
};

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

const getFirstAvailablePrice = (product: any) => {
  const isEliteProduct = isElite(product);
  const steps = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
  const keyMap: Record<number, number> = isEliteProduct ? { 3.5: 1, 7: 5, 14: 10, 28: 20 } : { 1: 1, 5: 5, 10: 10, 20: 20 };
  for (let w of steps) {
    const price = Number(product.prices?.[keyMap[w]]) || 0;
    if (price > 0) return { price: Math.round(price), weight: w };
  }
  return { price: 0, weight: 0 };
};

// --- UI HELPERS ---

// Оптическое выравнивание символа бата
const Baht = ({ className = "" }: { className?: string }) => (
  <span className={`inline-block text-[0.85em] -translate-y-[0.05em] ml-0.5 font-sans ${className}`}>฿</span>
);

// --- COMPONENTS ---

const BadgeIcon = React.memo(({ type, isSmall }: { type: string, isSmall?: boolean }) => {
  const iconSize = isSmall ? 13 : 18;
  const colorClass = {
    NEW: "text-blue-400",
    SALE: "text-emerald-400",
    HIT: "text-orange-400"
  }[type.toUpperCase()] || "text-white";

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

const HighlightCard = React.memo(({ item, onClick, priority, hideBadge, isMini, showSubcategory }: { item: any, onClick: () => void, priority?: boolean, hideBadge?: boolean, isMini?: boolean, showSubcategory?: boolean }) => {
  const accentColor = item.category === 'concentrates' 
    ? (item.subcategory?.toLowerCase().includes('fresh frozen premium') ? "#34D399" : item.subcategory?.toLowerCase().includes('fresh frozen') ? "#FEC107" : SELECTED_COLOR)
    : (isElite(item) ? (item.subcategory?.toLowerCase().includes('import') ? IMPORT_COLOR : SELECTED_COLOR) : (GRADES.find(g => g.id === item.subcategory)?.color || SELECTED_COLOR));
  
  const { price: currentPrice, weight: firstWeight } = getFirstAvailablePrice(item);
  const oldPriceRaw = item.old_prices ? getInterpolatedPrice(firstWeight, item.old_prices, isElite(item)) : 0;
  const oldPrice = Math.round(oldPriceRaw);

  return (
    <div 
      onClick={() => { triggerHaptic('light'); onClick(); }} 
      className={`relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group flex flex-col overflow-hidden border border-white/5 ${isMini ? 'h-[180px]' : 'h-[240px]'} bg-[#1d4837]/60 backdrop-blur-xl`} 
      style={{ boxShadow: `inset 0 0 0 1px ${accentColor}20` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
      {!hideBadge && item.badge && (<div className={`absolute top-3 right-3 z-20 ${isMini ? 'scale-90' : 'scale-100'}`}><BadgeIcon type={item.badge} /></div>)}
      <div className={`relative z-10 p-5 pb-0 flex-1 flex flex-col min-h-0`}>
        <div className="min-w-0 pr-6">
          <h3 className={`${isMini ? 'text-[12px]' : 'text-[14px]'} font-black uppercase tracking-tight leading-tight text-white`}>{item.name}</h3>
          {showSubcategory && (
            <p className={`${isMini ? 'text-[9px]' : 'text-[10px]'} font-bold mt-1 text-white/40 uppercase tracking-widest`}>{item.subcategory || "Product"}</p>
          )}
        </div>
        <div className="relative flex-1 w-full min-h-0 flex items-center justify-center my-2">
            <BlurImage src={item.image} priority={priority} width={200} height={200} className="max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]" alt={item.name} />
        </div>
      </div>
      <div className={`relative z-10 flex justify-between items-end px-5 pb-5 mt-auto`}>
        <span className={`${isMini ? 'text-[9px]' : 'text-[10px]'} font-black uppercase tracking-widest`} style={{ color: TYPE_COLORS[item.type?.toLowerCase()] || "#FFF" }}>{item.type}</span>
        <div className="flex flex-col items-end gap-1">
          {oldPrice > currentPrice && <span className={`${isMini ? 'text-[10px]' : 'text-[12px]'} font-bold line-through opacity-30 text-white leading-none`}>{oldPrice}<Baht /></span>}
          <p className={`${isMini ? 'text-[16px]' : 'text-[20px]'} font-black tracking-tighter leading-none`} style={{ color: accentColor }}>{currentPrice > 0 ? (<>{currentPrice}<Baht /></>) : '—'}</p>
        </div>
      </div>
    </div>
  );
});

const ProductRow = React.memo(({ p, onClick }: { p: any, onClick: () => void }) => (
  <div onClick={() => { triggerHaptic('light'); onClick(); }} className="flex items-center justify-between gap-3 px-4 py-4 active:bg-white/5 transition-colors cursor-pointer group text-white border-b border-white/5 last:border-none">
    <div className="flex items-center gap-4 truncate flex-1">
      <div className="w-8 flex justify-center shrink-0">{p.badge && <BadgeIcon type={p.badge} isSmall={true} />}</div>
      <span className="text-[14px] font-black uppercase tracking-tight text-white/90 truncate leading-tight">{p.name}</span>
    </div>
    <div className="flex items-center gap-5 shrink-0 pr-4">
      {p.farm && p.farm !== "-" && <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate max-w-[90px]">{p.farm}</span>}
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{p.type}</span>
    </div>
  </div>
));

// --- MODALS ---

function ProductModal({ product, style, onClose, t }: { product: any, style: any, onClose: () => void, t: any }) {
  const isEliteProduct = isElite(product);
  const steps = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
  const weightToKey: Record<number, number> = isEliteProduct ? { 3.5: 1, 7: 5, 14: 10, 28: 20 } : { 1: 1, 5: 5, 10: 10, 20: 20 };
  
  const availableSteps = steps.filter(w => (Number(product.prices?.[weightToKey[w]]) || 0) > 0);
  const minW = availableSteps[0];
  const maxW = availableSteps[availableSteps.length - 1];

  const [weight, setWeight] = React.useState(minW || steps[0]);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);
  
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices, isEliteProduct));
  const oldPrice = product.old_prices ? Math.round(getInterpolatedPrice(weight, product.old_prices, isEliteProduct)) : 0;
  const perGram = weight > 0 ? Math.round(currentPrice / weight) : 0;

  const nextStep = availableSteps.find(w => w > weight);
  const promoInfo = React.useMemo(() => {
    if (!nextStep) return null;
    const nextPrice = Math.round(getInterpolatedPrice(nextStep, product.prices, isEliteProduct));
    const nextPerGram = Math.round(nextPrice / nextStep);
    return { diff: (nextStep - weight).toFixed(1).replace('.0', ''), perGram: nextPerGram };
  }, [weight, nextStep, product.prices, isEliteProduct]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-[400px] bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-1.5 bg-black/40 rounded-full text-white/50 hover:text-white transition-colors"><X size={18}/></button>
        
        <div className="relative aspect-[1.3/1] w-full bg-black/10">
          <BlurImage src={product?.image} width={400} height={400} className="w-full h-full object-contain p-4" alt={product?.name} />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#193D2E] via-[#193D2E]/90 to-transparent">
            <h2 className="text-[20px] font-black uppercase tracking-tighter text-white">{product?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: TYPE_COLORS[product?.type?.toLowerCase()] }}>{product?.type}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="text-[12px] font-black uppercase tracking-widest opacity-60" style={{ color: style?.color }}>{product?.subcategory}</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8 space-y-6">
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                {oldPrice > currentPrice && <span className="text-lg font-black line-through opacity-20 text-white">{oldPrice}<Baht /></span>}
                <span className="text-[30px] font-black tracking-tighter text-white leading-none">{currentPrice}<Baht className="opacity-40" /></span>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-[14px] font-black uppercase text-white tracking-tighter">{weight}G</div>
                <div className="text-[9px] font-black uppercase opacity-40 text-white tracking-widest">{perGram}<Baht />/G</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {availableSteps.map((v) => (
                <button 
                  key={v} 
                  onClick={() => { triggerHaptic('light'); setWeight(v); }}
                  className={`py-3 rounded-xl text-[12px] font-black transition-all border ${weight === v ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5'}`}
                >
                  {v}G
                </button>
              ))}
            </div>

            <div className="relative h-14 flex items-center group">
              <div className="absolute left-0 right-0 h-3 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-75" 
                  style={{ width: `${((weight - minW) / (maxW - minW)) * 100}%` }}
                ></div>
              </div>
              
              <input 
                type="range" 
                min={minW} 
                max={maxW} 
                step="0.5" 
                value={weight} 
                onChange={(e) => { 
                  const newW = parseFloat(e.target.value);
                  if (newW !== weight) triggerHaptic('light');
                  setWeight(newW); 
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 
                           appearance-none -webkit-appearance-none
                           [&::-webkit-slider-thumb]:w-14 [&::-webkit-slider-thumb]:h-14 [&::-webkit-slider-thumb]:appearance-none
                           [&::-moz-range-thumb]:w-14 [&::-moz-range-thumb]:h-14 [&::-moz-range-thumb]:appearance-none"
              />
              
              <div 
                className="absolute w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] pointer-events-none transition-all duration-75 flex items-center justify-center border-4 border-[#193D2E] z-10"
                style={{ 
                  left: `calc(${((weight - minW) / (maxW - minW)) * 100}% - 16px)`,
                  marginLeft: weight === minW ? '16px' : weight === maxW ? '-16px' : '0px'
                }}
              >
                 <div className="w-2 h-2 bg-[#193D2E] rounded-full"></div>
              </div>
            </div>
          </div>

          {promoInfo && (
            <div className="relative py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl overflow-hidden animate-pulse">
              <p className="text-[10px] font-black uppercase tracking-tighter text-emerald-400 text-center">
                Add <span className="text-white">{promoInfo.diff}g</span> more for <span className="text-white">{promoInfo.perGram}<Baht /></span> per gram!
              </p>
            </div>
          )}

          <button 
            onClick={() => { 
              triggerHaptic('success');
              addItem({ ...product, price: currentPrice, weight: `${weight}g`, subcategory: product.subcategory, type: product.type, image: product.image, prices: product.prices }); 
              setIsAdded(true); 
              setTimeout(() => {setIsAdded(false); onClose();}, 800); 
            }} 
            className={`w-full py-2.5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}
          >
            {isAdded ? t.added : t.addToOrder}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ items, total, onClose, t, lang, onEditItem }: { items: any[], total: number, onClose: () => void, t: any, lang: string, onEditItem: (p: any) => void }) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { clearCart, removeItem } = useCart();

  const categoryPromos = React.useMemo(() => {
    const groups: Record<string, { weight: number, prices: any, isElite: boolean, sub: string }> = {};
    
    items.forEach(item => {
      const sub = item.subcategory?.toLowerCase() || "other";
      if (isElite(item)) return;

      const w = parseFloat(item.weight) || 0;
      if (!groups[sub]) {
        groups[sub] = { weight: 0, prices: item.prices, isElite: false, sub: item.subcategory };
      }
      groups[sub].weight += w;
    });

    return Object.values(groups).map(group => {
      const steps = [1, 5, 10, 20];
      const nextStep = steps.find(s => s > group.weight);
      
      if (!nextStep || !group.prices) return null;

      const nextPrice = Math.round(getInterpolatedPrice(nextStep, group.prices, false));
      const nextPerGram = Math.round(nextPrice / nextStep);
      const diff = (nextStep - group.weight).toFixed(1).replace('.0', '');
      
      const gradeInfo = GRADES.find(g => g.id === group.sub.toLowerCase()) || { color: SELECTED_COLOR };

      return {
        sub: group.sub,
        diff,
        nextPerGram,
        color: gradeInfo.color,
        nextStep
      };
    }).filter(Boolean);
  }, [items]);

  const handleSubmit = async () => {
    if (!contact) return alert(t.contactPh);
    setIsSending(true);
    triggerHaptic('medium');
    try {
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ contact, method, orderText: items.map(i => `${i.name} (${i.weight}) x${i.quantity} — ${i.price * i.quantity}<Baht />`).join("\n"), total }) });
      triggerHaptic('success');
      alert(t.orderSent); clearCart(); onClose();
    } catch (e) { alert(t.sendError); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10 text-white">
          <div><h2 className="text-xl font-black uppercase tracking-tighter">{t.yourBasket}</h2><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{items.length} {t.items}</p></div>
          <button onClick={onClose} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {categoryPromos.length > 0 && (
            <div className="space-y-2">
              {categoryPromos.map((promo: any) => (
                <div key={promo.sub} className="relative p-4 rounded-2xl overflow-hidden border border-white/5" style={{ background: `linear-gradient(135deg, ${promo.color}15 0%, rgba(0,0,0,0.4) 100%)` }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/5" style={{ color: promo.color }}><Sparkles size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase tracking-wide">
                        {lang === 'ru' ? (
                          <>Добавь <span className="font-black" style={{ color: promo.color }}>{promo.diff}г</span> из <span className="font-black" style={{ color: promo.color }}>{promo.sub}</span> и открой цену <span className="font-black" style={{ color: promo.color }}>{promo.nextPerGram}<Baht />/г</span>!</>
                        ) : (
                          <>Add <span className="font-black" style={{ color: promo.color }}>{promo.diff}g</span> of <span className="font-black" style={{ color: promo.color }}>{promo.sub}</span> and unlock <span className="font-black" style={{ color: promo.color }}>{promo.nextPerGram}<Baht />/g</span> price!</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {items.map((item: any) => (
              <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5 text-white">
                <button 
                  onClick={() => { triggerHaptic('light'); onEditItem(item); }}
                  className="flex-1 min-w-0 text-left active:opacity-60 transition-opacity"
                >
                  <h3 className="text-[11px] font-black uppercase truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{item.weight} • {item.price}<Baht /></p>
                    <span className="w-1 h-1 rounded-full bg-white/10 shrink-0"></span>
                    <p className="text-[8px] font-black uppercase tracking-tighter" style={{ color: GRADES.find(g => g.id === item.subcategory?.toLowerCase())?.color || SELECTED_COLOR }}>{item.subcategory}</p>
                    <span className="w-1 h-1 rounded-full bg-white/10 shrink-0"></span>
                    <p className="text-[8px] font-black uppercase tracking-tighter" style={{ color: TYPE_COLORS[item.type?.toLowerCase()] || "#FFF" }}>{item.type}</p>
                  </div>
                </button>
                <button onClick={() => { triggerHaptic('medium'); removeItem(item.id, item.weight); }} className="text-rose-500/30 hover:text-rose-500 transition-colors p-2.5 bg-white/5 rounded-xl"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (<button key={m.id} onClick={() => { triggerHaptic('light'); setMethod(m.id); }} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30 text-white"}`}><m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span></button>))}
          </div>
          <input type="text" placeholder={t[CONTACT_METHODS.find(m => m.id === method)?.phKey || "contactPh"]} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30" />
          <div className="flex items-center justify-between pt-2 text-white"><p className="text-[10px] font-black uppercase opacity-40">{t.totalAmount}</p><p className="text-3xl font-black tracking-tighter">{total}<Baht className="opacity-40" /></p></div>
          <button onClick={handleSubmit} className="w-full bg-emerald-400 text-[#193D2E] py-2.5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-[0.97] hover:animate-pulse transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]">{t.confirmOrder}</button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN LANDING ---
export default function LandingClient({ initialProducts, initialDescriptions = [] }: { initialProducts: any[], initialDescriptions?: any[] }) {
  const processedProducts = React.useMemo(() => processProductData(initialProducts), [initialProducts]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [openGrades, setOpenGrades] = React.useState<string[]>([]);
  
  const { items, getTotal, lang, setLang } = useCart();
  const t = translations[lang as keyof typeof translations];

  const descriptionsMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    initialDescriptions.forEach(d => { if (d.subcategory) map[d.subcategory.toLowerCase().trim()] = d; });
    return map;
  }, [initialDescriptions]);

  const getDesc = (id: string) => {
    const data = descriptionsMap[id.toLowerCase().trim()];
    if (!data) return null;
    return lang === 'ru' ? data.description_ru : data.description_eng;
  };

  const recentUpdates = React.useMemo(() => {
    const news = processedProducts.filter(p => p.badge?.toUpperCase() === 'NEW');
    return [...news].sort((a, b) => {
      const dateA = a.date ? a.date.split('.').reverse().join('') : '0000';
      const dateB = b.date ? b.date.split('.').reverse().join('') : '0000';
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      return getFirstAvailablePrice(b).price - getFirstAvailablePrice(a).price;
    });
  }, [processedProducts]);

  const flashSales = React.useMemo(() => 
    [...processedProducts.filter(p => p.badge?.toUpperCase() === 'SALE')].sort((a, b) => getFirstAvailablePrice(b).price - getFirstAvailablePrice(a).price), 
  [processedProducts]);

  const gradeSections = React.useMemo(() => {
    return GRADES.map(grade => {
      const items = processedProducts.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
      const priceRef = items.find(p => p.badge?.toUpperCase() !== 'SALE') || items[0];
      return { grade, items, priceRef };
    }).filter(g => g.items.length > 0);
  }, [processedProducts]);

  const eliteSections = [
    { id: 'local exclusive', title: 'Local Exclusives', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), color: SELECTED_COLOR, icon: MapPin },
    { id: 'import', title: 'Import', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')), color: IMPORT_COLOR, icon: Star }
  ];

  const concentrateSections = React.useMemo(() => {
    const allConcs = processedProducts.filter(p => p.category === 'concentrates');
    const subs = Array.from(new Set(allConcs.map(p => p.subcategory)));
    return subs.map(sub => {
      let color = SELECTED_COLOR;
      let icon = Droplets;
      const subLower = sub?.toLowerCase() || "";
      
      if (subLower.includes('old school')) { color = "#C1C1C1"; icon = Box; }
      else if (subLower.includes('fresh frozen')) { color = subLower.includes('premium') ? "#34D399" : "#FEC107"; icon = Snowflake; }
      else if (subLower.includes('live rosin')) { color = "#A855F7"; icon = Droplets; }
      
      return { id: sub, title: sub || "Concentrates", items: allConcs.filter(p => p.subcategory === sub), color, icon, isList: subLower.includes('old school') };
    });
  }, [processedProducts]);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32 selection:bg-emerald-500/30">
      <header className="max-w-xl mx-auto pt-2 mb-4">
        <div className="flex items-center justify-between px-2"> 
           <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[35px]"></div>
              <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={84} height={84} className="w-20 h-20 object-contain relative z-10" alt="Logo" />
           </div>
           <div className="flex items-center flex-1 justify-end">
              <div className="flex gap-2">
                {[ {icon: SendHorizontal, url: "https://t.me/bshk_phuket"}, {icon: Phone, url: "https://bndeliveryphuket.click/wa"}, {icon: Instagram, url: "https://www.instagram.com/boshkunadoroshku"} ].map((soc, i) => (
                  <Link key={i} href={soc.url} target="_blank" className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all"><soc.icon size={20} className="opacity-60"/></Link>
                ))}
              </div>
              <button onClick={() => { triggerHaptic('light'); setLang(lang === 'en' ? 'ru' : 'en'); }} className="ml-6 w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 font-black text-[9px] text-emerald-400 active:scale-90 transition-all shrink-0">
                {lang === 'en' ? 'RU' : 'EN'}
              </button>
           </div>
        </div>

        {/* --- ВАРИАНТЫ БЛОКА "О НАС" --- */}
        <div className="px-2 mt-12 space-y-16">
          
          {/* Вариант 1: Текстовый акцент (Минимализм) */}
          <div className="border-l-2 border-emerald-500/30 pl-6">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-emerald-500/50 mb-3 uppercase">About BND</h3>
            <p className="text-[15px] font-medium leading-relaxed text-white/80 uppercase tracking-wide">
              {lang === 'ru' 
                ? "Твой надежный проводник в мире премиального качества на Пхукете. Только проверенные сорта и быстрая доставка."
                : "Your trusted premium quality guide in Phuket. Only hand-picked strains and lightning-fast delivery."}
            </p>
          </div>

          {/* Вариант 2: Карточки преимуществ (Информативный) */}
          <div className="grid grid-cols-1 gap-3">
             <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><ShieldCheck size={20}/></div>
                <div>
                  <h4 className="text-[12px] font-black uppercase tracking-widest mb-1">{lang === 'ru' ? 'Качество' : 'Quality Control'}</h4>
                  <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase">{lang === 'ru' ? 'Личный отбор каждой партии и гарантия чистоты.' : 'Personal selection of every batch with purity guarantee.'}</p>
                </div>
             </div>
             <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400"><Clock size={20}/></div>
                <div>
                  <h4 className="text-[12px] font-black uppercase tracking-widest mb-1">{lang === 'ru' ? 'Сервис' : 'Express Delivery'}</h4>
                  <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase">{lang === 'ru' ? 'Среднее время ожидания — до 60 минут в любую точку.' : 'Average wait time — under 60 minutes anywhere in Phuket.'}</p>
                </div>
             </div>
          </div>

          {/* Вариант 3: Эстетика бренда (Визуальный) */}
          <div className="relative py-12 px-8 rounded-[3rem] overflow-hidden bg-black/40 border border-white/5 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
            <CheckCircle2 size={32} className="mx-auto mb-6 text-emerald-500 opacity-50" />
            <h3 className="text-[20px] font-black uppercase tracking-tighter text-white mb-3">BND Phuket Delivery</h3>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] leading-loose">
               {lang === 'ru' ? 'Стандарты качества • Честный вес • Прямые поставки' : 'Quality Standards • Fair Weight • Direct Supply'}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 gap-2 mt-16">
          {[
            { id: 1, titleKey: "dailySupport", value: "12:00—00:00" },
            { id: 3, titleKey: "minOrder", value: (<>1000<Baht /></>) },
            { id: 2, titleKey: "delivery", value: "60 MINUTES" },
            { id: 4, titleKey: "nationwide", value: "2-3 DAYS" },
          ].map((card) => (
            <div key={card.id} className="relative p-4 rounded-[1.8rem] border border-white/5 bg-[#1d4837]/60 backdrop-blur-xl flex flex-col items-center justify-center text-center">
              <div className="text-[16px] font-black tracking-[0.05em] text-white uppercase leading-tight">{card.value}</div>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/30 mt-1 leading-tight">{(t as any)[card.titleKey]}</p>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.3)]"></div>
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-3">
        {recentUpdates.length > 0 && (
          <section className="space-y-3 overflow-hidden">
            <div className="flex items-center gap-2 px-2"><BadgeIcon type="NEW" /><h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/80">{t.updates}</h2></div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar mx-[-1rem] px-4 snap-x">{recentUpdates.map((p, idx) => (<div key={p.id} className="w-[180px] shrink-0 snap-start"><HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} hideBadge={true} isMini={false} showSubcategory={true} /></div>))}</div>
          </section>
        )}

        {flashSales.length > 0 && (
          <section className="space-y-3 overflow-hidden">
            <div className="flex items-center gap-2 px-2"><BadgeIcon type="SALE" /><h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/80">{t.sales}</h2></div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar mx-[-1rem] px-4 snap-x">{flashSales.map((p, idx) => (<div key={p.id} className="w-[180px] shrink-0 snap-start"><HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} hideBadge={true} isMini={false} showSubcategory={true} /></div>))}</div>
          </section>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-4 py-4">
             <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-500/10 to-emerald-500/30"></div>
             <span className="text-[16px] font-black uppercase tracking-[0.3em] text-emerald-400/80">{t.flowerMenu}</span>
             <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-emerald-500/10 to-emerald-500/30"></div>
          </div>

          {gradeSections.map(({ grade, items, priceRef }) => {
            const isOpen = openGrades.includes(grade.id);
            return (
              <div 
                key={grade.id} 
                className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`}
                style={{ borderColor: isOpen ? `${grade.color}80` : 'rgba(255,255,255,0.05)', boxShadow: isOpen ? `0 0 20px ${grade.color}15` : 'none' }}
              >
                <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(grade.id) ? p.filter(x => x !== grade.id) : [...p, grade.id]); }} className="w-full px-4 py-8 flex flex-col active:bg-white/5 transition-colors">
                  <div className="w-full flex items-center justify-between mb-4 px-4">
                    <div className="flex items-center gap-3"><grade.icon size={22} style={{ color: grade.color }} /><h2 className="text-[16px] font-black uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2></div>
                    <ChevronDown size={20} className={`opacity-20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {getDesc(grade.id) && (<p className="px-4 mb-6 text-[11px] font-medium text-white/40 leading-relaxed text-left uppercase tracking-wide">{getDesc(grade.id)}</p>)}
                  <div className="w-full grid grid-cols-4 gap-2 px-4">
                     {[1, 5, 10, 20].map(w => {
                       const p = Math.round(getInterpolatedPrice(w, priceRef.prices, false));
                       return (
                         <div key={w} className="flex flex-col items-center gap-1 bg-white/5 py-3.5 rounded-2xl border border-white/5">
                           <span className="text-[12px] font-black opacity-60 uppercase tracking-widest">{w}g</span>
                           <span className="text-[18px] font-black text-white tracking-tighter leading-none">{p > 0 ? (<>{p}<Baht /></>) : '—'}</span>
                         </div>
                       )
                     })}
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
                  <div className="divide-y divide-white/5 bg-white/5">{items.map((p: any) => (<ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />))}</div>
                </div>
              </div>
            );
          })}

          {eliteSections.map(sec => {
            const isOpen = openGrades.includes(sec.id);
            return sec.items.length > 0 && (
              <div 
                key={sec.id} 
                className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`}
                style={{ borderColor: isOpen ? `${sec.color}80` : 'rgba(255,255,255,0.05)', boxShadow: isOpen ? `0 0 20px ${sec.color}15` : 'none' }}
              >
                <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id]); }} className="w-full px-8 py-6 flex flex-col active:bg-white/5 transition-colors">
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3"><sec.icon size={22} style={{ color: sec.color }} /><h2 className="text-[16px] font-black uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                    <ChevronDown size={20} className={`opacity-20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {getDesc(sec.id) && (<p className="mt-3 text-[11px] font-medium text-white/40 leading-relaxed text-left uppercase tracking-wide">{getDesc(sec.id)}</p>)}
                </button>
                <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
                  <div className="p-6 grid grid-cols-2 gap-4 bg-white/5">{sec.items.map(p => (<HighlightCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} showSubcategory={false} />))}</div>
                </div>
              </div>
            );
          })}

          {concentrateSections.length > 0 && (
            <>
              <div className="flex items-center gap-6 py-10">
                 <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/10 to-amber-500/30"></div>
                 <span className="text-[16px] font-black uppercase tracking-[0.3em] text-amber-500/80">{lang === 'ru' ? 'КОНЦЕНТРАТЫ' : 'CONCENTRATES'}</span>
                 <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-500/10 to-amber-500/30"></div>
              </div>
              {concentrateSections.map(sec => {
                const isOpen = openGrades.includes(sec.id);
                return (
                  <div 
                    key={sec.id} 
                    className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`}
                    style={{ borderColor: isOpen ? `${sec.color}80` : 'rgba(255,255,255,0.05)', boxShadow: isOpen ? `0 0 20px ${sec.color}15` : 'none' }}
                  >
                    <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id]); }} className="w-full px-8 py-6 flex flex-col active:bg-white/5 transition-colors">
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3"><sec.icon size={22} style={{ color: sec.color }} /><h2 className="text-[16px] font-black uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                        <ChevronDown size={20} className={`opacity-20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                      {getDesc(sec.id) && (<p className="mt-3 text-[11px] font-medium text-white/40 leading-relaxed text-left uppercase tracking-wide">{getDesc(sec.id)}</p>)}
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
                      {sec.isList ? (
                        <div className="divide-y divide-white/5 bg-white/5">{sec.items.map(p => (<ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />))}</div>
                      ) : (
                        <div className="p-6 grid grid-cols-2 gap-4 bg-white/5">{sec.items.map(p => (<HighlightCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} showSubcategory={false} />))}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6">
          <button onClick={() => { triggerHaptic('medium'); setIsCheckoutOpen(true); }} className="w-full bg-white/10 backdrop-blur-2xl text-white py-3 px-7 rounded-[2.5rem] border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex justify-between items-center active:scale-95 transition-all overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-2 bg-emerald-400/20 rounded-xl"><ShoppingBag size={20} className="text-emerald-400"/></div>
              <div className="text-left">
                 <div className="block font-black uppercase text-[18px] tracking-tight leading-none mb-0.5">{getTotal()}<Baht /></div>
                 <span className="block font-black uppercase text-[9px] tracking-widest text-emerald-400 leading-none">{items.length} {t.items}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white relative z-10 opacity-70">
              <span className="text-[12px] font-black uppercase tracking-widest">{t.basket}</span>
              <Send size={18}/>
            </div>
          </button>
        </div>
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} t={t}
          style={
            selectedProduct.category === 'concentrates' 
            ? { color: concentrateSections.find(s => s.id === selectedProduct.subcategory)?.color || CONCENTRATES_COLOR }
            : (isElite(selectedProduct) ? {color: selectedProduct.subcategory?.toLowerCase().includes('import') ? IMPORT_COLOR : SELECTED_COLOR} : (GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }))
          } 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      {isCheckoutOpen && (
        <CheckoutModal 
          items={items} 
          total={getTotal()} 
          t={t} 
          lang={lang} 
          onClose={() => setIsCheckoutOpen(false)} 
          onEditItem={(p) => { setSelectedProduct(p); setIsCheckoutOpen(false); }}
        />
      )}
    </div>
  );
}
