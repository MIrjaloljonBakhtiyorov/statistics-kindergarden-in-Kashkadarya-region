import type { LucideIcon } from "lucide-react";

// ─── DATA TYPES ───────────────────────────────────────────────────────────────

export type InfoCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: "blue" | "purple" | "gold";
};

export type Step = {
  icon: LucideIcon;
  title: string;
  description?: string;
  number: number;
};

export type Direction = {
  id: string;
  icon: LucideIcon;
  title: string;
  color: string;
  description?: string;
};

export type StartupType = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export type Prize = {
  id: string;
  place: string;
  amount: string;
  description?: string;
  tone: "gold" | "silver" | "bronze" | "special";
  icon: LucideIcon;
  highlights?: string[];
};

export type ImportanceItem = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export type DateItem = {
  id: string;
  date: string;
  title: string;
  description?: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type NewsItem = {
  id: string;
  date: string;
  category: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  sourceUrl?: string;
};

// ─── UI COMPONENT TYPES ───────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "icon";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type SectionProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
};

export type SectionHeadProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  action?: React.ReactNode;
};
