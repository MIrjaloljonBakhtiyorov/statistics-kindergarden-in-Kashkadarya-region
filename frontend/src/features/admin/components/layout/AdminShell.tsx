import { useState, ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="admin-shell min-h-screen bg-[#03101f] text-white">
      <style>{`
        .admin-shell {
          --admin-bg: #03101f;
          --admin-bg-secondary: #06172b;
          --admin-sidebar: #041428;
          --admin-surface: #0a1b30;
          --admin-surface-2: #0d223b;
          --admin-border: rgba(112, 145, 190, 0.18);
          --admin-border-strong: rgba(71, 118, 255, 0.42);
          --admin-text-primary: #f8fafc;
          --admin-text-secondary: #aab6c9;
          --admin-text-muted: #718096;
          --admin-blue: #2f7df6;
          --admin-cyan: #22b7ff;
          --admin-green: #2ed57a;
          --admin-purple: #a855f7;
          --admin-gold: #f5b942;
          --admin-red: #ef4f65;
        }
      `}</style>

      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "280px",
        }}
      >
        {/* Topbar */}
        <AdminTopbar
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileSidebarToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
