import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function ProfileModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  footer,
}: ProfileModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onMouseDown={onClose}
    >
      <div
        className={`relative w-full ${sizeMap[size]} bg-[#0a1b30] border border-[rgba(112,145,190,.25)] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[rgba(112,145,190,.15)] flex-shrink-0">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-[#aab6c9] mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#718096] hover:text-white flex-shrink-0"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[rgba(112,145,190,.15)] flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
