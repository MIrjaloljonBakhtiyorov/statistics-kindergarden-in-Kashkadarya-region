import { 
  Menu, 
  X, 
  Plane, 
  User, 
  ArrowRight,
  ChevronRight,
  Menu as MenuIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/exports";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const navItems = [
  { name: "Bosh sahifa", href: "/#top" },
  { name: "Tanlov haqida", href: "/#about" },
  { name: "Yo'nalishlar", href: "/#directions" },
  { name: "Mukofotlar", href: "/#prizes" },
  { name: "Yangiliklar", href: "/#news" },
  { name: "FAQ", href: "/#faq" },
  { name: "Bog'lanish", href: "/#contact" }
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Sticky Navbar */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}
        `}
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
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
              <Button variant="outline" size="sm" className="!py-2 !px-5">
                <User size={16} />
                Kirish
              </Button>
              <Button variant="primary" size="sm" className="!py-2 !px-6">
                <Plane size={16} />
                Ro'yxatdan o'tish
              </Button>
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
            <div className="w-full max-w-[1920px] mx-auto px-4 py-6">
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
                <Button variant="outline" className="w-full justify-center">
                  <User size={18} />
                  Kirish
                </Button>
                <Button variant="primary" className="w-full justify-center">
                  <Plane size={18} />
                  Ro'yxatdan o'tish
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
