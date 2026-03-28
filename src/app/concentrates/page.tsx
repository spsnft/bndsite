// --- ОБНОВЛЕННЫЕ ЦВЕТА И ИКОНКИ (Синхронизация с грейдами главной) ---
const getSubStyle = (subName = "") => {
  const name = subName.toLowerCase();
  
  // Premium Selected -> Fresh Frozen Premium
  if (name.includes("premium")) {
    return { color: "#34D399", icon: Flame }; 
  }
  
  // Gold Grade -> Fresh Frozen
  if (name.includes("fresh frozen")) {
    return { color: "#FEC107", icon: Sparkles }; 
  }
  
  // Silver Grade -> Old School / Hash
  if (name.includes("old school") || name.includes("hash")) {
    return { color: "#C1C1C1", icon: Percent };
  }
  
  // Rosin -> Live Rosin
  if (name.includes("rosin")) {
    return { color: "#A855F7", icon: Crown };
  }
  
  // Default
  return { color: "#FFF", icon: Zap };
};
