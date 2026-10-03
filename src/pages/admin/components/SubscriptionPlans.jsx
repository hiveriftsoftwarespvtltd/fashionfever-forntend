import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, RefreshCw, Crown, CheckCircle2, XCircle,
  Users, Briefcase, Zap, BarChart3, Star, ShieldCheck,
  Clock, Percent, AlertCircle, Plus, Pencil, Trash2, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getAllServiceSubscriptionPlans, deleteServiceSubscriptionPlan } from '../../../api/adminService';
import { toast } from '../../../utils/toast';
import DataTable from '../../../components/shared/DataTable';
import CreateSubscriptionPlanModal from './CreateSubscriptionPlanModal';
import SubscriptionPlanDetailsModal from './SubscriptionPlanDetailsModal';

// ── Tier color palette ──────────────────────────────────────────────
const TIER_CONFIG = {
  free: {
    gradient: 'from-gray-500 to-gray-600',
    glow: 'shadow-gray-500/20',
    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    ring: 'ring-gray-500/20',
    dot: 'bg-gray-400',
    icon: '🆓',
  },
  basic: {
    gradient: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ring: 'ring-blue-500/20',
    dot: 'bg-blue-400',
    icon: '⚡',
  },
  standard: {
    gradient: 'from-purple-500 to-purple-600',
    glow: 'shadow-purple-500/20',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ring: 'ring-purple-500/20',
    dot: 'bg-purple-400',
    icon: '🚀',
  },
  premium: {
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/25',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ring: 'ring-amber-500/25',
    dot: 'bg-amber-400',
    icon: '👑',
  },
  enterprise: {
    gradient: 'from-pink-500 to-rose-500',
    glow: 'shadow-rose-500/25',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    ring: 'ring-rose-500/25',
    dot: 'bg-rose-400',
    icon: '🏆',
  },
};

const getTierConfig = (name = '') => {
  const key = name.toLowerCase();
  return TIER_CONFIG[key] || TIER_CONFIG.basic;
};

const formatDuration = (days) => {
  if (days === -1 || days === undefined) return 'Lifetime';
  if (days === 0) return 'Trial';
  if (days % 365 === 0) return `${days / 365} Year${days / 365 > 1 ? 's' : ''}`;
  if (days % 30 === 0) return `${days / 30} Month${days / 30 > 1 ? 's' : ''}`;
  return `${days} Days`;
};

