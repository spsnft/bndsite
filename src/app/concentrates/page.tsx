"use client"
import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingBag, Send, X, Trash2, Flame } from "lucide-react"
import { useCart } from "@/store/store"
import { getProducts } from "@/lib/product"

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbydASYY66CcKhk7m6JuBHBA4W3AaXQMIFDiqLyoXchpbYnuwOqofhdv7CXlhcXsvzLF/exec";

// Модалки CheckoutModal и ProductModal в этом файле такие же, как на главной, 
// но с адаптированным под концентраты стилем. 

export default function ConcentratesPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const { items, getTotal } = useCart();

  React.useEffect(() => {
    getProducts().then(data => {
      setProducts(data.filter(p => p.category?.toLowerCase() !== 'buds'));
    });
  }, []);

  const grouped = products.reduce((acc: any, p: any) => {
    const key = p.subcategory || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 pb-32">
      <header className="flex items-center justify-between mb-10 pt-4 max-w-4xl mx-auto">
        <Link href="/" className="p-4 bg-white/5 rounded-2xl border border-white/10 active:scale-90"><ArrowLeft size={20} /></Link>
        <div className="text-center">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Concentrates</h1>
          <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] mt-1">Extraction Menu</p>
        </div>
        <div className="w-14"></div>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        {Object.entries(grouped).map(([subCat, groupItems]: [string, any]) => (
          <div key={subCat} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
            <div className="p-6 flex justify-between items-center bg-white/5 border-b border-white/5">
              <h2 className="text-xl font-black italic uppercase text-emerald-400">{subCat}</h2>
              <Flame size={18} className="text-emerald-400" />
            </div>
            <div className="divide-y divide-white/5">
              {groupItems.map((p: any) => (
                <div key={p.id} onClick={() => setSelected(p)} className="grid grid-cols-12 gap-2 px-6 py-5 items-center hover:bg-white/5 cursor-pointer">
                  <div className="col-span-8 flex flex-col">
                    <span className="text-[12px] font-black uppercase italic text-white/90">{p.name}</span>
                    <span className="text-[8px] opacity-30 font-bold uppercase">{p.farm}</span>
                  </div>
                  <div className="col-span-4 text-right text-[10px] font-bold italic opacity-40">from {p.prices[10]/10}฿/g</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#a855f7] text-white p-5 rounded-[2.5rem] shadow-2xl flex justify-between items-center border-4 border-[#193D2E]">
            <div className="flex items-center gap-4 text-left">
              <ShoppingBag size={22}/>
              <div>
                <p className="text-[10px] font-black uppercase leading-none opacity-60">Order Basket</p>
                <p className="text-[16px] font-black italic mt-1">{getTotal()}฿ Total</p>
              </div>
            </div>
            <Send size={18}/>
          </button>
        </div>
      )}
      {/* Здесь должны быть импортированы те же Modal компоненты, что на главной */}
    </div>
  );
}
