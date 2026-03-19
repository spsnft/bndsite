"use client"
import * as React from "react"
import Link from "next/link"
import { getProducts } from "@/lib/product" 
import { 
  LayoutGrid, 
  Zap, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Percent, 
  Check 
} from "lucide-react"

// --- CONFIG ---
const GRADES = [
  { id: "silver", title: "SILVER GRADE", priceLine: "1g—150 / 5g—700 / 10g—1200 / 20g—2000", color: "#C1C1C1" },
  { id: "golden", title: "GOLDEN GRADE", priceLine: "1g—250 / 5g—1100 / 10g—1700 / 20g—3000", color: "#FEC107" },
  { id: "premium", title: "PREMIUM GRADE", priceLine: "1g—300 / 5g—1300 / 10g—2000 / 20g—3500", color: "#34D399" },
  { id: "selected", title: "SELECTED GRADE", priceLine: "1g—350 / 5g—1500 / 10g—2500 / 20g—4000", color: "#A855F7" }
];

const TYPE_SHORT: Record<string, string> = { "indica": "IND", "sativa": "SAT", "hybrid": "HYB" };

// Компонент для красивых бейджей
const BadgeIcon = ({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case "NEW":
      return (
        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
          <Sparkles size={10} className="text-blue-400" />
        </div>
      );
    case "HIT":
      return (
        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
          <Flame size={10} className="text-orange-400" />
        </div>
      );
    case "SALE":
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <Percent size={10} className="text-emerald-400" />
        </div>
      );
    default:
      return null;
  }
};

export default function LandingPage() {
  const [products, setProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    getProducts().then(data => setProducts(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#193D2E] text-white p-4 md:p-8 pb-32">
      {/* HEADER / LOGO */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 mb-6 flex items-center justify-center bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl shadow-2xl">
           <span className="text-2xl font-black italic text-white tracking-tighter uppercase">BND</span>
        </div>
        
        <div className="flex gap-3 w-full max-w-sm">
          <Link href="/v2" className="flex-1 flex gap-2 justify-center items-center bg-white text-[#193D2E] py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest active:scale-95 transition-all">
            <LayoutGrid size={14} /> Full Menu
          </Link>
          <button className="flex-1 flex gap-2 justify-center items-center bg-white/5 border border-white/10 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest opacity-40 cursor-not-allowed">
            <Zap size={14} /> Concentrates
          </button>
        </div>
      </div>

      {/* MENU BOARD */}
      <div className="max-w-4xl mx-auto space-y-8">
        {GRADES.map((grade) => {
          const gradeItems = products.filter(p => p.subcategory === grade.id && p.category === 'buds');
          if (gradeItems.length === 0) return null;

          return (
            <div key={grade.id} className="rounded-3xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
              {/* HEADER SECTION */}
              <div className="p-5 flex justify-between items-center border-b border-white/5" style={{ backgroundColor: `${grade.color}10` }}>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter" style={{ color: grade.color }}>{grade.title}</h2>
                  <p className="text-[9px] font-black opacity-40 mt-1 uppercase tracking-widest leading-none">{grade.priceLine}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                   <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: grade.color, boxShadow: `0 0 10px ${grade.color}` }} />
                </div>
              </div>

              {/* TABLE HEADERS */}
              <div className="grid grid-cols-12 gap-2 px-6 py-2.5 text-[7px] font-black uppercase opacity-20 tracking-[0.2em] bg-white/5">
                <div className="col-span-6">Strain Name</div>
                <div className="col-span-2 text-center">Type</div>
                <div className="col-span-4 text-right">Farm Origin</div>
              </div>

              {/* STRAIN LIST */}
              <div className="divide-y divide-white/5">
                {gradeItems.map((p) => {
                  const badge = String(p.badge || "").toUpperCase();
                  const typeColor = p.type === 'indica' ? '#EF4444' : p.type === 'sativa' ? '#3B82F6' : '#10B981';

                  return (
                    <Link 
                      href="/v2" 
                      key={p.id} 
                      className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-white/5 transition-all group"
                    >
                      {/* STRAIN NAME WITH FIXED ALIGNMENT */}
                      <div className="col-span-6 flex items-center gap-4 relative">
                        <div className="w-5 flex justify-center shrink-0">
                          {badge && <BadgeIcon type={badge} />}
                        </div>
                        <span className="text-[11px] font-black uppercase italic tracking-tight text-white/90 group-hover:text-white transition-colors">
                          {p.name}
                        </span>
                      </div>

                      {/* GENOTYPE */}
                      <div className="col-span-2 text-center text-[9px] font-black uppercase" style={{ color: typeColor }}>
                        {TYPE_SHORT[p.type?.toLowerCase()] || 'HYB'}
                      </div>

                      {/* FARM */}
                      <div className="col-span-4 text-right flex items-center justify-end gap-2 text-[9px] font-bold opacity-30 italic line-clamp-1 group-hover:opacity-60 transition-opacity">
                        {p.farm} <ChevronRight size={10} className="opacity-50" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="mt-16 text-center text-[9px] font-black uppercase tracking-[0.6em] text-white/10 italic">Premium Delivery Phuket • Since 2024</p>
    </div>
  );
}
