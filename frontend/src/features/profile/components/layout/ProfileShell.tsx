import { useState, type ReactNode } from "react";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileTopbar } from "./ProfileTopbar";

interface ProfileShellProps {
  children: ReactNode;
}

export function ProfileShell({ children }: ProfileShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="profile-shell min-h-screen bg-[#03101f] text-white"
    >
      <style>{`
        .profile-shell {
          --p-bg: #03101f;
          --p-bg2: #07172b;
          --p-sidebar: #041428;
          --p-surface: #0a1b30;
          --p-surface2: #0d223b;
          --p-border: rgba(112,145,190,.18);
          --p-border-strong: rgba(71,118,255,.42);
          --p-text: #f8fafc;
          --p-text2: #aab6c9;
          --p-muted: #718096;
          --p-blue: #2f7df6;
          --p-cyan: #22b7ff;
          --p-green: #2ed57a;
          --p-purple: #a855f7;
          --p-gold: #f5b942;
          --p-red: #ef4f65;
        }

        .light .profile-shell {
          --p-bg: #f4f7fb;
          --p-bg2: #ffffff;
          --p-sidebar: #ffffff;
          --p-surface: #f8fafc;
          --p-surface2: #eef4fb;
          --p-border: rgba(15, 23, 42, .12);
          --p-border-strong: rgba(37, 99, 235, .35);
          --p-text: #0f172a;
          --p-text2: #334155;
          --p-muted: #64748b;
          background: var(--p-bg) !important;
          color: var(--p-text) !important;
        }

        .light .profile-shell [class*="bg-[#03101f]"] {
          background: #f4f7fb !important;
        }

        .light .profile-shell [class*="bg-[#041428]"],
        .light .profile-shell [class*="bg-[#07172b]"] {
          background: #f8fafc !important;
        }

        .light .profile-shell [class*="bg-[#0a1b30]"],
        .light .profile-shell [class*="bg-[#0d223b]"] {
          background: #ffffff !important;
        }

        .light .profile-shell [class*="border-[rgba(112,145,190"] {
          border-color: rgba(15, 23, 42, .12) !important;
        }

        .light .profile-shell [class*="text-white"] {
          color: #0f172a !important;
        }

        .light .profile-shell [class*="text-[#aab6c9]"] {
          color: #334155 !important;
        }

        .light .profile-shell [class*="text-[#718096]"] {
          color: #64748b !important;
        }

        .light .profile-shell [class*="bg-blue-600"],
        .light .profile-shell [class*="bg-green-600"],
        .light .profile-shell [class*="bg-red-500"] {
          color: #ffffff !important;
        }

        .light .profile-shell [class*="bg-blue-600"] *,
        .light .profile-shell [class*="bg-green-600"] *,
        .light .profile-shell [class*="bg-red-500"] * {
          color: #ffffff !important;
        }

        .light .profile-shell input,
        .light .profile-shell select,
        .light .profile-shell textarea {
          color: #0f172a !important;
        }

        .light .profile-shell input::placeholder,
        .light .profile-shell textarea::placeholder {
          color: #94a3b8 !important;
        }
      `}</style>

      {/* Sidebar */}
      <ProfileSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        <ProfileTopbar onMenuToggle={() => setSidebarOpen((v) => !v)} />

        <main className="flex-1 p-5 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
