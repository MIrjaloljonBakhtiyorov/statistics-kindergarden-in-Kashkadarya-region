/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BarChart3, Map, Menu, ShoppingCart, ChefHat, Trophy } from 'lucide-react';
import '@/lib/i18n';
import WelcomeScreen from './components/WelcomeScreen';

// New Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MTTDetailModal from './components/modals/MTTDetailModal';
import Notification from './components/ui/Notification';

const TaomnomaNazorati = lazy(() => import('./components/TaomnomaNazorati'));
const RetseptlarKitobi = lazy(() => import('./components/RetseptlarKitobi'));
const MahsulotSarfi = lazy(() => import('./components/MahsulotSarfi'));
const MTTReyting = lazy(() => import('./components/MTTReyting'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const ViloyatStatistikasi = lazy(() => import('./components/dashboard/ViloyatStatistikasi'));
const TumanStatistikasi = lazy(() => import('./components/dashboard/TumanStatistikasi'));

function RouteFallback() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isMobileMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { t, i18n } = useTranslation();
  const [selectedMTTType, setSelectedMTTType] = useState<any>(null);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'uz-lat');

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => setCurrentLang(lng);
    i18n.on('languageChanged', handleLanguageChanged);
    return () => { i18n.off('languageChanged', handleLanguageChanged); };
  }, [i18n]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  
  const langRef = useRef<HTMLDivElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (langRef.current && !langRef.current.contains(target) && 
          langBtnRef.current && !langBtnRef.current.contains(target)) {
        setIsLangOpen(false);
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target) && 
          mobileMenuBtnRef.current && !mobileMenuBtnRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      
      if (modalRef.current && !modalRef.current.contains(target)) {
        setSelectedMTTType(null);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedMTTType(null);
        setIsLangOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const notify = () => {
    setShowNotification(false);
    setTimeout(() => setShowNotification(true), 50);
  };

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  if (!isLoggedIn) {
    return <WelcomeScreen onEnter={() => setIsLoggedIn(true)} />;
  }

  const menuItems = [
    { name: 'menu.viloyat', icon: BarChart3, path: '/viloyat-statistikasi' },
    { name: 'menu.tumanlar', icon: Map, path: '/tumanlar-statistikasi' },
    { name: 'menu.mahsulot', icon: ShoppingCart, path: '/mahsulot-sarfi' },
    { name: 'menu.reyting', icon: Trophy, path: '/mtt-reyting' },
    { name: 'menu.taomnoma', icon: Menu, path: '/taomnoma-nazorati' },
    { name: 'menu.retseptlar', icon: ChefHat, path: '/retseptlar-kitobi' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-[2rem] shadow-2xl border border-slate-100 min-w-[200px] relative z-[100] dark:bg-slate-900/95 dark:border-slate-700">
          <p className="font-black text-slate-900 text-lg mb-3 border-b border-slate-100 pb-3 dark:text-white dark:border-slate-700">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 py-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{entry.name}</span>
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white">{entry.value}{entry.name.toLowerCase().includes('davomat') ? '%' : ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-white text-slate-950 transition-colors duration-700 dark:bg-slate-950 dark:text-slate-100">
      {!isLoginPage && (
        <Header 
          isLangOpen={isLangOpen}
          setIsLangOpen={setIsLangOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          langRef={langRef}
          langBtnRef={langBtnRef}
          mobileMenuBtnRef={mobileMenuBtnRef}
          mobileMenuRef={mobileMenuRef}
          menuItems={menuItems}
          notify={notify}
          currentLang={currentLang}
          setCurrentLang={changeLanguage}
        />
      )}

      <main className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-10 relative">
        <div className={`relative z-10 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[4rem] transition-all duration-700`}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/viloyat-statistikasi" element={
                <ViloyatStatistikasi 
                  setSelectedMTTType={setSelectedMTTType}
                  CustomTooltip={CustomTooltip}
                />
              } />
              <Route path="/tumanlar-statistikasi" element={
                <TumanStatistikasi 
                  CustomTooltip={CustomTooltip}
                />
              } />
              <Route path="/mahsulot-sarfi" element={<MahsulotSarfi />} />
              <Route path="/mtt-reyting" element={<MTTReyting />} />
              <Route path="/taomnoma-nazorati" element={<TaomnomaNazorati />} />
              <Route path="/retseptlar-kitobi" element={<RetseptlarKitobi />} />
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/portal-login" element={<Navigate to="/login" replace />} />
              <Route path="/" element={<Navigate to="/viloyat-statistikasi" replace />} />
              <Route path="*" element={
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center dark:bg-slate-900 dark:border-slate-800">
                  <p className="text-slate-600 dark:text-slate-300">{t('notFound')}</p>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </main>
      
      {!isLoginPage && <Footer />}

      <Notification 
        showNotification={showNotification}
        setShowNotification={setShowNotification}
      />

      <MTTDetailModal 
        selectedMTTType={selectedMTTType}
        setSelectedMTTType={setSelectedMTTType}
        modalRef={modalRef}
      />
    </div>
  );
}
