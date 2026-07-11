import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/LanguageContext';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import MaterialCard from '../components/materials/MaterialCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, FileText, Settings as SettingsIcon, 
  Trash2, Lock, GraduationCap, Award, Download, UploadCloud, 
  Calendar, Check, ShieldAlert, Sun, Moon, LayoutDashboard, Bookmark, History, PlusSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploads, setUploads] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { register: regProfile, handleSubmit: handleProfileSubmit } = useForm({
    defaultValues: {
      name: user?.name,
      college: user?.college,
      yearOfStudy: user?.yearOfStudy,
      emailPref: user?.notificationPreferences?.email,
      inAppPref: user?.notificationPreferences?.inApp
    }
  });

  const { register: regPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm, formState: { errors: passErrors } } = useForm();

  const fetchUploads = async () => {
    try {
      const response = await api.get('/materials/user/me');
      if (response.data.success) {
        setUploads(response.data.materials);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUploads(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/bookmarks');
      if (response.data.success) {
        setBookmarks(response.data.bookmarks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUploads();
      fetchBookmarks();
    }
  }, [user]);

  const onUpdateProfile = async (data) => {
    try {
      await updateProfile({
        name: data.name,
        college: data.college,
        yearOfStudy: parseInt(data.yearOfStudy),
        notificationPreferences: {
          email: !!data.emailPref,
          inApp: !!data.inAppPref
        }
      });
    } catch (err) {
      // Handled in context
    }
  };

  const onUpdatePassword = async (data) => {
    setPasswordLoading(true);
    try {
      const response = await api.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      if (response.data.success) {
        toast.success('Password updated successfully');
        resetPasswordForm();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteUpload = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      const response = await api.delete(`/materials/${id}`);
      if (response.data.success) {
        setUploads(prev => prev.filter(item => item._id !== id));
        toast.success('Material deleted successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete upload');
    }
  };

  const handleUnbookmark = async (materialId) => {
    try {
      await api.delete(`/bookmarks/${materialId}`);
      setBookmarks(prev => prev.filter(b => b.material._id !== materialId));
      toast.success('Bookmark removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove bookmark');
    }
  };

  if (!user) return <LoadingSpinner size="lg" />;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const menuItems = [
    { id: 'dashboard', label: t('dashboardMenu'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'uploads', label: t('activeUploads'), icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'bookmarks', label: t('bookmarksMenu'), icon: <Bookmark className="w-4 h-4" /> },
    { id: 'settings', label: t('settingsMenu'), icon: <SettingsIcon className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      <SEO 
        title={`${user.name}'s Dashboard`}
        description="Manage your study uploads, legal resource bookmarks, and profile preferences on KSLU Circle."
        robots="noindex, nofollow"
      />

      {/* Main Grid: Sidebar + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Sidebar panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* User Brief profile card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 text-center shadow-sm space-y-3">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover mx-auto ring-2 ring-royal/20"
            />
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-none">{user.name}</h2>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-secondary border border-slate-200 dark:border-slate-800">
                {user.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">{t('joinedIn')} {joinDate}</p>
          </div>

          {/* Sidebar Menu options */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-3 shadow-sm space-y-1">
            {menuItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-royal text-white dark:bg-secondary dark:text-primary shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            <Link 
              to="/upload"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <PlusSquare className="w-4 h-4" />
              <span>{t('uploadResourceMenu')}</span>
            </Link>

            {/* In-sidebar Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
                <span>{t('darkModeMenu')}</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-secondary' : 'bg-slate-300'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Main panel details content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tab 1: Dashboard overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('accountDashboard')}</h2>
              
              {/* Counters Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-955/20 text-yellow-500">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">{t('reputation')}</h4>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{user.reputation} ⭐</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-955/20 text-blue-500">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">{t('activeUploads')}</h4>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{uploads.length}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-955/20 text-emerald-500">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">{t('totalDownloads')}</h4>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{user.totalDownloads || 0}</p>
                  </div>
                </div>
              </div>

              {/* Verified Badge info */}
              <div className="bg-blue-50/50 dark:bg-blue-955/15 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-5 flex gap-4 text-xs leading-relaxed text-slate-655 dark:text-slate-350">
                <ShieldAlert className="w-6 h-6 text-royal dark:text-secondary flex-shrink-0" />
                <div>
                  <h4 className="font-black text-slate-800 dark:text-slate-200">{t('verificationCardTitle')}</h4>
                  <p className="mt-1 text-[11px]">
                    {t('verificationCardDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: My Uploads */}
          {activeTab === 'uploads' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('activeUploads')}</h2>
              {loadingUploads ? (
                <LoadingSpinner size="md" />
              ) : uploads.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl text-xs text-slate-400">
                  {t('noUploads')}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-955/50 border-b border-slate-150 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                          <th className="p-4">{t('tblTitle')}</th>
                          <th className="p-4">{t('tblType')}</th>
                          <th className="p-4">{t('tblCourse')}</th>
                          <th className="p-4">{t('tblCode')}</th>
                          <th className="p-4 text-center">{t('tblDownloads')}</th>
                          <th className="p-4">{t('tblStatus')}</th>
                          <th className="p-4 text-right">{t('tblActions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {uploads.map(item => (
                          <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="p-4 font-bold text-slate-850 dark:text-slate-255 truncate max-w-xs">{item.title}</td>
                            <td className="p-4">
                              <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350">
                                {item.type}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-450 font-bold">{item.course || "3-Year LL.B"}</td>
                            <td className="p-4 font-semibold text-secondary uppercase">{item.subjectCode}</td>
                            <td className="p-4 text-center font-semibold">{item.downloads}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide ${
                                item.status === 'approved' 
                                  ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400'
                                  : item.status === 'rejected'
                                    ? 'bg-red-50 dark:bg-red-955/20 text-red-655 dark:text-red-400'
                                    : 'bg-amber-50 dark:bg-amber-955/20 text-amber-500 dark:text-amber-400'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteUpload(item._id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/15 rounded-xl transition-colors"
                                title="Delete Upload"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('bookmarkedTitle')}</h2>
              {loadingBookmarks ? (
                <LoadingSpinner size="md" />
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl text-xs text-slate-400">
                  {t('noBookmarks')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {bookmarks.map(b => (
                    <div key={b._id} className="relative">
                      <MaterialCard material={b.material} initialBookmarked={true} onBookmarkToggle={() => handleUnbookmark(b.material._id)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Settings */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
              
              {/* Profile details */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3">{t('updateProfile')}</h3>
                <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('fullName')}</label>
                    <input
                      type="text"
                      {...regProfile('name', { required: true })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('lawCollege')}</label>
                    <div className="relative flex items-center">
                      <GraduationCap className="absolute left-3 w-5 h-5 text-slate-450 pointer-events-none" />
                      <input
                        type="text"
                        {...regProfile('college', { required: true })}
                        className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('yearOfStudy')}</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3 w-5 h-5 text-slate-450 pointer-events-none" />
                      <select
                        {...regProfile('yearOfStudy', { required: true })}
                        className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                      >
                        {[1, 2, 3, 4, 5].map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                    <h4 className="text-[11px] font-bold text-slate-455 uppercase tracking-wider">{t('alertPreferences')}</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...regProfile('emailPref')} className="h-4 w-4 text-royal focus:ring-royal border-slate-300 rounded" />
                        <span className="text-xs text-slate-700 dark:text-slate-300">{t('emailAlerts')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...regProfile('inAppPref')} className="h-4 w-4 text-royal focus:ring-royal border-slate-300 rounded" />
                        <span className="text-xs text-slate-700 dark:text-slate-300">{t('inAppAlerts')}</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-royal dark:bg-secondary text-white dark:text-primary font-bold rounded-xl text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-sm"
                  >
                    {t('saveProfile')}
                  </button>

                </form>
              </div>

              {/* Password update */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3">{t('securityPassword')}</h3>
                <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('currentPassword')}</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-5 h-5 text-slate-455 pointer-events-none" />
                      <input
                        type="password"
                        {...regPassword('currentPassword', { required: 'Current password is required' })}
                        placeholder="••••••••"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                      />
                    </div>
                    {passErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{passErrors.currentPassword.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('newPassword')}</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-5 h-5 text-slate-455 pointer-events-none" />
                      <input
                        type="password"
                        {...regPassword('newPassword', { 
                          required: 'New password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        placeholder="••••••••"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                      />
                    </div>
                    {passErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passErrors.newPassword.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-2.5 bg-royal dark:bg-secondary text-white dark:text-primary font-bold rounded-xl text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-sm disabled:opacity-50"
                  >
                    {passwordLoading ? t('updatingBtn') : t('changePassword')}
                  </button>

                </form>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;
