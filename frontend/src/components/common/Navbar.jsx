import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  Sun, Moon, Bell, Menu, X, LogOut, User as UserIcon, 
  Shield, Bookmark, Upload, BookOpen, Trash2, CheckSquare 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleNotifClick = async (notif) => {
    await markAsRead(notif._id);
    setNotifDropdownOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-dark-bg/85 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary dark:text-white">
                KSLU <span className="text-secondary">Circle</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-secondary font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}
            >
              Home
            </Link>
            <Link 
              to="/notes" 
              className={`text-sm font-medium transition-colors ${isActive('/notes') ? 'text-secondary font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}
            >
              Notes
            </Link>
            <Link 
              to="/papers" 
              className={`text-sm font-medium transition-colors ${isActive('/papers') ? 'text-secondary font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}
            >
              Question Papers
            </Link>
            <Link 
              to="/upload" 
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/upload') ? 'text-secondary font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white'}`}
            >
              <Upload className="w-4 h-4" /> Upload
            </Link>
          </div>

          {/* Action Buttons (Right) */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>

            {/* Notifications Popover */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-dark-bg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-secondary hover:text-secondary-dark flex items-center gap-1 font-medium"
                        >
                          <CheckSquare className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id}
                            className={`p-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 flex items-start justify-between gap-2 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                            onClick={() => handleNotifClick(notif)}
                          >
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{notif.title}</p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                              <span className="text-[9px] text-gray-400 dark:text-gray-500 block mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif._id);
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 rounded"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Menu Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-250 dark:border-gray-800 hover:bg-gray-55 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-secondary/30"
                  />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 pr-1">{user.name.split(' ')[0]}</span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1.5">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-550 dark:text-gray-450 truncate">{user.email}</p>
                      {user.reputation !== undefined && (
                        <div className="mt-1 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded inline-block">
                          Reputation: {user.reputation} ⭐
                        </div>
                      )}
                    </div>
                    <Link 
                      to="/profile" 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" /> My Profile
                    </Link>
                    {['admin', 'superadmin'].includes(user.role) && (
                      <Link 
                        to="/admin" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 bg-amber-50/20 dark:bg-amber-950/10 font-medium"
                      >
                        <Shield className="w-4 h-4 text-amber-500" /> Admin Console
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-650 hover:bg-red-50 dark:hover:bg-red-950/10 border-t border-gray-100 dark:border-gray-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white">
                  Sign In
                </Link>
                <Link to="/register" className="text-xs font-bold bg-primary hover:bg-primary-dark text-white px-3.5 py-2 rounded-xl transition-all shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-850"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg transition-all py-3 px-4 space-y-2">
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${isActive('/') ? 'bg-gray-100 dark:bg-gray-800 text-secondary' : 'text-gray-700 dark:text-gray-300'}`}
          >
            Home
          </Link>
          <Link 
            to="/notes" 
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${isActive('/notes') ? 'bg-gray-100 dark:bg-gray-800 text-secondary' : 'text-gray-700 dark:text-gray-300'}`}
          >
            Notes
          </Link>
          <Link 
            to="/papers" 
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${isActive('/papers') ? 'bg-gray-100 dark:bg-gray-800 text-secondary' : 'text-gray-700 dark:text-gray-300'}`}
          >
            Question Papers
          </Link>
          <Link 
            to="/upload" 
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${isActive('/upload') ? 'bg-gray-100 dark:bg-gray-800 text-secondary' : 'text-gray-700 dark:text-gray-300'}`}
          >
            Upload Study Files
          </Link>

          {isAuthenticated && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2 space-y-2">
              <Link 
                to="/profile" 
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Profile Settings
              </Link>
              {['admin', 'superadmin'].includes(user.role) && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-500 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                >
                  Admin Panel
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
              >
                Log Out
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-2 flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 border border-gray-250 dark:border-gray-750 text-sm font-bold text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 bg-primary hover:bg-primary-dark text-sm font-bold text-white rounded-lg shadow-sm"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}

    </nav>
  );
};

export default Navbar;
