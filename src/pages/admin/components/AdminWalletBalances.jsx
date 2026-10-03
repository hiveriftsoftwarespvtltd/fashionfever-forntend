import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Users as UsersIcon, 
  Store, 
  TrendingUp, 
  Briefcase, 
  BookOpen, 
  IndianRupee, 
  Loader2, 
  Search, 
  CheckCircle2, 
  XCircle,
  ShieldAlert,
  Percent,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  getUsersBalances, 
  getVendorsBalances, 
  getInfluencersBalances, 
  getServiceProvidersBalances, 
  getEducatorsBalances, 
  getPlatformBalances 
} from '../../../api/adminService';
import { toast } from '../../../utils/toast';

const AdminWalletBalances = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('platform');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch data depending on active tab
  const fetchBalances = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case 'platform':
          res = await getPlatformBalances();
          break;
        case 'users':
          res = await getUsersBalances();
          break;
        case 'vendors':
          res = await getVendorsBalances();
          break;
        case 'influencers':
          res = await getInfluencersBalances();
          break;
        case 'service-providers':
          res = await getServiceProvidersBalances();
          break;
        case 'educators':
          res = await getEducatorsBalances();
          break;
        default:
          res = { success: false, message: 'Invalid Tab' };
      }

      if (res.success) {
        const list = res.data?.data ?? res.data ?? [];
        setData(Array.isArray(list) ? list : (list ? [list] : []));
        setCurrentPage(1);
      } else {
        toast.error(res.message || `Failed to fetch ${activeTab} balances.`);
        setData([]);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while fetching balances.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [activeTab]);

  // Filters search queries
  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    
    if (activeTab === 'platform') return true;

    if (activeTab === 'users') {
      const name = item.userId?.name || '';
      const email = item.userId?.email || '';
      return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    }

    if (activeTab === 'vendors') {
      const bizName = item.vendorId?.businessName || '';
      const email = item.vendorId?.email || '';
      return bizName.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    }

    if (activeTab === 'influencers') {
      const name = item.influencerId?.name || '';
      const id = item.influencerId?.id || '';
      return name.toLowerCase().includes(query) || id.toLowerCase().includes(query);
    }

    if (activeTab === 'service-providers') {
      const bizName = item.serviceProviderId?.businessName || item.providerId || '';
      const email = item.serviceProviderId?.email || '';
      return bizName.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    }

    if (activeTab === 'educators') {
      const id = item.educatorId?._id || '';
      return id.toLowerCase().includes(query);
    }

    return true;
  });

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate summaries
  const calculateTotalBalance = () => {
    return data.reduce((sum, item) => sum + (Number(item.balance) || 0), 0);
  };

  const calculateTotalPending = () => {
    return data.reduce((sum, item) => sum + (Number(item.pendingBalance) || 0), 0);
  };

  // Switcher Tab Config
  const tabsConfig = [
    { id: 'platform', label: 'Platform Summary', icon: <Percent size={14} /> },
    { id: 'users', label: 'Customer Wallets', icon: <UsersIcon size={14} /> },
    { id: 'vendors', label: 'Vendor Wallets', icon: <Store size={14} /> },
    { id: 'influencers', label: 'Influencer Wallets', icon: <TrendingUp size={14} /> },
    { id: 'service-providers', label: 'Provider Wallets', icon: <Briefcase size={14} /> },
    { id: 'educators', label: 'Educator Wallets', icon: <BookOpen size={14} /> }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-outfit">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className={`text-xl lg:text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
            Wallet Balances Console
          </h2>
          <p className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mt-0.5">
            Global ledger control audit panel for customer deposits, merchant payouts, and commissions balances
          </p>
        </div>
      </div>

      {/* Switcher Tabs Bar */}
      <div className={`flex flex-wrap p-1.5 rounded-2xl border transition-all ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        {tabsConfig.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                active 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : isDarkMode
                  ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total Liquid Balance */}
        <div className={`p-5 rounded-2xl border transition-all text-left ${
          isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
              Total Managed Balance
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <IndianRupee size={18} />
            </div>
          </div>
          <p className={`text-xl lg:text-2xl font-black tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
            ₹{calculateTotalBalance().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
            Sum of all active liquid currency assets in category
          </p>
        </div>

        {/* Card 2: Total Pending Settlement Balance (merchant types) */}
        {activeTab !== 'platform' && activeTab !== 'users' ? (
          <div className={`p-5 rounded-2xl border transition-all text-left ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                Total Pending Settlement
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <IndianRupee size={18} />
              </div>
            </div>
            <p className={`text-xl lg:text-2xl font-black tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
              ₹{calculateTotalPending().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
              Awaiting escrow validation or pending request settlement
            </p>
          </div>
        ) : (
          <div className={`p-5 rounded-2xl border transition-all text-left ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                Active Ledger Accounts
              </span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <UsersIcon size={18} />
              </div>
            </div>
            <p className={`text-xl lg:text-2xl font-black tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {data.length}
            </p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
              Registered wallet accounts parsed inside this category
            </p>
          </div>
        )}

        {/* Card 3: Status Summary */}
        <div className={`p-5 rounded-2xl border transition-all text-left ${
          isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
              Operational Status
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Wallet size={18} />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-black text-primary uppercase">
            Active
          </p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
            Wallet hooks and ledger interfaces synced with backend
          </p>
        </div>
      </div>

      {/* Search Input Filter */}
      {activeTab !== 'platform' && (
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
          isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <Search className="text-zinc-400 flex-shrink-0" size={16} />
          <input 
            type="text"
            placeholder={`Filter balances by name, email, or ID...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full bg-transparent text-xs font-bold outline-none border-none ${
              isDarkMode ? 'text-zinc-100 placeholder:text-zinc-500' : 'text-zinc-900 placeholder:text-zinc-400'
            }`}
          />
        </div>
      )}

      {/* Main Ledger Table Card */}
      <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
              Querying wallet balances database...
            </span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <ShieldAlert size={42} className="text-zinc-400 mb-3" />
            <p className={`text-sm font-black uppercase ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
              No Balances Found
            </p>
            <p className="text-xs text-zinc-400 font-bold uppercase mt-1">
              Either search mismatch or no records registered in database
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`border-b text-left text-[11px] font-black uppercase tracking-wider ${
                  isDarkMode ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-zinc-50/80 border-zinc-200 text-zinc-500'
                }`}>
                  {activeTab === 'platform' && (
                    <>
                      <th className="py-4 px-6">Platform ID</th>
                      <th className="py-4 px-6 text-right">Managed Balance</th>
                      <th className="py-4 px-6 text-right">Commission Earned</th>
                      <th className="py-4 px-6 text-right">Platform Fees</th>
                      <th className="py-4 px-6 text-right">Total Payouts</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </>
                  )}
                  {activeTab === 'users' && (
                    <>
                      <th className="py-4 px-6">Customer Profile</th>
                      <th className="py-4 px-6 text-right">Liquid Balance</th>
                      <th className="py-4 px-6 text-right">Total Credits</th>
                      <th className="py-4 px-6 text-right">Total Debits</th>
                      <th className="py-4 px-6 text-center">Created At</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </>
                  )}
                  {activeTab === 'vendors' && (
                    <>
                      <th className="py-4 px-6">Vendor / Business</th>
                      <th className="py-4 px-6 text-right">Liquid Balance</th>
                      <th className="py-4 px-6 text-right">Pending Balance</th>
                      <th className="py-4 px-6 text-right">Total Earnings</th>
                      <th className="py-4 px-6 text-right">Total Withdrawn</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </>
                  )}
                  {activeTab === 'influencers' && (
                    <>
                      <th className="py-4 px-6">Influencer Profile</th>
                      <th className="py-4 px-6 text-right">Liquid Balance</th>
                      <th className="py-4 px-6 text-right">Pending Balance</th>
                      <th className="py-4 px-6 text-right">Total Earnings</th>
                      <th className="py-4 px-6 text-right">Total Withdrawn</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </>
                  )}
                  {activeTab === 'service-providers' && (
                    <>
                      <th className="py-4 px-6">Service Provider / Salon</th>
                      <th className="py-4 px-6 text-right">Liquid Balance</th>
                      <th className="py-4 px-6 text-right">Pending Balance</th>
                      <th className="py-4 px-6 text-right">Total Earnings</th>
                      <th className="py-4 px-6 text-right">Total Withdrawn</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </>
                  )}
                  {activeTab === 'educators' && (
                    <>
                      <th className="py-4 px-6">Educator Profile ID</th>
                      <th className="py-4 px-6 text-right">Liquid Balance</th>
                      <th className="py-4 px-6 text-right">Pending Balance</th>
                      <th className="py-4 px-6 text-right">Total Earnings</th>
                      <th className="py-4 px-6 text-right">Total Withdrawn</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {paginatedData.map((item) => (
                  <tr 
                    key={item._id} 
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.01]"
                  >
                    
                    {/* Render Tab: Platform */}
                    {activeTab === 'platform' && (
                      <>
                        <td className="py-4 px-6 text-left">
                          <code className="text-xs font-mono font-bold text-gray-500 uppercase">
                            #{item._id.substring(item._id.length - 8).toUpperCase()}
                          </code>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{(item.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400">
                            ₹{(item.totalCommissionEarned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-gray-700 dark:text-gray-300 text-sm font-bold">
                          ₹{(item.totalPlatformFeesEarned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-primary text-sm font-black">
                          ₹{(item.totalPayouts || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-100 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mx-auto">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        </td>
                      </>
                    )}

                    {/* Render Tab: Users */}
                    {activeTab === 'users' && (
                      <>
                        <td className="py-4 px-6 text-left">
                          {item.userId ? (
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {item.userId.name || 'Anonymous User'}
                              </span>
                              <span className="text-sm text-gray-400 font-bold lowercase">
                                {item.userId.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-bold uppercase italic">
                              System / Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{(item.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-emerald-500 font-bold text-sm">
                          ₹{(item.totalCredits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-rose-500 font-bold text-sm">
                          ₹{(item.totalDebits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-center text-xs font-bold text-gray-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mx-auto ${
                            item.isActive 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {item.isActive ? <><CheckCircle2 size={10} /> Active</> : <><XCircle size={10} /> Inactive</>}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Render Tab: Vendors */}
                    {activeTab === 'vendors' && (
                      <>
                        <td className="py-4 px-6 text-left">
                          {item.vendorId ? (
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {item.vendorId.businessName || 'Unnamed Merchant'}
                              </span>
                              {item.vendorId.email && (
                                <span className="text-sm text-gray-400 font-bold lowercase">
                                  {item.vendorId.email}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-bold uppercase italic">
                              System / Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{(item.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-amber-500 font-bold text-sm">
                          ₹{(item.pendingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-emerald-500 font-bold text-sm">
                          ₹{(item.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-primary font-bold text-sm">
                          ₹{(item.totalWithdrawn || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mx-auto ${
                            item.isActive 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {item.isActive ? <><CheckCircle2 size={10} /> Active</> : <><XCircle size={10} /> Inactive</>}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Render Tab: Influencers */}
                    {activeTab === 'influencers' && (
                      <>
                        <td className="py-4 px-6 text-left">
                          {item.influencerId ? (
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {item.influencerId.name || 'Unnamed Influencer'}
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono uppercase">
                                ID: {item.influencerId.id || item.influencerId._id}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-bold uppercase italic">
                              System / Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{(item.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-amber-500 font-bold text-sm">
                          ₹{(item.pendingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-emerald-500 font-bold text-sm">
                          ₹{(item.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-primary font-bold text-sm">
                          ₹{(item.totalWithdrawn || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mx-auto ${
                            item.isActive 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {item.isActive ? <><CheckCircle2 size={10} /> Active</> : <><XCircle size={10} /> Inactive</>}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Render Tab: Service Providers */}
                    {activeTab === 'service-providers' && (
                      <>
                        <td className="py-4 px-6 text-left">
                          {item.serviceProviderId || item.providerId ? (
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {item.serviceProviderId?.businessName || 'Salon Lounge'}
                              </span>
                              <span className="text-sm text-gray-400 font-bold">
                                {item.serviceProviderId?.email || item.providerId || 'N/A'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-bold uppercase italic">
                              System / Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{(item.balance || item.availableBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-amber-500 font-bold text-sm">
                          ₹{(item.pendingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-emerald-500 font-bold text-sm">
                          ₹{(item.totalEarnings || item.totalEarned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-primary font-bold text-sm">
                          ₹{(item.totalWithdrawn || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mx-auto ${
                            item.isActive 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {item.isActive !== false ? <><CheckCircle2 size={10} /> Active</> : <><XCircle size={10} /> Inactive</>}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Render Tab: Educators */}
                    {activeTab === 'educators' && (
                      <>
                        <td className="py-4 px-6 text-left text-xs font-mono font-bold text-gray-500 uppercase">
                          {item.educatorId?._id ? (
                            `#EDU-${item.educatorId._id.substring(item.educatorId._id.length - 8).toUpperCase()}`
                          ) : (
                            <span className="italic text-gray-400 font-outfit">Unassigned / System</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{(item.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-amber-500 font-bold text-sm">
                          ₹{(item.pendingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-emerald-500 font-bold text-sm">
                          ₹{(item.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right text-primary font-bold text-sm">
                          ₹{(item.totalWithdrawn || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mx-auto ${
                            item.isActive 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {item.isActive !== false ? <><CheckCircle2 size={10} /> Active</> : <><XCircle size={10} /> Inactive</>}
                          </span>
                        </td>
                      </>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
              isDarkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-50/50'
            }`}>
              <span className="text-xs font-bold uppercase text-zinc-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
              </span>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="px-3 py-1.5 flex items-center justify-center bg-primary text-white rounded-xl text-xs font-black shadow-md shadow-primary/20">
                  {currentPage} / {totalPages}
                </div>
                <button 
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

    </div>
  );
};

export default AdminWalletBalances;
