import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getVendorDetails,
  getVendorProducts,
  deleteProduct,
  getVendorOrders,
  getVendorOverview,
  getVendorTopProducts,
  getVendorOrderGraph,
  getVendorTopCategories,
  getVendorOrderComparison,
  getVendorSalesPerformance,
  getVendorCategories,
  getVendorCustomerDemographics,
  exportVendorOrders
} from '../../api/vendorService';
import { getVendorWalletBalance, getVendorWalletTransactions } from '../../api/walletService';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Store,
  Wallet,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { toast } from '../../utils/toast';
import Swal from 'sweetalert2';
import VendorSidebar from './components/VendorSidebar';
import EditProfileModal from './components/EditProfileModal';
import ProductModal from './components/ProductModal';
import VendorOrderDetailsModal from './components/VendorOrderDetailsModal';
import { useTheme } from '../../context/ThemeContext';

// Import modular sub-components
import VendorOverview from './components/VendorOverview';
import VendorProducts from './components/VendorProducts';
import VendorOrders from './components/VendorOrders';
import VendorEarnings from './components/VendorEarnings';
import VendorProfile from './components/VendorProfile';
import VendorWallet from './components/VendorWallet';
import PayoutBankDetails from '../../components/shared/PayoutBankDetails';
import VendorFlow from '../quick_commerce/VendorFlow';
import VendorRiders from './components/VendorRiders';
import VendorTickets from './components/VendorTickets';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('vendorActiveTab') || 'overview';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const containerRef = useRef(null);

  // If first-time user has no vendor role and no onboarding, redirect to registration
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      const u = session?.user;
      const roles = Array.isArray(u?.roles) ? u.roles : (u?.role ? [u.role] : []);
      const isVendorOrAdmin = roles.includes('vendor') || roles.includes('admin') || roles.includes('super_admin') || u?.role === 'vendor' || u?.role === 'admin';
      if (u && !isVendorOrAdmin && !u.vendorId && !u.isVendorOnboardingCompleted) {
        navigate('/vendor/register', { replace: true });
      }
    } catch (_) {}
  }, [navigate]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('vendorActiveTab', activeTab);
  }, [activeTab]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [vendorData, setVendorData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLoading, setTopProductsLoading] = useState(false);
  const [orderGraphData, setOrderGraphData] = useState([]);
  const [orderGraphLoading, setOrderGraphLoading] = useState(false);
  const [graphDays, setGraphDays] = useState(20);
  const [topCategories, setTopCategories] = useState([]);
  const [topCategoriesLoading, setTopCategoriesLoading] = useState(false);
  const [orderComparison, setOrderComparison] = useState(null);
  const [orderComparisonLoading, setOrderComparisonLoading] = useState(false);
  const [vendorWallet, setVendorWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletTransactionsLoading, setWalletTransactionsLoading] = useState(false);

  const [salesPerformance, setSalesPerformance] = useState([]);
  const [salesPerformanceLoading, setSalesPerformanceLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [customerDemographics, setCustomerDemographics] = useState([]);
  const [customerDemographicsLoading, setCustomerDemographicsLoading] = useState(false);

  // States for Modals
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isViewingProduct, setIsViewingProduct] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img instanceof File) return URL.createObjectURL(img);
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    return '';
  };

  const fetchVendorData = async () => {
    try {
      const response = await getVendorDetails();
      const vendorInfo = response?.data || response;
      if (vendorInfo && (vendorInfo._id || vendorInfo.businessName)) {
        setVendorData(vendorInfo);
        try {
          const session = JSON.parse(localStorage.getItem('user_session') || '{}');
          if (session?.user && (!session.user.vendorId || !session.user.isVendorOnboardingCompleted)) {
            session.user.vendorId = vendorInfo._id;
            session.user.isVendorOnboardingCompleted = true;
            localStorage.setItem('user_session', JSON.stringify(session));
          }
        } catch (_) {}
      } else {
        navigate('/vendor/register', { replace: true });
      }
    } catch (error) {
      console.error("Failed to fetch vendor details:", error);
      if (error?.response?.status === 404 || error?.statusCode === 404) {
        navigate('/vendor/register', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchProductsAndCategories = async () => {
    // Synchronously set loading states immediately to prevent layout jumps before await queries resolve
    if (activeTab === 'products' || activeTab === 'overview') {
      setProductsLoading(true);
    }
    if (activeTab === 'orders' || activeTab === 'overview' || activeTab === 'earnings') {
      setOrdersLoading(true);
    }
    // Always load wallet balance to keep the header indicator fresh
    setWalletLoading(true);

    if (activeTab === 'earnings' || activeTab === 'overview') {
      setSalesPerformanceLoading(true);
    }

    if (activeTab === 'earnings' || activeTab === 'overview' || activeTab === 'wallet') {
      setWalletTransactionsLoading(true);
    }
    if (activeTab === 'overview') {
      setOverviewLoading(true);
      setTopProductsLoading(true);
      setOrderGraphLoading(true);
      setTopCategoriesLoading(true);
      setOrderComparisonLoading(true);
      setCustomerDemographicsLoading(true);
    }

    try {
      const response = await getVendorCategories();
      if (response.success) {
        setCategories(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }

    if (activeTab === 'products' || activeTab === 'overview') {
      try {
        const response = await getVendorProducts();
        if (response.success) {
          const productList = response.data?.data || response.data || [];
          setProducts(productList);
        }
      } catch (error) { console.error(error); }
      finally { setProductsLoading(false); }
    }

    if (activeTab === 'orders' || activeTab === 'overview' || activeTab === 'earnings') {
      try {
        const response = await getVendorOrders();
        if (response.success) {
          const orderList = response.data?.data || response.data || [];
          setOrders(orderList);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setOrdersLoading(false);
      }
    }

    // Unconditionally fetch wallet balance to keep header updated
    try {
      const response = await getVendorWalletBalance();
      if (response.success) {
        const payload = response.data ?? response;
        setVendorWallet(payload);
      }
    } catch (error) {
      console.error("Vendor wallet fetch error:", error);
    } finally {
      setWalletLoading(false);
    }

    if (activeTab === 'earnings' || activeTab === 'overview') {
      try {
        const response = await getVendorSalesPerformance();
        if (response.success) {
          const salesList = response.data?.data || response.data || [];
          setSalesPerformance(Array.isArray(salesList) ? salesList : []);
        }
      } catch (error) {
        console.error("Sales performance fetch error:", error);
      } finally {
        setSalesPerformanceLoading(false);
      }
    }

    if (activeTab === 'earnings' || activeTab === 'overview' || activeTab === 'wallet') {
      try {
        const response = await getVendorWalletTransactions();
        if (response.success) {
          const payload = response.data ?? response;
          setWalletTransactions(Array.isArray(payload) ? payload : []);
        }
      } catch (error) {
        console.error("Vendor wallet transactions fetch error:", error);
      } finally {
        setWalletTransactionsLoading(false);
      }
    }

    if (activeTab === 'overview') {
      try {
        const [overviewRes, topProdRes, graphRes, catRes, compRes, demoRes] = await Promise.allSettled([
          getVendorOverview(),
          getVendorTopProducts(),
          getVendorOrderGraph(graphDays),
          getVendorTopCategories(),
          getVendorOrderComparison(),
          getVendorCustomerDemographics()
        ]);

        if (overviewRes.status === 'fulfilled' && overviewRes.value?.success) {
          const innerData = overviewRes.value.data?.data || overviewRes.value.data || null;
          setOverviewData(innerData);
        }
        if (topProdRes.status === 'fulfilled' && topProdRes.value?.success) {
          const innerList = topProdRes.value.data?.data || topProdRes.value.data || [];
          setTopProducts(Array.isArray(innerList) ? innerList : []);
        }
        if (graphRes.status === 'fulfilled' && graphRes.value?.success) {
          const innerGraph = graphRes.value.data?.data || graphRes.value.data || [];
          setOrderGraphData(Array.isArray(innerGraph) ? innerGraph : []);
        }
        if (catRes.status === 'fulfilled' && catRes.value?.success) {
          const innerCatList = catRes.value.data?.data || catRes.value.data || [];
          setTopCategories(Array.isArray(innerCatList) ? innerCatList : []);
        }
        if (compRes.status === 'fulfilled' && compRes.value?.success) {
          const innerComp = compRes.value.data?.data || compRes.value.data || null;
          setOrderComparison(innerComp);
        }
        if (demoRes.status === 'fulfilled' && demoRes.value?.success) {
          const innerDemo = demoRes.value.data?.data || demoRes.value.data || [];
          setCustomerDemographics(Array.isArray(innerDemo) ? innerDemo : []);
        }
      } catch (error) {
        console.error("Overview dynamic fetch error:", error);
      } finally {
        setOverviewLoading(false);
        setTopProductsLoading(false);
        setOrderGraphLoading(false);
        setTopCategoriesLoading(false);
        setOrderComparisonLoading(false);
        setCustomerDemographicsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (vendorData?.status === 'APPROVED') {
      fetchProductsAndCategories();
    }
  }, [activeTab, showProductModal, graphDays, vendorData?.status]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleEditProduct = (product) => {
    setIsEditingProduct(true);
    setIsViewingProduct(false);
    setCurrentProductId(product._id);
    setShowProductModal(true);
  };

  const handleViewProduct = (product) => {
    setIsViewingProduct(true);
    setIsEditingProduct(false);
    setCurrentProductId(product._id);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      background: '#fff',
      customClass: {
        title: 'text-lg font-bold font-outfit uppercase',
        htmlContainer: 'text-xs font-bold font-outfit text-gray-500 uppercase',
        confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs',
        cancelButton: 'bg-gray-100 text-gray-800 px-6 py-2.5 rounded-xl font-bold uppercase text-xs'
      }
    });

    if (result.isConfirmed) {
      const loadingToast = toast.loading('Deleting product...');
      try {
        const response = await deleteProduct(id);
        toast.dismiss(loadingToast);
        if (response.success) {
          toast.success(response.data?.message || 'Product deleted successfully!');
          fetchProductsAndCategories();
        } else {
          toast.error(response.data?.message || 'Failed to delete product');
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('System error');
      }
    }
  };

  const handleExportOrders = async () => {
    const loadingToast = toast.loading('Exporting orders...');
    try {
      const csvData = await exportVendorOrders();
      
      let csvContent = csvData;
      if (csvData && typeof csvData === 'object') {
        if (csvData.success === false) {
          throw new Error(csvData.message || 'Export failed');
        }
        csvContent = csvData.data || csvData.message || JSON.stringify(csvData);
      }
      
      if (!csvContent) {
        throw new Error('No order data found to export');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vendor-orders-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss(loadingToast);
      toast.success('Orders exported successfully!');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to export orders:', error);
      toast.error(error.message || 'Failed to export orders');
    }
  };

  if (loading) return <div className={`min-h-screen flex items-center justify-center font-outfit uppercase font-bold text-gray-400 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>Loading Dashboard...</div>;

  // Restrict dashboard access if vendor is not approved
  if (vendorData && vendorData.status !== 'APPROVED') {
    const isPending = vendorData.status === 'PENDING' || !vendorData.status;
    return (
      <div className={`min-h-screen font-outfit flex flex-col items-center justify-center p-4 sm:p-6 text-center ${
        isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-800'
      }`}>
        <div className={`max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden border ${
          isDarkMode ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-100'
        }`}>
          {/* Decorative ambient gradients */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
            isPending
              ? 'bg-amber-50 border border-amber-200 text-amber-500 shadow-amber-500/10 animate-pulse'
              : 'bg-red-50 border border-red-200 text-red-500 shadow-red-500/10'
          }`}>
            <Store size={38} />
          </div>
          
          <div className="space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isPending ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            }`}>
              {isPending ? '🟡 Application Under Review' : '🔴 Application Rejected'}
            </span>
            <h2 className={`text-2xl font-bold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              {isPending ? 'Pending Admin Approval' : 'Store Application Rejected'}
            </h2>
            <p className="text-xs font-semibold text-zinc-400 uppercase">
              Store: <span className="text-primary font-bold">{vendorData.businessName}</span>
            </p>
          </div>
          
          <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {isPending
              ? 'Your store registration has been successfully submitted. For marketplace safety and catalog quality, our admin team reviews every new vendor before activating dashboard access. Once approved by admin, all merchant features will automatically unlock.'
              : 'Your vendor onboarding application was not approved by the marketplace administration. Please reach out to our vendor support team for clarification.'}
          </p>
          
          {/* Verification Steps Card */}
          <div className={`w-full rounded-2xl p-4 sm:p-5 border text-left space-y-3 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase">
              <span>Onboarding Progress</span>
              <span className={isPending ? 'text-amber-500 font-extrabold' : 'text-red-500 font-extrabold'}>
                {isPending ? 'Step 2 of 3 (In Review)' : 'Application Rejected'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-600 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                <span>1. Store Registration Submitted</span>
              </div>
              <div className={`flex items-center gap-2.5 font-bold ${isPending ? 'text-amber-600' : 'text-zinc-400'}`}>
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs">⏳</span>
                <span>2. Administrator Verification {isPending ? '(Under Review)' : ''}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">🔒</span>
                <span>3. Dashboard Access Activated (Locked)</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="w-full space-y-2.5">
            {isPending && (
              <button 
                onClick={async () => {
                  setCheckingStatus(true);
                  try {
                    const res = await getVendorDetails();
                    const vInfo = res?.data || res;
                    if (vInfo?.status === 'APPROVED') {
                      toast.success('Congratulations! Your vendor store has been approved.');
                      setVendorData(vInfo);
                    } else {
                      toast.info(`Current status: ${vInfo?.status || 'PENDING'}. Still awaiting admin approval.`);
                    }
                  } catch (e) {
                    toast.error('Could not refresh status at this moment.');
                  } finally {
                    setCheckingStatus(false);
                  }
                }}
                disabled={checkingStatus}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-2xl font-bold uppercase text-xs transition-all shadow-lg shadow-primary/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkingStatus ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                <span>Check Approval Status</span>
              </button>
            )}

            <button 
              onClick={() => navigate('/')}
              className={`w-full py-3 rounded-2xl font-bold uppercase text-xs transition-all border cursor-pointer ${
                isDarkMode ? 'border-white/10 hover:bg-white/5 text-gray-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              Browse Marketplace
            </button>

            <button 
              onClick={handleLogout}
              className="w-full text-gray-400 hover:text-red-500 py-2 text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden font-outfit transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <VendorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        vendorData={vendorData}
        handleLogout={handleLogout}
      />

      <div 
        ref={containerRef}
        className={`flex-grow flex flex-col h-screen overflow-y-scroll transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}
      >
        <header className={`h-16 lg:h-20 flex-shrink-0 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${
          isDarkMode ? 'bg-zinc-950/85 border-zinc-800/80 text-white' : 'bg-white/95 border-zinc-200 text-zinc-900'
        }`}>
          <div className="flex items-center gap-4">
            <button className={`lg:hidden p-2 rounded-lg transition-all ${
              isDarkMode ? 'text-zinc-400 hover:bg-zinc-900' : 'text-zinc-600 hover:bg-zinc-100'
            }`} onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className={`text-base lg:text-lg font-bold capitalize tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{activeTab}</h1>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-9 pr-4 py-2 border rounded-xl text-xs font-semibold outline-none w-48 lg:w-64 transition-all ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:ring-2 focus:ring-primary/20' : 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-primary/10'
                }`}
              />
            </div>

            <button 
              onClick={toggleTheme} 
              className={`p-2.5 rounded-xl transition-all border ${
                isDarkMode ? 'bg-zinc-900 text-amber-400 border-zinc-800 hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
              }`}
            >
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Wallet Quick Indicator */}
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-extrabold uppercase transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-900 text-emerald-400 border-zinc-800 hover:bg-zinc-850 hover:text-emerald-300' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800'
              }`}
              title="View Wallet Ledger"
            >
              <Wallet size={15} className={walletLoading ? 'animate-pulse text-emerald-500' : 'text-emerald-500'} />
              <span>{walletLoading ? '...' : formatCurrency(vendorWallet?.balance || 0)}</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase border border-primary/20">
              {vendorData?.businessName?.charAt(0) || 'V'}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <div className={activeTab === 'overview' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <VendorOverview
              isDarkMode={isDarkMode}
              overviewLoading={overviewLoading}
              overviewData={overviewData}
              graphDays={graphDays}
              setGraphDays={setGraphDays}
              orderGraphLoading={orderGraphLoading}
              orderGraphData={orderGraphData}
              topProducts={topProducts}
              topProductsLoading={topProductsLoading}
              topCategories={topCategories}
              topCategoriesLoading={topCategoriesLoading}
              orderComparison={orderComparison}
              orderComparisonLoading={orderComparisonLoading}
              getImageUrl={getImageUrl}
              formatCurrency={formatCurrency}
              customerDemographics={customerDemographics}
              customerDemographicsLoading={customerDemographicsLoading}
              vendorWallet={vendorWallet}
              walletLoading={walletLoading}
            />
          </div>

          <div className={activeTab === 'products' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <VendorProducts
              isDarkMode={isDarkMode}
              products={products}
              productsLoading={productsLoading}
              getImageUrl={getImageUrl}
              onAddProduct={() => {
                setIsEditingProduct(false);
                setIsViewingProduct(false);
                setCurrentProductId(null);
                setShowProductModal(true);
              }}
              onViewProduct={handleViewProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>

          <div className={activeTab === 'orders' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <VendorOrders
              isDarkMode={isDarkMode}
              orders={orders}
              ordersLoading={ordersLoading}
              onViewOrder={(order) => {
                setCurrentOrder(order);
                setShowOrderModal(true);
              }}
              onExportOrders={handleExportOrders}
            />
          </div>

          <div className={activeTab === 'riders' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <VendorRiders
              isDarkMode={isDarkMode}
              getImageUrl={getImageUrl}
            />
          </div>

          {/* ⚡ Quick Commerce Tab */}
          <div className={activeTab === 'quickcommerce' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <VendorFlow onNavigateToRiders={() => setActiveTab('riders')} />
          </div>

          <div className={activeTab === 'earnings' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <VendorEarnings
              isDarkMode={isDarkMode}
              overviewData={overviewData}
              salesPerformance={salesPerformance}
              salesPerformanceLoading={salesPerformanceLoading}
              orders={orders}
              ordersLoading={ordersLoading}
              onViewOrder={(order) => {
                setCurrentOrder(order);
                setShowOrderModal(true);
              }}
              formatCurrency={formatCurrency}
              vendorWallet={vendorWallet}
              walletLoading={walletLoading}
              walletTransactions={walletTransactions}
              walletTransactionsLoading={walletTransactionsLoading}
            />
          </div>

          <div className={activeTab === 'wallet' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <VendorWallet
              isDarkMode={isDarkMode}
              vendorWallet={vendorWallet}
              walletLoading={walletLoading}
              walletTransactions={walletTransactions}
              walletTransactionsLoading={walletTransactionsLoading}
              formatCurrency={formatCurrency}
            />
          </div>
          <div className={activeTab === 'payout' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <PayoutBankDetails
              isDarkMode={isDarkMode}
              role="vendor"
              ownerId={vendorData?._id}
            />
          </div>

          <div className={activeTab === 'tickets' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            <VendorTickets />
          </div>

          <div className={activeTab === 'profile' ? 'block animate-in fade-in duration-300' : 'hidden'}>
            {vendorData && (
              <VendorProfile
                isDarkMode={isDarkMode}
                vendorData={vendorData}
                getImageUrl={getImageUrl}
                onEditProfile={() => setShowEditModal(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals Portals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialData={vendorData}
        onSuccess={fetchVendorData}
      />

      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setIsEditingProduct(false);
          setIsViewingProduct(false);
          setCurrentProductId(null);
        }}
        isEditing={isEditingProduct}
        isViewing={isViewingProduct}
        productId={currentProductId}
        onSuccess={fetchProductsAndCategories}
        getImageUrl={getImageUrl}
        categories={categories}
      />

      <VendorOrderDetailsModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setCurrentOrder(null);
        }}
        order={currentOrder}
        onUpdate={fetchProductsAndCategories}
      />
    </div>
  );
};

export default VendorDashboard;
