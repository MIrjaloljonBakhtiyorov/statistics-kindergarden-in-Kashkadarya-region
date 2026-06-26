import { useEffect, useState } from 'react';
import { X, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const icons: Record<ToastType, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const styles: Record<ToastType, string> = {
  info: 'bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
  success: 'bg-green-500/10 dark:bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300',
  warning: 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
  error: 'bg-red-500/10 dark:bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
};

const iconColors: Record<ToastType, string> = {
  info: 'text-blue-500 dark:text-blue-400',
  success: 'text-green-500 dark:text-green-400',
  warning: 'text-amber-500 dark:text-amber-400',
  error: 'text-red-500 dark:text-red-400',
};

function Toast({ message, onClose }: ToastProps) {
  const Icon = icons[message.type];
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(message.id), 300);
    }, message.duration || 3000);

    return () => clearTimeout(timer);
  }, [message.id, message.duration, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        ${styles[message.type]}
        ${isExiting ? 'animate-out fade-out slide-out-to-right' : 'animate-in fade-in slide-in-from-right'}
        transition-all duration-300
      `}
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${iconColors[message.type]}`} />
      <p className="flex-1 text-sm font-medium">{message.message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(message.id), 300);
        }}
        className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast Container
interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ messages, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {messages.map((message) => (
          <Toast key={message.id} message={message} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

// Toast Manager Hook
let toastCounter = 0;
const toastListeners: Set<(messages: ToastMessage[]) => void> = new Set();
let toastMessages: ToastMessage[] = [];

export function useToastManager() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (newMessages: ToastMessage[]) => {
      setMessages(newMessages);
    };

    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  const removeToast = (id: string) => {
    toastMessages = toastMessages.filter((m) => m.id !== id);
    toastListeners.forEach((listener) => listener([...toastMessages]));
  };

  return { messages, removeToast };
}

// Global toast function
export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  const id = `toast-${++toastCounter}`;
  const newToast: ToastMessage = { id, message, type, duration };
  
  toastMessages = [...toastMessages, newToast];
  toastListeners.forEach((listener) => listener([...toastMessages]));
}
