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

// --- КОНСТАНТЫ (Без изменений) ---
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
  { id: "telegram", label: "Telegram", icon: SendHorizontal, ph: "@username or phone" },
  { id: "whatsapp", label: "WhatsApp", icon: Phone, ph: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, ph: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, ph: "@username" },
];

const INFO_CARDS = [
  { id: 1, title: "SUPPORT", value: "12:00—00:00", color: "#A855F7" },
  { id: 3, title: "MIN ORDER", value: "1000฿", color: "#FBBF24" },
  { id: 2, title: "DELIVERY", value: "60 MIN", color: "#2DD4BF" },
  { id: 4, title: "THAI POST", value: "2-3 DAYS", color: "#60A5FA" },
];

const TYPE_SHORT: Record<string, string> = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };
const TYPE_COLORS: Record<string, string> = { "indica": "#A855F7", "sativa": "#FBBF24", "hybrid": "#2DD4BF" };

// --- HELPERS (Логика без изменений) ---
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
  switch (type.toUpperCase()) {
    case "NEW": return <div className="px-2 py-1 rounded-md bg-blue-500/20 border border-blue-500/30 shrink-0"><span className="text-[10px] font-black text-blue-400 tracking-wider">NEW</span></div>;
    case "HIT": return <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0"><Flame size={16} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0"><Percent size={16} className="text-emerald-400" /></div>;
    default: return null;
  }
});

const HighlightCard = React.memo(({ item, onClick, priority, hideBadge }: { item: any, onClick: () => void, priority?: boolean, hideBadge?: boolean }) => {
  const accentColor = item.category === 'concentrates' 
    ? (item.subcategory?.toLowerCase().includes('fresh frozen premium') ? "#34D399" : item.subcategory?.toLowerCase().includes('fresh frozen') ? "#FEC107" : SELECTED_COLOR)
    : (isElite(item) ? (item.subcategory?.toLowerCase().includes('import') ? IMPORT_COLOR : SELECTED_COLOR) : (GRADES.find(g => g.id === item.subcategory)?.color || SELECTED_COLOR));
  
  const { price: currentPrice, weight: firstWeight } = getFirstAvailablePrice(item);
  const oldPriceRaw = item.old_prices ? getInterpolatedPrice(firstWeight, item.old_prices, isElite(item)) : 0;
  const oldPrice = Math.round(oldPriceRaw);

  return (
    <div 
      onClick={onClick} 
      className="relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group flex flex-col overflow-hidden h-[240px]" 
      style={{ boxShadow: `inset 0 0 0 1px ${accentColor}40`, background: `radial-gradient(circle at 50% 0%, ${accentColor}15 0%, rgba(0,0,0,1) 100%)` }}
    >
      {!hideBadge && item.badge && <div className="absolute top-3 right-3 z-20 scale-110"><BadgeIcon type={item.badge} /></div>}
      <div className="relative z-10 p-5 pb-0 flex-1 flex flex-col min-h-0">
        <div className="min-w-0 pr-6">
          <h3 className="text-[14px] font-black italic uppercase tracking-tight leading-tight text-white mb-1">{item.name}</h3>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">{item.subcategory || "Product"}</p>
        </div>
        <div className="relative flex-1 w-full flex items-center justify-center my-2">
            <BlurImage src={item.image} priority={priority} width={180} height={180} className="max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]" alt={item.name} />
        </div>
      </div>
      <div className="relative z-10 flex justify-between items-end px-5 pb-5">
        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: TYPE_COLORS[item.type?.toLowerCase()] || "#FFF" }}>{TYPE_SHORT[item.type?.toLowerCase()] || item.type}</span>
        <div className="flex flex-col items-end gap-0.5">
          {oldPrice > currentPrice && <span className="text-[11px] font-bold line-through opacity-30 text-white leading-none">{oldPrice}฿</span>}
          <p className="text-[18px] font-black italic tracking-tighter leading-none" style={{ color: accentColor }}>{currentPrice > 0 ? `${currentPrice}฿` : '—'}</p>
        </div>
      </div>
    </div>
  );
});

