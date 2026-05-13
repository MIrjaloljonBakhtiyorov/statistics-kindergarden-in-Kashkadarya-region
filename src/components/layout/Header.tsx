import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe, LogIn, Menu, X } from 'lucide-react';
import { languages } from '../../constants';

interface HeaderProps {
  isLangOpen: boolean;
  setIsLangOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  langRef: React.RefObject<HTMLDivElement>;
  langBtnRef: React.RefObject<HTMLButtonElement>;
  mobileMenuBtnRef: React.RefObject<HTMLButtonElement>;
  mobileMenuRef: React.RefObject<HTMLDivElement>;
  menuItems: any[];
  notify: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isLangOpen,
  setIsLangOpen,
  isMobileMenuOpen,
  setIsMenuOpen,
  langRef,
  langBtnRef,
  mobileMenuBtnRef,
  mobileMenuRef,
  menuItems,
  notify,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (path.startsWith('/admin') || path.startsWith('/kindergarten')) {
      window.location.href = path;
    } else {
      navigate(path);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('/viloyat-statistikasi')}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg border border-indigo-400/20">R</div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg md:text-2xl leading-none select-none flex items-baseline font-black text-black">
              <span className="text-base md:text-lg">RAQAMLI</span>
              <span className="text-sm md:text-base ml-1">MTT</span>
            </h1>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white p-1.5 rounded-2xl">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center px-5 py-2.5 rounded-xl text-[15px] font-bold transition-all duration-300 ${
                location.pathname === item.path
                  ? 'text-indigo-600 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <item.icon className={`mr-2.5 h-4 w-4 ${location.pathname === item.path ? 'text-indigo-500' : 'text-slate-400'}`} />
              {item.name}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="relative" ref={langRef}>
            <button 
              ref={langBtnRef}
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <Globe className="h-4 w-4 text-indigo-500" />
              <span>UZ</span>
            </button>
            
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      notify();
                      setIsLangOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <LogIn className="h-4 w-4" />
            <span>KIRISH</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          ref={mobileMenuBtnRef}
          onClick={() => setIsMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600 active:scale-95 transition-transform"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-2xl animate-in slide-in-from-top duration-300 z-50">
          <div className="p-4 grid grid-cols-1 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  handleNavigation(item.path);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center px-5 py-4 rounded-xl text-sm font-bold transition-all ${
                  location.pathname === item.path
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${location.pathname === item.path ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </button>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setIsLangOpen(!isLangOpen);
                }}
                className="flex items-center justify-between px-5 py-4 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-indigo-500" />
                  <span>TILNI TANLASH</span>
                </div>
                <span className="text-indigo-600">UZ</span>
              </button>
              
              {isLangOpen && (
                <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        notify();
                        setIsLangOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-3 text-xs font-bold text-slate-600 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}

              <button 
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-3 px-5 py-4 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
              >
                <LogIn className="h-5 w-5" />
                <span>KIRISH</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

