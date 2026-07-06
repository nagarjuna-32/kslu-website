import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, ShieldAlert } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo / Tagline */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-primary dark:text-white">
                KSLU <span className="text-secondary">Circle</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              KSLU Circle is a community-driven repository designed specifically for law students affiliated with Karnataka State Law University. We facilitate peer-to-peer sharing of lecture notes, study materials, and university question papers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-xs text-gray-550 dark:text-gray-400 hover:text-secondary transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/notes" className="text-xs text-gray-550 dark:text-gray-400 hover:text-secondary transition-colors">Study Notes</Link>
              </li>
              <li>
                <Link to="/papers" className="text-xs text-gray-550 dark:text-gray-400 hover:text-secondary transition-colors">Previous Papers</Link>
              </li>
              <li>
                <Link to="/upload" className="text-xs text-gray-550 dark:text-gray-400 hover:text-secondary transition-colors">Upload Document</Link>
              </li>
            </ul>
          </div>

          {/* Resources & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Legal & Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-xs text-gray-550 dark:text-gray-400">
                <Mail className="w-3.5 h-3.5" />
                <a href="mailto:support@kslucircle.com" className="hover:text-secondary">support@kslucircle.com</a>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-gray-550 dark:text-gray-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <Link to="/terms" className="hover:text-secondary">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} KSLU Circle. Created for law students. Not affiliated with KSLU.
          </p>
          <div className="flex space-x-4 text-[10px] text-gray-400 dark:text-gray-500">
            <a href="https://kslu.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors">KSLU Portal</a>
            <span>•</span>
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
