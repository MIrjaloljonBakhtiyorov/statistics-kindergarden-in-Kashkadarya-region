import { ReactNode } from "react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

export function AdminTable<T>({ columns, data, keyExtractor, emptyMessage = "Ma'lumot topilmadi", emptyIcon }: AdminTableProps<T>) {
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-6">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="py-12 text-center text-[var(--admin-text-muted)]">
          {emptyIcon && <div className="mb-4 flex justify-center opacity-50">{emptyIcon}</div>}
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
