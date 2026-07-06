import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, ShieldCheck, FileSpreadsheet, Users, 
  Megaphone, BarChart3, History, Settings, ArrowLeft, Menu, X 
} from 'lucide-react';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guard: Redirect if not admin/superadmin
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-black text-red-500">Access Denied</h2>
          <p className="text-xs text-gray-500">You must possess administrator privileges to access this console.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl">Return Home</Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/admin/moderation', label: 'Pending Moderation', icon: <ShieldCheck className="w-4 h-4" /> },
    { path: '/admin/content', label: 'Content Manager', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { path: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { path: '/admin/announcements', label: 'System Alerts', icon: <Megaphone className="w-4 h-4" /> },
    { path: '/admin/analytics', label: 'Analytics Charts', icon: <BarChart3 className="w-4 h-4" /> },
    { path: '/admin/logs', label: 'Activity Audit Logs', icon: <History className="w-4 h-4" /> },
    { path: '/admin/settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
      
      {/* Mobile Sidebar Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-secondary text-primary font-bold rounded-full shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col justify-between py-6 px-4">
          <div className="space-y-6">
            
            {/* Header / Logo */}
            <div className="flex items-center justify-between">
              <Link to="/admin" className="flex items-center gap-2">
                <span className="text-md font-black tracking-tight text-primary dark:text-white uppercase">
                  Admin <span className="text-secondary">Console</span>
                </span>
              </Link>
              <button 
                onClick={() => navigate('/')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                title="Go to main site"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Menu List */}
            <nav className="space-y-1.5">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive(item.path)
                      ? 'bg-secondary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-gray-800/40 hover:text-primary dark:hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

          </div>

          {/* User profile footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center gap-3">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
              alt={user.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="text-[10px]">
              <p className="font-bold text-gray-800 dark:text-gray-250 truncate w-32">{user.name}</p>
              <p className="text-gray-450 dark:text-gray-550 capitalize">{user.role}</p>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
