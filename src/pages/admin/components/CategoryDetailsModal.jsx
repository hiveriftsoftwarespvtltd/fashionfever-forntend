import React, { useState, useEffect } from 'react';
import { Loader2, X, Grid, Clock, Sparkles } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { fetchCategoryById } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';
import { getImageUrl } from '../../../utils/imageUrl';

/**
 * Category Details Modal
 * Pre-populates category information using GET API /admin/fetch-catoegry/:id
 */
const CategoryDetailsModal = ({ categoryId, onClose }) => {
  const { isDarkMode } = useTheme();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!categoryId) return;
      setLoading(true);
      try {
        const response = await fetchCategoryById(categoryId);
        if (response.success) {
          const detail = response.data?.data || response.data;
          setCategory(detail);
        } else {
          toast.error(response.message || 'Failed to fetch category details');
        }
      } catch (err) {
        console.error('Fetch category details error:', err);
        toast.error('Could not load category details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [categoryId]);

  if (!categoryId) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit">
      <div className={`w-full max-w-lg my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase">Fetching Category Details...</span>
          </div>
        ) : category ? (
          <div className="p-6 md:p-8">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center font-bold border shadow-inner flex-shrink-0 ${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-gray-50 border-gray-100'}`}>
                  {(() => {
                    const rawImg = category.image?.url || category.image || category.icon?.url || category.icon;
                    const imgUrl = rawImg ? getImageUrl(rawImg) : null;
                    return (
                      <>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={category.label || category.name || 'Category'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full items-center justify-center ${imgUrl ? 'hidden' : 'flex'}`}>
                          <Grid className="text-primary" size={24} />
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div>
                  <h2 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{category.label || category.name}</h2>
                  <p className="text-sm font-bold text-primary uppercase mt-1">Product Category</p>
                  <p className="text-sm font-bold text-gray-400 uppercase mt-0.5">/{category.slug}</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
                <X size={20} />
              </button>
            </div>

            {/* Category Statistics/Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50 border border-white/5' : 'bg-gray-50 border border-gray-100/50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-bold uppercase ${category.isActive ? 'text-green-500' : 'text-red-500'}`}>{category.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50 border border-white/5' : 'bg-gray-50 border border-gray-100/50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Delete State</p>
                <p className={`text-sm font-bold uppercase ${category.isDeleted ? 'text-red-500' : 'text-gray-400'}`}>
                  {category.isDeleted ? 'Deleted' : 'Available'}
                </p>
              </div>
            </div>

            {/* Description & Details Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase mb-2">Category Description</p>
                <p className={`p-4 rounded-2xl text-xs leading-relaxed border ${isDarkMode ? 'bg-gray-900/20 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
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

            <button onClick={onClose} className="w-full mt-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:opacity-95 active:opacity-90 transition-all cursor-pointer">
              Dismiss Details
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CategoryDetailsModal;
