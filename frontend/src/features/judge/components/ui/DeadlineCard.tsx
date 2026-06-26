import { useEffect, useState } from "react";
import { Clock, Calendar } from "lucide-react";

interface Props {
  startDate?: string;
  endDate?: string;
  totalProjects?: number;
  doneProjects?: number;
}

function useCountdown(endDate?: string) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!endDate) return;
    const update = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTime({ days, hours, minutes, seconds, expired: false });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endDate]);

  return time;
}

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
}

export function DeadlineCard({ startDate, endDate, totalProjects = 0, doneProjects = 0 }: Props) {
  const countdown = useCountdown(endDate);
  const progress = totalProjects > 0 ? Math.round((doneProjects / totalProjects) * 100) : 0;

  return (
    <div style={{
      background: "white", borderRadius: 14, padding: "20px 24px",
      border: "1px solid #E4E7EC", boxShadow: "0 1px 8px rgba(0,0,0,0.05)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "#FFF7DF", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Clock size={16} color="#D6A21E" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>Baholash muddati</div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "#667085", marginBottom: 2 }}>Boshlanishi</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={12} color="#667085" /> {fmt(startDate)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "#667085", marginBottom: 2 }}>Yakunlanishi</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={12} color="#667085" /> {fmt(endDate)}
          </div>
        </div>
      </div>

      {endDate && !countdown.expired && (
        <div style={{
          background: "linear-gradient(135deg, #FFF7DF, #FFFBEE)",
          border: "1px solid #F0D882", borderRadius: 10, padding: "10px 14px",
          marginBottom: 12
        }}>
          <div style={{ fontSize: 11, color: "#92400E", marginBottom: 4, fontWeight: 600 }}>YAKUNLANISHIGA</div>
          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            {[
              { v: countdown.days, l: "kun" },
              { v: countdown.hours, l: "soat" },
              { v: countdown.minutes, l: "daqiqa" },
            ].map(({ v, l }) => (
              <div key={l} style={{ textAlign: "center" }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#D6A21E", fontVariantNumeric: "tabular-nums" }}>
                  {String(v).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 11, color: "#92400E", marginLeft: 2 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {countdown.expired && (
        <div style={{
          background: "#FEE2E2", border: "1px solid #FECACA",
          borderRadius: 10, padding: "8px 12px", marginBottom: 12,
          fontSize: 13, color: "#991B1B", fontWeight: 600
        }}>
          ⚠️ Baholash muddati tugadi
        </div>
      )}

      {/* Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#667085" }}>Baholash jarayoni</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#071B33" }}>{doneProjects}/{totalProjects}</span>
        </div>
        <div style={{ height: 6, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: progress === 100 ? "#16A34A" : "linear-gradient(90deg, #D6A21E, #b8850f)",
            borderRadius: 99, transition: "width 0.5s ease"
          }} />
        </div>
        <div style={{ fontSize: 11, color: "#667085", marginTop: 4 }}>{progress}% yakunlandi</div>
      </div>
    </div>
  );
}
