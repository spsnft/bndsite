import * as React from "react"
import { X } from "lucide-react"
import { BlurImage } from "@/components/blur-image"
import { useCart } from "@/lib/cart-store"
import { Baht } from "@/components/landing/ProductCards"
import { TYPE_COLORS } from "@/components/landing/constants"
import { triggerHaptic, getInterpolatedPrice, isElite } from "@/lib/utils"

export function ProductModal({ product, style, onClose, t }: any) {
  const isEliteProduct = isElite(product);
  const steps = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
  const weightToKey: Record<number, number> = isEliteProduct ? { 3.5: 1, 7: 5, 14: 10, 28: 20 } : { 1: 1, 5: 5, 10: 10, 20: 20 };
  
  const availableSteps = steps.filter(w => (Number(product.prices?.[weightToKey[w]]) || 0) > 0);
  const minW = availableSteps[0];
  const maxW = availableSteps[availableSteps.length - 1];

  const [weight, setWeight] = React.useState(minW || steps[0]);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCart((s: any) => s.addItem);
  
  const currentPrice = Math.round(getInterpolatedPrice(weight, product.prices, isEliteProduct));
  const oldPrice = product.old_prices ? Math.round(getInterpolatedPrice(weight, product.old_prices, isEliteProduct)) : 0;
  const perGram = weight > 0 ? Math.round(currentPrice / weight) : 0;

  const nextStep = availableSteps.find(w => w > weight);
  const promoInfo = React.useMemo(() => {
    if (!nextStep) return null;
    const nextPrice = Math.round(getInterpolatedPrice(nextStep, product.prices, isEliteProduct));
    const nextPerGram = Math.round(nextPrice / nextStep);
    return { diff: (nextStep - weight).toFixed(1).replace('.0', ''), perGram: nextPerGram };
  }, [weight, nextStep, product.prices, isEliteProduct]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-[400px] bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-1.5 bg-black/40 rounded-full text-white/50 hover:text-white transition-colors"><X size={18}/></button>
        <div className="relative aspect-[1.3/1] w-full bg-black/10">
          <BlurImage src={product?.image} width={400} height={400} className="w-full h-full object-contain p-4" alt={product?.name} />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#193D2E] via-[#193D2E]/90 to-transparent">
            <h2 className="text-[20px] font-black uppercase tracking-tighter text-white">{product?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: TYPE_COLORS[product?.type?.toLowerCase()] }}>{product?.type}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="text-[12px] font-black uppercase tracking-widest opacity-60" style={{ color: style?.color }}>{product?.subcategory}</span>
            </div>
          </div>
        </div>
        <div className="px-6 pb-8 space-y-6">
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                {oldPrice > currentPrice && <span className="text-lg font-black line-through opacity-20 text-white">{oldPrice}<Baht /></span>}
                <span className="text-[30px] font-black tracking-tighter text-white leading-none">{currentPrice}<Baht className="opacity-40" /></span>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-[14px] font-black uppercase text-white tracking-tighter">{weight}G</div>
                <div className="text-[9px] font-black uppercase opacity-40 text-white tracking-widest">{perGram}<Baht />/G</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {availableSteps.map((v) => (
                <button key={v} onClick={() => { triggerHaptic('light'); setWeight(v); }} className={`py-3 rounded-xl text-[12px] font-black transition-all border ${weight === v ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5'}`}>{v}G</button>
              ))}
            </div>
            <div className="relative h-14 flex items-center group">
              <div className="absolute left-0 right-0 h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-75" style={{ width: `${((weight - minW) / (maxW - minW)) * 100}%` }}></div>
              </div>
              <input type="range" min={minW} max={maxW} step="0.5" value={weight} onChange={(e) => { const newW = parseFloat(e.target.value); if (newW !== weight) triggerHaptic('light'); setWeight(newW); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 appearance-none -webkit-appearance-none" />
              <div className="absolute w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] pointer-events-none transition-all duration-75 flex items-center justify-center border-4 border-[#193D2E] z-10" style={{ left: `calc(${((weight - minW) / (maxW - minW)) * 100}% - 16px)`, marginLeft: weight === minW ? '16px' : weight === maxW ? '-16px' : '0px' }}><div className="w-2 h-2 bg-[#193D2E] rounded-full"></div></div>
            </div>
          </div>
          {promoInfo && (
            <div className="relative py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl overflow-hidden animate-pulse">
              <p className="text-[10px] font-black uppercase tracking-tighter text-emerald-400 text-center">Add <span className="text-white">{promoInfo.diff}g</span> more for <span className="text-white">{promoInfo.perGram}<Baht /></span> per gram!</p>
            </div>
          )}
          <button onClick={() => { triggerHaptic('success'); addItem({ ...product, price: currentPrice, weight: `${weight}g`, subcategory: product.subcategory, type: product.type, image: product.image, prices: product.prices }); setIsAdded(true); setTimeout(() => {setIsAdded(false); onClose();}, 800); }} className={`w-full py-2.5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}>{isAdded ? t.added : t.addToOrder}</button>
        </div>
      </div>
    </div>
  );
}
