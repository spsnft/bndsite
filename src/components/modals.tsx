"use client"
import * as React from "react"
import { X, Sparkles, Trash2, SendHorizontal } from "lucide-react"
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
    return { diff: (nextStep - weight).toFixed(1).replace('.0', ''), perGram: nextPerGram };
  }, [weight, nextStep, product.prices, isEliteProduct, isPrerolls]);

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
        <div className="px-6 pb-8 space-y-3">
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
          {promoInfo && (
            <div className="relative py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl overflow-hidden animate-pulse">
              <p className="text-[10px] font-black uppercase tracking-tighter text-emerald-400 text-center">
                Add <span className="text-white">{promoInfo.diff}g</span> more for <span className="text-white">{promoInfo.perGram}<Baht /></span> per gram!
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

export function CheckoutModal({ items, total, onClose, t, lang, onEditItem }: { items: any[], total: number, onClose: () => void, t: any, lang: string, onEditItem: (p: any) => void }) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { clearCart, removeItem } = useCart();

  const categoryPromos = React.useMemo(() => {
    const groups: Record<string, { weight: number, prices: any, isElite: boolean, sub: string }> = {};
    items.forEach(item => {
      const sub = item.subcategory?.toLowerCase() || "other";
      if ((isElite(item) && sub !== 'import loose') || item.category === 'joints') return;
      const w = parseFloat(item.weight) || 0;
      if (!groups[sub]) groups[sub] = { weight: 0, prices: item.prices, isElite: false, sub: item.subcategory };
      groups[sub].weight += w;
    });
    return Object.values(groups).map(group => {
      const steps = [1, 5, 10, 20];
      const nextStep = steps.find(s => s > group.weight);
      if (!nextStep || !group.prices) return null;
      const nextPrice = Math.round(getInterpolatedPrice(nextStep, group.prices, false));
      const nextPerGram = Math.round(nextPrice / nextStep);
      const diff = (nextStep - group.weight).toFixed(1).replace('.0', '');
      const gradeId = group.sub.toLowerCase() === 'import loose' ? 'import' : group.sub.toLowerCase();
      const gradeInfo = GRADES.find(g => g.id === gradeId) || { color: SELECTED_COLOR };
      return { sub: group.sub, diff, nextPerGram, color: gradeInfo.color, nextStep };
    }).filter(Boolean);
  }, [items]);

  const handleSubmit = async () => {
    if (!contact) return alert(t.contactPh);
    setIsSending(true);
    triggerHaptic('medium');
    try {
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWoirxcrPstlMohLMoWV0llN69vMnWzGNc-8wksFULMlasDQechzbRJwcY-RbuagsE/exec";
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ contact, method, orderText: items.map(i => `${i.name} (${i.weight}) x${i.quantity} — ${i.price * i.quantity}฿`).join("\n"), total }) });
      triggerHaptic('success');
      alert(t.orderSent); clearCart(); onClose();
    } catch (e) { alert(t.sendError); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-lg" onClick={onClose}>
      <div className="relative w-full max-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 pb-0 border-b border-white/5 flex justify-between items-center text-white min-h-[80px]">
          <div><h2 className="text-xl font-black uppercase tracking-tighter">{t.yourBasket}</h2><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{items.length} {t.items}</p></div>
          <button onClick={onClose} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 pb-2 space-y-4 no-scrollbar">
          {categoryPromos.length > 0 && (
            <div className="space-y-2">
              {categoryPromos.map((promo: any) => (
                <div key={promo.sub} className="relative p-2 pl-2 rounded-2xl overflow-hidden border" style={{ borderColor: `${promo.color}40`, backgroundColor: 'transparent' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-xl bg-white/5 shrink-0" style={{ color: promo.color }}><Sparkles size={16} /></div>
                    <div><p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase tracking-wide">
                        {lang === 'ru' ? (
                          <>Добавь <span className="font-black" style={{ color: promo.color }}>{promo.diff}г</span> <span className="font-black" style={{ color: promo.color }}>{promo.sub}</span> и открой цену <span className="font-black" style={{ color: promo.color }}>{promo.nextPerGram} <span className="text-[8px] opacity-60">฿/g</span></span>!</>
                        ) : (
                          <>Add <span className="font-black" style={{ color: promo.color }}>{promo.diff}g</span> <span className="font-black" style={{ color: promo.color }}>{promo.sub}</span> and unlock <span className="font-black" style={{ color: promo.color }}>{promo.nextPerGram} <span className="text-[8px] opacity-60">฿/g</span></span> price!</>
                        )}
                    </p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {items.map((item: any) => {
              const weightNum = parseFloat(item.weight) || 1;
              const pricePerGram = Math.round(item.price / weightNum);
              return (
                <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5 text-white">
                  <button onClick={() => { triggerHaptic('light'); onEditItem(item); }} className="flex-1 min-w-0 text-left active:opacity-60 transition-opacity">
                    <h3 className="text-[14px] font-black uppercase truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-[12px] font-bold uppercase tracking-widest text-white/70">
                        {item.weight} • {item.price}<span className="text-[10px] opacity-60 ml-0.5">฿</span>
                        <span className="text-white/30 font-black ml-1.5">({pricePerGram}<span className="text-[9px] ml-0.5">฿/G</span>)</span>
                      </p>
                      <span className="w-1 h-1 rounded-full bg-white/10 shrink-0"></span>
                      <p className="text-[8px] font-black uppercase tracking-tighter" style={{ color: (item.subcategory?.toLowerCase() === 'import loose' ? GRADES.find(g => g.id === 'import')?.color : GRADES.find(g => g.id === item.subcategory?.toLowerCase())?.color) || SELECTED_COLOR }}>{item.subcategory}</p>
                      <span className="w-1 h-1 rounded-full bg-white/10 shrink-0"></span>
                      <p className="text-[8px] font-black uppercase tracking-tighter" style={{ color: TYPE_COLORS[item.type?.toLowerCase()] || "#FFF" }}>{item.type}</p>
                    </div>
                  </button>
                  <button onClick={() => { triggerHaptic('medium'); removeItem(item.id, item.weight); }} className="text-rose-500/30 hover:text-rose-500 transition-colors p-2.5 bg-white/5 rounded-xl"><Trash2 size={16}/></button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 pt-2 border-t border-white/5">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {CONTACT_METHODS.map(m => (
              <button key={m.id} onClick={() => { triggerHaptic('light'); setMethod(m.id); }} 
                className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-[#193D2E] border-white opacity-100" : "bg-white/5 border-white/10 opacity-30 text-white"}`}>
                <m.icon size={16} />
                <span className="text-[7px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>
          <input type="text" placeholder={t[CONTACT_METHODS.find(m => m.id === method)?.phKey || "contactPh"]} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30" />
          <div className="flex items-center justify-between mt-3 text-white"><p className="text-[10px] font-black uppercase opacity-40">{t.totalAmount}</p><p className="text-3xl font-black tracking-tighter">{total}฿</p></div>
          <button onClick={handleSubmit} className="w-full mt-4 bg-emerald-400 text-[#193D2E] py-2.5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-[0.97] hover:animate-pulse transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]">{t.confirmOrder}</button>
        </div>
      </div>
    </div>
  );
}
