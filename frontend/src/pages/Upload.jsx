import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  UploadCloud, FileText, Check, ShieldAlert, BookOpen, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [myUploads, setMyUploads] = useState([]);
  const [myUploadsLoading, setMyUploadsLoading] = useState(true);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      type: 'note',
      semester: '1',
      university: 'KSLU',
      year: new Date().getFullYear().toString()
    }
  });

  const materialType = watch('type');

  const fetchMyUploads = async () => {
    try {
      const response = await api.get('/materials/user/me');
      if (response.data.success) {
        setMyUploads(response.data.materials);
      }
    } catch (err) {
      console.error('Failed to load uploads history:', err);
    } finally {
      setMyUploadsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyUploads();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      return toast.error('Only PDF documents are allowed');
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      return toast.error('Max file size is 20MB');
    }

    setFile(selectedFile);
    toast.success(`Attached: ${selectedFile.name}`);
  };

  const onSubmit = async (data) => {
    if (!file) {
      return toast.error('Please attach a PDF document');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('subjectCode', data.subjectCode.toUpperCase());
    formData.append('subjectName', data.subjectName || '');
    formData.append('semester', data.semester);
    formData.append('university', data.university);
    if (data.type === 'paper') {
      formData.append('year', data.year);
    }
    formData.append('description', data.description || '');
    formData.append('tags', data.tags || '');
    formData.append('file', file);

    try {
      const response = await api.post('/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      if (response.data.success) {
        toast.success('Resource uploaded successfully and sent for review!');
        reset({
          type: 'note',
          semester: '1',
          university: 'KSLU',
          year: new Date().getFullYear().toString()
        });
        setFile(null);
        fetchMyUploads(); // Instantly update active history list
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload material');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 transition-colors duration-300">
      <SEO 
        title="Upload Study Material"
        description="Share your lecture notes, summaries, and exam papers with other law students. Contribute to the KSLU Circle repository."
        canonicalUrl="https://kslucircle.online/upload"
        robots="noindex, follow"
      />
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Share Resources</span>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
          <UploadCloud className="w-8 h-8 text-primary dark:text-secondary" /> Upload study material
        </h1>
        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1.5">
          Submit notes or old question papers. In development mode, files are automatically approved and searchable instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel (Col-span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Document Information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Material Type</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setValue('type', 'note')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      materialType === 'note' 
                        ? 'bg-primary border-primary text-white dark:bg-secondary dark:border-secondary dark:text-primary' 
                        : 'bg-white dark:bg-gray-850 border-gray-250 dark:border-gray-750 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    📝 Study Note
                  </button>
                  <button 
                    type="button"
                    onClick={() => setValue('type', 'paper')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      materialType === 'paper' 
                        ? 'bg-primary border-primary text-white dark:bg-secondary dark:border-secondary dark:text-primary' 
                        : 'bg-white dark:bg-gray-855 border-gray-250 dark:border-gray-755 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    📄 Question Paper
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Contract Law Unit 1 Summary"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1 font-medium">{errors.title.message}</p>}
              </div>

              {/* Subject Code */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Subject Code (e.g. KSLU-301)</label>
                <input
                  type="text"
                  placeholder="KSLU-301"
                  {...register('subjectCode', { required: 'Subject Code is required' })}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary uppercase"
                />
                {errors.subjectCode && <p className="text-xs text-red-500 mt-1 font-medium">{errors.subjectCode.message}</p>}
              </div>

              {/* Subject Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Subject Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Constitutional Law I"
                  {...register('subjectName')}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                />
              </div>

              {/* Semester & University */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Semester</label>
                <select
                  {...register('semester', { required: true })}
                  className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-955 dark:text-white focus:outline-none focus:border-secondary"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">University</label>
                <select
                  {...register('university', { required: true })}
                  className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-955 dark:text-white focus:outline-none focus:border-secondary"
                >
                  <option value="KSLU">KSLU (Karnataka State Law University)</option>
                  <option value="NLSIU">NLSIU (National Law School)</option>
                  <option value="Christ">Christ University Law</option>
                  <option value="Other">Other Law Institution</option>
                </select>
              </div>

              {/* Exam Year (only for Question Papers) */}
              {materialType === 'paper' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Exam Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    {...register('year', { required: 'Exam Year is required', min: { value: 2000, message: 'Invalid Year' } })}
                    className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description (Max 1000 chars)</label>
              <textarea
                rows={3}
                placeholder="Describe your notes or document context. Highlight specific topics covered..."
                {...register('description')}
                className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Keywords / Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. contracts, case laws, unit-1, syllabus"
                {...register('tags')}
                className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
              />
            </div>
            
            {/* Terms checkbox */}
            <div className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-gray-650 dark:text-gray-400">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-850 dark:text-gray-250">Legal Ownership Declaration</p>
                <p className="mt-1 text-[10px]">
                  By submitting, you confirm that you possess the rights to share this document and that it does not violate copyright rules.
                </p>
              </div>
            </div>

            {/* Upload progress indicator */}
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Uploading PDF file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-850 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-secondary h-full transition-all duration-100" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Uploading File...' : 'Upload & Publish Note'}
            </button>
          </form>
        </div>

        {/* Sidebar / Upload Panel (Col-span 1) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">PDF Attachment</h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center bg-gray-50/50 dark:bg-gray-950/20 hover:bg-gray-50 dark:hover:bg-gray-950/40 transition-colors relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div className="flex flex-col items-center gap-3">
                <UploadCloud className="w-10 h-10 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Drag & drop your PDF file here</p>
                  <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-1">or click to browse local files</p>
                </div>
                <div className="text-[9px] text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-850 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">
                  PDF only • Max 20MB
                </div>
              </div>
            </div>

            {/* File info preview */}
            {file && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-855 dark:text-gray-250 truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded flex-shrink-0">Attached</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Uploads History List Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 dark:text-white">My Upload History</h3>
        
        {myUploadsLoading ? (
          <LoadingSpinner size="md" />
        ) : myUploads.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl text-xs text-gray-500">
            No document uploads logged yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-955/50 border-b border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase">
                    <th className="p-4">Title</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">Upload Date</th>
                    <th className="p-4 text-center">Downloads</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {myUploads.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                      <td className="p-4 font-bold text-gray-850 dark:text-gray-250 truncate max-w-xs">{item.title}</td>
                      <td className="p-4">
                        <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-650 dark:text-gray-350">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-secondary uppercase">{item.subjectCode}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center font-semibold">{item.downloads}</td>
                      <td className="p-4 text-right">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase ${
                          item.status === 'approved' 
                            ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400'
                            : item.status === 'rejected'
                              ? 'bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-400'
                              : 'bg-amber-50 dark:bg-amber-955/20 text-amber-500 dark:text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                        {item.status === 'rejected' && item.rejectionReason && (
                          <span className="block text-[9px] text-red-500 dark:text-red-400 mt-1 max-w-[200px] truncate" title={item.rejectionReason}>
                            Reason: {item.rejectionReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Upload;
