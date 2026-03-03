"use client"
import * as React from "react"
import { ShoppingCart, ArrowRight, Leaf, Zap, ChevronLeft } from "lucide-react"
import { getProducts } from "@/lib/product" // Наш новый загрузчик

const GRADE_STYLES: Record<string, any> = {
  "silver": { color: "#C1C1C1", bg: "bg-white/5", border: "border-white/10" },
  "golden": { color: "#FEC107", bg: "bg-[#FEC107]/10", border: "border-[#FEC107]/20" },
  "premium": { color: "#34D399", bg: "bg-[#34D399]/10", border: "border-[#34D399]/20" },
  "selected premium": { color: "#A855F7", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" },
};

export default function IndexPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [view, setView] = React.useState<"landing" | "shop">("landing");
  const [activeCat, setActiveCat] = React.useState("Buds");

  // Загрузка товаров при запуске
  React.useEffect(() => {
    getProducts().then(data => {
      if (data && data.length > 0) setProducts(data);
    });
  }, []);

  if (view === "landing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="w-44 h-44 mb-16 relative z-10 flex items-center justify-center bg-white/5 rounded-full backdrop-blur-3xl border border-white/10 shadow-2xl">
           <span className="text-5xl font-black italic text-white tracking-tighter">BND</span>
        </div>
        
        <div className="grid grid-cols-2 gap-6 w-full max-w-lg relative z-10">
          {[
            { id: "Buds", icon: <Leaf size={40} />, label: "Buds" },
            { id: "Accessories", icon: <Zap size={40} />, label: "Gear" }
          ].map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => { setActiveCat(cat.id); setView("shop"); }} 
              className="aspect-square flex flex-col items-center justify-center bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] hover:bg-white hover:text-[#193D2E] transition-all active:scale-95 group shadow-2xl"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <span className="text-xl font-black uppercase italic tracking-widest">{cat.label}</span>
              <ArrowRight size={20} className="mt-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => setView("landing")} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-2xl font-black italic">BND</span>
      </div>

      <h1 className="text-6xl font-black italic uppercase mb-10 tracking-tighter">
        {activeCat === "Accessories" ? "Gear" : activeCat}
      </h1>

      <div className="grid gap-6 pb-20">
        {products
          .filter(p => p.category === activeCat)
          .map((p) => (
            <div key={p.id} className={`p-8 rounded-[3rem] border backdrop-blur-3xl ${GRADE_STYLES[p.grade?.toLowerCase()]?.bg || 'bg-white/5'} ${GRADE_STYLES[p.grade?.toLowerCase()]?.border || 'border-white/10'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-black italic mb-1 uppercase tracking-tight">{p.name}</h3>
                  <span style={{ color: GRADE_STYLES[p.grade?.toLowerCase()]?.color }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {p.grade}
                  </span>
                </div>
                <p className="text-4xl font-black italic">${p.price}</p>
              </div>
              <button className="w-full py-5 bg-white text-[#193D2E] rounded-[1.5rem] font-black uppercase italic text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                Add to cart
              </button>
            </div>
          ))}
          {products.filter(p => p.category === activeCat).length === 0 && (
            <p className="opacity-20 italic text-center py-20">No products found in this category...</p>
          )}
      </div>
    </div>
  );
}
