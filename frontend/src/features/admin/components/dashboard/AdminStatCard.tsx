import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { StatCardData } from "../../data/dashboard";

interface AdminStatCardProps {
  data: StatCardData;
}

const colorClasses = {
  blue: "from-blue-500/10 to-blue-600/10 border-blue-500/20",
  green: "from-green-500/10 to-green-600/10 border-green-500/20",
  purple: "from-purple-500/10 to-purple-600/10 border-purple-500/20",
  gold: "from-yellow-500/10 to-yellow-600/10 border-yellow-500/20",
  cyan: "from-cyan-500/10 to-cyan-600/10 border-cyan-500/20",
  red: "from-red-500/10 to-red-600/10 border-red-500/20",
};

export function AdminStatCard({ data }: AdminStatCardProps) {
  const TrendIcon = data.trend === "up" ? TrendingUp : data.trend === "down" ? TrendingDown : Minus;
  const trendColor = data.trend === "up" ? "text-green-400" : data.trend === "down" ? "text-red-400" : "text-gray-400";

  return (
    <div
      className={`
        bg-gradient-to-br ${colorClasses[data.color]}
        border rounded-2xl p-5 hover:scale-[1.02] transition-transform
      `}
    >
      <p className="text-xs text-[var(--admin-text-muted)] font-medium mb-3">
        {data.title}
      </p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white mb-1">{data.value}</p>
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <TrendIcon size={16} />
            <span>{data.change}</span>
          </div>
        </div>
        {/* Sparkline placeholder */}
        <div className="w-16 h-12 opacity-50">
          <svg viewBox="0 0 60 40" className="w-full h-full">
            <polyline
              points="0,30 15,25 30,28 45,15 60,18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={trendColor}
            />
          </svg>
        </div>
      </div>
      <p className="text-xs text-[var(--admin-text-muted)] mt-3">O'tgan oyga nisbatan</p>
    </div>
  );
}
