import React, { useState, useEffect } from 'react';
import { Loader2, X, BookOpen, Clock, Sparkles } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { getCourseCategoryDetails } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';
import { getImageUrl } from '../../../utils/imageUrl';

/**
 * Course Category Details Modal
 */
const CourseCategoryDetailsModal = ({ courseCategoryId, onClose }) => {
  const { isDarkMode } = useTheme();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!courseCategoryId) return;
      setLoading(true);
      try {
        const response = await getCourseCategoryDetails(courseCategoryId);
        if (response.success && response.data) {
          const detail = response.data?.data || response.data;
          setCategory(detail);
        } else {
          toast.error(response.message || 'Failed to fetch course category details');
        }
      } catch (err) {
        console.error('Fetch course category details error:', err);
        toast.error('Could not load course category details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [courseCategoryId]);

  if (!courseCategoryId) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit text-left">
      <div className={`w-full max-w-lg my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white text-gray-800'}`}>
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase">Fetching Category Details...</span>
          </div>
        ) : category ? (
          <div className="p-6 md:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center font-bold border shadow-inner flex-shrink-0 ${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-gray-50 border-gray-100'}`}>
                  {(() => {
                    const rawIcon = category.icon?.url || category.icon;
                    const iconUrl = rawIcon ? getImageUrl(rawIcon) : null;
                    return (
                      <>
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={category.label || category.name || 'Category'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full items-center justify-center ${iconUrl ? 'hidden' : 'flex'}`}>
                          <BookOpen className="text-primary" size={24} />
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div>
                  <h2 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{category.label || category.name}</h2>
                  <p className="text-sm font-bold text-primary uppercase mt-1">Academy Course Category</p>
                  <p className="text-sm font-bold text-gray-400 uppercase mt-0.5">Name: {category.name}</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
                <X size={20} />
              </button>
            </div>

            {/* Category Statistics/Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-50 border-gray-100/50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-bold uppercase ${category.isActive ? 'text-green-500' : 'text-red-500'}`}>{category.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-50 border-gray-100/50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">System ID</p>
                <span className="text-xs font-mono opacity-50 block truncate">{category._id}</span>
              </div>
            </div>

            {/* Description & Details Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase mb-2">Category Description</p>
                <p className={`p-4 rounded-2xl text-xs leading-relaxed border ${isDarkMode ? 'bg-gray-900/20 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-650'}`}>
                  {category.description || 'No description provided.'}
                </p>
              </div>

              {/* Tags list */}
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase mb-2">Assigned Search Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {category.tags && category.tags.length > 0 ? (
                    category.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-primary/10 text-primary text-sm font-bold uppercase flex items-center gap-1">
                        <Sparkles size={8} /> {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">No tags assigned.</span>
                  )}
                </div>
              </div>

              {/* Created / Updated timestamps */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900/20 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-bold uppercase flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" /> Created At
                  </span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {new Date(category.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" /> Last Updated
                  </span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {new Date(category.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="w-full py-4 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer">
              Dismiss Details
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CourseCategoryDetailsModal;
