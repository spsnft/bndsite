"use client"
import * as React from "react"
import Link from "next/link"
import { 
  Plus, Tag, Zap, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, ChevronDown, Star, Phone, 
  Droplets, Snowflake, Box, Sparkles, Flame, Percent,
  ShieldCheck, Clock, CheckCircle2, Trophy, Users, RefreshCcw,
  Bike, Wallet, Globe, Timer, HelpCircle, CreditCard,
  ZapOff, FlameKindling, Gem, Laptop, Info, Cigarette
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { BlurImage } from "@/components/blur-image"
import { translations } from "@/lib/translations"
import { ProductModal, CheckoutModal } from "@/components/modals"
import { 
  triggerHaptic, getFirstAvailablePrice, getInterpolatedPrice, isElite,
  TYPE_COLORS, GRADES, SELECTED_COLOR, IMPORT_COLOR, CONCENTRATES_COLOR, GOLDEN_COLOR 
} from "@/lib/utils"

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

const BahtSymbol = React.memo(() => (
  <span className="font-sans text-[0.7em] ml-0.5 opacity-80 align-baseline">฿</span>
));

const HighlightCard = React.memo(({ item, onClick, priority, hideBadge, isMini, showSubcategory }: { item: any, onClick: () => void, priority?: boolean, hideBadge?: boolean, isMini?: boolean, showSubcategory?: boolean }) => {
  const isPrerolls = item.category === 'joints';
  const sub = item.subcategory?.toLowerCase();
  
  const accentColor = item.category === 'concentrates' 
    ? (sub?.includes('fresh frozen premium') ? "#34D399" : sub?.includes('fresh frozen') ? "#FEC107" : SELECTED_COLOR)
    : (isPrerolls ? GOLDEN_COLOR : (isElite(item) ? (sub?.includes('exclusive') ? SELECTED_COLOR : IMPORT_COLOR) : (sub === 'classic' ? GOLDEN_COLOR : (GRADES.find(g => g.id === item.subcategory)?.color || SELECTED_COLOR))));
  
  const { price: currentPrice, weight: firstWeight } = getFirstAvailablePrice(item);
  const oldPriceRaw = item.old_prices ? getInterpolatedPrice(firstWeight, item.old_prices, isElite(item)) : 0;
  const oldPrice = Math.round(oldPriceRaw);

  return (
    <div 
      onClick={() => { triggerHaptic('light'); onClick(); }} 
      className={`relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group flex flex-col overflow-hidden border ${isMini ? 'h-[170px]' : 'h-[230px]'} bg-[#0D1F18]`} 
      style={{ borderColor: `${accentColor}80` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 pointer-events-none" />
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 110%, ${accentColor}, transparent 70%)` }} />
      
      {!hideBadge && item.badge && (<div className={`absolute top-2 right-2 z-20 ${isMini ? 'scale-75' : 'scale-90'}`}><BadgeIcon type={item.badge} /></div>)}
      
      <div className="relative z-10 px-4 py-3 pb-0 flex-1 flex flex-col min-h-0">
        <div className="min-w-0 pr-6">
          <h3 className={`${isMini ? 'text-[11px]' : 'text-[13px]'} font-black uppercase tracking-tight leading-tight text-white`}>{item.name}</h3>
          {showSubcategory && (<p className={`${isMini ? 'text-[8px]' : 'text-[9px]'} font-bold mt-1 text-white/40 uppercase tracking-widest italic`}>{item.subcategory === 'classic' ? 'Classic' : (item.subcategory || "Product")}</p>)}
        </div>
        <div className="relative flex-1 w-full min-h-0 flex items-center justify-center my-1">
            <BlurImage src={item.image} priority={priority} width={180} height={180} className="max-w-full max-h-full object-contain" alt={item.name} />
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-end px-4 pb-4 mt-auto">
        <span className={`${isMini ? 'text-[8px]' : 'text-[9px]'} font-black uppercase tracking-widest brightness-125`} style={{ color: TYPE_COLORS[item.type?.toLowerCase()] || "#FFF" }}>{item.type}</span>
        <div className="flex flex-col items-end">
          {oldPrice > currentPrice && <span className={`${isMini ? 'text-[9px]' : 'text-[11px]'} font-bold line-through opacity-30 text-white leading-none mb-0.5`}>{oldPrice}<BahtSymbol /></span>}
          <p className={`${isMini ? 'text-[15px]' : 'text-[19px]'} font-black tracking-tighter leading-none text-white`}>{currentPrice > 0 ? (<>{currentPrice}<BahtSymbol /></>) : '—'}</p>
        </div>
      </div>
    </div>
  );
});

const ProductRow = React.memo(({ p, onClick }: { p: any, onClick: () => void }) => {
  const isAccessory = p.category === 'accessories';
  return (
    <div onClick={() => { triggerHaptic('light'); onClick(); }} className="flex items-center justify-between gap-3 px-4 py-4 text-white border-b border-white/10 last:border-b-0 active:bg-white/5 transition-colors cursor-pointer group">
        <div className="flex items-center gap-4 truncate flex-1">
          <div className="w-8 flex justify-center shrink-0">{p.badge && <BadgeIcon type={p.badge} isSmall={true} />}</div>
          <span className="text-[14px] font-black uppercase tracking-tight text-white/90 truncate leading-tight">{p.name}</span>
        </div>
        <div className="flex items-center gap-5 shrink-0 pr-4">
          {isAccessory ? (
            <span className="text-[14px] font-black text-white/90">{Math.round(Number(p.prices?.['1']) || 0)}<BahtSymbol /></span>
          ) : (
            p.farm && p.farm !== "-" && <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate max-w-[90px]">{p.farm}</span>
          )}
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{p.type}</span>
        </div>
    </div>
  );
});

export default function LandingClient({ initialProducts, initialDescriptions = [] }: { initialProducts: any[], initialDescriptions?: any[] }) {
  const processedProducts = React.useMemo(() => processProductData(initialProducts), [initialProducts]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [openGrades, setOpenGrades] = React.useState<string[]>(['classic']);
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);
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
    return [...news].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [processedProducts]);

  const flashSales = React.useMemo(() => {
    const sales = processedProducts.filter(p => p.badge?.toUpperCase() === 'SALE');
    return [...sales].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [processedProducts]);
  
  const gradeSections = React.useMemo(() => {
    return GRADES.map(grade => {
      const allItems = processedProducts.filter(p => 
        p.subcategory?.toLowerCase() === grade.id.toLowerCase() && 
        p.category === 'buds' && 
        !isElite(p)
      );

      if (grade.id === 'classic') {
        const regularItems = allItems.filter(p => p.badge?.toUpperCase() !== 'SALE');
        const saleItems = allItems.filter(p => p.badge?.toUpperCase() === 'SALE');
        const priceRef = regularItems[0] || allItems[0];
        const salePriceRef = saleItems[0]; 
        return { grade, regularItems, saleItems, priceRef, salePriceRef, isClassic: true };
      }

      return { grade, regularItems: allItems, saleItems: [], priceRef: allItems[0], isClassic: false };
    }).filter(g => g.regularItems.length > 0 || g.saleItems.length > 0);
  }, [processedProducts]);

  const eliteSections = [
    { id: 'local exclusive', title: 'Local Exclusives', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), color: SELECTED_COLOR, icon: MapPin },
    { id: 'import', title: 'Import', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import') && !p.subcategory?.toLowerCase().includes('loose')), color: IMPORT_COLOR, icon: Star }
  ];

  const importLooseSection = React.useMemo(() => {
    const items = processedProducts.filter(p => p.category === 'import loose' || p.subcategory?.toLowerCase() === 'import loose');
    if (items.length === 0) return null;
    const priceRef = items.find(p => p.badge?.toUpperCase() !== 'SALE') || items[0];
    return { id: 'import loose', title: 'Import Loose', items, priceRef, color: IMPORT_COLOR, icon: Star };
  }, [processedProducts]);

  const concentrateSections = React.useMemo(() => {
    const allConcs = processedProducts.filter(p => p.category === 'concentrates');
    const subs = Array.from(new Set(allConcs.map(p => p.subcategory)));
    return subs.map(sub => {
      let color = SELECTED_COLOR; let icon = Droplets; const subLower = sub?.toLowerCase() || "";
      if (subLower.includes('old school')) { color = "#C1C1C1"; icon = Box; }
      else if (subLower.includes('fresh frozen')) { color = subLower.includes('premium') ? "#34D399" : "#FEC107"; icon = Snowflake; }
      else if (subLower.includes('live rosin')) { color = "#A855F7"; icon = Droplets; }
      return { id: sub, title: sub || "Concentrates", items: allConcs.filter(p => p.subcategory === sub), color, icon, isList: true };
    });
  }, [processedProducts]);

  const accessoriesSection = React.useMemo(() => {
    const items = processedProducts.filter(p => p.category === 'accessories');
    if (items.length === 0) return null;
    return { id: 'accessories', title: lang === 'ru' ? 'Аксессуары' : 'Accessories', items, color: "#F472B6", icon: Gem };
  }, [processedProducts, lang]);

  const prerollSections = React.useMemo(() => {
    const allJoints = processedProducts.filter(p => p.category === 'joints');
    const subs = Array.from(new Set(allJoints.map(p => p.subcategory)));
    return subs.map(sub => ({ id: sub, title: sub || "Prerolls", items: allJoints.filter(p => p.subcategory === sub), color: GOLDEN_COLOR, icon: Cigarette }));
  }, [processedProducts]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      triggerHaptic('light');
      const offset = 20;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32 selection:bg-emerald-500/30 font-sans">
      <header className="max-w-xl mx-auto pt-0 mb-0">
        <div className="flex items-center justify-between px-2 mb-1"> 
           <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[35px]"></div>
              <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={112} height={112} className="w-28 h-28 object-contain relative z-10" alt="Logo" />
           </div>
           <div className="flex items-center flex-1 justify-end">
              <div className="flex gap-3">
                {[ {icon: SendHorizontal, url: "https://t.me/bshk_phuket"}, {icon: Instagram, url: "https://www.instagram.com/boshkunadoroshku"} ].map((soc, i) => (
                  <Link key={i} href={soc.url} target="_blank" className="p-4 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all shadow-xl"><soc.icon size={22} className="opacity-80"/></Link>
                ))}
              </div>
              <button onClick={() => { triggerHaptic('light'); setLang(lang === 'en' ? 'ru' : 'en'); }} className="ml-6 w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 font-black text-[11px] text-emerald-400 active:scale-90 transition-all shrink-0">{lang === 'en' ? 'RU' : 'EN'}</button>
           </div>
        </div>

        {/* ПУНКТ 1: Между шапкой и блоком УТП - 16px (mb-4) */}
        {/* ПУНКТ 2: Внутри блока УТП (pt-3 pb-3 для 12px) */}
        {/* ПУНКТ 3: Между УТП и FAQ - 8px (mb-2) */}
        <div className="relative pt-3 pb-3 px-6 text-center bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md overflow-hidden mb-2 mt-4">
          <h2 className="text-[16px] font-black uppercase tracking-[0.12em] text-white mb-2 relative z-10 px-2 max-w-[320px] mx-auto">
            {lang === 'ru' ? <>Ваш проводник в мир премиального качества</> : <>Your trusted guide to a world of premium quality</>}
          </h2>
          <div className="grid grid-cols-2 gap-2 relative z-10">
             {[ 
               {ru: '3 года на рынке', en: '3 years on market'}, 
               {ru: 'сотни довольных клиентов', en: 'hundreds of happy clients'}, 
               {ru: 'оплата наличными при получении', en: 'cash on delivery'}, 
               {ru: 'бесплатная доставка за 60мин', en: 'free 60min delivery'} 
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 rounded-2xl border border-white/5 min-h-[44px]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80 text-center">{lang === 'ru' ? item.ru : item.en}</span>
               </div>
             ))}
          </div>
        </div>

        {/* ПУНКТ 4: Между FAQ и якорями - 16px (mb-4) */}
        <div id="order-info" className={`relative bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md overflow-hidden mb-4 transition-all duration-300 ${isInfoOpen ? 'pb-6' : 'pb-0'}`}>
          <button onClick={() => { triggerHaptic('light'); setIsInfoOpen(!isInfoOpen); }} className="w-full pt-3 pb-3 px-6 flex items-center justify-between active:bg-white/5 transition-colors">
            <div className="flex items-center gap-3"><div className="p-1.5 bg-[#F59E0B]/20 rounded-lg text-[#F59E0B] shadow-lg"><Info size={14}/></div><h3 className="text-[12px] font-black uppercase tracking-[0.15em] text-white">FAQ</h3></div>
            <ChevronDown size={16} className={`opacity-20 transition-transform duration-300 ${isInfoOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-500 ${isInfoOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-5 pl-9 pb-2">
               <div className="flex items-center gap-4"><Timer size={18} className="text-[#F59E0B] shrink-0" /><div><p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40 mb-1">{lang === 'ru' ? 'Часы работы' : 'Working hours'}</p><p className="text-[13px] font-bold text-white tracking-[0.1em]">12:00 — 00:00</p></div></div>
               <div className="flex items-center gap-4"><Plus size={18} className="text-[#F59E0B] shrink-0" /><div><p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40 mb-1">{lang === 'ru' ? 'Минимальный заказ' : 'Minimum order'}</p><p className="text-[13px] font-bold text-white tracking-[0.1em]">{lang === 'ru' ? 'От 1000฿, Доставка бесплатная' : 'From 1000฿, Free delivery'}</p></div></div>
               <div className="flex items-center gap-4"><Laptop size={18} className="text-[#F59E0B] shrink-0" /><div><p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40 mb-1">{lang === 'ru' ? 'Способы оформления' : 'How to order'}</p><p className="text-[13px] font-bold text-white tracking-[0.1em] leading-tight">{lang === 'ru' ? (<>Онлайн или <a href="https://t.me/bshk_phuket" target="_blank" className="text-[#F59E0B]">оператор telegram</a></>) : (<>Online or <a href="https://t.me/bshk_phuket" target="_blank" className="text-[#F59E0B]">telegram operator</a></>)}</p></div></div>
               <div className="flex items-center gap-4"><Wallet size={18} className="text-[#F59E0B] shrink-0" /><div><p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40 mb-1">{lang === 'ru' ? 'Оплата' : 'Payment'}</p><p className="text-[13px] font-bold text-white tracking-[0.1em] leading-relaxed">{lang === 'ru' ? 'Наличка, перевод, крипта, рубли' : 'Cash, transfer, crypto'}</p></div></div>
               <div className="flex items-center gap-4"><Bike size={18} className="text-[#F59E0B] shrink-0" /><div><p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40 mb-1">{lang === 'ru' ? 'Доставка' : 'Delivery'}</p><p className="text-[13px] font-bold text-white tracking-[0.1em]">{lang === 'ru' ? 'Пхукет: 60 мин, Таиланд: 2-3 дня' : 'Phuket: 60 min, Thailand: 2-3 days'}</p></div></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-2 mt-4 mb-6 relative z-20">
          <button onClick={() => scrollToSection('buds-menu')} className="w-full px-4 py-3 bg-emerald-500/20 rounded-2xl border-2 border-emerald-500/30 text-[10px] font-black uppercase tracking-widest text-white active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            {lang === 'ru' ? 'Основное меню' : 'Flowers'}
          </button>
          <div className="flex gap-3">
            <button onClick={() => scrollToSection('concentrates-menu')} className="flex-1 min-w-[80px] px-4 py-3 bg-[#A855F7]/20 rounded-2xl border-2 border-[#A855F7]/30 text-[10px] font-black uppercase tracking-widest text-white active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              {lang === 'ru' ? 'Экстракты' : 'Extracts'}
            </button>
            <button onClick={() => scrollToSection('prerolls-menu')} className="flex-1 min-w-[80px] px-4 py-3 bg-[#F59E0B]/20 rounded-2xl border-2 border-[#F59E0B]/30 text-[10px] font-black uppercase tracking-widest text-white active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              {lang === 'ru' ? 'Прероллы' : 'Prerolls'}
            </button>
            {accessoriesSection && (
              <button onClick={() => scrollToSection('accessories-menu')} className="flex-1 min-w-[80px] px-4 py-3 bg-[#F472B6]/20 rounded-2xl border-2 border-[#F472B6]/30 text-[10px] font-black uppercase tracking-widest text-white active:scale-95 transition-all shadow-[0_0_20px_rgba(244,114,182,0.2)]">
                {lang === 'ru' ? 'Аксессуары' : 'Accessories'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-0">
        {recentUpdates.length > 0 && (
          <section className="mt-[12px] mb-[12px] space-y-3 overflow-hidden">
            <div className="flex items-center gap-2 px-2"><BadgeIcon type="NEW" /><h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/80">{t.updates}</h2></div>
            <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar mx-[-1rem] px-4 snap-x">{recentUpdates.map((p, idx) => (<div key={p.id} className="w-[170px] shrink-0 snap-start"><HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} hideBadge={true} isMini={false} showSubcategory={true} /></div>))}</div>
          </section>
        )}
        {flashSales.length > 0 && (
          <section className="mt-[12px] mb-[12px] space-y-3 overflow-hidden">
            <div className="flex items-center gap-2 px-2"><BadgeIcon type="SALE" /><h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/80">{t.sales}</h2></div>
            <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar mx-[-1rem] px-4 snap-x">{flashSales.map((p, idx) => (<div key={p.id} className="w-[170px] shrink-0 snap-start"><HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} hideBadge={true} isMini={false} showSubcategory={true} /></div>))}</div>
          </section>
        )}
        
        <div className="space-y-1">
          <div id="buds-menu" className="flex items-center gap-4 pt-6 pb-6 relative">
             <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500"></div>
             <span className="text-[16px] font-black uppercase tracking-[0.3em] text-white px-6 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md">{t.flowerMenu}</span>
             <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500"></div>
          </div>
          <div className="space-y-3">
            {gradeSections.map(({ grade, regularItems, saleItems, priceRef, salePriceRef, isClassic }) => {
              const isOpen = openGrades.includes(grade.id);
              return (
                <div key={grade.id} className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`} style={{ borderColor: isOpen ? `${grade.color}80` : 'rgba(255,255,255,0.05)' }}>
                  <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(grade.id) ? p.filter(x => x !== grade.id) : [...p, grade.id]); }} className="w-full px-4 pt-3 pb-3 flex flex-col active:bg-white/5 transition-colors text-left">
                    <div className="w-full flex items-center justify-between mb-3 px-4">
                      <div className="flex items-center gap-3"><grade.icon size={22} style={{ color: grade.color }} /><h2 className="text-[15px] font-black uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2></div>
                      <div className="flex items-center gap-2">
                        {isClassic && (
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            {isOpen ? (lang === 'ru' ? 'Свернуть' : 'Close') : (lang === 'ru' ? 'Развернуть' : 'Open')}
                          </span>
                        )}
                        <ChevronDown size={20} className={`opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    {getDesc(grade.id) && (<p className="px-4 mb-3 text-[14px] font-medium text-white leading-relaxed">{getDesc(grade.id)}</p>)}
                    <div className="w-full grid grid-cols-4 gap-2 px-4">
                       {[1, 5, 10, 20].map(w => {
                         const p = Math.round(Number(priceRef?.prices?.[w]) || 0);
                         return (
                          <div key={w} className="flex flex-col items-center gap-0 bg-white/5 py-1.5 rounded-2xl border border-white/5">
                            <span className="text-[11px] font-black opacity-60 uppercase leading-none mb-[1px]">{w}g</span>
                            <span className="text-[18px] font-black text-white leading-none">{p > 0 ? (<>{p}<BahtSymbol /></>) : '—'}</span>
                          </div>
                         )
                       })}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
                    <div className="divide-y divide-white/10 bg-white/5">
                        {regularItems.map((p: any) => (<ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />))}
                        
                        {isClassic && saleItems.length > 0 && (
                            <div className="bg-emerald-500/5 pt-6 pb-2">
                                <div className="px-8 flex flex-col gap-4">
                                    <div className="flex items-center gap-2 opacity-90">
                                        <Tag size={14} style={{ color: GOLDEN_COLOR }} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.1em]" style={{ color: GOLDEN_COLOR }}>{lang === 'ru' ? 'Акционные предложения' : 'Special Sale Offers'}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 5, 10, 20].map(w => {
                                            const p = Math.round(Number(salePriceRef?.prices?.[w]) || 0);
                                            return (
                                                <div key={w} className="flex flex-col items-center gap-0 bg-white/5 py-1.5 rounded-xl border border-white/5">
                                                    <span className="text-[10px] font-black opacity-40 uppercase leading-none mb-[1px]">{w}g</span>
                                                    <span className="text-[14px] font-black text-emerald-400 leading-none">{p > 0 ? (<>{p}<BahtSymbol /></>) : '—'}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="mt-4 divide-y divide-white/5">
                                    {saleItems.map((p: any) => (
                                        <ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {eliteSections.map(sec => {
              const isOpen = openGrades.includes(sec.id);
              return sec.items.length > 0 && (
                <div key={sec.id} className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`} style={{ borderColor: isOpen ? `${sec.color}80` : 'rgba(255,255,255,0.05)' }}>
                  <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id]); }} className="w-full px-8 py-6 flex flex-col active:bg-white/5 transition-colors text-left">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-3"><sec.icon size={22} style={{ color: sec.color }} /><h2 className="text-[15px] font-black uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                      <div className="flex items-center gap-2">
                        <ChevronDown size={20} className={`opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
                    <div className="p-6 grid grid-cols-2 gap-4 bg-white/5">{sec.items.map(p => (<HighlightCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} showSubcategory={false} />))}</div>
                  </div>
                </div>
              );
            })}

            {importLooseSection && (
                <div key={importLooseSection.id} className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`} style={{ borderColor: openGrades.includes(importLooseSection.id) ? `${importLooseSection.color}80` : 'rgba(255,255,255,0.05)' }}>
                  <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(importLooseSection.id) ? p.filter(x => x !== importLooseSection.id) : [...p, importLooseSection.id]); }} className="w-full px-4 pt-3 pb-3 flex flex-col active:bg-white/5 transition-colors text-left">
                    <div className="w-full flex items-center justify-between mb-3 px-4">
                      <div className="flex items-center gap-3"><importLooseSection.icon size={22} style={{ color: importLooseSection.color }} /><h2 className="text-[15px] font-black uppercase tracking-tighter" style={{ color: importLooseSection.color }}>{importLooseSection.title}</h2></div>
                      <div className="flex items-center gap-2">
                        <ChevronDown size={20} className={`opacity-40 transition-transform duration-300 ${openGrades.includes(importLooseSection.id) ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    {getDesc(importLooseSection.id) && (<p className="px-4 mb-3 text-[14px] font-medium text-white leading-relaxed">{getDesc(importLooseSection.id)}</p>)}
                    <div className="w-full grid grid-cols-4 gap-2 px-4">
                       {[1, 5, 10, 20].map(w => {
                         const p = Math.round(Number(importLooseSection.priceRef.prices?.[w]) || 0);
                         return (
                          <div key={w} className="flex flex-col items-center gap-0 bg-white/5 py-1.5 rounded-2xl border border-white/5">
                            <span className="text-[11px] font-black opacity-60 uppercase leading-none mb-[1px]">{w}g</span>
                            <span className="text-[18px] font-black text-white leading-none">{p > 0 ? (<>{p}<BahtSymbol /></>) : '—'}</span>
                          </div>
                         )
                       })}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${openGrades.includes(importLooseSection.id) ? 'max-h-[3000px]' : 'max-h-0'}`}>
                    <div className="divide-y divide-white/10 bg-white/5">{importLooseSection.items.map((p: any) => (<ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />))}</div>
                  </div>
                </div>
            )}
          </div>

          <div id="concentrates-menu" className="flex items-center gap-4 pt-6 pb-6 mt-4 relative">
             <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#A855F7]/50 to-[#A855F7]"></div>
             <span className="text-[16px] font-black uppercase tracking-[0.3em] text-white px-6 py-2 rounded-full border border-[#A855F7]/30 bg-[#A855F7]/10 backdrop-blur-md" style={{ color: '#A855F7' }}>{lang === 'ru' ? 'Концентраты' : 'Concentrates'}</span>
             <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#A855F7]/50 to-[#A855F7]"></div>
          </div>
          <div className="space-y-3">
            {concentrateSections.map(sec => {
              const isOpen = openGrades.includes(sec.id);
              return (
                <div key={sec.id} className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`} style={{ borderColor: isOpen ? `${sec.color}80` : 'rgba(255,255,255,0.05)' }}>
                  <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id]); }} className="w-full px-8 py-6 flex flex-col active:bg-white/5 transition-colors text-left">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-3"><sec.icon size={22} style={{ color: sec.color }} /><h2 className="text-[15px] font-black uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                      <div className="flex items-center gap-2">
                        <ChevronDown size={20} className={`opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    {getDesc(sec.id) && (<p className="mt-3 text-[14px] font-medium text-white leading-relaxed">{getDesc(sec.id)}</p>)}
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
                    <div className="divide-y divide-white/10 bg-white/5">{sec.items.map((p: any) => (<ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />))}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {accessoriesSection && (
            <div id="accessories-menu" className="pt-4">
              <div className="flex items-center gap-4 pt-6 pb-6 relative">
                 <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#F472B6]/50 to-[#F472B6]"></div>
                 <span className="text-[16px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full border border-[#F472B6]/30 bg-[#F472B6]/10 backdrop-blur-md" style={{ color: '#F472B6' }}>{accessoriesSection.title}</span>
                 <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#F472B6]/50 to-[#F472B6]"></div>
              </div>
              <div className={`rounded-[2rem] overflow-hidden border border-white/5 bg-[#1d4837]/40 backdrop-blur-xl`}>
                 <div className="divide-y divide-white/10 bg-white/5">
                    {accessoriesSection.items.map((p: any) => (
                      <ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />
                    ))}
                 </div>
              </div>
            </div>
          )}

          <div id="prerolls-menu" className="flex items-center gap-4 pt-6 pb-6 mt-4 relative">
             <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-[#F59E0B]"></div>
             <span className="text-[16px] font-black uppercase tracking-[0.3em] text-white px-6 py-2 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 backdrop-blur-md" style={{ borderColor: `${GOLDEN_COLOR}4d`, color: GOLDEN_COLOR }}>{lang === 'ru' ? 'Прероллы' : 'Prerolls'}</span>
             <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#F59E0B]/50 to-[#F59E0B]"></div>
          </div>
          <div className="space-y-3">
            {prerollSections.map(sec => {
              const isOpen = openGrades.includes(sec.id);
              const priceRef = sec.items[0];
              return (
                <div key={sec.id} className={`rounded-[2rem] overflow-hidden border transition-all duration-300 bg-[#1d4837]/40 backdrop-blur-xl`} style={{ borderColor: isOpen ? `${sec.color}80` : 'rgba(255,255,255,0.05)' }}>
                  <button onClick={() => { triggerHaptic('light'); setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id]); }} className="w-full px-4 pt-3 pb-3 flex flex-col active:bg-white/5 transition-colors text-left">
                    <div className="w-full flex items-center justify-between mb-3 px-4">
                      <div className="flex items-center gap-3"><sec.icon size={22} style={{ color: sec.color }} /><h2 className="text-[15px] font-black uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                      <div className="flex items-center gap-2">
                        <ChevronDown size={20} className={`opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <div className="w-full grid grid-cols-4 gap-2 px-4">
                       {[ {w:1, l:'1pcs'}, {w:5, l:'3pcs'}, {w:10, l:'5pcs'}, {w:20, l:'10pcs'} ].map(unit => {
                         const p = Math.round(Number(priceRef?.prices?.[unit.w]) || 0);
                         return (
                          <div key={unit.w} className="flex flex-col items-center gap-0 bg-white/5 py-1.5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black opacity-60 uppercase leading-none mb-[1px]">{unit.l}</span>
                            <span className="text-[18px] font-black text-white leading-none">{p > 0 ? (<>{p}<BahtSymbol /></>) : '—'}</span>
                          </div>
                         )
                       })}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
                    <div className="divide-y divide-white/10 bg-white/5">{sec.items.map((p: any) => (<ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />))}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6">
          <button onClick={() => { triggerHaptic('medium'); setIsCheckoutOpen(true); }} className="w-full bg-white/10 backdrop-blur-2xl text-white py-3 px-7 rounded-[2.5rem] border border-white/20 shadow-2xl flex justify-between items-center active:scale-95 transition-all">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-2 bg-emerald-400/20 rounded-xl"><ShoppingBag size={20} className="text-emerald-400"/></div>
              <div className="text-left">
                <div className="font-black uppercase text-[18px] leading-none mb-0.5">{getTotal()}<BahtSymbol /></div>
                <span className="font-black uppercase text-[9px] text-emerald-400 leading-none">{items.length} {t.items}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white opacity-70">
              <span className="text-[12px] font-black uppercase">{t.basket}</span>
              <span className="p-2 bg-white/10 rounded-full animate-pulse"><Send size={18}/></span>
            </div>
          </button>
        </div>
      )}
      
      {selectedProduct && (
        <ProductModal 
          product={{
            ...selectedProduct,
            unitLabel: selectedProduct.category === 'accessories' ? 'pcs' : 'g'
          }} 
          t={t} 
          style={
            selectedProduct.category === 'concentrates' 
              ? { color: concentrateSections.find(s => s.id === selectedProduct.subcategory)?.color || CONCENTRATES_COLOR } 
              : (selectedProduct.category === 'joints' ? { color: GOLDEN_COLOR } 
              : (isElite(selectedProduct) ? {color: selectedProduct.subcategory?.toLowerCase().includes('exclusive') ? SELECTED_COLOR : IMPORT_COLOR} 
              : (GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' })))
          } 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      {isCheckoutOpen && (
        <CheckoutModal 
          items={items.map(item => ({
            ...item,
            unitLabel: item.category === 'accessories' ? 'pcs' : 'g'
          }))} 
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
