"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Flame, Percent, X, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Trash2, ChevronDown, Star, Phone, Droplets
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

// --- COMPONENTS ---

const BadgeIcon = React.memo(({ type }: { type: string }) => {
  const baseClasses = "w-6 h-6 rounded-full flex items-center justify-center border shrink-0 opacity-80 transition-all";
  switch (type.toUpperCase()) {
    case "NEW": 
      return (
        <div className={`${baseClasses} bg-blue-600 border-blue-400`}>
          <span className="text-[7px] font-black text-white tracking-tighter">NEW</span>
        </div>
      );
    case "HIT": 
      return (
        <div className={`${baseClasses} bg-orange-600 border-orange-400`}>
          <Flame size={11} className="text-white" />
        </div>
      );
    case "SALE": 
      return (
        <div className={`${baseClasses} bg-emerald-600 border-emerald-400`}>
          <Percent size={11} className="text-white" />
        </div>
      );
    default: return null;
  }
});

const HighlightCard = React.memo(({ item, onClick, priority, hideBadge, isMini }: { item: any, onClick: () => void, priority?: boolean, hideBadge?: boolean, isMini?: boolean }) => {
  const accentColor = item.category === 'concentrates' 
    ? (item.subcategory?.toLowerCase().includes('fresh frozen premium') ? "#34D399" : item.subcategory?.toLowerCase().includes('fresh frozen') ? "#FEC107" : SELECTED_COLOR)
    : (isElite(item) ? (item.subcategory?.toLowerCase().includes('import') ? IMPORT_COLOR : SELECTED_COLOR) : (GRADES.find(g => g.id === item.subcategory)?.color || SELECTED_COLOR));
  
  const { price: currentPrice, weight: firstWeight } = getFirstAvailablePrice(item);
  const oldPriceRaw = item.old_prices ? getInterpolatedPrice(firstWeight, item.old_prices, isElite(item)) : 0;
  const oldPrice = Math.round(oldPriceRaw);

  return (
    <div 
      onClick={onClick} 
      className={`relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group flex flex-col overflow-hidden ${isMini ? 'h-[180px]' : 'h-[240px]'}`} 
      style={{ boxShadow: `inset 0 0 0 1px ${accentColor}30`, background: `radial-gradient(circle at 50% 0%, ${accentColor}10 0%, rgba(0,0,0,1) 90%)` }}
    >
      {!hideBadge && item.badge && (
        <div className={`absolute top-3 right-3 z-20 ${isMini ? 'scale-90' : 'scale-100'}`}>
          <BadgeIcon type={item.badge} />
        </div>
      )}
      <div className={`relative z-10 p-5 pb-0 flex-1 flex flex-col min-h-0`}>
        <div className="min-w-0 pr-6">
          <h3 className={`${isMini ? 'text-[12px]' : 'text-[14px]'} font-black italic uppercase tracking-tight leading-tight text-white`}>{item.name}</h3>
          <p className={`${isMini ? 'text-[9px]' : 'text-[10px]'} font-bold mt-1 text-white/40 uppercase tracking-widest`}>{item.subcategory || "Product"}</p>
        </div>
        <div className="relative flex-1 w-full min-h-0 flex items-center justify-center my-2">
            <BlurImage src={item.image} priority={priority} width={isMini ? 140 : 200} height={isMini ? 140 : 200} className="max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]" alt={item.name} />
        </div>
      </div>
      <div className={`relative z-10 flex justify-between items-end px-5 pb-5 mt-auto`}>
        <span className={`${isMini ? 'text-[9px]' : 'text-[10px]'} font-black uppercase tracking-widest`} style={{ color: TYPE_COLORS[item.type?.toLowerCase()] || "#FFF" }}>{item.type}</span>
        <div className="flex flex-col items-end gap-1">
          {oldPrice > currentPrice && <span className={`${isMini ? 'text-[10px]' : 'text-[12px]'} font-bold line-through opacity-30 text-white leading-none`}>{oldPrice}฿</span>}
          <p className={`${isMini ? 'text-[16px]' : 'text-[20px]'} font-black italic tracking-tighter leading-none`} style={{ color: accentColor }}>{currentPrice > 0 ? `${currentPrice}฿` : '—'}</p>
        </div>
      </div>
    </div>
  );
});

