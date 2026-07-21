import React, { useEffect, useMemo, useState } from 'react';
import { useChildren } from '../hooks/useChildren';
import { Edit2, Trash2 } from 'lucide-react';
import { Pagination } from '../../../components/ui/Pagination';

const PAGE_SIZE = 20;

interface Props {
  onEdit?: (child: any) => void;
}

export const ChildrenTable: React.FC<Props> = ({ onEdit }) => {
  const { children, loading, deleteChild } = useChildren();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(children.length / PAGE_SIZE));
  const visibleChildren = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return children.slice(start, start + PAGE_SIZE);
  }, [children, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (loading) return <div className="p-8 text-center text-brand-muted font-bold">Yuklanmoqda...</div>;

  const handleDelete = async (id: string) => {
    await deleteChild(id);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 border-b border-brand-border text-[11px] text-brand-muted uppercase font-bold tracking-wider">
              <th className="px-4 py-4 w-12 text-center">№</th>
              <th className="px-4 py-4">Bolaning F.I.Sh</th>
              <th className="px-4 py-4">Passport / Guvohnoma</th>
              <th className="px-4 py-4">Otasining F.I.Sh va Tel</th>
              <th className="px-4 py-4">Onasining F.I.Sh va Tel</th>
              <th className="px-4 py-4">Guruhi</th>
              <th className="px-4 py-4">Tarbiyachi</th>
              <th className="px-4 py-4 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {children.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-4 text-center text-sm text-brand-muted">Hech qanday ma'lumot topilmadi.</td></tr>
            ) : (
              visibleChildren.map((child: any, index: number) => (
                <tr key={child.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-5 text-center text-xs font-bold text-brand-muted">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-5 font-black text-sm text-brand-depth">{child.first_name} {child.last_name}</td>
                  <td className="px-4 py-5 text-xs font-medium text-brand-muted">
                    {child.passport_info ? <div>P: {child.passport_info}</div> : null}
                    <div>G: {child.birth_certificate_number}</div>
                  </td>
                  <td className="px-4 py-5 text-xs font-medium text-brand-muted">
                    <div className="font-bold text-brand-depth">{child.father_name}</div>
                    <div>{child.father_phone}</div>
                  </td>
                  <td className="px-4 py-5 text-xs font-medium text-brand-muted">
                    <div className="font-bold text-brand-depth">{child.mother_name}</div>
                    <div>{child.mother_phone}</div>
                  </td>
                  <td className="px-4 py-5 text-sm font-medium text-brand-muted">{child.group_name || 'Guruhsiz'}</td>
                  <td className="px-4 py-5 text-sm font-medium text-brand-muted">{child.group_teacher || 'Tayinlanmagan'}</td>
                  <td className="px-4 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onEdit?.(child)}
                        className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(child.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50/50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} totalItems={children.length} onPageChange={setPage} />
    </div>
  );
};
