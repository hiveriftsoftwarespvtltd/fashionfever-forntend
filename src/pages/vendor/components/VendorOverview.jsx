import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  CreditCard,
  Clock,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Store,
  Globe,
  MapPin
} from 'lucide-react';

const VendorOverview = ({
  isDarkMode,
  overviewLoading,
  overviewData,
  graphDays,
  setGraphDays,
  orderGraphLoading,
  orderGraphData,
  topProducts,
  topProductsLoading,
  topCategories,
  topCategoriesLoading,
  orderComparison,
  orderComparisonLoading,
  getImageUrl,
  formatCurrency,
  customerDemographics = [],
  customerDemographicsLoading,
  vendorWallet,
  walletLoading
}) => {
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

  const getVendorSvgChartPaths = () => {
    if (!orderGraphData || orderGraphData.length === 0) return { linePath: '', areaPath: '', points: [], maxVal: 10000, chartHeight: 160 };
    
    const maxVal = Math.max(...orderGraphData.map(item => item.revenue || item.totalRevenue || item.amount || 0), 1000);
    const chartHeight = 160;
    const chartWidth = 500;
    const paddingLeft = 60;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 40;
    
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    
    const points = orderGraphData.map((item, idx) => {
      const x = paddingLeft + (idx / Math.max(orderGraphData.length - 1, 1)) * usableWidth;
      const val = item.revenue || item.totalRevenue || item.amount || 0;
      const y = chartHeight - paddingBottom - (val / maxVal) * usableHeight;
      const date = item.date || item.day || item.label || 'N/A';
      const ordersCount = item.orders || item.totalOrders || item.count || 0;
      return { x, y, revenue: val, date, ordersCount };
    });
    
    const linePath = getCurvePath(points);
    
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const bottomY = chartHeight - paddingBottom;
    const areaPath = points.length > 0 ? `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z` : '';
    
    return { linePath, areaPath, points, maxVal, chartHeight };
  };

  const stats = [
    { 
      id: 'revenue',
      label: 'Total Revenue', 
      value: formatCurrency(overviewData?.totalRevenue || 0), 
      icon: <TrendingUp size={20} />, 
      change: 'Gross Inflow',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/10',
      glow: 'hover:shadow-emerald-500/10 hover:border-emerald-500/30',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    },
    { 
      id: 'grossProfit',
      label: 'Gross Profit', 
      value: formatCurrency(overviewData?.grossProfit || 0), 
      icon: <IndianRupee size={20} />, 
      change: 'Profit Scale',
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20 dark:border-cyan-500/10',
      glow: 'hover:shadow-cyan-500/10 hover:border-cyan-500/30',
      badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
    },
    { 
      id: 'netProfit',
      label: 'Net Profit', 
      value: formatCurrency(overviewData?.netProfit || 0), 
      icon: <CreditCard size={20} />, 
      change: 'Take Home',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 dark:border-indigo-500/10',
      glow: 'hover:shadow-indigo-500/10 hover:border-indigo-500/30',
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
    },
    { 
      id: 'pendingPayout',
      label: 'Pending Payout', 
      value: formatCurrency(vendorWallet?.pendingBalance !== undefined ? vendorWallet.pendingBalance : (overviewData?.pendingPayout || 0)), 
      icon: <Clock size={20} />, 
      change: 'In Wallet Pipeline',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 dark:border-amber-500/10',
      glow: 'hover:shadow-amber-500/10 hover:border-amber-500/30',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
    },
    { 
      id: 'totalOrders',
      label: 'Total Orders', 
      value: (overviewData?.totalOrders || 0).toLocaleString(), 
      icon: <ShoppingCart size={20} />, 
      change: 'Order Book',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 dark:border-blue-500/10',
      glow: 'hover:shadow-blue-500/10 hover:border-blue-500/30',
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
    },
    { 
      id: 'deliveredOrders',
      label: 'Delivered Orders', 
      value: (overviewData?.deliveredOrders || 0).toLocaleString(), 
      icon: <CheckCircle2 size={20} />, 
      change: 'Fulfilled',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/10',
      glow: 'hover:shadow-emerald-500/10 hover:border-emerald-500/30',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    },
    { 
      id: 'pendingOrders',
      label: 'Pending Orders', 
      value: (overviewData?.pendingOrders || 0).toLocaleString(), 
      icon: <Clock size={20} />, 
      change: 'Processing',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20 dark:border-purple-500/10',
      glow: 'hover:shadow-purple-500/10 hover:border-purple-500/30',
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
    },
    { 
      id: 'cancelledOrders',
      label: 'Cancelled Orders', 
      value: (overviewData?.cancelledOrders || 0).toLocaleString(), 
      icon: <XCircle size={20} />, 
      change: 'Voided',
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 dark:border-rose-500/10',
      glow: 'hover:shadow-rose-500/10 hover:border-rose-500/30',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Merchant Wallet Card Block */}
      <div className={`p-6 lg:p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden backdrop-blur-xl ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800 shadow-md' 
          : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase block mb-1">Financial Account</span>
            <h3 className="text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-100">Merchant Wallet Balance</h3>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase">
            Active Wallet Account
          </span>
        </div>
        
        {walletLoading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Updating wallet balance...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Usable Balance */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">Usable Wallet Balance</span>
              <span className="text-2xl font-black text-emerald-500">
                {formatCurrency(vendorWallet?.balance || 0)}
              </span>
            </div>
            {/* Pending Balance */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">Pending Wallet Balance</span>
              <span className="text-2xl font-black text-amber-500">
                {formatCurrency(vendorWallet?.pendingBalance || 0)}
              </span>
            </div>
            {/* Total Earnings */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">Lifetime Wallet Earnings</span>
              <span className="text-2xl font-black text-primary">
                {formatCurrency(vendorWallet?.totalEarnings || 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {overviewLoading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-100/30">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Hydrating Merchant Analytics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`p-5 lg:p-6 rounded-[28px] border transition-all duration-500 group relative overflow-hidden backdrop-blur-xl ${
                stat.glow
              } ${
                isDarkMode 
                  ? 'bg-gray-800/40 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]' 
                  : 'bg-white/60 border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]'
              }`}
            >
              {/* Ambient background glow bubble */}
              <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-10 transition-opacity duration-500 group-hover:opacity-20 ${
                stat.id === 'revenue' || stat.id === 'deliveredOrders' ? 'bg-emerald-500' :
                stat.id === 'grossProfit' ? 'bg-cyan-500' :
                stat.id === 'netProfit' ? 'bg-indigo-500' :
                stat.id === 'pendingPayout' ? 'bg-amber-500' :
                stat.id === 'totalOrders' ? 'bg-blue-500' :
                stat.id === 'pendingOrders' ? 'bg-purple-500' : 'bg-rose-500'
              }`} />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl transition-all duration-500 flex items-center justify-center border shadow-sm ${
                  isDarkMode 
                    ? `bg-gray-900/60 border-white/5 ${stat.color.split(' ')[0]}` 
                    : `${stat.color.split(' ').filter(c => !c.startsWith('dark:')).join(' ')}`
                }`}>
                  {stat.icon}
                </div>
                <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-lg border transition-all duration-300 ${stat.badge}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-1 relative z-10 text-gray-500 dark:text-gray-400">
                {stat.label}
              </h3>
              <p className="text-base lg:text-xl font-extrabold tracking-tight relative z-10 transition-colors duration-300 text-gray-800 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Symmetrical Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
        
        {/* Daily Order & Revenue Trend SVG Chart */}
        <div className={`p-6 lg:p-8 rounded-[32px] border text-left flex flex-col justify-between transition-all duration-300 lg:col-span-2 ${
          isDarkMode 
            ? 'bg-gray-800/40 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]' 
            : 'bg-white/60 border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]'
        } backdrop-blur-xl`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase block mb-1">Financial Trends</span>
              <h3 className="text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-100">
                Order & Revenue Trend
              </h3>
            </div>
            {/* Timeframe selector dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-400 uppercase">Range:</span>
              <select 
                value={graphDays} 
                onChange={(e) => setGraphDays(Number(e.target.value))}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all ${
                  isDarkMode 
                    ? 'bg-gray-900 border-white/10 text-white focus:ring-primary/20' 
                    : 'bg-gray-50 border-gray-100 text-gray-700 focus:ring-primary/10'
                }`}
              >
                <option value={10}>10 Days</option>
                <option value={15}>15 Days</option>
                <option value={20}>20 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
          </div>

          <div className="w-full relative overflow-hidden">
            {orderGraphLoading ? (
              <div className="h-[180px] flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Hydrating trend metrics...</p>
              </div>
            ) : orderGraphData.length === 0 ? (
              <div className="h-[180px] flex flex-col items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                No trend data available.
              </div>
            ) : (() => {
              const { linePath, areaPath, points, maxVal } = getVendorSvgChartPaths();
              return (
                <svg className="w-full h-auto max-h-[220px]" viewBox="0 0 500 160" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="vendor-chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#da016a" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#da016a" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="vendor-svg-neon-glow-primary" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Grid Y lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = 20 + ratio * 100;
                    const val = Math.round(maxVal * (1 - ratio));
                    return (
                      <g key={idx} className="opacity-15">
                        <line x1="60" y1={y} x2="460" y2={y} stroke={isDarkMode ? '#ffffff' : '#000000'} strokeDasharray="3,3" strokeWidth="1" />
                        <text x="15" y={y + 3} className={`text-xs font-bold fill-current ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          ₹{val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val}
                        </text>
                      </g>
                    );
                  })}

                  {/* X-axis date labels */}
                  {points.map((p, idx) => {
                    const showLabel = idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1;
                    if (!showLabel) return null;
                    return (
                      <text key={idx} x={p.x} y="145" textAnchor="middle" className={`text-xs font-bold opacity-75 fill-current ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {p.date}
                      </text>
                    );
                  })}

                  {/* Area Fill */}
                  {areaPath && (
                    <path d={areaPath} fill="url(#vendor-chart-area-grad)" />
                  )}

                  {/* Stroke Line */}
                  {linePath && (
                    <path d={linePath} fill="none" stroke="#da016a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#vendor-svg-neon-glow-primary)" />
                  )}

                  {/* Glowing dots at data points */}
                  {points.map((p, idx) => (
                    <g key={idx} className="group/dot cursor-pointer">
                      <circle cx={p.x} cy={p.y} r="4" className="fill-primary stroke-white dark:stroke-gray-800 transition-all duration-300 group-hover/dot:r-6" strokeWidth="1.5" />
                      <circle cx={p.x} cy={p.y} r="8" className="fill-primary/20 opacity-0 group-hover/dot:opacity-100 transition-all duration-300" />
                      <title>Date: {p.date} &#13;Revenue: ₹{p.revenue.toLocaleString()} &#13;Orders: {p.ordersCount}</title>
                    </g>
                  ))}
                </svg>
              );
            })()}
          </div>
        </div>

        {/* Top Selling Products List */}
        <div className={`p-6 lg:p-8 rounded-[32px] border text-left flex flex-col justify-between transition-all duration-300 lg:col-span-1 ${
          isDarkMode 
            ? 'bg-gray-800/40 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]' 
            : 'bg-white/60 border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]'
        } backdrop-blur-xl`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase block mb-1">Catalog Performance</span>
              <h3 className="text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-100">
                Top Products
              </h3>
            </div>
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase">
              {topProducts.length} Items
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            {topProductsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Loading product statistics...</p>
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                No selling analytics.
              </div>
            ) : (() => {
              const maxRevenue = Math.max(...topProducts.map(p => {
                const qty = p.totalQuantitySold || p.totalSold || p.quantitySold || p.quantity || p.unitsSold || 0;
                const price = p.product?.variants?.[0]?.salesPrice || p.salesPrice || p.price || 0;
                return p.totalRevenue || (qty * price) || 0;
              }), 1);

              return (
                <div className="space-y-4 font-bold max-h-[220px] overflow-y-auto pr-1">
                  {topProducts.map((item, idx) => {
                    const prod = item.product || {};
                    const name = item.productName || prod.name || item.name || 'Product';
                    const qty = item.totalQuantitySold || item.totalSold || item.quantitySold || item.quantity || item.unitsSold || 0;
                    const revenue = item.totalRevenue || 0;
                    const price = qty > 0 ? (revenue / qty) : (prod.variants?.[0]?.salesPrice || item.salesPrice || item.price || 0);
                    const percent = Math.min(Math.round((revenue / maxRevenue) * 100), 100);

                    const colors = [
                      { text: 'text-pink-500', bar: 'from-pink-400 to-pink-600 shadow-pink-500/20' },
                      { text: 'text-purple-500', bar: 'from-purple-400 to-purple-600 shadow-purple-500/20' },
                      { text: 'text-blue-500', bar: 'from-blue-400 to-blue-600 shadow-blue-500/20' },
                      { text: 'text-green-500', bar: 'from-green-400 to-green-600 shadow-green-500/20' }
                    ];
                    const design = colors[idx % colors.length];

                    const keyStr = item._id && typeof item._id === 'string' ? item._id : (prod._id || idx);

                    return (
                      <div key={keyStr} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 flex items-center justify-center font-bold text-sm bg-gray-50 dark:bg-gray-900 text-gray-400 flex-shrink-0">
                            {prod.variants?.[0]?.thumbnail ? (
                              <img src={getImageUrl(prod.variants[0].thumbnail)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs uppercase font-extrabold text-primary">{name.charAt(0) || 'P'}</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{name}</span>
                            <span className="text-xs font-medium text-zinc-400 truncate">{qty.toLocaleString()} sold • {formatCurrency(price)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-xs font-extrabold text-emerald-500">{formatCurrency(revenue)}</span>
                          <div className="w-16 h-1 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                            <div style={{ width: `${percent}%` }} className={`h-full bg-gradient-to-r ${design.bar} rounded-full transition-all duration-1000`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Symmetrical Top Categories and MoM Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">

        {/* Top Performing Categories Box */}
        <div className={`p-6 lg:p-8 rounded-[32px] border text-left flex flex-col justify-between transition-all duration-300 lg:col-span-2 ${
          isDarkMode 
            ? 'bg-gray-800/40 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]' 
            : 'bg-white/60 border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]'
        } backdrop-blur-xl`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase block mb-1">Inventory Performance</span>
              <h3 className="text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-100">
                Top Selling Categories
              </h3>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">
              {topCategories.length} Categories
            </span>
          </div>

          {topCategoriesLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Loading category analytics...</p>
            </div>
          ) : topCategories.length === 0 ? (
            <div className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-widest">
              No category distribution recorded.
            </div>
          ) : (() => {
            const maxSales = Math.max(...topCategories.map(c => c.totalSales || c.sales || c.revenue || 0), 1);
            const totalSales = topCategories.reduce((sum, item) => sum + (item.totalSales || item.sales || item.revenue || 0), 0) || 1;
            
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left: Progress bars list */}
                <div className="lg:col-span-2 space-y-6">
                  {topCategories.map((item, idx) => {
                    const cat = item.category || {};
                    const sales = item.totalSales || item.sales || item.revenue || 0;
                    const ordersCount = item.totalOrders || item.orders || item.count || 0;
                    const percent = Math.min(Math.round((sales / maxSales) * 100), 100);

                    const colors = [
                      { text: 'text-pink-500', bar: 'from-pink-400 to-pink-600 shadow-pink-500/20', bg: 'bg-pink-500' },
                      { text: 'text-purple-500', bar: 'from-purple-400 to-purple-600 shadow-purple-500/20', bg: 'bg-purple-500' },
                      { text: 'text-blue-500', bar: 'from-blue-400 to-blue-600 shadow-blue-500/20', bg: 'bg-blue-500' },
                      { text: 'text-green-500', bar: 'from-green-400 to-green-600 shadow-green-500/20', bg: 'bg-green-500' }
                    ];
                    const design = colors[idx % colors.length];

                    return (
                      <div key={cat._id && typeof cat._id === 'string' ? cat._id : idx} className="space-y-2 group/cat transition-all duration-300">
                        <div className="flex justify-between items-end text-xs font-bold uppercase">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${design.bg} block shadow-sm`}></span>
                            <span className={`font-black tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              {cat.name || item.name || 'Category'}
                            </span>
                            <span className={`text-xs lowercase font-semibold px-2 py-0.5 rounded-full ${
                              isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                            }`}>
                              {ordersCount} {ordersCount === 1 ? 'order' : 'orders'}
                            </span>
                          </div>
                          <span className={`${design.text} font-black text-right`}>
                            {formatCurrency(sales)}
                          </span>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          <div 
                            style={{ width: `${percent}%` }} 
                            className={`h-full bg-gradient-to-r ${design.bar} rounded-full transition-all duration-1000 shadow-md`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Proportion stack and share chips */}
                <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-white/5 pt-6 lg:pt-0 lg:pl-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-black text-gray-400 uppercase">Sales Proportion Stack</p>
                    <div className="w-full h-6 rounded-xl overflow-hidden flex shadow-inner border border-gray-100/10">
                      {topCategories.map((item, idx) => {
                        const sales = item.totalSales || item.sales || item.revenue || 0;
                        const pct = Math.round((sales / totalSales) * 100);
                        if (pct === 0) return null;

                        const colors = ['bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500'];
                        return (
                          <div 
                            key={idx} 
                            style={{ width: `${pct}%` }} 
                            className={`${colors[idx % colors.length]} transition-all duration-1000`} 
                            title={`${item.category?.name || item.name}: ${pct}%`} 
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <p className="text-sm font-black text-gray-400 uppercase">Proportional Share</p>
                    {topCategories.map((item, idx) => {
                      const sales = item.totalSales || item.sales || item.revenue || 0;
                      const pct = Math.round((sales / totalSales) * 100);

                      const colors = [
                        { text: 'text-pink-500', bg: 'bg-pink-500/10' },
                        { text: 'text-purple-500', bg: 'bg-purple-500/10' },
                        { text: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { text: 'text-green-500', bg: 'bg-green-500/10' }
                      ];
                      const design = colors[idx % colors.length];

                      return (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl border border-gray-100/50 dark:border-white/5 transition-all ${design.bg}`}>
                          <span className={`text-xs font-extrabold uppercase ${design.text}`}>
                            {item.category?.name || item.name || 'Category'}
                          </span>
                          <span className={`text-xs font-black ${design.text}`}>
                            {pct}% Share
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Month-over-Month Comparison Box */}
        <div className={`p-6 lg:p-8 rounded-[32px] border text-left flex flex-col justify-between transition-all duration-300 lg:col-span-1 ${
          isDarkMode 
            ? 'bg-gray-800/40 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]' 
            : 'bg-white/60 border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]'
        } backdrop-blur-xl`}>
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold text-primary uppercase block mb-1">Performance Metrics</span>
                <h3 className="text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-100">
                  MoM Growth Analysis
                </h3>
              </div>
              <span className="p-2 bg-primary/10 text-primary rounded-xl">
                <TrendingUp size={16} />
              </span>
            </div>

            {orderComparisonLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Hydrating comparison...</p>
              </div>
            ) : !orderComparison ? (
              <div className="text-center py-16 text-xs font-bold text-gray-400 uppercase tracking-widest">
                No comparison logs.
              </div>
            ) : (() => {
              const currentRev = orderComparison.currentMonth?.revenue || 0;
              const prevRev = orderComparison.previousMonth?.revenue || 0;
              const currentOrders = orderComparison.currentMonth?.totalOrders || 0;
              const prevOrders = orderComparison.previousMonth?.totalOrders || 0;

              const revDiff = currentRev - prevRev;
              const revPercent = prevRev > 0 ? ((revDiff / prevRev) * 100).toFixed(1) : (currentRev > 0 ? '100.0' : '0.0');
              const isRevPositive = revDiff >= 0;

              const orderDiff = currentOrders - prevOrders;
              const orderPercent = prevOrders > 0 ? ((orderDiff / prevOrders) * 100).toFixed(1) : (currentOrders > 0 ? '100.0' : '0.0');
              const isOrderPositive = orderDiff >= 0;

              const maxRev = Math.max(currentRev, prevRev, 1);
              const maxOrders = Math.max(currentOrders, prevOrders, 1);

              const currentRevPercent = Math.min(Math.round((currentRev / maxRev) * 100), 100);
              const prevRevPercent = Math.min(Math.round((prevRev / maxRev) * 100), 100);

              const currentOrderPercent = Math.min(Math.round((currentOrders / maxOrders) * 100), 100);
              const prevOrderPercent = Math.min(Math.round((prevOrders / maxOrders) * 100), 100);

              return (
                <div className="space-y-6">
                  
                  {/* Revenue Comparison section */}
                  <div className="space-y-3 p-4 rounded-2xl border border-gray-100/50 dark:border-white/5 bg-gray-50/20 dark:bg-gray-900/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-400 uppercase">Monthly Revenue</span>
                      <div className={`flex items-center gap-1 text-sm font-black uppercase px-2 py-0.5 rounded-full ${
                        isRevPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {isRevPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {isRevPositive ? '+' : ''}{revPercent}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Current Month */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm font-bold text-gray-600 dark:text-gray-300">
                          <span>Current Month</span>
                          <span className="font-extrabold text-primary">{formatCurrency(currentRev)}</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          <div 
                            style={{ width: `${currentRevPercent}%` }} 
                            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all duration-1000 shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Previous Month */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm font-bold text-gray-400">
                          <span>Previous Month</span>
                          <span className="font-extrabold">{formatCurrency(prevRev)}</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          <div 
                            style={{ width: `${prevRevPercent}%` }} 
                            className="h-full bg-gray-400 dark:bg-gray-700 rounded-full transition-all duration-1000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orders Comparison section */}
                  <div className="space-y-3 p-4 rounded-2xl border border-gray-100/50 dark:border-white/5 bg-gray-50/20 dark:bg-gray-900/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-400 uppercase">Monthly Orders</span>
                      <div className={`flex items-center gap-1 text-sm font-black uppercase px-2 py-0.5 rounded-full ${
                        isOrderPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {isOrderPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {isOrderPositive ? '+' : ''}{orderPercent}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Current Month */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm font-bold text-gray-600 dark:text-gray-300">
                          <span>Current Month</span>
                          <span className="font-extrabold text-blue-500">{currentOrders} {currentOrders === 1 ? 'order' : 'orders'}</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          <div 
                            style={{ width: `${currentOrderPercent}%` }} 
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Previous Month */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm font-bold text-gray-400">
                          <span>Previous Month</span>
                          <span className="font-extrabold">{prevOrders} {prevOrders === 1 ? 'order' : 'orders'}</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          <div 
                            style={{ width: `${prevOrderPercent}%` }} 
                            className="h-full bg-gray-400 dark:bg-gray-700 rounded-full transition-all duration-1000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary Insights */}
                  <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {isRevPositive 
                        ? `Revenue expanded by ₹${Math.abs(revDiff).toLocaleString()} MoM!` 
                        : `Revenue retracted by ₹${Math.abs(revDiff).toLocaleString()} MoM.`
                      }
                    </p>
                  </div>

                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Customer Demographics Section */}
      <div className="grid grid-cols-1 gap-6 text-left">
        <div className={`p-6 lg:p-8 rounded-[32px] border text-left flex flex-col justify-between transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/40 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]' 
            : 'bg-white/60 border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)]'
        } backdrop-blur-xl`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase block mb-1">Audience Distribution</span>
              <h3 className="text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-100">
                Customer Demographics
              </h3>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">
              {customerDemographics?.length || 0} Regions
            </span>
          </div>

          {customerDemographicsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Hydrating customer demographics...</p>
            </div>
          ) : !customerDemographics || customerDemographics.length === 0 ? (
            /* Premium Empty State Card */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-300 ${
                isDarkMode ? 'bg-gray-900 border-white/5 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}>
                <Globe size={28} className="animate-pulse" />
              </div>
              <h4 className={`text-sm font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Regional Data Yet</h4>
              <p className="text-xs font-medium text-gray-450 dark:text-gray-500 max-w-sm">
                When customers place orders from different cities and states, your demographic metrics and regional sales heatmaps will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Regional Stats Card / List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`text-sm font-bold uppercase tracking-wider border-b ${
                        isDarkMode ? 'border-white/5 text-gray-400' : 'border-gray-100 text-gray-500'
                      }`}>
                        <th className="pb-3 font-black">Region</th>
                        <th className="pb-3 font-black text-center">Customers</th>
                        <th className="pb-3 font-black text-center">Share</th>
                        <th className="pb-3 font-black text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50 dark:divide-white/5">
                      {customerDemographics.map((item, idx) => {
                        const stateVal = item.state || (item._id && typeof item._id === 'object' ? item._id.state : undefined);
                        const cityVal = item.city || (item._id && typeof item._id === 'object' ? item._id.city : undefined);
                        const regionVal = item.region || (item._id && typeof item._id === 'object' ? item._id.region : undefined);

                        let region = 'Unknown';
                        if (stateVal && cityVal) {
                          region = stateVal.toLowerCase() === cityVal.toLowerCase() ? stateVal : `${cityVal}, ${stateVal}`;
                        } else if (stateVal) {
                          region = stateVal;
                        } else if (cityVal) {
                          region = cityVal;
                        } else if (regionVal) {
                          region = regionVal;
                        } else if (item._id && typeof item._id === 'string') {
                          region = item._id;
                        }

                        const count = item.count || item.customers || item.totalCustomers || 0;
                        const percentage = item.percentage || item.share || (count > 0 ? ((count / customerDemographics.reduce((sum, d) => sum + (d.count || d.customers || 0), 0)) * 100).toFixed(1) : 0);
                        const revenue = item.revenue || item.sales || item.totalSales || 0;
                        return (
                          <tr key={idx} className="text-xs font-bold text-gray-755 dark:text-gray-200 hover:bg-gray-50/10 dark:hover:bg-white/5 transition-colors">
                            <td className="py-4 flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <MapPin size={14} />
                              </div>
                              <span className="font-extrabold uppercase tracking-wide">{region}</span>
                            </td>
                            <td className="py-4 text-center font-black">{count.toLocaleString()}</td>
                            <td className="py-4 text-center">
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-550 dark:text-blue-400 rounded-lg text-sm font-black">
                                {percentage}%
                              </span>
                            </td>
                            <td className="py-4 text-right font-black text-emerald-500">{formatCurrency(revenue)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Graphical representation / Progress map */}
              <div className={`p-6 rounded-[24px] border flex flex-col justify-between ${
                isDarkMode ? 'bg-gray-900/40 border-white/5' : 'bg-gray-50/50 border-gray-100'
              }`}>
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-gray-400">Regional Distribution Map</h4>
                  <div className="space-y-4">
                    {customerDemographics.slice(0, 4).map((item, idx) => {
                      const stateVal = item.state || (item._id && typeof item._id === 'object' ? item._id.state : undefined);
                      const cityVal = item.city || (item._id && typeof item._id === 'object' ? item._id.city : undefined);
                      const regionVal = item.region || (item._id && typeof item._id === 'object' ? item._id.region : undefined);

                      let region = 'Unknown';
                      if (stateVal && cityVal) {
                        region = stateVal.toLowerCase() === cityVal.toLowerCase() ? stateVal : `${cityVal}, ${stateVal}`;
                      } else if (stateVal) {
                        region = stateVal;
                      } else if (cityVal) {
                        region = cityVal;
                      } else if (regionVal) {
                        region = regionVal;
                      } else if (item._id && typeof item._id === 'string') {
                        region = item._id;
                      }

                      const count = item.count || item.customers || item.totalCustomers || 0;
                      const totalCustomers = customerDemographics.reduce((sum, d) => sum + (d.count || d.customers || 0), 0) || 1;
                      const percentage = item.percentage || item.share || Math.round((count / totalCustomers) * 100);
                      
                      const colors = [
                        { bar: 'from-pink-500 to-pink-600', text: 'text-pink-500' },
                        { bar: 'from-purple-500 to-purple-600', text: 'text-purple-500' },
                        { bar: 'from-blue-500 to-blue-600', text: 'text-blue-500' },
                        { bar: 'from-green-500 to-green-600', text: 'text-green-550' }
                      ];
                      const design = colors[idx % colors.length];

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm font-extrabold uppercase">
                            <span className="text-gray-650 dark:text-gray-300">{region}</span>
                            <span className={design.text}>{percentage}%</span>
                          </div>
                          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
                            <div 
                              style={{ width: `${percentage}%` }}
                              className={`h-full bg-gradient-to-r ${design.bar} rounded-full transition-all duration-1000`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`mt-6 p-4 rounded-2xl border text-center ${
                  isDarkMode ? 'bg-gray-950 border-white/5' : 'bg-white border-gray-100'
                }`}>
                  <p className="text-sm font-bold text-gray-400 uppercase">Top Region</p>
                  <p className="text-sm font-black text-primary uppercase mt-1">
                    {(() => {
                      const top = [...customerDemographics].sort((a, b) => {
                        const aVal = a.count || a.customers || 0;
                        const bVal = b.count || b.customers || 0;
                        return bVal - aVal;
                      })[0];
                      if (!top) return 'N/A';
                      
                      const stateVal = top.state || (top._id && typeof top._id === 'object' ? top._id.state : undefined);
                      const cityVal = top.city || (top._id && typeof top._id === 'object' ? top._id.city : undefined);
                      const regionVal = top.region || (top._id && typeof top._id === 'object' ? top._id.region : undefined);

                      if (stateVal && cityVal) {
                        return stateVal.toLowerCase() === cityVal.toLowerCase() ? stateVal : `${cityVal}, ${stateVal}`;
                      } else if (stateVal) {
                        return stateVal;
                      } else if (cityVal) {
                        return cityVal;
                      } else if (regionVal) {
                        return regionVal;
                      } else if (top._id && typeof top._id === 'string') {
                        return top._id;
                      }
                      return 'N/A';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default VendorOverview;
