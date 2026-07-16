import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Download, Eye, ThumbsUp, Bookmark, 
  BookmarkCheck, ArrowRight, Calendar, User 
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const MaterialCard = ({ material, initialBookmarked = false, onBookmarkToggle = null }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const materialId = material.id || material._id;
  const userId = user?.id || user?._id;

  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [votes, setVotes] = useState({
    upvotes: material.upvotes || 0,
    userVote: (material.upvotedBy || []).includes(userId) ? 'up' : (material.downvotedBy || []).includes(userId) ? 'down' : 'none'
  });
  const [downloadCount, setDownloadCount] = useState(material.downloads || 0);
  // tags can be array or string from backend — normalize to string for safe checks
  const tagsStr = Array.isArray(material.tags) ? material.tags.join(', ') : (material.tags || '');
  const isSyllabus = material.subjectCode === 'SYLLABUS' || material.subjectName === 'Syllabus' || tagsStr.toLowerCase().includes('syllabus') || material.title?.toLowerCase().includes('syllabus');

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadForm, setDownloadForm] = useState({
    name: '',
    email: '',
    college: '',
    purpose: 'Exam Preparation',
    agree1: false,
    agree2: false
  });

  useEffect(() => {
    if (user) {
      setDownloadForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const triggerDownloadFile = async () => {
    try {
      await api.post(`/materials/${materialId}/download`);
      setDownloadCount(prev => prev + 1);
      window.open(material.fileUrl, '_blank');
      toast.success('Starting file download...');
    } catch (err) {
      toast.error(err.message || 'Failed to download file');
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!downloadForm.agree1 || !downloadForm.agree2) {
      toast.error('Please accept the agreement terms');
      return;
    }
    
    localStorage.setItem('kslu_circle_download_profile', JSON.stringify({
      name: downloadForm.name,
      email: downloadForm.email,
      college: downloadForm.college,
      purpose: downloadForm.purpose
    }));
    setShowDownloadModal(false);
    await triggerDownloadFile();
  };

  const handleCardClick = () => {
    navigate(`/materials/${materialId}`);
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to bookmark study materials');
      return navigate('/login');
    }

    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${materialId}`);
        setIsBookmarked(false);
        toast.success('Removed from bookmarks');
      } else {
        await api.post('/bookmarks', { materialId: materialId });
        setIsBookmarked(true);
        toast.success('Saved to bookmarks');
      }
      if (onBookmarkToggle) onBookmarkToggle(materialId, !isBookmarked);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVote = async (e, direction) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return navigate('/login');
    }

    // Toggle logic
    const nextVote = votes.userVote === direction ? 'none' : direction;

    try {
      const response = await api.post(`/materials/${materialId}/rate`, { direction: nextVote });
      if (response.data.success) {
        setVotes({
          upvotes: response.data.upvotes,
          userVote: response.data.userVote
        });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    
    // Check if profile exists in local storage
    const storedProfile = localStorage.getItem('kslu_circle_download_profile');
    if (storedProfile) {
      await triggerDownloadFile();
    } else {
      setShowDownloadModal(true);
    }
  };

  const formattedDate = new Date(material.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="group cursor-pointer bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800/80 hover:border-slate-400 dark:hover:border-secondary rounded-2xl p-5 flex flex-col justify-between shadow-[0_2px_8px_-3px_rgba(0,0,0,0.08),0_1px_4px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      >
      <div>
        {/* Top Header Badge */}
        <div className="flex justify-between items-center mb-3">
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase ${
            material.type === 'note' 
              ? 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300' 
              : 'bg-amber-50/80 dark:bg-secondary/10 text-amber-600 dark:text-secondary'
          }`}>
            {material.type === 'note' ? '📝 Note' : '📄 Paper'}
          </span>
          <button 
            onClick={handleBookmark}
            className="p-1.5 rounded-lg text-gray-400 hover:text-secondary dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-secondary" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Subject Code & Semester */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-secondary tracking-wider uppercase bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded">
            {material.subjectCode}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Sem {material.semester} • {material.university}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary dark:group-hover:text-secondary transition-colors mb-2">
          {material.title}
        </h3>

        {/* Subject Name */}
        {material.subjectName && !isSyllabus && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium line-clamp-1 mb-4">
            {material.subjectName}
          </p>
        )}

        {/* Year & Marks badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {material.type === 'paper' && material.year && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              <Calendar className="w-3 h-3" /> Year: {material.year}
            </span>
          )}
          {material.marks && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              📚 {material.marks} Marks
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
        
        {/* User Card */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <img 
              src={material.uploadedBy?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${material.uploadedBy?.name || 'U'}`} 
              alt={material.uploadedBy?.name}
              className="w-6.5 h-6.5 rounded-lg object-cover ring-1 ring-gray-100 dark:ring-gray-800"
            />
            <div className="text-[10px]">
              <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{material.uploadedBy?.name || 'Community Member'}</p>
              <p className="text-gray-450 dark:text-gray-500">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Meta Stats Panel */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Views">
              <Eye className="w-3.5 h-3.5 text-gray-400" /> {material.views || 0}
            </span>
            <span className="flex items-center gap-1" title="Downloads">
              <Download className="w-3.5 h-3.5 text-gray-400" /> {downloadCount}
            </span>
            <button 
              onClick={(e) => handleVote(e, 'up')}
              className={`flex items-center gap-1 hover:text-emerald-500 transition-colors ${votes.userVote === 'up' ? 'text-emerald-500 font-semibold' : 'text-gray-400'}`}
              title="Upvote"
            >
              <ThumbsUp className="w-3.5 h-3.5" /> {votes.upvotes}
            </button>
          </div>

          <button 
            onClick={handleDownload}
            className="flex items-center gap-1 text-[11px] font-bold bg-primary dark:bg-gray-800 text-white dark:text-secondary hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white px-3 py-1.5 rounded-xl transition-all shadow-sm"
          >
            Download <Download className="w-3 h-3" />
          </button>
        </div>

      </div>

      </div>

      {/* Download Resource Modal Gate */}
      {showDownloadModal && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowDownloadModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
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
                Please complete this verification step to download
              </p>
            </div>

            {/* Document Details Block */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-3 text-[11px] font-semibold">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">📄 Resource:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2">{material.title}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">📚 Course:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{material.course || 'B.A. LL.B'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">🎓 Semester:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Semester {material.semester}</span>
              </div>
              {!isSyllabus && (
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-400 dark:text-slate-550 w-24 flex-shrink-0">📖 Subject:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{material.subjectName || 'Constitutional Law'}</span>
                </div>
              )}
              {material.year && (
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">📅 Academic Year:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{material.year}</span>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Your Name"
                  value={downloadForm.name}
                  onChange={(e) => setDownloadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-royal"
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
                    I agree that these resources are shared by contributors.
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
                  onClick={() => setShowDownloadModal(false)}
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

            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialCard;
