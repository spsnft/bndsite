import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Функция для объединения классов Tailwind (ошибка 'cn' is not exported)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Функция для формирования полных URL (ошибка 'absoluteUrl' is not exported)
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${path}`
}

// Компонент иконки Бата (ошибка 'Baht' is not exported)
export function Baht({ className }: { className?: string }) {
  return <span className={cn("ml-0.5", className)}>฿</span>
}

// Константы и настройки стилей
export const SELECTED_COLOR = "#34d399" // emerald-400

export const TYPE_COLORS: Record<string, string> = {
  sativa: "#fbbf24", // amber-400
  indica: "#818cf8", // indigo-400
  hybrid: "#34d399", // emerald-400
}

export const GRADES = [
  { id: "top shelf", label: "Top Shelf", color: "#34d399" },
  { id: "high grade", label: "High Grade", color: "#fbbf24" },
  { id: "elite", label: "Elite", color: "#f472b6" }, // pink-400
]

// Настройки методов связи
export const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", phKey: "contactPh" },
  { id: "whatsapp", label: "WhatsApp", phKey: "contactPh" },
  { id: "phone", label: "Phone", phKey: "contactPh" },
]

// Логика цен и расчетов
export function isElite(product: any) {
  return product?.subcategory?.toLowerCase() === 'elite';
}

export function triggerHaptic(style: 'light' | 'medium' | 'success' = 'light') {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
    const haptic = (window as any).Telegram.WebApp.HapticFeedback;
    if (style === 'success') haptic.notificationOccurred('success');
    else haptic.impactOccurred(style);
  }
}

export function getInterpolatedPrice(weight: number, prices: any, isElite: boolean = false) {
  if (!prices) return 0;
  
  const steps = isElite ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
  const weightToKey: Record<number, number> = isElite 
    ? { 3.5: 1, 7: 5, 14: 10, 28: 20 } 
    : { 1: 1, 5: 5, 10: 10, 20: 20 };

  const sortedSteps = steps.filter(s => prices[weightToKey[s]] > 0).sort((a, b) => a - b);
  
  if (sortedSteps.length === 0) return 0;
  if (weight <= sortedSteps[0]) return prices[weightToKey[sortedSteps[0]]] * (weight / sortedSteps[0]);
  
  for (let i = 0; i < sortedSteps.length - 1; i++) {
    const s1 = sortedSteps[i];
    const s2 = sortedSteps[i+1];
    if (weight >= s1 && weight <= s2) {
      const p1 = prices[weightToKey[s1]];
      const p2 = prices[weightToKey[s2]];
      return p1 + (p2 - p1) * ((weight - s1) / (s2 - s1));
    }
  }
  
  const lastStep = sortedSteps[sortedSteps.length - 1];
  return (prices[weightToKey[lastStep]] / lastStep) * weight;
}
