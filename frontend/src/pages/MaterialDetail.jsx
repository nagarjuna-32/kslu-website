import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MaterialCard from '../components/materials/MaterialCard';
import { 
  FileText, Download, Eye, ThumbsUp, Bookmark, 
  BookmarkCheck, Share2, ArrowLeft, GraduationCap, Calendar, 
  User as UserIcon, Copy, Link as LinkIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [material, setMaterial] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0, userVote: 'none' });
  const [downloads, setDownloads] = useState(0);

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
      await api.post(`/materials/${material._id}/download`);
      setDownloads(prev => prev + 1);
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

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/materials/${id}`);
      if (response.data.success) {
        const mat = response.data.material;
        setMaterial(mat);
        setDownloads(mat.downloads || 0);
        setVotes({
          upvotes: mat.upvotes || 0,
          downvotes: mat.downvotes || 0,
          userVote: (mat.upvotedBy || []).includes(user?._id) ? 'up' : (mat.downvotedBy || []).includes(user?._id) ? 'down' : 'none'
        });

        // Check if bookmarked
        if (isAuthenticated) {
          const bResponse = await api.get('/bookmarks');
          if (bResponse.data.success) {
            const hasBookmark = bResponse.data.bookmarks.some(b => b.material._id === mat._id);
            setIsBookmarked(hasBookmark);
          }
        }

        // Fetch similar (based on subjectCode)
        const simResponse = await api.get(`/materials?subjectCode=${mat.subjectCode}`);
        if (simResponse.data.success) {
          setSimilar(simResponse.data.materials.filter(m => m._id !== mat._id).slice(0, 3));
        }
      }
    } catch (err) {
      toast.error('Failed to load resource details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, isAuthenticated]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save bookmarks');
      return navigate('/login');
    }

    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${material._id}`);
        setIsBookmarked(false);
        toast.success('Removed bookmark');
      } else {
        await api.post('/bookmarks', { materialId: material._id });
        setIsBookmarked(true);
        toast.success('Bookmarked successfully');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVote = async (direction) => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return navigate('/login');
    }

    const nextVote = votes.userVote === direction ? 'none' : direction;

    try {
      const response = await api.post(`/materials/${material._id}/rate`, { direction: nextVote });
      if (response.data.success) {
        setVotes({
          upvotes: response.data.upvotes,
          downvotes: response.data.downvotes,
          userVote: response.data.userVote
        });
        toast.success(nextVote === 'up' ? 'Upvoted study material' : nextVote === 'down' ? 'Downvoted study material' : 'Vote removed');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDownload = async () => {
    // Check if profile exists in local storage
    const storedProfile = localStorage.getItem('kslu_circle_download_profile');
    if (storedProfile) {
      await triggerDownloadFile();
    } else {
      setShowDownloadModal(true);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Share link copied to clipboard!');
  };

  const shareOnWhatsApp = () => {
    const text = `Hey! Check out this KSLU study resource: "${material.title}" on KSLU Circle! ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!material) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h3 className="text-lg font-black text-gray-800">Resource not found</h3>
        <Link to="/notes" className="text-secondary font-semibold hover:underline">Back to notes</Link>
      </div>
    );
  }

  const formattedDate = new Date(material.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      <SEO 
        title={`${material.title} (${material.subjectCode})`}
        description={material.description || `Download ${material.title} (${material.subjectName}) law notes and previous year question papers on KSLU Circle.`}
        keywords={[material.subjectCode, material.subjectName || '', material.type, 'KSLU notes']}
        canonicalUrl={`https://kslucircle.online/materials/${material.id}`}
        ogType="article"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": material.title,
          "description": material.description || `Law study resource for ${material.subjectName || 'KSLU subjects'} (${material.subjectCode}).`,
          "educationalLevel": `${material.semester} Semester`,
          "inLanguage": "en",
          "genre": material.type === 'note' ? 'Lecture Notes' : 'Previous Year Question Paper',
          "keywords": `${material.subjectCode}, KSLU, Law, ${material.type}`,
          "publisher": {
            "@type": "Organization",
            "name": "KSLU Circle",
            "url": "https://kslucircle.online"
          },
          "author": {
            "@type": "Person",
            "name": material.uploadedBy?.name || "KSLU Circle Contributor"
          }
        }}
      />
      
      {/* Breadcrumbs / Back button */}
      <div className="flex justify-between items-center">
        <Link 
          to={material.type === 'note' ? '/notes' : '/papers'} 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details Panel (Left / Col-Span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Headers */}
            <div className="space-y-3">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase ${
                material.type === 'note' 
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' 
                  : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
              }`}>
                {material.type === 'note' ? '📝 Class Note' : '📄 Question Paper'}
              </span>
              
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                {material.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-xs font-bold text-secondary tracking-wider uppercase bg-yellow-50 dark:bg-yellow-950/20 px-2.5 py-0.5 rounded-lg">
                  {material.subjectCode}
                </span>
                <span className="text-[11px] font-semibold text-gray-550 dark:text-gray-400">
                  Semester {material.semester} • {material.university}
                </span>
                {material.type === 'paper' && material.year && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                    <Calendar className="w-3.5 h-3.5" /> Exam Year: {material.year}
                  </span>
                )}
                {material.marks && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                    📚 Scheme: {material.marks} Marks
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {material.description && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {material.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {material.tags && material.tags.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {material.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* PDF View Frame */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Interactive Document Preview</h4>
              <iframe 
                src={material.fileUrl} 
                className="w-full h-[550px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20"
                title={material.title}
              />
            </div>

          </div>

        </div>

        {/* Info Stats / Uploader Bar (Right Panel) */}
        <div className="space-y-6">
          
          {/* Uploader Details Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3">Author Info</h3>
            
            <div className="flex items-center gap-3">
              <img 
                src={material.uploadedBy?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${material.uploadedBy?.name || 'U'}`} 
                alt={material.uploadedBy?.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-secondary/20"
              />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{material.uploadedBy?.name || 'Community Member'}</h4>
                <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5 truncate max-w-[170px]">KSLU Student Member</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-950/40 rounded-2xl p-4 text-center">
              <div>
                <p className="text-[10px] text-gray-450 uppercase font-semibold">Reputation</p>
                <p className="text-sm font-black text-secondary mt-0.5">{material.uploadedBy?.reputation || 0} ⭐</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-450 uppercase font-semibold">Uploads</p>
                <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{material.uploadedBy?.totalUploads || 0}</p>
              </div>
            </div>

            <div className="text-[10px] text-gray-450 dark:text-gray-500 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex justify-between">
                <span>Date Published:</span>
                <span className="font-bold text-gray-800 dark:text-gray-300">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Views:</span>
                <span className="font-bold text-gray-800 dark:text-gray-300">{material.views || 0} hits</span>
              </div>
              <div className="flex justify-between">
                <span>Total Downloads:</span>
                <span className="font-bold text-gray-800 dark:text-gray-300">{downloads} saves</span>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-primary font-bold rounded-xl text-xs hover:bg-secondary-dark transition-colors shadow-md"
            >
              Download PDF File <Download className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBookmark}
                className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-255 dark:border-gray-750 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {isBookmarked ? (
                  <>
                    Saved <BookmarkCheck className="w-4 h-4 text-secondary" />
                  </>
                ) : (
                  <>
                    Save <Bookmark className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => handleVote('up')}
                className={`flex items-center justify-center gap-1.5 py-2.5 border border-gray-255 dark:border-gray-750 rounded-xl text-xs font-bold hover:text-emerald-500 transition-colors ${
                  votes.userVote === 'up' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/5' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Upvote <ThumbsUp className="w-4 h-4" />
                <span className="text-[10px]">{votes.upvotes}</span>
              </button>
            </div>

            {/* Share panel */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2 space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Share Resource</h4>
              <div className="flex gap-2">
                <button 
                  onClick={copyShareLink}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </button>
                <button 
                  onClick={shareOnWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 hover:bg-emerald-100/50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Similar resources recommendations */}
          {similar.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Related Files</h3>
              <div className="space-y-4">
                {similar.map(mat => (
                  <MaterialCard key={mat._id} material={mat} />
                ))}
              </div>
            </div>
          )}

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
              <p className="text-[10px] text-slate-450 dark:text-slate-550 font-bold">
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
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">📖 Subject:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{material.subjectName || 'Constitutional Law'}</span>
              </div>
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

    </div>
  );
};

export default MaterialDetail;
