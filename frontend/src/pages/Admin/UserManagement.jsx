import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ShieldAlert, Trash2, Ban, ShieldAlert as ShieldIcon, Search, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      toast.error('Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      const response = await api.put(`/admin/users/${id}/role`, { role });
      if (response.data.success) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, role: response.data.user.role } : u));
        toast.success(`Role updated to ${role}`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleBan = async (id) => {
    try {
      const response = await api.put(`/admin/users/${id}/ban`);
      if (response.data.success) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned: response.data.user.isBanned } : u));
        toast.success(response.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This will also remove all their uploads!')) return;
    try {
      const response = await api.delete(`/admin/users/${id}`);
      if (response.data.success) {
        setUsers(prev => prev.filter(u => u._id !== id));
        toast.success('User profile deleted successfully');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.college && u.college.toLowerCase().includes(search.toLowerCase()))
  );

  const isSuperAdmin = currentUser?.role === 'superadmin';

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">User Management</h1>
        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Review student profiles, ban violators, and edit administrative access.</p>
      </div>

      {/* Search filter */}
      <div className="relative flex items-center max-w-md">
        <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, email, college..."
          className="w-full bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl space-y-3">
          <div className="flex justify-center">
            <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-700" />
          </div>
          <p className="text-xs text-gray-550">No users match that search query.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-955/50 border-b border-gray-150 dark:border-gray-850 text-gray-500 dark:text-gray-400 font-bold uppercase">
                  <th className="p-4">Student Info</th>
                  <th className="p-4">College Details</th>
                  <th className="p-4 text-center">Reputation</th>
                  <th className="p-4 text-center">Uploads</th>
                  <th className="p-4">Access Role</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredUsers.map(item => (
                  <tr key={item._id} className="hover:bg-gray-55/50 dark:hover:bg-gray-800/10">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={item.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-850 dark:text-gray-250 leading-none">{item.name}</p>
                          <p className="text-[10px] text-gray-450 mt-1">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={item.college}>{item.college || 'N/A'}</p>
                      {item.yearOfStudy && (
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold">Year {item.yearOfStudy}</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-secondary">{item.reputation} ⭐</td>
                    <td className="p-4 text-center font-semibold">{item.totalUploads}</td>
                    <td className="p-4">
                      {isSuperAdmin ? (
                        <select
                          value={item.role}
                          onChange={(e) => handleRoleChange(item._id, e.target.value)}
                          disabled={item._id === currentUser._id || item.role === 'superadmin'}
                          className="bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-secondary"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">SuperAdmin</option>
                        </select>
                      ) : (
                        <span className="capitalize font-bold text-gray-650 dark:text-gray-300">{item.role}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleBan(item._id)}
                          disabled={item._id === currentUser._id || item.role === 'superadmin'}
                          className={`p-2 border rounded-xl transition-colors ${
                            item.isBanned 
                              ? 'bg-red-500 border-red-500 text-white' 
                              : 'border-gray-250 dark:border-gray-750 text-gray-400 hover:text-red-500 hover:border-red-500'
                          }`}
                          title={item.isBanned ? 'Unban User' : 'Ban User'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteUser(item._id)}
                            disabled={item._id === currentUser._id || item.role === 'superadmin'}
                            className="p-2 border border-gray-250 dark:border-gray-750 hover:border-red-500 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                            title="Delete User permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
