"use client"
import * as React from "react"
import { X, Plus, Trash2, SendHorizontal, Sparkles, Wind, MapPin, Beaker, Info, Layers } from "lucide-react"
import { BlurImage } from "@/components/blur-image"
import { useCart } from "@/lib/cart-store"
import { 
  triggerHaptic, isElite, getInterpolatedPrice, 
  TYPE_COLORS, GRADES, SELECTED_COLOR, CONTACT_METHODS, Baht 
} from "@/lib/utils"

export function ProductModal({ product, style, onClose, t }: { product: any, style: any, onClose: () => void, t: any }) {
  const isEliteProduct = isElite(product) && product.subcategory?.toLowerCase() !== 'import loose';
  const isPrerolls = product.category === 'joints';
  
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
    if (!nextStep || isPrerolls) return null;
    const nextPrice = Math.round(getInterpolatedPrice(nextStep, product.prices, isEliteProduct));
    const nextPerGram = Math.round(nextPrice / nextStep);
    return { 
      diff: (nextStep - weight).toFixed(1).replace('.0', ''), 
      perGram: nextPerGram,
      currentPerGram: perGram
    };
  }, [weight, nextStep, product.prices, isEliteProduct, isPrerolls, perGram]);

  const showSlider = availableSteps.length === 4 && !isPrerolls;

  const getLabel = (v: number) => {
    if (!isPrerolls) return `${v}G`;
    const prerollLabels: Record<number, string> = { 1: "1PCS", 5: "3PCS", 10: "5PCS", 20: "10PCS" };
    return prerollLabels[v] || `${v}PCS`;
  };

  const getSubColor = () => {
    const sub = product.subcategory?.toLowerCase();
    if (sub === 'import loose') return GRADES.find(g => g.id === 'import')?.color || SELECTED_COLOR;
    return GRADES.find(g => g.id === sub)?.color || style?.color || SELECTED_COLOR;
  };

  const isExclusiveOrImport = product.subcategory?.toLowerCase().includes('exclusive') || product.subcategory?.toLowerCase().includes('import');

  // Логика проверки наличия данных в поле
  const hasValue = (val: any) => val && val !== "" && val !== "-";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-lg" onClick={onClose}>
      <div className="relative w-full max-w-[400px] bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-1.5 bg-black/40 rounded-full text-white/50 hover:text-white transition-colors"><X size={18}/></button>
        <div className="relative aspect-[1.3/1] w-full bg-black/10">
          <BlurImage src={product?.image} width={400} height={400} className="w-full h-full object-contain p-4" alt={product?.name} />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#193D2E] via-[#193D2E]/90 to-transparent">
            <h2 className="text-[20px] font-black uppercase tracking-tighter text-white">{product?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: TYPE_COLORS[product?.type?.toLowerCase()] }}>{product?.type}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="text-[12px] font-black uppercase tracking-widest opacity-60" style={{ color: getSubColor() }}>{product?.subcategory}</span>
            </div>
          </div>
        </div>
        <div className="px-6 pb-8 space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                {oldPrice > currentPrice && <span className="text-lg font-black line-through opacity-20 text-white">{oldPrice}<Baht /></span>}
                <span className="text-[30px] font-black tracking-tighter text-white leading-none">{currentPrice}<Baht className="opacity-40" /></span>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-[14px] font-black uppercase text-white tracking-tighter">{getLabel(weight)}</div>
                {!isPrerolls && <div className="text-[9px] font-black uppercase opacity-40 text-white tracking-widest">{perGram}<Baht />/G</div>}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {availableSteps.map((v) => (
                <button key={v} onClick={() => { triggerHaptic('light'); setWeight(v); }}
                  className={`py-1 rounded-xl text-[12px] font-black transition-all border ${weight === v ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5'}`}>{getLabel(v)}
                </button>
              ))}
            </div>
            {showSlider && (
              <div className="relative h-14 flex items-center group">
                <div className="absolute left-0 right-0 h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-75" style={{ width: `${((weight - minW) / (maxW - minW)) * 100}%` }}></div>
                </div>
                <input type="range" min={minW} max={maxW} step="0.5" value={weight} 
                  onChange={(e) => { const newW = parseFloat(e.target.value); if (newW !== weight) triggerHaptic('light'); setWeight(newW); }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 appearance-none -webkit-appearance-none"
                />
                <div className="absolute w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] pointer-events-none transition-all duration-75 flex items-center justify-center border-4 border-[#193D2E] z-10"
                  style={{ left: `calc(${((weight - minW) / (maxW - minW)) * 100}% - 16px)`, marginLeft: weight === minW ? '16px' : weight === maxW ? '-16px' : '0px' }}>
                   <div className="w-2 h-2 bg-[#193D2E] rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          {/* Дополнительные поля характеристик */}
          <div className="space-y-2.5">
            {hasValue(product.description) && (
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex gap-2 text-white/40 mb-1.5"><Info size={12}/><span className="text-[9px] font-black uppercase tracking-widest">Description</span></div>
                <p className="text-[11px] text-white/80 leading-relaxed font-medium">{product.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {hasValue(product.taste) && (
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex gap-2 text-white/40 mb-1"><Sparkles size={11}/><span className="text-[8px] font-black uppercase tracking-widest">Taste</span></div>
                  <p className="text-[10px] text-white font-bold uppercase">{product.taste}</p>
                </div>
              )}
              {hasValue(product.terpenes) && (
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex gap-2 text-white/40 mb-1"><Wind size={11}/><span className="text-[8px] font-black uppercase tracking-widest">Terpenes</span></div>
                  <p className="text-[10px] text-white font-bold uppercase">{product.terpenes}</p>
                </div>
              )}
              {hasValue(product.farm) && (
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex gap-2 text-white/40 mb-1"><MapPin size={11}/><span className="text-[8px] font-black uppercase tracking-widest">Farm</span></div>
                  <p className="text-[10px] text-white font-bold uppercase">{product.farm}</p>
                </div>
              )}
              {hasValue(product.microns) && (
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex gap-2 text-white/40 mb-1"><Layers size={11}/><span className="text-[8px] font-black uppercase tracking-widest">Microns</span></div>
                  <p className="text-[10px] text-white font-bold uppercase">{product.microns}</p>
                </div>
              )}
            </div>
          </div>

          {promoInfo && !isExclusiveOrImport && (
            <div className="relative py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl overflow-hidden animate-pulse">
              <p className="text-[10px] font-black uppercase tracking-tighter text-emerald-400 text-center">
                Add <span className="text-white">{promoInfo.diff}g</span> more for <span className="text-white">{promoInfo.perGram}<Baht className="scale-75 inline-block" /></span> per gram!
              </p>
            </div>
          )}

          <button onClick={() => { 
              triggerHaptic('success');
              addItem({ ...product, price: currentPrice, weight: getLabel(weight), subcategory: product.subcategory, type: product.type, image: product.image, prices: product.prices }); 
              setIsAdded(true); 
              setTimeout(() => {setIsAdded(false); onClose();}, 800); 
            }} 
            className={`w-full py-2.5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all active:scale-95 ${isAdded ? 'bg-emerald-400 text-black' : 'bg-white text-[#193D2E]'}`}
          >
            {isAdded ? t.added : t.addToOrder}
          </button>
        </div>
      </div>
    </div>
  );
}
