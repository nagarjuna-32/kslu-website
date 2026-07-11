import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, BookOpen, UploadCloud, User, Shield } from 'lucide-react';

const BottomNavbar = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              isActive ? 'text-royal dark:text-secondary' : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink 
          to="/notes" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              isActive ? 'text-royal dark:text-secondary' : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <BookOpen className="w-5 h-5" />
          <span>Browse</span>
        </NavLink>

        <NavLink 
          to="/upload" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              isActive ? 'text-royal dark:text-secondary' : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <div className="p-2 -mt-6 bg-royal dark:bg-secondary text-white dark:text-primary rounded-full shadow-lg ring-4 ring-white dark:ring-slate-950 transition-transform active:scale-95">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="mt-1">Upload</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              isActive ? 'text-royal dark:text-secondary' : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>

        {isAuthenticated && ['admin', 'superadmin'].includes(user?.role) && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
                isActive ? 'text-royal dark:text-secondary' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            <span>Admin</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default BottomNavbar;
