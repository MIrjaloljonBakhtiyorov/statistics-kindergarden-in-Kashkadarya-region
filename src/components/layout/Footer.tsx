import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Send } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-indigo-400/20">R</div>
              <div className="flex flex-col">
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  <span className="text-indigo-600">RAQAMLI</span> MTT
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statistika Portali</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Qashqadaryo viloyati maktabgacha ta'lim tashkilotlari faoliyatini raqamlashtirish va monitoring qilish tizimi.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Send].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-lg transition-all">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Aloqa</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-slate-600 text-sm">Qashqadaryo viloyati, Qarshi shahri</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-slate-600 text-sm">+998 88 296 17 17</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-slate-600 text-sm">baxtiyorovmirjalol03@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Foydali havolalar</h3>
            <ul className="space-y-3">
              {['Asosiy sahifa', 'Statistika', 'Tumanlar', 'Xizmatlar', 'Bog\'lanish'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-600 text-sm hover:text-indigo-600 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Yangiliklarga obuna bo'ling</h3>
            <p className="text-slate-600 text-sm mb-4">So'nggi yangiliklar va statistik ma'lumotlardan xabardor bo'ling.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Emailingizni kiriting" 
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-medium">
            © {currentYear} RAQAMLI MTT. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 text-xs font-bold hover:text-slate-600 uppercase tracking-wider transition-colors">Maxfiylik siyosati</a>
            <a href="#" className="text-slate-400 text-xs font-bold hover:text-slate-600 uppercase tracking-wider transition-colors">Foydalanish shartlari</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