const ProductRow = React.memo(({ p, onClick }: { p: any, onClick: () => void }) => (
  <div onClick={onClick} className="flex items-center justify-between gap-3 px-4 py-4 active:bg-white/5 transition-colors cursor-pointer group text-white border-b border-white/5 last:border-none">
    <div className="flex items-center gap-4 truncate flex-1">
      <div className="w-6 flex justify-center shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
      <span className="text-[14px] font-black uppercase italic tracking-tight text-white/90 truncate leading-tight">{p.name}</span>
    </div>
    <div className="flex items-center gap-5 shrink-0 pr-4">
      {p.farm && p.farm !== "-" && <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest italic truncate max-w-[90px]">{p.farm}</span>}
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{p.type}</span>
    </div>
  </div>
));

// --- MODALS ---

function ProductModal({ product, style, onClose, t }: { product: any, style: any, onClose: () => void, t: any }) {
  const isEliteProduct = isElite(product);
  const steps = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
  const weightToKey: Record<number, number> = isEliteProduct ? { 3.5: 1, 7: 5, 14: 10, 28: 20 } : { 1: 1, 5: 5, 10: 10, 20: 20 };
  const firstAvailableWeight = steps.find(w => (Number(product.prices?.[weightToKey[w]]) || 0) > 0) || steps[0];
  
  const [weight, setWeight] = React.useState(firstAvailableWeight);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);
  
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices, isEliteProduct));
  const oldPrice = product.old_prices ? Math.round(getInterpolatedPrice(weight, product.old_prices, isEliteProduct)) : 0;
  const isWeightAvailable = (w: number) => (Number(product.prices?.[weightToKey[w]]) || 0) > 0;

  const hasValue = (val: string, placeholder?: string) => {
    if (!val) return false;
    const v = val.trim();
    if (v === "" || v === "-" || v.toLowerCase() === "none") return false;
    if (placeholder && v.toLowerCase() === placeholder.toLowerCase()) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-[400px] bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-1.5 bg-black/40 rounded-full text-white/50 hover:text-white transition-colors"><X size={18}/></button>
        <div className="relative aspect-[1.4/1] w-full bg-black/10">
          <BlurImage src={product?.image} width={400} height={400} className="w-full h-full object-contain p-4" alt={product?.name} />
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#193D2E] via-[#193D2E]/90 to-transparent">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{product?.name}</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 text-white/60">
              <span style={{ color: TYPE_COLORS[product?.type?.toLowerCase()] }}>{product?.type}</span>
              <span className="mx-2 opacity-20">•</span>
              <span style={{ color: style?.color }}>{product?.subcategory}</span>
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-5">
          {(hasValue(product?.farm) || hasValue(product?.taste, "Sweet, Earthy") || hasValue(product?.terpenes, "Myrcene, Limonene")) && (
            <div className="flex flex-wrap gap-4 border-b border-white/5 pb-3">
               {hasValue(product?.farm) && (
                 <div className="space-y-0.5"><div className="flex items-center gap-1 opacity-20"><span className="text-[6px] font-black uppercase tracking-widest">{t.farm}</span></div><p className="text-[9px] font-bold italic truncate text-white">{product.farm}</p></div>
               )}
               {hasValue(product?.taste, "Sweet, Earthy") && (
                 <div className="space-y-0.5"><div className="flex items-center gap-1 opacity-20"><Leaf size={8}/><span className="text-[6px] font-black uppercase">{t.taste}</span></div><p className="text-[9px] font-bold italic truncate text-white">{product.taste}</p></div>
               )}
               {hasValue(product?.terpenes, "Myrcene, Limonene") && (
                 <div className="space-y-0.5"><div className="flex items-center gap-1 opacity-20"><Wind size={8}/><span className="text-[6px] font-black uppercase">{t.terps}</span></div><p className="text-[9px] font-bold italic truncate text-white">{product.terpenes}</p></div>
               )}
            </div>
          )}
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                 {oldPrice > currentPrice && <span className="text-lg font-black italic line-through opacity-20 text-white">{oldPrice}฿</span>}
                 <span className="text-3xl font-black italic tracking-tighter text-white">{currentPrice}฿</span>
              </div>
              <div className="text-[9px] font-black uppercase bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-white/60 tracking-widest">{weight}g</div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-1.5">
                {steps.map(v => {
                  const available = isWeightAvailable(v);
                  return (
                    <button key={v} disabled={!available} onClick={() => setWeight(v)} className={`py-3 text-[9px] font-black rounded-xl border transition-all ${!available ? "opacity-5 grayscale border-white/5" : weight === v ? "bg-white text-black border-white" : "border-white/5 text-white/30 active:bg-white/5"}`}>{v}g</button>
                  )
                })}
              </div>
            </div>
            <button onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 ${isAdded ? 'bg-emerald-400 text-black shadow-[0_0_30px_rgba(52,211,153,0.3)]' : 'bg-white text-[#193D2E]'}`}>{isAdded ? t.added : t.addToOrder}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ items, total, onClose, t }: { items: any[], total: number, onClose: () => void, t: any }) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { clearCart, removeItem } = useCart();
  
  const handleSubmit = async () => {
    if (!contact) return alert(t.contactPh);
    setIsSending(true);
    try {
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ contact, method, orderText: items.map(i => `${i.name} (${i.weight}) x${i.quantity} — ${i.price * i.quantity}฿`).join("\n"), total }) });
      alert(t.orderSent); clearCart(); onClose();
    } catch (e) { alert(t.sendError); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10 text-white">
          <div><h2 className="text-xl font-black italic uppercase tracking-tighter">{t.yourBasket}</h2><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{items.length} {t.items}</p></div>
          <button onClick={onClose} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {items.map((item: any) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5 text-white">
              <div className="w-10 h-10 rounded-lg bg-black/20 flex-shrink-0 p-1"><BlurImage src={item.image} width={100} height={100} className="w-full h-full object-contain" alt="" /></div>
              <div className="flex-1 min-w-0"><h3 className="text-[11px] font-black uppercase italic truncate">{item.name}</h3><p className="text-[9px] opacity-40 font-bold uppercase">{item.weight} • {item.price}฿</p></div>
              <button onClick={() => removeItem(item.id, item.weight)} className="text-rose-500/30 hover:text-rose-500 transition-colors p-2.5 bg-white/5 rounded-xl"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (<button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30 text-white"}`}><m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span></button>))}
          </div>
          <input type="text" placeholder={t[CONTACT_METHODS.find(m => m.id === method)?.phKey || "contactPh"]} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30" />
          <div className="flex items-center justify-between pt-2 text-white"><p className="text-[10px] font-black uppercase opacity-40">{t.totalAmount}</p><p className="text-3xl font-black italic tracking-tighter">{total}฿</p></div>
          <button 
            onClick={handleSubmit} 
            className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-[0.97] active:brightness-110 transition-all shadow-[0_10px_30px_rgba(52,211,153,0.2)]"
          >
            {t.confirmOrder}
          </button>
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

  // Карта описаний для быстрого доступа
  const descriptionsMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    initialDescriptions.forEach(d => { if (d.subcategory) map[d.subcategory.toLowerCase()] = d; });
    return map;
  }, [initialDescriptions]);

  const getDesc = (id: string) => {
    const data = descriptionsMap[id.toLowerCase()];
    if (!data) return null;
    return lang === 'ru' ? data.description_ru : data.description_eng;
  };

  const sortProductsByPrice = (prods: any[]) => {
    return [...prods].sort((a, b) => {
      const priceA = getFirstAvailablePrice(a).price;
      const priceB = getFirstAvailablePrice(b).price;
      return priceB - priceA;
    });
  };

  const recentUpdates = React.useMemo(() => {
    const news = processedProducts.filter(p => p.badge?.toUpperCase() === 'NEW');
    return [...news].sort((a, b) => {
      const dateA = a.date ? a.date.split('.').reverse().join('') : '0000';
      const dateB = b.date ? b.date.split('.').reverse().join('') : '0000';
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      const priceA = getFirstAvailablePrice(a).price;
      const priceB = getFirstAvailablePrice(b).price;
      return priceB - priceA;
    });
  }, [processedProducts]);

  const flashSales = React.useMemo(() => 
    sortProductsByPrice(processedProducts.filter(p => p.badge?.toUpperCase() === 'SALE')), 
  [processedProducts]);

  const gradeSections = React.useMemo(() => {
    return GRADES.map(grade => {
      const items = processedProducts.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
      const priceRef = items.find(p => p.badge?.toUpperCase() !== 'SALE') || items[0];
      return { grade, items, priceRef };
    }).filter(g => g.items.length > 0);
  }, [processedProducts]);

  const eliteSections = [
    { id: 'local', title: 'Local Exclusives', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), color: SELECTED_COLOR, icon: MapPin },
    { id: 'import', title: 'Import', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')), color: IMPORT_COLOR, icon: Star }
  ];

  const concentrateSections = React.useMemo(() => {
    const allConcs = processedProducts.filter(p => p.category === 'concentrates');
    const subs = Array.from(new Set(allConcs.map(p => p.subcategory)));
    return subs.map(sub => {
      let color = SELECTED_COLOR;
      const subLower = sub?.toLowerCase() || "";
      if (subLower.includes('old school')) color = "#C1C1C1";
      if (subLower.includes('fresh frozen premium')) color = "#34D399"; 
      else if (subLower.includes('fresh frozen')) color = "#FEC107"; 
      if (subLower.includes('live rosin')) color = "#A855F7"; 
      return {
        id: sub,
        title: sub || "Concentrates",
        items: allConcs.filter(p => p.subcategory === sub),
        color: color,
        icon: Droplets,
        isList: subLower.includes('old school')
      };
    });
  }, [processedProducts]);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32 selection:bg-emerald-500/30">
      <header className="max-w-xl mx-auto pt-6 mb-8">
        <div className="flex items-center justify-between px-2"> 
           <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[35px]"></div>
              <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={96} height={96} className="w-24 h-24 object-contain relative z-10" alt="Logo" />
           </div>
           <div className="flex items-center flex-1 justify-end">
              <div className="flex gap-3">
                {[ {icon: SendHorizontal, url: "https://t.me/bshk_phuket"}, {icon: Phone, url: "https://bndeliveryphuket.click/wa"}, {icon: Instagram, url: "https://www.instagram.com/boshkunadoroshku"} ].map((soc, i) => (
                  <Link key={i} href={soc.url} target="_blank" className="p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all active:scale-90"><soc.icon size={22} className="opacity-60"/></Link>
                ))}
              </div>
              <button 
                onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
                className="ml-8 w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 font-black text-[10px] text-emerald-400 active:scale-90 transition-all shrink-0"
              >
                {lang === 'en' ? 'RU' : 'EN'}
              </button>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-10">
          {[
            { id: 1, titleKey: "dailySupport", value: "12:00—00:00", color: "#A855F7" },
            { id: 3, titleKey: "minOrder", value: "1000฿", color: "#FBBF24" },
            { id: 2, titleKey: "delivery", value: "60 MINUTES", color: "#2DD4BF" },
            { id: 4, titleKey: "nationwide", value: "2-3 DAYS", color: "#60A5FA" },
          ].map((card) => (
            <div key={card.id} className="relative p-5 rounded-[2.2rem] border border-white/5 bg-black/20 flex flex-col items-center justify-center text-center min-h-[80px]">
              <div className="space-y-1">
                <p className="text-[15px] font-black italic tracking-[0.05em] text-white uppercase leading-tight">{card.value}</p>
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 leading-tight">{(t as any)[card.titleKey]}</p>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-full" style={{ backgroundColor: card.color }}></div>
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-3">
        {recentUpdates.length > 0 && (
          <section className="space-y-3 overflow-hidden">
            <div className="flex items-center gap-2 px-2">
              <BadgeIcon type="NEW" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 italic">{t.updates}</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6 snap-x">
              {recentUpdates.map((p, idx) => (<div key={p.id} className="w-[180px] shrink-0 snap-start"><HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} hideBadge={true} isMini={false} /></div>))}
            </div>
          </section>
        )}

        {flashSales.length > 0 && (
          <section className="space-y-3 overflow-hidden">
            <div className="flex items-center gap-2 px-2">
              <BadgeIcon type="SALE" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 italic">{t.sales}</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6 snap-x">
              {flashSales.map((p, idx) => (<div key={p.id} className="w-[180px] shrink-0 snap-start"><HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} hideBadge={true} isMini={false} /></div>))}
            </div>
          </section>
        )}

        <div className="space-y-6 pt-0.5">
          <div className="flex items-center gap-4 py-4">
             <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-500/10 to-emerald-500/30"></div>
             <span className="text-[13px] font-black uppercase tracking-[0.6em] italic text-emerald-400/80">{t.flowerMenu}</span>
             <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-emerald-500/10 to-emerald-500/30"></div>
          </div>

          {gradeSections.map(({ grade, items, priceRef }) => (
            <div key={grade.id} className="rounded-[2rem] overflow-hidden border border-white/5 bg-black/20">
              <button onClick={() => setOpenGrades(p => p.includes(grade.id) ? p.filter(x => x !== grade.id) : [...p, grade.id])} className="w-full px-4 py-8 flex flex-col items-start active:bg-white/5 transition-colors">
                <div className="w-full flex items-center justify-between mb-4 px-4">
                  <div className="flex items-center gap-3"><grade.icon size={22} style={{ color: grade.color }} /><h2 className="text-[16px] font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2></div>
                  <ChevronDown size={20} className={`opacity-20 transition-transform duration-300 ${openGrades.includes(grade.id) ? 'rotate-180' : ''}`} />
                </div>
                {/* ОПИСАНИЕ КАТЕГОРИИ */}
                {getDesc(grade.id) && (
                  <p className="px-4 mb-6 text-[11px] font-medium text-white/40 leading-relaxed text-left uppercase tracking-wide">
                    {getDesc(grade.id)}
                  </p>
                )}
                <div className="w-full grid grid-cols-4 gap-2 opacity-90 px-4">
                   {[1, 5, 10, 20].map(w => {
                     const p = Math.round(getInterpolatedPrice(w, priceRef.prices, false));
                     return (
                       <div key={w} className="flex flex-col items-center gap-1 bg-white/5 py-3.5 rounded-2xl border border-white/5">
                         <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{w}g</span>
                         <span className="text-[18px] font-black italic text-white tracking-tighter leading-none">{p > 0 ? `${p}฿` : '—'}</span>
                       </div>
                     )
                   })}
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ${openGrades.includes(grade.id) ? 'max-h-[3000px]' : 'max-h-0'}`}>
                <div className="divide-y divide-white/5 bg-white/5">
                  {items.map((p: any) => (
                    <ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {eliteSections.map(sec => sec.items.length > 0 && (
            <div key={sec.id} className="rounded-[2rem] overflow-hidden border border-white/5 bg-black/20">
              <button onClick={() => setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id])} className="w-full px-8 py-6 flex flex-col active:bg-white/5 transition-colors">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3"><sec.icon size={22} style={{ color: sec.color }} /><h2 className="text-[16px] font-black italic uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                  <ChevronDown size={20} className={`opacity-20 transition-transform duration-300 ${openGrades.includes(sec.id) ? 'rotate-180' : ''}`} />
                </div>
                {/* ОПИСАНИЕ КАТЕГОРИИ */}
                {getDesc(sec.id) && (
                  <p className="mt-3 text-[11px] font-medium text-white/40 leading-relaxed text-left uppercase tracking-wide">
                    {getDesc(sec.id)}
                  </p>
                )}
              </button>
              <div className={`overflow-hidden transition-all duration-500 ${openGrades.includes(sec.id) ? 'max-h-[3000px]' : 'max-h-0'}`}>
                <div className="p-6 grid grid-cols-2 gap-4 bg-white/5">
                  {sec.items.map(p => (
                    <HighlightCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {concentrateSections.length > 0 && (
            <>
              <div className="flex items-center gap-6 py-10">
                 <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/10 to-amber-500/30"></div>
                 <span className="text-[13px] font-black uppercase tracking-[0.6em] italic text-amber-500/80">{t.concentrates}</span>
                 <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-500/10 to-amber-500/30"></div>
              </div>

              {concentrateSections.map(sec => (
                <div key={sec.id} className="rounded-[2rem] overflow-hidden border border-white/5 bg-black/20">
                  <button onClick={() => setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id])} className="w-full px-8 py-6 flex flex-col active:bg-white/5 transition-colors">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-3"><sec.icon size={22} style={{ color: sec.color }} /><h2 className="text-[16px] font-black italic uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                      <ChevronDown size={20} className={`opacity-20 transition-transform duration-300 ${openGrades.includes(sec.id) ? 'rotate-180' : ''}`} />
                    </div>
                    {/* ОПИСАНИЕ КАТЕГОРИИ */}
                    {getDesc(sec.id) && (
                      <p className="mt-3 text-[11px] font-medium text-white/40 leading-relaxed text-left uppercase tracking-wide">
                        {getDesc(sec.id)}
                      </p>
                    )}
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${openGrades.includes(sec.id) ? 'max-h-[3000px]' : 'max-h-0'}`}>
                    {sec.isList ? (
                      <div className="divide-y divide-white/5 bg-white/5">
                        {sec.items.map(p => (
                          <ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 grid grid-cols-2 gap-4 bg-white/5">
                        {sec.items.map(p => (
                          <HighlightCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-white/10 backdrop-blur-2xl text-white py-3 px-7 rounded-[2.5rem] border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex justify-between items-center active:scale-95 transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-2 bg-emerald-400/20 rounded-xl"><ShoppingBag size={20} className="text-emerald-400"/></div>
              <div className="text-left">
                 <span className="block font-black uppercase text-[18px] tracking-tight leading-none mb-0.5">{getTotal()}฿</span>
                 <span className="block font-black uppercase text-[9px] tracking-widest text-emerald-400 leading-none">{items.length} {t.items}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white relative z-10 opacity-70 hover:opacity-100 transition-opacity">
              <span className="text-[12px] font-black uppercase tracking-widest italic">{t.basket}</span>
              <Send size={18}/>
            </div>
          </button>
        </div>
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          t={t}
          style={
            selectedProduct.category === 'concentrates' 
            ? { color: concentrateSections.find(s => s.id === selectedProduct.subcategory)?.color || CONCENTRATES_COLOR }
            : (isElite(selectedProduct) ? {color: selectedProduct.subcategory?.toLowerCase().includes('import') ? IMPORT_COLOR : SELECTED_COLOR} : (GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' }))
          } 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} t={t} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