const ProductRow = React.memo(({ p, onClick }: { p: any, onClick: () => void }) => (
  <div onClick={onClick} className="flex items-center justify-between gap-4 px-6 py-5 active:bg-white/10 transition-colors cursor-pointer group text-white">
    <div className="flex items-center gap-4 truncate flex-1">
      <div className="w-8 flex justify-start shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
      <span className="text-[16px] font-black uppercase italic tracking-tight text-white leading-tight truncate">{p.name}</span>
    </div>
    <div className="flex items-center gap-5 shrink-0">
      {p.farm && p.farm !== "-" && <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic hidden xs:block">{p.farm}</span>}
      <span className="text-[11px] font-black uppercase px-3 py-1.5 rounded-lg bg-white/5 min-w-[45px] text-center border border-white/5" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</span>
    </div>
  </div>
));

// --- MODALS ---

function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
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
    return !(v === "" || v === "-" || v.toLowerCase() === "none" || (placeholder && v.toLowerCase() === placeholder.toLowerCase()));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-[440px] bg-[#112a20] rounded-t-[3rem] sm:rounded-[3rem] border-t sm:border border-white/10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-20 p-2.5 bg-black/60 rounded-full text-white/70 active:scale-90 transition-all"><X size={24}/></button>
        
        <div className="relative aspect-square w-full bg-black/20">
          <BlurImage src={product?.image} width={500} height={500} className="w-full h-full object-contain p-8" alt={product?.name} />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#112a20] via-[#112a20]/80 to-transparent">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">{product?.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-md border border-white/5" style={{ color: TYPE_COLORS[product?.type?.toLowerCase()] }}>{product?.type}</span>
              <span className="text-[12px] font-black uppercase tracking-widest opacity-60 italic" style={{ color: style?.color }}>{product?.subcategory}</span>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-8">
          <div className="flex gap-6 border-b border-white/5 pb-6 overflow-x-auto no-scrollbar">
               {hasValue(product?.farm) && (
                 <div className="shrink-0"><div className="flex items-center gap-1.5 opacity-30 mb-1"><MapPin size={12}/><span className="text-[10px] font-black uppercase tracking-widest">Farm</span></div><p className="text-[14px] font-bold italic text-white leading-none">{product.farm}</p></div>
               )}
               {hasValue(product?.taste, "Sweet, Earthy") && (
                 <div className="shrink-0"><div className="flex items-center gap-1.5 opacity-30 mb-1"><Leaf size={12}/><span className="text-[10px] font-black uppercase tracking-widest">Taste</span></div><p className="text-[14px] font-bold italic text-white leading-none">{product.taste}</p></div>
               )}
               {hasValue(product?.terpenes, "Myrcene, Limonene") && (
                 <div className="shrink-0"><div className="flex items-center gap-1.5 opacity-30 mb-1"><Wind size={12}/><span className="text-[10px] font-black uppercase tracking-widest">Terps</span></div><p className="text-[14px] font-bold italic text-white leading-none">{product.terpenes}</p></div>
               )}
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-baseline gap-3">
                 <span className="text-5xl font-black italic tracking-tighter text-white">{currentPrice}฿</span>
                 {oldPrice > currentPrice && <span className="text-xl font-black italic line-through opacity-20 text-white">{oldPrice}฿</span>}
              </div>
              <div className="text-[16px] font-black bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 text-white tracking-tighter italic">{weight}g</div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {steps.map(v => {
                const available = isWeightAvailable(v);
                return (
                  <button 
                    key={v} 
                    disabled={!available} 
                    onClick={() => setWeight(v)} 
                    className={`py-4 text-[14px] font-black rounded-2xl border transition-all active:scale-95 ${!available ? "opacity-10 grayscale border-white/5" : weight === v ? "bg-white text-[#112a20] border-white shadow-lg" : "border-white/10 text-white/50 active:bg-white/10"}`}
                  >
                    {v}g
                  </button>
                )
              })}
            </div>

            <button 
              onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} 
              className={`w-full py-6 rounded-[2rem] font-black uppercase text-[16px] tracking-widest transition-all active:scale-95 shadow-xl ${isAdded ? 'bg-emerald-400 text-black shadow-emerald-500/20' : 'bg-white text-[#112a20]'}`}
            >
              {isAdded ? "ADDED TO BASKET" : "ADD TO ORDER"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ items, total, onClose }: { items: any[], total: number, onClose: () => void }) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { clearCart, removeItem } = useCart();
  
  const handleSubmit = async () => {
    if (!contact) return alert("Please enter contact info");
    setIsSending(true);
    try {
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ contact, method, orderText: items.map(i => `${i.name} (${i.weight}) x${i.quantity} — ${i.price * i.quantity}฿`).join("\n"), total }) });
      alert("Order sent!"); clearCart(); onClose();
    } catch (e) { alert("Error sending."); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-2xl" onClick={onClose}>
      <div className="relative w-full max-w-[480px] bg-[#112a20] rounded-t-[3rem] sm:rounded-[3rem] border-t sm:border border-white/10 flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div><h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">Your Order</h2><p className="text-[12px] font-bold opacity-30 uppercase tracking-[0.2em] text-white">{items.length} positions selected</p></div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-white/30 hover:text-white transition-colors"><X size={28}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
          {items.map((item: any) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-5 bg-white/5 rounded-[1.8rem] p-4 border border-white/5 text-white">
              <div className="w-14 h-14 rounded-2xl bg-black/40 flex-shrink-0 p-2 shadow-inner"><BlurImage src={item.image} width={120} height={120} className="w-full h-full object-contain" alt="" /></div>
              <div className="flex-1 min-w-0"><h3 className="text-[15px] font-black uppercase italic truncate mb-1">{item.name}</h3><p className="text-[12px] opacity-40 font-bold uppercase tracking-wider">{item.weight} • {item.price}฿</p></div>
              <button onClick={() => removeItem(item.id, item.weight)} className="text-rose-500/40 hover:text-rose-500 transition-colors p-3 bg-rose-500/5 rounded-2xl border border-rose-500/10 active:scale-90"><Trash2 size={20}/></button>
            </div>
          ))}
        </div>

        <div className="p-8 bg-black/30 border-t border-white/5 space-y-6">
          <div className="grid grid-cols-4 gap-3">
            {CONTACT_METHODS.map(m => (<button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-3 py-4 rounded-2xl border transition-all active:scale-95 ${method === m.id ? "bg-white text-[#112a20] border-white shadow-lg" : "bg-white/5 border-white/5 opacity-40 text-white"}`}><m.icon size={22} /><span className="text-[9px] font-black uppercase tracking-wider">{m.label}</span></button>))}
          </div>
          <input type="text" placeholder={CONTACT_METHODS.find(m => m.id === method)?.ph} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-2xl py-5 px-8 text-[16px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-20 shadow-inner" />
          <div className="flex items-center justify-between py-2"><p className="text-[13px] font-black uppercase opacity-30 text-white tracking-widest">TOTAL AMOUNT</p><p className="text-4xl font-black italic tracking-tighter text-white">{total}฿</p></div>
          <button onClick={handleSubmit} className="w-full bg-emerald-400 text-[#112a20] py-6 rounded-3xl font-black uppercase text-[16px] tracking-widest active:scale-[0.98] transition-all shadow-[0_15px_40px_rgba(52,211,153,0.3)]">CONFIRM & SEND</button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN LANDING ---
export default function LandingClient({ initialProducts }: { initialProducts: any[] }) {
  const processedProducts = React.useMemo(() => processProductData(initialProducts), [initialProducts]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [openGrades, setOpenGrades] = React.useState<string[]>([]);
  const { items, getTotal } = useCart();

  // Сортировка по убыванию цены
  const sortProductsByPrice = (prods: any[]) => [...prods].sort((a, b) => getFirstAvailablePrice(b).price - getFirstAvailablePrice(a).price);

  const recentUpdates = React.useMemo(() => sortProductsByPrice(processedProducts.filter(p => p.badge?.toUpperCase() === 'NEW')), [processedProducts]);
  const flashSales = React.useMemo(() => sortProductsByPrice(processedProducts.filter(p => p.badge?.toUpperCase() === 'SALE')), [processedProducts]);

  const gradeSections = React.useMemo(() => {
    return GRADES.map(grade => {
      const items = processedProducts.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
      const priceRef = items.find(p => !p.badge) || items[0];
      return { grade, items, priceRef };
    }).filter(g => g.items.length > 0);
  }, [processedProducts]);

  const eliteSections = [
    { id: 'local', title: 'Local Exclusives', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), color: SELECTED_COLOR, icon: MapPin },
    { id: 'import', title: 'Import Quality', items: processedProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')), color: IMPORT_COLOR, icon: Star }
  ];

  return (
    <div className="min-h-screen bg-[#112a20] text-white p-5 pb-40 selection:bg-emerald-500/30">
      <header className="max-w-2xl mx-auto pt-6 mb-10">
        <div className="flex items-center justify-between mb-8"> 
           <div className="flex items-center gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-[30px] animate-pulse"></div>
                <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={80} height={80} className="w-full h-full object-contain relative z-10" alt="Logo" />
              </div>
              <div>
                <h1 className="text-[12px] font-black uppercase tracking-[0.4em] opacity-50 text-emerald-400 mb-1 leading-none">BND PHUKET</h1>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-none">PREMIUM SELECTION</p>
              </div>
           </div>
           <div className="flex gap-3">
              {[ {icon: SendHorizontal, url: "https://t.me/bshk_phuket"}, {icon: Instagram, url: "https://www.instagram.com/boshkunadoroshku"} ].map((soc, i) => (
                <Link key={i} href={soc.url} target="_blank" className="p-3.5 bg-white/5 rounded-2xl border border-white/5 opacity-50 hover:opacity-100 transition-all active:scale-90"><soc.icon size={22}/></Link>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {INFO_CARDS.map((card) => (
            <div key={card.id} className="relative p-5 rounded-[2rem] border border-white/5 bg-black/30 flex flex-col items-center justify-center text-center">
              <p className="text-[16px] font-black italic tracking-tighter text-white uppercase leading-none mb-1.5">{card.value}</p>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 leading-none">{card.title}</p>
              <div className="absolute bottom-3 w-10 h-[3px] rounded-full" style={{ backgroundColor: card.color }}></div>
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-12">
        {/* RECENT & SALES */}
        {[ {title: "Recent Arrivals", badge: "NEW", data: recentUpdates}, {title: "Special Offers", badge: "SALE", data: flashSales} ].map((sec, i) => sec.data.length > 0 && (
          <section key={i} className="space-y-5">
            <div className="flex items-center gap-3 px-2">
              <BadgeIcon type={sec.badge} />
              <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-white/50 italic">{sec.title}</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-5 px-5 snap-x">
              {sec.data.map((p, idx) => (<div key={p.id} className="w-[200px] shrink-0 snap-start"><HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} hideBadge={true} /></div>))}
            </div>
          </section>
        ))}

        <div className="space-y-6">
          <div className="flex items-center gap-6 py-4">
             <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-emerald-500/20"></div>
             <span className="text-[13px] font-black uppercase tracking-[0.6em] italic text-emerald-400">Menu</span>
             <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-emerald-500/20"></div>
          </div>

          {/* FLOWER GRADES */}
          {gradeSections.map(({ grade, items, priceRef }) => (
            <div key={grade.id} className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-black/30 shadow-xl">
              <button onClick={() => setOpenGrades(p => p.includes(grade.id) ? p.filter(x => x !== grade.id) : [...p, grade.id])} className="w-full p-8 flex flex-col active:bg-white/5 transition-all">
                <div className="w-full flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4"><grade.icon size={28} style={{ color: grade.color }} /><h2 className="text-[20px] font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2></div>
                  <ChevronDown size={24} className={`opacity-20 transition-transform duration-500 ${openGrades.includes(grade.id) ? 'rotate-180' : ''}`} />
                </div>
                <div className="w-full grid grid-cols-4 gap-2 opacity-90">
                   {[1, 5, 10, 20].map(w => {
                     const p = Math.round(getInterpolatedPrice(w, priceRef.prices, false));
                     return (
                       <div key={w} className="flex flex-col items-center gap-1 bg-white/5 py-3 rounded-2xl border border-white/5">
                         <span className="text-[10px] font-black opacity-30 uppercase tracking-widest leading-none">{w}g</span>
                         <span className="text-[16px] font-black italic text-white tracking-tighter leading-none">{p > 0 ? `${p}฿` : '—'}</span>
                       </div>
                     )
                   })}
                </div>
              </button>
              <div className={`transition-all duration-500 ease-in-out ${openGrades.includes(grade.id) ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="divide-y divide-white/5 bg-white/5">
                  {items.map((p: any) => <ProductRow key={p.id} p={p} onClick={() => setSelectedProduct(p)} />)}
                </div>
              </div>
            </div>
          ))}

          {/* ELITE SECTIONS */}
          {eliteSections.map(sec => sec.items.length > 0 && (
            <div key={sec.id} className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-black/30">
              <button onClick={() => setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id])} className="w-full p-8 flex items-center justify-between active:bg-white/5">
                <div className="flex items-center gap-4"><sec.icon size={28} style={{ color: sec.color }} /><h2 className="text-[20px] font-black italic uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                <ChevronDown size={24} className={`opacity-20 transition-transform duration-300 ${openGrades.includes(sec.id) ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-500 overflow-hidden ${openGrades.includes(sec.id) ? 'max-h-[3000px]' : 'max-h-0'}`}>
                <div className="p-6 grid grid-cols-2 gap-4 bg-white/5">
                  {sec.items.map(p => <HighlightCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOATING BASKET */}
      {items.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-emerald-400 text-[#112a20] p-6 rounded-[2.5rem] shadow-[0_25px_60px_rgba(52,211,153,0.4)] flex justify-between items-center active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl"><ShoppingBag size={24} /></div>
              <div className="text-left">
                <p className="text-[18px] font-black italic leading-none">{getTotal()}฿</p>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{items.length} items</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-black uppercase tracking-widest italic">Check basket</span>
              <Send size={24}/>
            </div>
          </button>
        </div>
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          style={{color: isElite(selectedProduct) ? (selectedProduct.subcategory?.toLowerCase().includes('import') ? IMPORT_COLOR : SELECTED_COLOR) : (GRADES.find(g => g.id === selectedProduct.subcategory)?.color || '#FFF')}} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
