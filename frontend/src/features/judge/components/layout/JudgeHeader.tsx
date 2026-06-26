import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, ChevronDown, User, BookOpen, Lock, LogOut, Search } from "lucide-react";
import { useJudgeAuth } from "../../context/JudgeAuthContext";

interface Props {
  pageTitle?: string;
  onMenuClick: () => void;
  onToggle: () => void;
}

export function JudgeHeader({ pageTitle, onMenuClick }: Props) {
  const { judge, logout } = useJudgeAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();

  const fullName = judge ? `${judge.lastName} ${judge.firstName}` : "Hakam";
  const initials = judge
    ? `${judge.lastName?.[0] ?? ""}${judge.firstName?.[0] ?? ""}`
    : "H";

  return (
    <header style={{
      height: 72, background: "white", display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 32px",
      borderBottom: "1px solid #E4E7EC",
      position: "sticky", top: 0, zIndex: 30,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onMenuClick} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#667085", padding: 6, borderRadius: 8,
          display: "flex", alignItems: "center"
        }}>
          <Menu size={20} />
        </button>
        {pageTitle && (
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: 0 }}>
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Search */}
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#667085", padding: 8, borderRadius: 8,
          display: "flex", alignItems: "center"
        }}>
          <Search size={18} />
        </button>

        {/* Notifications */}
        <Link to="/judge/notifications" style={{
          position: "relative", padding: 8, borderRadius: 8,
          color: "#667085", display: "flex", alignItems: "center",
          textDecoration: "none"
        }}>
          <Bell size={18} />
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 8, height: 8, borderRadius: "50%",
            background: "#DC2626", border: "2px solid white"
          }} />
        </Link>

        {/* Profile dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "none", border: "1px solid #E4E7EC",
              borderRadius: 10, padding: "6px 12px", cursor: "pointer"
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #071B33, #1a3a5c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#D6A21E", fontWeight: 700, fontSize: 13, flexShrink: 0
            }}>
              {judge?.avatarUrl
                ? <img src={judge.avatarUrl} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} alt="" />
                : initials}
            </div>
            <div style={{ textAlign: "left", display: "none" }} className="sm-show">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#101828", lineHeight: 1.2 }}>{fullName}</div>
              <div style={{ fontSize: 11, color: "#667085" }}>Hakam</div>
            </div>
            <ChevronDown size={14} color="#667085" />
          </button>

          {dropOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setDropOpen(false)} />
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "white", border: "1px solid #E4E7EC",
                borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                minWidth: 200, zIndex: 100, overflow: "hidden"
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #E4E7EC" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>{fullName}</div>
                  <div style={{ fontSize: 12, color: "#667085" }}>Hakam · {judge?.organization}</div>
                </div>
                {[
                  { label: "Profilim", path: "/judge/profile", icon: User },
                  { label: "Yo'riqnoma", path: "/judge/guidelines", icon: BookOpen },
                  { label: "Parolni almashtirish", path: "/judge/change-password", icon: Lock },
                ].map(item => (
                  <Link key={item.path} to={item.path}
                    onClick={() => setDropOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 16px", color: "#344054",
                      textDecoration: "none", fontSize: 13,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <item.icon size={15} color="#667085" />
                    {item.label}
                  </Link>
                ))}
                <div style={{ borderTop: "1px solid #E4E7EC" }}>
                  <button onClick={() => { setDropOpen(false); logout().then(() => navigate("/judge/login")); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 16px", color: "#DC2626",
                      background: "none", border: "none", width: "100%",
                      cursor: "pointer", fontSize: 13, textAlign: "left"
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <LogOut size={15} />
                    Tizimdan chiqish
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
