"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Plus, Tag, Zap, MapPin, Star, Phone, Instagram, 
  SendHorizontal, ChevronDown, HelpCircle, Timer, 
  Wallet, CreditCard, Bike, ShoppingBag, Send, 
  CheckCircle2, Droplets, Snowflake, Box
} from "lucide-react"

// Стейт и переводы
import { useCart } from "@/lib/cart-store"
import { translations } from "@/lib/translations"

// Компоненты
import { BlurImage } from "@/components/blur-image"
import { ProductCards, Baht } from "@/components/landing/ProductCards"
import { ProductModal } from "@/components/modals/ProductModal"
import { CheckoutModal } from "@/components/modals/CheckoutModal"

// Константы и утилиты
import { 
  GRADES, CONTACT_METHODS, SELECTED_COLOR, 
  IMPORT_COLOR, CONCENTRATES_COLOR, TYPE_COLORS 
} from "@/components/landing/constants"
import { 
  triggerHaptic, isElite, getFirstAvailablePrice, 
  getInterpolatedPrice 
} from "@/lib/utils"

// Вспомогательная функция для обработки цен из БД
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
    return processedProducts
      .filter(p => p.badge?.toUpperCase() === 'NEW')
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [processedProducts]);

  const flashSales = React.useMemo(() => 
    processedProducts.filter(p => p.badge?.toUpperCase() === 'SALE'), 
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
              <button onClick={() => { triggerHaptic('light'); setLang(lang === 'en' ? 'ru' : 'en'); }} className="ml-6 w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 font-black text-[9px] text-emerald-400 active:scale-90 transition-all shrink-0">
                {lang === 'en' ? 'RU' : 'EN'}
              </button>
           </div>
        </div>

        {/* --- ГЛАВНЫЙ БЛОК О НАС --- */}
        <div className="relative py-10 px-8 text-center bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md overflow-hidden mb-4">
          <CheckCircle2 size={24} className="mx-auto mb-4 text-emerald-500 opacity-60" />
          <h1 className="text-[26px] font-black uppercase tracking-tighter text-white mb-3 relative z-10">
            {lang === 'ru' ? 'БошкуНаДорожку' : 'BND delivery service'}
          </h1>
          <p className="text-[13px] font-bold text-white/60 uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto mb-8 relative z-10">
            {lang === 'ru' ? 'Ваш надежный проводник в мире премиального качества' : 'Your trusted guide to a world of premium quality'}
          </p>
          <div className="grid grid-cols-2 gap-3 relative z-10 text-[8px] font-black uppercase">
             {/* Короткие плашки инфо */}
             <div className="p-3 bg-white/5 rounded-2xl border border-white/5">3 {lang === 'ru' ? 'года на рынке' : 'years on market'}</div>
             <div className="p-3 bg-white/5 rounded-2xl border border-white/5">{lang === 'ru' ? 'сотни отзывов' : 'hundreds of reviews'}</div>
          </div>
        </div>

        {/* --- БЛОК ИНФО --- */}
        <div className="relative py-8 px-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#F59E0B]/10 rounded-xl text-[#F59E0B]"><HelpCircle size={18}/></div>
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-white/90">{t.howToOrder || 'How to order'}</h3>
          </div>
          <div className="space-y-4">
             <div className="flex gap-4"><Timer size={16} className="text-amber-500 opacity-60"/><span className="text-[12px] font-bold uppercase">12:00 — 00:00</span></div>
             <div className="flex gap-4"><Bike size={16} className="text-amber-500 opacity-60"/><span className="text-[12px] font-bold uppercase">Phuket: 60 min</span></div>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-8">
        {/* Горизонтальные списки NEW и SALE */}
        {recentUpdates.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] px-2 flex gap-2 items-center"><Plus size={14} className="text-blue-400"/> {t.updates}</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2 snap-x">
              {recentUpdates.map(p => (
                <div key={p.id} className="w-[180px] shrink-0 snap-start">
                  <ProductCards.Highlight item={p} onClick={() => setSelectedProduct(p)} showSubcategory />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Меню категорий */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 py-4">
             <div className="h-[1px] flex-1 bg-white/5"></div>
             <span className="text-[16px] font-black uppercase tracking-[0.3em] text-emerald-400">{t.flowerMenu}</span>
             <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          {gradeSections.map(({ grade, items, priceRef }) => {
            const isOpen = openGrades.includes(grade.id);
            return (
              <div key={grade.id} className="rounded-[2.5rem] border border-white/5 bg-white/5 overflow-hidden transition-all">
                <button 
                  onClick={() => setOpenGrades(prev => prev.includes(grade.id) ? prev.filter(x => x !== grade.id) : [...prev, grade.id])}
                  className="w-full p-8 text-left"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3"><grade.icon style={{color: grade.color}}/> <h2 className="font-black text-lg" style={{color: grade.color}}>{grade.title}</h2></div>
                    <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 10, 20].map(w => (
                      <div key={w} className="bg-black/20 p-2 rounded-xl text-center">
                        <div className="text-[10px] opacity-40 font-black">{w}g</div>
                        <div className="text-sm font-black">{Math.round(Number(priceRef.prices?.[w]) || 0)}฿</div>
                      </div>
                    ))}
                  </div>
                </button>
                {isOpen && (
                  <div className="divide-y divide-white/5 border-t border-white/5">
                    {items.map(p => <ProductCards.Row key={p.id} p={p} onClick={() => setSelectedProduct(p)} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Кнопка корзины */}
      {items.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-white text-[#193D2E] h-16 rounded-[2rem] flex justify-between items-center px-8 shadow-2xl active:scale-95 transition-all">
            <div className="flex flex-col text-left">
              <span className="text-xl font-black leading-none">{getTotal()}฿</span>
              <span className="text-[10px] font-black uppercase opacity-60">{items.length} {t.items}</span>
            </div>
            <div className="flex items-center gap-2 font-black uppercase text-sm">{t.basket} <Send size={18}/></div>
          </button>
        </div>
      )}

      {/* Модалки */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          t={t}
          onClose={() => setSelectedProduct(null)} 
          style={{ color: SELECTED_COLOR }}
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
