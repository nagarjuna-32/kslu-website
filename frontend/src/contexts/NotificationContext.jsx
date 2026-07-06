import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread');
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchUnreadCount();

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        newSocket.emit('register', user._id);
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Display animated react-hot-toast alert
        toast((t) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{notification.title}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{notification.message}</span>
          </div>
        ), {
          icon: '🔔',
          duration: 4000,
          position: 'bottom-right'
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  const markAsRead = async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.put('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      if (response.data.success) {
        const deleted = notifications.find(n => n._id === id);
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (deleted && !deleted.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: () => { fetchNotifications(); fetchUnreadCount(); }
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
