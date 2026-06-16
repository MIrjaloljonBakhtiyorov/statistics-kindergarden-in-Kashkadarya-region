import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn } from 'lucide-react';
import { clsx } from 'clsx';

type PreviewBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type FoodImagePreviewProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  previewImageClassName?: string;
  label?: string;
  focusable?: boolean;
};

const clamp = (value: number, min: number, max: number) => {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
};

const getPreviewBox = (element: HTMLElement): PreviewBox => {
  const rect = element.getBoundingClientRect();
  const margin = 14;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isCompact = viewportWidth < 768;
  const maxWidth = Math.max(180, viewportWidth - margin * 2);
  const maxHeight = Math.max(180, viewportHeight - margin * 2);
  const width = Math.min(maxWidth, isCompact ? 360 : 430, Math.max(260, rect.width * 2.35));
  const height = Math.min(maxHeight, isCompact ? 360 : 340, Math.max(210, rect.height * 2.2));

  if (isCompact) {
    return {
      left: (viewportWidth - width) / 2,
      top: (viewportHeight - height) / 2,
      width,
      height,
    };
  }

  const rightSide = rect.right + 16;
  const leftSide = rect.left - width - 16;
  const left = rightSide + width <= viewportWidth - margin
    ? rightSide
    : leftSide >= margin
      ? leftSide
      : clamp(rect.left + rect.width / 2 - width / 2, margin, viewportWidth - width - margin);

  return {
    left,
    top: clamp(rect.top + rect.height / 2 - height / 2, margin, viewportHeight - height - margin),
    width,
    height,
  };
};

export const FoodImagePreview = ({
  src,
  alt,
  className,
  imageClassName,
  previewImageClassName,
  label,
  focusable = true,
}: FoodImagePreviewProps) => {
  const [previewBox, setPreviewBox] = useState<PreviewBox | null>(null);
  const imageSrc = String(src || '').trim();

  if (!imageSrc) return null;

  const showPreview = (element: HTMLElement) => setPreviewBox(getPreviewBox(element));
  const hidePreview = () => setPreviewBox(null);

  return (
    <>
      <span
        className={clsx(
          'group/food-preview relative block overflow-hidden bg-slate-100 outline-none',
          className
        )}
        onMouseEnter={(event) => showPreview(event.currentTarget)}
        onMouseLeave={hidePreview}
        onFocus={(event) => showPreview(event.currentTarget)}
        onBlur={hidePreview}
        tabIndex={focusable ? 0 : undefined}
      >
        <img
          src={imageSrc}
          alt={alt}
          className={clsx('h-full w-full transition-transform duration-500', imageClassName)}
        />
        <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl border border-white/70 bg-white/85 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover/food-preview:opacity-100 group-focus/food-preview:opacity-100">
          <ZoomIn size={15} />
        </span>
      </span>

      {previewBox && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none rounded-[1.5rem] border border-white/80 bg-white p-2 shadow-[0_24px_80px_rgba(15,23,42,0.35)]"
          style={{
            left: previewBox.left,
            top: previewBox.top,
            width: previewBox.width,
            height: previewBox.height,
          }}
        >
          <img
            src={imageSrc}
            alt=""
            className={clsx('h-full w-full rounded-[1.1rem] bg-slate-100 object-contain', previewImageClassName)}
          />
          {label && (
            <span className="absolute bottom-4 left-4 right-4 rounded-2xl bg-slate-950/80 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
              {label}
            </span>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
