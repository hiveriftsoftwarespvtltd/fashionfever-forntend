import React, { useState, useEffect } from 'react';
import { Loader2, X, Camera, Video, TicketPercent, Pencil, Trash2, Percent, AlertTriangle, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from '../../../utils/toast';
import { 
  getInfluencerById, 
  deleteCoupon,
  getInfluencerWalletBalance,
  getInfluencerWalletTransactions,
  updateInfluencerCommissionRate
} from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Influencer Details Modal
 * Rendered in AdminPanel for viewing and managing influencer profiles and their coupons.
 */
const InfluencerDetailsModal = ({ influencerId, onClose, onEditCoupon, onRefresh }) => {
  const { isDarkMode } = useTheme();
  const [influencer, setInfluencer] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commissionRateInput, setCommissionRateInput] = useState('');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!influencerId) return;
      setLoading(true);
      try {
        const [influRes, walletRes, txRes] = await Promise.all([
          getInfluencerById(influencerId),
          getInfluencerWalletBalance(influencerId),
          getInfluencerWalletTransactions(influencerId)
        ]);

        if (influRes.success) {
          const data = influRes.data?.data || influRes.data;
          setInfluencer(data);
          setCommissionRateInput(typeof data.commissionRate === 'number' ? data.commissionRate : '');
        } else {
          toast.error(influRes.message || 'Failed to load details');
        }

        if (walletRes.success) {
          setWallet(walletRes.data);
        }

        if (txRes.success) {
          const list = txRes.data?.data ?? txRes.data ?? [];
          setTransactions(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Modal fetch error:', err);
        toast.error('Could not fetch influencer details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [influencerId]);

  const handleSaveCommissionRate = async (isUnsetting = false) => {
    if (!influencer) return;

    let targetRate = null;
    if (!isUnsetting) {
      if (commissionRateInput === '' || commissionRateInput === null) {
        toast.error('Please enter a valid rate between 0 and 100, or choose Unset Rate');
        return;
      }
      const parsed = parseFloat(commissionRateInput);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        toast.error('Commission rate must be between 0% and 100%');
        return;
      }
      targetRate = parseFloat(parsed.toFixed(2));
    }

    const swalTitle = isUnsetting 
      ? 'Unset Commission Rate?' 
      : `Set Commission Rate to ${targetRate}%?`;
      
    const swalText = isUnsetting
      ? `This will remove the configured rate for ${influencer.name}. No commission records will be created for attributed orders until a rate is explicitly configured.`
      : `Set custom commission rate of ${targetRate}% for ${influencer.name}. This custom percentage is funded from platform margin upon verified order completion.`;

    const result = await Swal.fire({
      title: swalTitle,
      text: swalText,
      icon: isUnsetting ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: '#fe3e6a',
      cancelButtonColor: '#71717a',
      confirmButtonText: isUnsetting ? 'Yes, Unset Rate' : 'Yes, Update Rate',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#18181b' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#18181b',
      borderRadius: '20px',
      customClass: {
        popup: 'rounded-3xl border border-zinc-700/50',
        confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
        cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
      }
    });

    if (result.isConfirmed) {
      setIsUpdatingRate(true);
      const loadingToast = toast.loading('Updating commission rate...');
      try {
        const res = await updateInfluencerCommissionRate(influencer._id, targetRate);
        toast.dismiss(loadingToast);
        if (res.success || res.statusCode === 200) {
          toast.success(isUnsetting ? 'Commission rate unset successfully!' : `Commission rate updated to ${targetRate}%!`);
          setInfluencer(prev => ({
            ...prev,
            commissionRate: targetRate
          }));
          setCommissionRateInput(targetRate !== null ? targetRate : '');
          if (onRefresh) onRefresh();
        } else {
          toast.error(res.message || 'Failed to update commission rate');
        }
      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error('An error occurred while updating commission rate');
      } finally {
        setIsUpdatingRate(false);
      }
    }
  };

  const handleDeleteCoupon = (couponId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-gray-800">Delete this coupon?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await deleteCoupon(couponId);
                if (res.success) {
                  toast.success('Coupon deleted');
                  if (onRefresh) onRefresh();
                } else {
                  toast.error(res.message || 'Delete failed');
                }
              } catch (err) {
                toast.error('Something went wrong');
              }
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
          >
            Yes, Delete
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  if (!influencerId) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase">Fetching Influencer Profile...</span>
          </div>
        ) : influencer ? (
          <div className="p-5 md:p-10">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-2xl font-bold shadow-xl ${isDarkMode ? 'bg-gray-900 text-gray-500' : 'bg-gray-50 text-primary ring-8 ring-primary/5'}`}>
                  {influencer.name?.charAt(0)}
                </div>
                <div>
                  <h2 className={`text-2xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{influencer.name}</h2>
                  <p className="text-xs font-bold text-primary uppercase mt-1">Professional Influencer</p>
                  <p className="text-sm font-bold text-gray-400 uppercase mt-0.5">{influencer.userId?.email}</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
                <X size={20} />
              </button>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-gray-400">Financial Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <p className="text-sm font-bold text-gray-400 uppercase mb-1">Commission Rate</p>
                    {typeof influencer.commissionRate === 'number' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-primary">{influencer.commissionRate}%</span>
                        {influencer.commissionRate === 0 && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-500/20 text-zinc-400">0%</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-black text-amber-500 uppercase tracking-wide">Rate Unset</span>
                        <span className="text-[10px] font-bold uppercase text-amber-400/80">Commission Disabled</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <p className="text-sm font-bold text-gray-400 uppercase mb-1">Followers</p>
                    <p className="text-lg font-bold">{influencer.followers?.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <p className="text-sm font-bold text-gray-400 uppercase mb-1">Total Sales</p>
                    <p className="text-lg font-bold">₹{influencer.totalSales?.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <p className="text-sm font-bold text-gray-400 uppercase mb-1">Total Earnings</p>
                    <p className="text-lg font-bold text-green-500">₹{influencer.totalCommissionEarned?.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <p className="text-sm font-bold text-gray-400 uppercase mb-1">Pending</p>
                    <p className="text-lg font-bold text-orange-500">₹{influencer.pendingCommission?.toLocaleString() || 0}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <p className="text-sm font-bold text-gray-400 uppercase mb-1">Paid</p>
                    <p className="text-lg font-bold text-blue-500">₹{influencer.paidCommission?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              {/* Bio & Social */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-gray-400">Profile Information</h3>
                <div className={`p-4 rounded-2xl min-h-[100px] ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <p className="text-sm font-bold text-gray-400 uppercase mb-2">Biography</p>
                  <p className="text-xs font-medium leading-relaxed opacity-80">{influencer.bio || 'No biography provided.'}</p>
                </div>
                <div className="flex gap-2">
                  {influencer.instagram && (
                    <a href={influencer.instagram.startsWith('http') ? influencer.instagram : `https://${influencer.instagram}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-pink-500/10 text-pink-500 text-sm font-bold uppercase transition-all hover:bg-pink-500 hover:text-white">
                      <Camera size={14} /> Instagram
                    </a>
                  )}
                  {influencer.youtube && (
                    <a href={influencer.youtube.startsWith('http') ? influencer.youtube : `https://${influencer.youtube}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold uppercase transition-all hover:bg-red-500 hover:text-white">
                      <Video size={14} /> YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
            {/* Custom Commission Rate Management (Phase 4) */}
            <div className={`mt-6 p-5 rounded-2xl border text-left transition-all ${
              isDarkMode ? 'bg-gray-900/40 border-white/5' : 'bg-pink-50/20 border-pink-100/60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Percent size={16} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Custom Commission Rate
                    </h3>
                    <p className="text-xs font-medium text-gray-400">
                      Configured per influencer. No platform default rate.
                    </p>
                  </div>
                </div>

                {typeof influencer.commissionRate === 'number' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active Rate: {influencer.commissionRate}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Rate Unset — Commission Disabled
                  </span>
                )}
              </div>

              {typeof influencer.commissionRate !== 'number' && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-left">
                  <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-amber-300/90 leading-relaxed">
                    <strong>Notice:</strong> This influencer currently has no commission rate configured. Under the strict Three-Tier contract, orders attributed to this creator will produce <strong>zero financial commission ledger records</strong> until an admin explicitly sets a rate (0–100%).
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Enter rate (e.g. 10 or 0)"
                    value={commissionRateInput}
                    onChange={(e) => setCommissionRateInput(e.target.value)}
                    disabled={isUpdatingRate}
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-bold outline-none border transition-all ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/60' 
                        : 'bg-white border-gray-200 text-gray-800 focus:border-primary/40 shadow-sm'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
                    %
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isUpdatingRate}
                  onClick={() => handleSaveCommissionRate(false)}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 active:scale-95 text-white text-xs font-extrabold uppercase rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingRate ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Custom Rate
                </button>

                {typeof influencer.commissionRate === 'number' && (
                  <button
                    type="button"
                    disabled={isUpdatingRate}
                    onClick={() => handleSaveCommissionRate(true)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                      isDarkMode 
                        ? 'bg-gray-800/80 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 border-gray-700 hover:border-rose-500/30' 
                        : 'bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    Unset Rate (Null)
                  </button>
                )}
              </div>
            </div>

            {/* Coupons */}
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase text-gray-400">Assigned Coupons ({influencer.coupons?.length || 0})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {influencer.coupons?.length > 0 ? (
                  influencer.coupons.map((coupon, idx) => (
                    <div key={idx} className={`group p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-900/40 border-white/5 hover:border-primary/50' : 'bg-gray-50 border-gray-100 hover:border-primary/30'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary text-sm font-bold uppercase">{coupon.code}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => onEditCoupon(coupon)} title="Edit Coupon" className="p-1.5 rounded-lg bg-primary text-white transition-all hover:scale-110"><Pencil size={12} /></button>
                          <button onClick={() => handleDeleteCoupon(coupon._id)} title="Delete Coupon" className="p-1.5 rounded-lg bg-red-500 text-white transition-all hover:scale-110"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}</p>
                          <p className="text-sm font-bold text-gray-400 uppercase mt-0.5">Exp: {new Date(coupon.expiresAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-sm font-bold uppercase ${coupon.isActive ? 'text-green-500' : 'text-red-5'}`}>{coupon.isActive ? 'Active' : 'Expired'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`col-span-full py-8 text-center rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-white/5 text-gray-600' : 'border-gray-100 text-gray-400'}`}>
                    <TicketPercent size={24} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-bold uppercase">No coupons generated yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Summary Card */}
            {wallet && (
              <div className={`mt-8 p-5 rounded-2xl border text-left transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-900/40 border-white/5' : 'bg-emerald-50/10 border-emerald-100/50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                    Influencer Wallet Summary
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Active Balance
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Liquid Balance</span>
                    <span className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      ₹{(wallet.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-zinc-200 dark:border-zinc-800 pl-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Total Earnings</span>
                    <span className="text-base font-bold text-emerald-500">
                      ₹{(wallet.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions History Ledger */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                  Transaction Audit Ledger
                </span>
                <span className="text-xs text-zinc-400 font-bold uppercase">
                  {(transactions || []).length} Records
                </span>
              </div>
              
              {(!transactions || transactions.length === 0) ? (
                <div className="py-6 text-center text-xs font-bold text-zinc-400 uppercase italic">
                  No transactions recorded for this wallet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {transactions.map((tx) => (
                    <div 
                      key={tx._id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                        isDarkMode 
                          ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                          : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 max-w-[70%] text-left">
                        <span className={`font-bold text-xs ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                          {tx.description || tx.reason || 'Transaction'}
                        </span>
                        <span className="text-xs text-zinc-400 font-bold uppercase">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className={`font-black text-sm ${
                          tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono font-bold uppercase">
                          Bal: ₹{(tx.balanceAfterTransaction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={onClose} className="w-full mt-10 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:opacity-95 active:opacity-90 transition-all">
              Dismiss Profile
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InfluencerDetailsModal;
