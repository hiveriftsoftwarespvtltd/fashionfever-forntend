import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, Upload, Calendar } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { addHomeContent, updateHomeContent } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';
import config from '../../../config/config';

const CreateHomeContentModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  
  // File state
  const [compFile, setCompFile] = useState(null);
  const [compPreview, setCompPreview] = useState(null);
  const [mobFile, setMobFile] = useState(null);
  const [mobPreview, setMobPreview] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    subTitle: '',
    description: '',
    labels: '',
    contentType: 'BANNER',
    redirectType: 'NONE',
    redirectId: '',
    redirectUrl: '',
    backgroundColor: '#da016a',
    textColor: '#ffffff',
    displayOrder: '1',
    isActive: true,
    startDate: '',
    endDate: '',
    isFeatured: false,
    page: '1',
    buttonText: 'Click Here'
  });

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
    if (isOpen) {
      if (editData) {
        setFormData({
          title: editData.title || '',
          subTitle: editData.subTitle || '',
          description: editData.description || '',
          labels: Array.isArray(editData.labels) ? editData.labels.join(', ') : (editData.labels || ''),
          contentType: editData.contentType || 'BANNER',
          redirectType: editData.redirectType || 'NONE',
          redirectId: editData.redirectId || '',
          redirectUrl: editData.redirectUrl || '',
          backgroundColor: editData.backgroundColor || '#da016a',
          textColor: editData.textColor || '#ffffff',
          displayOrder: String(editData.displayOrder || '1'),
          isActive: editData.isActive ?? true,
          startDate: editData.startDate ? editData.startDate.substring(0, 10) : '',
          endDate: editData.endDate ? editData.endDate.substring(0, 10) : '',
          isFeatured: editData.isFeatured ?? false,
          page: String(editData.page || '1'),
          buttonText: editData.buttonText || 'Click Here'
        });
        setCompFile(null);
        setCompPreview(resolveImageUrl(editData.computerImage));
        setMobFile(null);
        setMobPreview(resolveImageUrl(editData.mobileImage));
      } else {
        setFormData({
          title: '',
          subTitle: '',
          description: '',
          labels: '',
          contentType: 'BANNER',
          redirectType: 'NONE',
          redirectId: '',
          redirectUrl: '',
          backgroundColor: '#da016a',
          textColor: '#ffffff',
          displayOrder: '1',
          isActive: true,
          startDate: '',
          endDate: '',
          isFeatured: false,
          page: '1',
          buttonText: 'Click Here'
        });
        setCompFile(null);
        setCompPreview(null);
        setMobFile(null);
        setMobPreview(null);
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCompFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompFile(file);
      setCompPreview(URL.createObjectURL(file));
    }
  };

  const handleMobFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobFile(file);
      setMobPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const loadingToast = toast.loading(editData ? 'Updating homepage content...' : 'Adding homepage content...');

    try {
      // Process labels array
      const labelsArray = formData.labels
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        ...formData,
        labels: labelsArray,
        computerImage: compFile,
        mobileImage: mobFile
      };

      let res;
      if (editData) {
        res = await updateHomeContent(editData._id, payload);
      } else {
        if (!compFile) {
          toast.error('Please upload a desktop banner image.');
          setLoading(false);
          toast.dismiss(loadingToast);
          return;
        }
        payload.computerImage = compFile;
        payload.mobileImage = mobFile || compFile;
        res = await addHomeContent(payload);
      }
      
      toast.dismiss(loadingToast);

      if (res.success) {
        toast.success(res.message || (editData ? 'Homepage content updated successfully!' : 'Homepage content added successfully!'));
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Failed to submit homepage content.');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error('System error while adding homepage content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit">
      <div className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="p-5 md:p-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className={`text-xl font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editData ? 'Edit Homepage Content' : 'Add Homepage Content'}
                </h2>
                <p className="text-sm font-bold text-gray-400 uppercase mt-1">
                  {editData ? 'Modify promotional banners, slides and redirect triggers' : 'Upload promotional banners, slides and redirect triggers'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="grid grid-cols-1 gap-5">
              
              {/* Media File Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Computer Image */}
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Desktop Cover Image (Required)</label>
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-2xl overflow-hidden border flex flex-shrink-0 items-center justify-center ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
                      {compPreview ? (
                        <img src={compPreview} alt="Comp" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold uppercase cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700 shadow-sm'}`}>
                        <Upload size={12} />
                        Upload Desktop Image
                        <input type="file" accept="image/*" onChange={handleCompFileChange} className="hidden" />
                      </label>
                      <p className="text-[8px] font-medium text-gray-400 uppercase mt-1">PNG, JPG. Desktop ratio (e.g. 1920x600).</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Image */}
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Mobile Cover Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-2xl overflow-hidden border flex flex-shrink-0 items-center justify-center ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
                      {mobPreview ? (
                        <img src={mobPreview} alt="Mob" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold uppercase cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700 shadow-sm'}`}>
                        <Upload size={12} />
                        Upload Mobile Image
                        <input type="file" accept="image/*" onChange={handleMobFileChange} className="hidden" />
                      </label>
                      <p className="text-[8px] font-medium text-gray-400 uppercase mt-1">PNG, JPG. Portrait ratio (e.g. 750x1000).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text configurations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Title</label>
                  <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Welcome Offer" className={`w-full px-4 py-3 rounded-2xl text-xs font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Sub Title</label>
                  <input name="subTitle" value={formData.subTitle} onChange={handleChange} placeholder="e.g. Get 50% Off Today" className={`w-full px-4 py-3 rounded-2xl text-xs font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Content Type</label>
                  <select name="contentType" value={formData.contentType} onChange={handleChange} className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}>
                    <option value="BANNER">BANNER</option>
                    <option value="SLIDER">SLIDER</option>
                    <option value="PROMO">PROMO</option>
                    <option value="FEATURE">FEATURED BANNER</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Page Number / Placement</label>
                  <input name="page" value={formData.page} onChange={handleChange} placeholder="e.g. 1" className={`w-full px-4 py-3 rounded-2xl text-xs font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
              </div>

              {/* Redirect bindings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Redirect Type</label>
                  <select name="redirectType" value={formData.redirectType} onChange={handleChange} className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}>
                    <option value="NONE">NONE</option>
                    <option value="PRODUCT">PRODUCT</option>
                    <option value="CATEGORY">CATEGORY</option>
                    <option value="EXTERNAL">EXTERNAL URL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Redirect Product/Category ID</label>
                  <input name="redirectId" value={formData.redirectId} onChange={handleChange} placeholder="e.g. 6a27a66af..." className={`w-full px-4 py-3 rounded-2xl text-xs font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Redirect External URL</label>
                  <input name="redirectUrl" value={formData.redirectUrl} onChange={handleChange} placeholder="e.g. https://google.com" className={`w-full px-4 py-3 rounded-2xl text-xs font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
              </div>

              {/* Color styling */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Labels (Comma Separated)</label>
                  <input name="labels" value={formData.labels} onChange={handleChange} placeholder="e.g. Summer, Sale, MakeUp" className={`w-full px-4 py-3 rounded-2xl text-xs font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">BG Color</label>
                  <div className="flex gap-2">
                    <input type="color" name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} className="w-8 h-8 rounded-lg border-none cursor-pointer p-0" />
                    <input name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} className={`w-full px-3 py-1.5 rounded-xl text-xs outline-none border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Text Color</label>
                  <div className="flex gap-2">
                    <input type="color" name="textColor" value={formData.textColor} onChange={handleChange} className="w-8 h-8 rounded-lg border-none cursor-pointer p-0" />
                    <input name="textColor" value={formData.textColor} onChange={handleChange} className={`w-full px-3 py-1.5 rounded-xl text-xs outline-none border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'}`} />
                  </div>
                </div>
              </div>

              {/* Order & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Display Order</label>
                  <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} min="0" className={`w-full px-4 py-3 rounded-2xl text-xs font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      onClick={(e) => e.target.showPicker?.()}
                      className={`w-full pl-10 pr-3 py-3 rounded-2xl text-xs font-medium outline-none border transition-all cursor-pointer ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}
                    />
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={15} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">End Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      onClick={(e) => e.target.showPicker?.()}
                      className={`w-full pl-10 pr-3 py-3 rounded-2xl text-xs font-medium outline-none border transition-all cursor-pointer ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}
                    />
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={15} />
                  </div>
                </div>
              </div>

              {/* Description & Action Button */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Button Text</label>
                  <input name="buttonText" value={formData.buttonText} onChange={handleChange} placeholder="e.g. Shop Now" className={`w-full px-4 py-3 rounded-2xl text-xs font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
                <div className="flex gap-8 items-center pt-5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4.5 h-4.5 text-primary bg-gray-100 border-gray-300 rounded-lg focus:ring-primary focus:ring-2" />
                    <span className="text-xs font-bold uppercase text-gray-400">Is Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4.5 h-4.5 text-primary bg-gray-100 border-gray-300 rounded-lg focus:ring-primary focus:ring-2" />
                    <span className="text-xs font-bold uppercase text-gray-400">Is Featured</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Description Overview</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Banner body description..." className={`w-full px-4 py-3 rounded-2xl text-xs font-medium outline-none border transition-all resize-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}></textarea>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button disabled={loading} type="submit" className="flex-1 order-2 sm:order-1 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:opacity-95 active:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                {loading ? <Loader2 size={18} className="animate-spin" /> : editData ? 'Update Banner Content' : 'Confirm Banner Content'}
              </button>
              <button type="button" onClick={onClose} className={`w-full sm:w-auto order-1 sm:order-2 px-8 py-4 rounded-2xl font-bold text-xs uppercase transition-all cursor-pointer ${isDarkMode ? 'bg-gray-900 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateHomeContentModal;
