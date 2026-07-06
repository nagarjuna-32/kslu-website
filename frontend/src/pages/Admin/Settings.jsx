import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { Settings as SettingsIcon, Save, Info, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      allowUploads: true,
      maxFileSize: 20,
      allowedExtensions: 'pdf',
      maintenanceMode: false,
      welcomeTemplate: 'Welcome to KSLU Circle! 📚'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.put('/admin/settings', data);
      if (response.data.success) {
        toast.success(response.data.message || 'System settings updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Configure global application policies and upload restrictions.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-4">
            
            {/* Toggle: Allow Uploads */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-250">Allow Student Uploads</h4>
                <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5">Toggle whether users can submit new notes or papers.</p>
              </div>
              <input 
                type="checkbox" 
                {...register('allowUploads')} 
                className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
            </div>

            {/* Toggle: Maintenance Mode */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-250">System Maintenance Mode</h4>
                <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5">Locks down website features and displays maintenance headers.</p>
              </div>
              <input 
                type="checkbox" 
                {...register('maintenanceMode')} 
                className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
            </div>

            {/* Form Fields: Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Maximum Upload Size (MB)</label>
                <input
                  type="number"
                  {...register('maxFileSize')}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Allowed Extensions</label>
                <input
                  type="text"
                  {...register('allowedExtensions')}
                  className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            {/* Email template edit mockup */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Welcome Email Subject Template</label>
              <input
                type="text"
                {...register('welcomeTemplate')}
                className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
              />
            </div>

          </div>

          {/* Alert panel */}
          <div className="bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex gap-3 text-xs text-gray-650 dark:text-gray-400">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="leading-relaxed">
              Updating these parameters adjusts application variables immediately on the API server. Ensure maximum upload sizes sync with webserver payload limits.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 py-3 bg-primary dark:bg-secondary text-white dark:text-primary font-bold rounded-xl text-xs hover:bg-secondary dark:hover:bg-secondary-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Server Settings
          </button>

        </form>

      </div>

    </div>
  );
};

export default Settings;
