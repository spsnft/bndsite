import * as React from "react"
import { X, Trash2, Sparkles } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { GRADES, CONTACT_METHODS, TYPE_COLORS, SELECTED_COLOR } from "@/components/landing/constants"
import { triggerHaptic, getInterpolatedPrice, isElite } from "@/lib/utils"

export function CheckoutModal({ items, total, onClose, t, lang, onEditItem }: any) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { clearCart, removeItem } = useCart();

  const categoryPromos = React.useMemo(() => {
    const groups: Record<string, any> = {};
    items.forEach(item => {
      const sub = item.subcategory?.toLowerCase() || "other";
      if (isElite(item)) return;
      const w = parseFloat(item.weight) || 0;
      if (!groups[sub]) groups[sub] = { weight: 0, prices: item.prices, sub: item.subcategory };
      groups[sub].weight += w;
    });
    return Object.values(groups).map((group: any) => {
      const steps = [1, 5, 10, 20];
      const nextStep = steps.find(s => s > group.weight);
      if (!nextStep || !group.prices) return null;
      const nextPrice = Math.round(getInterpolatedPrice(nextStep, group.prices, false));
      const nextPerGram = Math.round(nextPrice / nextStep);
      const diff = (nextStep - group.weight).toFixed(1).replace('.0', '');
      const color = GRADES.find(g => g.id === group.sub.toLowerCase())?.color || SELECTED_COLOR;
      return { sub: group.sub, diff, nextPerGram, color };
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10 text-white">
          <div><h2 className="text-xl font-black uppercase tracking-tighter">{t.yourBasket}</h2><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{items.length} {t.items}</p></div>
          <button onClick={onClose} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {categoryPromos.map((promo: any) => (
            <div key={promo.sub} className="relative p-4 rounded-2xl border border-white/5" style={{ background: `${promo.color}15` }}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/5" style={{ color: promo.color }}><Sparkles size={16} /></div>
                <p className="text-[10px] font-bold text-white/70 uppercase">
                  {lang === 'ru' ? <>Добавь <span style={{ color: promo.color }}>{promo.diff}г</span> и открой цену <span style={{ color: promo.color }}>{promo.nextPerGram}฿/г</span>!</> : <>Add <span style={{ color: promo.color }}>{promo.diff}g</span> and unlock <span style={{ color: promo.color }}>{promo.nextPerGram}฿/g</span>!</>}
                </p>
              </div>
            </div>
          ))}
          <div className="space-y-2">
            {items.map((item: any) => (
              <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5 text-white">
                <button onClick={() => onEditItem(item)} className="flex-1 min-w-0 text-left">
                  <h3 className="text-[11px] font-black uppercase truncate">{item.name}</h3>
                  <p className="text-[9px] opacity-40 font-bold">{item.weight} • {item.price}฿ • {item.subcategory}</p>
                </button>
                <button onClick={() => removeItem(item.id, item.weight)} className="text-rose-500/30 p-2.5 bg-white/5 rounded-xl"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (<button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border ${method === m.id ? "bg-white text-black" : "bg-white/5 text-white opacity-30"}`}><m.icon size={16} /><span className="text-[7px] font-black uppercase">{m.label}</span></button>))}
          </div>
          <input type="text" placeholder={t[CONTACT_METHODS.find(m => m.id === method)?.phKey || "contactPh"]} value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[12px] text-white" />
          <div className="flex items-center justify-between text-white"><p className="text-[10px] font-black uppercase opacity-40">{t.totalAmount}</p><p className="text-3xl font-black">{total}฿</p></div>
          <button onClick={handleSubmit} className="w-full bg-emerald-400 text-[#193D2E] py-2.5 rounded-2xl font-black uppercase text-[12px]">{t.confirmOrder}</button>
        </div>
      </div>
    </div>
  );
}
