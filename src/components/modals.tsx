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
        {/* Убрали нижний паддинг (pb-0) */}
        <div className="p-6 pb-0 border-b border-white/5 flex justify-between items-center bg-black/10 text-white min-h-[80px]">
          <div><h2 className="text-xl font-black uppercase tracking-tighter">{t.yourBasket}</h2><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{items.length} {t.items}</p></div>
          <button onClick={onClose} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {categoryPromos.length > 0 && (
            <div className="space-y-2">
              {categoryPromos.map((promo: any) => (
                <div key={promo.sub} className="relative p-4 rounded-2xl overflow-hidden border border-white/5" style={{ background: `linear-gradient(135deg, ${promo.color}15 0%, rgba(0,0,0,0.4) 100%)` }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/5" style={{ color: promo.color }}><Sparkles size={16} /></div>
                    <div><p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase tracking-wide">
                        {lang === 'ru' ? (
                          <>Добавь <span className="font-black" style={{ color: promo.color }}>{promo.diff}г</span> из <span className="font-black" style={{ color: promo.color }}>{promo.sub}</span> и открой цену <span className="font-black" style={{ color: promo.color }}>{promo.nextPerGram}฿/г</span>!</>
                        ) : (
                          <>Add <span className="font-black" style={{ color: promo.color }}>{promo.diff}g</span> of <span className="font-black" style={{ color: promo.color }}>{promo.sub}</span> and unlock <span className="font-black" style={{ color: promo.color }}>{promo.nextPerGram}฿/g</span> price!</>
                        )}
                    </p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {items.map((item: any) => (
              <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5 text-white">
                <button onClick={() => { triggerHaptic('light'); onEditItem(item); }} className="flex-1 min-w-0 text-left active:opacity-60 transition-opacity">
                  {/* Увеличено до 14px */}
                  <h3 className="text-[14px] font-black uppercase truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {/* Увеличено до 12px */}
                    <p className="text-[12px] opacity-40 font-bold uppercase tracking-widest">{item.weight} • {item.price}฿</p>
                    <span className="w-1 h-1 rounded-full bg-white/10 shrink-0"></span>
                    {/* Увеличено до 11px */}
                    <p className="text-[11px] font-black uppercase tracking-tighter" style={{ color: (item.subcategory?.toLowerCase() === 'import loose' ? GRADES.find(g => g.id === 'import')?.color : GRADES.find(g => g.id === item.subcategory?.toLowerCase())?.color) || SELECTED_COLOR }}>{item.subcategory}</p>
                    <span className="w-1 h-1 rounded-full bg-white/10 shrink-0"></span>
                    {/* Увеличено до 11px */}
                    <p className="text-[11px] font-black uppercase tracking-tighter" style={{ color: TYPE_COLORS[item.type?.toLowerCase()] || "#FFF" }}>{item.type}</p>
                  </div>
                </button>
                <button onClick={() => { triggerHaptic('medium'); removeItem(item.id, item.weight); }} className="text-rose-500/30 hover:text-rose-500 transition-colors p-2.5 bg-white/5 rounded-xl"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
        {/* Удален space-y-4, используем точечные отступы */}
        <div className="p-6 bg-black/20 border-t border-white/5">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {CONTACT_METHODS.map(m => (<button key={m.id} onClick={() => { triggerHaptic('light'); setMethod(m.id); }} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${method === m.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 opacity-30 text-white"}`}><m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span></button>))}
          </div>
          <input type="text" placeholder={t[CONTACT_METHODS.find(m => m.id === method)?.phKey || "contactPh"]} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] font-bold outline-none focus:border-emerald-400 text-white placeholder:opacity-30" />
          
          {/* Фиксированный интервал 12px (mt-3 = 12px) */}
          <div className="flex items-center justify-between mt-3 text-white"><p className="text-[10px] font-black uppercase opacity-40">{t.totalAmount}</p><p className="text-3xl font-black tracking-tighter">{total}฿</p></div>
          <button onClick={handleSubmit} className="w-full mt-4 bg-emerald-400 text-[#193D2E] py-2.5 rounded-2xl font-black uppercase text-[12px] tracking-widest active:scale-[0.97] hover:animate-pulse transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]">{t.confirmOrder}</button>
        </div>
      </div>
    </div>
  );
}
