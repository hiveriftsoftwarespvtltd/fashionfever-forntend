import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Store, 
  ShoppingBag, 
  TicketPercent, 
  Loader2, 
  Sparkles,
  BarChart3,
  Package,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = ({
  isOverviewLoading,
  overviewData,
  revenueTrend = [],
  topCategories = [],
  orderStatusAnalytics = [],
  categoryDistribution = [],
  orderStatusGraph = [],
  monthlyAnalytics = [],
  yearlyAnalytics = [],
  analyticsGraph = [],
  topVendorsGraph = [],
  isDarkMode,
  setActiveTab,
  selectedYear,
  setSelectedYear,
  activeMonthlyMetric,
  setActiveMonthlyMetric,
  fetchMonthlyData
}) => {

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN');
  };

  const stats = [
    { 
      id: 'revenue', 
      label: 'Total Revenue', 
      value: overviewData?.totalRevenue !== undefined ? formatCurrency(overviewData.totalRevenue) : '₹0', 
      icon: <TrendingUp size={20} />, 
      trend: 'Net Sales', 
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    { 
      id: 'users', 
      label: 'Total Users', 
      value: overviewData?.totalUser !== undefined ? Number(overviewData.totalUser).toLocaleString() : '0', 
      icon: <Users size={20} />, 
      trend: 'Registered', 
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      badge: isDarkMode ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-700 border-sky-200'
    },
    { 
      id: 'vendors', 
      label: 'Vendor Partners', 
      value: overviewData?.totalVendors !== undefined ? Number(overviewData.totalVendors).toLocaleString() : '0', 
      icon: <Store size={20} />, 
      trend: 'Approved Shops', 
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      badge: isDarkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200'
    },
    { 
      id: 'influencers', 
      label: 'Influencer Partners', 
      value: overviewData?.totalInfluencers !== undefined ? Number(overviewData.totalInfluencers).toLocaleString() : '0', 
      icon: <Sparkles size={20} />, 
      trend: 'Affiliates', 
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
      badge: isDarkMode ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-pink-50 text-pink-700 border-pink-200'
    },
    { 
      id: 'orders', 
      label: 'Total Orders', 
      value: overviewData?.totalOrders !== undefined ? Number(overviewData.totalOrders).toLocaleString() : '0', 
      icon: <ShoppingBag size={20} />, 
      trend: 'All Orders', 
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badge: isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
    },
    { 
      id: 'pending-commission', 
      label: 'Pending Commission', 
      value: overviewData?.pendingInfluencerCommissions !== undefined ? formatCurrency(overviewData.pendingInfluencerCommissions) : '₹0', 
      icon: <TicketPercent size={20} />, 
      trend: 'Awaiting Settlement', 
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      badge: isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200'
    }
  ];

  const getStatusColors = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes('deliver')) {
      return { text: 'text-emerald-500', bar: 'bg-emerald-500', stroke: 'stroke-emerald-500' };
    } else if (s.includes('pending') || s.includes('process')) {
      return { text: 'text-amber-500', bar: 'bg-amber-500', stroke: 'stroke-amber-500' };
    } else if (s.includes('ship')) {
      return { text: 'text-sky-500', bar: 'bg-sky-500', stroke: 'stroke-sky-500' };
    } else if (s.includes('cancel') || s.includes('reject') || s.includes('fail')) {
      return { text: 'text-rose-500', bar: 'bg-rose-500', stroke: 'stroke-rose-500' };
    } else {
      return { text: 'text-purple-500', bar: 'bg-purple-500', stroke: 'stroke-purple-500' };
    }
  };

  const getCurvePath = (points) => {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const getSvgChartPaths = () => {
    if (!revenueTrend || revenueTrend.length === 0) return { linePath: '', areaPath: '', points: [], maxVal: 10000 };
    
    const maxVal = Math.max(...revenueTrend.map(item => item.revenue || 0), 10000);
    const chartHeight = 160;
    const chartWidth = 500;
    const paddingLeft = 55;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    
    const points = revenueTrend.map((item, idx) => {
      const x = paddingLeft + (idx / Math.max(revenueTrend.length - 1, 1)) * usableWidth;
      const y = chartHeight - paddingBottom - ((item.revenue || 0) / maxVal) * usableHeight;
      const date = item._id || 'N/A';
      return { x, y, revenue: item.revenue || 0, date };
    });
    
    const linePath = getCurvePath(points);
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const bottomY = chartHeight - paddingBottom;
    const areaPath = points.length > 0 ? `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z` : '';
    
    return { linePath, areaPath, points, maxVal, chartHeight };
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {isOverviewLoading ? (
        <div className={`h-80 flex flex-col items-center justify-center gap-3 rounded-2xl border ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
            Loading Analytics Dashboard...
          </p>
        </div>
      ) : (
        <>
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats.map((stat, i) => {
              const clickable = ['users', 'vendors', 'influencers', 'orders'].includes(stat.id);
              return (
                <div 
                  key={i} 
                  onClick={() => clickable && setActiveTab(stat.id)} 
                  className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                    clickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'cursor-default'
                  } ${
                    isDarkMode 
                      ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20 hover:border-zinc-700' 
                      : 'bg-white border-zinc-200/90 shadow-sm hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md border tracking-tight ${stat.badge}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    {stat.label}
                  </h3>
                  <p className={`text-xl lg:text-2xl font-black tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-zinc-900'
                  }`}>
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Row 2: Charts & Visual Distribution */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Revenue Trend Chart */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20' : 'bg-white border-zinc-200/90 shadow-sm'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">Financial Metrics</span>
                  <h3 className={`text-sm font-extrabold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                    Revenue Growth (Last 10 Days)
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Feed
                </div>
              </div>

              {revenueTrend.length > 0 ? (() => {
                const { linePath, areaPath, points, maxVal } = getSvgChartPaths();
                return (
                  <div className="w-full relative overflow-hidden pt-2">
                    <svg className="w-full h-auto max-h-[200px]" viewBox="0 0 500 160" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="chart-area-grad-rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fe3e6a" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#fe3e6a" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = 160 - 40 - ratio * 100;
                        const val = Math.round(maxVal * ratio);
                        return (
                          <g key={idx}>
                            <line x1="50" y1={y} x2="480" y2={y} stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="1" strokeDasharray="3 3" />
                            <text x="45" y={y + 3} textAnchor="end" className={`text-[10px] font-bold ${isDarkMode ? 'fill-zinc-400' : 'fill-zinc-500'}`}>
                              ₹{val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val}
                            </text>
                          </g>
                        );
                      })}
                      
                      {areaPath && <path d={areaPath} fill="url(#chart-area-grad-rev)" />}
                      {linePath && <path d={linePath} fill="none" stroke="#fe3e6a" strokeWidth="2.5" strokeLinecap="round" />}
                      
                      {points.map((p, idx) => (
                        <g key={idx} className="group/dot cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="4" className="fill-primary stroke-white dark:stroke-zinc-900 transition-all duration-200 hover:scale-125" strokeWidth="2" />
                          <title>{`Date: ${p.date}\nRevenue: ₹${p.revenue.toLocaleString('en-IN')}`}</title>
                        </g>
                      ))}
                    </svg>
                  </div>
                );
              })() : (
                <div className="py-16 text-center">
                  <BarChart3 className="mx-auto text-zinc-400 mb-2 opacity-50" size={32} />
                  <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    No Revenue Transactions In Period
                  </p>
                </div>
              )}
            </div>

            {/* Category Distribution */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20' : 'bg-white border-zinc-200/90 shadow-sm'
            }`}>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">Catalog Segment</span>
                <h3 className={`text-sm font-extrabold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Category Distribution
                </h3>
              </div>

              {categoryDistribution.length > 0 ? (() => {
                const totalItems = categoryDistribution.reduce((sum, item) => sum + (item.productCount ?? item.count ?? 0), 0);
                const colors = ['bg-pink-500 text-pink-500', 'bg-purple-500 text-purple-500', 'bg-sky-500 text-sky-500', 'bg-emerald-500 text-emerald-500', 'bg-amber-500 text-amber-500'];

                return (
                  <div className="space-y-3.5 py-2">
                    {categoryDistribution.slice(0, 5).map((item, idx) => {
                      const count = item.productCount ?? item.count ?? 0;
                      const pct = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
                      const colorClass = colors[idx % colors.length];

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className={isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}>
                              {item.name || item._id || 'General'}
                            </span>
                            <span className={isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}>
                              {pct}% ({count})
                            </span>
                          </div>
                          <div className={`w-full h-2 rounded-full overflow-hidden ${
                            isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'
                          }`}>
                            <div 
                              className={`h-full rounded-full ${colorClass.split(' ')[0]}`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })() : (
                <div className="py-16 text-center">
                  <Layers className="mx-auto text-zinc-400 mb-2 opacity-50" size={32} />
                  <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    No Category Distribution Available
                  </p>
                </div>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20' : 'bg-white border-zinc-200/90 shadow-sm'
            }`}>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">Operational Metrics</span>
                <h3 className={`text-sm font-extrabold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Order Status Pipeline
                </h3>
              </div>

              {(() => {
                const map = {};
                [...orderStatusAnalytics, ...orderStatusGraph].forEach(item => {
                  const key = String(item.status || 'pending').toLowerCase();
                  map[key] = (map[key] || 0) + (item.count || 0);
                });
                const activeData = Object.entries(map).map(([status, count]) => ({ status, count }));
                const totalOrders = activeData.reduce((sum, item) => sum + item.count, 0);

                if (activeData.length === 0 || totalOrders === 0) {
                  return (
                    <div className="py-16 text-center">
                      <Package className="mx-auto text-zinc-400 mb-2 opacity-50" size={32} />
                      <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        No Active Orders In Pipeline
                      </p>
                      <span className={`text-xs mt-1 block ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Awaiting incoming buyer checkouts
                      </span>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      {activeData.map((item, idx) => {
                        const pct = Math.round((item.count / totalOrders) * 100);
                        const design = getStatusColors(item.status);

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className={`capitalize ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                                {item.status}
                              </span>
                              <span className={design.text}>
                                {pct}% ({item.count})
                              </span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden ${
                              isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'
                            }`}>
                              <div className={`h-full ${design.bar} rounded-full`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className={`pt-3 border-t flex justify-between items-center ${
                      isDarkMode ? 'border-zinc-800' : 'border-zinc-100'
                    }`}>
                      <span className={`text-xs font-extrabold uppercase ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                      }`}>Total Pipeline Orders</span>
                      <span className={`text-base font-black ${
                        isDarkMode ? 'text-white' : 'text-zinc-900'
                      }`}>{totalOrders}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Row 3: Fiscal Trends & YoY Comparisons */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Year-over-Year Performance */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20' : 'bg-white border-zinc-200/90 shadow-sm'
            }`}>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">Enterprise Growth</span>
                <h3 className={`text-sm font-extrabold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Year-over-Year Performance
                </h3>
              </div>

              {yearlyAnalytics.length === 0 ? (
                <div className="py-16 text-center">
                  <Calendar className="mx-auto text-zinc-400 mb-2 opacity-50" size={32} />
                  <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    No Annual Historical Data Available
                  </p>
                </div>
              ) : (() => {
                const maxRevenue = Math.max(...yearlyAnalytics.map(y => y.revenue || 0), 1);
                return (
                  <div className="space-y-4">
                    {yearlyAnalytics.map((item, idx) => {
                      const year = item.year || 2026;
                      const rev = item.revenue || 0;
                      const ord = item.orders || 0;
                      const pct = Math.min(Math.round((rev / maxRevenue) * 100), 100);

                      return (
                        <div 
                          key={year} 
                          className={`p-4 rounded-xl border transition-all ${
                            isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-primary/10 text-primary border border-primary/20">
                              Year {year}
                            </span>
                            <span className="text-xs font-black text-emerald-500">
                              {formatCurrency(rev)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-zinc-400 mb-1.5">
                            <span>Total Volume: {ord} orders</span>
                            <span>{pct}% Scale</span>
                          </div>
                          <div className={`w-full h-2 rounded-full overflow-hidden ${
                            isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'
                          }`}>
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Annual Performance & Monthly Trends */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20' : 'bg-white border-zinc-200/90 shadow-sm'
            }`}>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">Fiscal Performance</span>
                    <h3 className={`text-sm font-extrabold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      Annual Performance & Trends
                    </h3>
                  </div>

                  <select 
                    value={selectedYear} 
                    onChange={(e) => {
                      const yr = Number(e.target.value);
                      setSelectedYear(yr);
                      fetchMonthlyData(yr);
                    }} 
                    className={`text-xs font-bold uppercase px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                    }`}
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Metric Selectors */}
                <div className="flex gap-2 mb-4">
                  {['revenue', 'orders', 'users'].map((m) => (
                    <button 
                      key={m} 
                      onClick={() => setActiveMonthlyMetric(m)} 
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase transition-all ${
                        activeMonthlyMetric === m 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {monthlyAnalytics.length === 0 ? (
                <div className="py-16 text-center">
                  <BarChart3 className="mx-auto text-zinc-400 mb-2 opacity-50" size={32} />
                  <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    No Monthly Data for {selectedYear}
                  </p>
                </div>
              ) : (() => {
                const totalRev = monthlyAnalytics.reduce((sum, item) => sum + (item.revenue || 0), 0);
                const totalOrd = monthlyAnalytics.reduce((sum, item) => sum + (item.orders || 0), 0);
                const totalReg = monthlyAnalytics.reduce((sum, item) => sum + (item.users || 0) + (item.vendors || 0) + (item.influencers || 0), 0);

                const maxVal = Math.max(...monthlyAnalytics.map(item => {
                  if (activeMonthlyMetric === 'revenue') return item.revenue || 0;
                  if (activeMonthlyMetric === 'orders') return item.orders || 0;
                  return (item.users || 0) + (item.vendors || 0) + (item.influencers || 0);
                }), 10);

                const chartHeight = 120;
                const chartWidth = 500;
                const paddingLeft = 35;
                const paddingRight = 15;
                const usableWidth = chartWidth - paddingLeft - paddingRight;

                const points = monthlyAnalytics.map((item, idx) => {
                  const val = activeMonthlyMetric === 'revenue' 
                    ? (item.revenue || 0) 
                    : activeMonthlyMetric === 'orders' 
                      ? (item.orders || 0) 
                      : ((item.users || 0) + (item.vendors || 0) + (item.influencers || 0));
                  const x = paddingLeft + (idx / Math.max(monthlyAnalytics.length - 1, 1)) * usableWidth;
                  const y = chartHeight - 20 - (val / maxVal) * 80;
                  return { x, y, val, label: item.month || 'M' };
                });

                const linePath = getCurvePath(points);

                return (
                  <div className="w-full space-y-4">
                    <svg className="w-full h-auto max-h-[140px]" viewBox="0 0 500 120" preserveAspectRatio="xMidYMid meet">
                      {linePath && (
                        <path 
                          d={linePath} 
                          fill="none" 
                          stroke={activeMonthlyMetric === 'revenue' ? '#10b981' : activeMonthlyMetric === 'orders' ? '#f59e0b' : '#3b82f6'} 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                        />
                      )}
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="3.5" 
                            className={`stroke-white dark:stroke-zinc-900 fill-current ${
                              activeMonthlyMetric === 'revenue' ? 'text-emerald-500' : activeMonthlyMetric === 'orders' ? 'text-amber-500' : 'text-sky-500'
                            }`} 
                            strokeWidth="1.5" 
                          />
                          <text x={p.x} y="115" textAnchor="middle" className={`text-[10px] font-bold ${isDarkMode ? 'fill-zinc-400' : 'fill-zinc-500'}`}>
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </svg>

                    <div className={`grid grid-cols-3 gap-2 pt-3 border-t text-center ${
                      isDarkMode ? 'border-zinc-800' : 'border-zinc-100'
                    }`}>
                      <div>
                        <span className="block text-xs font-bold text-zinc-400 uppercase">Annual Revenue</span>
                        <span className="text-xs font-black text-emerald-500">
                          {formatCurrency(totalRev)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-zinc-400 uppercase">Total Orders</span>
                        <span className="text-xs font-black text-amber-500">
                          {totalOrd.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-zinc-400 uppercase">Registrations</span>
                        <span className="text-xs font-black text-sky-500">
                          {totalReg.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Top Performing Vendors */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20' : 'bg-white border-zinc-200/90 shadow-sm'
            }`}>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">Partner Networks</span>
                <h3 className={`text-sm font-extrabold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Top Performing Vendors
                </h3>
              </div>

              {topVendorsGraph.length === 0 ? (
                <div className="py-16 text-center">
                  <Store className="mx-auto text-zinc-400 mb-2 opacity-50" size={32} />
                  <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    No Top Vendor Records Available
                  </p>
                </div>
              ) : (() => {
                const maxRevenue = Math.max(...topVendorsGraph.map(v => v.totalRevenue || 0), 1);
                return (
                  <div className="space-y-3">
                    {topVendorsGraph.slice(0, 4).map((item, idx) => {
                      const vendor = item.vendor || {};
                      const rev = item.totalRevenue || 0;
                      const ord = item.totalOrders || 0;
                      const pct = Math.min(Math.round((rev / maxRevenue) * 100), 100);

                      return (
                        <div 
                          key={vendor._id || idx} 
                          className={`p-3.5 rounded-xl border transition-all ${
                            isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                              {vendor.businessName || 'Vendor Store'}
                            </span>
                            <span className="text-xs font-black text-emerald-500">
                              {formatCurrency(rev)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1">
                            <span>{vendor.city || 'Store'}, {vendor.state || 'India'}</span>
                            <span>{ord} {ord === 1 ? 'order' : 'orders'}</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                            isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'
                          }`}>
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
