import React, { useState, useEffect } from 'react';
import { X, Loader2, Camera, Video } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { onboardInfluencer, updateInfluencer, updateInfluencerCommissionRate } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Onboard Influencer Modal Component
 */
const OnboardInfluencerModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    tiktok: '',
    instagram: '',
    youtube: '',
    commissionRate: '',
    followers: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || initialData.userId?.name || '',
        email: initialData.userId?.email || '',
        password: '', // Keep empty for security
        bio: initialData.bio || '',
        tiktok: initialData.tiktok || '',
        instagram: initialData.instagram || '',
        youtube: initialData.youtube || '',
        commissionRate: typeof initialData.commissionRate === 'number' ? initialData.commissionRate : '',
        followers: initialData.followers || 0,
        userId: initialData.userId?._id || initialData.userId
      });
    } else {
      setFormData({
        name: '', email: '', password: '', bio: '',
        tiktok: '', instagram: '', youtube: '',
        commissionRate: '', followers: 0
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedRate = formData.commissionRate !== '' && formData.commissionRate !== null && formData.commissionRate !== undefined
        ? Number(formData.commissionRate)
        : null;

      let res;
      if (initialData) {
        // Exclude password if empty during update
        const updateData = { ...formData, commissionRate: parsedRate };
        if (!updateData.password) delete updateData.password;
        res = await updateInfluencer(initialData._id, updateData);
        // Also ensure dedicated commission rate endpoint is synced
        await updateInfluencerCommissionRate(initialData._id, parsedRate);
      } else {
        res = await onboardInfluencer({ ...formData, commissionRate: parsedRate });
      }

      if (res.success) {
        toast.success(initialData ? 'Influencer updated successfully!' : 'Influencer onboarded successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Operation failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'commissionRate' || name === 'followers') {
      if (value === '') {
        setFormData(prev => ({ ...prev, [name]: '' }));
        return;
      }
      const val = Number(value);
      if (val < 0) return;
      setFormData(prev => ({ ...prev, [name]: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-2xl my-auto md:my-8 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="p-5 md:p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className={`text-lg md:text-2xl font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {initialData ? 'Update Influencer' : 'Onboard New Influencer'}
              </h2>
              <p className="text-sm font-bold text-gray-400 uppercase mt-1">
                {initialData ? 'Modify existing partner details' : 'Create a new partner profile'}
              </p>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} placeholder="Enter Name" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter Email Address" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
              </div>
              {!initialData && (
                <div className="space-y-2">
                  <label className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Password</label>
                  <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter Password" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
              )}
              {initialData && (
                <div className="space-y-2">
                  <label className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Password (Leave blank to keep same)</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter Password" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
              )}
              <div className="space-y-2">
                <label className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Custom Commission Rate (%)
                </label>
                <input
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Leave empty for Rate Unset (0-100%)"
                  className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                />
                <p className="text-[11px] font-medium text-gray-400">
                  Optional: Configure 0–100% or leave blank for <strong>Rate Unset</strong>. Unconfigured creators generate no commission records.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Influencer Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Describe the influencer..." className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs resize-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Followers Count</label>
                <input type="number" name="followers" value={formData.followers} onChange={handleChange} min="0" placeholder="0" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`} />
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Instagram Handle</label>
                <div className="relative">
                  <Camera size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="instagram.com/username" className={`w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
              </div>
              <div className="space-y-2 col-span-full">
                <label className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>YouTube Channel</label>
                <div className="relative">
                  <Video size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="youtube" value={formData.youtube} onChange={handleChange} placeholder="youtube.com/channel" className={`w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-xs ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button disabled={loading} type="submit" className="flex-1 order-2 sm:order-1 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:opacity-95 active:opacity-90 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : initialData ? 'Save Changes' : 'Confirm Onboarding'}
              </button>
              <button type="button" onClick={onClose} className={`w-full sm:w-auto order-1 sm:order-2 px-8 py-4 rounded-2xl font-bold text-xs uppercase transition-all ${isDarkMode ? 'bg-gray-900 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardInfluencerModal;
