"use client"

import * as React from "react"
import Link from "next/link"
import { 
  X, MapPin, Crown, ShoppingBag, Send, Instagram, 
  SendHorizontal, Phone, Droplets, Snowflake, Box, 
  CheckCircle2, Bike, Wallet, Timer, HelpCircle, 
  CreditCard, ChevronDown, Star
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { BlurImage } from "@/components/blur-image"
import { translations } from "@/lib/translations"
import { GRADES, SELECTED_COLOR, IMPORT_COLOR } from "./landing/constants"
import { triggerHaptic, isElite, getFirstAvailablePrice } from "@/lib/utils"
import { HighlightCard, ProductRow, BadgeIcon } from "./landing/ProductCards"
import ProductModal from "./modals/ProductModal"
import CheckoutModal from "./modals/CheckoutModal"

export default function LandingClient({ initialProducts, initialDescriptions = [] }: any) {
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [openGrades, setOpenGrades] = React.useState<string[]>([]);
  
  const { items, getTotal, lang, setLang } = useCart();
  const t = translations[lang as keyof typeof translations];

  const processedProducts = React.useMemo(() => {
    return initialProducts.map((p: any) => {
      const prices: any = {};
      const oldPrices: any = {};
      Object.keys(p).forEach(key => {
        if (key.startsWith('price_')) prices[key.replace('price_', '').replace('g', '')] = p[key];
        if (key.startsWith('oldprice_')) oldPrices[key.replace('oldprice_', '').replace('g', '')] = p[key];
      });
      return { ...p, prices: Object.keys(prices).length ? prices : p.prices, old_prices: Object.keys(oldPrices).length ? oldPrices : p.old_prices };
    });
  }, [initialProducts]);

  const descriptionsMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    initialDescriptions.forEach((d: any) => { if (d.subcategory) map[d.subcategory.toLowerCase().trim()] = d; });
    return map;
  }, [initialDescriptions]);

  const getDesc = (id: string) => {
    const data = descriptionsMap[id.toLowerCase().trim()];
    if (!data) return null;
    return lang === 'ru' ? data.description_ru : data.description_eng;
  };

  const recentUpdates = processedProducts.filter((p: any) => p.badge?.toUpperCase() === 'NEW');
  const flashSales = processedProducts.filter((p: any) => p.badge?.toUpperCase() === 'SALE');

  const gradeSections = GRADES.map(grade => ({
    grade,
    items: processedProducts.filter((p: any) => p.subcategory === grade.id && p.category === 'buds' && !isElite(p)),
    priceRef: processedProducts.find((p: any) => p.subcategory === grade.id && p.badge?.toUpperCase() !== 'SALE') || processedProducts.find((p: any) => p.subcategory === grade.id)
  })).filter(g => g.items.length > 0);

  const concentrateSections = React.useMemo(() => {
    const allConcs = processedProducts.filter((p: any) => p.category === 'concentrates');
    const subs = Array.from(new Set(allConcs.map((p: any) => p.subcategory)));
    return subs.map(sub => {
      let color = SELECTED_COLOR; let icon = Droplets; const subLower = (sub as string)?.toLowerCase() || "";
      if (subLower.includes('old school')) { color = "#C1C1C1"; icon = Box; }
      else if (subLower.includes('fresh frozen')) { color = subLower.includes('premium') ? "#34D399" : "#FEC107"; icon = Snowflake; }
      return { id: sub as string, title: sub as string || "Concentrates", items: allConcs.filter((p: any) => p.subcategory === sub), color, icon, isList: subLower.includes('old school') };
    });
  }, [processedProducts]);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32">
      <header className="max-w-xl mx-auto pt-2 mb-8">
        <div className="flex items-center justify-between px-2 mb-8"> 
           <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={84} height={84} className="w-20 h-20 object-contain" alt="Logo" />
           <div className="flex items-center gap-2">
              <Link href="https://t.me/bshk_phuket" className="p-3 bg-white/5 rounded-2xl border border-white/5"><SendHorizontal size={20} className="opacity-60"/></Link>
              <button onClick={() => setLang(lang === 'en' ? 'ru' : 'en')} className="ml-4 w-10 h-10 bg-white/5 rounded-2xl border border-white/5 font-black text-[10px] text-emerald-400">
                {lang === 'en' ? 'RU' : 'EN'}
              </button>
           </div>
        </div>

        {/* О НАС */}
        <div className="relative py-10 px-8 text-center bg-white/5 rounded-[2.5rem] border border-white/10 mb-4">
          <CheckCircle2 size={24} className="mx-auto mb-4 text-emerald-500 opacity-60" />
          <h1 className="text-[26px] font-black uppercase tracking-tighter mb-3">{lang === 'ru' ? 'БошкуНаДорожку' : 'BND delivery service'}</h1>
          <p className="text-[13px] font-bold text-white/60 uppercase tracking-widest leading-relaxed mb-8">{lang === 'ru' ? 'Ваш надежный проводник в мире премиального качества' : 'Your trusted guide to a world of premium quality'}</p>
          <div className="grid grid-cols-2 gap-3 text-[8px] font-black uppercase text-left">
            {['3 года на рынке', 'сотни отзывов', 'гарантия качества', 'регулярные обновления'].map(text => (
              <div key={text} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-2xl border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>{text}
              </div>
            ))}
          </div>
        </div>

        {/* КАК ЗАКАЗАТЬ */}
        <div className="py-8 px-6 bg-white/5 rounded-[2.5rem] border border-white/10 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle size={18} className="text-[#F59E0B]"/>
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em]">{lang === 'ru' ? 'Как заказать' : 'How to order'}</h3>
          </div>
          <div className="space-y-4 text-[12px] font-bold uppercase">
            <div className="flex gap-4"><Timer size={16} className="text-[#F59E0B] opacity-60"/> 12:00 — 00:00</div>
            <div className="flex gap-4"><Bike size={16} className="text-[#F59E0B] opacity-60"/> {lang === 'ru' ? 'Пхукет: 60 мин, Таиланд: 2-3 дня' : 'Phuket: 60 min, Thailand: 2-3 days'}</div>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-8">
        {recentUpdates.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-2"><BadgeIcon type="NEW" /><h2 className="text-[12px] font-black uppercase tracking-[0.3em]">{t.updates}</h2></div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">{recentUpdates.map((p:any) => <div key={p.id} className="w-[180px] shrink-0"><HighlightCard item={p} onClick={() => setSelectedProduct(p)} showSubcategory={true} /></div>)}</div>
          </section>
        )}

        {gradeSections.map(({ grade, items, priceRef }: any) => {
          const isOpen = openGrades.includes(grade.id);
          return (
            <div key={grade.id} className="rounded-[2rem] overflow-hidden border border-white/5 bg-[#1d4837]/40">
              <button onClick={() => setOpenGrades(p => p.includes(grade.id) ? p.filter(x => x !== grade.id) : [...p, grade.id])} className="w-full px-6 py-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3"><grade.icon size={22} style={{ color: grade.color }} /><h2 className="text-[16px] font-black uppercase" style={{ color: grade.color }}>{grade.title}</h2></div>
                  <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {getDesc(grade.id) && <p className="text-[11px] text-left text-white/40 uppercase mb-6">{getDesc(grade.id)}</p>}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 5, 10, 20].map(w => (
                    <div key={w} className="bg-white/5 py-3 rounded-2xl border border-white/5">
                      <div className="text-[10px] opacity-40">{w}g</div>
                      <div className="text-[16px] font-black">{Math.round(priceRef?.prices?.[w] || 0)}฿</div>
                    </div>
                  ))}
                </div>
              </button>
              {isOpen && <div className="bg-white/5 divide-y divide-white/5">{items.map((p:any) => <ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />)}</div>}
            </div>
          )
        })}

        {concentrateSections.map(sec => {
          const isOpen = openGrades.includes(sec.id);
          return (
            <div key={sec.id} className="rounded-[2rem] overflow-hidden border border-white/5 bg-[#1d4837]/40">
              <button onClick={() => setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id])} className="w-full px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-3"><sec.icon size={22} style={{ color: sec.color }} /><h2 className="text-[16px] font-black uppercase" style={{ color: sec.color }}>{sec.title}</h2></div>
                <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="p-4 grid grid-cols-2 gap-4 bg-white/5">
                  {sec.items.map((p:any) => <HighlightCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-white/10 backdrop-blur-2xl py-3 px-6 rounded-[2.5rem] border border-white/20 flex justify-between items-center shadow-2xl">
            <div className="text-left"><div className="text-[18px] font-black">{getTotal()}฿</div><div className="text-[9px] text-emerald-400 uppercase">{items.length} {t.items}</div></div>
            <div className="flex items-center gap-3 font-black uppercase text-[12px]">{t.basket} <Send size={18}/></div>
          </button>
        </div>
      )}

      {selectedProduct && <ProductModal product={selectedProduct} t={t} onClose={() => setSelectedProduct(null)} />}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} t={t} lang={lang} onClose={() => setIsCheckoutOpen(false)} onEditItem={p => { setSelectedProduct(p); setIsCheckoutOpen(false); }} />}
    </div>
  );
}
