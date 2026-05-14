/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { BarChart3, Map, Menu, TrendingDown, TrendingUp, ShoppingCart, ChefHat, Trophy, Shield, School } from 'lucide-react';
import TaomnomaNazorati from './components/TaomnomaNazorati';
import WelcomeScreen from './components/WelcomeScreen';
import RetseptlarKitobi from './components/RetseptlarKitobi';
import MahsulotSarfi from './components/MahsulotSarfi';
import MTTReyting from './components/MTTReyting';
import AdminLogin from './components/AdminLogin';

// New Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ViloyatStatistikasi from './components/dashboard/ViloyatStatistikasi';
import TumanStatistikasi from './components/dashboard/TumanStatistikasi';
import MTTDetailModal from './components/modals/MTTDetailModal';
import Notification from './components/ui/Notification';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isMobileMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [selectedMTTType, setSelectedMTTType] = useState<any>(null);
  
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
    { name: 'Viloyat statistikasi', icon: BarChart3, path: '/viloyat-statistikasi' },
    { name: 'Tumanlar statistikasi', icon: Map, path: '/tumanlar-statistikasi' },
    { name: 'Mahsulot sarfi', icon: ShoppingCart, path: '/mahsulot-sarfi' },
    { name: 'MTT Reyting', icon: Trophy, path: '/mtt-reyting' },
    { name: 'Taomnoma nazorati', icon: Menu, path: '/taomnoma-nazorati' },
    { name: 'Retseptlar kitobi', icon: ChefHat, path: '/retseptlar-kitobi' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-[2rem] shadow-2xl border border-slate-100 min-w-[200px] relative z-[100]">
          <p className="font-black text-slate-900 text-lg mb-3 border-b border-slate-100 pb-3">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 py-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{entry.name}</span>
              </div>
              <span className="text-base font-black text-slate-900">{entry.value}{entry.name.toLowerCase().includes('davomat') ? '%' : ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-white transition-colors duration-700">
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
        />
      )}

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-12 relative">
        <div className={`relative z-10 rounded-[4rem] transition-all duration-700`}>
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
            <Route path="/login" element={<AdminLogin onClose={() => window.location.href = '/admin/'} />} />
            <Route path="/" element={<Navigate to="/viloyat-statistikasi" replace />} />
            <Route path="*" element={
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-slate-600">Sahifa topilmadi.</p>
              </div>
            } />
          </Routes>
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
