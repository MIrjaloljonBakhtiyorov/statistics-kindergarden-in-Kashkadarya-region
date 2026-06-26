import type { EvalStatus } from "../../types";

const CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: "Baholanmagan", bg: "#FEF9C3", color: "#92400E" },
  draft:     { label: "Ko'rib chiqilmoqda", bg: "#DBEAFE", color: "#1E40AF" },
  submitted: { label: "Yakuniy baholangan", bg: "#DCFCE7", color: "#14532D" },
  overdue:   { label: "Muddat tugagan", bg: "#FEE2E2", color: "#991B1B" },
};

interface Props {
  status: EvalStatus | "overdue" | string;
  size?: "sm" | "md";
}

export function ProjectStatusBadge({ status, size = "md" }: Props) {
  const cfg = CONFIG[status] ?? { label: status, bg: "#F3F4F6", color: "#374151" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: size === "sm" ? "2px 8px" : "3px 10px",
      borderRadius: 999, fontSize: size === "sm" ? 11 : 12,
      fontWeight: 600, background: cfg.bg, color: cfg.color,
      whiteSpace: "nowrap"
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: cfg.color, marginRight: 5, flexShrink: 0
      }} />
      {cfg.label}
    </span>
  );
}
