"use client"
import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingBag, Send, X, Trash2, Flame, SendHorizontal, MessageCircle, Instagram } from "lucide-react"
import { useCart } from "@/store/store"
import { getProducts } from "@/lib/product"

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbydASYY66CcKhk7m6JuBHBA4W3AaXQMIFDiqLyoXchpbYnuwOqofhdv7CXlhcXsvzLF/exec";

// Функция расчета цены (простая для концентратов, обычно 1г или фикс)
const getPrice = (weight: number, prices: any) => {
  if (prices[weight]) return prices[weight];
  return prices[1] * weight; 
};

// --- MODALS (Checkout такая же как на главной для единства стиля) ---

function CheckoutModal({ items, total, onClose }: { items: any[], total: number, onClose: () => void }) {
  const [method, setMethod] = React.useState("telegram");
  const [contact, setContact] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { clearCart, removeItem, updateQuantity } = useCart();

  const handleSubmit = async () => {
    if (!contact) return alert("Please enter contact details");
    setIsSending(true);
    const orderText = items.map(i => `${i.name} (${i.weight}) x${i.quantity} — ${i.price * i.quantity}฿`).join("\n");
    try {
      await fetch(GOOGLE_SCRIPT_URL, { 
        method: "POST", 
        mode: "no-cors", 
        body: JSON.stringify({ contact, method, orderText, total }) 
      });
      alert("Order sent!"); clearCart(); onClose();
    } catch (e) { alert("Error"); } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#193D2E] rounded-[2.5rem] border border-white/10 flex flex-col max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/10">
          <h2 className="text-xl font-black italic uppercase text-white">Your Basket</h2>
          <button onClick={onClose} className="opacity-20 hover:opacity-100 text-white"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.map((item) => (
            <div key={`${item.id}-${item.weight}`} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5">
              <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-black uppercase text-white truncate">{item.name}</h3>
                <p className="text-[9px] opacity-40 font-bold text-white uppercase">{item.weight} • {item.price}฿</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.weight, -1)} className="text-white opacity-40">-</button>
                <span className="text-[10px] font-black text-white">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.weight, 1)} className="text-white opacity-40">+</button>
                <button onClick={() => removeItem(item.id, item.weight)} className="text-rose-500/40 ml-2"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {['telegram', 'whatsapp', 'line', 'instagram'].map(m => (
              <button key={m} onClick={() => setMethod(m)} className={`py-3 rounded-xl border text-[8px] font-black uppercase ${method === m ? "bg-white text-black" : "bg-white/5 text-white opacity-30"}`}>{m}</button>
            ))}
          </div>
          <input type="text" placeholder="Contact Details" value={contact} onChange={e => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white text-sm" />
          <div className="flex justify-between items-center text-white">
            <span className="text-[10px] font-black uppercase opacity-40">Total</span>
            <span className="text-3xl font-black italic">{total}฿</span>
          </div>
          <button onClick={handleSubmit} className="w-full bg-[#a855f7] text-white py-5 rounded-2xl font-black uppercase text-[12px] shadow-xl">Confirm Order</button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function ConcentratesPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { items, getTotal, addItem } = useCart();

  React.useEffect(() => {
    getProducts().then(data => {
      // Берем только то, что НЕ относится к buds
      setProducts(data.filter(p => p.category?.toLowerCase() !== 'buds'));
      setLoading(false);
    });
  }, []);

  const grouped = products.reduce((acc: any, p: any) => {
    const key = p.subcategory || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen bg-[#193D2E] flex items-center justify-center text-white/20 uppercase font-black italic">Loading Extraction...</div>;

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32">
      <header className="flex items-center justify-between mb-10 pt-4 max-w-4xl mx-auto">
        <Link href="/" className="p-4 bg-white/5 rounded-2xl border border-white/10 active:scale-95"><ArrowLeft size={20} /></Link>
        <div className="text-center">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Concentrates</h1>
          <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] mt-1">Extraction Menu</p>
        </div>
        <div className="w-14"></div>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        {Object.entries(grouped).map(([subCat, groupItems]: [string, any]) => (
          <div key={subCat} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 shadow-2xl">
            <div className="p-6 flex justify-between items-center bg-[#a855f7]/10 border-b border-white/5">
              <h2 className="text-xl font-black italic uppercase text-[#a855f7]">{subCat}</h2>
              <Flame size={18} className="text-[#a855f7]" />
            </div>
            <div className="divide-y divide-white/5">
              {groupItems.map((p: any) => (
                <div key={p.id} onClick={() => { addItem({...p, price: p.prices[1] || p.prices[10]/10, weight: "1 unit"}); }} className="grid grid-cols-12 gap-2 px-6 py-5 items-center hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors">
                  <div className="col-span-8">
                    <span className="text-[12px] font-black uppercase italic text-white/90">{p.name}</span>
                    <p className="text-[8px] opacity-30 font-bold uppercase">{p.farm}</p>
                  </div>
                  <div className="col-span-4 text-right text-[12px] font-black italic text-[#a855f7]">{p.prices[1] || p.prices[10]/10}฿</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#a855f7] text-white p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E] active:scale-95 transition-transform">
            <div className="flex items-center gap-4 text-left">
              <ShoppingBag size={22}/>
              <div>
                <p className="text-[10px] font-black uppercase leading-none opacity-60">Checkout Basket</p>
                <p className="text-[16px] font-black italic mt-1">{getTotal()}฿ Total</p>
              </div>
            </div>
            <Send size={18}/>
          </button>
        </div>
      )}

      {isCheckoutOpen && <CheckoutModal items={items} total={getTotal()} onClose={() => setIsCheckoutOpen(false)} />}
    </div>
  );
}
