import React, { useState, useEffect } from 'react';
import { TicketPercent, X, Loader2, Calendar } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { getCouponById, createCoupon, updateCoupon } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Coupon Details Modal
 */
export const CouponDetailsModal = ({ couponId, onClose }) => {
  const { isDarkMode } = useTheme();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!couponId) return;
      setLoading(true);
      try {
        const response = await getCouponById(couponId);
        if (response.success) {
          setCoupon(response.data?.data || response.data);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchDetail();
  }, [couponId]);

  if (!couponId) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-lg my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase">Fetching Coupon Details...</span>
          </div>
        ) : coupon ? (
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <TicketPercent size={24} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{coupon.code}</h2>
                  <p className="text-sm font-bold text-gray-400 uppercase">{coupon.type} Discount</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Value</p>
                <p className="text-lg font-bold text-primary">{coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</p>
              </div>
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Total Used</p>
                <p className="text-lg font-bold text-gray-400">{coupon.totalUsed} <span className="text-xs">/ {coupon.totalUsageLimit}</span></p>
              </div>
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Min Order</p>
                <p className="text-sm font-bold">₹{coupon.minimumOrderAmount}</p>
              </div>
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Max Discount</p>
                <p className="text-sm font-bold">₹{coupon.maximumDiscount}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold uppercase text-gray-400 px-1">
                <span>Validity Period</span>
                <span className={coupon.isActive ? 'text-green-500' : 'text-red-500'}>{coupon.isActive ? 'Currently Active' : 'Inactive'}</span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-400 uppercase">Starts</span>
                  <span className="text-xs font-bold">{new Date(coupon.startsAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase">Expires</span>
                  <span className="text-xs font-bold text-red-500">{new Date(coupon.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {coupon.description && (
              <div className="mt-6">
                <p className="text-sm font-bold text-gray-400 uppercase mb-2">Description</p>
                <p className={`p-4 rounded-2xl text-xs leading-relaxed ${isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                  {coupon.description}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Create Coupon Modal
 */
export const CreateCouponModal = ({ isOpen, onClose, influencerId, influencerName, initialData = null }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'fixed',
    value: 0,
    influencerId: influencerId || '',
    scope: 'platform',
    minimumOrderAmount: 0,
    maximumDiscount: 0,
    usageLimitPerUser: 1,
    totalUsageLimit: 10,
    startsAt: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    const fetchCouponDetail = async () => {
      setLoading(true);
      try {
        const res = await getCouponById(initialData._id);
        if (res.success) {
          const coupon = res.data?.data || res.data;
          setFormData({
            code: coupon.code || '',
            type: coupon.type || 'fixed',
            value: coupon.value || 0,
            influencerId: coupon.influencerId?._id || coupon.influencerId || influencerId || '',
            scope: coupon.scope || 'platform',
            minimumOrderAmount: coupon.minimumOrderAmount || 0,
            maximumDiscount: coupon.maximumDiscount || 0,
            usageLimitPerUser: coupon.usageLimitPerUser || 1,
            totalUsageLimit: coupon.totalUsageLimit || 10,
            startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: coupon.description || ''
          });
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };

    if (initialData) {
      fetchCouponDetail();
    } else {
      setFormData({
        code: '',
        type: 'fixed',
        value: 0,
        influencerId: influencerId || '',
        scope: 'platform',
        minimumOrderAmount: 0,
        maximumDiscount: 0,
        usageLimitPerUser: 1,
        totalUsageLimit: 10,
        startsAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: ''
      });
    }
  }, [influencerId, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        startsAt: new Date(formData.startsAt).toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        value: Number(formData.value),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        maximumDiscount: Number(formData.maximumDiscount),
        usageLimitPerUser: Number(formData.usageLimitPerUser),
        totalUsageLimit: Number(formData.totalUsageLimit)
      };
      let res;
      if (initialData) {
        res = await updateCoupon(initialData._id, payload);
      } else {
        res = await createCoupon(payload);
      }

      if (res.success) {
        toast.success(initialData ? 'Coupon updated successfully!' : 'Coupon created successfully!');
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="p-5 md:p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <TicketPercent size={24} />
              </div>
              <div>
                <h2 className={`text-xl font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {initialData ? 'Update Coupon' : 'Create Coupon'}
                </h2>
                <p className="text-sm font-bold text-gray-400 uppercase mt-1">
                  {initialData ? `Editing: ${initialData.code}` : influencerName ? `Assigning to: ${influencerName}` : 'Creating Platform Coupon'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Coupon Code</label>
                <input required name="code" value={formData.code} onChange={handleChange} placeholder="e.g. SAVE50" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Discount Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}>
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Value ({formData.type === 'fixed' ? '₹' : '%'})</label>
                <input required type="number" name="value" value={formData.value} onChange={handleChange} min="0" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Min Order Amount</label>
                <input required type="number" name="minimumOrderAmount" value={formData.minimumOrderAmount} onChange={handleChange} min="0" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Usage Limit (Per User)</label>
                <input required type="number" name="usageLimitPerUser" value={formData.usageLimitPerUser} onChange={handleChange} min="1" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Total Usage Limit</label>
                <input required type="number" name="totalUsageLimit" value={formData.totalUsageLimit} onChange={handleChange} min="1" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Starts At</label>
                <div className="relative">
                  <input
                    required
                    type="date"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleChange}
                    onClick={(e) => e.target.showPicker?.()}
                    className={`w-full pl-11 pr-4 py-4 rounded-2xl text-sm font-medium outline-none border transition-all cursor-pointer ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}
                  />
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Expires At</label>
                <div className="relative">
                  <input
                    required
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    onClick={(e) => e.target.showPicker?.()}
                    className={`w-full pl-11 pr-4 py-4 rounded-2xl text-sm font-medium outline-none border transition-all cursor-pointer ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}
                  />
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-gray-400">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Describe the coupon purpose..." className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all resize-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button disabled={loading} type="submit" className="flex-1 order-2 sm:order-1 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:opacity-95 active:opacity-90 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : initialData ? 'Save Changes' : 'Create Coupon Now'}
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
