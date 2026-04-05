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
const SELECTED_COLOR = "#2DD4BF"; 
const IMPORT_COLOR = "#60A5FA";

const GRADES = [
  { id: "silver", title: "SILVER GRADE", color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", color: "#FEC107", icon: Star },
  { id: "premium", title: "PREMIUM GRADE", color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", color: "#A855F7", icon: Crown }
];

const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, ph: "@username or phone number" },
  { id: "whatsapp", label: "WhatsApp", icon: Phone, ph: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, ph: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, ph: "@username or phone number" },
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

// Обновленный BadgeIcon согласно запросу
const BadgeIcon = React.memo(({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return (
      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
        <span className="text-[6px] font-black text-blue-400">NEW</span>
      </div>
    );
    case "HIT": return (
      <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
        <Flame size={10} className="text-orange-400" />
      </div>
    );
    case "SALE": return (
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
        <Percent size={10} className="text-emerald-400" />
      </div>
    );
    default: return null;
  }
});
BadgeIcon.displayName = "BadgeIcon";

const HighlightCard = React.memo(({ item, onClick, priority }: { item: any, onClick: () => void, priority?: boolean }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const gradeColor = GRADES.find(g => g.id === item.subcategory)?.color || SELECTED_COLOR;
  const accentColor = isElite(item) ? (isImport ? IMPORT_COLOR : SELECTED_COLOR) : gradeColor; 
  const typeColor = TYPE_COLORS[item.type?.toLowerCase()] || "#FFF";
  const displayPrice = Math.round(getInterpolatedPrice(isElite(item) ? 3.5 : 1, item.prices, isElite(item)));

  return (
    <div onClick={onClick} className="relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group flex flex-col h-[200px] overflow-hidden" style={{ boxShadow: `inset 0 0 0 1px ${accentColor}30`, background: `radial-gradient(circle at 50% 0%, ${accentColor}10 0%, rgba(0,0,0,1) 90%)` }}>
      <div className="absolute top-3 left-3 z-20">
        {item.badge && <BadgeIcon type={item.badge} />}
      </div>
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
        <span className="text-[6px] font-black uppercase tracking-widest opacity-60" style={{ color: typeColor }}>{TYPE_SHORT[item.type?.toLowerCase()] || item.type}</span>
        <p className="text-[11px] font-black italic tracking-tighter" style={{ color: accentColor }}>{displayPrice > 0 ? `${displayPrice}฿` : '—'}</p>
      </div>
    </div>
  );
});

const ProductRow = React.memo(({ p, onClick }: { p: any, onClick: () => void }) => (
  <div onClick={onClick} className="flex items-center justify-between gap-3 px-6 py-3.5 active:bg-white/5 transition-colors cursor-pointer group">
    <div className="flex items-center gap-3 truncate flex-1">
      <div className="w-6 flex justify-start shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
      <span className="text-[12px] font-black uppercase italic tracking-tight text-white/90 truncate leading-tight">{p.name}</span>
    </div>
    <div className="flex items-center gap-4 shrink-0">
      {p.farm && p.farm !== "-" && (
        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic truncate max-w-[80px]">{p.farm}</span>
      )}
      <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-white/5 min-w-[36px] text-center" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</span>
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
  const pricePerGram = weight > 0 ? Math.round(currentPrice / weight) : 0;
  const isWeightAvailable = (w: number) => (Number(product.prices?.[weightToKey[w]]) || 0) > 0;

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
              <span style={{ color: style?.color }}>{product?.subcategory} Grade</span>
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 border-b border-white/5 pb-3">
             <div className="space-y-0.5"><div className="flex items-center gap-1 opacity-20"><MapPin size={8}/><span className="text-[6px] font-black uppercase">Farm</span></div><p className="text-[9px] font-bold italic truncate text-white">{product?.farm && product.farm !== "-" ? product.farm : 'Private'}</p></div>
             <div className="space-y-0.5"><div className="flex items-center gap-1 opacity-20"><Leaf size={8}/><span className="text-[6px] font-black uppercase">Taste</span></div><p className="text-[9px] font-bold italic truncate text-white">{product?.taste || '-'}</p></div>
             <div className="space-y-0.5"><div className="flex items-center gap-1 opacity-20"><Wind size={8}/><span className="text-[6px] font-black uppercase">Terps</span></div><p className="text-[9px] font-bold italic truncate text-white">{product?.terpenes || '-'}</p></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end text-white">
              <div><div className="text-3xl font-black italic tracking-tighter">{currentPrice}฿</div><div className="text-[8px] font-bold opacity-30 uppercase tracking-widest">Per gram: {pricePerGram}฿</div></div>
              <div className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full">{weight}g</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {steps.map(v => {
                const available = isWeightAvailable(v);
                return (
                  <button key={v} disabled={!available} onClick={() => setWeight(v)} className={`py-2 text-[10px] font-black rounded-xl border transition-all ${!available ? "opacity-10 grayscale border-white/5 text-white/10" : weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}>{v}g</button>
                )
              })}
            </div>
            <button onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} className={`w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all active:scale-95 ${isAdded ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'bg-white text-[#193D2E]'}`}>{isAdded ? "Added to Cart" : "Add to Order"}</button>
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10 text-white">
          <div><h2 className="text-xl font-black italic uppercase tracking-tighter">Your Basket</h2><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{items.length} items</p></div>
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
          <input type="text" placeholder={CONTACT_METHODS.find(m => m.id === method)?.ph} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30" />
          <div className="flex items-center justify-between pt-2 text-white"><p className="text-[10px] font-black uppercase opacity-40">Total Amount</p><p className="text-3xl font-black italic tracking-tighter">{total}฿</p></div>
          <button onClick={handleSubmit} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-95 transition-all shadow-[0_10px_30px_rgba(52,211,153,0.2)]">Confirm Order</button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN LANDING ---
export default function LandingClient({ initialProducts }: { initialProducts: any[] }) {
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [openGrades, setOpenGrades] = React.useState<string[]>([]);
  const { items, getTotal } = useCart();

  const sortProductsByPrice = (prods: any[]) => {
    return [...prods].sort((a, b) => {
      const priceA = getInterpolatedPrice(isElite(a) ? 3.5 : 1, a.prices, isElite(a));
      const priceB = getInterpolatedPrice(isElite(b) ? 3.5 : 1, b.prices, isElite(b));
      return priceB - priceA;
    });
  };

  const recentUpdates = React.useMemo(() => 
    sortProductsByPrice(initialProducts.filter(p => p.category === 'buds' && p.badge?.toUpperCase() === 'NEW')), 
  [initialProducts]);

  const gradeSections = React.useMemo(() => {
    return GRADES.map(grade => {
      const items = initialProducts.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
      const priceRef = items.find(p => p.badge?.toUpperCase() !== 'SALE') || items[0];
      return { grade, items, priceRef };
    }).filter(g => g.items.length > 0);
  }, [initialProducts]);

  const eliteSections = [
    { id: 'local', title: 'Local Exclusives', items: initialProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), color: SELECTED_COLOR, icon: MapPin },
    { id: 'import', title: 'Import', items: initialProducts.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')), color: IMPORT_COLOR, icon: Star }
  ];

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32 selection:bg-emerald-500/30">
      <header className="max-w-xl mx-auto pt-4">
        <div className="flex items-center justify-between mb-4"> 
           <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[20px]"></div>
                <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={64} height={64} className="w-full h-full object-contain relative z-10" alt="Logo" />
              </div>
              <h1 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none text-emerald-400/80">Premium Service</h1>
           </div>
           <div className="flex gap-2">
              {[ {icon: SendHorizontal, url: "https://t.me/bshk_phuket"}, {icon: Phone, url: "https://bndeliveryphuket.click/wa"}, {icon: Instagram, url: "https://www.instagram.com/boshkunadoroshku"} ].map((soc, i) => (
                <Link key={i} href={soc.url} target="_blank" className="p-2.5 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 transition-all active:scale-90"><soc.icon size={18}/></Link>
              ))}
           </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {INFO_CARDS.map((card) => (
            <div key={card.id} className="relative p-5 rounded-[2.2rem] border border-white/5 bg-black/20 flex flex-col items-center justify-center text-center min-h-[80px]">
              <div className="space-y-0.5">
                <p className="text-[15px] font-black italic tracking-[0.1em] text-white uppercase">{card.value}</p>
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">{card.title}</p>
              </div>
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
          <div className="flex items-center gap-4 py-4">
             <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-500/10 to-emerald-500/30"></div>
             <span className="text-[11px] font-black uppercase tracking-[0.6em] italic text-emerald-400/80">Full Catalog</span>
             <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-emerald-500/10 to-emerald-500/30"></div>
          </div>

          {gradeSections.map(({ grade, items, priceRef }) => (
            <div key={grade.id} className="rounded-[1.8rem] overflow-hidden border border-white/5 bg-black/20">
              <button onClick={() => setOpenGrades(p => p.includes(grade.id) ? p.filter(x => x !== grade.id) : [...p, grade.id])} className="w-full px-6 py-6 flex flex-col items-start active:bg-white/5 transition-colors">
                <div className="w-full flex items-center justify-between mb-5">
                  <div className="flex items-center"><grade.icon size={18} style={{ color: grade.color }} className="mr-3" /><h2 className="text-[13px] font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2></div>
                  <ChevronDown size={16} className={`opacity-20 transition-transform duration-300 ${openGrades.includes(grade.id) ? 'rotate-180' : ''}`} />
                </div>
                <div className="w-full flex flex-row justify-between items-center opacity-80 px-1">
                   {[1, 5, 10, 20].map(w => {
                     const p = Math.round(getInterpolatedPrice(w, priceRef.prices, false));
                     return (
                       <div key={w} className="flex items-baseline gap-1">
                         <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">{w}g</span>
                         <span className="text-[16px] font-black italic text-white tracking-tighter leading-none">{p > 0 ? `${p}฿` : '—'}</span>
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
            <div key={sec.id} className="rounded-[1.8rem] overflow-hidden border border-white/5 bg-black/20">
              <button onClick={() => setOpenGrades(p => p.includes(sec.id) ? p.filter(x => x !== sec.id) : [...p, sec.id])} className="w-full px-6 py-5 flex items-center justify-between active:bg-white/5 transition-colors">
                <div className="flex items-center"><sec.icon size={18} style={{ color: sec.color }} className="mr-3" /><h2 className="text-[13px] font-black italic uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2></div>
                <ChevronDown size={16} className={`opacity-20 transition-transform duration-300 ${openGrades.includes(sec.id) ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-500 ${openGrades.includes(sec.id) ? 'max-h-[3000px]' : 'max-h-0'}`}>
                <div className="p-4 grid grid-cols-2 gap-3 bg-white/5">
                  {sec.items.map(p => (
                    <HighlightCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-white/10 backdrop-blur-2xl text-white p-5 rounded-[2.2rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex justify-between items-center active:scale-95 transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
              <ShoppingBag size={20} className="text-emerald-400"/>
              <span className="font-black uppercase text-[13px] tracking-[0.1em]">{getTotal()}฿ Total</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 relative z-10">
              <span className="text-[10px] font-black uppercase">Order</span>
              <Send size={18}/>
            </div>
          </button>
        </div>
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          style={isElite(selectedProduct) ? {color: selectedProduct.subcategory?.toLowerCase().includes('import') ? IMPORT_COLOR : SELECTED_COLOR} : (GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' })} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
