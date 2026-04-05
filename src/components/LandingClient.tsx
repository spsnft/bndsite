"use client"

import * as React from "react"
import { X, MapPin, Leaf, Wind, ShoppingBag, SendHorizontal, Phone, Instagram, ChevronDown, Trash2, Headset, Star, Flame, Sparkles, Percent, Crown } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { BlurImage } from "@/components/blur-image"

// --- PRODUCT MODAL С ОБНОВЛЕННЫМ ДИЗАЙНОМ ---

function ProductModal({ product, style, onClose }: { product: any, style: any, onClose: () => void }) {
  const isEliteProduct = product?.subcategory?.toLowerCase().includes('exclusive') || product?.subcategory?.toLowerCase().includes('import');
  
  // Константы веса
  const minWeight = 1;
  const maxWeight = isEliteProduct ? 28 : 20;
  const steps = [1, 5, 10, 20, ...(isEliteProduct ? [28] : [])];

  const [weight, setWeight] = React.useState(minWeight);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);

  // Расчет цены (интерполяция для обычных, фиксированные для элитных)
  const getPrice = (w: number) => {
    if (isEliteProduct) {
      const eliteMap: Record<number, number> = { 3.5: 1, 7: 5, 14: 10, 28: 20 };
      // Для элитки если вес не кратен тирам, берем пропорцию от ближайшего (упрощенно)
      const baseTier = [...steps].reverse().find(s => s <= w) || 1;
      const priceAtTier = product.prices[eliteMap[baseTier]] || 0;
      return Math.round((priceAtTier / baseTier) * w);
    }
    
    const p = product.prices;
    if (w <= 1) return (p[1] || 0) * w;
    if (w <= 5) return p[1] + (p[5] - p[1]) * ((w - 1) / 4);
    if (w <= 10) return p[5] + (p[10] - p[5]) * ((w - 5) / 5);
    if (w <= 20) return p[10] + (p[20] - p[10]) * ((w - 10) / 10);
    return (p[20] / 20) * w;
  };

  const currentPrice = Math.round(getPrice(weight));
  const pricePerGram = Math.round(currentPrice / weight);

  // Логика Upsell: "Добавь X чтобы получить цену Y"
  const getUpsellInfo = () => {
    const nextTier = steps.find(s => s > weight);
    if (!nextTier) return null;
    
    const nextPriceTotal = getPrice(nextTier);
    const nextPricePerGram = Math.round(nextPriceTotal / nextTier);
    const diff = nextTier - weight;
    
    return { diff, nextPricePerGram };
  };

  const upsell = getUpsellInfo();
  const typeColor = "#2DD4BF"; // Для примера, можно брать из TYPE_COLORS

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      {/* Ограничил высоту и ширину окна, чтобы не было "лопатой" на Max */}
      <div className="relative w-full max-w-[440px] max-h-[85vh] bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-y-auto no-scrollbar shadow-2xl" onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-5 right-5 z-20 p-2 bg-black/40 rounded-full text-white/50 hover:text-white transition-all">
          <X size={20}/>
        </button>

        <div className="relative aspect-square w-full bg-black/10">
          <BlurImage src={product?.image} width={500} height={500} className="w-full h-full object-contain p-12" alt={product?.name} />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#193D2E] via-[#193D2E]/80 to-transparent">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{product?.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              <span className="text-emerald-400">{product?.type}</span>
              <span className="mx-2 opacity-20">•</span>
              <span style={{ color: style?.color }}>{product?.subcategory} Grade</span>
            </p>
          </div>
        </div>

        <div className="p-8 pt-0 space-y-6">
          {/* Инфо-плашки */}
          <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-6">
             <div className="space-y-1">
               <div className="flex items-center gap-1.5 opacity-20"><MapPin size={10}/><span className="text-[7px] font-black uppercase">Farm</span></div>
               <p className="text-[10px] font-bold italic truncate text-white">{product?.farm || '-'}</p>
             </div>
             <div className="space-y-1">
               <div className="flex items-center gap-1.5 opacity-20"><Leaf size={10}/><span className="text-[7px] font-black uppercase">Taste</span></div>
               <p className="text-[10px] font-bold italic truncate text-white">{product?.taste || 'Sweet, Earthy'}</p>
             </div>
             <div className="space-y-1">
               <div className="flex items-center gap-1.5 opacity-20"><Wind size={10}/><span className="text-[7px] font-black uppercase">Terps</span></div>
               <p className="text-[10px] font-bold italic truncate text-white">Myrcene, Limone...</p>
             </div>
          </div>

          <div className="space-y-8">
            {/* Цена и индикатор */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-4xl font-black italic tracking-tighter text-white">{currentPrice}฿</div>
                <div className="text-[9px] font-bold opacity-30 uppercase mt-1">Price per gram: {pricePerGram}฿</div>
              </div>
              <div className="text-[11px] font-black uppercase bg-white/10 px-4 py-1 rounded-full text-white">{weight}g</div>
            </div>

            {/* СЛАЙДЕР */}
            <div className="relative py-2">
              <input 
                type="range" 
                min={minWeight} 
                max={maxWeight} 
                step={0.5} 
                value={weight} 
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* КНОПКИ БЫСТРОГО ВЫБОРА */}
            <div className="grid grid-cols-4 gap-2">
              {steps.slice(0,4).map(v => (
                <button 
                  key={v} 
                  onClick={() => setWeight(v)} 
                  className={`py-3 text-[10px] font-black rounded-xl border transition-all ${weight === v ? "bg-white text-black border-white" : "border-white/10 text-white/40"}`}
                >
                  {v}g
                </button>
              ))}
            </div>

            {/* UPSELL ПРИЗЫВ */}
            {upsell && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 animate-pulse">
                <Flame size={14} className="text-emerald-400" />
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  Add {upsell.diff}g more for {upsell.nextPricePerGram}฿ per gram!
                </p>
              </div>
            )}

            <button 
              onClick={() => {
                addItem({ ...product, price: currentPrice, weight: `${weight}g` });
                setIsAdded(true);
                setTimeout(() => { setIsAdded(false); onClose(); }, 800);
              }}
              className={`w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}
            >
              {isAdded ? "Added to Cart" : "Add to Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
