import React, { useState, useEffect } from 'react';
import { Loader2, X, Crown, Calendar, CheckCircle2, XCircle, Percent, ShieldCheck, DollarSign, Clock, Layers } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { getServiceSubscriptionPlanDetails } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Subscription Plan Details Modal
 * Fetches plan information using GET API /service/get-service-subscription-plan-details/:id
 */
const SubscriptionPlanDetailsModal = ({ planId, onClose }) => {
  const { isDarkMode } = useTheme();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!planId) return;
      setLoading(true);
      try {
        const response = await getServiceSubscriptionPlanDetails(planId);
        if (response.success) {
          // Extracts the correct nested schema structure: response.data.data or fallback
          const detail = response.data?.data || response.data;
          setPlan(detail);
        } else {
          toast.error(response.message || 'Failed to fetch subscription plan details');
        }
      } catch (err) {
        console.error('Fetch service subscription plan details error:', err);
        toast.error('Could not load subscription plan details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [planId]);

  if (!planId) return null;

  const formatDuration = (days) => {
    if (days === -1 || days === undefined) return 'Lifetime';
    if (days === 0) return 'Trial';
    if (days % 365 === 0) return `${days / 365} Year${days / 365 > 1 ? 's' : ''}`;
    if (days % 30 === 0) return `${days / 30} Month${days / 30 > 1 ? 's' : ''}`;
    return `${days} Days`;
  };

  const FeatureRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100/50 dark:border-white/5">
      <span className="text-sm font-bold uppercase text-gray-400">{label}</span>
      {value ? (
        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs">
          <CheckCircle2 size={14} /> Enabled
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-gray-400 font-bold text-xs">
          <XCircle size={14} /> Disabled
        </span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit">
      <div className={`w-full max-w-xl my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase">Fetching Plan Details...</span>
          </div>
        ) : plan ? (
          <div className="p-6 md:p-8 text-left">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold border shadow-inner flex-shrink-0 bg-primary/10 border-primary/20 text-primary`}>
                  <Crown size={28} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {plan.label || plan.name}
                  </h2>
                  <p className="text-sm font-bold text-primary uppercase mt-1">Service Subscription Plan</p>
                  {plan.name !== plan.label && (
                    <p className="text-sm font-bold text-gray-400 uppercase mt-0.5">Key: {plan.name}</p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
                <X size={20} />
              </button>
            </div>

            {/* Core Pricing Card */}
            <div className={`p-5 rounded-2xl mb-6 grid grid-cols-2 gap-4 border ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-50 border-gray-100/50'}`}>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Pricing Cost</p>
                <p className="text-xl font-extrabold text-primary flex items-center">
                  <DollarSign size={18} />
                  {plan.price === 0 ? 'FREE' : plan.price}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Plan Duration</p>
                <p className={`text-sm font-extrabold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Calendar size={16} className="text-gray-400" />
                  {formatDuration(plan.durationDays)}
                </p>
              </div>
            </div>

            {/* Limits & Commission */}
            <div className="space-y-4 mb-6">
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Tiers & Limitations</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">Max Services</span>
                  <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>{plan.maxServices ?? '—'}</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">Max Staff</span>
                  <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>{plan.maxStaff ?? '—'}</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">Monthly Lead Limit</span>
                  <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>{plan.monthlyLeadLimit ?? '—'}</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">Commission</span>
                  <span className="text-base font-bold text-primary flex items-center">
                    {plan.commissionPercentage ?? 0}
                    <Percent size={14} className="ml-0.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="mb-6">
              <h3 className={`text-xs font-extrabold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Feature Inclusions</h3>
              <div className={`px-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <FeatureRow label="Featured Listing" value={plan.featuredListing} />
                <FeatureRow label="Priority Support" value={plan.prioritySupport} />
                <FeatureRow label="Analytics Access" value={plan.analyticsAccess} />
              </div>
            </div>

            {/* Timestamps & ID */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold uppercase text-xs text-zinc-400">
                  <Layers size={14} /> Plan ID
                </span>
                <span className="font-bold font-mono text-xs text-zinc-300">
                  {plan._id}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold uppercase text-xs text-zinc-400">
                  Status & Rank
                </span>
                <span className="font-bold">
                  {plan.isActive ? 'Active' : 'Inactive'} • Rank #{plan.priorityRank ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-zinc-200 dark:border-zinc-800 pt-2.5">
                <span className="flex items-center gap-1 text-xs font-bold uppercase text-zinc-400">
                  <Clock size={14} /> Created At
                </span>
                <span className="font-bold text-zinc-700 dark:text-zinc-400">
                  {new Date(plan.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-xs font-bold uppercase text-zinc-400">
                  <Clock size={14} /> Last Updated
                </span>
                <span className="font-bold text-zinc-700 dark:text-zinc-400">
                  {new Date(plan.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
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

export default SubscriptionPlanDetailsModal;
