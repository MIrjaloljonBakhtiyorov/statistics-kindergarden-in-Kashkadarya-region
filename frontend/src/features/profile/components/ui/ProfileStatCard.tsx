import type { LucideIcon } from "lucide-react";

export type StatCardColor =
  | "blue" | "green" | "purple" | "gold"
  | "cyan" | "red" | "amber" | "gray";

interface ProfileStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: StatCardColor;
  sub?: string;
}

const colorMap: Record<StatCardColor, { bg: string; border: string; icon: string }> = {
  blue:   { bg: "from-blue-500/10 to-blue-600/10",    border: "border-blue-500/20",    icon: "text-blue-400"   },
  green:  { bg: "from-green-500/10 to-green-600/10",  border: "border-green-500/20",   icon: "text-green-400"  },
  purple: { bg: "from-purple-500/10 to-purple-600/10",border: "border-purple-500/20",  icon: "text-purple-400" },
  gold:   { bg: "from-yellow-500/10 to-yellow-600/10",border: "border-yellow-500/20",  icon: "text-yellow-400" },
  cyan:   { bg: "from-cyan-500/10 to-cyan-600/10",    border: "border-cyan-500/20",    icon: "text-cyan-400"   },
  red:    { bg: "from-red-500/10 to-red-600/10",      border: "border-red-500/20",     icon: "text-red-400"    },
  amber:  { bg: "from-amber-500/10 to-amber-600/10",  border: "border-amber-500/20",   icon: "text-amber-400"  },
  gray:   { bg: "from-gray-500/10 to-gray-600/10",    border: "border-gray-500/20",    icon: "text-gray-400"   },
};

export function ProfileStatCard({
  label,
  value,
  icon: Icon,
  color = "blue",
  sub,
}: ProfileStatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-white/5 ${c.icon}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-[#aab6c9] font-medium">{label}</p>
      {sub && <p className="text-xs text-[#718096] mt-1">{sub}</p>}
    </div>
  );
}
