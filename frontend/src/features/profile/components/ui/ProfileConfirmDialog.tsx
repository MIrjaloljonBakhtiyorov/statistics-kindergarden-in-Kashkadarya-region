import { AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";

interface ProfileConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ProfileConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  variant = "warning",
}: ProfileConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => { onConfirm(); onClose(); };

  const variantStyles = {
    danger:  { icon: "bg-red-500/10 text-red-400",   btn: "bg-red-600 hover:bg-red-700" },
    warning: { icon: "bg-amber-500/10 text-amber-400", btn: "bg-amber-600 hover:bg-amber-700" },
    info:    { icon: "bg-blue-500/10 text-blue-400",  btn: "bg-blue-600 hover:bg-blue-700" },
  };
  const s = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0a1b30] border border-[rgba(112,145,190,.25)] rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-[#718096]"
          aria-label="Yopish"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className={`p-3 rounded-xl flex-shrink-0 ${s.icon}`}>
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <div className="text-sm text-[#aab6c9]">{message}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#07172b] border border-[rgba(112,145,190,.18)] rounded-lg hover:bg-[#0d223b] transition-colors text-sm font-medium text-[#aab6c9]"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white ${s.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
