import { X, AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  variant = "warning",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-[var(--admin-bg)] rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div
            className={`p-3 rounded-xl ${
              variant === "danger"
                ? "bg-red-500/10 text-red-400"
                : variant === "warning"
                ? "bg-amber-500/10 text-amber-400"
                : "bg-blue-500/10 text-blue-400"
            }`}
          >
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <div className="text-sm text-[var(--admin-text-secondary)]">{message}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
