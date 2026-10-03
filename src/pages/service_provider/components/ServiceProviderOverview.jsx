import React from 'react';
import {
  Briefcase, Calendar, TrendingUp, Sparkles, CheckCircle2, Crown, ShieldCheck, Clock, Tag
} from 'lucide-react';

const ServiceProviderOverview = ({ isDarkMode, user, services = [], bookings = [], servicesLoading = false }) => {
  // Compute metrics dynamically
  const activeServicesCount = services.length;
  const totalBookingsCount = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const activeBookingsCount = bookings.filter(b => b.status === 'Pending').length;
  
  // Calculate total earnings
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  // Stats cards configuration
  const stats = [
    {
      label: 'Total Earnings',
      value: `₹${totalEarnings.toLocaleString('en-IN')}`,
      subtext: 'From completed bookings',
      icon: <TrendingUp size={20} />,
      color: 'text-emerald-500',
      bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: isDarkMode ? 'border-emerald-500/20' : 'border-emerald-100',
    },
    {
      label: 'Active Bookings',
      value: activeBookingsCount,
      subtext: 'Scheduled appointments',
      icon: <Calendar size={20} />,
      color: 'text-primary',
      bg: isDarkMode ? 'bg-primary/10' : 'bg-pink-50',
      border: isDarkMode ? 'border-primary/20' : 'border-pink-100',
    },
    {
      label: 'My Services',
      value: servicesLoading ? '...' : activeServicesCount,
      subtext: 'Active in catalog',
      icon: <Briefcase size={20} />,
      color: 'text-blue-500',
      bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDarkMode ? 'border-blue-500/20' : 'border-blue-100',
    },
    {
      label: 'Total Bookings',
      value: totalBookingsCount,
      subtext: 'Overall customer orders',
      icon: <Sparkles size={20} />,
      color: 'text-purple-500',
      bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      border: isDarkMode ? 'border-purple-500/20' : 'border-purple-100',
    },
  ];

  // Dummy Active Subscription Details
  const subscription = {
    name: 'Premium Salon Pro',
    price: 999,
    commission: 10,
    maxServices: 25,
    maxStaff: 5,
    expiresAt: '2026-12-31',
    features: [
      'Priority support response',
      'Advanced client analytics & dashboard',
      'Featured business listing in customer search',
      'Zero lead generation hidden charges'
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden transition-all ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-white/5 shadow-2xl' 
          : 'bg-gradient-to-br from-white via-pink-50/10 to-white border-gray-100 shadow-xl shadow-gray-150/40'
      }`}>
        <div className="relative z-10 space-y-2">
          <span className="text-sm font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit block">
            Partner Portal
          </span>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {user?.name || 'Service Partner'}!
          </h1>
          <p className={`text-xs md:text-sm font-semibold max-w-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-555'}`}>
            Monitor your salon bookings, list new makeup/hair styling treatments, and optimize your weekly customer schedule.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-radial-gradient from-primary to-transparent pointer-events-none"></div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div 
            key={i} 
            className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] ${
              isDarkMode 
                ? 'bg-gray-900 border-white/5 shadow-md shadow-black/10' 
                : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {s.label}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} ${s.color} border ${s.border}`}>
                {s.icon}
              </div>
            </div>
            <p className={`text-2xl md:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {s.value}
            </p>
            <p className={`text-sm font-semibold uppercase mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {s.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Active Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Details Card */}
        <div className={`lg:col-span-2 p-6 md:p-8 rounded-3xl border flex flex-col justify-between ${
          isDarkMode 
            ? 'bg-zinc-900 border-zinc-800' 
            : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
                  Plan Details
                </span>
                <h3 className={`text-lg font-black uppercase ${isDarkMode ? 'text-white' : 'text-zinc-850'}`}>
                  Subscription Plan
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                <Crown size={15} />
                <span className="text-sm font-black uppercase tracking-wider">{subscription.name}</span>
              </div>
            </div>

            <div className={`h-[1px] ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`} />

            <div className="grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">Monthly Cost</p>
                <p className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>₹{subscription.price}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">Platform Fee</p>
                <p className={`text-base font-black text-primary`}>{subscription.commission}%</p>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">Expiry Date</p>
                <p className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>{subscription.expiresAt}</p>
              </div>
            </div>

            <div className={`h-[1px] ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`} />

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-650'}`}>
                  Max Catalog Services: <strong className="text-primary">{subscription.maxServices}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-650'}`}>
                  Max Staff Logins: <strong className="text-primary">{subscription.maxStaff}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Features Card */}
        <div className={`p-6 md:p-8 rounded-3xl border ${
          isDarkMode 
            ? 'bg-gray-900 border-white/5' 
            : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Included Plan Perks
          </h4>
          <ul className="space-y-3">
            {subscription.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-left">
                <ShieldCheck size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-650'}`}>
                  {feat}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Services Catalog List */}
      <div className={`p-6 md:p-8 rounded-3xl border text-left ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800' 
          : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
              Catalog Registry
            </span>
            <h3 className={`text-lg font-black uppercase ${isDarkMode ? 'text-white' : 'text-zinc-855'}`}>
              My Services Catalog
            </h3>
          </div>
          <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase">
            {services.length} {services.length === 1 ? 'Service' : 'Services'}
          </span>
        </div>

        {servicesLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Loading Catalog Services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
              No services found in your catalog.
            </p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Once you list services on the platform, they will appear here with active pricing, description, and status.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const serviceImg = service.images?.[0]?.url;
              return (
                <div 
                  key={service._id} 
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.01] ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700' 
                      : 'bg-zinc-50 border-zinc-200 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {/* Service Image / Fallback */}
                  <div className="h-40 relative w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                    {serviceImg ? (
                      <img 
                        src={serviceImg} 
                        alt={service.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                        {service.title?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Service Type Tag */}
                    <span className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                      {service.serviceType || 'BOTH'}
                    </span>
                  </div>

                  {/* Service Details */}
                  <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className={`text-sm font-black truncate uppercase ${isDarkMode ? 'text-white' : 'text-zinc-805'}`}>
                        {service.title}
                      </h4>
                      <p className={`text-xs font-medium line-clamp-2 h-8 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {service.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className={`h-[1px] ${isDarkMode ? 'bg-white/5' : 'bg-gray-200/60'}`} />

                      {/* Pricing and Duration */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-400 font-semibold">
                          <Clock size={12} />
                          <span>{service.durationMinutes} Mins</span>
                        </div>
                        <div className="flex items-end gap-1.5">
                          {service.costPrice > (service.offeredPrice || service.sellingPrice) && (
                            <span className="text-sm text-gray-450 line-through font-semibold">
                              ₹{service.costPrice}
                            </span>
                          )}
                          <span className="text-sm font-black text-primary">
                            ₹{service.offeredPrice || service.sellingPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceProviderOverview;
