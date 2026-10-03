import React, { useState, memo, useCallback } from 'react';
import {
  X, LayoutDashboard, Users, Store, CircleAlert, TrendingUp,
  TicketPercent, LogOut, Sparkles, Grid, ShoppingBag, Package,
  Percent, IndianRupee, ChevronDown, CreditCard, Layers, Briefcase, Image, BookOpen, Wallet, ShieldCheck, User, Bell, ClipboardList, Landmark
} from 'lucide-react';

// ==========================================
// OPTIMIZATION: Memoized NavItem Component
// Prevents re-renders and handles smooth transform-gpu scale,
// active color shift, and active indicator animations.
// ==========================================
const NavItem = memo(({ id, label, icon, onClick, activeTab, isDarkMode }) => {
  const selected = activeTab === id;
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold tracking-normal transition-all duration-[200ms] group relative transform-gpu cursor-pointer ${
        selected
          ? 'bg-primary text-white shadow-md shadow-primary/25 font-bold'
          : isDarkMode
          ? 'text-zinc-200 hover:bg-zinc-900 hover:text-white hover:translate-x-0.5'
          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 hover:translate-x-0.5'
      }`}
      style={{ backfaceVisibility: 'hidden' }}
    >
      {/* Active left indicator bar with smooth height and scale transition */}
      <span 
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-full transition-all duration-[250ms] origin-center transform-gpu ${
          selected ? 'h-5 opacity-100 scale-y-100' : 'h-0 opacity-0 scale-y-0'
        }`}
      />
      <span className={`transition-transform duration-[200ms] group-hover:scale-105 flex-shrink-0 ${selected ? 'text-white' : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
});

NavItem.displayName = 'NavItem';

const SubNavItem = memo(({ id, label, icon, activeTab, isDarkMode, onClick }) => {
  const selected = activeTab === id;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold tracking-normal transition-all duration-[200ms] transform-gpu hover:translate-x-0.5 cursor-pointer ${
        selected
          ? isDarkMode
            ? 'bg-primary/20 text-pink-400 font-bold border border-primary/30'
            : 'bg-primary/10 text-primary font-bold border border-primary/20'
          : isDarkMode
          ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
      style={{ backfaceVisibility: 'hidden' }}
    >
      <span className={`transition-transform duration-[200ms] flex-shrink-0 ${selected ? (isDarkMode ? 'text-pink-400' : 'text-primary') : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
});

SubNavItem.displayName = 'SubNavItem';

const GroupHeader = memo(({ groupKey, isActive, icon, label, children, isDarkMode, isOpen, onToggle }) => {
  return (
    <div className="space-y-0.5 transform-gpu">
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold tracking-normal transition-all duration-[200ms] group transform-gpu hover:translate-x-0.5 cursor-pointer ${
          isActive
            ? isDarkMode ? 'bg-primary/15 text-pink-400 font-bold' : 'bg-primary/10 text-primary font-bold'
            : isDarkMode
            ? 'text-zinc-200 hover:bg-zinc-900 hover:text-white'
            : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
        }`}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <span className={`transition-transform duration-[200ms] group-hover:scale-105 flex-shrink-0 ${isActive ? (isDarkMode ? 'text-pink-400' : 'text-primary') : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {icon}
        </span>
        <span className="truncate flex-1 text-left">{label}</span>
        <ChevronDown
          size={15}
          className={`transition-transform duration-[250ms] flex-shrink-0 ${isOpen ? 'rotate-180' : ''} ${isActive ? (isDarkMode ? 'text-pink-400' : 'text-primary') : isDarkMode ? 'text-zinc-400' : 'text-zinc-400'}`}
        />
      </button>

      {/* Collapsible Container */}
      <div
        style={{
          maxHeight: isOpen ? '240px' : '0px',
          opacity: isOpen ? 1 : 0,
          paddingTop: isOpen ? '4px' : '0px',
          paddingBottom: isOpen ? '4px' : '0px',
          transition: 'max-height 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), padding 300ms cubic-bezier(0.22, 1, 0.36, 1)',
          overflow: 'hidden'
        }}
        className="transform-gpu"
      >
        <div className={`ml-3 pl-2.5 border-l space-y-0.5 py-0.5 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          {children}
        </div>
      </div>
    </div>
  );
});

GroupHeader.displayName = 'GroupHeader';

const AdminSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  isDarkMode,
  handleLogout,
  role,
  adminAccess = [],
  isSuperAdmin = false
}) => {
  // Access check helper based on granular permissions list
  const hasAccess = (moduleName) => {
    if (isSuperAdmin) return true;
    return adminAccess.some(item => item.module === moduleName);
  };

  // Group visibility calculations
  const showPeopleSection = hasAccess('USERS') || hasAccess('SERVICE_PROVIDERS') || hasAccess('COURSES') || hasAccess('VENDORS') || hasAccess('INFLUENCERS') || isSuperAdmin;
  const showCatalogSection = hasAccess('COURSES') || hasAccess('VENDORS') || hasAccess('INFLUENCERS') || hasAccess('SERVICE_PROVIDERS');
  const showOperationsSection = hasAccess('VENDORS') || hasAccess('SERVICE_PROVIDERS') || hasAccess('HOME_CONTENT') || hasAccess('FINANCE') || hasAccess('TICKETS') || hasAccess('USERS') || hasAccess('NOTIFICATION');

  // Collapsible dropdown group state
  const [openGroups, setOpenGroups] = useState(() => {
    const isInfluencer = ['influencers', 'commission-slabs', 'influencer-commissions', 'affiliate-dashboard'].includes(activeTab);
    const isVendor = ['vendors', 'vendor-payouts', 'pending'].includes(activeTab);
    return { influencers: isInfluencer, vendors: isVendor };
  });

  // OPTIMIZATION: Memoized state updater to prevent layout shifts
  const toggleGroup = useCallback((key) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isInfluencerTabActive = ['influencers', 'commission-slabs', 'influencer-commissions', 'affiliate-dashboard'].includes(activeTab);
  const isVendorTabActive = ['vendors', 'vendor-payouts', 'pending'].includes(activeTab);

  // OPTIMIZATION: Callback wrappers to avoid inline function instances
  const handleItemClick = useCallback((id) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  }, [setActiveTab, setIsSidebarOpen]);

  const handleToggleInfluencer = useCallback(() => toggleGroup('influencers'), [toggleGroup]);
  const handleToggleVendors = useCallback(() => toggleGroup('vendors'), [toggleGroup]);
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), [setIsSidebarOpen]);

  return (
    <>
      {/* 
        OPTIMIZATION: Fade-in / Fade-out backdrop with backdrop-blur transition.
        Replaces hard mounting with opacity/filter transitions to avoid lag and shifts.
      */}
      <div
        className={`fixed inset-0 z-[1001] bg-black/40 backdrop-blur-sm lg:hidden transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-[opacity,backdrop-filter] ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseSidebar}
      />

      {/* 
        OPTIMIZATION: GPU Accelerated aside container.
        Using Translate3d (via transform-gpu), cubic-bezier easing, and will-change: transform.
      */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[1002] w-72 flex flex-col h-screen
          lg:sticky lg:translate-x-0
          transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]
          transform-gpu will-change-transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDarkMode
            ? 'bg-zinc-950 border-r border-zinc-800'
            : 'bg-white border-r border-zinc-200 shadow-xl shadow-zinc-200/50'
          }
        `}
        style={{ 
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }}
      >
        {/* ── Brand Header ── */}
        <div className={`h-20 px-5 flex items-center justify-between border-b flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
              <span className="text-white text-xs font-black tracking-tight">FF</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-primary tracking-widest leading-none">FashionFever</p>
              <p className={`text-sm font-extrabold uppercase tracking-wider leading-tight mt-0.5 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                Admin Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseSidebar}
            className={`lg:hidden p-2 rounded-xl transition-all duration-[250ms] ${isDarkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 scrollbar-thin scroll-smooth">

          {/* Overview */}
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider px-3 mb-2 text-zinc-400">
              Overview
            </p>
            {hasAccess('DASHBOARD') && (
              <NavItem 
                id="dashboard" 
                label="Dashboard" 
                icon={<LayoutDashboard size={17} />} 
                onClick={() => handleItemClick('dashboard')}
                activeTab={activeTab}
                isDarkMode={isDarkMode}
              />
            )}
            <NavItem 
                id="profile" 
                label="My Profile" 
                icon={<User size={17} />} 
                onClick={() => handleItemClick('profile')}
                activeTab={activeTab}
                isDarkMode={isDarkMode}
            />
          </div>

          {/* People */}
          {showPeopleSection && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider px-3 mb-2 text-zinc-400">
                People
              </p>
              <div className="space-y-0.5">
                {hasAccess('USERS') && (
                  <NavItem 
                    id="users" 
                    label="User Management" 
                    icon={<Users size={16} />} 
                    onClick={() => handleItemClick('users')}
                    activeTab={activeTab}
                    isDarkMode={isDarkMode}
                  />
                )}
                {hasAccess('SERVICE_PROVIDERS') && (
                  <NavItem 
                    id="service-providers" 
                    label="Service Providers" 
                    icon={<Briefcase size={16} />} 
                    onClick={() => handleItemClick('service-providers')}
                    activeTab={activeTab}
                    isDarkMode={isDarkMode}
                  />
                )}
                {hasAccess('COURSES') && (
                  <>
                    <NavItem 
                      id="educators" 
                      label="Educator Approvals" 
                      icon={<BookOpen size={16} />} 
                      onClick={() => handleItemClick('educators')}
                      activeTab={activeTab}
                      isDarkMode={isDarkMode}
                    />
                    <NavItem 
                      id="all-educators" 
                      label="Educator Directory" 
                      icon={<BookOpen size={16} />} 
                      onClick={() => handleItemClick('all-educators')}
                      activeTab={activeTab}
                      isDarkMode={isDarkMode}
                    />
                  </>
                )}
                {isSuperAdmin && (
                  <NavItem 
                    id="sub-admins" 
                    label="Sub-Admins" 
                    icon={<ShieldCheck size={16} />} 
                    onClick={() => handleItemClick('sub-admins')}
                    activeTab={activeTab}
                    isDarkMode={isDarkMode}
                  />
                )}

                {/* Vendors Group */}
                {hasAccess('VENDORS') && (
                  <GroupHeader
                    groupKey="vendors"
                    isActive={isVendorTabActive}
                    icon={<Store size={16} />}
                    label="Vendor Control"
                    isDarkMode={isDarkMode}
                    isOpen={openGroups.vendors}
                    onToggle={handleToggleVendors}
                  >
                    <SubNavItem id="vendors" label="Vendor List" icon={<Store size={13} />} activeTab={activeTab} isDarkMode={isDarkMode} onClick={() => handleItemClick('vendors')} />
                    <SubNavItem id="pending" label="Pending Approvals" icon={<CircleAlert size={13} />} activeTab={activeTab} isDarkMode={isDarkMode} onClick={() => handleItemClick('pending')} />
                    <SubNavItem id="vendor-payouts" label="Vendor Payouts" icon={<IndianRupee size={13} />} activeTab={activeTab} isDarkMode={isDarkMode} onClick={() => handleItemClick('vendor-payouts')} />
                  </GroupHeader>
                )}

                {/* Influencers Group */}
                {hasAccess('INFLUENCERS') && (
                  <GroupHeader
                    groupKey="influencers"
                    isActive={isInfluencerTabActive}
                    icon={<TrendingUp size={16} />}
                    label="Influencer Hub"
                    isDarkMode={isDarkMode}
                    isOpen={openGroups.influencers}
                    onToggle={handleToggleInfluencer}
                  >
                    <SubNavItem id="affiliate-dashboard" label="Affiliate Performance" icon={<LayoutDashboard size={13} />} activeTab={activeTab} isDarkMode={isDarkMode} onClick={() => handleItemClick('affiliate-dashboard')} />
                    <SubNavItem id="influencers" label="Influencer List" icon={<Users size={13} />} activeTab={activeTab} isDarkMode={isDarkMode} onClick={() => handleItemClick('influencers')} />
                    <SubNavItem id="commission-slabs" label="Commission Slabs" icon={<Percent size={13} />} activeTab={activeTab} isDarkMode={isDarkMode} onClick={() => handleItemClick('commission-slabs')} />
                    <SubNavItem id="influencer-commissions" label="Commissions & Payouts" icon={<IndianRupee size={13} />} activeTab={activeTab} isDarkMode={isDarkMode} onClick={() => handleItemClick('influencer-commissions')} />
                  </GroupHeader>
                )}
              </div>
            </div>
          )}

          {/* Catalog */}
          {showCatalogSection && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider px-3 mb-2 text-zinc-400">
                Catalog
              </p>
              <div className="space-y-0.5">
                {(hasAccess('COURSES') || hasAccess('VENDORS')) && (
                  <NavItem id="categories" label="Categories" icon={<Grid size={17} />} onClick={() => handleItemClick('categories')} activeTab={activeTab} isDarkMode={isDarkMode} />
                )}
                {hasAccess('COURSES') && (
                  <NavItem id="course-categories" label="Course Categories" icon={<BookOpen size={17} />} onClick={() => handleItemClick('course-categories')} activeTab={activeTab} isDarkMode={isDarkMode} />
                )}
                {hasAccess('VENDORS') && (
                  <NavItem id="products" label="Products" icon={<Package size={17} />} onClick={() => handleItemClick('products')} activeTab={activeTab} isDarkMode={isDarkMode} />
                )}
                {hasAccess('INFLUENCERS') && (
                  <NavItem id="coupons" label="Coupons" icon={<TicketPercent size={17} />} onClick={() => handleItemClick('coupons')} activeTab={activeTab} isDarkMode={isDarkMode} />
                )}
                {hasAccess('SERVICE_PROVIDERS') && (
                  <NavItem id="subscription-plans" label="Beauty Services" icon={<Sparkles size={17} />} onClick={() => handleItemClick('subscription-plans')} activeTab={activeTab} isDarkMode={isDarkMode} />
                )}
              </div>
            </div>
          )}

          {/* Operations */}
          {showOperationsSection && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider px-3 mb-2 text-zinc-400">
                Operations
              </p>
              <div className="space-y-0.5">
                {(hasAccess('VENDORS') || hasAccess('SERVICE_PROVIDERS')) && (
                  <NavItem id="orders" label="Orders Manager" icon={<ShoppingBag size={17} />} onClick={() => handleItemClick('orders')} activeTab={activeTab} isDarkMode={isDarkMode} />
                )}
                {hasAccess('SERVICE_PROVIDERS') && (
                  <>
                    <NavItem id="beauty-services" label="Services Subscription" icon={<CreditCard size={17} />} onClick={() => handleItemClick('beauty-services')} activeTab={activeTab} isDarkMode={isDarkMode} />
                    <NavItem id="service-categories" label="Service Categories" icon={<Layers size={17} />} onClick={() => handleItemClick('service-categories')} activeTab={activeTab} isDarkMode={isDarkMode} />
                    <NavItem id="admin-service-leads" label="Service Leads" icon={<ClipboardList size={17} />} onClick={() => handleItemClick('admin-service-leads')} activeTab={activeTab} isDarkMode={isDarkMode} />
                  </>
                )}
                {hasAccess('HOME_CONTENT') && (
                  <>
                    <NavItem id="home-content" label="Home Content" icon={<Image size={17} />} onClick={() => handleItemClick('home-content')} activeTab={activeTab} isDarkMode={isDarkMode} />
                    <NavItem id="home-booking-cards" label="Home Booking Cards" icon={<Sparkles size={17} />} onClick={() => handleItemClick('home-booking-cards')} activeTab={activeTab} isDarkMode={isDarkMode} />
                  </>
                )}
                {(hasAccess('FINANCE') || hasAccess('USERS')) && (
                  <NavItem id="cashback-slabs" label="Cashback Slabs" icon={<Percent size={17} />} onClick={() => handleItemClick('cashback-slabs')} activeTab={activeTab} isDarkMode={isDarkMode} />
                )}
                {hasAccess('FINANCE') && (
                  <>
                    <NavItem id="wallet-balances" label="Wallet Balances" icon={<Wallet size={17} />} onClick={() => handleItemClick('wallet-balances')} activeTab={activeTab} isDarkMode={isDarkMode} />
                    <NavItem id="bank-accounts" label="Bank Accounts" icon={<Landmark size={17} />} onClick={() => handleItemClick('bank-accounts')} activeTab={activeTab} isDarkMode={isDarkMode} />
                  </>
                )}
                {hasAccess('TICKETS') && (
                  <NavItem id="tickets" label="Support Tickets" icon={<CircleAlert size={17} />} onClick={() => handleItemClick('tickets')} activeTab={activeTab} isDarkMode={isDarkMode} />
                )}
                {hasAccess('NOTIFICATION') && (
                  <NavItem id="notifications" label="Notifications Manager" icon={<Bell size={17} />} onClick={() => handleItemClick('notifications')} activeTab={activeTab} isDarkMode={isDarkMode} />
                )}
              </div>
            </div>
          )}
        </nav>

        {/* ── Logout Footer ── */}
        <div className={`px-3 py-4 border-t flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-normal transition-all duration-[200ms] group cursor-pointer ${
              isDarkMode
                ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform duration-[200ms]" />
            Logout System
          </button>
        </div>
      </aside>
    </>
  );
};

export default memo(AdminSidebar);
