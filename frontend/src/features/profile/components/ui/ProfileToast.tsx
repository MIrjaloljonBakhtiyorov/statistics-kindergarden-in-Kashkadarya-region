import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// Simple global toast store
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notify(listeners: typeof toastListeners, newToasts: Toast[]) {
  toasts = newToasts;
  listeners.forEach((fn) => fn(newToasts));
}

export function showToast(message: string, type: ToastType = "info") {
  const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newToasts = [...toasts, { id, type, message }];
  notify(toastListeners, newToasts);
  setTimeout(() => {
    const filtered = toasts.filter((t) => t.id !== id);
    notify(toastListeners, filtered);
  }, 4000);
}

const iconMap: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={18} className="text-green-400 flex-shrink-0" />,
  error:   <XCircle    size={18} className="text-red-400 flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />,
  info:    <Info       size={18} className="text-blue-400 flex-shrink-0" />,
};

const bgMap: Record<ToastType, string> = {
  success: "border-green-500/30 bg-green-500/10",
  error:   "border-red-500/30 bg-red-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  info:    "border-blue-500/30 bg-blue-500/10",
};

export function ToastContainer() {
  const [list, setList] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setList);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setList);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3" aria-live="polite">
      {list.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-sm text-white max-w-sm ${bgMap[toast.type]}`}
          role="alert"
        >
          {iconMap[toast.type]}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => {
              const filtered = toasts.filter((t) => t.id !== toast.id);
              notify(toastListeners, filtered);
            }}
            className="text-[#718096] hover:text-white transition-colors"
            aria-label="Yopish"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
