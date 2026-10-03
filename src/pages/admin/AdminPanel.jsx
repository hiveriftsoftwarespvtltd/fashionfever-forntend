import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Users,
  Store,
  TrendingUp,
  CircleAlert,
  CircleCheckBig,
  CircleX,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sun,
  Moon,
  Eye,
  X,
  Menu,
  Percent,
  Trash2,
  Power,
  Sparkles,
  TicketPercent,
  Pencil,
  Grid,
  ShoppingBag,
  Package,
  Plus,
  BookOpen
} from 'lucide-react';
import DataTable from "../../components/shared/DataTable";
import DeleteConfirmModal from "../../components/shared/DeleteConfirmModal";
import UserDetailsModal from "./components/UserDetailsModal";
import VendorDetailsModal from "./components/VendorDetailsModal";
import OnboardInfluencerModal from "./components/OnboardInfluencer";
import InfluencerDetailsModal from "./components/InfluencerDetailsModal";
import EducatorDetailsModal from "./components/EducatorDetailsModal";
import CreateCourseCategoryModal from "./components/CreateCourseCategoryModal";
import CourseCategoryDetailsModal from "./components/CourseCategoryDetailsModal";
import AdminServiceManager from "./components/AdminServiceManager";
import { CreateCouponModal, CouponDetailsModal } from "./components/CouponModals";
import CreateCategoryModal from "./components/CreateCategoryModal";
import CategoryDetailsModal from "./components/CategoryDetailsModal";
import AdminSidebar from "./components/AdminSidebar";
import OrderDetailsModal from "./components/OrderDetailsModal";
import CreateCommissionSlabModal from "./components/CreateCommissionSlabModal";
import CommissionSlabDetailsModal from "./components/CommissionSlabDetailsModal";
import CreateCashbackSlabModal from "./components/CreateCashbackSlabModal";
import CashbackSlabDetailsModal from "./components/CashbackSlabDetailsModal";
import AdminDashboard from "./components/AdminDashboard";
import SendInvitationModal from "./components/SendInvitationModal";
import InfluencerCommissions from "./components/InfluencerCommissions";
import AdminAffiliateDashboard from "./components/AdminAffiliateDashboard";
import VendorPayouts from "./components/VendorPayouts";
import SubscriptionPlans from "./components/SubscriptionPlans";
import ServiceCategories from "./components/ServiceCategories";
import ServiceProviders from "./components/ServiceProviders";
import HomeContentList from "./components/HomeContentList";
import CreateHomeContentModal from "./components/CreateHomeContentModal";
import HomeBookingCardsManager from "./components/HomeBookingCardsManager";
import HomeContentDetailsModal from "./components/HomeContentDetailsModal";
import AdminWalletBalances from "./components/AdminWalletBalances";
import SupportTickets from "./components/SupportTickets";
import SubAdminsManager from "./components/SubAdminsManager";
import AdminProfile from "./components/AdminProfile";
import NotificationsManager from "./components/NotificationsManager";
import AdminServiceLeads from "./components/AdminServiceLeads";
import AdminBankAccounts from "./components/AdminBankAccounts";
import { useUser } from '../../context/UserContext';
import { getImageUrl } from '../../utils/imageUrl';
import { toast } from '../../utils/toast';
import {
  getAllUsers,
  toggleUserStatus,
  getAllVendors,
  deleteVendor,
  deleteUser,
  acceptVendor,
  toggleVendorStatus,
  rejectVendor,
  getPendingVendors,
  getAllInfluencers,
  updateInfluencerStatus,
  deleteInfluencer,
  deleteCoupon,
  getAllCoupons,
  getAllOrders,
  fetchCategories,
  deleteCategory,
  getAllProducts,
  deleteProduct,
  deleteAllProducts,
  getDashboardOverview,
  getRevenueTrend,
  getTopCategories,
  getOrderStatusAnalytics,
  getCategoryDistribution,
  getOrderStatusGraph,
  getMonthlyAnalytics,
  getYearlyAnalytics,
  getAnalyticsGraph,
  getTopVendorsGraph,
  getAllInfluencerCommissionSlabs,
  deleteInfluencerCommissionSlab,
  getHomeContents,
  getHomeContentsPublic,
  approveEducator,
  getPendingEducators,
  toggleEducatorActive,
  getAllEducators,
  addCourseCategory,
  getCourseCategories,
  getCourseCategoryDetails,
  getAllCashbackSlabs,
  deleteCashbackSlab,
  getAdminProfile,
  updateInfluencerCommissionRate
} from '../../api/adminService';
import { useTheme } from '../../context/ThemeContext';

const AdminPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const { isDarkMode, toggleTheme } = useTheme();
  const { role } = useUser();
  const containerRef = useRef(null);

  // Admin and sub-admin granular module permissions states
  const [adminAccess, setAdminAccess] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Tab-access validation helper
  const hasAccessToTab = (tab) => {
    if (profileLoading) return true;
    if (isSuperAdmin) return true;
    if (tab === 'profile' || tab === 'dashboard') return true;

    // Check which module corresponds to the tab
    const tabModuleMap = {
      'users': 'USERS',
      'service-providers': 'SERVICE_PROVIDERS',
      'educators': 'COURSES',
      'all-educators': 'COURSES',
      'sub-admins': 'NONE', // only super_admin can access sub-admins list
      'vendors': 'VENDORS',
      'pending': 'VENDORS',
      'vendor-payouts': 'VENDORS',
      'affiliate-dashboard': 'INFLUENCERS',
      'influencers': 'INFLUENCERS',
      'commission-slabs': 'INFLUENCERS',
      'influencer-commissions': 'INFLUENCERS',
      'categories': 'COURSES',
      'course-categories': 'COURSES',
      'products': 'VENDORS',
      'coupons': 'INFLUENCERS',
      'subscription-plans': 'SERVICE_PROVIDERS',
      'orders': 'VENDORS',
      'beauty-services': 'SERVICE_PROVIDERS',
      'service-categories': 'SERVICE_PROVIDERS',
      'admin-service-leads': 'SERVICE_PROVIDERS',
      'home-content': 'HOME_CONTENT',
      'cashback-slabs': 'FINANCE',
      'wallet-balances': 'FINANCE',
      'tickets': 'TICKETS',
      'notifications': 'NOTIFICATION'
    };

    const requiredModule = tabModuleMap[tab];
    if (!requiredModule) return true; // general fallback
    return adminAccess.some(item => item.module === requiredModule);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setProfileLoading(true);
      try {
        const response = await getAdminProfile();
        if (response.success && response.data) {
          setAdminAccess(response.data.adminAccess || response.data.moduleAccess || []);
          setIsSuperAdmin(response.data.user?.roles?.includes('super_admin') || false);
        }
      } catch (err) {
        console.error('Error loading admin profile info:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (!profileLoading && !hasAccessToTab(activeTab)) {
      // Find a safe tab they do have access to, or default to profile
      if (isSuperAdmin || adminAccess.some(item => item.module === 'DASHBOARD')) {
        setSearchParams({ tab: 'dashboard' });
      } else {
        setSearchParams({ tab: 'profile' });
      }
    }
  }, [activeTab, profileLoading, isSuperAdmin, adminAccess]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedEducatorId, setSelectedEducatorId] = useState(null);
  const [selectedCourseCategoryId, setSelectedCourseCategoryId] = useState(null);
  const [isCreateCourseCategoryOpen, setIsCreateCourseCategoryOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState(null);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState(null);
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [influencerForCoupon, setInfluencerForCoupon] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateSlabOpen, setIsCreateSlabOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState(null);
  const [selectedSlabId, setSelectedSlabId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isCreateCashbackSlabOpen, setIsCreateCashbackSlabOpen] = useState(false);
  const [editingCashbackSlab, setEditingCashbackSlab] = useState(null);
  const [selectedCashbackSlab, setSelectedCashbackSlab] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [orderStatusAnalytics, setOrderStatusAnalytics] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [orderStatusGraph, setOrderStatusGraph] = useState([]);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState([]);
  const [yearlyAnalytics, setYearlyAnalytics] = useState([]);
  const [analyticsGraph, setAnalyticsGraph] = useState([]);
  const [topVendorsGraph, setTopVendorsGraph] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeMonthlyMetric, setActiveMonthlyMetric] = useState('revenue');
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isSendLinkOpen, setIsSendLinkOpen] = useState(false);
  const [showHomeContentModal, setShowHomeContentModal] = useState(false);
  const [editingHomeContent, setEditingHomeContent] = useState(null);
  const [selectedHomeContentId, setSelectedHomeContentId] = useState(null);

  const fetchOverview = async () => {
    setIsOverviewLoading(true);
    try {
      const [res, trendRes, catRes, statusRes, distRes, graphRes, yearlyRes, rawGraphRes, vendorsRes] = await Promise.allSettled([
        getDashboardOverview(),
        getRevenueTrend(10),
        getTopCategories(),
        getOrderStatusAnalytics(),
        getCategoryDistribution(),
        getOrderStatusGraph(),
        getYearlyAnalytics(),
        getAnalyticsGraph(),
        getTopVendorsGraph()
      ]);

      if (res.status === 'fulfilled' && res.value?.success) {
        setOverviewData(res.value.data?.data || res.value.data || null);
      }
      if (trendRes.status === 'fulfilled' && trendRes.value?.success) {
        const list = trendRes.value.data?.data ?? trendRes.value.data ?? [];
        setRevenueTrend(Array.isArray(list) ? list : []);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        const list = catRes.value.data?.data ?? catRes.value.data ?? [];
        setTopCategories(Array.isArray(list) ? list : []);
      }
      if (statusRes.status === 'fulfilled' && statusRes.value?.success) {
        const list = statusRes.value.data?.data ?? statusRes.value.data ?? [];
        setOrderStatusAnalytics(Array.isArray(list) ? list : []);
      }
      if (distRes.status === 'fulfilled' && distRes.value?.success) {
        const list = distRes.value.data?.data ?? distRes.value.data ?? [];
        setCategoryDistribution(Array.isArray(list) ? list : []);
      }
      if (graphRes.status === 'fulfilled' && graphRes.value?.success) {
        const list = graphRes.value.data?.data ?? graphRes.value.data ?? [];
        setOrderStatusGraph(Array.isArray(list) ? list : []);
      }
      if (yearlyRes.status === 'fulfilled' && yearlyRes.value?.success) {
        const list = yearlyRes.value.data?.data ?? yearlyRes.value.data ?? [];
        setYearlyAnalytics(Array.isArray(list) ? list : []);
      }
      if (rawGraphRes.status === 'fulfilled' && rawGraphRes.value?.success) {
        const list = rawGraphRes.value.data?.data ?? rawGraphRes.value.data ?? [];
        setAnalyticsGraph(Array.isArray(list) ? list : []);
      }
      if (vendorsRes.status === 'fulfilled' && vendorsRes.value?.success) {
        const list = vendorsRes.value.data?.data ?? vendorsRes.value.data ?? [];
        setTopVendorsGraph(Array.isArray(list) ? list : []);
      }

      fetchMonthlyData(selectedYear);
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setIsOverviewLoading(false);
    }
  };

  const fetchMonthlyData = async (year) => {
    try {
      const res = await getMonthlyAnalytics(year);
      if (res?.success) {
        const list = res.data?.data ?? res.data ?? [];
        setMonthlyAnalytics(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("Failed to load monthly analytics:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchMonthlyData(selectedYear);
    }
  }, [selectedYear, activeTab]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchOverview();
    }
  }, [activeTab]);

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'users') {
        response = await getAllUsers({ page: pagination.page, limit: pagination.limit, role: filters.role, search: filters.search });
      } else if (activeTab === 'vendors') {
        response = await getAllVendors({ page: pagination.page, limit: pagination.limit, search: filters.search });
      } else if (activeTab === 'pending') {
        response = await getPendingVendors({ page: pagination.page, limit: pagination.limit, search: filters.search });
      } else if (activeTab === 'influencers') {
        response = await getAllInfluencers({ page: pagination.page, limit: pagination.limit, search: filters.search });
      } else if (activeTab === 'commission-slabs') {
        response = await getAllInfluencerCommissionSlabs();
      } else if (activeTab === 'coupons') {
        response = await getAllCoupons({ page: pagination.page, limit: pagination.limit, search: filters.search });
      } else if (activeTab === 'categories') {
        response = await fetchCategories({ page: pagination.page, limit: pagination.limit, search: filters.search });
      } else if (activeTab === 'orders') {
        response = await getAllOrders({ page: pagination.page, limit: pagination.limit, search: filters.search });
      } else if (activeTab === 'products') {
        response = await getAllProducts({ page: pagination.page, limit: pagination.limit, search: filters.search });
      } else if (activeTab === 'home-content') {
        response = await getHomeContentsPublic({ page: pagination.page, limit: pagination.limit, search: filters.search });
      } else if (activeTab === 'educators') {
        response = await getPendingEducators();
      } else if (activeTab === 'all-educators') {
        response = await getAllEducators();
      } else if (activeTab === 'course-categories') {
        response = await getCourseCategories();
      } else if (activeTab === 'cashback-slabs') {
        response = await getAllCashbackSlabs();
      }

      if (response && response.success) {
        let list;
        if (activeTab === 'course-categories') {
          const inner = response.data?.data ?? response.data;
          list = Array.isArray(inner) ? inner : (inner?.data || []);
        } else if (activeTab === 'categories' || activeTab === 'orders' || activeTab === 'products' || activeTab === 'home-content' || activeTab === 'educators' || activeTab === 'all-educators' || activeTab === 'cashback-slabs') {
          list = response.data?.data || response.data || [];
        } else {
          list = response.data?.users || response.data?.vendors || response.data?.influencers || response.data?.coupons || response.data?.data || response.data || [];
        }
        if (activeTab === 'vendors') {
          list = list.filter(u => u.roles?.includes('vendor') || u.role === 'vendor' || u.vendorId || u.businessName);
        } else if (activeTab === 'pending') {
          list = list.filter(u => (u.vendorId?.status || u.status || u.roleStatus?.vendor) === 'PENDING');
        } else if (activeTab === 'commission-slabs' || activeTab === 'cashback-slabs') {
          list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setDataList(list);
        setPagination(prev => ({ ...prev, total: response.data?.total || list.length }));
      }
    } catch (error) { toast.error('Data sync failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (['users', 'vendors', 'pending', 'influencers', 'commission-slabs', 'coupons', 'categories', 'course-categories', 'orders', 'products', 'home-content', 'educators', 'all-educators', 'cashback-slabs'].includes(activeTab)) fetchData();
  }, [activeTab, pagination.page, filters.role]);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      let res;
      if (activeTab === 'users') {
        res = await deleteUser(itemToDelete._id);
      } else if (activeTab === 'influencers') {
        res = await deleteInfluencer(itemToDelete._id);
      } else {
        const vId = itemToDelete.vendorId?._id || itemToDelete.vendorId || itemToDelete._id;
        res = await deleteVendor(vId);
      }
      if (res.success) {
        toast.success('Record removed');
        fetchData();
        setItemToDelete(null);
      }
    } catch (err) { toast.error('Removal failed'); }
  };

  const handleApproveVendor = async (vId) => {
    try {
      const res = await acceptVendor(vId);
      if (res.success) { toast.success('Vendor approved'); fetchData(); }
    } catch (e) { toast.error('Approval failed'); }
  };

  const handleRejectVendor = async (vId) => {
    try {
      const res = await rejectVendor(vId);
      if (res.success) { toast.success('Vendor rejected'); fetchData(); }
    } catch (e) { toast.error('Rejection failed'); }
  };

  const handleUpdateInfluencerStatus = async (influencerId, status) => {
    try {
      const res = await updateInfluencerStatus(influencerId, status);
      if (res.success) {
        toast.success(status === 'active' ? 'Influencer approved successfully!' : `Influencer status updated to ${status}`);
        fetchData();
      } else {
        toast.error(res.message || 'Failed to update influencer status');
      }
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const handleQuickCommissionRate = (inf) => {
    const currentRateDisplay = typeof inf.commissionRate === 'number' ? `${inf.commissionRate}%` : 'Rate Unset';
    const currentRateValue = typeof inf.commissionRate === 'number' ? inf.commissionRate : '';

    Swal.fire({
      title: `Commission Rate for ${inf.name || inf.userId?.name || 'Influencer'}`,
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.6; margin-bottom: 15px; color: ${isDarkMode ? '#cbd5e1' : '#475569'};">
          <p style="margin-bottom: 6px;">Current Configuration: <strong style="color: ${typeof inf.commissionRate === 'number' ? '#10b981' : '#f59e0b'};">${currentRateDisplay}</strong></p>
          <p style="margin-bottom: 6px;">Enter a custom commission percentage between <strong>0% and 100%</strong>, or leave blank to keep/set as <strong>Rate Unset</strong>.</p>
          <p style="font-size: 11px; opacity: 0.8; margin-top: 8px;"><em>Note: There is no global default rate. Unconfigured creators generate zero financial commission ledger records on customer orders.</em></p>
        </div>
      `,
      input: 'number',
      inputValue: currentRateValue,
      inputAttributes: {
        min: '0',
        max: '100',
        step: '0.1',
        placeholder: 'e.g. 10 or 0 (leave blank for Unset)'
      },
      showCancelButton: true,
      confirmButtonText: 'Save Rate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#fe3e6a',
      cancelButtonColor: '#71717a',
      background: isDarkMode ? '#18181b' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#18181b',
      borderRadius: '20px',
      customClass: {
        popup: 'rounded-3xl border border-zinc-700/50',
        confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
        cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer',
        input: 'rounded-xl font-bold text-center text-lg'
      },
      inputValidator: (value) => {
        if (value !== '' && value !== null && value !== undefined) {
          const num = Number(value);
          if (isNaN(num) || num < 0 || num > 100) {
            return 'Commission rate must be a valid number between 0 and 100%';
          }
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const raw = result.value;
        const targetRate = (raw !== '' && raw !== null && raw !== undefined)
          ? parseFloat(Number(raw).toFixed(2))
          : null;

        const loadingToast = toast.loading('Updating commission rate...');
        try {
          const res = await updateInfluencerCommissionRate(inf._id, targetRate);
          toast.dismiss(loadingToast);
          if (res?.success || res?.statusCode === 200) {
            toast.success(targetRate !== null ? `Commission rate set to ${targetRate}%!` : 'Commission rate set to Unset (Null)!');
            fetchData();
          } else {
            toast.error(res?.message || 'Failed to update commission rate');
          }
        } catch (err) {
          toast.dismiss(loadingToast);
          toast.error('An error occurred while updating rate');
        }
      }
    });
  };

  const handleToggleUserStatus = async (userId) => {
    const loadingToast = toast.loading('Updating user status...');
    try {
      const res = await toggleUserStatus(userId);
      toast.dismiss(loadingToast);
      if (res.success) {
        toast.success(res.message || 'User status updated successfully!');
        fetchData();
      } else {
        toast.error(res.message || 'Failed to update user status.');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Something went wrong.');
    }
  };

  const userColumns = [
    {
      header: 'User Profile',
      render: (user) => (
        <div className="flex items-center gap-3.5 text-left">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 border ${
            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-100 border-zinc-200 text-zinc-800 shadow-sm'
          }`}>
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{user.name}</span>
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{user.email}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'System Role', 
      render: (user) => (
        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-wider border border-primary/20">
          {user.role}
        </span>
      ) 
    },
    {
      header: 'Status',
      render: (user) => {
        const isActive = user.isActive && !user.isDeleted;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
            isActive 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {isActive ? 'Active' : 'Banned'}
          </span>
        );
      }
    },
    { 
      header: 'Registration', 
      render: (user) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-extrabold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
            {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-xs uppercase font-bold text-zinc-400 mt-0.5">Onboarded</span>
        </div>
      ) 
    },
    {
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            title={user.isActive ? "Deactivate User" : "Activate User"} 
            onClick={() => handleToggleUserStatus(user._id)} 
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              user.isActive 
                ? (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-emerald-400 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-emerald-600 hover:bg-zinc-200') 
                : (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-emerald-400' : 'bg-zinc-100 border-zinc-200 text-zinc-400 hover:text-emerald-600')
            }`}
          >
            <Power size={16} />
          </button>
          <button 
            title="View Details" 
            onClick={() => setSelectedUserId(user._id)} 
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary hover:border-primary/30' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary hover:border-primary/30'
            }`}
          >
            <Eye size={16} />
          </button>
          <button 
            title="Delete User" 
            onClick={() => setItemToDelete(user)} 
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600 hover:border-rose-500/30'
            }`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const vendorColumns = [
    {
      header: 'Vendor Profile',
      render: (vendor) => {
        const isDirect = Boolean(vendor.businessName || vendor.slug || vendor.ownerId);
        const business = isDirect ? vendor : (typeof vendor.vendorId === 'object' ? vendor.vendorId : vendor);
        const owner = typeof vendor.ownerId === 'object' ? vendor.ownerId : (typeof business?.ownerId === 'object' ? business.ownerId : null);

        const name = business?.businessName || vendor.name || owner?.name || 'Vendor Partner';
        const ownerName = owner?.name && owner.name !== name ? owner.name : (vendor.name && vendor.name !== name ? vendor.name : null);
        const slug = business?.slug || vendor.slug || 'brand';
        const logoObj = business?.logo || vendor.logo;
        const logo = logoObj ? getImageUrl(logoObj) : null;
        const email = business?.email || business?.businessEmail || owner?.email || vendor.email || vendor.userId?.email || '';
        const phone = business?.phone || business?.businessPhone || owner?.phone || vendor.phone || vendor.mobile || '';
        const city = business?.city || vendor.city;
        const state = business?.state || vendor.state;
        const location = (city || state) ? `${city || ''}${city && state ? ', ' : ''}${state || ''}` : null;

        return (
          <div className="flex items-center gap-3.5 text-left">
            <div className={`w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center font-black border flex-shrink-0 ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-100 border-zinc-200 text-zinc-800 shadow-sm'
            }`}>
              {logo ? (
                <img
                  src={logo}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{ display: logo ? 'none' : 'flex' }}
                className="w-full h-full items-center justify-center text-primary font-black text-base"
              >
                {name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{name}</span>
              {ownerName && <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>👤 {ownerName}</span>}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                {email && <span className="text-xs font-bold text-primary lowercase tracking-tight">{email}</span>}
                {phone && <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>📞 {phone}</span>}
                {location && <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>📍 {location}</span>}
              </div>
              <span className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider">/{slug}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      render: (vendor) => {
        const isDirect = Boolean(vendor.businessName || vendor.slug || vendor.ownerId);
        const business = isDirect ? vendor : (typeof vendor.vendorId === 'object' ? vendor.vendorId : vendor);
        const status = vendor.status || business?.status || (business?.isActive ? 'APPROVED' : 'PENDING');
        const isActive = business?.isActive ?? vendor.isActive;

        if (status === 'PENDING') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending Review
            </span>
          );
        }

        if (status === 'REJECTED') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Rejected
            </span>
          );
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
            isActive 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
            {isActive ? 'Active' : 'Offline'}
          </span>
        );
      }
    },
    { 
      header: 'Registration', 
      render: (vendor) => {
        const isDirect = Boolean(vendor.businessName || vendor.slug || vendor.ownerId);
        const business = isDirect ? vendor : (typeof vendor.vendorId === 'object' ? vendor.vendorId : vendor);
        const status = vendor.status || business?.status || (business?.isActive ? 'APPROVED' : 'PENDING');
        const dateStr = vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
        return (
          <div className="flex flex-col text-left">
            <span className={`text-xs font-extrabold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{dateStr}</span>
            <span className={`text-xs uppercase font-bold tracking-wider mt-0.5 ${status === 'PENDING' ? 'text-amber-500 font-extrabold' : 'text-zinc-400'}`}>
              {status === 'PENDING' ? 'Under Review' : 'Onboarded'}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      render: (vendor) => {
        const isDirect = Boolean(vendor.businessName || vendor.slug || vendor.ownerId);
        const vProfile = vendor.vendorId;
        const vId = isDirect ? vendor._id : (typeof vProfile === 'object' ? vProfile?._id : (vProfile || vendor._id));
        const status = vendor.status || vProfile?.status || (vProfile?.isActive ? 'APPROVED' : 'PENDING');
        const isPending = status === 'PENDING';
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {isPending && (
              <>
                <button title="Approve Vendor" onClick={() => handleApproveVendor(vId)} className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"><CircleCheckBig size={16} /></button>
                <button title="Reject Vendor" onClick={() => handleRejectVendor(vId)} className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"><CircleX size={16} /></button>
              </>
            )}
            <button title="Toggle Status" onClick={() => toggleVendorStatus(vId).then(() => fetchData())} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-emerald-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-emerald-600'}`}><Power size={16} /></button>
            <button title="View Shop Details" onClick={() => setSelectedVendorId(vId)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'}`}><Eye size={16} /></button>
            <button title="Delete Vendor" onClick={() => setItemToDelete(vendor)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}><Trash2 size={16} /></button>
          </div>
        );
      }
    }
  ];

  const influencerColumns = [
    {
      header: 'Influencer',
      render: (inf) => (
        <div className="flex items-center gap-3.5 text-left">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 border ${
            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-100 border-zinc-200 text-zinc-800 shadow-sm'
          }`}>
            {inf.name?.charAt(0) || inf.userId?.name?.charAt(0) || 'I'}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{inf.name || inf.userId?.name}</span>
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{inf.userId?.email}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Followers', 
      render: (inf) => (
        <span className={`text-xs font-extrabold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
          {inf.followers ? Number(inf.followers).toLocaleString() : '0'}
        </span>
      ) 
    },
    { 
      header: 'Commission', 
      render: (inf) => {
        if (typeof inf.commissionRate === 'number') {
          return (
            <span className="px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-500 text-xs font-black uppercase border border-pink-500/20 inline-flex items-center gap-1">
              {inf.commissionRate}%
              {inf.commissionRate === 0 && (
                <span className="text-[10px] text-zinc-400 font-semibold">(0%)</span>
              )}
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black uppercase border border-amber-500/20 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Rate Unset
          </span>
        );
      } 
    },
    { 
      header: 'Earnings', 
      render: (inf) => (
        <div className="flex flex-col text-left">
          <span className="text-xs font-black text-emerald-500">
            ₹{Number(inf.totalCommissionEarned || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-xs uppercase font-bold text-zinc-400">Total Paid</span>
        </div>
      ) 
    },
    { 
      header: 'Status', 
      render: (inf) => {
        const isPending = (inf.status || '').toLowerCase() === 'pending';
        const isActive = (inf.status || '').toLowerCase() === 'active';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
            isActive 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : isPending
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'}`} />
            {isPending ? 'Pending' : (inf.status || (inf.isActive ? 'Active' : 'Inactive'))}
          </span>
        );
      } 
    },
    {
      header: 'Actions',
      render: (inf) => {
        const isPending = (inf.status || '').toLowerCase() === 'pending';
        const isActive = (inf.status || '').toLowerCase() === 'active';
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {isPending && (
              <>
                <button
                  title="Approve Influencer"
                  onClick={() => handleUpdateInfluencerStatus(inf._id, 'active')}
                  className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <CircleCheckBig size={15} /> Approve
                </button>
                <button
                  title="Reject Influencer"
                  onClick={() => handleUpdateInfluencerStatus(inf._id, 'rejected')}
                  className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <CircleX size={15} />
                </button>
              </>
            )}
            {!isPending && (
              <button
                title={isActive ? 'Block Influencer' : 'Activate Influencer'}
                onClick={() => handleUpdateInfluencerStatus(inf._id, isActive ? 'blocked' : 'active')}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-emerald-400 hover:text-amber-400' : 'bg-zinc-100 border-zinc-200 text-emerald-600 hover:text-amber-600')
                    : (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-emerald-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-emerald-600')
                }`}
              >
                <Power size={16} />
              </button>
            )}
            <button title="Create Coupon" onClick={() => setInfluencerForCoupon(inf)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-emerald-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-emerald-600'}`}><TicketPercent size={16} /></button>
            <button
              title="Configure Commission Rate"
              onClick={() => handleQuickCommissionRate(inf)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-800 border-zinc-700 text-pink-400 hover:text-pink-300 hover:bg-zinc-700' 
                  : 'bg-zinc-100 border-zinc-200 text-pink-600 hover:text-pink-700 hover:bg-zinc-200'
              }`}
            >
              <Percent size={16} />
            </button>
            <button title="Edit Profile" onClick={() => { setEditingInfluencer(inf); setIsOnboardingOpen(true); }} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-amber-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-amber-600'}`}><Pencil size={16} /></button>
            <button title="View Details" onClick={() => setSelectedInfluencerId(inf._id)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'}`}><Eye size={16} /></button>
            <button title="Delete Influencer" onClick={() => setItemToDelete(inf)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}><Trash2 size={16} /></button>
          </div>
        );
      }
    }
  ];

  const commissionSlabColumns = [
    {
      header: 'Commission Slab',
      render: (slab) => (
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
            <Percent size={18} />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{slab.commissionRate}% Commission</span>
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase">ID: {slab._id?.substring(18)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Sales Range',
      render: (slab) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-black ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
            ₹{slab.minSales?.toLocaleString('en-IN')} - ₹{slab.maxSales?.toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-bold text-zinc-400 uppercase">Min to Max Target</span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (slab) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
          slab.isActive 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${slab.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          {slab.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Created On',
      render: (slab) => (
        <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {new Date(slab.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (slab) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button title="View Details" onClick={() => setSelectedSlabId(slab._id)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'}`}><Eye size={16} /></button>
          <button title="Edit Slab" onClick={() => setEditingSlab(slab)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-amber-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-amber-600'}`}><Pencil size={16} /></button>
          <button title="Delete Slab" onClick={() => {
            Swal.fire({
              title: 'Delete Commission Slab?',
              text: `Are you sure you want to delete this commission slab? (${slab.commissionRate}% rate, ₹${slab.minSales?.toLocaleString('en-IN')} - ₹${slab.maxSales?.toLocaleString('en-IN')})`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#fe3e6a',
              cancelButtonColor: '#71717a',
              confirmButtonText: 'Yes, Delete',
              cancelButtonText: 'Cancel',
              background: isDarkMode ? '#18181b' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#18181b',
              borderRadius: '20px',
              customClass: {
                popup: 'rounded-3xl border-none',
                confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
                cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
              }
            }).then(async (result) => {
              if (result.isConfirmed) {
                const loadingToast = toast.loading('Deleting slab...');
                try {
                  const res = await deleteInfluencerCommissionSlab(slab._id);
                  toast.dismiss(loadingToast);
                  if (res.success) {
                    toast.success(res.message || 'Commission slab deleted successfully!');
                    fetchData();
                  } else {
                    toast.error(res.message || 'Failed to delete commission slab.');
                  }
                } catch (err) {
                  toast.dismiss(loadingToast);
                  toast.error('Something went wrong during deletion.');
                }
              }
            });
          }} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const cashbackSlabColumns = [
    {
      header: 'Cashback Slab',
      render: (slab) => (
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Percent size={18} />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {slab.cashbackValue}{slab.cashbackType === 'PERCENTAGE' ? '%' : ' ₹'} Cashback
            </span>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Type: {slab.cashbackType}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Wallet Load Range',
      render: (slab) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-black ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
            ₹{slab.minValue?.toLocaleString('en-IN')} - ₹{slab.maxValue?.toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-bold text-zinc-400 uppercase">Min to Max Load</span>
        </div>
      )
    },
    {
      header: 'Max Cashback Limit',
      render: (slab) => (
        <span className={`text-xs font-black ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
          {slab.maxCashback ? `₹${slab.maxCashback?.toLocaleString('en-IN')}` : 'No Limit'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (slab) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
          slab.isActive 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${slab.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          {slab.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (slab) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button title="View Details" onClick={() => setSelectedCashbackSlab(slab)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'}`}><Eye size={16} /></button>
          <button title="Edit Slab" onClick={() => { setEditingCashbackSlab(slab); setIsCreateCashbackSlabOpen(true); }} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-amber-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-amber-600'}`}><Pencil size={16} /></button>
          <button title="Delete Slab" onClick={() => {
            Swal.fire({
              title: 'Delete Cashback Slab?',
              text: `Are you sure you want to delete this cashback slab? (₹${slab.minValue} - ₹${slab.maxValue} range)`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#fe3e6a',
              cancelButtonColor: '#71717a',
              confirmButtonText: 'Yes, Delete',
              cancelButtonText: 'Cancel',
              background: isDarkMode ? '#18181b' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#18181b',
              borderRadius: '20px',
              customClass: {
                popup: 'rounded-3xl border-none',
                confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
                cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
              }
            }).then(async (result) => {
              if (result.isConfirmed) {
                const loadingToast = toast.loading('Deleting slab...');
                try {
                  const res = await deleteCashbackSlab(slab._id);
                  toast.dismiss(loadingToast);
                  if (res.success) {
                    toast.success(res.message || 'Cashback slab deleted successfully!');
                    fetchData();
                  } else {
                    toast.error(res.message || 'Failed to delete cashback slab.');
                  }
                } catch (err) {
                  toast.dismiss(loadingToast);
                  toast.error('Something went wrong during deletion.');
                }
              }
            });
          }} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const couponColumns = [
    {
      header: 'Coupon Code',
      render: (cp) => (
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
            <TicketPercent size={18} />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-black tracking-wide font-mono ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{cp.code}</span>
            <span className="text-xs font-bold text-zinc-400 uppercase">{cp.description || 'Platform Discount'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned To',
      render: (cp) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{cp.influencerId?.name || cp.influencerId || 'Global / Platform'}</span>
          <span className="text-xs font-bold text-zinc-400 uppercase">Partner Scope</span>
        </div>
      )
    },
    { 
      header: 'Discount', 
      render: (cp) => (
        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20">
          {cp.type === 'percentage' ? `${cp.value}% OFF` : `₹${cp.value} OFF`}
        </span>
      ) 
    },
    { 
      header: 'Usage Limit', 
      render: (cp) => {
        const percent = Math.min(((cp.totalUsed || 0) / (cp.totalUsageLimit || 1)) * 100, 100);
        return (
          <div className="flex flex-col gap-1 min-w-[90px] text-left">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{cp.totalUsed || 0} / {cp.totalUsageLimit || '∞'}</span>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      } 
    },
    { 
      header: 'Status', 
      render: (cp) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
          cp.isActive 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cp.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {cp.isActive ? 'Active' : 'Expired'}
        </span>
      ) 
    },
    {
      header: 'Actions',
      render: (cp) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button title="View Details" onClick={() => setSelectedCouponId(cp._id)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'}`}><Eye size={16} /></button>
          <button title="Edit Coupon" onClick={() => { setEditingCoupon(cp); setInfluencerForCoupon(true); }} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-amber-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-amber-600'}`}><Pencil size={16} /></button>
          <button title="Delete Coupon" onClick={() => {
            Swal.fire({
              title: 'Delete Coupon?',
              text: `Are you sure you want to delete coupon "${cp.code}"?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#fe3e6a',
              cancelButtonColor: '#71717a',
              confirmButtonText: 'Yes, Delete',
              cancelButtonText: 'Cancel',
              background: isDarkMode ? '#18181b' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#18181b',
              borderRadius: '20px',
              customClass: {
                popup: 'rounded-3xl border-none',
                confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
                cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
              }
            }).then(async (result) => {
              if (result.isConfirmed) {
                const loadingToast = toast.loading('Deleting coupon...');
                try {
                  const res = await deleteCoupon(cp._id);
                  toast.dismiss(loadingToast);
                  if (res?.success !== false) {
                    toast.success('Coupon deleted successfully!');
                    fetchData();
                  } else {
                    toast.error(res?.message || 'Failed to delete coupon.');
                  }
                } catch (err) {
                  toast.dismiss(loadingToast);
                  toast.error('Something went wrong during deletion.');
                }
              }
            });
          }} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const categoryColumns = [
    {
      header: 'Category',
      render: (cat) => (
        <div className="flex items-center gap-3 text-left">
          <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold border flex-shrink-0 ${
            isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
          }`}>
            {cat.image?.url ? (
              <img src={cat.image.url} alt={cat.label} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-black text-sm">{cat.label?.charAt(0) || 'C'}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{cat.label}</span>
            <span className="text-xs font-mono font-bold text-zinc-400 lowercase">/{cat.slug}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Description', 
      render: (cat) => (
        <span className={`text-xs font-medium max-w-xs line-clamp-1 text-left ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {cat.description || 'No description provided'}
        </span>
      ) 
    },
    {
      header: 'Tags',
      render: (cat) => (
        <div className="flex flex-wrap gap-1">
          {cat.tags && cat.tags.length > 0 ? (
            cat.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase border ${
                isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>{tag}</span>
            ))
          ) : (
            <span className="text-zinc-400 text-xs font-semibold">—</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      render: (cat) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
          cat.isActive 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          {cat.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Created On',
      render: (cat) => (
        <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {new Date(cat.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (cat) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button title="View Category" onClick={() => setSelectedCategoryId(cat._id)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'}`}><Eye size={16} /></button>
          <button title="Edit Category" onClick={() => setEditingCategory(cat)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-amber-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-amber-600'}`}><Pencil size={16} /></button>
          <button title="Delete Category" onClick={() => {
            Swal.fire({
              title: 'Delete Category?',
              text: `Are you sure you want to delete category "${cat.label || cat.name}"?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#fe3e6a',
              cancelButtonColor: '#71717a',
              confirmButtonText: 'Yes, Delete',
              cancelButtonText: 'Cancel',
              background: isDarkMode ? '#18181b' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#18181b',
              borderRadius: '20px',
              customClass: {
                popup: 'rounded-3xl border-none',
                confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
                cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
              }
            }).then(async (result) => {
              if (result.isConfirmed) {
                const loadingToast = toast.loading('Deleting category...');
                try {
                  const res = await deleteCategory(cat._id);
                  toast.dismiss(loadingToast);
                  if (res.success) {
                    toast.success(res.message || 'Category deleted successfully!');
                    fetchData();
                  } else {
                    toast.error(res.message || 'Failed to delete category.');
                  }
                } catch (err) {
                  toast.dismiss(loadingToast);
                  toast.error('Something went wrong during deletion.');
                }
              }
            });
          }} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const courseCategoryColumns = [
    {
      header: 'Course Category',
      render: (cat) => {
        const logo = cat.icon?.url || cat.icon || '';
        return (
          <div className="flex items-center gap-3 text-left">
            <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold border flex-shrink-0 ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
            }`}>
              {logo ? (
                <img src={logo} alt={cat.label} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-black text-sm">{cat.label?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{cat.label}</span>
              <span className="text-xs font-bold text-zinc-400 uppercase">Slug: {cat.name}</span>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Description', 
      render: (cat) => (
        <span className={`text-xs font-medium max-w-xs line-clamp-1 text-left ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {cat.description || 'No description'}
        </span>
      ) 
    },
    {
      header: 'Tags',
      render: (cat) => (
        <div className="flex flex-wrap gap-1">
          {cat.tags && cat.tags.length > 0 ? (
            cat.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase border ${
                isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>{tag}</span>
            ))
          ) : (
            <span className="text-zinc-400 text-xs font-semibold">—</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      render: (cat) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
          cat.isActive 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          {cat.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Created On',
      render: (cat) => (
        <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {new Date(cat.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (cat) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button title="View Details" onClick={() => setSelectedCourseCategoryId(cat._id)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'}`}><Eye size={16} /></button>
          <button title="Delete Category" onClick={() => {
            Swal.fire({
              title: 'Delete Course Category?',
              text: `Are you sure you want to delete course category "${cat.label || cat.name}"?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#fe3e6a',
              cancelButtonColor: '#71717a',
              confirmButtonText: 'Yes, Delete',
              cancelButtonText: 'Cancel',
              background: isDarkMode ? '#18181b' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#18181b',
              borderRadius: '20px',
              customClass: {
                popup: 'rounded-3xl border-none',
                confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
                cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
              }
            }).then(async (result) => {
              if (result.isConfirmed) {
                const loadingToast = toast.loading('Deleting course category...');
                try {
                  const res = await deleteCourseCategory(cat._id);
                  toast.dismiss(loadingToast);
                  if (res.success) {
                    toast.success(res.message || 'Course category deleted successfully!');
                    fetchData();
                  } else {
                    toast.error(res.message || 'Failed to delete course category.');
                  }
                } catch (err) {
                  toast.dismiss(loadingToast);
                  toast.error('Something went wrong during deletion.');
                }
              }
            });
          }} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const orderColumns = [
    {
      header: 'Order Details',
      render: (order) => (
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={18} />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-black font-mono ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{order.orderNumber}</span>
            <span className="text-xs font-bold text-zinc-400 uppercase">Payment: {order.paymentMethod || 'Online'}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Status', 
      render: (order) => {
        const isDelivered = order.status?.toLowerCase() === 'delivered';
        const isCancelled = order.status?.toLowerCase() === 'cancelled';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
            isDelivered 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : isCancelled 
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDelivered ? 'bg-emerald-500' : isCancelled ? 'bg-rose-500' : 'bg-amber-500'}`} />
            {order.status || 'Pending'}
          </span>
        );
      } 
    },
    { 
      header: 'Date & Time', 
      render: (order) => (
        <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      ) 
    },
    { 
      header: 'Total Value', 
      render: (order) => (
        <span className={`text-sm font-black ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
          ₹{order.totalAmount?.toLocaleString('en-IN')}
        </span>
      ) 
    },
    {
      header: 'Actions',
      render: (order) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button title="View Details" onClick={() => setSelectedOrderId(order._id)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'}`}><Eye size={16} /></button>
          <button title="Delete Order" onClick={() => {
            Swal.fire({
              title: 'Delete Order?',
              text: `Are you sure you want to delete order "${order.orderNumber}"?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#fe3e6a',
              cancelButtonColor: '#71717a',
              confirmButtonText: 'Yes, Delete',
              cancelButtonText: 'Cancel',
              background: isDarkMode ? '#18181b' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#18181b',
              borderRadius: '20px',
              customClass: {
                popup: 'rounded-3xl border-none',
                confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
                cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
              }
            }).then(async (result) => {
              if (result.isConfirmed) {
                const loadingToast = toast.loading('Deleting order...');
                try {
                  const res = await deleteCategory(order._id);
                  toast.dismiss(loadingToast);
                  if (res.success) {
                    toast.success(res.message || 'Order deleted successfully!');
                    fetchData();
                  } else {
                    toast.error(res.message || 'Failed to delete order.');
                  }
                } catch (err) {
                  toast.dismiss(loadingToast);
                  toast.error('Something went wrong during deletion.');
                }
              }
            });
          }} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const productColumns = [
    {
      header: 'Product Details',
      render: (product) => (
        <div className="flex items-center gap-3 text-left">
          <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold border flex-shrink-0 ${
            isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
          }`}>
            {product.image?.url || (product.images && product.images[0]?.url) ? (
              <img src={product.image?.url || product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-black text-sm">{product.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-extrabold max-w-xs truncate ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{product.name}</span>
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase">ID: {product._id?.substring(18)}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Price', 
      render: (product) => (
        <span className={`text-sm font-black ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
          ₹{product.price?.toLocaleString('en-IN')}
        </span>
      ) 
    },
    { 
      header: 'Inventory', 
      render: (product) => (
        <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {product.stock !== undefined ? `${product.stock} units` : 'N/A'}
        </span>
      ) 
    },
    {
      header: 'Status',
      render: (product) => {
        const active = product.isActive && !product.isDeleted;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
            active 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {product.status || (active ? 'ACTIVE' : 'INACTIVE')}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      render: (product) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            title="View Product Details"
            onClick={() => {
              Swal.fire({
                title: product.name,
                html: `
                  <div class="text-left text-xs space-y-2.5 font-outfit mt-4 text-zinc-600 dark:text-zinc-300">
                    <p><strong>Slug:</strong> /${product.slug}</p>
                    <p><strong>Description:</strong> ${product.description || 'N/A'}</p>
                    <p><strong>Category ID:</strong> ${product.categoryId || 'N/A'}</p>
                    <p><strong>Vendor ID:</strong> ${product.vendorId || 'N/A'}</p>
                    <p><strong>Created By:</strong> ${product.createdBy || 'N/A'}</p>
                    <p><strong>Meta Title:</strong> ${product.metaTitle || 'N/A'}</p>
                    <p><strong>Meta Description:</strong> ${product.metaDescription || 'N/A'}</p>
                    <p><strong>Shipping Applies:</strong> ${product.isShippingApply ? 'Yes' : 'No'}</p>
                    <p><strong>Has Variants:</strong> ${product.hasVariants ? 'Yes' : 'No'}</p>
                  </div>
                `,
                confirmButtonColor: '#fe3e6a',
                confirmButtonText: 'Close',
                background: isDarkMode ? '#18181b' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#18181b',
                borderRadius: '20px',
                customClass: {
                  popup: 'rounded-3xl border-none p-6 md:p-8',
                  confirmButton: 'w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer'
                }
              });
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'}`}
          >
            <Eye size={16} />
          </button>
          <button
            title="Delete Product"
            onClick={() => {
              Swal.fire({
                title: 'Delete Product?',
                text: `Are you sure you want to delete product "${product.name}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#fe3e6a',
                cancelButtonColor: '#71717a',
                confirmButtonText: 'Yes, Delete',
                cancelButtonText: 'Cancel',
                background: isDarkMode ? '#18181b' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#18181b',
                borderRadius: '20px',
                customClass: {
                  popup: 'rounded-3xl border-none',
                  confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
                  cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
                }
              }).then(async (result) => {
                if (result.isConfirmed) {
                  const loadingToast = toast.loading('Deleting product...');
                  try {
                    const vId = typeof product.vendorId === 'object' && product.vendorId !== null ? (product.vendorId._id || product.vendorId.id) : (product.vendorId || 'all');
                    const res = await deleteProduct(vId, product._id);
                    toast.dismiss(loadingToast);
                    if (res.success) {
                      toast.success(res.message || 'Product deleted successfully!');
                      fetchData();
                    } else {
                      toast.error(res.message || 'Failed to delete product.');
                    }
                  } catch (err) {
                    toast.dismiss(loadingToast);
                    toast.error('Something went wrong during deletion.');
                  }
                }
              });
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const educatorColumns = [
    {
      header: 'Educator Profile',
      render: (item) => {
        const userDetails = item.userId || {};
        const logo = item.profileImage?.url || item.profileImage || userDetails.avatar;
        return (
          <div className="flex items-center gap-3 text-left">
            <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold border flex-shrink-0 ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
            }`}>
              {logo ? (
                <img src={logo} alt={userDetails.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-black text-sm">{userDetails.name?.charAt(0).toUpperCase() || 'E'}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{userDetails.name || 'Educator Partner'}</span>
              <span className="text-xs font-bold text-zinc-400 lowercase">{userDetails.email}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Bio',
      render: (item) => (
        <span className={`text-xs font-medium max-w-xs line-clamp-1 text-left ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {item.bio || 'No bio provided'}
        </span>
      )
    },
    {
      header: 'Expertise',
      render: (item) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {item.expertise && item.expertise.length > 0 ? (
            item.expertise.slice(0, 3).map((exp, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase border ${
                isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>{exp}</span>
            ))
          ) : (
            <span className="text-zinc-400 text-xs font-semibold">—</span>
          )}
        </div>
      )
    },
    {
      header: 'Active Status',
      render: (item) => {
        const isActive = item.isActive;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
            isActive 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      }
    },
    {
      header: 'Approval Status',
      render: (item) => {
        const isApproved = item.isApproved;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
            isApproved 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isApproved ? 'Approved' : 'Pending'}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      render: (item) => {
        const isApproved = item.isApproved;
        const educatorId = item._id;

        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {!isApproved && (
              <button
                title="Approve Educator"
                onClick={async () => {
                  const loadingToast = toast.loading('Approving educator...');
                  try {
                    const res = await approveEducator(educatorId, true);
                    toast.dismiss(loadingToast);
                    if (res.success) {
                      toast.success(res.message || 'Educator approved successfully!');
                      fetchData();
                    } else {
                      toast.error(res.message || 'Failed to approve educator.');
                    }
                  } catch (err) {
                    toast.dismiss(loadingToast);
                    toast.error('Something went wrong during approval.');
                  }
                }}
                className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <CircleCheckBig size={16} />
              </button>
            )}
            {isApproved && (
              <button
                title="Revoke / Disapprove Educator"
                onClick={async () => {
                  const loadingToast = toast.loading('Rejecting educator...');
                  try {
                    const res = await approveEducator(educatorId, false);
                    toast.dismiss(loadingToast);
                    if (res.success) {
                      toast.success(res.message || 'Educator status updated successfully!');
                      fetchData();
                    } else {
                      toast.error(res.message || 'Failed to update educator status.');
                    }
                  } catch (err) {
                    toast.dismiss(loadingToast);
                    toast.error('Something went wrong.');
                  }
                }}
                className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
              >
                <CircleX size={16} />
              </button>
            )}
            <button
              title={item.isActive ? "Deactivate Educator" : "Activate Educator"}
              onClick={async () => {
                const loadingToast = toast.loading(item.isActive ? 'Deactivating educator...' : 'Activating educator...');
                try {
                  const res = await toggleEducatorActive(educatorId, !item.isActive);
                  toast.dismiss(loadingToast);
                  if (res.success) {
                    toast.success(res.message || `Educator status updated successfully!`);
                    fetchData();
                  } else {
                    toast.error(res.message || 'Failed to toggle status.');
                  }
                } catch (err) {
                  toast.dismiss(loadingToast);
                  toast.error('Something went wrong.');
                }
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                item.isActive
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:text-rose-500'
                  : (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-emerald-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-emerald-600')
              }`}
            >
              <Power size={16} />
            </button>
            <button title="Delete Educator" onClick={() => setItemToDelete(item)} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-600'}`}><Trash2 size={16} /></button>
          </div>
        );
      }
    }
  ];

  return (
    <div className={`flex min-h-screen font-outfit transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-800'}`}>
      <UserDetailsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      <OrderDetailsModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      <InfluencerDetailsModal key={`inf-${selectedInfluencerId}`} influencerId={selectedInfluencerId} onClose={() => setSelectedInfluencerId(null)} onEditCoupon={(coupon) => { setEditingCoupon(coupon); setInfluencerForCoupon(true); }} onRefresh={fetchData} />
      <CouponDetailsModal key={`coup-${selectedCouponId}`} couponId={selectedCouponId} onClose={() => setSelectedCouponId(null)} />
      <CreateCouponModal isOpen={!!influencerForCoupon || !!editingCoupon} onClose={() => { setInfluencerForCoupon(null); setEditingCoupon(null); fetchData(); }} initialData={editingCoupon} influencerId={influencerForCoupon?._id} influencerName={influencerForCoupon?.name} />
      <VendorDetailsModal vendorId={selectedVendorId} onClose={() => setSelectedVendorId(null)} />
      <EducatorDetailsModal educatorId={selectedEducatorId} onClose={() => setSelectedEducatorId(null)} />
      <CreateCourseCategoryModal isOpen={isCreateCourseCategoryOpen} onClose={() => setIsCreateCourseCategoryOpen(false)} onSuccess={fetchData} />
      <CourseCategoryDetailsModal courseCategoryId={selectedCourseCategoryId} onClose={() => setSelectedCourseCategoryId(null)} />
      <DeleteConfirmModal isOpen={!!itemToDelete} itemName={itemToDelete?.name || itemToDelete?.businessName} onConfirm={handleDeleteConfirm} onCancel={() => setItemToDelete(null)} />
      <OnboardInfluencerModal isOpen={isOnboardingOpen} onClose={() => { setIsOnboardingOpen(false); setEditingInfluencer(null); }} initialData={editingInfluencer} onSuccess={fetchData} />
      <CreateCategoryModal
        isOpen={isCreateCategoryOpen || !!editingCategory}
        onClose={() => {
          setIsCreateCategoryOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={fetchData}
        initialData={editingCategory}
      />
      <CategoryDetailsModal
        categoryId={selectedCategoryId}
        onClose={() => setSelectedCategoryId(null)}
      />
      <CreateCommissionSlabModal
        isOpen={isCreateSlabOpen || !!editingSlab}
        onClose={() => {
          setIsCreateSlabOpen(false);
          setEditingSlab(null);
        }}
        initialData={editingSlab}
        onSuccess={fetchData}
        isDarkMode={isDarkMode}
      />
      <CommissionSlabDetailsModal
        slabId={selectedSlabId}
        onClose={() => setSelectedSlabId(null)}
      />
      <CreateCashbackSlabModal
        isOpen={isCreateCashbackSlabOpen || !!editingCashbackSlab}
        onClose={() => {
          setIsCreateCashbackSlabOpen(false);
          setEditingCashbackSlab(null);
        }}
        initialData={editingCashbackSlab}
        onSuccess={fetchData}
        isDarkMode={isDarkMode}
      />
      <CashbackSlabDetailsModal
        slab={selectedCashbackSlab}
        onClose={() => setSelectedCashbackSlab(null)}
      />
      <CreateHomeContentModal
        isOpen={showHomeContentModal || !!editingHomeContent}
        onClose={() => {
          setShowHomeContentModal(false);
          setEditingHomeContent(null);
        }}
        onSuccess={fetchData}
        editData={editingHomeContent}
      />
      <HomeContentDetailsModal
        isOpen={!!selectedHomeContentId}
        id={selectedHomeContentId}
        onClose={() => setSelectedHomeContentId(null)}
        isDarkMode={isDarkMode}
      />

      {/* Sidebar */}
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        handleLogout={handleLogout}
        role={role}
        adminAccess={adminAccess}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Main Content */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col min-h-screen min-w-0 h-screen overflow-y-scroll"
      >
        <header className={`h-20 flex-shrink-0 flex items-center justify-between px-6 lg:px-10 border-b sticky top-0 z-[100] ${isDarkMode ? 'bg-zinc-950/80 backdrop-blur-xl border-zinc-800' : 'bg-white/80 backdrop-blur-xl border-zinc-200'}`}>
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer">
              <Menu size={20} className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} />
            </button>
            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input type="text" placeholder="Search platform directory..." value={filters.search} onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && fetchData()} className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs outline-none font-medium placeholder:text-zinc-400 transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300'}`} />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-amber-400 hover:border-zinc-700' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'}`}>{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-pink-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-primary/20">AD</div>
          </div>
        </header>

        <main className="p-4 lg:p-8 space-y-6 lg:space-y-8 flex-grow">
          {/* Shared directories block */}
          <div className={['users', 'vendors', 'pending', 'influencers', 'commission-slabs', 'coupons', 'categories', 'course-categories', 'orders', 'products', 'educators', 'all-educators', 'cashback-slabs'].includes(activeTab) ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`text-xl lg:text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{activeTab.replace('-', ' ')} Directory</h2>
                  <p className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mt-0.5">Oversee and manage platform records</p>
                </div>
                <div className={`px-5 py-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-0.5">Total Records</p>
                  <p className={`text-xl lg:text-2xl font-black tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{pagination.total || 0}</p>
                </div>
              </div>

              {activeTab === 'influencers' && (
                <div className="flex">
                  <button
                    onClick={() => { setIsSendLinkOpen(true); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    <Sparkles size={16} />
                    Send Invitation Link
                  </button>
                </div>
              )}

              {activeTab === 'commission-slabs' && (
                <div className="flex">
                  <button
                    onClick={() => setIsCreateSlabOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    Create Slab
                  </button>
                </div>
              )}

              {activeTab === 'categories' && (
                <div className="flex">
                  <button
                    onClick={() => setIsCreateCategoryOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    Create Category
                  </button>
                </div>
              )}

              {activeTab === 'course-categories' && (
                <div className="flex">
                  <button
                    onClick={() => setIsCreateCourseCategoryOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    Create Course Category
                  </button>
                </div>
              )}

              {activeTab === 'cashback-slabs' && (
                <div className="flex">
                  <button
                    onClick={() => { setEditingCashbackSlab(null); setIsCreateCashbackSlabOpen(true); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    Create Cashback Slab
                  </button>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="flex">
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Delete All Products?',
                        text: 'Are you sure you want to delete all products? This action is irreversible!',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: '#71717a',
                        confirmButtonText: 'Yes, Delete All',
                        cancelButtonText: 'Cancel',
                        background: isDarkMode ? '#18181b' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#18181b',
                        borderRadius: '20px',
                        customClass: {
                          popup: 'rounded-3xl border-none',
                          confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
                          cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
                        }
                      }).then(async (result) => {
                        if (result.isConfirmed) {
                          const loadingToast = toast.loading('Deleting all products...');
                          try {
                            const res = await deleteAllProducts();
                            toast.dismiss(loadingToast);
                            if (res.success) {
                              toast.success(res.message || 'All products deleted successfully!');
                              fetchData();
                            } else {
                              toast.error(res.message || 'Failed to delete products.');
                            }
                          } catch (err) {
                            toast.dismiss(loadingToast);
                            toast.error('Something went wrong during deletion.');
                          }
                        }
                      });
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                    Delete All Products
                  </button>
                </div>
              )}

              <DataTable
                columns={
                  activeTab === 'users'
                    ? userColumns
                    : activeTab === 'influencers'
                      ? influencerColumns
                      : activeTab === 'commission-slabs'
                        ? commissionSlabColumns
                        : activeTab === 'cashback-slabs'
                          ? cashbackSlabColumns
                          : activeTab === 'coupons'
                            ? couponColumns
                            : activeTab === 'categories'
                              ? categoryColumns
                              : activeTab === 'course-categories'
                                ? courseCategoryColumns
                                : activeTab === 'orders'
                                  ? orderColumns
                                  : activeTab === 'products'
                                    ? productColumns
                                    : activeTab === 'educators' || activeTab === 'all-educators'
                                      ? educatorColumns
                                      : vendorColumns
                }
                data={dataList}
                loading={loading}
                onRowClick={(item) => {
                  if (activeTab === 'users') setSelectedUserId(item._id);
                  else if (activeTab === 'educators' || activeTab === 'all-educators') setSelectedEducatorId(item._id);
                  else if (activeTab === 'influencers') setSelectedUserId(item.userId?._id || item.userId);
                  else if (activeTab === 'categories') setSelectedCategoryId(item._id);
                  else if (activeTab === 'orders') setSelectedOrderId(item._id);
                  else if (activeTab === 'commission-slabs' || activeTab === 'products') { /* no-op */ }
                  else if (activeTab === 'cashback-slabs') setSelectedCashbackSlab(item);
                  else if (activeTab === 'course-categories') setSelectedCourseCategoryId(item._id);
                  else setSelectedVendorId(item.vendorId?._id || item._id);
                }}
              />
              <div className="flex justify-center items-center gap-2 pt-2">
                <button 
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} 
                  disabled={pagination.page === 1} 
                  className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="w-11 h-11 flex items-center justify-center bg-primary text-white rounded-xl font-black text-sm shadow-md shadow-primary/20">
                  {pagination.page}
                </div>
                <button 
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} 
                  disabled={dataList.length < pagination.limit} 
                  className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Vendor Payouts */}
          <div className={activeTab === 'vendor-payouts' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <VendorPayouts isDarkMode={isDarkMode} />
          </div>

          {/* Influencer Commissions */}
          <div className={activeTab === 'influencer-commissions' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <InfluencerCommissions isDarkMode={isDarkMode} />
          </div>

          {/* Affiliate Dashboard */}
          <div className={activeTab === 'affiliate-dashboard' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <AdminAffiliateDashboard isDarkMode={isDarkMode} />
          </div>

          {/* Beauty Services (Subscription Plans) */}
          <div className={activeTab === 'beauty-services' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <SubscriptionPlans isDarkMode={isDarkMode} />
          </div>

          {/* Service Manager */}
          <div className={activeTab === 'subscription-plans' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <AdminServiceManager isDarkMode={isDarkMode} />
          </div>

          {/* Service Categories */}
          <div className={activeTab === 'service-categories' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <ServiceCategories isDarkMode={isDarkMode} />
          </div>

          {/* Dedicated Home Booking Cards Manager (Super Admin Tab) */}
          <div className={activeTab === 'home-booking-cards' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <HomeBookingCardsManager isDarkMode={isDarkMode} />
          </div>

          {/* Service Providers */}
          <div className={activeTab === 'service-providers' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <ServiceProviders isDarkMode={isDarkMode} />
          </div>

          {/* Wallet Balances Console */}
          <div className={activeTab === 'wallet-balances' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <AdminWalletBalances isDarkMode={isDarkMode} />
          </div>

          {/* Bank Accounts Console */}
          <div className={activeTab === 'bank-accounts' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <AdminBankAccounts isDarkMode={isDarkMode} />
          </div>

          {/* Support Tickets Console */}
          <div className={activeTab === 'tickets' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <SupportTickets isDarkMode={isDarkMode} />
          </div>

          {/* Sub-Admins Management Console */}
          {(role === 'super_admin' || role === 'admin') && (
            <div className={activeTab === 'sub-admins' ? 'block animate-in fade-in duration-300' : 'hidden'}>
              <SubAdminsManager isDarkMode={isDarkMode} />
            </div>
          )}

          {/* Home Content Manager */}
          <div className={activeTab === 'home-content' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <HomeContentList
              isDarkMode={isDarkMode}
              homeContents={dataList}
              loading={loading}
              onCreateTrigger={() => setShowHomeContentModal(true)}
              onEditTrigger={(item) => {
                setEditingHomeContent(item);
                setShowHomeContentModal(true);
              }}
              onViewTrigger={(item) => setSelectedHomeContentId(item._id)}
              onDeleteSuccess={fetchData}
            />
          </div>

          {/* Notifications Management Console */}
          <div className={activeTab === 'notifications' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <NotificationsManager isDarkMode={isDarkMode} />
          </div>

          {/* Admin Service Leads Manager */}
          <div className={activeTab === 'admin-service-leads' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <AdminServiceLeads isDarkMode={isDarkMode} />
          </div>

          {/* Profile Console */}
          <div className={activeTab === 'profile' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <AdminProfile isDarkMode={isDarkMode} />
          </div>

          {/* Dashboard Overview */}
          <div className={activeTab === 'dashboard' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <AdminDashboard
              isOverviewLoading={isOverviewLoading}
              overviewData={overviewData}
              revenueTrend={revenueTrend}
              topCategories={topCategories}
              orderStatusAnalytics={orderStatusAnalytics}
              categoryDistribution={categoryDistribution}
              orderStatusGraph={orderStatusGraph}
              monthlyAnalytics={monthlyAnalytics}
              yearlyAnalytics={yearlyAnalytics}
              analyticsGraph={analyticsGraph}
              topVendorsGraph={topVendorsGraph}
              isDarkMode={isDarkMode}
              setActiveTab={setActiveTab}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              activeMonthlyMetric={activeMonthlyMetric}
              setActiveMonthlyMetric={setActiveMonthlyMetric}
              fetchMonthlyData={fetchMonthlyData}
            />
          </div>
        </main>
      </div>

      {/* ── Send Influencer Invitation Link Modal ── */}
      <SendInvitationModal
        isOpen={isSendLinkOpen}
        onClose={() => setIsSendLinkOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default AdminPanel;
