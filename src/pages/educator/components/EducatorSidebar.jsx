import React, { memo } from 'react';
import { Sliders, Video, User, LogOut, X, Landmark } from 'lucide-react';

const EducatorSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  isDarkMode,
  handleLogout
}) => {
  return (
    <>
      {/* Mobile Sidebar Back Drop Overlay */}
      <div 
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[1500] md:hidden transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-[opacity,backdrop-filter] ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Side Navigation */}
      <aside 
        className={`w-72 fixed md:static inset-y-0 left-0 z-[1600] flex flex-col justify-between
          transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]
          transform-gpu will-change-transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isDarkMode ? 'bg-zinc-950 border-r border-zinc-800' : 'bg-white border-r border-zinc-200'}
        `}
        style={{ 
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }}
      >
        {/* ── Brand Header ── */}
        <div className={`h-20 px-6 flex items-center justify-between border-b flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
              <span className="text-white text-sm font-black tracking-tight">FF</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-primary tracking-widest leading-none">FashionFever</p>
              <p className={`text-sm font-extrabold uppercase tracking-wide leading-tight mt-1 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                Educator Portal
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`md:hidden p-2 rounded-xl transition-all duration-[250ms] ${isDarkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Navigation Links ── */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group relative transform-gpu will-change-[transform,opacity] cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : `text-zinc-400 hover:text-zinc-100 hover:translate-x-0.5 ${isDarkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 hover:text-zinc-900 text-zinc-600'}`
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {activeTab === 'overview' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/70 rounded-full transition-all duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center transform-gpu" />
              )}
              <span className={`transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 ${activeTab === 'overview' ? 'text-white' : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Sliders size={18} />
              </span>
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('courses');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group relative transform-gpu will-change-[transform,opacity] cursor-pointer ${
                activeTab === 'courses' 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : `text-zinc-400 hover:text-zinc-100 hover:translate-x-0.5 ${isDarkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 hover:text-zinc-900 text-zinc-600'}`
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {activeTab === 'courses' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/70 rounded-full transition-all duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center transform-gpu" />
              )}
              <span className={`transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 ${activeTab === 'courses' ? 'text-white' : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Video size={18} />
              </span>
              <span>Manage Courses</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group relative transform-gpu will-change-[transform,opacity] cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : `text-zinc-400 hover:text-zinc-100 hover:translate-x-0.5 ${isDarkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 hover:text-zinc-900 text-zinc-600'}`
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {activeTab === 'profile' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/70 rounded-full transition-all duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center transform-gpu" />
              )}
              <span className={`transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 ${activeTab === 'profile' ? 'text-white' : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <User size={18} />
              </span>
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('payout');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group relative transform-gpu will-change-[transform,opacity] cursor-pointer ${
                activeTab === 'payout' 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : `text-zinc-400 hover:text-zinc-100 hover:translate-x-0.5 ${isDarkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 hover:text-zinc-900 text-zinc-600'}`
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {activeTab === 'payout' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/70 rounded-full transition-all duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-center transform-gpu" />
              )}
              <span className={`transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 ${activeTab === 'payout' ? 'text-white' : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Landmark size={18} />
              </span>
              <span>Bank Details</span>
            </button>
          </nav>
        </div>

        {/* Logout Section */}
        <div className={`p-5 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-[250ms] cursor-pointer group ${
              isDarkMode
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default memo(EducatorSidebar);
