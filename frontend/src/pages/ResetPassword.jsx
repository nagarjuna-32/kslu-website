import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password: data.password });
      if (response.data.success) {
        toast.success(response.data.message || 'Password reset successful!');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-lg">
        
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Create New Password
          </h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Set your new login credentials below.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              New Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-955 dark:text-white focus:outline-none focus:border-secondary"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm password',
                  validate: (val) => val === passwordValue || 'Passwords do not match'
                })}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-955 dark:text-white focus:outline-none focus:border-secondary"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary dark:bg-secondary text-white dark:text-primary font-bold rounded-xl transition-all shadow-md hover:bg-secondary dark:hover:bg-secondary-dark disabled:opacity-50"
          >
            {loading ? 'Resetting password...' : 'Update Password'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Cancel and return to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
