"use client"
import * as React from "react"
import Link from "next/link"
import { 
  Plus, Tag, Zap, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, ChevronDown, Star, Phone, 
  Droplets, Snowflake, Box, Sparkles, Flame, Percent,
  ShieldCheck, Clock, CheckCircle2, Trophy, Users, RefreshCcw,
  Bike, Wallet, Globe, Timer, HelpCircle, CreditCard
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { BlurImage } from "@/components/blur-image"
import { translations } from "@/lib/translations"
import { ProductModal, CheckoutModal } from "@/components/modals"
import { 
  triggerHaptic, getFirstAvailablePrice, getInterpolatedPrice, isElite,
  TYPE_COLORS, GRADES, SELECTED_COLOR, IMPORT_COLOR, CONCENTRATES_COLOR, Baht 
} from "@/lib/utils"

// --- INTERNAL HELPERS ---
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
      old_prices: Object.keys(oldPrices).length ? oldPrices : p.old_prices
    };
  });
};

const BadgeIcon = React.memo(({ type, isSmall }: { type: string, isSmall?: boolean }) => {
  const iconSize = isSmall ? 13 : 18;
  const colorClass = { NEW: "text-blue-400", SALE: "text-emerald-400", HIT: "text-orange-400" }[type.toUpperCase()] || "text-white";
  const iconWrapper = (icon: React.ReactNode) => (
    <div className={`${isSmall ? '' : 'p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg'}`}>{icon}</div>
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
    <div onClick={() => { triggerHaptic('light'); onClick(); }} className={`relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group flex flex-col overflow-hidden border border-white/5 ${isMini ? 'h-[180px]' : 'h-[240px]'} bg-[#1d4837]/60 backdrop-blur-xl`} style={{ boxShadow: `inset 0 0 0 1px ${accentColor}20` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
      {!hideBadge && item.badge && (<div className={`absolute top-3 right-3 z-20 ${isMini ? 'scale-90' : 'scale-100'}`}><BadgeIcon type={item.badge} /></div>)}
      <div className="relative z-10 p-5 pb-0 flex-1 flex flex-col min-h-0">
        <div className="min-w-0 pr-6">
          <h3 className={`${isMini ? 'text-[12px]' : 'text-[14px]'} font-black uppercase tracking-tight leading-tight text-white`}>{item.name}</h3>
          {showSubcategory && (<p className={`${isMini ? 'text-[9px]' : 'text-[10px]'} font-bold mt-1 text-white/40 uppercase tracking-widest`}>{item.subcategory || "Product"}</p>)}
        </div>
        <div className="relative flex-1 w-full min-h-0 flex items-center justify-center my-2">
            <BlurImage src={item.image} priority={priority} width={200} height={200} className="max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]" alt={item.name} />
        </div>
      </div>
      <div className="relative z-10 flex justify-between items-end px-5 pb-5 mt-auto">
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
  const flashSales = React.useMemo(() => [...processedProducts.filter(p => p.badge?.toUpperCase() === 'SALE')].sort((a, b) => getFirstAvailablePrice(b).price - getFirstAvailablePrice(a).price), [processedProducts]);
  const gradeSections = React.useMemo(() => GRADES.map(grade => {
      const items = processedProducts.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
      const priceRef = items.find(p => p.badge?.toUpperCase() !== 'SALE') || items[0];
      return { grade, items, priceRef };
    }).filter(g => g.items.length > 0), [processedProducts]);
  const eliteSections = [
    { id: 'local exclusive', title: 'Local Exclusives', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), color: SELECTED_COLOR, icon: MapPin },
    { id: 'import', title: 'Import', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')), color: IMPORT_COLOR, icon: Star }
  ];
  const concentrateSections = React.useMemo(() => {
    const allConcs = processedProducts.filter(p => p.category === 'concentrates');
    const subs = Array.from(new Set(allConcs.map(p => p.subcategory)));
    return subs.map(sub => {
      let color = SELECTED_COLOR; let icon = Droplets; const subLower = sub?.toLowerCase() || "";
      if (subLower.includes('old school')) { color = "#C1C1C1"; icon = Box; }
      else if (subLower.includes('fresh frozen')) { color = subLower.includes('premium') ? "#34D399" : "#FEC107"; icon = Snowflake; }
      else if (subLower.includes('live rosin')) { color = "#A855F7"; icon = Droplets; }
      return { id: sub, title: sub || "Concentrates", items: allConcs.filter(p => p.subcategory === sub), color, icon, isList: subLower.includes('old school') };
    });
  }, [processedProducts]);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32 selection:bg-emerald-500/30">
      <header className="max-w-xl mx-auto pt-2 mb-8">
        <div className="flex items-center justify-between px-2 mb-8"> 
           <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[35px]"></div>
              <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={84} height={84} className="w-20 h-20 object-contain relative z-10" alt="Logo" />
           </div>
           <div className="flex items-center flex-1 justify-end">
              <div className="flex gap-2">
                {[ {icon: SendHorizontal, url: "https://t.me/bshk_phuket"}, {icon: Phone, url: "https://bndeliveryphuket.click/wa"}, {icon: Instagram, url: "https://www.instagram.com/boshkunadoroshku"} ].map((soc, i) => (
                  <Link key={i} href={soc.url} target="_blank" className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all"><soc.icon size={20} className="opacity-60"/></Link>
                ))}
              </div>
              <button onClick={() => { triggerHaptic('light'); setLang(lang === 'en' ? 'ru' : 'en'); }} className="ml-6 w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 font-black text-[9px] text-emerald-400 active:scale-90 transition-all shrink-0">{lang === 'en' ? 'RU' : 'EN'}</button>
           </div>
        </div>
        <div className="relative pt-8 pb-6 px-6 text-center bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md overflow-hidden mb-3">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]"></div>
          <CheckCircle2 size={24} className="mx-auto mb-4 text-emerald-500 opacity-60" />
          <h1 className="text-[26px] font-black uppercase tracking-tighter text-white mb-3 relative z-10">{lang === 'ru' ? 'БошкуНаДорожку' : 'BND delivery service'}</h1>
          <p className="text-[13px] font-bold text-white/60 uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto mb-6 relative z-10">{lang === 'ru' ? 'Ваш надежный проводник в мире премиального качества и сервиса' : 'Your trusted guide to a world of premium quality and service'}</p>
          <div className="grid grid-cols-2 gap-3 relative z-10">
             {[ 
               {ru: '3 года на рынке', en: '3 years on market'}, 
               {ru: 'сотни довольных клиентов', en: 'hundreds of happy clients'}, 
               {ru: 'гарантия качества', en: 'quality guarantee'}, 
               {ru: 'регулярные обновления меню', en: 'regular menu updates'} 
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-2xl border border-white/5 min-h-[44px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="text-[8px] font-black uppercase tracking-tight text-white/80 text-left">{lang === 'ru' ? item.ru : item.en}</span>
               </div>
             ))}
          </div>
        </div>
        <div className="relative py-8 px-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md overflow-hidden mb-3">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-[40px]"></div>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-[#F59E0B]/10 rounded-xl text-[#F59E0B]"><HelpCircle size={18}/></div>
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-white/90">{lang === 'ru' ? 'Как заказать' : 'How to order'}</h3>
          </div>
          <div className="space-y-4">
             <div className="flex items-start gap-4">
                <Timer size={16} className="text-[#F59E0B] mt-0.5 shrink-0 opacity-60" />
                <div><p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{lang === 'ru' ? 'Часы работы' : 'Working hours'}</p><p className="text-[12px] font-bold text-white/90 uppercase">12:00 — 00:00</p></div>
             </div>
             <div className="flex items-start gap-4">
                <Plus size={16} className="text-[#F59E0B] mt-0.5 shrink-0 opacity-60" />
                <div><p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{lang === 'ru' ? 'Минимальный заказ' : 'Minimum order'}</p><p className="text-[12px] font-bold text-white/90 uppercase">{lang === 'ru' ? 'От 1000฿, доставка бесплатная' : 'From 1000฿, free delivery'}</p></div>
             </div>
             <div className="flex items-start gap-4">
                <Wallet size={16} className="text-[#F59E0B] mt-0.5 shrink-0 opacity-60" />
                <div><p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{lang === 'ru' ? 'Оплата' : 'Payment'}</p><p className="text-[12px] font-bold text-white/90 uppercase leading-relaxed">{lang === 'ru' ? 'Cash, Transfer, Crypto, Rubles' : 'Cash Baht, transfer, crypto or Rubles'}</p></div>
             </div>
             <div className="flex items-start gap-4">
                <Bike size={16} className="text-[#F59E0B] mt-0.5 shrink-0 opacity-60" />
                <div><p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{lang === 'ru' ? 'Доставка' : 'Delivery'}</p><p className="text-[12px] font-bold text-white/90 uppercase">{lang === 'ru' ? 'Пхукет: 60 мин, Таиланд: 2-3 дня' : 'Phuket: 60 min, Thailand: 2-3 days'}</p></div>
             </div>
          </div>
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
              <div key={grade.id} className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`} style={{ borderColor: isOpen ? `${grade.color}80` : 'rgba(255,255,255,0.05)', boxShadow: isOpen ? `0 0 20px ${grade.color}15` : 'none' }}>
                <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(grade.id) ? p.filter(x => x !== grade.id) : [...p, grade.id]); }} className="w-full px-4 py-8 flex flex-col active:bg-white/5 transition-colors">
                  <div className="w-full flex items-center justify-between mb-4 px-4">
                    <div className="flex items-center gap-3"><grade.icon size={22} style={{ color: grade.color }} /><h2 className="text-[16px] font-black uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2></div>
                    <ChevronDown size={20} className={`opacity-20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {getDesc(grade.id) && (<p className="px-4 mb-6 text-[11px] font-medium text-white/40 leading-relaxed text-left uppercase tracking-wide">{getDesc(grade.id)}</p>)}
                  <div className="w-full grid grid-cols-4 gap-2 px-4">
                     {[1, 5, 10, 20].map(w => {
                       const p = Math.round(Number(priceRef.prices?.[w]) || 0);
                       return (<div key={w} className="flex flex-col items-center gap-1 bg-white/5 py-3.5 rounded-2xl border border-white/5"><span className="text-[12px] font-black opacity-60 uppercase tracking-widest">{w}g</span><span className="text-[18px] font-black text-white tracking-tighter leading-none">{p > 0 ? (<>{p}฿</>) : '—'}</span></div>)
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
              <div key={sec.id} className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`} style={{ borderColor: isOpen ? `${sec.color}80` : 'rgba(255,255,255,0.05)', boxShadow: isOpen ? `0 0 20px ${sec.color}15` : 'none' }}>
                <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id]); }} className="w-full px-8 py-6 flex flex-col active:bg-white/5 transition-colors">
                  <div className="w-full flex items-center justify-between"><div className="flex items-center gap-3"><sec.icon size={22} style={{ color: sec.color }} /><h2 className="text-[16px] font-black uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div><ChevronDown size={20} className={`opacity-20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} /></div>
                  {getDesc(sec.id) && (<p className="mt-3 text-[11px] font-medium text-white/40 leading-relaxed text-left uppercase tracking-wide">{getDesc(sec.id)}</p>)}
                </button>
                <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
                  <div className="p-6 grid grid-cols-2 gap-4 bg-white/5">{sec.items.map(p => (<HighlightCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} showSubcategory={false} />))}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {items.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6">
          <button onClick={() => { triggerHaptic('medium'); setIsCheckoutOpen(true); }} className="w-full bg-white/10 backdrop-blur-2xl text-white py-3 px-7 rounded-[2.5rem] border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex justify-between items-center active:scale-95 transition-all overflow-hidden">
            <div className="flex items-center gap-4 relative z-10"><div className="p-2 bg-emerald-400/20 rounded-xl"><ShoppingBag size={20} className="text-emerald-400"/></div><div className="text-left"><div className="block font-black uppercase text-[18px] tracking-tight leading-none mb-0.5">{getTotal()}฿</div><span className="block font-black uppercase text-[9px] tracking-widest text-emerald-400 leading-none">{items.length} {t.items}</span></div></div>
            <div className="flex items-center gap-3 text-white relative z-10 opacity-70"><span className="text-[12px] font-black uppercase tracking-widest">{t.basket}</span><span className="p-2 bg-white/10 rounded-full animate-pulse"><Send size={18}/></span></div>
          </button>
        </div>
      )}
      {selectedProduct && (<ProductModal product={selectedProduct} t={t} style={selectedProduct.category === 'concentrates' ? { color: concentrateSections.find(s => s.id === selectedProduct.subcategory)?.color || CONCENTRATES_COLOR } : (isElite(selectedProduct) ? {color: selectedProduct.subcategory?.toLowerCase().includes('import') ? IMPORT_COLOR : SELECTED_COLOR} : (GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }))} onClose={() => setSelectedProduct(null)} />)}
      {isCheckoutOpen && (<CheckoutModal items={items} total={getTotal()} t={t} lang={lang} onClose={() => setIsCheckoutOpen(false)} onEditItem={(p) => { setSelectedProduct(p); setIsCheckoutOpen(false); }} />)}
    </div>
  );
}
