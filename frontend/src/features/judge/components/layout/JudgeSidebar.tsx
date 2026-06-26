import { useLocation, Link } from "react-router-dom";
import {
  Trophy, LayoutDashboard, FolderOpen, Clock, CheckCircle2,
  BookOpen, User, Bell, HelpCircle, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import { useJudgeAuth } from "../../context/JudgeAuthContext";

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

const NAV = [
  { group: "ASOSIY", items: [
    { id: "dashboard", label: "Bosh sahifa", path: "/judge/dashboard", icon: LayoutDashboard },
  ]},
  { group: "LOYIHALAR", items: [
    { id: "projects", label: "Menga biriktirilgan", path: "/judge/projects", icon: FolderOpen },
    { id: "pending", label: "Baholanmagan", path: "/judge/projects/pending", icon: Clock },
    { id: "completed", label: "Yakunlangan baholar", path: "/judge/evaluations/completed", icon: CheckCircle2 },
  ]},
  { group: "BAHOLASH", items: [
    { id: "guidelines", label: "Mezonlar va yo'riqnoma", path: "/judge/guidelines", icon: BookOpen },
  ]},
  { group: "HAKAM PROFILI", items: [
    { id: "profile", label: "Shaxsiy profil", path: "/judge/profile", icon: User },
  ]},
];

const BOTTOM_NAV = [
  { id: "notifications", label: "Bildirishnomalar", path: "/judge/notifications", icon: Bell },
  { id: "help", label: "Yordam", path: "/judge/help", icon: HelpCircle },
];

export function JudgeSidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: Props) {
  const location = useLocation();
  const { logout, judge } = useJudgeAuth();

  const isActive = (path: string) => {
    if (path === "/judge/dashboard") return location.pathname === "/judge/dashboard";
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{
        height: 72, display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? "0 20px" : "0 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #D6A21E, #b8850f)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Trophy size={20} color="white" />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>QASHQADARYO</div>
              <div style={{ color: "#D6A21E", fontWeight: 600, fontSize: 10, lineHeight: 1.2 }}>STARTAP LIGASI</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #D6A21E, #b8850f)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Trophy size={20} color="white" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {NAV.map(group => (
          <div key={group.group} style={{ marginBottom: 8 }}>
            {!collapsed && (
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.35)", padding: "8px 10px 4px"
              }}>{group.group}</div>
            )}
            {group.items.map(item => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link key={item.id} to={item.path} onClick={onMobileClose}
                  title={collapsed ? item.label : ""}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start",
                    padding: collapsed ? "10px" : "9px 12px",
                    borderRadius: 10, marginBottom: 2, textDecoration: "none",
                    background: active ? "linear-gradient(135deg, #D6A21E22, #D6A21E15)" : "transparent",
                    border: active ? "1px solid #D6A21E55" : "1px solid transparent",
                    color: active ? "#D6A21E" : "rgba(255,255,255,0.65)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {BOTTOM_NAV.map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={item.path} onClick={onMobileClose}
              title={collapsed ? item.label : ""}
              style={{
                display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "10px" : "9px 12px",
                borderRadius: 10, marginBottom: 2, textDecoration: "none",
                color: "rgba(255,255,255,0.5)", transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "white"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>}
            </Link>
          );
        })}

        <button onClick={() => logout()}
          title={collapsed ? "Tizimdan chiqish" : ""}
          style={{
            display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "10px" : "9px 12px",
            borderRadius: 10, width: "100%", border: "none", cursor: "pointer",
            background: "transparent", color: "rgba(220,38,38,0.7)", transition: "all 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.1)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(220,38,38,0.7)"; }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>Tizimdan chiqish</span>}
        </button>

        {/* Collapse toggle */}
        <button onClick={onToggle}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "8px", borderRadius: 10, width: "100%", border: "none",
            cursor: "pointer", background: "transparent",
            color: "rgba(255,255,255,0.3)", marginTop: 4,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span style={{ fontSize: 11, marginLeft: 6 }}>Yig'ish</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100vh",
        width: collapsed ? 80 : 272, background: "#071B33",
        display: "flex", flexDirection: "column", zIndex: 40,
        transition: "width 0.3s ease",
        boxShadow: "2px 0 20px rgba(0,0,0,0.15)"
      }} className="hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100vh",
        width: 272, background: "#071B33",
        display: "flex", flexDirection: "column", zIndex: 50,
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
        boxShadow: "2px 0 20px rgba(0,0,0,0.3)"
      }} className="flex lg:hidden">
        <SidebarContent />
      </aside>
    </>
  );
}
