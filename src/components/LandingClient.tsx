"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Gift, Info, Trash2, Headset, ChevronDown,
  Clock, Bike, ShoppingCart, Globe, Star, Phone
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { BlurImage } from "@/components/blur-image"

// --- КОНСТАНТЫ ---
const SELECTED_COLOR = "#2DD4BF"; 
const IMPORT_COLOR = "#60A5FA";

const GRADES = [
  { id: "silver", title: "SILVER GRADE", color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", color: "#FEC107", icon: Sparkles },
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
  { id: 2, title: "PHUKET DELIVERY", value: "60 MINUTES", color: "#2DD4BF" },
  { id: 3, title: "MINIMAL ORDER", value: "1000฿", color: "#FBBF24" },
  { id: 4, title: "TH SHIPPING", value: "2-3 DAYS", color: "#60A5FA" },
];

const TYPE_SHORT: Record<string, string> = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };
const TYPE_COLORS: Record<string, string> = { "indica": "#A855F7", "sativa": "#FBBF24", "hybrid": "#2DD4BF" };

// --- HELPERS ---
const isElite = (product: any) => {
  const sub = product?.subcategory?.toLowerCase() || "";
  return sub.includes('exclusive') || sub.includes('import');
};

const getElitePrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  const weightMap: Record<number, number> = { 3.5: 1, 7: 5, 14: 10, 28: 20 };
  return prices[weightMap[weight]] || 0;
};

const getInterpolatedPrice = (weight: number, prices: any) => {
  if (!prices) return 0;
  if (weight <= 1) return (prices[1] || 0) * weight;
  if (weight <= 5) return (prices[1] || 0) + ((prices[5] || 0) - (prices[1] || 0)) * ((weight - 1) / 4);
  if (weight <= 10) return (prices[5] || 0) + ((prices[10] || 0) - (prices[5] || 0)) * ((weight - 5) / 5);
  if (weight <= 20) return (prices[10] || 0) + ((prices[20] || 0) - (prices[10] || 0)) * ((weight - 10) / 10);
  return ((prices[20] || 0) / 20) * weight;
};

// --- COMPONENTS ---
const BadgeIcon = React.memo(({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0"><span className="text-[6px] font-black text-blue-400 uppercase leading-none">New</span></div>;
    case "HIT": return <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-400/30 shrink-0"><Flame size={10} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0"><Percent size={10} className="text-emerald-400" /></div>;
    default: return null;
  }
});

const ExclusiveCard = React.memo(({ item, onClick }: { item: any, onClick: () => void }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const accentColor = isImport ? IMPORT_COLOR : SELECTED_COLOR;
  const displayPrice = getElitePrice(3.5, item.prices);

  return (
    <div 
      onClick={onClick} 
      className="flex items-center gap-4 p-4 active:bg-white/5 transition-colors cursor-pointer group border-b border-white/5 last:border-0"
    >
      <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex-shrink-0 overflow-hidden p-2 relative">
        <div className="absolute inset-0 bg-gradient-to-br opacity-20" style={{ from: accentColor, to: 'transparent' }} />
        <BlurImage src={item.image} width={64} height={64} className="w-full h-full object-contain relative z-10" alt={item.name} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
           <h3 className="text-[11px] font-black italic uppercase tracking-tight text-white leading-tight truncate">{item.name}</h3>
           <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 shrink-0" style={{ color: TYPE_COLORS[item.type?.toLowerCase()] }}>{TYPE_SHORT[item.type?.toLowerCase()]}</span>
        </div>
        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{item.farm || "Private Reserve"}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[14px] font-black italic tracking-tighter" style={{ color: accentColor }}>{displayPrice}฿</p>
        <p className="text-[7px] font-bold opacity-20 uppercase tracking-widest">3.5g</p>
      </div>
    </div>
  );
});

