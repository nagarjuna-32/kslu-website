import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const DownloadModal = ({ isOpen, onClose, material, onDownloadSuccess, user }) => {
  const [downloadForm, setDownloadForm] = useState({
    course: '',
    semester: '',
    name: '',
    email: '',
    college: '',
    purpose: 'Exam Preparation',
    agree1: false,
    agree2: false
  });

  useEffect(() => {
    if (isOpen) {
      setDownloadForm({
        course: '',
        semester: '',
        name: user?.name || '',
        email: user?.email || '',
        college: '',
        purpose: 'Exam Preparation',
        agree1: false,
        agree2: false
      });
    }
  }, [isOpen, user]);

  if (!isOpen || !material) return null;

  const maxSemesters = downloadForm.course.includes('3-Year') ? 6 : 10;

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!downloadForm.agree1 || !downloadForm.agree2) {
      toast.error('Please accept both statements to proceed');
      return;
    }

    onClose();

    // Trigger download & API tracking
    const materialId = material.id || material._id;
    try {
      await api.post(`/materials/${materialId}/download`, {
        studentCourse: downloadForm.course,
        studentSemester: downloadForm.semester,
        college: downloadForm.college,
        purpose: downloadForm.purpose
      });
      if (onDownloadSuccess) onDownloadSuccess();
      window.open(material.fileUrl, '_blank');
    } catch (err) {
      console.error('Download tracking failed:', err);
      window.open(material.fileUrl, '_blank');
    }
  };

  const isSyllabus = material.subjectCode === 'SYLLABUS' || material.subjectName === 'Syllabus';

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh] text-left"
      >
        {/* Modal Title */}
        <div className="text-center space-y-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Download Resource
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
            Select your course and semester to proceed with download
          </p>
        </div>

        {/* Document Summary Block */}
        <div className="bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-[11px] font-semibold">
          <div className="flex items-start gap-2.5">
            <span className="font-bold text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">📄 Resource:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2">{material.title}</span>
          </div>
          {!isSyllabus && material.subjectName && (
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">📖 Subject:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{material.subjectName}</span>
            </div>
          )}
          {material.year && (
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">📅 Academic Year:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{material.year}</span>
            </div>
          )}
        </div>

        {/* Step-by-Step Form */}
        <form onSubmit={handleModalSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          
          {/* Step 1: Select Course */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Step 1: Select Course *
              </label>
              {downloadForm.course && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Selected</span>
              )}
            </div>
            <select
              required
              value={downloadForm.course}
              onChange={(e) => {
                const newCourse = e.target.value;
                setDownloadForm(prev => ({
                  ...prev,
                  course: newCourse,
                  semester: '' // Reset semester when course changes
                }));
              }}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-royal"
            >
              <option value="">-- Select Law Course --</option>
              <option value="3-Year LL.B">3-Year LL.B</option>
              <option value="5-Year B.A. LL.B">5-Year B.A. LL.B</option>
              <option value="5-Year B.B.A. LL.B">5-Year B.B.A. LL.B</option>
              <option value="5-Year B.Com. LL.B">5-Year B.Com. LL.B</option>
              <option value="5-Year B.Sc. LL.B">5-Year B.Sc. LL.B</option>
            </select>
          </div>

          {/* Step 2: Select Semester (Appears ONLY AFTER Course is selected) */}
          {downloadForm.course && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Step 2: Select Semester ({maxSemesters} Semesters) *
                </label>
                {downloadForm.semester && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Selected</span>
                )}
              </div>
              <select
                required
                value={downloadForm.semester}
                onChange={(e) => setDownloadForm(prev => ({ ...prev, semester: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-royal"
              >
                <option value="">-- Select Semester --</option>
                {Array.from({ length: maxSemesters }, (_, i) => i + 1).map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Student Information & Download (Appears ONLY AFTER Semester is selected) */}
          {downloadForm.course && downloadForm.semester && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Step 3: Student Details & Verification
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Your Full Name"
                  value={downloadForm.name}
                  onChange={(e) => setDownloadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email (Optional)</label>
                <input 
                  type="email"
                  placeholder="your.email@example.com"
                  value={downloadForm.email}
                  onChange={(e) => setDownloadForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                />
              </div>

              {/* College */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">College *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Saraswathi Law College, Chitradurga"
                  value={downloadForm.college}
                  onChange={(e) => setDownloadForm(prev => ({ ...prev, college: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal"
                />
              </div>

              {/* Purpose Radio List */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purpose</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Exam Preparation', 'Assignment', 'Research', 'Other'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 dark:bg-slate-955 hover:bg-slate-100/55 dark:hover:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl transition-colors">
                      <input 
                        type="radio" 
                        name="purpose"
                        value={opt}
                        checked={downloadForm.purpose === opt}
                        onChange={(e) => setDownloadForm(prev => ({ ...prev, purpose: e.target.value }))}
                        className="text-royal focus:ring-royal" 
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    required
                    checked={downloadForm.agree1}
                    onChange={(e) => setDownloadForm(prev => ({ ...prev, agree1: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 text-royal focus:ring-royal border-slate-350 dark:border-slate-750 rounded" 
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug font-bold">
                    I agree that these resources are shared by law student contributors.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    required
                    checked={downloadForm.agree2}
                    onChange={(e) => setDownloadForm(prev => ({ ...prev, agree2: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 text-royal focus:ring-royal border-slate-350 dark:border-slate-750 rounded" 
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug font-bold">
                    I understand KSLU Circle is an independent student platform.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-royal dark:bg-secondary text-white dark:text-primary rounded-xl text-xs font-bold hover:scale-[1.01] active:scale-95 shadow transition-all"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default DownloadModal;
