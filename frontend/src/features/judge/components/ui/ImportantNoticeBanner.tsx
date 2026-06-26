import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";

export function ImportantNoticeBanner() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("judge-notice-dismissed") === "1"
  );

  if (dismissed) return null;

  return (
    <div style={{
      background: "#FFF7DF", border: "1px solid #F0D882",
      borderRadius: 12, padding: "14px 18px",
      display: "flex", alignItems: "flex-start", gap: 14,
      marginBottom: 24
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: "#FEF3C7", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0
      }}>
        <ShieldCheck size={20} color="#D6A21E" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#92400E", marginBottom: 2 }}>
          Muhim eslatma
        </div>
        <div style={{ fontSize: 13, color: "#78350F", lineHeight: 1.5 }}>
          Har bir loyiha <strong>xolis, mustaqil va maxfiy</strong> ravishda baholanishi shart.
          Boshqa hakamlarning ballari va xulosalari sizga ko'rsatilmaydi.
        </div>
      </div>
      <button
        onClick={() => { setDismissed(true); sessionStorage.setItem("judge-notice-dismissed", "1"); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#92400E", padding: 2 }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
