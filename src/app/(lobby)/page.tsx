const ExclusiveCard = ({ item, onClick }: { item: any, onClick: () => void }) => {
  const isImport = item.subcategory?.toLowerCase().includes('import');
  const accentColor = isImport ? IMPORT_COLOR : SELECTED_COLOR; 
  const typeColor = TYPE_COLORS[item.type?.toLowerCase()] || "#FFF";
  const displayPrice = Object.values(item.prices || {}).find(v => Number(v) > 0) || 0;

  return (
    <div 
      onClick={onClick} 
      className="relative rounded-[2.2rem] border border-white/10 bg-black/40 active:scale-[0.98] transition-all cursor-pointer group flex flex-col justify-between h-full shadow-2xl"
      style={{ 
        // Принудительная обрезка всего, что выходит за рамки скругления
        isolation: 'isolate',
        overflow: 'hidden',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)' // Fix для Safari/iOS по обрезке блюра
      }}
    >
      
      {/* ИСПРАВЛЕННОЕ СВЕЧЕНИЕ: 
          1. Opacity снижен до 0.3 (было 0.6), чтобы не "выжигать" глаза.
          2. Blur увеличен, но область сужена (inset-4), чтобы края были мягче внутри карточки.
      */}
      <div 
        className="absolute inset-x-4 top-0 h-2/3 opacity-30 blur-[50px] transition-opacity group-hover:opacity-50 pointer-events-none" 
        style={{ 
          background: `radial-gradient(circle at center top, ${accentColor}, transparent)`,
          zIndex: 0 
        }}
      ></div>
      
      <div 
        className="absolute inset-x-4 bottom-0 h-1/3 opacity-20 blur-[40px] transition-opacity group-hover:opacity-40 pointer-events-none" 
        style={{ 
          background: `radial-gradient(circle at center bottom, ${accentColor}, transparent)`,
          zIndex: 0
        }}
      ></div>
      
      {/* КОНТЕНТ: Добавлен backdrop-blur здесь, чтобы он не конфликтовал с маской родителя */}
      <div className="relative z-10 space-y-3 p-5 flex-1 flex flex-col justify-between backdrop-blur-md">
        
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 opacity-60">
                <Star size={9} style={{ color: accentColor }} fill={accentColor} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] truncate">{item.subcategory}</span>
              </div>
              <h3 className="text-[16px] font-black italic uppercase tracking-tighter leading-tight">{item.name}</h3>
              <p className="text-[9px] font-bold mt-0.5 opacity-60 truncate">{item.farm || "Private Reserve"}</p>
            </div>
            <div className="bg-white/10 border border-white/10 p-2 rounded-xl shrink-0 mt-1 backdrop-blur-md">
              {isImport ? <Crown size={14} style={{ color: accentColor }} /> : <Flame size={14} style={{ color: accentColor }} />}
            </div>
          </div>
          
          <div className="aspect-square w-full bg-black/20 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/5 shadow-inner">
              <img 
                src={getOptimizedImg(item.image, 300)} 
                className="h-[85%] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-700" 
                alt="" 
              />
          </div>
        </div>

        <div className="flex justify-between items-end mt-4">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest" style={{ color: typeColor }}>
            {item.type}
          </span>
          <div className="text-right ml-2">
             <p className="text-[8px] font-black uppercase opacity-20 leading-none mb-0.5">Starting at</p>
             <p className="text-[20px] font-black italic tracking-tighter leading-none" style={{ color: accentColor }}>
               {displayPrice}฿
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
