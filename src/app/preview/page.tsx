"use client"
import * as React from "react"
import Link from "next/link"
import { 
  Send, Instagram, ArrowRight, ShieldCheck, Zap, Star 
} from "lucide-react"

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-[#193D2E] text-white flex flex-col items-center justify-between p-8 overflow-hidden font-sans">
      
      {/* Декоративный свет на фоне */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.05)_0%,transparent_70%)] animate-pulse" />
      </div>

      {/* Верхний блок: Логотип */}
      <header className="relative z-10 pt-10 text-center">
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[50px] rounded-full" />
          <img 
            src="/images/logo-optimized.webp" 
            alt="BND Logo" 
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(52,211,153,0.2)]" 
          />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
          BND Collective
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400/60 mt-4 italic">
          High-End Delivery Service
        </p>
      </header>

      {/* Средний блок: Тизеры */}
      <div className="relative z-10 w-full max-w-sm space-y-4 my-10">
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: <ShieldCheck size={18} />, title: "Premium Selection", desc: "Lab-tested grades & verified quality" },
            { icon: <Zap size={18} />, title: "Express Delivery", desc: "Average time: 30-60 minutes" },
            { icon: <Star size={18} />, title: "Direct Support", desc: "Personal manager for every order" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="p-3 bg-white/5 rounded-2xl text-emerald-400 border border-white/5 shadow-inner">
                {item.icon}
              </div>
              <div className="text-left">
                <h3 className="text-[11px] font-black uppercase italic tracking-wider">{item.title}</h3>
                <p className="text-[10px] text-white/30 font-medium mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Нижний блок: Кнопки навигации */}
      <div className="relative z-10 w-full max-w-sm space-y-4 pb-10">
        
        {/* Главная кнопка входа */}
        <Link href="/" className="group flex justify-between items-center bg-white text-black p-6 rounded-[2.2rem] font-black uppercase italic text-sm transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <span className="flex items-center gap-3 italic">Explore Catalog</span>
          <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
        </Link>

        {/* Соцсети в ряд */}
        <div className="grid grid-cols-2 gap-3">
          <a 
            href="https://t.me/your_bot" 
            target="_blank" 
            className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 p-5 rounded-[2rem] font-black uppercase italic text-[10px] backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
          >
            <Send size={16} className="text-[#229ED9]" />
            Telegram
          </a>
          <a 
            href="https://instagram.com/your_profile" 
            target="_blank" 
            className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 p-5 rounded-[2rem] font-black uppercase italic text-[10px] backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
          >
            <Instagram size={16} className="text-pink-500" />
            Instagram
          </a>
        </div>

        <p className="text-center text-[8px] font-black uppercase text-white/10 tracking-[0.5em] pt-6">
          Established 2024 • Thailand
        </p>
      </div>

    </div>
  )
}
