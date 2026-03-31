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

const GRADES = [
  { id: "silver", title: "SILVER GRADE", color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", color: "#FEC107", icon: Sparkles },
  { id: "premium", title: "PREMIUM GRADE", color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", color: SELECTED_COLOR, icon: Crown }
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
const ExclusiveCard = ({ item, onClick }: { item: any, onClick: () => void }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const accentColor = isImport ? "#60A5FA" : SELECTED_COLOR; 
  const typeColor = TYPE_COLORS[item.type?.toLowerCase()] || "#FFF";
  const displayPrice = Object.values(item.prices || {}).find(v => Number(v) > 0) || 0;

  return (
    <div onClick={onClick} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-md p-4 active:scale-[0.98] transition-all cursor-pointer group shadow-2xl flex flex-col justify-between h-full">
      <div className="absolute -top-12 -right-12 w-32 h-32 opacity-30" style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`, borderRadius: '50%' }}></div>
      <div className="relative z-10 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1 opacity-40">
              <Star size={9} style={{ color: accentColor }} fill={accentColor} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] truncate">{item.subcategory}</span>
            </div>
            <h3 className="text-[16px] font-black italic uppercase tracking-tighter leading-tight">{item.name}</h3>
            <p className="text-[9px] font-bold mt-0.5 opacity-60 truncate">{item.farm || "Private Reserve"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded-xl shrink-0 mt-1"><Crown size={14} style={{ color: accentColor }} /></div>
        </div>
        <div className="aspect-[1/1] w-full bg-black/20 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/5">
            <img src={getOptimizedImg(item.image, 300)} className="h-[90%] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-700" alt="" />
        </div>
      </div>
      <div className="relative z-10 flex justify-between items-end mt-4">
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest" style={{ color: typeColor }}>{item.type}</span>
        <div className="text-right ml-2">
           <p className="text-[8px] font-black uppercase opacity-20 leading-none mb-0.5">Starting at</p>
           <p className="text-[20px] font-black italic tracking-tighter leading-none" style={{ color: accentColor }}>{displayPrice}฿</p>
        </div>
      </div>
    </div>
  );
};

function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const isEliteProduct = isElite(product);
  const weights = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
  
  const initialWeight = isEliteProduct 
    ? (weights.find(w => getElitePrice(w, product.prices) > 0) || weights[0])
    : weights[0];

  const [weight, setWeight] = React.useState(initialWeight);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);
  
  const currentPrice = Math.round(isEliteProduct ? getElitePrice(weight, product.prices) : getInterpolatedPrice(weight, product.prices));
  const pricePerGram = Math.round(currentPrice / weight);
  const typeColor = TYPE_COLORS[String(product.type || "").toLowerCase()] || "#FFF";

  // Логика выгодного предложения
  const nextStep = weights.find(w => w > weight);
  const nextPrice = nextStep ? (isEliteProduct ? getElitePrice(nextStep, product.prices) : getInterpolatedPrice(nextStep, product.prices)) : 0;
  const saving = nextStep && nextPrice > 0 ? Math.round((pricePerGram * nextStep) - nextPrice) : 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#193D2E] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/40 rounded-full text-white/50 hover:text-white"><X size={20}/></button>
        <div className="aspect-square w-full relative bg-black/10">
          <img src={getOptimizedImg(product.image, 600)} className="w-full h-full object-contain p-10" alt="" />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] to-transparent">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: style.color }}>{product.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1 text-white">
              <span style={{ color: typeColor }}>{product.type}</span>
              <span className="mx-2 opacity-20">•</span>
              <span style={{ color: style.color }}>{product.subcategory} Grade</span>
            </p>
          </div>
        </div>

        <div className="p-8 pt-0 space-y-6 text-white">
          <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><MapPin size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Farm</span></div><p className="text-[10px] font-bold italic truncate">{product.farm}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Leaf size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Taste</span></div><p className="text-[10px] font-bold italic truncate">{product.taste}</p></div>
             <div className="space-y-1"><div className="flex items-center gap-1.5 opacity-20"><Wind size={10}/><span className="text-[7px] font-black uppercase tracking-widest">Terps</span></div><p className="text-[10px] font-bold italic truncate">{product.terpenes}</p></div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-4xl font-black italic tracking-tighter">{currentPrice}฿</div>
                <div className="text-[9px] font-bold opacity-30 uppercase mt-1">Price per gram: {pricePerGram}฿</div>
              </div>
              <div className="text-[11px] font-black uppercase bg-white/10 px-4 py-1 rounded-full mb-1">{weight}g</div>
            </div>

            {/* СЛАЙДЕР И БЛОК ВЫГОДЫ (ТОЛЬКО ДЛЯ ОБЫЧНЫХ) */}
            {!isEliteProduct ? (
              <div className="space-y-4">
                <input type="range" min="1" max="20" step="1" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} 
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
                
                {/* Статичный блок предложения — не прыгает */}
                <div className={`bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center justify-between transition-opacity duration-300 ${saving > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Bulk Deal</span>
                  <span className="text-[9px] font-bold italic text-white/80">Add {nextStep! - weight}g more for {Math.round(nextPrice / nextStep!)}฿ per gram!</span>
                </div>
              </div>
            ) : (
              // Распорка для эксклюзивов, чтобы кнопка Add to Order была на том же уровне
              <div className="h-4" />
            )}

            <div className="grid grid-cols-4 gap-2">
              {weights.map(v => {
                const hasPrice = isEliteProduct ? getElitePrice(v, product.prices) > 0 : true;
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

            <button onClick={() => { addItem({ ...product, price: currentPrice, weight: `${weight}g` }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} 
              className={`w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}>
              {isAdded ? "Added to Cart" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ... Остальной код (LandingPage и т.д.) без изменений, но с использованием SELECTED_COLOR для "Selected Grade" и заголовка Exclusives ...
