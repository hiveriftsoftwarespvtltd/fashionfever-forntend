import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Share2, 
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
  Eye,
  SlidersHorizontal,
  Search,
  CheckCircle,
  Building,
  Trophy,
  Calendar,
  Award,
  Crown
} from 'lucide-react';
import { getAdminAffiliateDashboard, getAffiliateRanking } from '../../../api/adminService';
import { toast } from '../../../utils/toast';
import DataTable from '../../../components/shared/DataTable';

const AdminAffiliateDashboard = ({ isDarkMode }) => {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'leaderboard'
  
  // Tab 1: Overview states
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [influencers, setInfluencers] = useState([]);
  const [pieChartData, setPieChartData] = useState({
    users: 0,
    vendors: 0,
    serviceProviders: 0,
    educators: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab 2: Leaderboard states
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [rankFilters, setRankFilters] = useState({
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear()
  });

  // Modal details
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);

  // Fetch Overview data
  const fetchOverviewData = async () => {
    setLoadingOverview(true);
    try {
      const res = await getAdminAffiliateDashboard();
      if (res.success && res.data) {
        setInfluencers(res.data.influencers || []);
        if (res.data.pieChart) {
          setPieChartData(res.data.pieChart);
        }
      } else {
        toast.error(res.message || 'Failed to load affiliate dashboard.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while fetching affiliate stats.');
    } finally {
      setLoadingOverview(false);
    }
  };

  // Fetch Ranking data
  const fetchRankingData = async () => {
    setLoadingRanking(true);
    try {
      const res = await getAffiliateRanking(rankFilters.month, rankFilters.year);
      if (res.success && res.data) {
        setRankings(res.data || []);
      } else {
        toast.error(res.message || 'Failed to load ranking leaderboard.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while fetching rankings.');
    } finally {
      setLoadingRanking(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'overview') {
      fetchOverviewData();
    } else {
      fetchRankingData();
    }
  }, [activeSubTab, rankFilters.month, rankFilters.year]);

  // Filtered influencers based on search
  const filteredInfluencers = influencers.filter(inf => 
    inf.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inf.influencerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute aggregate stats
  const aggregates = influencers.reduce((acc, current) => {
    const stats = current.stats || {};
    return {
      uniqueClicks: acc.uniqueClicks + (stats.uniqueClicks || 0),
      totalSignups: acc.totalSignups + (stats.totalSignups || 0),
      totalOrders: acc.totalOrders + (stats.totalOrders || 0),
      totalOrderValue: acc.totalOrderValue + (stats.totalOrderValue || 0),
      platformCommission: acc.platformCommission + (stats.platformCommissionEarned || 0)
    };
  }, { uniqueClicks: 0, totalSignups: 0, totalOrders: 0, totalOrderValue: 0, platformCommission: 0 });

  // Pie chart calculation
  const pieSum = (pieChartData.users || 0) + (pieChartData.vendors || 0) + (pieChartData.serviceProviders || 0) + (pieChartData.educators || 0);
  const pieSegments = [
    { label: 'Users', value: pieChartData.users || 0, stroke: 'stroke-pink-500', bg: 'bg-pink-500' },
    { label: 'Vendors', value: pieChartData.vendors || 0, stroke: 'stroke-blue-500', bg: 'bg-blue-500' },
    { label: 'Service Providers', value: pieChartData.serviceProviders || 0, stroke: 'stroke-emerald-500', bg: 'bg-emerald-500' },
    { label: 'Educators', value: pieChartData.educators || 0, stroke: 'stroke-amber-500', bg: 'bg-amber-500' }
  ];

  let accumulatedPct = 0;
  const processedPieSegments = pieSegments.map(seg => {
    const percent = pieSum > 0 ? (seg.value / pieSum) * 100 : 0;
    const offset = -accumulatedPct;
    accumulatedPct += percent;
    return { ...seg, percent, offset };
  });

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 1 + i);

  const summaryCards = [
    {
      label: 'Unique Clicks',
      value: aggregates.uniqueClicks.toLocaleString('en-IN'),
      icon: <MousePointerClick size={20} className="text-purple-500" />,
      color: 'border-purple-500/20 bg-purple-500/5 text-purple-500'
    },
    {
      label: 'Total Signups',
      value: aggregates.totalSignups.toLocaleString('en-IN'),
      icon: <UserCheck size={20} className="text-blue-500" />,
      color: 'border-blue-500/20 bg-blue-500/5 text-blue-500'
    },
    {
      label: 'Total Orders',
      value: aggregates.totalOrders.toLocaleString('en-IN'),
      icon: <ShoppingBag size={20} className="text-green-500" />,
      color: 'border-green-500/20 bg-green-500/5 text-green-500'
    },
    {
      label: 'Total Network GMV',
      value: `₹${aggregates.totalOrderValue.toLocaleString('en-IN')}`,
      icon: <Coins size={20} className="text-orange-500" />,
      color: 'border-orange-500/20 bg-orange-500/5 text-orange-500'
    },
    {
      label: 'Platform Profit',
      value: `₹${aggregates.platformCommission.toLocaleString('en-IN')}`,
      icon: <Percent size={20} className="text-pink-500" />,
      color: 'border-pink-500/20 bg-pink-500/5 text-pink-500'
    }
  ];

  const columns = [
    {
      header: 'Influencer Info',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
          }`}>
            {row.name?.charAt(0).toUpperCase() || 'I'}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
              {row.name || 'Anonymous Creator'}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              ID: {row.influencerId?.substring(18) || 'N/A'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Clicks',
      key: 'clicks',
      render: (row) => (
        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {(row.stats?.uniqueClicks || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Signups',
      key: 'signups',
      render: (row) => (
        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {(row.stats?.totalSignups || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Orders',
      key: 'orders',
      render: (row) => (
        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {(row.stats?.totalOrders || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Network GMV',
      key: 'sales',
      render: (row) => (
        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          ₹{(row.stats?.totalOrderValue || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Commission Rate',
      key: 'commissionRate',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
          row.commissionRate === null || row.commissionRate === undefined
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            : row.commissionRate === 0
            ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
        }`}>
          {row.commissionRate === null || row.commissionRate === undefined
            ? 'Rate Unset'
            : row.commissionRate === 0
            ? '0%'
            : `${row.commissionRate}%`}
        </span>
      )
    },
    {
      header: 'Platform Profit',
      key: 'profit',
      render: (row) => (
        <span className="text-sm font-bold text-primary">
          ₹{(row.stats?.platformCommissionEarned || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <button
          onClick={() => setSelectedInfluencer(row)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isDarkMode ? 'bg-white/5 text-gray-400 hover:text-primary' : 'bg-gray-50 text-gray-400 hover:text-primary'
          }`}
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  // Leaderboard columns
  const rankingColumns = [
    {
      header: 'Rank',
      key: 'rank',
      render: (row, index) => {
        let rankBadge = `${index + 1}`;
        if (index === 0) rankBadge = '🥇';
        else if (index === 1) rankBadge = '🥈';
        else if (index === 2) rankBadge = '🥉';
        return (
          <span className="text-base font-black px-2">{rankBadge}</span>
        );
      }
    },
    {
      header: 'Creator Name',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
          }`}>
            {row.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
              {row.name}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              ID: {row.influencerId?.substring(18)}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Referrals Sold',
      key: 'referrals',
      render: (row) => {
        const stats = row.stats || {};
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Orders: {stats.totalOrders || 0}
            </span>
            <span className="text-xs text-zinc-400 font-bold uppercase">
              Courses: {stats.totalCourses || 0} / Services: {stats.totalServices || 0}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Sales generated',
      key: 'totalOrderValue',
      render: (row) => (
        <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          ₹{(row.stats?.totalOrderValue || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Platform Profit',
      key: 'platformProfit',
      render: (row) => (
        <span className="text-sm font-black text-emerald-500 dark:text-emerald-400">
          ₹{(row.stats?.platformCommissionEarned || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Clicks / Signups',
      key: 'clicks',
      render: (row) => (
        <span className="text-xs text-gray-400 font-bold uppercase">
          Clicks: {row.stats?.uniqueClicks || 0} / Reg: {row.stats?.totalSignups || 0}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <button
          onClick={() => setSelectedInfluencer(row)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isDarkMode ? 'bg-white/5 text-gray-400 hover:text-primary' : 'bg-gray-50 text-gray-400 hover:text-primary'
          }`}
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  // Top 3 Podium Sorting
  const podiumWinners = rankings.slice(0, 3);
  // Reorder to render: Rank 2 on Left, Rank 1 in Middle, Rank 3 on Right
  const podiumLayout = [];
  if (podiumWinners[1]) podiumLayout.push({ ...podiumWinners[1], rank: 2 });
  if (podiumWinners[0]) podiumLayout.push({ ...podiumWinners[0], rank: 1 });
  if (podiumWinners[2]) podiumLayout.push({ ...podiumWinners[2], rank: 3 });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      
      {/* Title */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h2 className={`text-lg lg:text-3xl font-bold uppercase transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Affiliate Performance Dashboard
          </h2>
          <p className="text-sm font-semibold uppercase text-gray-400 mt-1">
            Track real-time creator clicks, user registration distribution, and monthly sales leaderboards.
          </p>
        </div>

        {/* Tab Toggle buttons */}
        <div className={`p-1.5 rounded-2xl flex items-center gap-1 border flex-shrink-0 ${
          isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-gray-100 border-gray-200'
        }`}>
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <SlidersHorizontal className="inline mr-2" size={13} />
            Overview Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'leaderboard'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Trophy className="inline mr-2" size={13} />
            Creator Leaderboard
          </button>
        </div>
      </div>

      {activeSubTab === 'overview' ? (
        <>
          {/* Stats Summary Cards */}
          {loadingOverview ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in duration-300">
              {summaryCards.map((card, i) => (
                <div 
                  key={i} 
                  className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm ${
                    isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                      {card.label}
                    </span>
                    <div className={`p-2 rounded-xl ${card.color.split(' ')[1]} ${card.color.split(' ')[0]}`}>
                      {card.icon}
                    </div>
                  </div>
                  <p className={`text-lg lg:text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Network Distribution & Filters */}
          {!loadingOverview && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              
              {/* Left: Registration breakdown Donut chart */}
              <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Platform Signups Distribution
                  </h3>
                  
                  <div className="flex flex-col items-center justify-center py-2 sm:flex-row sm:gap-6">
                    {/* Donut SVG */}
                    <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
                      <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isDarkMode ? "#27272a" : "#f4f4f5"} strokeWidth="4.5" />
                        
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
                        <span className={`block text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{pieSum}</span>
                        <span className="block text-xs font-bold uppercase text-zinc-400">Total Signups</span>
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
                              <span className={`inline-block mr-1 font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{seg.value}</span>
                              <span className="text-sm text-gray-400">({pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Search & Table Filter */}
              <div className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100 shadow-sm'
              }`}>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Search Creator Network
                  </h3>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-6">
                    Search by creator name or creator ID to view specific affiliate parameters and click metrics.
                  </p>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by creator name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3.5 border-none rounded-xl text-xs font-bold outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-white/5 text-gray-200 placeholder-gray-500' 
                          : 'bg-gray-55 text-gray-800 focus:bg-gray-100 placeholder:text-gray-400'
                      }`}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
                  <span className="text-xs font-bold uppercase text-zinc-400">Creators matching:</span>
                  <span className="text-xs font-black text-primary">{filteredInfluencers.length} Creators</span>
                </div>
              </div>
            </div>
          )}

          {/* Influencers List Table */}
          {!loadingOverview && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-2">
                <h2 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Creator Performance Matrix
                </h2>
              </div>
              <DataTable columns={columns} data={filteredInfluencers} />
            </div>
          )}
        </>
      ) : (
        <>
          {/* Leaderboard Rankings */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 mb-6 text-left">
              <Calendar size={16} className="text-primary" />
              <span className="text-xs font-black uppercase tracking-wider">Select Monthly Leaderboard Range</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              {/* Month Selector */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-black uppercase tracking-wider text-gray-400">Select Month</label>
                <select
                  value={rankFilters.month}
                  onChange={(e) => setRankFilters(p => ({ ...p, month: Number(e.target.value) }))}
                  className={`w-full px-4 py-3.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-700 focus:border-primary/50 text-white' 
                      : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 text-gray-800'
                  }`}
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-black uppercase tracking-wider text-gray-400">Select Year</label>
                <select
                  value={rankFilters.year}
                  onChange={(e) => setRankFilters(p => ({ ...p, year: Number(e.target.value) }))}
                  className={`w-full px-4 py-3.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-700 focus:border-primary/50 text-white' 
                      : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 text-gray-800'
                  }`}
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loadingRanking ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                Analyzing creator sales data...
              </span>
            </div>
          ) : rankings.length === 0 ? (
            <div className="py-20 text-center border rounded-3xl dark:border-white/5">
              <Trophy size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-sm font-black uppercase dark:text-white">No sales ranking records found</p>
              <p className="text-xs font-bold uppercase text-gray-400 mt-1">Creators have generated 0 referrals for this range</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Podium display for Top 3 */}
              <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-12 pb-6 max-w-4xl mx-auto">
                
                {podiumLayout.map((winner, idx) => {
                  let podiumHeight = 'h-36';
                  let ringColor = 'border-gray-300';
                  let badgeBg = 'bg-gray-400';
                  let badgeIcon = '🥈';
                  let rankTitle = 'Rank 2';

                  if (winner.rank === 1) {
                    podiumHeight = 'h-48 md:-translate-y-4';
                    ringColor = 'border-amber-400 ring-4 ring-amber-400/20';
                    badgeBg = 'bg-amber-400';
                    badgeIcon = '👑';
                    rankTitle = 'Winner';
                  } else if (winner.rank === 3) {
                    podiumHeight = 'h-28';
                    ringColor = 'border-orange-500';
                    badgeBg = 'bg-orange-500';
                    badgeIcon = '🥉';
                    rankTitle = 'Rank 3';
                  }

                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 w-full max-w-[240px]">
                      
                      {/* Avatar */}
                      <div className="relative mb-3">
                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-lg ${ringColor} ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                          {winner.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-lg`}>
                          {badgeIcon}
                        </span>
                      </div>

                      {/* Info */}
                      <span className="text-sm font-black uppercase truncate max-w-full block">
                        {winner.name}
                      </span>
                      <span className="text-xs text-primary font-bold uppercase mt-0.5">
                        ₹{(winner.stats?.totalOrderValue || 0).toLocaleString('en-IN')} Sales
                      </span>

                      {/* Podium Stand */}
                      <div className={`w-full mt-4 flex flex-col justify-between items-center p-4 rounded-t-2xl shadow-lg border-t border-x ${podiumHeight} ${
                        winner.rank === 1
                          ? isDarkMode ? 'bg-amber-400/10 border-amber-400/25' : 'bg-amber-50 border-amber-100'
                          : isDarkMode ? 'bg-gray-800/80 border-white/5' : 'bg-gray-100/80 border-gray-200'
                      }`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs ${badgeBg}`}>
                          {winner.rank}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {rankTitle}
                        </span>
                      </div>

                    </div>
                  );
                })}

              </div>

              {/* Leaderboard Table List */}
              <div className="space-y-4">
                <DataTable columns={rankingColumns} data={rankings} />
              </div>

            </div>
          )}
        </>
      )}

      {/* ── Affiliate Influencer Details Modal ── */}
      {selectedInfluencer && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-xl my-auto md:my-8 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white text-zinc-900'
          }`}>
            <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto text-left">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">
                    {selectedInfluencer.name}'s Analytics
                  </h2>
                  <p className="text-xs font-mono text-zinc-400 uppercase mt-0.5">
                    Influencer ID: {selectedInfluencer.influencerId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInfluencer(null)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Stats Grid inside Modal */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                
                {/* Unique Clicks */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="flex items-center gap-2 mb-2 text-purple-500">
                    <MousePointerClick size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Unique Clicks</span>
                  </div>
                  <p className="text-lg font-black">{selectedInfluencer.stats?.uniqueClicks || 0}</p>
                </div>

                {/* Total Signups */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="flex items-center gap-2 mb-2 text-blue-500">
                    <UserCheck size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Signups</span>
                  </div>
                  <p className="text-lg font-black">{selectedInfluencer.stats?.totalSignups || 0}</p>
                </div>

                {/* Total Orders */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="flex items-center gap-2 mb-2 text-emerald-500">
                    <ShoppingBag size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  </div>
                  <p className="text-lg font-black">{selectedInfluencer.stats?.totalOrders || 0}</p>
                </div>

                {/* Platform Profit */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="flex items-center gap-2 mb-2 text-pink-500">
                    <Percent size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Platform Profit</span>
                  </div>
                  <p className="text-lg font-black">₹{(selectedInfluencer.stats?.platformCommissionEarned || 0).toLocaleString('en-IN')}</p>
                </div>

              </div>

              {/* Signups Breakdown */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Onboarded Signup Breakdown</h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-gray-900/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                    <span className="text-gray-400">Users (Customers)</span>
                    <span className="font-black text-pink-500">{selectedInfluencer.stats?.userSignups || 0}</span>
                  </div>
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-gray-900/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                    <span className="text-gray-400">Vendors</span>
                    <span className="font-black text-blue-500">{selectedInfluencer.stats?.vendorOnboarded || 0}</span>
                  </div>
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-gray-900/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                    <span className="text-gray-400">Service Providers</span>
                    <span className="font-black text-emerald-500">{selectedInfluencer.stats?.serviceProviderOnboarded || 0}</span>
                  </div>
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-gray-900/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                    <span className="text-gray-400">Educators</span>
                    <span className="font-black text-amber-500">{selectedInfluencer.stats?.educatorOnboarded || 0}</span>
                  </div>
                </div>
              </div>

              {/* Services & Courses Sales */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Services & Courses Referrals</h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-gray-900/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                    <span className="text-gray-400">Services Sales</span>
                    <span className="font-black text-emerald-500">{selectedInfluencer.stats?.totalServices || 0}</span>
                  </div>
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-gray-900/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                    <span className="text-gray-400">Courses Sales</span>
                    <span className="font-black text-amber-500">{selectedInfluencer.stats?.totalCourses || 0}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAffiliateDashboard;
