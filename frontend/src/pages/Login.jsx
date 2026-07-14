import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      // toast is already showing error from context
    } finally {
      setLoading(false);
    }
  };

  // Local Google Login Mock
  const handleGoogleMock = async () => {
    setLoading(true);
    try {
      const mockGoogleData = {
        name: 'Karnataka Scholar',
        email: 'scholar@kslucircle.com',
        googleId: 'g_' + Math.round(Math.random() * 1e9),
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=scholar'
      };
      await googleLogin(mockGoogleData);
      window.location.href = '/';
    } catch (err) {
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  // Real Google Sign-In with Mock Fallback
  const handleGoogleLogin = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your-google-client-id') {
      toast.success('Using mock Google Login (no Client ID configured)');
      await handleGoogleMock();
      return;
    }

    if (!window.google) {
      toast.error('Google Sign-In SDK not loaded. Please try again in a moment.');
      return;
    }

    setLoading(true);
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              await googleLogin({ token: tokenResponse.access_token });
              window.location.href = '/';
            } catch (err) {
              // Error is already shown in toast by AuthContext
            } finally {
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        },
        error_callback: () => {
          setLoading(false);
          toast.error('Google authorization failed');
        }
      });
      client.requestAccessToken();
    } catch (err) {
      setLoading(false);
      toast.error('Failed to initialize Google Sign-in');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <SEO 
        title="Sign In"
        description="Log in to your KSLU Circle account to upload notes, bookmark resources, and access law study materials."
        canonicalUrl="https://kslucircle.online/login"
      />
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-lg">
        
        {/* Header */}
        <div className="text-center">
          <img 
            src="/logo_icon.png" 
            alt="KSLU Circle" 
            className="mx-auto w-12 h-12 rounded-2xl object-cover shadow-md mb-4"
          />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Sign in to access your study library and notifications
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          
          <div className="space-y-4">
            
            {/* Email Field */}
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
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-B]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="name@college.com"
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-secondary hover:text-secondary-dark">
                  Forgot?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-gray-950 border border-gray-255 dark:border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {errors.password.message}
                </p>
              )}
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary dark:bg-secondary text-white dark:text-primary font-bold rounded-xl transition-all shadow-md hover:bg-secondary dark:hover:bg-secondary-dark disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-150 dark:border-gray-800"></div>
          </div>
          <span className="relative bg-white dark:bg-gray-900 px-3 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
            Or continue with
          </span>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-250 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-secondary hover:text-secondary-dark">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
