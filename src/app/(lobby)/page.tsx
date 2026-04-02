"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Sparkles, Flame, Percent, X, MapPin, Leaf, Wind, Crown, 
  ShoppingBag, Send, MessageCircle, Instagram, 
  SendHorizontal, Gift, Info, Trash2, Headset, Star
} from "lucide-react"

import { useCart } from "@/lib/cart-store"
import { getProducts } from "@/lib/product"

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
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, ph: "phone number" },
  { id: "line", label: "Line", icon: MessageCircle, ph: "phone number" },
  { id: "instagram", label: "Instagram", icon: Instagram, ph: "@username or phone number" },
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

const getOptimizedImg = (url: string, w = 800) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
};

// --- COMPONENTS ---

const BadgeIcon = ({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW": return <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0"><span className="text-[6px] font-black text-blue-400">NEW</span></div>;
    case "HIT": return <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0"><Flame size={10} className="text-orange-400" /></div>;
    case "SALE": return <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0"><Percent size={10} className="text-emerald-400" /></div>;
    default: return null;
  }
};

const ExclusiveCard = ({ item, onClick }: { item: any, onClick: () => void }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const accentColor = isImport ? IMPORT_COLOR : SELECTED_COLOR; 
  const typeColor = TYPE_COLORS[item.type?.toLowerCase()] || "#FFF";
  const displayPrice = Object.values(item.prices || {}).find(v => Number(v) > 0) || 0;

  return (
    <div 
      onClick={onClick} 
      className="relative rounded-[2rem] border border-white/10 bg-black/40 active:scale-[0.98] transition-all cursor-pointer group shadow-2xl flex flex-col justify-between h-full hover:border-white/20"
      style={{ 
        isolation: 'isolate',
        overflow: 'hidden',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)' 
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md z-0 pointer-events-none" />

      <div 
        className="absolute inset-x-0 top-0 h-3/4 opacity-30 blur-[45px] transition-opacity group-hover:opacity-60 pointer-events-none z-0" 
        style={{ background: `radial-gradient(circle at center top, ${accentColor}, transparent)` }}
      />
      
      <div 
        className="absolute inset-x-0 bottom-0 h-1/3 opacity-20 blur-[35px] transition-opacity group-hover:opacity-40 pointer-events-none z-0" 
        style={{ background: `radial-gradient(circle at center bottom, ${accentColor}, transparent)` }}
      />
      
      <div className="relative z-10 space-y-3 p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="text-[16px] font-black italic uppercase tracking-tighter leading-tight">{item.name}</h3>
            <p className="text-[9px] font-bold mt-0.5 opacity-60 truncate">{item.farm || "Private Reserve"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded-xl shrink-0 mt-1">
            {isImport ? <Crown size={14} style={{ color: accentColor }} /> : <Flame size={14} style={{ color: accentColor }} />}
          </div>
        </div>
        <div className="aspect-[1/1] w-full bg-black/20 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/5 shadow-inner">
            <img src={getOptimizedImg(item.image, 300)} className="h-[90%] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-700" alt="" />
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-end p-4 pt-0 mt-2">
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest" style={{ color: typeColor }}>{item.type}</span>
        <div className="text-right ml-2">
           <p className="text-[8px] font-black uppercase opacity-20 leading-none mb-0.5">Starting at</p>
           <p className="text-[20px] font-black italic tracking-tighter leading-none" style={{ color: accentColor }}>{displayPrice}฿</p>
        </div>
      </div>
    </div>
  );
};

// --- MODALS ---

function StoryModal({ story, onClose }: { story: any, onClose: () => void }) {
  const imageUrl = getOptimizedImg(story.image || `/stories/${story.id}.webp`, 600);
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="w-full max-w-sm h-[85vh] px-4 relative flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-4 p-2 text-white/50 hover:text-white"><X size={32}/></button>
        <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/20">
          <img src={imageUrl} className="w-full h-full object-cover" alt="" />
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const isEliteProduct = isElite(product);
  const weights = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
  
  const initialWeight = isEliteProduct 
    ? (weights.find(w => getElitePrice(w, product?.prices) > 0) || weights[0])
    : weights[0];

  const [weight, setWeight] = React.useState(initialWeight);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);
  
  const currentPrice = Math.round(isEliteProduct ? getElitePrice(weight, product?.prices) : getInterpolatedPrice(weight, product?.prices)) || 0;
  const pricePerGram = weight > 0 ? Math.round(currentPrice / weight) : 0;
  const typeColor = TYPE_COLORS[String(product?.type || "").toLowerCase()] || "#FFF";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50 hover:text-white"><X size={20}/></button>
        <div className="aspect-square w-full relative bg-black/10">
          <img src={getOptimizedImg(product?.image, 600)} className="w-full h-full object-contain p-10" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style?.color || '#FFF' }}>{product?.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1 text-white">
              <span style={{ color: typeColor }}>{product?.type}</span>
              <span className="mx-2 opacity-20">•</span>
              <span style={{ color: style?.color || '#FFF' }}>{product?.subcategory} Grade</span>
            </p>
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
                <div className="text-4xl font-black italic tracking-tighter">{currentPrice}฿</div>
                <div className="text-[9px] font-bold opacity-30 uppercase mt-1">Price per gram: {pricePerGram}฿</div>
              </div>
              <div className="text-[11px] font-black uppercase bg-white/10 px-4 py-1 rounded-full mb-1">{weight}g</div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {weights.map(v => {
                const hasPrice = isEliteProduct ? (getElitePrice(v, product?.prices) > 0) : true;
                return (
                  <button key={v} disabled={!hasPrice} onClick={() => setWeight(v)} 
                    className={`py-3 text-[10px] font-black rounded-xl border transition-all 
                      ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}
                      ${!hasPrice ? "opacity-10 grayscale cursor-not-allowed" : "opacity-100"}`}>
                    {v}g
                  </button>
                );
              })}
            </div>

            <button onClick={() => { if(!product) return; addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} 
              className={`w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}>
              {isAdded ? "Added to Cart" : "Add to Order"}
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
      <div className="relative w-full max-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10 text-white">
          <div><h2 className="text-xl font-black italic uppercase tracking-tighter">Your Basket</h2><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{items.length} items</p></div>
          <button onClick={onClose} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {items.map((item: any) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5 text-white">
              <div className="w-10 h-10 rounded-lg bg-black/20 flex-shrink-0"><img src={getOptimizedImg(item.image, 100)} className="w-full h-full object-contain" alt="" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-black uppercase italic truncate">{item.name}</h3>
                <p className="text-[9px] opacity-40 font-bold uppercase">{item.weight} • {item.price}฿</p>
              </div>
              <button onClick={() => removeItem(item.id, item.weight)} className="text-rose-500/30 hover:text-rose-500 transition-colors p-2 bg-white/5 rounded-xl"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <button onClick={handleOperatorContact} className="w-full py-4 bg-emerald-400/10 border border-emerald-400/20 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all group">
            <Headset size={18} className="text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Talk to Operator</span>
          </button>
          
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30 text-white"}`}>
                <m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>
          <input type="text" placeholder={CONTACT_METHODS.find(m => m.id === method)?.ph} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30" />
          <div className="flex items-center justify-between pt-2 text-white"><p className="text-[10px] font-black uppercase opacity-40">Total Amount</p><p className="text-3xl font-black italic tracking-tighter">{total}฿</p></div>
          <button onClick={handleSubmit} disabled={isSending || items.length === 0} className="w-full bg-emerald-400 text-[#193D2E] py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-95 transition-all">
            {isSending ? "Sending..." : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

const SkeletonGrade = () => (
  <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/10 animate-pulse mb-8">
    <div className="p-6 h-16 bg-white/5 border-b border-white/5" />
    <div className="divide-y divide-white/5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 rounded-full bg-white/10" />
            <div className="w-32 h-4 bg-white/10 rounded" />
          </div>
          <div className="w-12 h-4 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function LandingPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [stories, setStories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [activeStory, setActiveStory] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const { items, getTotal } = useCart();

  React.useEffect(() => { 
    async function fetchData() {
      try {
        const data = await getProducts();
        setProducts(data.products || []);
        setStories(data.stories || []);
      } catch (e) { console.error(e); } 
      finally { setIsLoading(false); }
    }
    fetchData();
  }, []);

  const STORY_CONFIG = [
    { id: "new", label: "New Arrivals", icon: Sparkles, color: "#2DD4BF" },
    { id: "sale", label: "Gifts & Promos", icon: Gift, color: "#FEC107" },
    { id: "info", label: "Service Info", icon: Info, color: "#A855F7" },
  ];

  const logoUrl = `https://res.cloudinary.com/dpjwbcgrq/image/upload/w_192,c_limit,e_bgremoval,f_auto,q_auto/v1774704686/IMG_0036_t5cnic.png`;

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      <header className="max-w-xl mx-auto mb-10 pt-4">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[20px] z-0"></div>
                <img src={logoUrl} className="w-full h-full object-contain relative z-10" alt="Logo" />
              </div>
              <h1 className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40 leading-none">Premium Phuket delivery service</h1>
           </div>
           <div className="flex gap-2">
              <Link href="https://t.me/bshk_phuket" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 hover:bg-[#229ED9]/20 transition-all"><SendHorizontal size={16} className="text-[#229ED9]"/></Link>
              <Link href="https://bndeliveryphuket.click/wa" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 hover:bg-[#25D366]/20 transition-all"><MessageCircle size={16} className="text-[#25D366]"/></Link>
              <Link href="https://www.instagram.com/boshkunadoroshku" target="_blank" className="p-2 bg-white/5 rounded-full border border-white/5 opacity-40 hover:opacity-100 hover:bg-[#E4405F]/20 transition-all"><Instagram size={16} className="text-[#E4405F]"/></Link>
           </div>
        </div>

        <div className="flex gap-6 mb-10 overflow-x-auto w-full no-scrollbar justify-center">
          {STORY_CONFIG.map((config) => {
            const tableData = stories.find(s => s.id === config.id);
            return (
              <button key={config.id} onClick={() => setActiveStory({ ...config, image: tableData?.image })} className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-16 h-16 rounded-full bg-white/5 border-2 flex items-center justify-center transition-all active:scale-90" style={{ borderColor: `${config.color}40` }}>
                  <config.icon size={22} style={{ color: config.color }} />
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60 text-center max-w-[65px]">{config.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 w-full px-2">
          <Link href="/concentrates" className="flex-1 py-4 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/30 font-black uppercase text-[9px] tracking-widest text-[#a855f7] italic flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Flame size={12} /> Concentrates
          </Link>
          <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 font-black uppercase text-[9px] tracking-widest opacity-30 italic cursor-not-allowed">Accessories</button>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-4">
        {isLoading ? (
          <>
            <SkeletonGrade />
            <SkeletonGrade />
          </>
        ) : (
          <>
            {GRADES.map((grade) => {
              const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds' && !isElite(p));
              if (gradeItems.length === 0) return null;

              const priceRef = gradeItems.find(p => p.badge?.toUpperCase() !== 'SALE') || gradeItems[0];
              const headerWeights = [1, 5, 10, 20];

              return (
                <div key={grade.id} className="rounded-[1.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
                  <div className="px-5 py-3 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                        <grade.icon size={12} style={{ color: grade.color }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto mr-4">
                      {headerWeights.map(w => {
                        const price = Math.round(getInterpolatedPrice(w, priceRef.prices));
                        return (
                          <div key={w} className="flex flex-col items-center min-w-[32px]">
                            <span className="text-[7px] font-black opacity-30 uppercase">{w}g</span>
                            <span className="text-[11px] font-black italic tracking-tighter text-white">{price}฿</span>
                          </div>
                        );
                      })}
                    </div>

                    <grade.icon size={14} style={{ color: grade.color }} className="opacity-20 shrink-0" />
                  </div>
                  <div className="divide-y divide-white/5">
                    {gradeItems.map((p: any) => (
                      <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* КОНТЕЙНЕР ДЛЯ ИКОНКИ: Теперь в самом начале */}
                          <div className="w-5 flex justify-center shrink-0">
                            {p.badge && <BadgeIcon type={p.badge} />}
                          </div>
                          <span className="text-[11px] font-black uppercase italic tracking-tight text-white/90 truncate leading-tight">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-auto">
                           {p.farm && p.farm !== '-' && <div className="text-[9px] font-bold opacity-20 italic truncate max-w-[80px]">{p.farm}</div>}
                           <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5" style={{ color: TYPE_COLORS[p.type?.toLowerCase()] || '#10B981' }}>{TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* LOCAL EXCLUSIVES SECTION */}
            {products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')).length > 0 && (
              <div className="space-y-6 pt-10">
                <div className="flex items-center gap-4 px-2">
                  <h2 className="text-[12px] font-black uppercase italic tracking-[0.3em] text-[#2DD4BF] shrink-0">Local Exclusives</h2>
                  <div className="h-[1px] flex-1 bg-[#2DD4BF]/20"></div>
                  <Flame size={14} className="text-[#2DD4BF]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('exclusive')).map(p => (
                    <ExclusiveCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                </div>
              </div>
            )}

            {/* IMPORT EXCLUSIVES SECTION */}
            {products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')).length > 0 && (
              <div className="space-y-6 pt-10">
                <div className="flex items-center gap-4 px-2">
                  <h2 className="text-[12px] font-black uppercase italic tracking-[0.3em] text-[#60A5FA] shrink-0">Import Exclusives</h2>
                  <div className="h-[1px] flex-1 bg-[#60A5FA]/20"></div>
                  <Crown size={14} className="text-[#60A5FA]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {products.filter(p => p.category === 'buds' && p.subcategory?.toLowerCase().includes('import')).map(p => (
                    <ExclusiveCard key={p.id} item={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-white/10 backdrop-blur-xl text-white p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center group active:scale-95 transition-all border border-white/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full"><ShoppingBag size={20}/></div>
              <div className="text-left"><p className="text-[10px] font-black uppercase tracking-widest leading-none opacity-40">Order Now</p><p className="text-[18px] font-black italic mt-1">{getTotal()}฿ Total</p></div>
            </div>
            <div className="p-3 bg-white/10 rounded-full group-hover:bg-white group-hover:text-black transition-colors"><Send size={18}/></div>
          </button>
        </div>
      )}

      {activeStory && <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />}
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

