"use client"
import * as React from "react"
import { X, Plus, Minus, Trash2, SendHorizontal, Sparkles, Wind, MapPin, Beaker, Info, Layers, ShoppingBag, CheckCircle2, MessageCircle, Phone } from "lucide-react"
import { BlurImage } from "@/components/blur-image"
import { useCart } from "@/lib/cart-store"
import { 
  triggerHaptic, isElite, getInterpolatedPrice, 
  TYPE_COLORS, GRADES, SELECTED_COLOR, Baht 
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
  
  // Расчет цен поднят НАВЕРХ, чтобы useMemo видел переменную perGram
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
              addItem({ ...product, price: currentPrice, weight: weight, subcategory: product.subcategory, type: product.type, image: product.image, prices: product.prices }); 
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

export function CheckoutModal({ items: rawItems, total: initialTotal, t, lang, onClose, onEditItem }: { items: any[], total: number, t: any, lang: string, onClose: () => void, onEditItem: (p: any) => void }) {
  const removeItem = useCart((s: any) => s.removeItem);
  const clearCart = useCart((s: any) => s.clearCart);

  const [contactMethod, setContactMethod] = React.useState<string>('telegram');
  const [phone, setPhone] = React.useState<string>('');
  const [paymentMethod, setPaymentMethod] = React.useState<string>('cash');
  const [address, setAddress] = React.useState<string>('');
  const [showSuccessPopup, setShowSuccessPopup] = React.useState<boolean>(false);

  // Сквозная группировка веса по подкатегориям
  const categoryWeights = React.useMemo(() => {
    const weights: Record<string, number> = {};
    rawItems.forEach(item => {
      if (item.category === 'buds') {
        const sub = item.subcategory || 'default';
        const numW = parseFloat(item.weight);
        if (!isNaN(numW)) {
          weights[sub] = (weights[sub] || 0) + numW;
        }
      }
    });
    return weights;
  }, [rawItems]);

  // Расчет стоимости позиций на основе общего скомбинированного веса микса сортов одной линейки
  const processedItems = React.useMemo(() => {
    return rawItems.map((item, originalIndex) => {
      const numericW = parseFloat(item.weight) || 1;
      if (item.category !== 'buds') {
        return { 
          ...item, 
          singlePrice: Math.round(item.price / (parseFloat(item.weight) || 1)), 
          finalPrice: item.price, 
          numericWeight: numericW,
          originalIndex
        };
      }

      const sub = item.subcategory || 'default';
      const totalSubWeight = categoryWeights[sub] || numericW;
      const isEliteProduct = isElite(item) && item.subcategory?.toLowerCase() !== 'import loose';

      const totalPriceForTier = getInterpolatedPrice(totalSubWeight, item.prices, isEliteProduct);
      const singleGramPrice = totalSubWeight > 0 ? Math.round(totalPriceForTier / totalSubWeight) : 0;
      
      return {
        ...item,
        singlePrice: singleGramPrice,
        finalPrice: Math.round(singleGramPrice * numericW),
        numericWeight: numericW,
        originalIndex
      };
    });
  }, [rawItems, categoryWeights]);

  const finalCalculatedTotal = React.useMemo(() => {
    return processedItems.reduce((acc, item) => acc + item.finalPrice, 0);
  }, [processedItems]);

  const cartPromoInfo = React.useMemo(() => {
    const firstBud = processedItems.find(item => item.category === 'buds');
    if (!firstBud) return null;

    const sub = firstBud.subcategory || 'default';
    const totalSubWeight = categoryWeights[sub] || 0;
    const isEliteProduct = isElite(firstBud) && firstBud.subcategory?.toLowerCase() !== 'import loose';
    const standardSteps = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
    
    const nextStep = standardSteps.find(s => s > totalSubWeight);
    if (!nextStep) return null;

    const targetPriceTotal = Math.round(getInterpolatedPrice(nextStep, firstBud.prices, isEliteProduct));
    const pricePerGramAtNextStep = nextStep > 0 ? Math.round(targetPriceTotal / nextStep) : 0;

    return {
      diff: (nextStep - totalSubWeight).toFixed(1).replace('.0', ''),
      subcategoryName: firstBud.subcategory || (lang === 'ru' ? 'цветов' : 'buds'),
      pricePerGram: pricePerGramAtNextStep
    };
  }, [processedItems, categoryWeights, lang]);

  const changeItemWeight = (itemIndex: number, action: 'inc' | 'dec') => {
    triggerHaptic('light');
    const targetItem = processedItems[itemIndex];
    if (!targetItem) return;

    let currentW = targetItem.numericWeight;
    let targetW = currentW;

    if (action === 'inc') {
      targetW = currentW + 1;
    } else {
      if (currentW > 1) {
        targetW = currentW - 1;
      }
    }

    if (targetW === currentW) return;

    const getNewLabel = (v: number) => {
      return targetItem.category === 'joints' ? `${v}PCS` : `${v}G`;
    };

    const isEliteProduct = isElite(targetItem) && targetItem.subcategory?.toLowerCase() !== 'import loose';
    const nextBasePrice = Math.round(getInterpolatedPrice(targetW, targetItem.prices, isEliteProduct));
    
    const stateCart = useCart.getState() as any;
    const origIdx = targetItem.originalIndex;
    if (stateCart.items && stateCart.items[origIdx]) {
      stateCart.items[origIdx].weight = getNewLabel(targetW);
      stateCart.items[origIdx].price = nextBasePrice;
      useCart.setState({ items: [...stateCart.items] });
    }
  };

  const isFormValid = phone.trim().length > 0 && contactMethod !== '';

  const handleOpenSuccessPopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    triggerHaptic('success');
    setShowSuccessPopup(true);
  };

  const handleFinalTelegramSubmit = () => {
    triggerHaptic('success');
    
    const paymentLabels: Record<string, string> = {
      cash: lang === 'ru' ? 'Наличные курьеру' : 'Cash on delivery',
      thai: lang === 'ru' ? 'Перевод Бат (Thai QR)' : 'Thai Bank Transfer',
      crypto: 'Crypto',
      rub: 'Рубли'
    };

    let message = lang === 'ru' ? `*⚡️ НОВЫЙ ЗАКАЗ НА СТЕНДЕ*\n\n` : `*⚡️ NEW WEB ORDER*\n\n`;
    
    processedItems.forEach(item => {
      message += `• *${item.name}* (${item.weight}) — ${item.finalPrice}฿\n`;
    });
    
    message += `\n*${lang === 'ru' ? 'Итого' : 'Total'}:* ${finalCalculatedTotal}฿\n`;
    message += `-----------------------\n`;
    message += `*${lang === 'ru' ? 'Способ связи' : 'Contact via'}:* ${contactMethod.toUpperCase()}\n`;
    message += `*${lang === 'ru' ? 'Контакт / Номер' : 'Username / Phone'}:* ${phone}\n`;
    message += `*${lang === 'ru' ? 'Оплата' : 'Payment'}:* ${paymentLabels[paymentMethod] || paymentMethod}\n`;
    message += `*${lang === 'ru' ? 'Адрес доставки' : 'Delivery Address'}:* ${address.trim() !== '' ? address : (lang === 'ru' ? 'Не указан (уточнить)' : 'Not specified')}\n`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://t.me/bshk_phuket?text=${encoded}`, '_blank');
    
    clearCart();
    setShowSuccessPopup(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-lg" onClick={onClose}>
      <div className="relative w-full max-w-[420px] bg-[#193D2E] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
        
        {/* ФИОЛЕТОВАЯ ПРАВКА ОТСТУПОВ: pt-2 px-6 pb-6 вместо p-6 убирает лишний разрыв сверху */}
        <div className="pt-2 px-6 pb-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-emerald-400" size={20} />
            <h2 className="text-[16px] font-black uppercase tracking-wider text-white">{lang === 'ru' ? 'Ваш заказ' : 'Your Order'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white/5 hover:bg-white/10 active:scale-90 rounded-full text-white/60 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
          
          <div className="space-y-2">
            {processedItems.map((item, idx) => {
              const unitLabel = item.category === 'accessories' ? 'pcs' : 'g';
              return (
                <div key={`${item.id}-${idx}`} className="flex items-center justify-between gap-3 p-2.5 bg-white/5 rounded-2xl border border-white/5 group animate-fade-in">
                  <div className="w-10 h-10 bg-black/10 rounded-xl overflow-hidden p-1 shrink-0">
                    <BlurImage src={item.image} width={50} height={50} className="w-full h-full object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-black uppercase text-white tracking-tight truncate leading-tight">{item.name}</h4>
                    
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center bg-black/20 rounded-lg border border-white/5 p-0.5">
                        <button 
                          type="button" 
                          onClick={() => changeItemWeight(idx, 'dec')}
                          className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white active:scale-70 transition-all disabled:opacity-20 disabled:pointer-events-none"
                          disabled={item.numericWeight <= 1}
                        >
                          <Minus size={10} strokeWidth={3} />
                        </button>
                        <span className="text-[10px] font-black text-white px-2 min-w-[32px] text-center uppercase tracking-tighter">{item.weight}</span>
                        <button 
                          type="button" 
                          onClick={() => changeItemWeight(idx, 'inc')}
                          className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white active:scale-70 transition-all"
                        >
                          <Plus size={10} strokeWidth={3} />
                        </button>
                      </div>
                      <span className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest">{item.singlePrice}฿ / {unitLabel}</span>
                    </div>
                  </div>
                  
                  {/* ПРАВКА ПУНКТА 1: Удаление по исходному originalIndex — теперь работает стабильно */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[13px] font-black text-white">{item.finalPrice}<Baht className="opacity-40" /></span>
                    <button 
                      type="button"
                      onClick={() => { triggerHaptic('medium'); removeItem(item.originalIndex); }}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/10 transition-all active:scale-90"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {cartPromoInfo && (
            <div className="py-2.5 px-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-tight text-amber-400 leading-normal">
                {lang === 'ru' 
                  ? `Добавь ${cartPromoInfo.diff}g «${cartPromoInfo.subcategoryName}», чтобы открыть цену ${cartPromoInfo.pricePerGram}฿/g` 
                  : `Add ${cartPromoInfo.diff}g of «${cartPromoInfo.subcategoryName}» to unlock price ${cartPromoInfo.pricePerGram}฿/g`}
              </p>
            </div>
          )}

          <form onSubmit={handleOpenSuccessPopup} className="space-y-4 pt-2 border-t border-white/5">
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                {lang === 'ru' ? 'Способ связи *' : 'Contact Method *'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['telegram', 'whatsapp', 'line', 'instagram'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { triggerHaptic('light'); setContactMethod(m); }}
                    className={`py-2 px-1 rounded-xl font-black text-[10px] uppercase border transition-all truncate text-center ${contactMethod === m ? 'bg-emerald-400 border-emerald-400 text-black' : 'bg-white/5 border-white/5 text-white/60'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                {lang === 'ru' ? 'Номер телефона или Username *' : 'Phone Number or Username *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={lang === 'ru' ? '@username или +66…' : '@username or +66…'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-[44px] bg-white/5 border border-white/10 rounded-xl px-3 text-[13px] text-white font-medium placeholder:text-white/20 focus:outline-none focus:border-emerald-400/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                {lang === 'ru' ? 'Способ оплаты' : 'Payment Method'}
              </label>
              <div className="grid grid-flow-col auto-cols-fr gap-1">
                {[
                  { id: 'cash', ru: 'Наличные', en: 'Cash' },
                  { id: 'thai', ru: 'Бат QR', en: 'Thai QR' },
                  { id: 'crypto', ru: 'Crypto', en: 'Crypto' },
                  { id: 'rub', ru: 'Рубли', en: 'Rubles' }
                ]
                  .filter(p => lang === 'ru' || p.id !== 'rub')
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { triggerHaptic('light'); setPaymentMethod(p.id); }}
                      className={`py-1.5 px-0.5 rounded-xl font-black text-[9px] uppercase border transition-all text-center truncate ${paymentMethod === p.id ? 'bg-white border-white text-black' : 'bg-white/5 border-white/5 text-white/50'}`}
                    >
                      {lang === 'ru' ? p.ru : p.en}
                    </button>
                  ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">
                  {lang === 'ru' ? 'Адрес доставки (Пхукет)' : 'Delivery Address (Phuket)'}
                </label>
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); window.open('https://maps.google.com', '_blank'); }}
                  className="text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1 active:opacity-70"
                >
                  <MapPin size={10} />
                  {lang === 'ru' ? 'Открыть Карты' : 'Open Maps'}
                </button>
              </div>
              <textarea
                placeholder={lang === 'ru' ? 'Hotel name, google maps link or plus code...' : 'Hotel name, google maps link or plus code...'}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[12px] text-white font-medium placeholder:text-white/20 focus:outline-none focus:border-emerald-400/50 transition-colors resize-none leading-relaxed"
              />
            </div>
          </form>
        </div>

        {/* ФИОЛЕТОВАЯ ПРАВКА ОТСТУПОВ: py-3 px-6 вместо p-6 делает нижнюю зону компактной */}
        <div className="py-3 px-6 border-t border-white/5 bg-black/10 space-y-3 shrink-0">
          <div className="flex justify-between items-end">
            <span className="text-[11px] font-black uppercase tracking-widest text-white/40">{lang === 'ru' ? 'ИТОГО К ОПЛАТЕ' : 'TOTAL AMOUNT'}</span>
            <span className="text-[26px] font-black tracking-tighter text-white leading-none">{finalCalculatedTotal}<Baht className="opacity-40" /></span>
          </div>
          <button 
            disabled={!isFormValid}
            onClick={handleOpenSuccessPopup}
            className={`w-full h-[50px] rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[12px] tracking-[0.15em] transition-all shadow-lg ${isFormValid ? 'bg-white text-[#193D2E] active:scale-[0.98] hover:bg-emerald-400 hover:text-black' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
          >
            <span>{lang === 'ru' ? 'Подтвердить заказ' : 'Confirm Order'}</span>
            <SendHorizontal size={14} />
          </button>
        </div>

        {/* ДВУХЭТАПНЫЙ ПОП-АП С ОПЕРАТОРОМ */}
        {showSuccessPopup && (
          <div className="absolute inset-0 bg-[#112D21] z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 mb-4">
              <CheckCircle2 size={42} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-[18px] font-black uppercase tracking-tight text-white mb-2">
              {lang === 'ru' ? 'Заказ передан!' : 'Order Processed!'}
            </h3>
            
            <p className="text-[12px] font-medium text-white/70 leading-relaxed max-w-xs mb-8">
              {lang === 'ru' 
                ? 'Чтобы ускорить оформление — отправьте сформированное сообщение нашему оператору в Telegram.' 
                : 'To accelerate processing time — please forward the generated invoice text to our Telegram operator.'}
            </p>

            <div className="w-full space-y-2 max-w-xs">
              <button
                onClick={handleFinalTelegramSubmit}
                className="w-full h-[52px] bg-emerald-400 text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[12px] tracking-[0.15em] shadow-xl active:scale-95 transition-all"
              >
                <span>{lang === 'ru' ? 'Подтвердить в Telegram' : 'Confirm in Telegram'}</span>
                <SendHorizontal size={15} />
              </button>
              
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full py-2.5 text-[10px] font-black uppercase text-white/40 tracking-widest active:opacity-60"
              >
                {lang === 'ru' ? 'Вернуться назад' : 'Go Back'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
