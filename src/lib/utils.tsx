import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as React from "react"
import { Percent, Star, Flame, Crown, SendHorizontal, Phone, MessageCircle, Instagram } from "lucide-react"

/**
 * Утилита для объединения Tailwind классов
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Функция генерации абсолютных URL для robots.ts и sitemap
 */
export function absoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bnd.delivery"
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

// --- КОНСТАНТЫ ---
export const SELECTED_COLOR = "#2DD4BF"; 
export const IMPORT_COLOR = "#60A5FA";
export const CONCENTRATES_COLOR = "#F59E0B"; 

export const GRADES = [
  { id: "silver", title: "SILVER GRADE", color: "#C1C1C1", icon: Percent },
  { id: "golden", title: "GOLDEN GRADE", color: "#FEC107", icon: Star },
  { id: "premium", title: "PREMIUM GRADE", color: "#34D399", icon: Flame },
  { id: "selected", title: "SELECTED GRADE", color: "#A855F7", icon: Crown }
];

export const CONTACT_METHODS = [
  { id: "telegram", label: "Telegram", icon: SendHorizontal, phKey: "contactPh" },
  { id: "whatsapp", label: "WhatsApp", icon: Phone, phKey: "contactPh" },
  { id: "line", label: "Line", icon: MessageCircle, phKey: "contactPh" },
  { id: "instagram", label: "Instagram", icon: Instagram, phKey: "contactPh" },
];

export const TYPE_COLORS: Record<string, string> = { 
  "indica": "#A855F7", 
  "sativa": "#FBBF24", 
  "hybrid": "#2DD4BF" 
};

// --- HELPERS ---
export const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
    const haptic = (window as any).Telegram.WebApp.HapticFeedback;
    if (type === 'success') haptic.notificationOccurred('success');
    else haptic.impactOccurred(type);
  }
};

export const isElite = (product: any) => {
  const sub = product?.subcategory?.toLowerCase() || "";
  return sub.includes('exclusive') || sub.includes('import');
};

export const getInterpolatedPrice = (weight: number, prices: any, isEliteProduct: boolean) => {
  if (!prices) return 0;
  if (isEliteProduct) {
    const eliteMap: Record<number, number> = { 3.5: 1, 7: 5, 14: 10, 28: 20 };
    const steps = [3.5, 7, 14, 28];
    const baseTier = [...steps].reverse().find(s => s <= weight) || 3.5;
    const priceAtTier = Number(prices[eliteMap[baseTier]]) || 0;
    return priceAtTier > 0 ? (priceAtTier / baseTier) * weight : 0;
  }
  const tiers = [1, 5, 10, 20];
  const lowerTier = [...tiers].reverse().find(t => t <= weight) || 1;
  const upperTier = tiers.find(t => t > weight) || 20;
  const val1 = Number(prices[lowerTier]) || 0;
  const val2 = Number(prices[upperTier]) || val1; 
  if (val1 === 0) return 0;
  if (lowerTier === upperTier || val1 === val2) return (val1 / lowerTier) * weight;
  return val1 + (val2 - val1) * ((weight - lowerTier) / (upperTier - lowerTier));
};

export const getFirstAvailablePrice = (product: any) => {
  const isEliteProduct = isElite(product);
  const steps = isEliteProduct ? [3.5, 7, 14, 28] : [1, 5, 10, 20];
  const keyMap: Record<number, number> = isEliteProduct ? { 3.5: 1, 7: 5, 14: 10, 28: 20 } : { 1: 1, 5: 5, 10: 10, 20: 20 };
  for (let w of steps) {
    const price = Number(product.prices?.[keyMap[w]]) || 0;
    if (price > 0) return { price: Math.round(price), weight: w };
  }
  return { price: 0, weight: 0 };
};

// Компонент иконки бата. Работает только в .tsx файлах
export const Baht = ({ className = "" }: { className?: string }) => (
  <span className={`inline-block text-[0.85em] -translate-y-[0.05em] ml-0.5 font-sans ${className}`}>฿</span>
);
