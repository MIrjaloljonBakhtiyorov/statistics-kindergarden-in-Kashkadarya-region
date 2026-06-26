import { ReactNode } from "react";

interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: string; // color for icon bg
  trend?: string;
}

export function JudgeStatCard({ title, value, subtitle, icon, accent = "#071B33" }: Props) {
  return (
    <div style={{
      background: "white", borderRadius: 14, padding: "20px 24px",
      border: "1px solid #E4E7EC",
      boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      display: "flex", alignItems: "flex-start", gap: 16
    }}>
      {icon && (
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: accent + "15",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0
        }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#667085", marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#101828", lineHeight: 1 }}>{value}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: "#667085", marginTop: 4 }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
