import { Sparkles, Trophy, ArrowRight, ArrowRightIcon } from "lucide-react";
import type { SectionProps, CardProps, SectionHeadProps, ButtonVariant, ButtonSize } from "../../types";

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────

// 1. Container
export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

// 2. Section Wrapper
export function Section({ id, className = "", children }: SectionProps) {
  return (
    <section id={id} className={`py-20 lg:py-28 ${className}`}>
      {children}
    </section>
  );
}

// 3. Gradient Text
export function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 ${className}`}>
      {children}
    </span>
  );
}

// 4. Neon Glow Effect
export function NeonGlow({ color = "blue", className = "" }: { color?: "blue" | "purple" | "gold"; className?: string }) {
  const colors: Record<string, string> = {
    blue: "shadow-[0_0_40px_rgba(59,130,246,0.4)]",
    purple: "shadow-[0_0_40px_rgba(168,85,247,0.4)]",
    gold: "shadow-[0_0_40px_rgba(251,191,36,0.4)]"
  };

  return <div className={`${colors[color] ?? colors.blue} ${className}`} />;
}

// 5. Card Component
export function Card({ children, className = "", hover = false, glow = false }: CardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl
        transition-all duration-300
        ${hover ? "hover:border-white/20 hover:bg-white/10 hover:-translate-y-1" : ""}
        ${glow ? "shadow-[0_0_30px_rgba(139,92,246,0.15)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// 6. Section Head
export function SectionHead({ eyebrow, title, subtitle, align = "left", action }: SectionHeadProps) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"}`}>
      {eyebrow && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-sm font-semibold text-blue-300 uppercase tracking-wider">{eyebrow}</span>
        </div>
      )}
      
      <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      
      {subtitle && (
        <p className="max-w-2xl text-lg text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
      
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// 7. Button Component
export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-95";
  
  const variants: Record<string, string> = {
    primary: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 border border-white/10",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    outline: "bg-transparent border-2 border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-200",
    ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-white/5",
    icon: "p-2 bg-white/5 hover:bg-white/10 text-white rounded-full"
  };
  
  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// 8. Icon with Glow
export function IconWithGlow({ icon: Icon, color = "blue", size = 24, className = "" }: { 
  icon: React.ElementType; 
  color?: "blue" | "purple" | "gold"; 
  size?: number;
  className?: string;
}) {
  const glowColors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    purple: "bg-purple-500/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    gold: "bg-yellow-500/10 text-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
  };

  return (
    <div className={`p-3 rounded-2xl ${glowColors[color] ?? glowColors.blue} ${className}`}>
      <Icon size={size} />
    </div>
  );
}

// 9. Badge
export function Badge({ children, color = "blue", className = "" }: { children: React.ReactNode; color?: "blue" | "purple" | "gold"; className?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    gold: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[color] ?? colors.blue} ${className}`}>
      {children}
    </span>
  );
}

// 10. Marquee (for hero background)
export function Marquee({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative flex overflow-x-hidden ${className}`}>
      <div className="animate-marquee whitespace-nowrap">
        {children}
      </div>
    </div>
  );
}

// 11. Stats Chip
export function StatsChip({ icon: Icon, label, className = "" }: { icon: React.ElementType; label: string; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 ${className}`}>
      <Icon size={16} className="text-blue-400" />
      <span className="text-sm font-medium text-slate-300">{label}</span>
    </div>
  );
}

// 12. Timeline Connector
export function TimelineConnector() {
  return (
    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 via-indigo-500/30 to-transparent" />
  );
}

// 13. Floating Animation Wrapper
export function FloatWrapper({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div 
      className={`animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// 14. Grid Pattern Background
export function GridPattern({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-0 opacity-20 ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px'
      }}
    />
  );
}