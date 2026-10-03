import React, { useState } from 'react';
import {
  X, LayoutDashboard, Scissors, Calendar, UserCheck, LogOut, ChevronDown, Sparkles, Users, Clock, Wallet, ClipboardList, Landmark, Tag
} from 'lucide-react';

const ServiceProviderSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  isDarkMode,
  handleLogout
}) => {
  const NavItem = ({ id, label, icon }) => {
    const selected = activeTab === id;
    return (
      <button
        onClick={() => {
          setActiveTab(id);
          setIsSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group relative cursor-pointer text-left ${
          selected
            ? 'bg-primary text-white shadow-lg shadow-primary/25'
            : isDarkMode
            ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
        }`}
      >
        {selected && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/60 rounded-full" />
        )}
        <span className={`transition-transform duration-200 group-hover:scale-110 ${selected ? 'text-white' : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[1001] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[1002] w-72 flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          lg:sticky lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDarkMode
            ? 'bg-zinc-950 border-r border-zinc-800'
            : 'bg-white border-r border-zinc-200 shadow-xl shadow-zinc-200/60'
          }
        `}
      >
        <div className={`h-20 px-6 flex items-center justify-between border-b flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
              <span className="text-white text-xs font-black tracking-tight">SP</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-primary tracking-widest leading-none">FashionFever</p>
              <p className={`text-sm font-bold uppercase tracking-wide leading-tight mt-1 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                Service Provider
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`lg:hidden p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
          <p className={`text-xs font-bold uppercase tracking-widest px-3 mb-2 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Menu
          </p>
          <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={19} />} />
          <NavItem id="services" label="My Services" icon={<Scissors size={19} />} />
          <NavItem id="staff" label="Manage Staff" icon={<Users size={19} />} />
          <NavItem id="availability" label="Work Availability" icon={<Clock size={19} />} />
          <NavItem id="wallet" label="My Wallet" icon={<Wallet size={19} />} />
          <NavItem id="leads" label="Customer Leads" icon={<ClipboardList size={19} />} />
          <NavItem id="payout" label="Bank Details" icon={<Landmark size={19} />} />
          <NavItem id="coupons" label="My Coupons" icon={<Tag size={19} />} />
          <NavItem id="profile" label="Business Profile" icon={<UserCheck size={19} />} />
        </nav>

        <div className={`px-4 py-4 border-t flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group cursor-pointer ${
              isDarkMode
                ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                : 'text-rose-500 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            <LogOut size={19} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            Logout System
          </button>
        </div>
      </aside>
    </>
  );
};

export default ServiceProviderSidebar;
