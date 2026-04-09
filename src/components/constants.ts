// src/components/landing/constants.ts
import { Star, Flame, Crown, Percent, SendHorizontal, Phone, MessageCircle, Instagram } from "lucide-react";

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
