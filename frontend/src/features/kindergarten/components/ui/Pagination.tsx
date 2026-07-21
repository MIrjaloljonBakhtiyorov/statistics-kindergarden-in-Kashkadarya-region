import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, pageSize, totalItems, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-brand-border bg-white/80 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-brand-muted">
        <span>{totalItems} ta yozuv</span>
        <span>1 sahifa</span>
      </div>
    );
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
        {start}-{end} / {totalItems} ta yozuv
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-muted transition-all hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Oldingi sahifa"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`h-9 min-w-9 rounded-xl px-3 text-[11px] font-black transition-all ${
              item === page
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                : 'border border-brand-border bg-white text-brand-muted hover:border-brand-primary hover:text-brand-primary'
            }`}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-muted transition-all hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Keyingi sahifa"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
