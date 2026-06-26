import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { AdminEmptyState } from "../components/ui/AdminEmptyState";
import { LucideIcon } from "lucide-react";

interface AdminPageTemplateProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}

export function AdminPageTemplate({
  title,
  subtitle,
  icon: Icon,
  emptyTitle,
  emptyDescription,
}: AdminPageTemplateProps) {
  return (
    <AdminShell>
      <AdminPageHeader title={title} subtitle={subtitle} />
      
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6 min-h-[500px]">
        <AdminEmptyState
          icon={Icon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    </AdminShell>
  );
}
