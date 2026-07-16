import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkMe = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Clear stale token
        localStorage.removeItem('kslu_token');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('kslu_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMe();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('kslu_token', response.data.token);
        }
        setUser(response.data.user);
        toast.success(`Welcome back, ${response.data.user.name}!`);
        return response.data.user;
      }
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('kslu_token', response.data.token);
        }
        setUser(response.data.user);
        toast.success('Registration successful! Verification email sent.');
        return response.data.user;
      }
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // ignore errors, still clear session
    } finally {
      localStorage.removeItem('kslu_token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const response = await api.post('/auth/google', googleData);
      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('kslu_token', response.data.token);
        }
        setUser(response.data.user);
        toast.success(`Welcome, ${response.data.user.name}!`);
        return response.data.user;
      }
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Profile updated successfully!');
        return response.data.user;
      }
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        googleLogin,
        checkMe,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
