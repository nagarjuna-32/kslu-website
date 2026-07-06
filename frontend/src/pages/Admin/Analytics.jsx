import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { Download, FileSpreadsheet, TrendingUp, Users, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#1a365d', '#c9a84c', '#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      if (response.data.success) {
        setData(response.data);
      }
    } catch (err) {
      toast.error('Failed to load analytics charts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    const exportUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/analytics/export`;
    // Open standard anchor click or window to trigger file download
    window.open(exportUrl, '_blank');
    toast.success('Downloading analytics CSV document...');
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return <p className="text-xs text-gray-550 text-center">No analytical records found.</p>;

  // Prepare data for Note vs Paper pie
  const pieData = data.typeDistribution.map(item => ({
    name: item._id === 'note' ? '📝 Notes' : '📄 Question Papers',
    value: item.count
  }));

  // Prepare data for subject bar chart
  const barData = data.subjectDistribution.map(item => ({
    subject: item._id,
    uploads: item.count
  }));

  return (
    <div className="space-y-8">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">System Analytics</h1>
          <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Real-time charts demonstrating uploads frequency, file splits, and student reputation logs.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export CSV Data
        </button>
      </div>

      {/* Primary line chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-primary dark:text-secondary" /> Upload Activity Trend (Last 30 Days)
        </h3>
        <div className="h-72">
          {data.uploadsOverTime.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-500">No uploads in the last 30 days.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.uploadsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1a365d" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-gray-455 dark:text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-500" /> Resource Split (Notes vs Papers)
          </h3>
          <div className="h-64 flex justify-center items-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-gray-500">No materials splits to show.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={75}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-gray-455 dark:text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" /> Top Subject Codes
          </h3>
          <div className="h-64">
            {barData.length === 0 ? (
              <p className="text-xs text-gray-500">No subjects data registered.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="uploads" fill="#c9a84c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
