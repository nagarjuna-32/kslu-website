import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  UploadCloud, FileText, ChevronRight, ChevronLeft, 
  Check, ShieldAlert, ArrowRight, BookOpen, Clock, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Upload = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [myUploads, setMyUploads] = useState([]);
  const [myUploadsLoading, setMyUploadsLoading] = useState(true);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      type: 'note',
      semester: '1',
      university: 'KSLU',
      year: new Date().getFullYear().toString()
    }
  });

  const materialType = watch('type');
  const formValues = watch();

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
        toast.success('Resource uploaded successfully and sent for admin review!');
        setStep(5); // Success state
        fetchMyUploads();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload material');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setStep(1);
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          Submit notes or old question papers. Everything goes through quick moderator verification.
        </p>
      </div>

      {/* Main Upload Form Stepper Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-lg">
        
        {/* Stepper Indicators */}
        {step < 5 && (
          <div className="flex items-center justify-between max-w-lg mx-auto mb-10">
            {[1, 2, 3, 4].map((num) => (
              <React.Fragment key={num}>
                <div className="flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                    step === num 
                      ? 'bg-secondary text-white' 
                      : step > num 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                  }`}>
                    {step > num ? <Check className="w-4 h-4" /> : num}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 mt-1.5 hidden sm:inline">
                    {num === 1 ? 'Details' : num === 2 ? 'Content' : num === 3 ? 'File' : 'Confirm'}
                  </span>
                </div>
                {num < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step > num ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-base font-black text-gray-900 dark:text-white">Step 1: Material Details</h3>
            
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
                  className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
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
                  className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
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
                    className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
                  />
                </div>
              )}

            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => {
                  if (formValues.title && formValues.subjectCode) setStep(2);
                  else toast.error('Please fill in Title and Subject Code');
                }}
                className="inline-flex items-center gap-1.5 bg-primary dark:bg-secondary text-white dark:text-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-secondary dark:hover:bg-secondary-dark transition-all"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Description & Tags */}
        {step === 2 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-base font-black text-gray-900 dark:text-white">Step 2: Description & Keywords</h3>
            
            <div className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description (Max 1000 chars)</label>
                <textarea
                  rows={4}
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
                <p className="text-[10px] text-gray-400 mt-1">Separate keywords using commas to help other students find your notes.</p>
              </div>

            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 bg-white dark:bg-gray-850 text-gray-650 dark:text-gray-300 border border-gray-250 dark:border-gray-750 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 bg-primary dark:bg-secondary text-white dark:text-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-secondary dark:hover:bg-secondary-dark transition-all"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: File Attachment */}
        {step === 3 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-base font-black text-gray-900 dark:text-white">Step 3: Upload PDF Document</h3>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-8 text-center bg-gray-50/50 dark:bg-gray-950/20 hover:bg-gray-50 dark:hover:bg-gray-950/40 transition-colors relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                <UploadCloud className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Drag & drop your PDF file here</p>
                  <p className="text-xs text-gray-450 dark:text-gray-500 mt-1">or click to browse local files</p>
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-850 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">
                  PDF format only • Max file size: 20MB
                </div>
              </div>
            </div>

            {/* File info preview */}
            {file && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-250 truncate max-w-xs">{file.name}</p>
                    <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Attached</span>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 bg-white dark:bg-gray-850 text-gray-650 dark:text-gray-300 border border-gray-250 dark:border-gray-750 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={() => {
                  if (file) setStep(4);
                  else toast.error('Please attach a PDF document');
                }}
                className="inline-flex items-center gap-1.5 bg-primary dark:bg-secondary text-white dark:text-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-secondary dark:hover:bg-secondary-dark transition-all"
              >
                Review details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review and Submit */}
        {step === 4 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-base font-black text-gray-900 dark:text-white">Step 4: Review and Submit</h3>

            {/* Overview Metadata Table */}
            <div className="bg-gray-50 dark:bg-gray-950/40 rounded-2xl p-5 border border-gray-150 dark:border-gray-800/80 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-gray-400">Title</p>
                  <p className="font-bold text-gray-800 dark:text-white mt-0.5">{formValues.title}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400">Type</p>
                  <p className="font-bold text-gray-800 dark:text-white mt-0.5 uppercase">{formValues.type}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400">Subject Code</p>
                  <p className="font-bold text-secondary mt-0.5 uppercase">{formValues.subjectCode}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400">Semester</p>
                  <p className="font-bold text-gray-800 dark:text-white mt-0.5">S{formValues.semester}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400">University</p>
                  <p className="font-bold text-gray-800 dark:text-white mt-0.5">{formValues.university}</p>
                </div>
                {formValues.type === 'paper' && (
                  <div>
                    <p className="font-bold text-gray-400">Exam Year</p>
                    <p className="font-bold text-gray-800 dark:text-white mt-0.5">{formValues.year}</p>
                  </div>
                )}
              </div>

              {file && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-400">Attached File:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{file.name}</span>
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-850 dark:text-gray-200">Legal Ownership Declaration</p>
                <p className="mt-1 text-[11px]">
                  By submitting this file, you confirm that you have the right to share this document and that it does not infringe copyright restrictions. Inappropriate uploads (non-law resources, advertisement spam, malicious files) will be deleted and your account banned.
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

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(3)}
                disabled={loading}
                className="inline-flex items-center gap-1 bg-white dark:bg-gray-850 text-gray-650 dark:text-gray-300 border border-gray-250 dark:border-gray-750 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Agree & Submit'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success State */}
        {step === 5 && (
          <div className="text-center py-10 max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mx-auto ring-4 ring-emerald-100 dark:ring-emerald-950">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Uploaded Successfully!</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Your document has been sent to the moderation queue. The admin team will verify it within a few hours. Once approved, it will be visible in search results and you will be awarded 10 reputation points!
            </p>
            <div className="pt-2">
              <button
                onClick={resetForm}
                className="px-5 py-2.5 bg-primary dark:bg-secondary text-white dark:text-primary font-bold rounded-xl text-xs transition-colors hover:bg-secondary dark:hover:bg-secondary-dark"
              >
                Upload another file
              </button>
            </div>
          </div>
        )}

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
                  <tr className="bg-gray-50 dark:bg-gray-950/50 border-b border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase">
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
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                            : item.status === 'rejected'
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400'
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400'
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
