import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Facebook, Instagram, Send } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const footerLinks = ['footer.home', 'footer.statistics', 'footer.districts', 'footer.services', 'footer.connect'];

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-8 sm:pt-12 lg:pt-16 pb-7 dark:bg-slate-950 dark:border-slate-800">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 sm:gap-8 lg:gap-12 mb-8 sm:mb-10 lg:mb-16">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-indigo-400/20">R</div>
              <div className="flex min-w-0 flex-col">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight dark:text-white">
                  {t('appName')}
                </h2>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('footer.portal')}</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-6 dark:text-slate-300">{t('footer.description')}</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Send].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-lg transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-indigo-300">
                  <Icon className="h-[18px] w-[18px]" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-4 sm:mb-6 dark:text-white">{t('footer.contact')}</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-slate-600 text-sm leading-6 dark:text-slate-300">{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-slate-600 text-sm dark:text-slate-300">+998 88 296 17 17</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="min-w-0 text-slate-600 text-sm break-words dark:text-slate-300">baxtiyorovmirjalol03@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-4 sm:mb-6 dark:text-white">{t('footer.links')}</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:block sm:space-y-3">
              {footerLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="block text-slate-600 text-sm hover:text-indigo-600 transition-colors dark:text-slate-300 dark:hover:text-indigo-300">{t(item)}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-4 sm:mb-6 dark:text-white">{t('footer.newsletter')}</h3>
            <p className="text-slate-600 text-sm leading-6 mb-4 dark:text-slate-300">{t('footer.newsletterText')}</p>
            <div className="flex items-stretch gap-2">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="min-w-0 flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
              <button className="w-12 shrink-0 inline-flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none" aria-label={t('footer.newsletter')}>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 dark:border-slate-800">
          <p className="text-slate-500 text-sm font-medium leading-6 dark:text-slate-400">
            © {currentYear} {t('appName')}. {t('footer.copyright')}
          </p>
          <div className="flex w-full flex-col gap-2 min-[430px]:w-auto min-[430px]:flex-row min-[430px]:flex-wrap min-[430px]:gap-5 sm:gap-8">
            <a href="#" className="text-slate-400 text-[11px] sm:text-xs font-bold hover:text-slate-600 uppercase tracking-wider transition-colors dark:hover:text-slate-200">{t('footer.privacy')}</a>
            <a href="#" className="text-slate-400 text-[11px] sm:text-xs font-bold hover:text-slate-600 uppercase tracking-wider transition-colors dark:hover:text-slate-200">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
