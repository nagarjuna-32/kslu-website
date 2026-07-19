import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Download, Eye, ThumbsUp, Bookmark, 
  BookmarkCheck, ArrowRight, Calendar, User 
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import DownloadModal from './DownloadModal';

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

  const handleDownload = (e) => {
    e.stopPropagation();
    setShowDownloadModal(true);
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
          {(material.type === 'paper' || material.type === 'pyq' || material.resourceType === 'pyq') && material.year && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              <Calendar className="w-3 h-3" /> Year: {material.year}
            </span>
          )}
          {(material.type === 'paper' || material.type === 'pyq' || material.resourceType === 'pyq') && material.marks && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              📚 {material.marks} Marks
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
        
        {/* Repository Card */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-royal/10 dark:bg-secondary/10 flex items-center justify-center text-royal dark:text-secondary text-[10px] font-black">
              ⚖️
            </div>
            <div className="text-[10px]">
              <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">KSLU Repository</p>
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
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        material={material}
        onDownloadSuccess={() => setDownloadCount(prev => prev + 1)}
        user={user}
      />
    </>
  );
};

export default MaterialCard;