const HighlightCard = React.memo(({ item, onClick, priority }: { item: any, onClick: () => void, priority?: boolean }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const gradeColor = GRADES.find(g => g.id === item.subcategory)?.color || SELECTED_COLOR;
  const accentColor = isElite(item) ? (isImport ? IMPORT_COLOR : SELECTED_COLOR) : gradeColor; 
  const typeColor = TYPE_COLORS[item.type?.toLowerCase()] || "#FFF";
  const displayPrice = isElite(item) ? (Object.values(item.prices || {}).find(v => Number(v) > 0) || 0) : Math.round(getInterpolatedPrice(1, item.prices));

  return (
    <div onClick={onClick} className="relative rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group flex flex-col h-[200px] overflow-hidden" style={{ boxShadow: `inset 0 0 0 1px ${accentColor}30`, background: `radial-gradient(circle at 50% 0%, ${accentColor}10 0%, rgba(0,0,0,1) 90%)` }}>
      <div className="relative z-10 p-5 pb-0 flex-1 flex flex-col">
        <div className="min-w-0">
          <h3 className="text-[11px] font-black italic uppercase tracking-tighter leading-tight truncate text-white">{item.name}</h3>
          <p className="text-[7px] font-black mt-1 text-white/40 truncate uppercase italic tracking-widest">{item.subcategory || "Buds"}</p>
        </div>
        <div className="relative aspect-square w-full mt-auto mb-2">
            <BlurImage src={item.image} priority={priority} width={180} height={180} className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500" alt={item.name} />
        </div>
      </div>
      <div className="relative z-10 flex justify-between items-center p-5 pt-0">
        <span className="text-[6px] font-black uppercase tracking-widest opacity-60" style={{ color: typeColor }}>{item.type}</span>
        <p className="text-[13px] font-black italic tracking-tighter" style={{ color: accentColor }}>{displayPrice}฿</p>
      </div>
    </div>
  );
});

const ProductRow = React.memo(({ p, onClick, showFarm }: { p: any, onClick: () => void, showFarm?: boolean }) => {
  return (
    <div onClick={onClick} className="flex flex-col gap-1 px-5 py-4 active:bg-white/5 transition-colors cursor-pointer group">
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center gap-3 truncate flex-1">
          <div className="w-5 flex justify-center shrink-0">{p.badge && <BadgeIcon type={p.badge} />}</div>
          <span className="text-[11px] font-black uppercase italic tracking-tight text-white/90 truncate leading-tight">{p.name}</span>
        </div>
        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 shrink-0 ml-2" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</span>
      </div>
      {showFarm && p.farm && (
        <div className="pl-8 text-[8px] font-bold text-white/20 uppercase tracking-widest italic">{p.farm}</div>
      )}
    </div>
  );
});

