import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Share2, 
  Wallet, 
  TrendingUp, 
  Copy, 
  Check,
  PlusCircle,
  ExternalLink,
  Percent,
  LayoutDashboard,
  Menu,
  Sun,
  Moon,
  X,
  Loader2,
  MousePointerClick,
  UserCheck,
  ShoppingBag,
  Coins,
  Briefcase,
  GraduationCap,
  Trash2,
  Pencil,
  Landmark,
  IndianRupee,
  HelpCircle,
  MapPin,
  Heart,
  BarChart3,
  Repeat,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import DataTable from '../components/shared/DataTable';
import { getInfluencerOverview, getInfluencerAnalytics, getInfluencerAudienceAnalytics, generateAffiliateLink, getAffiliateDashboardStats, submitStory, getInfluencerStories, deleteStory, getTaskData, submitTaskData, updateTaskData, deleteTaskData, getInfluencerWalletBalance, getInfluencerWalletTransactions, requestInfluencerPayout, getInfluencerPayoutRequests } from '../api/influencerService';
import { getAllInfluencerCommissionSlabs } from '../api/adminService';
import { toast } from '../utils/toast';
import PayoutBankDetails from '../components/shared/PayoutBankDetails';

const InfluencerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Dynamic API states and URL-persisted tabs
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [affiliateStats, setAffiliateStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wallet states
  const [walletBalance, setWalletBalance] = useState({ balance: 0, totalEarnings: 0, approvedBalance: 0, pendingBalance: 0, paidBalance: 0, lifetimeEarnings: 0 });
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutRemarks, setPayoutRemarks] = useState('');
  const [payoutUpiId, setPayoutUpiId] = useState('');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // Story submission states
  const [storyUrl, setStoryUrl] = useState('');
  const [submittingStory, setSubmittingStory] = useState(false);

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    if (!storyUrl) {
      toast.error('Please enter a valid Story URL.');
      return;
    }
    
    setSubmittingStory(true);
    try {
      const res = await submitStory({ storyUrl });
      if (res.success) {
        toast.success(res.message || 'Story submitted successfully!');
        setStoryUrl('');
        setIsSubmitModalOpen(false); // Close story submission popup modal
        fetchMyStories(); // Refresh list immediately
      } else {
        toast.error(res.message || 'Failed to submit story.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong during story submission.');
    } finally {
      setSubmittingStory(false);
    }
  };

  // State variables for Active Stories and Submit Popup Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [myStories, setMyStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);

  const fetchMyStories = async () => {
    setLoadingStories(true);
    try {
      const res = await getInfluencerStories();
      if (res.success && Array.isArray(res.data)) {
        const nameToMatch = user?.name || '';
        const filtered = res.data.filter(item => 
          !nameToMatch || item.influencerName?.toLowerCase() === nameToMatch.toLowerCase()
        );
        setMyStories(filtered);
      }
    } catch (err) {
      console.error('Fetch my stories error:', err);
    } finally {
      setLoadingStories(false);
    }
  };

  const handleDeleteStory = (storyId) => {
    Swal.fire({
      title: 'Delete Story?',
      text: 'Are you sure you want to delete this story URL submission?',
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
        const loadingToast = toast.loading('Deleting story data...');
        try {
          const res = await deleteStory(storyId);
          toast.dismiss();
          if (res.success) {
            toast.success(res.message || 'Story deleted successfully!');
            fetchMyStories();
          } else {
            toast.error(res.message || 'Failed to delete story.');
          }
        } catch (err) {
          toast.dismiss();
          toast.error('Something went wrong while deleting the story.');
        }
      }
    });
  };

  // Task list states
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const fetchTasksData = async () => {
    setLoadingTasks(true);
    try {
      const res = await getTaskData();
      if (res.success && res.data) {
        setTasks(res.data || []);
      } else {
        toast.error(res.message || 'Failed to fetch task data.');
      }
    } catch (err) {
      console.error('Fetch tasks data error:', err);
      toast.error('Something went wrong while fetching tasks.');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasksData();
    }
  }, [activeTab]);

  const fetchWalletData = async () => {
    setLoadingWallet(true);
    try {
      const [balanceRes, transactionsRes, payoutsRes] = await Promise.all([
        getInfluencerWalletBalance(),
        getInfluencerWalletTransactions(),
        getInfluencerPayoutRequests()
      ]);
      if (balanceRes?.success && balanceRes.data) {
        setWalletBalance(balanceRes.data);
      }
      if (transactionsRes?.success && Array.isArray(transactionsRes.data)) {
        setWalletTransactions(transactionsRes.data);
      }
      if (payoutsRes?.success && Array.isArray(payoutsRes.data)) {
        setPayoutRequests(payoutsRes.data);
      }
    } catch (err) {
      console.error('Fetch wallet data error:', err);
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleRequestPayout = async () => {
    const approvedBal = walletBalance?.approvedBalance ?? walletBalance?.balance ?? 0;
    if (approvedBal < 500) {
      toast.error('Minimum payout threshold is ₹500');
      return;
    }

    // UPI format validation (if provided): must match VPA pattern
    const trimmedUpi = payoutUpiId.trim();
    if (trimmedUpi && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(trimmedUpi)) {
      toast.error('Invalid UPI ID format. Use format: name@bank (e.g. priya@ybl)');
      return;
    }

    setIsRequestingPayout(true);
    try {
      const payload = { remarks: payoutRemarks };
      if (trimmedUpi) payload.upiId = trimmedUpi;

      const res = await requestInfluencerPayout(payload);
      if (res?.success) {
        toast.success(res.message || 'Payout requested successfully!');
        setIsPayoutModalOpen(false);
        setPayoutRemarks('');
        setPayoutUpiId('');
        fetchWalletData();
      } else {
        toast.error(res?.message || 'Failed to request payout');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong requesting payout');
    } finally {
      setIsRequestingPayout(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchWalletData();
    }
  }, [activeTab]);

  const [commissionSlabs, setCommissionSlabs] = useState([]);
  const [loadingCommissionSlabs, setLoadingCommissionSlabs] = useState(false);

  const fetchCommissionSlabs = async () => {
    setLoadingCommissionSlabs(true);
    try {
      const response = await getAllInfluencerCommissionSlabs();
      if (response?.success) {
        const list = response.data?.data || response.data || [];
        const activeSlabs = list.filter(s => s.isActive !== false);
        activeSlabs.sort((a, b) => (a.minSales || 0) - (b.minSales || 0));
        setCommissionSlabs(activeSlabs);
      }
    } catch (err) {
      console.error("Failed to load commission slabs:", err);
    } finally {
      setLoadingCommissionSlabs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'commission-slabs') {
      fetchCommissionSlabs();
    }
  }, [activeTab]);

  const [audienceData, setAudienceData] = useState(null);
  const [loadingAudience, setLoadingAudience] = useState(false);

  const fetchAudienceData = async () => {
    setLoadingAudience(true);
    try {
      const res = await getInfluencerAudienceAnalytics();
      if (res?.success && res.data) {
        setAudienceData(res.data);
      }
    } catch (err) {
      console.error('Fetch audience analytics error:', err);
    } finally {
      setLoadingAudience(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audience') {
      fetchAudienceData();
    }
  }, [activeTab]);

  // Task submission form states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskMediaLink, setTaskMediaLink] = useState('');
  const [taskPlatform, setTaskPlatform] = useState('YOUTUBE');
  const [taskPostingDate, setTaskPostingDate] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskMediaLink.trim() || !taskPostingDate) {
      toast.error('All fields are required.');
      return;
    }
    setSubmittingTask(true);
    try {
      const formattedDate = new Date(taskPostingDate).toISOString();
      const res = await submitTaskData({
        mediaLink: taskMediaLink,
        platform: taskPlatform,
        postingDate: formattedDate
      });

      if (res.success) {
        toast.success(res.message || 'Task submitted successfully!');
        setTaskMediaLink('');
        setTaskPostingDate('');
        setTaskPlatform('YOUTUBE');
        setIsTaskModalOpen(false);
        fetchTasksData();
      } else {
        toast.error(res.message || 'Failed to submit task data.');
      }
    } catch (err) {
      console.error('Task submission error:', err);
      toast.error('Something went wrong during task submission.');
    } finally {
      setSubmittingTask(false);
    }
  };

  // Task update states
  const [editingTask, setEditingTask] = useState(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editTaskMediaLink, setEditTaskMediaLink] = useState('');
  const [editTaskPlatform, setEditTaskPlatform] = useState('YOUTUBE');
  const [editTaskPostingDate, setEditTaskPostingDate] = useState('');
  const [updatingTask, setUpdatingTask] = useState(false);

  const handleEditClick = (task) => {
    setEditingTask(task);
    setEditTaskMediaLink(task.mediaLink || '');
    setEditTaskPlatform(task.platform || 'YOUTUBE');
    
    if (task.postingDate) {
      const d = new Date(task.postingDate);
      const pad = (n) => n.toString().padStart(2, '0');
      const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setEditTaskPostingDate(formatted);
    } else {
      setEditTaskPostingDate('');
    }
    
    setIsEditTaskModalOpen(true);
  };

  const handleTaskUpdate = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    if (!editTaskMediaLink.trim() || !editTaskPostingDate) {
      toast.error('All fields are required.');
      return;
    }
    setUpdatingTask(true);
    try {
      const formattedDate = new Date(editTaskPostingDate).toISOString();
      const res = await updateTaskData(editingTask._id, {
        mediaLink: editTaskMediaLink,
        platform: editTaskPlatform,
        postingDate: formattedDate
      });

      if (res.success) {
        toast.success(res.message || 'Task updated successfully!');
        setEditingTask(null);
        setEditTaskMediaLink('');
        setEditTaskPostingDate('');
        setIsEditTaskModalOpen(false);
        fetchTasksData();
      } else {
        toast.error(res.message || 'Failed to update task.');
      }
    } catch (err) {
      console.error('Task update error:', err);
      toast.error('Something went wrong during task update.');
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleDeleteTaskClick = (id) => {
    Swal.fire({
      title: 'Delete Campaign Task?',
      text: 'Are you sure you want to delete this campaign task submission?',
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
        const loadingToast = toast.loading('Deleting task data...');
        try {
          const res = await deleteTaskData(id);
          toast.dismiss();
          if (res.success) {
            toast.success(res.message || 'Task deleted successfully!');
            fetchTasksData();
          } else {
            toast.error(res.message || 'Failed to delete task.');
          }
        } catch (err) {
          toast.dismiss();
          toast.error('Something went wrong during deletion.');
        }
      }
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [overviewRes, analyticsRes, affiliateRes, affiliateStatsRes, walletRes] = await Promise.all([
          getInfluencerOverview(),
          getInfluencerAnalytics(45),
          generateAffiliateLink(),
          getAffiliateDashboardStats(),
          getInfluencerWalletBalance()
        ]);
        if (overviewRes?.success) {
          setOverview(overviewRes.data);
        }
        if (analyticsRes?.success) {
          setAnalytics(analyticsRes.data);
        }
        if (affiliateRes?.success) {
          const payload = affiliateRes.data;
          if (payload?.affiliateLink) {
            setAffiliateLink(payload.affiliateLink);
            setReferralCode(payload.referralCode);
          }
        }
        if (affiliateStatsRes?.success) {
          setAffiliateStats(affiliateStatsRes.data);
        } else {
          // Explicit empty/null state — zero mock financial data
          setAffiliateStats(null);
        }
        if (walletRes?.success && walletRes.data) {
          setWalletBalance(walletRes.data);
        }
      } catch (error) {
        console.error("Error loading influencer dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    fetchMyStories();
  }, []);

  useEffect(() => {
    if (activeTab === 'submit-story') {
      fetchMyStories();
    }
  }, [activeTab, user]);

  const displayLink = affiliateLink || `fashionfever.in/ref/${user?.influencerId || user?._id || 'cre8or_2024'}`;

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(displayLink);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stats mapped to overview and analytics API payloads
  // Phase 8: Creator KPI Harmonization — explicitly separating Net E-Commerce Sales from Network GMV
  const stats = [
    { 
      label: 'Net E-Commerce Sales', 
      value: overview?.totalSales !== undefined ? `₹${overview.totalSales.toLocaleString('en-IN')}` : '₹0', 
      icon: <TrendingUp size={20} className="text-purple-500" />, 
      sub: 'Commissionable Net Order Amount' 
    },
    { 
      label: 'Approved Balance (Payable)', 
      value: `₹${(walletBalance?.approvedBalance ?? overview?.approvedCommission ?? 0).toLocaleString('en-IN')}`, 
      icon: <Wallet size={20} className="text-blue-500" />, 
      sub: `In 7-Day Hold: ₹${(walletBalance?.pendingBalance ?? overview?.pendingCommission ?? 0).toLocaleString('en-IN')}` 
    },
    { 
      label: 'Total Attributed Orders', 
      value: overview?.totalOrders !== undefined ? overview.totalOrders.toString() : '0', 
      icon: <Users size={20} className="text-green-500" />, 
      sub: `Lifetime Earned: ₹${(walletBalance?.lifetimeEarnings ?? overview?.totalCommission ?? 0).toLocaleString('en-IN')}` 
    },
    { 
      label: 'Paid Commission', 
      value: `₹${(walletBalance?.paidBalance ?? overview?.paidCommission ?? analytics?.paidCommission ?? 0).toLocaleString('en-IN')}`, 
      icon: <Share2 size={20} className="text-orange-500" />, 
      sub: 'Settled & Withdrawn' 
    },
  ];

  // Affiliate Dashboard stats mappings
  const affStats = affiliateStats?.stats || {};
  const affiliateStatsList = [
    {
      label: 'Unique Clicks',
      value: affStats.uniqueClicks !== undefined ? affStats.uniqueClicks.toLocaleString('en-IN') : '0',
      icon: <MousePointerClick size={16} className="text-purple-500" />
    },
    {
      label: 'Total Signups',
      value: affStats.totalSignups !== undefined ? affStats.totalSignups.toLocaleString('en-IN') : '0',
      icon: <UserCheck size={16} className="text-blue-500" />
    },
    {
      label: 'Network Orders',
      value: affStats.totalOrders !== undefined ? affStats.totalOrders.toLocaleString('en-IN') : '0',
      icon: <ShoppingBag size={16} className="text-green-500" />
    },
    {
      label: 'Total Network GMV',
      value: affStats.totalOrderValue !== undefined ? `₹${affStats.totalOrderValue.toLocaleString('en-IN')}` : '₹0',
      icon: <Coins size={16} className="text-orange-500" />
    },
    {
      label: 'Services Referrals',
      value: affStats.totalServices !== undefined ? affStats.totalServices.toLocaleString('en-IN') : '0',
      icon: <Briefcase size={16} className="text-pink-500" />
    },
    {
      label: 'Courses Referrals',
      value: affStats.totalCourses !== undefined ? affStats.totalCourses.toLocaleString('en-IN') : '0',
      icon: <GraduationCap size={16} className="text-yellow-500" />
    }
  ];

  const pieData = affiliateStats?.pieChart || {};
  const pieSum = (pieData.users || 0) + (pieData.vendors || 0) + (pieData.serviceProviders || 0) + (pieData.educators || 0);

  const pieSegments = [
    { label: 'Users', value: pieData.users || 0, stroke: 'stroke-pink-500', bg: 'bg-pink-500' },
    { label: 'Vendors', value: pieData.vendors || 0, stroke: 'stroke-blue-500', bg: 'bg-blue-500' },
    { label: 'Service Providers', value: pieData.serviceProviders || 0, stroke: 'stroke-emerald-500', bg: 'bg-emerald-500' },
    { label: 'Educators', value: pieData.educators || 0, stroke: 'stroke-amber-500', bg: 'bg-amber-500' }
  ];

  let accumulatedPct = 0;
  const processedPieSegments = pieSegments.map(seg => {
    const percent = pieSum > 0 ? (seg.value / pieSum) * 100 : 0;
    const offset = -accumulatedPct;
    accumulatedPct += percent;
    return { ...seg, percent, offset };
  });

  // Columns for the active stories table
  const myStoriesColumns = [
    {
      header: 'Story Link',
      key: 'storyUrl',
      render: (row) => (
        <a 
          href={row.storyUrl && (row.storyUrl.startsWith('http') ? row.storyUrl : `https://${row.storyUrl}`)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-primary font-bold hover:underline break-all truncate max-w-[280px] block"
        >
          {row.storyUrl}
        </a>
      )
    },
    {
      header: 'Expires At',
      key: 'expiresAt',
      render: (row) => (
        <span className="text-xs text-gray-400 font-semibold">
          {new Date(row.expiresAt).toLocaleString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <button
          onClick={() => handleDeleteStory(row._id)}
          className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm"
          title="Delete Story"
        >
          <Trash2 size={16} />
        </button>
      )
    }
  ];

  // Columns for the tasks leaderboard/list table
  const taskColumns = [
    {
      header: 'Task ID',
      key: 'id',
      render: (row) => (
        <span className="text-xs font-mono text-gray-400">
          {row._id?.substring(18) || row._id || 'N/A'}
        </span>
      )
    },
    {
      header: 'Platform',
      key: 'platform',
      render: (row) => {
        const platform = row.platform?.toUpperCase();
        let badgeStyle = 'bg-gray-100 text-gray-700';
        if (platform === 'YOUTUBE') badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/20';
        else if (platform === 'INSTAGRAM') badgeStyle = 'bg-pink-500/10 text-pink-500 border border-pink-500/20';
        else if (platform === 'SNAPCHAT') badgeStyle = 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20';
        else if (platform === 'FACEBOOK') badgeStyle = 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${badgeStyle}`}>
            {platform || 'GENERAL'}
          </span>
        );
      }
    },
    {
      header: 'Media Link',
      key: 'mediaLink',
      render: (row) => (
        <a 
          href={row.mediaLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5 break-all max-w-[280px]"
        >
          {row.mediaLink}
          <ExternalLink size={12} className="flex-shrink-0" />
        </a>
      )
    },
    {
      header: 'Posting Date',
      key: 'postingDate',
      render: (row) => (
        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {row.postingDate ? new Date(row.postingDate).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A'}
        </span>
      )
    },
    {
      header: 'Assigned At',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs text-gray-400 font-semibold">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A'}
        </span>
      )
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="p-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title="Edit Task"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDeleteTaskClick(row._id)}
            className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // Columns for payout requests history table
  const payoutRequestsColumns = [
    {
      header: 'Requested Date',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs font-semibold text-gray-500 block">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : '—'}
        </span>
      )
    },
    {
      header: 'Payout Amount',
      key: 'totalCommission',
      render: (row) => (
        <span className="text-sm font-black text-emerald-500">
          ₹{(row.totalCommission ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Commissions',
      key: 'totalOrders',
      render: (row) => (
        <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {row.totalOrders || row.commissionIds?.length || 0} orders
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const statusColors = {
          paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          failed: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        };
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${statusColors[row.status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Reference / Remarks',
      key: 'remarks',
      render: (row) => (
        <div className="flex flex-col text-left">
          {row.transactionId && (
            <span className="text-xs font-mono font-bold text-emerald-500">
              UTR: {row.transactionId}
            </span>
          )}
          {row.remarks && (
            <span className="text-xs text-zinc-400 font-medium">
              {row.remarks}
            </span>
          )}
          {!row.transactionId && !row.remarks && (
            <span className="text-xs text-zinc-500">—</span>
          )}
        </div>
      )
    }
  ];

  // Columns for the wallet transactions history log table
  const walletTransactionColumns = [
    {
      header: 'Date',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs font-semibold text-gray-500 block">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : '—'}
        </span>
      )
    },
    {
      header: 'Description',
      key: 'description',
      render: (row) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
            {row.description || row.message || 'Earnings Credit'}
          </span>
          <span className="text-xs font-semibold text-zinc-500 uppercase mt-0.5">
            TXID: {row.transactionId || row._id || '—'}
          </span>
        </div>
      )
    },
    {
      header: 'Type',
      key: 'type',
      render: (row) => {
        const type = row.type?.toUpperCase() || 'CREDIT';
        const isCredit = type === 'CREDIT' || type === 'EARNING' || type === 'DEPOSIT';
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
            isCredit
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}>
            {type}
          </span>
        );
      }
    },
    {
      header: 'Amount',
      key: 'amount',
      render: (row) => {
        const type = row.type?.toUpperCase() || 'CREDIT';
        const isCredit = type === 'CREDIT' || type === 'EARNING' || type === 'DEPOSIT';
        return (
          <span className={`text-sm font-black flex items-center gap-0.5 ${
            isCredit ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {isCredit ? '+' : '-'} ₹{row.amount?.toLocaleString('en-IN') || 0}
          </span>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const status = row.status?.toUpperCase() || 'COMPLETED';
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
            status === 'COMPLETED' || status === 'SUCCESS'
              ? 'bg-emerald-500/10 text-emerald-500'
              : status === 'PENDING'
              ? 'bg-amber-500/10 text-amber-500'
              : 'bg-rose-500/10 text-rose-500'
          }`}>
            {status}
          </span>
        );
      }
    }
  ];

  // Recent Orders columns from analytics endpoint
  const recentOrders = analytics?.recentOrders || [];

  const orderColumns = [
    {
      header: 'Order ID',
      key: 'id',
      render: (row) => (
        <span className="text-xs font-mono text-gray-400">
          {row._id || row.id || 'N/A'}
        </span>
      )
    },
    {
      header: 'Customer',
      key: 'customerName',
      render: (row) => (
        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {row.user?.name || row.customerName || 'Walk-in Customer'}
        </span>
      )
    },
    {
      header: 'Order Amount',
      key: 'amount',
      render: (row) => (
        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          ₹{(row.amount || row.totalAmount || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'My Commission',
      key: 'commission',
      render: (row) => (
        <span className="text-xs font-bold text-primary">
          ₹{(row.commission || row.commissionEarned || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
          row.status === 'Completed' || row.status === 'Paid' || row.status === 'DELIVERED'
            ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600') 
            : (isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50/10 text-yellow-600')
        }`}>
          {row.status || 'Pending'}
        </span>
      )
    },
    {
      header: 'Date',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs text-gray-400">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }) : 'N/A'}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden font-outfit transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 w-72 z-[101] 
        flex flex-col transition-transform duration-300 transform border-r
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}
      `}>
        <div className={`h-20 px-6 border-b flex items-center justify-between ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-black text-primary uppercase tracking-widest leading-none">
              FashionFever Creator
            </span>
            <span className={`text-sm font-bold uppercase tracking-wide block mt-1.5 whitespace-nowrap ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
              Influencer Dashboard
            </span>
          </div>
          <button className="lg:hidden text-zinc-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <LayoutDashboard size={19} /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('affiliate'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'affiliate' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Share2 size={19} /> Affiliate Network
          </button>
          <button 
            onClick={() => { setActiveTab('submit-story'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'submit-story' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <PlusCircle size={19} /> Submit Story
          </button>
          <button 
            onClick={() => { setActiveTab('tasks'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'tasks' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Briefcase size={19} /> My Tasks
          </button>
          <button 
            onClick={() => { setActiveTab('commission-slabs'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'commission-slabs' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Percent size={19} /> Commission Slabs
          </button>
          <button 
            onClick={() => { setActiveTab('wallet'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'wallet' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Wallet size={19} /> My Wallet
          </button>
          <button 
            onClick={() => { setActiveTab('payout'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'payout' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Landmark size={19} /> Bank Details
          </button>
          <button 
            onClick={() => { setActiveTab('audience'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'audience' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Users size={19} /> Audience
          </button>
        </nav>
        
        {/* Footer/Logout button in sidebar */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isDarkMode 
                ? 'text-rose-400 hover:bg-rose-500/10' 
                : 'text-rose-500 hover:bg-rose-50'
            } cursor-pointer`}
          >
            <X size={19} /> Back to Home
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto">
        
        {/* Header */}
        <header className={`h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b sticky top-0 z-40 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-zinc-950/85 border-zinc-800 backdrop-blur text-white' 
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}>
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <button 
              className={`lg:hidden p-2 rounded-xl transition-all border ${
                isDarkMode ? 'text-zinc-400 hover:bg-zinc-800 border-zinc-800' : 'text-zinc-600 hover:bg-zinc-100 border-zinc-200'
              }`} 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className={`text-lg lg:text-xl font-bold capitalize ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Influencer Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isDarkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
            }`}>
              Influencer Tier: {user?.influencerTier || user?.tier || 'Diamond'}
            </span>
            
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-xl transition-all border ${
                isDarkMode ? 'bg-white/5 text-primary border-white/5 shadow-xl shadow-primary/10' : 'bg-gray-55 text-primary border-transparent hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button className="bg-primary hover:bg-primary/90 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/10 cursor-pointer" title="Withdraw Earnings">
              <span className="hidden sm:inline">Withdraw Earnings</span>
              <span className="inline sm:hidden"><ExternalLink size={15} /></span>
            </button>
          </div>
        </header>

        <main className={`p-4 lg:p-8 space-y-8 flex-grow transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
          
          {activeTab === 'dashboard' && (
            <>
              {/* Referral Link Card */}
              <div className="bg-gradient-to-r from-primary to-pink-500 p-8 rounded-2xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-xl lg:text-2xl font-bold tracking-wide">Your Unique Referral Link</h2>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                      overview?.commissionRate === null || overview?.commissionRate === undefined
                        ? 'bg-amber-400/25 text-amber-100 border border-amber-300/40'
                        : overview?.commissionRate === 0
                        ? 'bg-zinc-400/25 text-zinc-100 border border-zinc-300/40'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}>
                      {overview?.commissionRate === null || overview?.commissionRate === undefined
                        ? 'Rate Unset'
                        : overview?.commissionRate === 0
                        ? '0% (No Commission)'
                        : `${overview.commissionRate}% Commission Rate`}
                    </span>
                  </div>
                  <p className="text-white/90 font-medium mb-6 text-sm">
                    Share this link with your audience to earn {
                      overview?.commissionRate === null || overview?.commissionRate === undefined
                        ? 'commissions once your rate is configured by admin.'
                        : overview?.commissionRate === 0
                        ? 'rewards under partner referral program (0% commission configured).'
                        : `${overview.commissionRate}% commission on every confirmed net order.`
                    }
                  </p>
                  <div className="flex flex-col md:flex-row items-center bg-white/20 backdrop-blur-md rounded-2xl p-2 gap-4 border border-white/20">
                    <code className="flex-grow font-mono font-bold text-sm px-4 select-all break-all text-center md:text-left py-2 md:py-0 text-white">{displayLink}</code>
                    <button 
                      onClick={handleCopy}
                      className="w-full md:w-auto bg-white text-primary px-6 py-3 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Link</>}
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className={`p-6 rounded-2xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-900 border-white/5 shadow-xl hover:shadow-primary/5 hover:border-primary/20' 
                      : 'bg-white border-gray-150 shadow-sm hover:shadow-md hover:border-gray-200'
                  }`}>
                    <div className={`p-3 w-fit rounded-2xl mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-55'}`}>
                      {stat.icon}
                    </div>
                    <h3 className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</h3>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
                    <p className="text-xs font-semibold text-gray-400 mt-2 flex items-center gap-1 uppercase">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Content Submission Form */}
              <div className={`p-8 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-150 shadow-sm'
              }`}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <PlusCircle size={24} />
                  </div>
                  <h2 className={`text-lg lg:text-xl font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Submit New Content</h2>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Platform</label>
                    <select className={`w-full p-4 border rounded-xl text-sm font-bold outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-850 border-white/5 text-white focus:ring-2 focus:ring-primary/20' 
                        : 'bg-gray-55 border-transparent text-gray-800 focus:bg-white focus:ring-2 focus:ring-primary/10'
                    }`}>
                      <option>Instagram Reel</option>
                      <option>YouTube Video</option>
                      <option>TikTok / Short</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Content URL</label>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      className={`w-full p-4 border rounded-xl text-sm font-bold outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-850 border-white/5 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary/20' 
                          : 'bg-gray-55 border-transparent text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-primary/10'
                      }`} 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-400">Short Description</label>
                    <textarea 
                      rows="3" 
                      placeholder="Explain the content theme..." 
                      className={`w-full p-4 border rounded-xl text-sm font-bold outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-850 border-white/5 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary/20' 
                          : 'bg-gray-55 border-transparent text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-primary/10'
                      }`}
                    ></textarea>
                  </div>
                  <button className="md:col-span-2 bg-primary text-white py-4 rounded-xl font-bold uppercase text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
                    Submit Content for Review
                  </button>
                </form>
              </div>

              {/* Recent Referral Orders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className={`text-lg font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent Referral Orders</h2>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-150 text-gray-600'}`}>
                    Last 45 Days
                  </span>
                </div>
                
                <DataTable columns={orderColumns} data={recentOrders} />
              </div>
            </>
          )}

          {activeTab === 'affiliate' && (
            <>
              {/* Network & Affiliate Metrics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: 6 Stats Cards */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h2 className={`text-sm font-bold tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Affiliate Network Performance
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {affiliateStatsList.map((stat, i) => (
                      <div key={i} className={`p-5 rounded-2xl border transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-900 border-white/5 hover:border-primary/20' 
                          : 'bg-white border-gray-150 shadow-sm hover:shadow-md'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</span>
                          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                            {stat.icon}
                          </div>
                        </div>
                        <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Registration Pie/Donut Chart */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-150 shadow-sm'
                }`}>
                  <div>
                    <h3 className={`text-sm font-bold tracking-wider mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Registration Distribution
                    </h3>
                    
                    <div className="flex flex-col items-center justify-center py-2 sm:flex-row sm:gap-6">
                      {/* Donut SVG */}
                      <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
                        <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                          {/* Base circle background */}
                          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isDarkMode ? "#1f2937" : "#f3f4f6"} strokeWidth="4.5" />
                          
                          {pieSum > 0 ? (
                            processedPieSegments.map((seg, idx) => (
                              seg.percent > 0 && (
                                <circle
                                  key={idx}
                                  cx="21"
                                  cy="21"
                                  r="15.91549430918954"
                                  fill="transparent"
                                  className={`${seg.stroke} transition-all duration-500`}
                                  strokeWidth="4.5"
                                  strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
                                  strokeDashoffset={seg.offset}
                                />
                              )
                            ))
                          ) : (
                            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" className="stroke-gray-300" strokeWidth="4.5" strokeDasharray="100 0" strokeDashoffset="0" />
                          )}
                        </svg>
                        <div className="absolute text-center">
                          <span className={`block text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{pieSum}</span>
                          <span className="block text-xs font-bold uppercase text-zinc-400">Onboarded</span>
                        </div>
                      </div>

                      {/* Legend list */}
                      <div className="flex-grow space-y-2.5 mt-4 sm:mt-0 w-full sm:w-auto">
                        {processedPieSegments.map((seg, idx) => {
                          const pct = pieSum > 0 ? Math.round((seg.value / pieSum) * 100) : 0;
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs font-bold">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${seg.bg}`}></span>
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{seg.label}</span>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block mr-1 font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{seg.value}</span>
                                <span className="text-sm text-gray-400">({pct}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'submit-story' && (
            <div className="space-y-6 text-left">
              {/* Header section with Modal opener button */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Stories Submissions
                  </h2>
                  <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-gray-450' : 'text-gray-500'}`}>
                    View active stories and submit new promotional link embeds.
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
                >
                  <PlusCircle size={18} />
                  Submit New Story
                </button>
              </div>

              {/* Active Stories Data Table */}
              {loadingStories ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-primary mb-3" size={24} />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading active stories...</span>
                </div>
              ) : myStories.length === 0 ? (
                <div className={`p-12 text-center border rounded-2xl ${
                  isDarkMode ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 shadow-sm text-zinc-600'
                }`}>
                  <PlusCircle size={32} className="text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-bold mb-1">No active stories found</p>
                  <p className="text-xs text-zinc-400 font-medium">Get started by clicking the "Submit New Story" button above to showcase your content on our homepage.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <DataTable columns={myStoriesColumns} data={myStories} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Campaign Tasks
                  </h2>
                  <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    View and manage assigned promotional tasks, platforms, and media links.
                  </p>
                </div>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
                >
                  <PlusCircle size={18} />
                  Submit Campaign Link
                </button>
              </div>

              {loadingTasks ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-primary mb-3" size={24} />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading assigned tasks...</span>
                </div>
              ) : tasks.length === 0 ? (
                <div className={`p-12 text-center border rounded-2xl ${
                  isDarkMode ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 shadow-sm text-zinc-600'
                }`}>
                  <Briefcase size={32} className="text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-bold mb-1">No assigned tasks found</p>
                  <p className="text-xs text-zinc-400 font-medium">Your campaign tasks assigned by the admin will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <DataTable columns={taskColumns} data={tasks} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    My Creator Wallet
                  </h2>
                  <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Real-time commission ledger, eligible payable balances, and withdrawal requests.
                  </p>
                </div>

                {/* Request Payout Action */}
                <div>
                  {((walletBalance.approvedBalance ?? walletBalance.balance ?? 0) >= 500) ? (
                    <button
                      onClick={() => setIsPayoutModalOpen(true)}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-hover active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/25 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <IndianRupee size={15} />
                      Request Payout (₹{(walletBalance.approvedBalance ?? walletBalance.balance ?? 0).toLocaleString('en-IN')})
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        disabled
                        className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-xl text-xs font-bold uppercase tracking-wider cursor-not-allowed border border-zinc-300 dark:border-zinc-700/60"
                        title="Minimum ₹500 required to request payout"
                      >
                        Request Payout
                      </button>
                      <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                        ₹{(500 - (walletBalance.approvedBalance ?? walletBalance.balance ?? 0)).toFixed(2)} more needed for ₹500 min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Balance & Earnings summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Available / Approved Balance Card */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 shadow-xl shadow-primary/5' 
                    : 'bg-white border-zinc-200 shadow-sm'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Available to Withdraw</span>
                    <span className={`text-2xl font-black block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      ₹{(walletBalance.approvedBalance ?? walletBalance.balance ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium block">Approved & Unsettled</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Coins size={24} />
                  </div>
                </div>

                {/* 7-Day Hold / Pending Balance */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 shadow-xl' 
                    : 'bg-white border-zinc-200 shadow-sm'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">In 7-Day Return Hold</span>
                    <span className={`text-2xl font-black block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      ₹{(walletBalance.pendingBalance ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium block">Pending return window</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400">
                    <Clock size={24} />
                  </div>
                </div>

                {/* Total Paid Balance */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 shadow-xl' 
                    : 'bg-white border-zinc-200 shadow-sm'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Total Paid Out</span>
                    <span className={`text-2xl font-black block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      ₹{(walletBalance.paidBalance ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium block">Settled bank transfers</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-400">
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                {/* Lifetime Earnings Card */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 shadow-xl shadow-primary/5' 
                    : 'bg-white border-zinc-200 shadow-sm'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Lifetime Earnings</span>
                    <span className={`text-2xl font-black block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      ₹{(walletBalance.lifetimeEarnings ?? walletBalance.totalEarnings ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium block">Approved + Paid</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>

              {/* Payout Requests Section */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-xl' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-bold uppercase ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                    Payout Withdrawal Requests
                  </h3>
                  <span className="text-xs font-bold text-zinc-400 uppercase">
                    {payoutRequests.length} Requests
                  </span>
                </div>

                {payoutRequests.length === 0 ? (
                  <div className="py-10 text-center text-zinc-400">
                    <IndianRupee size={28} className="mx-auto mb-2 text-zinc-400 opacity-40" />
                    <p className="text-xs font-bold uppercase tracking-wider">No payout requests submitted yet</p>
                    <p className="text-xs text-zinc-500 font-medium mt-1">When you request a withdrawal of ₹500 or more, status will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <DataTable columns={payoutRequestsColumns} data={payoutRequests} />
                  </div>
                )}
              </div>

              {/* Transactions list Table */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-xl' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <h3 className={`text-sm font-bold uppercase mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Transactions & Ledger History
                </h3>

                {loadingWallet ? (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-primary mb-3" size={24} />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading transactions...</span>
                  </div>
                ) : walletTransactions.length === 0 ? (
                  <div className="py-16 text-center text-zinc-400">
                    <Wallet size={32} className="mx-auto mb-3 text-zinc-400" />
                    <p className="text-xs font-bold uppercase tracking-wider">No Transactions Found</p>
                    <p className="text-xs text-zinc-400 font-medium mt-1">Earnings and withdrawals log will be populated here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <DataTable columns={walletTransactionColumns} data={walletTransactions} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payout' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <PayoutBankDetails 
                isDarkMode={isDarkMode} 
                role="influencer"
                ownerId={user?._id}
              />
            </div>
          )}

          {activeTab === 'commission-slabs' && (
            <div className="space-y-8 text-left animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <div>
                  <h2 className="text-xl font-bold tracking-wide">Tiers & Commission Rates</h2>
                  <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-450'}`}>
                    See commission targets and partner tiers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider ${
                    overview?.commissionRate === null || overview?.commissionRate === undefined
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : overview?.commissionRate === 0
                      ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {overview?.commissionRate === null || overview?.commissionRate === undefined
                      ? 'Rate Unset'
                      : overview?.commissionRate === 0
                      ? '0% (No Commission)'
                      : `${overview.commissionRate}% Active Commission Rate`}
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div className={`p-6 rounded-[2rem] border flex flex-col md:flex-row gap-6 items-start md:items-center transition-colors ${
                isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'
              }`}>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">How Commission Slabs & Custom Rates Work</h3>
                  <p className={`text-xs font-medium mt-1 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Your commission rate is custom-configured individually for your creator account by the FashionFever admin team. Commissions are calculated on Net Order Amount and become payable after the standard 7-day post-delivery return hold window.
                  </p>
                </div>
              </div>

              {/* Slabs Grid */}
              {loadingCommissionSlabs ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-xs font-bold text-gray-400">Fetching commission tiers...</p>
                </div>
              ) : commissionSlabs.length === 0 ? (
                <div className={`p-12 text-center rounded-[2rem] border ${
                  isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'
                }`}>
                  <Percent size={40} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-400">No commission slabs defined yet</p>
                  <p className="text-xs text-gray-500 mt-1">Check back later for updated targets</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {commissionSlabs.map((slab, i) => (
                    <div 
                      key={slab._id || i}
                      className={`group rounded-[2.2rem] border p-8 flex flex-col justify-between hover:border-primary/30 transition-all duration-500 relative overflow-hidden ${
                        isDarkMode 
                          ? 'bg-gray-900 border-white/5 hover:shadow-2xl hover:shadow-primary/5' 
                          : 'bg-white border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5'
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-primary/10 rounded-2xl text-primary font-bold text-xl">
                            {slab.commissionRate}%
                          </div>
                          <span className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            i === 0
                              ? (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-550')
                              : i === commissionSlabs.length - 1
                                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                : 'bg-primary/5 text-primary'
                          }`}>
                            {i === 0 ? 'Base Tier' : i === commissionSlabs.length - 1 ? 'Elite Tier' : `Tier ${i + 1}`}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-gray-400 mb-2">Monthly Sales Target</h3>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-bold text-xl">
                            <IndianRupee size={16} className="text-primary/70" />
                            <span>{slab.minSales?.toLocaleString('en-IN')}</span>
                            <span className="text-gray-400 font-bold mx-1 text-sm">to</span>
                            {slab.maxSales === 999999999 || !slab.maxSales ? (
                              <span className="text-sm font-bold text-gray-400">Unlimited</span>
                            ) : (
                              <span>{slab.maxSales?.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`mt-8 pt-6 border-t text-sm font-bold ${isDarkMode ? 'border-white/5 text-gray-400' : 'border-gray-50 text-gray-500'}`}>
                        Requires target referral sales
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audience' && (
            <div className="space-y-8 text-left animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-wide">Audience & Buyer Demographics</h2>
                  <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Real-time breakdown of followers and buyers converting through your affiliate link.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-rose-50 text-primary border border-rose-200 px-3 py-1.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} /> Total Referred Buyers: {audienceData?.totalBuyers ?? 0} Users
                  </span>
                </div>
              </div>

              {loadingAudience ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-xs font-bold text-gray-400">Fetching audience demographic analytics...</p>
                </div>
              ) : (
                <>
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="p-3 w-fit rounded-2xl bg-rose-50 text-primary mb-3">
                        <Users size={20} />
                      </div>
                      <h3 className="text-xs font-bold uppercase text-zinc-400">Total Referred Customers</h3>
                      <p className="text-2xl font-black mt-1">{audienceData?.totalBuyers ?? 0} Buyers</p>
                      <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1">
                        ↑ Active Buyers
                      </p>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="p-3 w-fit rounded-2xl bg-amber-50 text-amber-600 mb-3">
                        <Repeat size={20} />
                      </div>
                      <h3 className="text-xs font-bold uppercase text-zinc-400">Repeat Purchase Rate</h3>
                      <p className="text-2xl font-black mt-1">{(audienceData?.repeatRate ?? 0)}%</p>
                      <p className="text-xs font-semibold text-zinc-400 mt-1">Customer retention rate</p>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="p-3 w-fit rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                        <MapPin size={20} />
                      </div>
                      <h3 className="text-xs font-bold uppercase text-zinc-400">Top Buying Region</h3>
                      <p className="text-2xl font-black mt-1 truncate">{audienceData?.topLocation || 'No Orders Yet'}</p>
                      <p className="text-xs font-semibold text-zinc-400 mt-1">Top order volume</p>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="p-3 w-fit rounded-2xl bg-purple-50 text-purple-600 mb-3">
                        <Heart size={20} />
                      </div>
                      <h3 className="text-xs font-bold uppercase text-zinc-400">Top Preferred Category</h3>
                      <p className="text-2xl font-black mt-1 truncate">{audienceData?.topCategory || 'N/A'}</p>
                      <p className="text-xs font-semibold text-zinc-400 mt-1">Category preference</p>
                    </div>
                  </div>

                  {/* Geographical & Traffic Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Top Buying Cities Breakdown */}
                    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                          <MapPin size={18} className="text-primary" /> Top Buyer Locations
                        </h3>
                        <span className="text-xs font-bold uppercase text-zinc-400">By Orders</span>
                      </div>

                      <div className="space-y-4">
                        {!audienceData?.topCities || audienceData.topCities.length === 0 ? (
                          <div className="py-10 text-center text-zinc-400">
                            <MapPin size={28} className="mx-auto mb-2 opacity-40 text-primary" />
                            <p className="text-xs font-bold uppercase tracking-wider">No Location Data Yet</p>
                            <p className="text-xs text-zinc-400 font-medium mt-1">Referred buyer cities will appear here once orders are placed.</p>
                          </div>
                        ) : (
                          audienceData.topCities.map((loc, idx) => (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-extrabold">
                                <span>{loc.city}</span>
                                <span className="text-primary font-mono">{loc.percent}% ({loc.count})</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-primary to-pink-500 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${loc.percent}%` }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Conversion Traffic Channels */}
                    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                          <BarChart3 size={18} className="text-primary" /> Conversion Traffic Channels
                        </h3>
                        <span className="text-xs font-bold uppercase text-zinc-400">Source</span>
                      </div>

                      <div className="space-y-4">
                        {!audienceData?.trafficSources || audienceData.trafficSources.length === 0 ? (
                          <div className="py-10 text-center text-zinc-400">
                            <BarChart3 size={28} className="mx-auto mb-2 opacity-40 text-primary" />
                            <p className="text-xs font-bold uppercase tracking-wider">No Traffic Source Data Yet</p>
                            <p className="text-xs text-zinc-400 font-medium mt-1">Conversion channel breakdown will populate as orders are completed.</p>
                          </div>
                        ) : (
                          audienceData.trafficSources.map((ch, idx) => (
                            <div key={idx} className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{ch.icon}</span>
                                <div>
                                  <p className="text-xs font-bold">{ch.channel}</p>
                                  <p className="text-xs font-semibold text-zinc-400">Direct Link Conversions</p>
                                </div>
                              </div>
                              <span className="text-sm font-black text-primary font-mono">{ch.percent}%</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>
          )}

          {/* Submit Story Popup Modal */}
          {isSubmitModalOpen && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className={`w-full max-w-lg my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
                isDarkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white text-gray-800'
              }`}>
                <div className="p-6 md:p-8 text-left">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5">
                      <PlusCircle size={20} className="text-primary" />
                      <h3 className="text-lg font-bold tracking-wide">Submit Daily Story</h3>
                    </div>
                    <button
                      onClick={() => setIsSubmitModalOpen(false)}
                      className={`p-2 rounded-xl transition-all ${
                        isDarkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Info Notice */}
                  <div className={`p-4 rounded-2xl border text-xs font-semibold mb-6 flex items-start gap-3 ${
                    isDarkMode ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-rose-50/50 border-rose-100 text-primary'
                  }`}>
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="font-bold">Story Expiry Notice</p>
                      <p className="text-gray-400 dark:text-gray-450 mt-0.5 normal-case font-medium">
                        All submitted stories automatically expire after 24 hours of submission to keep the homepage content fresh and active.
                      </p>
                    </div>
                  </div>

                  {/* Submit Form */}
                  <form onSubmit={handleStorySubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400">Story URL Link</label>
                      <input 
                        type="url" 
                        required
                        value={storyUrl}
                        onChange={(e) => setStoryUrl(e.target.value)}
                        placeholder="E.g., https://instagram.com/stories/..." 
                        className={`w-full p-4 border rounded-xl text-sm font-bold outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-white/5 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary/20' 
                            : 'bg-gray-55 border-transparent text-gray-805 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-primary/10'
                        }`} 
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={submittingStory}
                      className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submittingStory ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Submitting Story...
                        </>
                      ) : (
                        'Submit Story Link'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Submit Campaign Task Popup Modal */}
          {isTaskModalOpen && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className={`w-full max-w-lg my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
                isDarkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white text-gray-800'
              }`}>
                <div className="p-6 md:p-8 text-left">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5">
                      <Briefcase size={20} className="text-primary" />
                      <h3 className="text-lg font-bold tracking-wide">Submit Campaign Task</h3>
                    </div>
                    <button
                      onClick={() => setIsTaskModalOpen(false)}
                      className={`p-2 rounded-xl transition-all ${
                        isDarkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Submit Form */}
                  <form onSubmit={handleTaskSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400">Platform</label>
                      <select 
                        required
                        value={taskPlatform}
                        onChange={(e) => setTaskPlatform(e.target.value)}
                        className={`w-full p-4 border rounded-xl text-sm font-bold outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-white/5 text-white focus:ring-2 focus:ring-primary/20' 
                            : 'bg-gray-55 border-transparent text-gray-800 focus:bg-white focus:ring-2 focus:ring-primary/10'
                        }`}
                      >
                        <option value="YOUTUBE">YouTube</option>
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="SNAPCHAT">Snapchat</option>
                        <option value="FACEBOOK">Facebook</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400">Media Link</label>
                      <input 
                        type="url" 
                        required
                        value={taskMediaLink}
                        onChange={(e) => setTaskMediaLink(e.target.value)}
                        placeholder="E.g., https://www.youtube.com/watch?v=..." 
                        className={`w-full p-4 border rounded-xl text-sm font-bold outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-white/5 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary/20' 
                            : 'bg-gray-55 border-transparent text-gray-805 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-primary/10'
                        }`} 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400">Posting Date</label>
                      <div className="relative">
                        <input 
                          type="datetime-local" 
                          required
                          value={taskPostingDate}
                          onChange={(e) => setTaskPostingDate(e.target.value)}
                          onClick={(e) => e.target.showPicker?.()}
                          className={`w-full pl-12 pr-4 p-4 border rounded-xl text-sm font-bold outline-none transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-gray-900 border-white/5 text-white focus:ring-2 focus:ring-primary/20' 
                              : 'bg-gray-55 border-transparent text-gray-805 focus:bg-white focus:ring-2 focus:ring-primary/10'
                          }`} 
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={18} />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={submittingTask}
                      className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submittingTask ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Submitting Task...
                        </>
                      ) : (
                        'Submit Campaign Link'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit Campaign Task Popup Modal */}
          {isEditTaskModalOpen && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className={`w-full max-w-lg my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
                isDarkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white text-gray-800'
              }`}>
                <div className="p-6 md:p-8 text-left">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5">
                      <Briefcase size={20} className="text-primary" />
                      <h3 className="text-lg font-bold tracking-wide">Edit Campaign Task</h3>
                    </div>
                    <button
                      onClick={() => { setIsEditTaskModalOpen(false); setEditingTask(null); }}
                      className={`p-2 rounded-xl transition-all ${
                        isDarkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Submit Form */}
                  <form onSubmit={handleTaskUpdate} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400">Platform</label>
                      <select 
                        required
                        value={editTaskPlatform}
                        onChange={(e) => setEditTaskPlatform(e.target.value)}
                        className={`w-full p-4 border rounded-xl text-sm font-bold outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-white/5 text-white focus:ring-2 focus:ring-primary/20' 
                            : 'bg-gray-55 border-transparent text-gray-805 focus:bg-white focus:ring-2 focus:ring-primary/10'
                        }`}
                      >
                        <option value="YOUTUBE">YouTube</option>
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="SNAPCHAT">Snapchat</option>
                        <option value="FACEBOOK">Facebook</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400">Media Link</label>
                      <input 
                        type="url" 
                        required
                        value={editTaskMediaLink}
                        onChange={(e) => setEditTaskMediaLink(e.target.value)}
                        placeholder="E.g., https://www.youtube.com/watch?v=..." 
                        className={`w-full p-4 border rounded-xl text-sm font-bold outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-white/5 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary/20' 
                            : 'bg-gray-55 border-transparent text-gray-805 placeholder-gray-405 focus:bg-white focus:ring-2 focus:ring-primary/10'
                        }`} 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400">Posting Date</label>
                      <div className="relative">
                        <input 
                          type="datetime-local" 
                          required
                          value={editTaskPostingDate}
                          onChange={(e) => setEditTaskPostingDate(e.target.value)}
                          onClick={(e) => e.target.showPicker?.()}
                          className={`w-full pl-12 pr-4 p-4 border rounded-xl text-sm font-bold outline-none transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-gray-900 border-white/5 text-white focus:ring-2 focus:ring-primary/20' 
                              : 'bg-gray-55 border-transparent text-gray-805 focus:bg-white focus:ring-2 focus:ring-primary/10'
                          }`} 
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={18} />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={updatingTask}
                      className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updatingTask ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Updating Task...
                        </>
                      ) : (
                        'Update Campaign Link'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Request Payout Modal ── */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div 
            onClick={() => !isRequestingPayout && setIsPayoutModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />
          <div className={`relative w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border animate-in zoom-in-95 duration-200 text-left ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black uppercase tracking-wide">
                Confirm Payout Request
              </h3>
              <button 
                disabled={isRequestingPayout}
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block">Total Claimable Payout</span>
              <span className="text-2xl font-black text-emerald-500 block mt-0.5">
                ₹{(walletBalance.approvedBalance ?? walletBalance.balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium mt-1 block">
                All approved commissions (≥ ₹500) will be locked for admin settlement via external bank / UPI transfer.
              </span>
            </div>

            <div className="space-y-4 mb-6">
              {/* UPI ID input — persisted as immutable snapshot on payout record */}
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-1.5">
                  UPI ID <span className="text-zinc-500 font-normal normal-case">(optional – if no bank on file)</span>
                </label>
                <input
                  type="text"
                  value={payoutUpiId}
                  onChange={(e) => setPayoutUpiId(e.target.value)}
                  placeholder="e.g. name@ybl, handle@paytm"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none border transition-all ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-primary placeholder:text-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-primary placeholder:text-zinc-400'
                  }`}
                />
                <p className={`text-[10px] mt-1 ${ isDarkMode ? 'text-zinc-500' : 'text-zinc-400' }`}>
                  This UPI ID will be saved as a snapshot with this payout request for admin reference.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-1.5">
                  Optional Remarks / Note
                </label>
                <textarea
                  value={payoutRemarks}
                  onChange={(e) => setPayoutRemarks(e.target.value)}
                  placeholder="Any notes for the admin team"
                  rows={2}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none border transition-all ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-primary' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-primary'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isRequestingPayout}
                onClick={() => { setIsPayoutModalOpen(false); setPayoutUpiId(''); setPayoutRemarks(''); }}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                  isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRequestingPayout}
                onClick={handleRequestPayout}
                className="flex-1 py-3 bg-primary hover:bg-primary-hover active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRequestingPayout ? <Loader2 size={16} className="animate-spin" /> : <IndianRupee size={15} />}
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencerDashboard;
