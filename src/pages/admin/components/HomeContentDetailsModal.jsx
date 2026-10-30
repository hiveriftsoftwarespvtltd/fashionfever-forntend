import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, Calendar, TicketPercent, Eye, MousePointerClick, Tag, Palette } from 'lucide-react';
import { getHomeContentDetails } from '../../../api/adminService';
import config from '../../../config/config';
import apiClient from '../../../api/apiClient';

const SecureImage = ({ src, alt, className, fallback }) => {
  const [imgUrl, setImgUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgUrl('');
      return;
    }

    const isLocalApi = src.includes('/file/get-file/');
    if (!isLocalApi && (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:'))) {
      setImgUrl(src);
      return;
    }

    const fetchImage = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(src, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(response.data);
        setImgUrl(blobUrl);
      } catch (err) {
        console.error('Failed to load secure image:', err);
        setImgUrl(src);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [src]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100/10">
        <Loader2 className="animate-spin text-primary" size={16} />
      </div>
    );
  }

  if (!imgUrl) return fallback || null;

  return (
    <img 
      src={imgUrl} 
      alt={alt} 
      className={className} 
      onError={(e) => {
        if (imgUrl !== src) {
          setImgUrl(src);
        }
      }}
    />
  );
};

const HomeContentDetailsModal = ({ isOpen, id, onClose, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const resolveImageUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') {
      if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('blob:')) {
        return img;
      }
      if (/^[0-9a-fA-F]{24}$/.test(img)) {
        return `${config.API_URL}/file/get-file/${img}`;
      }
      return img;
    }
    if (typeof img === 'object' && img?.url) {
      return img.url;
    }
    return '';
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getHomeContentDetails(id);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load banner details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && id) {
      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, id]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Always Active';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit">
      <div className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="p-5 md:p-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Sparkles size={24} />
              </div>
              <div className="text-left">
                <h2 className={`text-xl font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Banner Details
                </h2>
                <p className="text-sm font-bold text-gray-400 uppercase mt-1">
                  Homepage promotional slots and metadata properties
                </p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-primary" size={36} />
              <span className="text-sm font-bold tracking-widest text-gray-400 uppercase">Synchronizing parameters...</span>
            </div>
          ) : data ? (
            <div className="space-y-6 text-left">
              {/* Media Preview Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Computer Image */}
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase text-gray-400">Desktop Banner Preview</span>
                  <div className={`aspect-[2/1] rounded-2xl overflow-hidden border flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'border-gray-750' : 'border-gray-100 shadow-sm'}`}>
                    {data.computerImage ? (
                      <SecureImage src={resolveImageUrl(data.computerImage)} alt="Desktop Banner" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-400 uppercase">No Desktop Image</span>
                    )}
                  </div>
                </div>

                {/* Mobile Image */}
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase text-gray-400">Mobile Banner Preview</span>
                  <div className={`aspect-[2/1] rounded-2xl overflow-hidden border flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'border-gray-750' : 'border-gray-100 shadow-sm'}`}>
                    {data.mobileImage ? (
                      <SecureImage src={resolveImageUrl(data.mobileImage)} alt="Mobile Banner" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-400 uppercase">No Mobile Image</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Status Badges */}
              <div className="flex flex-wrap gap-2.5">
                <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-sm font-black uppercase tracking-wider">
                  {data.contentType || 'BANNER'}
                </span>
                <span className={`px-3 py-1 rounded-xl text-sm font-black uppercase tracking-wider ${
                  data.isActive 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/10'
                }`}>
                  {data.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-3 py-1 rounded-xl text-sm font-black uppercase tracking-wider ${
                  data.isFeatured 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                }`}>
                  Featured: {data.isFeatured ? 'Yes' : 'No'}
                </span>
                <span className={`px-3 py-1 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                  <Eye size={12} className="text-gray-400" />
                  Views: {data.viewCount || 0}
                </span>
                <span className={`px-3 py-1 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                  <MousePointerClick size={12} className="text-gray-400" />
                  Clicks: {data.clickCount || 0}
                </span>
              </div>

              {/* Detailed parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Titles */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-100'} space-y-3`}>
                  <div>
                    <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">Title Text</h4>
                    <p className={`text-sm font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{data.title || '—'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">Sub Title Text</h4>
                    <p className={`text-xs font-semibold mt-0.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{data.subTitle || '—'}</p>
                  </div>
                  {data.buttonText && (
                    <div>
                      <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">Button CTA</h4>
                      <span className="inline-block px-3 py-1 mt-1 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black uppercase">
                        {data.buttonText}
                      </span>
                    </div>
                  )}
                </div>

                {/* Redirect Controls */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-100'} space-y-3`}>
                  <div>
                    <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">Redirect Type</h4>
                    <span className="inline-block px-2.5 py-0.5 mt-1 rounded-md bg-primary/10 text-primary text-sm font-black uppercase">
                      {data.redirectType || 'NONE'}
                    </span>
                  </div>
                  {data.redirectId && (
                    <div>
                      <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">Target ObjectId</h4>
                      <code className="block text-sm font-bold text-gray-400 mt-0.5 select-all">{data.redirectId}</code>
                    </div>
                  )}
                  {data.redirectUrl && (
                    <div>
                      <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">External Destination URL</h4>
                      <a href={data.redirectUrl} target="_blank" rel="noreferrer" className="block text-sm font-bold text-primary hover:underline mt-0.5 truncate max-w-full">
                        {data.redirectUrl}
                      </a>
                    </div>
                  )}
                </div>

                {/* Scheduling Details */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-100'} space-y-3`}>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-gray-400 mt-0.5 flex-shrink-0" size={15} />
                    <div className="space-y-3 flex-1 min-w-0">
                      <div>
                        <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">Publish Date</h4>
                        <p className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatDate(data.startDate)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">Expiration Date</h4>
                        <p className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatDate(data.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Styling Details */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-100'} space-y-3`}>
                  <div className="flex items-start gap-3">
                    <Palette className="text-gray-400 mt-0.5 flex-shrink-0" size={15} />
                    <div className="space-y-3 flex-1 min-w-0">
                      <div>
                        <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">Background Color</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-5 h-5 rounded-full border shadow-sm flex-shrink-0" style={{ backgroundColor: data.backgroundColor }} />
                          <code className="text-xs font-bold text-gray-500 uppercase">{data.backgroundColor || '—'}</code>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider">Text Color</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-5 h-5 rounded-full border shadow-sm flex-shrink-0" style={{ backgroundColor: data.textColor }} />
                          <code className="text-xs font-bold text-gray-500 uppercase">{data.textColor || '—'}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags/Labels */}
              {data.labels && data.labels.length > 0 && (
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag size={12} className="text-gray-400" />
                    Target Search Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.labels.map((lbl, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase transition-all">
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Box */}
              {data.description && (
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <h4 className="text-sm font-black uppercase text-gray-400 tracking-wider mb-1.5">Description Overview</h4>
                  <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{data.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-rose-500">
              <span className="text-sm font-black uppercase">No Data Found</span>
              <span className="text-sm text-gray-400 uppercase font-medium">Could not fetch banner attributes</span>
            </div>
          )}

          <div className="flex mt-8">
            <button onClick={onClose} className={`w-full py-4 rounded-2xl font-bold text-xs uppercase transition-all cursor-pointer ${isDarkMode ? 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-700/50' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              Dismiss Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeContentDetailsModal;
