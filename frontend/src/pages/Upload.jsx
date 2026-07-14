import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  UploadCloud, FileText, Check, ShieldAlert, BookOpen, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SUBJECTS_MAP } from '../utils/coursesData';

const Upload = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [myUploads, setMyUploads] = useState([]);
  const [myUploadsLoading, setMyUploadsLoading] = useState(true);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      resourceType: 'note',
      course: '3-Year LL.B',
      semester: '1',
      university: 'KSLU',
      marks: '80',
      year: new Date().getFullYear().toString(),
      subjectCode: '',
      subjectName: ''
    }
  });

  const resourceType = watch('resourceType');
  const selectedCourse = watch('course');
  const selectedSemester = watch('semester');
  const watchedSubjectName = watch('subjectName');

  const courseId = selectedCourse?.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  const subjectsList = SUBJECTS_MAP[courseId]?.[selectedSemester] || [];

  // Sync custom subject fields when course/semester/subject changes
  useEffect(() => {
    if (watchedSubjectName && watchedSubjectName !== 'Other') {
      const exists = subjectsList.some(s => s.name === watchedSubjectName);
      if (!exists && watchedSubjectName !== 'Syllabus') {
        setValue('customSubjectName', watchedSubjectName);
        const watchedCode = watch('subjectCode');
        if (watchedCode) {
          setValue('customSubjectCode', watchedCode);
        }
      }
    }
  }, [watchedSubjectName, selectedCourse, selectedSemester, subjectsList, setValue]);

  // Pre-fill fields from URL query parameters (from subject pages)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('subjectCode');
    const name = params.get('subjectName');
    const courseParam = params.get('course');
    if (code) setValue('subjectCode', code.toUpperCase());
    if (name) setValue('subjectName', decodeURIComponent(name));
    if (courseParam) setValue('course', decodeURIComponent(courseParam));
  }, [location, setValue]);

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

    let dbType = 'note';
    let extraTags = [];
    if (data.resourceType === 'pyq') {
      dbType = 'paper';
    } else if (data.resourceType === 'syllabus') {
      dbType = 'note';
      extraTags.push('syllabus');
    } else if (data.resourceType === 'important') {
      dbType = 'note';
      extraTags.push('important');
    }

    let finalTags = data.tags || '';
    if (extraTags.length > 0) {
      finalTags = finalTags ? `${finalTags}, ${extraTags.join(', ')}` : extraTags.join(', ');
    }

    const isSyllabus = data.resourceType === 'syllabus';
    let finalSubjectName = data.subjectName || '';
    let finalSubjectCode = data.subjectCode || '';

    if (data.subjectName === 'Other' || (!subjectsList.some(s => s.name === data.subjectName) && data.subjectName !== '')) {
      finalSubjectName = data.customSubjectName || data.subjectName;
      finalSubjectCode = data.customSubjectCode || (finalSubjectName || "KSLU").slice(0, 10).toUpperCase();
    }

    const generatedSubjectCode = isSyllabus ? 'SYLLABUS' : (finalSubjectCode || (finalSubjectName || "KSLU").slice(0, 10).toUpperCase());

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', dbType);
    formData.append('subjectCode', generatedSubjectCode);
    formData.append('subjectName', isSyllabus ? 'Syllabus' : finalSubjectName);
    formData.append('semester', data.semester);
    formData.append('university', 'KSLU');
    formData.append('course', data.course);

    if (data.resourceType === 'pyq') {
      formData.append('marks', data.marks || '80');
      formData.append('year', data.year);
    } else {
      formData.append('marks', '80');
    }

    formData.append('description', data.description || '');
    formData.append('tags', finalTags);
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
          resourceType: 'note',
          course: '3-Year LL.B',
          semester: '1',
          university: 'KSLU',
          marks: '80',
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
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">{t('shareResources')}</span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
          <UploadCloud className="w-8 h-8 text-royal dark:text-secondary" /> {t('uploadTitle')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          {t('uploadSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel (Col-span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('docInfo')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('lawCourse')} *</label>
                <select
                  {...register('course', { required: true })}
                  className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                >
                  <option value="3-Year LL.B">3-Year LL.B</option>
                  <option value="B.A. LL.B">B.A. LL.B</option>
                  <option value="B.B.A. LL.B">B.B.A. LL.B</option>
                  <option value="B.Com. LL.B">B.Com. LL.B</option>
                  <option value="B.Sc. LL.B">B.Sc. LL.B</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('semester')} *</label>
                <select
                  {...register('semester', { required: true })}
                  className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(sem => (
                    <option key={sem} value={sem}>{t('semester')} {sem}</option>
                  ))}
                </select>
              </div>

              {/* Subject Name Selection */}
              {resourceType !== 'syllabus' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('subjectName')} *</label>
                    <select
                      value={subjectsList.some(s => s.name === watchedSubjectName) ? watchedSubjectName : (watchedSubjectName === '' ? '' : 'Other')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setValue('subjectName', 'Other');
                          setValue('subjectCode', 'CUSTOM');
                        } else {
                          setValue('subjectName', val);
                          const matchingSubject = subjectsList.find(s => s.name === val);
                          if (matchingSubject) {
                            setValue('subjectCode', matchingSubject.code);
                          }
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                    >
                      <option value="">-- Select Subject --</option>
                      {subjectsList.map(sub => (
                        <option key={sub.code} value={sub.name}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                      <option value="Other">Other / Custom Subject</option>
                    </select>
                    {errors.subjectName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.subjectName.message}</p>}
                  </div>

                  {/* Custom Subject Fields */}
                  {(watchedSubjectName === 'Other' || (!subjectsList.some(s => s.name === watchedSubjectName) && watchedSubjectName !== '' && watchedSubjectName !== undefined)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Custom Subject Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Special Law Paper"
                          {...register('customSubjectName', { required: watchedSubjectName === 'Other' ? 'Custom Subject Name is required' : false })}
                          className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                        />
                        {errors.customSubjectName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.customSubjectName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Custom Subject Code (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. KSLU-SPEC"
                          {...register('customSubjectCode')}
                          className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resource Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Resource Type *</label>
                <select
                  {...register('resourceType', { required: true })}
                  className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                >
                  <option value="note">Notes</option>
                  <option value="pyq">PYQ</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="important">Important Questions</option>
                </select>
              </div>

              {/* Only for PYQ: Marks and Exam Year */}
              {resourceType === 'pyq' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('marks')} / Scheme *</label>
                    <select
                      {...register('marks', { required: true })}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                    >
                      <option value="80">80 Marks Scheme</option>
                      <option value="100">100 Marks Scheme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('examYear')} *</label>
                    <input
                      type="number"
                      placeholder="e.g. 2024"
                      {...register('year', { required: 'Exam Year is required', min: { value: 2000, message: 'Invalid Year' } })}
                      className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                    />
                    {errors.year && <p className="text-xs text-red-500 mt-1 font-medium">{errors.year.message}</p>}
                  </div>
                </>
              )}

              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('docTitle')} *</label>
                <input
                  type="text"
                  placeholder="e.g. Contract Law Unit 1 Summary"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1 font-medium">{errors.title.message}</p>}
              </div>

            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('description')}</label>
              <textarea
                rows={3}
                placeholder="Describe your notes or document context. Highlight specific topics covered..."
                {...register('description')}
                className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('tags')}</label>
              <input
                type="text"
                placeholder="e.g. contracts, case laws, unit-1, syllabus"
                {...register('tags')}
                className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-royal"
              />
            </div>
            
            {/* Terms checkbox */}
            <div className="bg-amber-50/30 dark:bg-amber-955/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-655 dark:text-slate-400">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-850 dark:text-slate-200">{t('ownershipTitle')}</p>
                <p className="mt-1 text-[10px]">
                  {t('ownershipText')}
                </p>
              </div>
            </div>

            {/* Upload progress indicator */}
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Uploading PDF file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-royal h-full transition-all duration-100" 
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
              {loading ? 'Uploading File...' : t('uploadBtn')}
            </button>
          </form>
        </div>

        {/* Sidebar / Upload Panel (Col-span 1) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('attachementTitle')}</h2>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-55 dark:hover:bg-slate-955/40 transition-colors relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div className="flex flex-col items-center gap-3">
                <UploadCloud className="w-10 h-10 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('fileDragDrop')}</p>
                  <p className="text-[10px] text-slate-455 dark:text-slate-500 mt-1">{t('fileClickBrowse')}</p>
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
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
                    <p className="text-xs font-bold text-slate-855 dark:text-slate-250 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-455 dark:text-slate-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded flex-shrink-0">{t('attachementPreview')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Uploads History List Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('historyTitle')}</h3>
        
        {myUploadsLoading ? (
          <LoadingSpinner size="md" />
        ) : myUploads.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl text-xs text-slate-500">
            {t('historyEmpty')}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-955/50 border-b border-slate-150 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                    <th className="p-4">{t('tblTitle')}</th>
                    <th className="p-4">{t('tblType')}</th>
                    <th className="p-4">{t('tblCourse')}</th>
                    <th className="p-4">{t('tblCode')}</th>
                    <th className="p-4">{t('tblDate')}</th>
                    <th className="p-4 text-center">{t('tblDownloads')}</th>
                    <th className="p-4 text-right">{t('tblStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {myUploads.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="p-4 font-bold text-slate-850 dark:text-slate-255 truncate max-w-xs">{item.title}</td>
                      <td className="p-4">
                        <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-450 font-bold">{item.course || "3-Year LL.B"}</td>
                      <td className="p-4 font-semibold text-secondary uppercase">{item.subjectCode}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
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
                            {t('reasonRejected')}: {item.rejectionReason}
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
