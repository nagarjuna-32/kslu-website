import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: data.email });
      if (response.data.success) {
        setSuccess(true);
        toast.success(response.data.message || 'Password reset link sent!');
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
        
        {/* State Toggle */}
        {!success ? (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Recover Password
              </h2>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter your email address to receive a secure password-reset link.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    placeholder="name@college.com"
                    className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary dark:bg-secondary text-white dark:text-primary font-bold rounded-xl transition-all shadow-md hover:bg-secondary dark:hover:bg-secondary-dark disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Reset Link Sent!
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              We have dispatched a password-reset link to your email address. Please check your inbox (and spam folder) to complete the process.
            </p>
          </div>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
