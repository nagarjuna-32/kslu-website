import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo / Tagline */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo_icon.png" 
                alt="KSLU Circle" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                KSLU <span className="text-royal dark:text-secondary">Circle</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {t('footerDesc')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('navigation')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-xs text-slate-600 dark:text-slate-400 hover:text-royal dark:hover:text-secondary transition-colors font-bold">{t('home')}</Link>
              </li>
              <li>
                <Link to="/notes" className="text-xs text-slate-600 dark:text-slate-400 hover:text-royal dark:hover:text-secondary transition-colors font-bold">{t('notes')}</Link>
              </li>
              <li>
                <Link to="/papers" className="text-xs text-slate-600 dark:text-slate-400 hover:text-royal dark:hover:text-secondary transition-colors font-bold">{t('papers')}</Link>
              </li>
              <li>
                <Link to="/upload" className="text-xs text-slate-600 dark:text-slate-400 hover:text-royal dark:hover:text-secondary transition-colors font-bold">{t('upload')}</Link>
              </li>
            </ul>
          </div>

          {/* Resources & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('legalContact')}</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
                <Mail className="w-3.5 h-3.5 text-royal dark:text-secondary" />
                <a href="mailto:support@kslucircle.com" className="hover:text-royal dark:hover:text-secondary">support@kslucircle.com</a>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-royal dark:text-secondary" />
                <Link to="/terms" className="hover:text-royal dark:hover:text-secondary">{t('terms')}</Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
            © {new Date().getFullYear()} KSLU Circle. {t('createdFor')}
          </p>
          <div className="flex space-x-4 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
            <a href="https://kslu.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-royal dark:hover:text-secondary transition-colors">{t('portal')}</a>
            <span>•</span>
            <Link to="/privacy" className="hover:text-royal dark:hover:text-secondary transition-colors">{t('privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