// --- MODALS ---
function ProductModal({ product, style, onClose, categoryBasePrices }: { product: any, style: any, onClose: () => void, categoryBasePrices?: any }) {
  const isEliteProduct = isElite(product);
  const weights = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
  const initialWeight = isEliteProduct ? (weights.find(w => getElitePrice(w, product?.prices) > 0) || weights[0]) : weights[0];
  const [weight, setWeight] = React.useState(initialWeight);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);
  const currentPrice = Math.round(isEliteProduct ? getElitePrice(weight, product?.prices) : getInterpolatedPrice(weight, product?.prices)) || 0;
  const pricePerGram = weight > 0 ? Math.round(currentPrice / weight) : 0;
  const typeColor = TYPE_COLORS[String(product?.type || "").toLowerCase()] || "#FFF";
  const isSale = product?.badge?.toUpperCase() === 'SALE';
  const basePriceForWeight = !isEliteProduct && categoryBasePrices ? Math.round(getInterpolatedPrice(weight, categoryBasePrices)) : null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50 hover:text-white"><X size={20}/></button>
        <div className="aspect-square w-full relative bg-black/10">
          <BlurImage src={product?.image} width={600} height={600} className="w-full h-full object-contain p-10" alt={product?.name} />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style?.color || '#FFF' }}>{product?.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1 text-white"><span style={{ color: typeColor }}>{product?.type}</span><span className="mx-2 opacity-20">•</span><span style={{ color: style?.color || '#FFF' }}>{product?.subcategory} Grade</span></p>
          </div>
        </div>
        <div className="p-8 pt-0 space-y-6 text-white">
          <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><MapPin size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Farm</span></div><p className="text-[10px] font-bold italic truncate">{product?.farm || '-'}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Leaf size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Taste</span></div><p className="text-[10px] font-bold italic truncate">{product?.taste || '-'}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Wind size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Terps</span></div><p className="text-[10px] font-bold italic truncate">{product?.terpenes || '-'}</p></div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-baseline gap-2">
                   {isSale && basePriceForWeight && basePriceForWeight > currentPrice && (<span className="text-xl font-black italic tracking-tighter line-through opacity-30">{basePriceForWeight}฿</span>)}
                   <div className="text-4xl font-black italic tracking-tighter">{currentPrice}฿</div>
                </div>
                <div className="text-[9px] font-bold opacity-30 uppercase mt-1">Price per gram: {pricePerGram}฿</div>
              </div>
              <div className="text-[11px] font-black uppercase bg-white/10 px-4 py-1 rounded-full mb-1">{weight}g</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {weights.map(v => {
                const hasPrice = isEliteProduct ? (getElitePrice(v, product?.prices) > 0) : true;
                return (
                  <button key={v} disabled={!hasPrice} onClick={() => setWeight(v)} className={`py-3 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"} ${!hasPrice ? "opacity-10 grayscale cursor-not-allowed" : "opacity-100"}`}>{v}g</button>
                );
              })}
            </div>
            <button onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} className={`w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}>{isAdded ? "Added to Cart" : "Add to Order"}</button>
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
  const getOrderSummary = () => items.map(i => `${i.name} (${i.weight}) x${i.quantity} — ${i.price * i.quantity}฿`).join("\n");
  const handleSubmit = async () => {
    if (!contact) return alert("Please enter contact info");
    setIsSending(true);
    try {
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ contact, method, orderText: getOrderSummary(), total }) });
      alert("Order sent!"); clearCart(); onClose();
    } catch (e) { alert("Error sending."); } finally { setIsSending(false); }
  };
  const handleOperatorContact = () => {
    const text = encodeURIComponent(`Hi! I want to make an order:\n\n${getOrderSummary()}\n\nTotal: ${total}฿`);
    window.open(`https://t.me/bshk_phuket?text=${text}`, '_blank');
  };
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10 text-white">
          <div><h2 className="text-xl font-black italic uppercase tracking-tighter">Your Basket</h2><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{items.length} items</p></div>
          <button onClick={onClose} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {items.map((item: any) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5 text-white">
              <div className="w-10 h-10 rounded-lg bg-black/20 flex-shrink-0"><BlurImage src={item.image} width={100} height={100} className="w-full h-full object-contain" alt="" /></div>
              <div className="flex-1 min-w-0"><h3 className="text-[11px] font-black uppercase italic truncate">{item.name}</h3><p className="text-[9px] opacity-40 font-bold uppercase">{item.weight} • {item.price}฿</p></div>
              <button onClick={() => removeItem(item.id, item.weight)} className="text-rose-500/30 hover:text-rose-500 transition-colors p-2 bg-white/5 rounded-xl"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <button onClick={handleOperatorContact} className="w-full py-4 bg-emerald-400/10 border border-emerald-400/20 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all group">
            <Headset size={18} className="text-emerald-400" /><span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Talk to Operator</span>
          </button>
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (<button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30 text-white"}`}><m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span></button>))}
          </div>
          <input type="text" placeholder={CONTACT_METHODS.find(m => m.id === method)?.ph} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30" />
          <div className="flex items-center justify-between pt-2 text-white"><p className="text-[10px] font-black uppercase opacity-40">Total Amount</p><p className="text-3xl font-black italic tracking-tighter">{total}฿</p></div>
          <button onClick={handleSubmit} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-95 transition-all">Confirm Order</button>
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

  const products = initialProducts;

  const recentUpdates = React.useMemo(() => products.filter(p => p.category === 'buds' && p.badge?.toUpperCase() === 'NEW'), [products]);
  const menuHits = React.useMemo(() => products.filter(p => p.category === 'buds' && p.badge?.toUpperCase() === 'HIT'), [products]);

  const gradeSections = React.useMemo(() => {
    return GRADES.map(grade => {
      const items = products.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
      const priceRef = items.find(p => p.badge?.toUpperCase() !== 'SALE') || items[0];
      return { grade, items, priceRef };
    }).filter(g => g.items.length > 0);
  }, [products]);

  const eliteLocal = React.useMemo(() => products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')), [products]);
  const eliteImport = React.useMemo(() => products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')), [products]);

  const toggleGrade = (id: string) => {
    setOpenGrades(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="max-w-xl mx-auto pt-4">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[20px] z-0"></div>
                <BlurImage src="https://res.cloudinary.com/dpjwbcgrq/image/upload/v1774704686/IMG_0036_t5cnic.png" priority width={64} height={64} className="w-full h-full object-contain relative z-10" alt="Logo" />
              </div>
              <h1 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-none text-emerald-400/80">Premium Service</h1>
           </div>
           <div className="flex gap-2">
              <Link href="https://t.me/bshk_phuket" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 transition-all"><SendHorizontal size={16}/></Link>
              <Link href="https://bndeliveryphuket.click/wa" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 transition-all"><Phone size={16}/></Link>
              <Link href="https://www.instagram.com/boshkunadoroshku" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 transition-all"><Instagram size={16}/></Link>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {INFO_CARDS.map((card) => (
            <div key={card.id} className="relative p-6 rounded-[2.2rem] border border-white/5 bg-black/20 flex flex-col items-center justify-center text-center group active:scale-[0.98] transition-all min-h-[100px]">
              <div className="space-y-1">
                <p className="text-[16px] font-black italic tracking-[0.1em] text-white uppercase">{card.value}</p>
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">{card.title}</p>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full opacity-20" style={{ backgroundColor: card.color }}></div>
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-6">
            {recentUpdates.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Recent Updates</h2>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                  {recentUpdates.map((p, idx) => (
                    <div key={p.id} className="w-[160px] shrink-0 snap-start">
                      <HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {menuHits.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Flame size={14} className="text-orange-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Menu Hits</h2>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                  {menuHits.map((p, idx) => (
                    <div key={p.id} className="w-[160px] shrink-0 snap-start">
                      <HighlightCard item={p} onClick={() => setSelectedProduct(p)} priority={idx < 4} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4 py-6">
                   <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-emerald-500/40"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-emerald-400/90 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">Full Catalog</span>
                   <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-emerald-500/20 to-emerald-500/40"></div>
                </div>

                {gradeSections.map(({ grade, items, priceRef }) => {
                  const isOpen = openGrades.includes(grade.id);
                  const isHighGrade = grade.id === 'premium' || grade.id === 'selected';
                  return (
                    <div key={grade.id} className="rounded-[1.5rem] overflow-hidden border border-white/5 bg-black/20">
                      <button onClick={() => toggleGrade(grade.id)} className="w-full px-5 py-4 flex flex-col items-start active:bg-white/5 transition-colors group">
                        <div className="w-full flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <grade.icon size={16} style={{ color: grade.color }} className="mr-3" />
                            <h2 className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                          </div>
                          <ChevronDown size={14} className={`opacity-20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="flex items-center gap-4 pl-[28px]">
                           {[1, 5, 10, 20].map(w => (
                             <div key={w} className="flex items-center gap-1.5">
                               <span className="text-[7px] font-black opacity-20 uppercase tracking-widest">{w}g</span>
                               <span className="text-[10px] font-black italic text-white/50">{Math.round(getInterpolatedPrice(w, priceRef.prices))}฿</span>
                             </div>
                           ))}
                        </div>
                      </button>
                      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[2500px]' : 'max-h-0'}`}>
                        <div className="divide-y divide-white/5 bg-white/5">
                          {items.map((p: any) => (
                            <ProductRow 
                              key={p.id} 
                              p={p} 
                              onClick={() => setSelectedProduct(p)} 
                              showFarm={isHighGrade}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {[
                  { id: 'local', title: 'Local Exclusives', items: eliteLocal, color: SELECTED_COLOR, icon: MapPin },
                  { id: 'import', title: 'Import', items: eliteImport, color: IMPORT_COLOR, icon: Star }
                ].map(sec => sec.items.length > 0 && (
                  <div key={sec.id} className="rounded-[1.5rem] overflow-hidden border border-white/5 bg-black/20">
                    <button onClick={() => toggleGrade(sec.id)} className="w-full px-5 py-4 flex items-center justify-between active:bg-white/5 transition-colors">
                      <div className="flex items-center">
                        <sec.icon size={16} style={{ color: sec.color }} className="mr-3" />
                        <h2 className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: sec.color }}>{sec.title}</h2>
                      </div>
                      <ChevronDown size={14} className={`opacity-20 transition-transform ${openGrades.includes(sec.id) ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ${openGrades.includes(sec.id) ? 'max-h-[2500px]' : 'max-h-0'}`}>
                        <div className="bg-white/5">
                          {sec.items.map(p => (
                             <ExclusiveCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />
                          ))}
                        </div>
                    </div>
                  </div>
                ))}
            </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-white text-black p-5 rounded-[2rem] shadow-2xl flex justify-between items-center active:scale-95 transition-all">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20}/>
              <span className="font-black uppercase text-[12px] tracking-widest">{getTotal()}฿ Total</span>
            </div>
            <Send size={18}/>
          </button>
        </div>
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          style={isElite(selectedProduct) ? {color: selectedProduct.subcategory?.toLowerCase().includes('import') ? IMPORT_COLOR : SELECTED_COLOR} : (GRADES.find(g => g.id === selectedProduct.subcategory) || { color: '#FFF' })} 
          categoryBasePrices={!isElite(selectedProduct) ? products.find(p => p.subcategory === selectedProduct.subcategory && p.category === 'buds' && p.badge?.toUpperCase() !== 'SALE')?.prices : null}
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
