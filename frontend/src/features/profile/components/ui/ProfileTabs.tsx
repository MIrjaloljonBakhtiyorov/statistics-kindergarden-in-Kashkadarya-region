import type { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function ProfileTabs({ tabs, activeTab, onTabChange, className = "" }: ProfileTabsProps) {
  return (
    <div
      className={`flex gap-1 bg-[#07172b] border border-[rgba(112,145,190,.18)] rounded-xl p-1 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center
            ${activeTab === tab.id
              ? "bg-blue-600 text-white shadow-sm"
              : "text-[#aab6c9] hover:text-white hover:bg-white/5"}
          `}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge !== undefined && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
              activeTab === tab.id ? "bg-white/20 text-white" : "bg-white/10 text-[#aab6c9]"
            }`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
