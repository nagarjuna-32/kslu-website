import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import MaterialCard from '../components/materials/MaterialCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { 
  User as UserIcon, FileText, Settings as SettingsIcon, 
  Trash2, Mail, Lock, GraduationCap, Award, Download, UploadCloud, 
  Calendar, Check, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('uploads');
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
      // toast is handled in context
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
        toast.success('Password changed successfully');
        resetPasswordForm();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteUpload = async (id) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) return;
    try {
      const response = await api.delete(`/materials/${id}`);
      if (response.data.success) {
        setUploads(prev => prev.filter(item => item._id !== id));
        toast.success('Material deleted successfully');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUnbookmark = async (materialId) => {
    try {
      await api.delete(`/bookmarks/${materialId}`);
      setBookmarks(prev => prev.filter(b => b.material._id !== materialId));
      toast.success('Bookmark removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!user) return <LoadingSpinner size="lg" />;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img 
            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-secondary/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">{user.name}</h2>
              <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wider uppercase bg-primary dark:bg-gray-800 text-white dark:text-secondary">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">Joined KSLU Circle in {joinDate}</p>
          </div>
        </div>

        {/* Reputation and upload counters */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-initial text-center bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800 px-5 py-3 rounded-2xl">
            <Award className="w-5 h-5 text-secondary mx-auto mb-1" />
            <span className="text-xs text-gray-450 dark:text-gray-500">Reputation</span>
            <p className="text-sm font-black text-secondary leading-none mt-1">{user.reputation} ⭐</p>
          </div>
          <div className="flex-1 md:flex-initial text-center bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800 px-5 py-3 rounded-2xl">
            <UploadCloud className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <span className="text-xs text-gray-450 dark:text-gray-500">Uploads</span>
            <p className="text-sm font-black text-gray-900 dark:text-white leading-none mt-1">{uploads.length}</p>
          </div>
          <div className="flex-1 md:flex-initial text-center bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800 px-5 py-3 rounded-2xl">
            <Download className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <span className="text-xs text-gray-450 dark:text-gray-500">Downloads</span>
            <p className="text-sm font-black text-gray-900 dark:text-white leading-none mt-1">{user.totalDownloads || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs list bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {[
          { id: 'uploads', label: 'My Uploads', icon: <UploadCloud className="w-4 h-4" /> },
          { id: 'bookmarks', label: 'Bookmarks', icon: <UserIcon className="w-4 h-4" /> }, // Use user icon as fallback for bookmarks
          { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-6 py-3.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-secondary text-secondary font-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">

        {/* Tab 1: My Uploads */}
        {activeTab === 'uploads' && (
          <div className="space-y-4">
            {loadingUploads ? (
              <LoadingSpinner size="md" />
            ) : uploads.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl text-xs text-gray-550">
                You haven't uploaded any study materials yet.
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-950/50 border-b border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase">
                        <th className="p-4">Title</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Subject Code</th>
                        <th className="p-4 text-center">Downloads</th>
                        <th className="p-4 text-center">Views</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {uploads.map(item => (
                        <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                          <td className="p-4 font-bold text-gray-850 dark:text-gray-250 truncate max-w-xs">{item.title}</td>
                          <td className="p-4">
                            <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-850 text-gray-650 dark:text-gray-350">
                              {item.type}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-secondary uppercase">{item.subjectCode}</td>
                          <td className="p-4 text-center font-semibold">{item.downloads}</td>
                          <td className="p-4 text-center font-semibold">{item.views}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide ${
                              item.status === 'approved' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                : item.status === 'rejected'
                                  ? 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400'
                                  : 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteUpload(item._id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 rounded-xl transition-colors"
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

        {/* Tab 2: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            {loadingBookmarks ? (
              <LoadingSpinner size="md" />
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl text-xs text-gray-550">
                You haven't bookmarked any materials yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map(b => (
                  <div key={b._id} className="relative">
                    <MaterialCard material={b.material} initialBookmarked={true} onBookmarkToggle={() => handleUnbookmark(b.material._id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Profile Info Form */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-3">Update Profile</h3>
              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    {...regProfile('name', { required: true })}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Law College</label>
                  <div className="relative flex items-center">
                    <GraduationCap className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      {...regProfile('college', { required: true })}
                      className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Year of Study</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      {...regProfile('yearOfStudy', { required: true })}
                      className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                    >
                      {[1, 2, 3, 4, 5].map(yr => (
                        <option key={yr} value={yr}>Year {yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notifications Preferences */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Alert Preferences</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...regProfile('emailPref')} className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Receive Email Notifications</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...regProfile('inAppPref')} className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Enable In-App Popups</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary dark:bg-secondary text-white dark:text-primary font-bold rounded-xl text-xs hover:bg-secondary dark:hover:bg-secondary-dark transition-colors"
                >
                  Save Profile Settings
                </button>

              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-3">Security & Password</h3>
              <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="password"
                      {...regPassword('currentPassword', { required: 'Current password is required' })}
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                    />
                  </div>
                  {passErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{passErrors.currentPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">New Password (6+ chars)</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="password"
                      {...regPassword('newPassword', { 
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                    />
                  </div>
                  {passErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passErrors.newPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2.5 bg-primary dark:bg-secondary text-white dark:text-primary font-bold rounded-xl text-xs hover:bg-secondary dark:hover:bg-secondary-dark transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>

              </form>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default Profile;
