import { 
  Menu, 
  X, 
  Plane, 
  User, 
  ChevronRight,
  Menu as MenuIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "../../../shared/components/ThemeToggle";
import { ToastContainer, useToastManager } from "../../../shared/components/Toast";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const navItems = [
  { name: "Bosh sahifa", href: "/#top" },
  { name: "Tanlov haqida", href: "/#about" },
  { name: "Yo'nalishlar", href: "/#directions" },
  { name: "Mukofotlar", href: "/#prizes" },
  { name: "Bog'lanish", href: "/#contact" }
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

type NavbarProps = {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
};

export function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { messages, removeToast } = useToastManager();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const openLogin = () => {
    closeMobileMenu();
    onLoginClick?.();
  };
  const openRegister = () => {
    closeMobileMenu();
    onRegisterClick?.();
  };

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer messages={messages} onClose={removeToast} />
      
      {/* Sticky Navbar */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? "bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-white/10 dark:border-white/10" 
            : "bg-transparent"
          }
        `}
      >
        <div className="mx-auto w-[90%]">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <a href="/#top" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-xl font-bold text-white shadow-xl">
                  Q
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-white leading-none">
                  Qashqadaryo<span className="text-blue-400">Startup</span>
                </div>
                <div className="text-xs font-medium text-slate-400">Ligasi</div>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group relative px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:text-white"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <button type="button" onClick={openLogin} className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-500/50 bg-transparent px-5 py-2 text-sm font-semibold text-blue-300 transition-all duration-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200 active:scale-95">
                <User size={16} />
                Kirish
              </button>
              <button onClick={openRegister} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:shadow-blue-500/40 active:scale-95">
                <Plane size={16} />
                Ro'yxatdan o'tish
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 right-0 lg:hidden z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 animate-in slide-in-from-top-5 duration-200">
            <div className="mx-auto w-[90%] py-6">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
                  >
                    {item.name}
                    <ChevronRight size={18} className="text-slate-500" />
                  </a>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6">
                <button type="button" onClick={openLogin} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-500/50 bg-transparent px-6 py-3 font-semibold text-blue-300 transition-all duration-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200">
                  <User size={18} />
                  Kirish
                </button>
                <button onClick={openRegister} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500">
                  <Plane size={18} />
                  Ro'yxatdan o'tish
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
