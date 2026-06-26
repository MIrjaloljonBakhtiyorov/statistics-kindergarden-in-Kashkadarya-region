import { useState, ReactNode } from "react";
import { JudgeSidebar } from "./JudgeSidebar";
import { JudgeHeader } from "./JudgeHeader";

interface Props { children: ReactNode; pageTitle?: string; }

export function JudgeShell({ children, pageTitle }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="judge-shell min-h-screen" style={{ background: "#F5F7FA" }}>
      <style>{`
        .judge-shell {
          --j-navy: #071B33;
          --j-navy-dark: #031326;
          --j-gold: #D6A21E;
          --j-gold-light: #FFF7DF;
          --j-white: #FFFFFF;
          --j-bg: #F5F7FA;
          --j-text: #101828;
          --j-text-2: #667085;
          --j-border: #E4E7EC;
          --j-success: #16A34A;
          --j-warning: #D97706;
          --j-error: #DC2626;
          --j-info: #2563EB;
          --j-sidebar-w: 272px;
          --j-header-h: 72px;
          font-family: 'Inter', 'Manrope', system-ui, sans-serif;
        }
        .judge-shell * { box-sizing: border-box; }
        .judge-sidebar-collapsed { --j-sidebar-w: 80px; }
      `}</style>

      <JudgeSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(c => !c)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`transition-all duration-300 ${collapsed ? "judge-sidebar-collapsed" : ""}`}
        style={{ marginLeft: collapsed ? 80 : 272 }}
      >
        <JudgeHeader
          pageTitle={pageTitle}
          onMenuClick={() => setMobileOpen(o => !o)}
          onToggle={() => setCollapsed(c => !c)}
        />
        <main style={{ padding: "24px 32px", minHeight: "calc(100vh - 72px)" }}>
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
