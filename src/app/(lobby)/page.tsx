"use client"
import * as React from "react"
import { ShoppingCart, ArrowRight, Leaf, Zap, ChevronLeft } from "lucide-react"

// ЦВЕТА И ТЕНИ (Жестко зашиты)
const GRADE_STYLES: any = {
  "premium": { color: "#34D399", glass: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
  "golden": { color: "#FEC107", glass: "rgba(254,193,7,0.08)", border: "rgba(254,193,7,0.2)" },
  "silver": { color: "#C1C1C1", glass: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
};

export default function IndexPage() {
  const [view, setView] = React.useState<"landing" | "shop">("landing");
  const [activeCat, setActiveCat] = React.useState("Buds");

  // ТЕ ЖЕ ТОВАРЫ, ЧТО БЫЛИ В ТАБЛИЦЕ
  const products = [
    { id: "1", name: "Premium Bud", price: 50, category: "Buds", grade: "premium" },
    { id: "2", name: "Golden Kush", price: 80, category: "Buds", grade: "golden" },
  ];

  if (view === "landing") {
    return (
      <main className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#193D2E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15)_0%,transparent_70%)] pointer-events-none" />
        
        {/* ОГРОМНЫЙ ЛОГОТИП */}
        <div className="w-64 h-64 mb-24 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
           <h1 className="text-8xl font-black italic text-white tracking-tighter">BND</h1>
        </div>
        
        {/* КРУПНЫЕ КНОПКИ */}
        <div className="grid grid-cols-2 gap-10 w-full max-w-2xl px-6">
          {[
            { id: "Buds", icon: <Leaf size={60} />, label: "Buds" },
            { id: "Accessories", icon: <Zap size={60} />, label: "Gear" }
          ].map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => { setActiveCat(cat.id); setView("shop"); }} 
              className="aspect-square flex flex-col items-center justify-center bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[5rem] hover:bg-white hover:text-[#193D2E] transition-all group active:scale-90"
              style={{ WebkitBackdropFilter: 'blur(50px)' }}
            >
              <div className="mb-6 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <span className="text-3xl font-black uppercase italic tracking-widest">{cat.label}</span>
              <ArrowRight size={30} className="mt-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
            </button>
          ))}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-10 pt-24 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-24">
        <button onClick={() => setView("landing")} className="flex items-center gap-4 bg-white/10 px-10 py-5 rounded-full border border-white/10 text-xs font-black uppercase tracking-[0.3em]">
          <ChevronLeft size={20} /> Back
        </button>
        <span className="text-4xl font-black italic">BND</span>
      </div>

      <h1 className="text-[10rem] font-black italic uppercase mb-20 tracking-tighter leading-none opacity-100">
        {activeCat === "Accessories" ? "Gear" : activeCat}
      </h1>

      <div className="grid gap-12 pb-40">
        {products.filter(p => p.category === (activeCat === "Accessories" ? "Accessories" : "Buds")).map((p) => (
          <div 
            key={p.id} 
            className="p-16 rounded-[4.5rem] border shadow-2xl backdrop-blur-3xl"
            style={{ 
              backgroundColor: GRADE_STYLES[p.grade]?.glass, 
              borderColor: GRADE_STYLES[p.grade]?.border,
              WebkitBackdropFilter: 'blur(60px)' 
            }}
          >
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-6xl font-black italic mb-4 uppercase tracking-tighter">{p.name}</h3>
                <span style={{ color: GRADE_STYLES[p.grade]?.color }} className="text-sm font-black uppercase tracking-[0.4em]">
                  {p.grade}
                </span>
              </div>
              <p className="text-7xl font-black italic tracking-tighter">${p.price}</p>
            </div>
            <button className="w-full py-10 bg-white text-[#193D2E] rounded-[3rem] font-black uppercase italic text-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
