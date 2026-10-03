import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  IndianRupee,
  Store,
  LogOut,
  X,
  Wallet,
  Landmark,
  Zap,
  Bike,
  LifeBuoy
} from 'lucide-react';

import { useTheme } from '../../../context/ThemeContext';

const VendorSidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, vendorData, handleLogout }) => {
  const { isDarkMode } = useTheme();
  const navItems = [
    { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Overview' },
    { id: 'products', icon: <Package size={18} />, label: 'Products' },
    { id: 'orders', icon: <ShoppingCart size={18} />, label: 'Orders' },
    { id: 'riders', icon: <Bike size={18} />, label: 'Delivery Riders' },
    { id: 'tickets', icon: <LifeBuoy size={18} />, label: 'Support Tickets' },
    { id: 'quickcommerce', icon: <Zap size={18} />, label: '⚡ Quick Commerce' },
    { id: 'earnings', icon: <IndianRupee size={18} />, label: 'Earnings' },
    { id: 'wallet', icon: <Wallet size={18} />, label: 'Wallet Ledger' },
    { id: 'payout', icon: <Landmark size={18} />, label: 'Bank Details' },
    { id: 'profile', icon: <Store size={18} />, label: 'Store Profile' }
  ];

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 inset-y-0 left-0 w-72 h-screen z-[101] 
        flex flex-col transition-transform duration-300 border-r flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50'}
      `}>
        {/* Brand / Store Header */}
        <div className={`h-20 px-6 border-b flex items-center justify-between flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
              <span className="text-white text-xs font-black tracking-tight">VF</span>
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-black text-primary uppercase tracking-widest leading-none truncate">
                {vendorData?.businessName || 'FashionFever'}
              </span>
              <span className={`text-sm font-extrabold uppercase tracking-wider block mt-1 whitespace-nowrap ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                Vendor Dashboard
              </span>
            </div>
          </div>
          <button className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="text-xs font-bold uppercase tracking-wider px-3 mb-2 text-zinc-400 text-left">
            Menu Navigation
          </p>
          {navItems.map((item) => {
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold tracking-normal transition-all duration-[200ms] cursor-pointer group relative ${
                  selected 
                    ? 'bg-primary text-white shadow-md shadow-primary/25 font-bold' 
                    : isDarkMode
                    ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white hover:translate-x-0.5'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 hover:translate-x-0.5'
                }`}
              >
                <span className={`transition-transform duration-[200ms] group-hover:scale-105 flex-shrink-0 ${selected ? 'text-white' : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className={`p-4 border-t flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-normal transition-all duration-[200ms] group cursor-pointer ${
              isDarkMode 
                ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300' 
                : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform duration-[200ms]" /> Logout Portal
          </button>
        </div>
      </aside>
    </>
  );
};

export default VendorSidebar;
