import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside ni handle qilish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'light' as const, label: 'Yorug\'', icon: Sun },
    { value: 'dark' as const, label: 'Qorong\'u', icon: Moon },
    { value: 'system' as const, label: 'Tizim', icon: Monitor },
  ];

  const currentOption = options.find(opt => opt.value === theme) || options[1];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 border border-white/10 dark:border-white/10 transition-all duration-200"
        title={`Mavzu: ${currentOption.label}`}
        aria-label="Mavzuni o'zgartirish"
      >
        <CurrentIcon size={20} className="text-gray-700 dark:text-gray-200" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-[#0a1b30] border border-gray-200 dark:border-[rgba(112,145,190,.18)] shadow-xl overflow-hidden z-50">
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }
                `}
              >
                <Icon size={16} />
                <span>{option.label}</span>
                {isActive && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
