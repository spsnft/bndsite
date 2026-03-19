"use client"
import * as React from "react"
import { getProducts } from "@/lib/product" 
import { ShoppingCart, X, Trash2, ArrowRight, Info, ChevronRight } from "lucide-react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// --- CONFIG & STYLES ---
const GRADES = [
  { id: "silver", title: "SILVER GRADE", priceLine: "1g—150 / 5g—700 / 10g—1200 / 20g—2000", color: "#C1C1C1" },
  { id: "golden", title: "GOLDEN GRADE", priceLine: "1g—250 / 5g—1100 / 10g—1700 / 20g—3000", color: "#FEC107" },
  { id: "premium", title: "PREMIUM GRADE", priceLine: "1g—300 / 5g—1300 / 10g—2000 / 20g—3500", color: "#34D399" },
  { id: "selected", title: "SELECTED GRADE", priceLine: "1g—350 / 5g—1500 / 10g—2500 / 20g—4000", color: "#A855F7" }
];

const TYPE_SHORT: Record<string, string> = {
  "indica": "IND", "sativa": "SAT", "hybrid": "HYB"
};

// --- MAIN PAGE ---
export default function LandingPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [view, setView] = React.useState<"landing" | "shop">("landing"); // shop - это наши старые карточки

  React.useEffect(() => {
    getProducts().then(data => setProducts(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      {/* ЛОГО И КНОПКИ НАВИГАЦИИ */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-24 mb-6 flex items-center justify-center bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl shadow-2xl">
           <span className="text-3xl font-black italic text-white tracking-tighter">BND</span>
        </div>
        
        <div className="flex gap-3 w-full max-w-sm">
          {["Buds", "Gear"].map((cat) => (
            <button 
              key={cat} 
              onClick={() => { /* Здесь переход на старый вид карточек если нужно */ }}
              className="flex-1 flex justify-center items-center bg-white/5 border border-white/10 py-4 rounded-2xl hover:bg-white hover:text-[#193D2E] transition-all active:scale-95"
            >
              <span className="text-xs font-black uppercase italic tracking-widest">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* СПИСОК МЕНЮ (КАК НА СКРИНШОТЕ) */}
      <div className="max-w-4xl mx-auto space-y-10">
        {GRADES.map((grade) => {
          const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeItems.length === 0) return null;

          return (
            <div key={grade.id} className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/10 backdrop-blur-md">
              {/* Шапка категории */}
              <div className="p-5 flex justify-between items-center" style={{ backgroundColor: `${grade.color}20` }}>
                <div>
                  <h2 className="text-xl font-black italic uppercase leading-none" style={{ color: grade.color }}>{grade.title}</h2>
                  <p className="text-[10px] font-bold opacity-50 mt-1.5 uppercase tracking-wider">{grade.priceLine}</p>
                </div>
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center opacity-30" style={{ borderColor: grade.color }}>
                   <div className="w-4 h-4 rounded-full" style={{ backgroundColor: grade.color }} />
                </div>
              </div>

              {/* Заголовки таблицы */}
              <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[8px] font-black uppercase opacity-20 border-b border-white/5 tracking-widest">
                <div className="col-span-6">Strain</div>
                <div className="col-span-2 text-center">Type</div>
                <div className="col-span-4 text-right">Farm</div>
              </div>

              {/* Список сортов */}
              <div className="divide-y divide-white/5">
                {gradeItems.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProduct(p)}
                    className="grid grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-white/5 transition-colors cursor-pointer active:bg-white/10"
                  >
                    <div className="col-span-6 flex items-center gap-2">
                      {p.badge && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                      <span className="text-[11px] font-bold uppercase italic tracking-tight text-white/90">{p.name}</span>
                    </div>
                    <div className="col-span-2 text-center text-[10px] font-black" style={{ color: p.type === 'indica' ? '#EF4444' : p.type === 'sativa' ? '#3B82F6' : '#10B981' }}>
                      {TYPE_SHORT[p.type?.toLowerCase()] || 'IND'}
                    </div>
                    <div className="col-span-4 text-right text-[9px] font-bold opacity-30 italic line-clamp-1">
                      {p.farm}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* POP-UP (Используем вчерашний, он тут идеально встанет) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedProduct(null)}>
            {/* Твой вчерашний контент модалки v2... */}
            <div className="bg-[#193D2E] p-8 rounded-[2rem] border border-white/10 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                <img src={selectedProduct.image} className="w-40 h-40 mx-auto object-contain mb-4" />
                <h3 className="text-2xl font-black italic uppercase mb-2">{selectedProduct.name}</h3>
                <p className="text-xs opacity-40 mb-6 italic">{selectedProduct.description}</p>
                <button 
                    onClick={() => setSelectedProduct(null)}
                    className="w-full py-4 bg-white text-[#193D2E] rounded-2xl font-black uppercase italic"
                >
                    Close
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