const BoolBadge = ({ value, isDarkMode }) =>
  value ? (
    <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-sm">
      <CheckCircle2 size={13} /> Yes
    </span>
  ) : (
    <span className={`inline-flex items-center gap-1 font-bold text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
      <XCircle size={13} /> No
    </span>
  );

// ── Main Component ────────────────────────────────────────────────────
const SubscriptionPlans = ({ isDarkMode }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllServiceSubscriptionPlans();
      if (res?.success) {
        const data = res.data?.data ?? res.data ?? [];
        setPlans(Array.isArray(data) ? data : []);
      } else {
        setError(res?.message || 'Failed to load subscription plans.');
        toast.error(res?.message || 'Failed to load subscription plans.');
      }
    } catch (err) {
      const msg = 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setIsCreateModalOpen(true);
  };

  const handleDeleteClick = (plan) => {
    const planId = plan._id || plan.id;
    Swal.fire({
      title: 'Delete Subscription Plan?',
      text: `Are you sure you want to delete the plan "${plan.label || plan.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#da016a',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      borderRadius: '20px',
      customClass: {
        popup: 'rounded-3xl border-none',
        confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
        cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const loadingToast = toast.loading('Deleting plan...');
        try {
          const res = await deleteServiceSubscriptionPlan(planId);
          toast.dismiss(loadingToast);
          if (res.success) {
            toast.success(res.message || 'Subscription plan deleted successfully!');
            fetchPlans();
          } else {
            toast.error(res.message || 'Failed to delete subscription plan.');
          }
        } catch (err) {
          toast.dismiss(loadingToast);
          toast.error('Something went wrong during deletion.');
        }
      }
    });
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-4 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'} shadow-xl`}>
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Loading Subscription Plans...
        </p>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-5 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'} shadow-xl p-10`}>
        <AlertCircle className="text-rose-500" size={40} />
        <div className="text-center">
          <p className={`font-black text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Failed to Load</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
        <button
          onClick={fetchPlans}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  const sortedPlans = [...plans].sort((a, b) => (a.priorityRank ?? 99) - (b.priorityRank ?? 99));

  const columns = [
    {
      header: 'Tier & Rank',
      render: (plan) => {
        const tier = getTierConfig(plan.name);
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black bg-gradient-to-br ${tier.gradient} shadow-md flex-shrink-0`}>
              {tier.icon}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {plan.label || plan.name}
              </span>
              <span className="text-sm font-bold text-gray-400 uppercase">
                Rank #{plan.priorityRank ?? '—'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Price & Billing',
      render: (plan) => {
        const isFree = plan.price === 0;
        return (
          <div className="flex flex-col">
            <span className={`text-sm font-black ${isFree ? 'text-emerald-500' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {isFree ? 'FREE' : `₹${plan.price.toLocaleString('en-IN')}`}
            </span>
            <span className="text-sm uppercase font-bold text-gray-400">
              / {formatDuration(plan.durationDays)}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Limits (Service / Staff / Leads)',
      render: (plan) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-sm font-black uppercase tracking-wider`}>
            {plan.maxServices ?? '—'} Services
          </span>
          <span className={`px-2.5 py-1 rounded-xl bg-violet-500/10 text-violet-500 text-sm font-black uppercase tracking-wider`}>
            {plan.maxStaff ?? '—'} Staff
          </span>
          <span className={`px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 text-sm font-black uppercase tracking-wider`}>
            {plan.monthlyLeadLimit ?? '—'} Leads
          </span>
        </div>
      )
    },
    {
      header: 'Commission',
      render: (plan) => (
        <span className={`text-sm font-black text-primary`}>
          {plan.commissionPercentage ?? 0}%
        </span>
      )
    },
    {
      header: 'Features',
      render: (plan) => (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 max-w-xs">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} uppercase`}>Featured:</span>
            <BoolBadge value={plan.featuredListing} isDarkMode={isDarkMode} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} uppercase`}>Support:</span>
            <BoolBadge value={plan.prioritySupport} isDarkMode={isDarkMode} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} uppercase`}>Analytics:</span>
            <BoolBadge value={plan.analyticsAccess} isDarkMode={isDarkMode} />
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (plan) => (
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
          <span className="text-sm font-semibold uppercase text-gray-400">{plan.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      )
    },
    {
      header: 'Created On',
      render: (plan) => (
        <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {new Date(plan.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (plan) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            title="View Details"
            onClick={() => setSelectedPlanId(plan._id || plan.id)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-primary' : 'bg-gray-50 text-gray-400 hover:text-primary'}`}
          >
            <Eye size={18} />
          </button>
          <button
            title="Edit Plan"
            onClick={() => handleEditClick(plan)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-orange-500' : 'bg-gray-50 text-gray-400 hover:text-orange-500'}`}
          >
            <Pencil size={18} />
          </button>
          <button
            title="Delete Plan"
            onClick={() => handleDeleteClick(plan)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
            Platform Configuration
          </span>
          <h2 className={`text-2xl lg:text-3xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            Subscription Plans
          </h2>
          <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            All service subscription tiers configured in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:opacity-95 text-white rounded-2xl font-bold text-xs uppercase shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} /> Add Plan
          </button>
          <div className={`px-5 py-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} shadow-sm`}>
            <p className="text-xs font-bold uppercase text-zinc-400 mb-0.5">Total Plans</p>
            <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{plans.length}</p>
          </div>
          <button
            onClick={fetchPlans}
            disabled={loading}
            className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Active / Inactive Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Plans', value: plans.filter(p => p.isActive).length, color: 'text-emerald-500', bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50', icon: <CheckCircle2 size={16} /> },
          { label: 'Inactive Plans', value: plans.filter(p => !p.isActive).length, color: 'text-rose-500', bg: isDarkMode ? 'bg-rose-500/10' : 'bg-rose-50', icon: <XCircle size={16} /> },
          { label: 'Free Tier', value: plans.filter(p => p.price === 0).length, color: 'text-zinc-400', bg: isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100', icon: <Star size={16} /> },
          { label: 'Paid Tiers', value: plans.filter(p => p.price > 0).length, color: 'text-primary', bg: isDarkMode ? 'bg-primary/10' : 'bg-primary/5', icon: <Crown size={16} /> },
        ].map((s, i) => (
          <div key={i} className={`px-4 py-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── DataTable ── */}
      <DataTable
        columns={columns}
        data={sortedPlans}
        loading={loading}
      />

      {/* ── Create / Update Service Subscription Plan Modal ── */}
      <CreateSubscriptionPlanModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedPlan(null);
        }}
        onSuccess={fetchPlans}
        initialData={selectedPlan}
      />

      {/* ── Service Subscription Plan Details Modal ── */}
      <SubscriptionPlanDetailsModal
        planId={selectedPlanId}
        onClose={() => setSelectedPlanId(null)}
      />
    </div>
  );
};

export default SubscriptionPlans;
