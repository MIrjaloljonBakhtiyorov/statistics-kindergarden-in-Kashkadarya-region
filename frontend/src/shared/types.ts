import type { LucideIcon } from "lucide-react";

export type AppView = "public" | "admin";
export type AuthMode = "login" | "register" | null;
export type RegisterStep = "phone" | "profile";
export type ParticipationType = "university" | "independent" | "team";

// ─── AUTH TYPES ───────────────────────────────────────────────────────────────

export type GoogleAuthState =
  | "idle"
  | "loading"
  | "authenticating"
  | "success"
  | "cancelled"
  | "error"
  | "blocked"
  | "existing_account";

export type GoogleAuthError =
  | "cancelled"
  | "token_exchange_failed"
  | "invalid_token"
  | "invalid_state"
  | "expired_state"
  | "invalid_request"
  | "no_id_token"
  | "no_payload"
  | "email_not_verified"
  | "account_blocked"
  | "email_exists"
  | "network"
  | "unknown";

export type GoogleUserInfo = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  profileStatus: "incomplete" | "complete" | "verified";
  isNew: boolean;
};
export type TeamFormat = "solo" | "group";

// ─── DATA TYPES ───────────────────────────────────────────────────────────────

export type InfoCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: "blue" | "purple" | "gold";
};

export type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description?: string;
};

export type Direction = {
  icon: LucideIcon;
  title: string;
  color: string;
  description?: string;
};

export type StartupType = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type AdminStat = {
  label: string;
  value: string;
  trend: string;
  tone: string;
};

export type AdminUser = {
  name: string;
  phone: string;
  role: string;
  source: string;
  status: string;
};

export type AdminApplication = {
  number: string;
  project: string;
  participant: string;
  direction: string;
  region: string;
  status: string;
  score: string;
};

export type AdminJudge = {
  name: string;
  field: string;
  assigned: number;
  done: number;
  status: string;
};

export type AdminStage = {
  title: string;
  date: string;
  owner: string;
  status: string;
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
  id: "application" | "selection" | "final" | "awards";
  date: string;
  title: string;
  description?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type NewsItem = {
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
