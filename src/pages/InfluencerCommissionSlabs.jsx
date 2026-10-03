import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Percent, 
  IndianRupee, 
  HelpCircle, 
  Loader2,
  LayoutDashboard,
  Share2,
  PlusCircle,
  Briefcase,
  Wallet,
  Users,
  Menu,
  X,
  Sun,
  Moon,
  Landmark
} from 'lucide-react';
import { getAllInfluencerCommissionSlabs } from '../api/adminService';
import { useTheme } from '../context/ThemeContext';

const InfluencerCommissionSlabs = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchSlabs = async () => {
      try {
        const response = await getAllInfluencerCommissionSlabs();
        if (response.success) {
          const list = response.data?.data || response.data || [];
          // Only show active slabs
          const activeSlabs = list.filter(s => s.isActive !== false);
          // Sort by sales target minSales ascending
          activeSlabs.sort((a, b) => a.minSales - b.minSales);
          setSlabs(activeSlabs);
        }
      } catch (err) {
        console.error("Failed to load commission slabs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlabs();
  }, []);

  return (
    <div className={`flex h-screen overflow-hidden font-outfit transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 w-72 z-[101] 
        flex flex-col transition-transform duration-300 transform border-r
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}
      `}>
        <div className={`h-20 px-6 border-b flex items-center justify-between ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-black text-primary uppercase tracking-widest leading-none">
              FashionFever Creator
            </span>
            <span className={`text-sm font-bold uppercase tracking-wide block mt-1.5 whitespace-nowrap ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
              Influencer Dashboard
            </span>
          </div>
          <button className="lg:hidden text-zinc-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => { navigate('/influencer/dashboard?tab=dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            } cursor-pointer`}
          >
            <LayoutDashboard size={19} /> Dashboard
          </button>
          <button 
            onClick={() => { navigate('/influencer/dashboard?tab=affiliate'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            } cursor-pointer`}
          >
            <Share2 size={19} /> Affiliate Network
          </button>
          <button 
            onClick={() => { navigate('/influencer/dashboard?tab=submit-story'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            } cursor-pointer`}
          >
            <PlusCircle size={19} /> Submit Story
          </button>
          <button 
            onClick={() => { navigate('/influencer/dashboard?tab=tasks'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            } cursor-pointer`}
          >
            <Briefcase size={19} /> My Tasks
          </button>
          <button 
            onClick={() => { navigate('/influencer/commission-slabs'); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left bg-primary text-white shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Percent size={19} /> Commission Slabs
          </button>
          <button 
            onClick={() => { navigate('/influencer/dashboard?tab=wallet'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            } cursor-pointer`}
          >
            <Wallet size={19} /> My Wallet
          </button>
          <button 
            onClick={() => { navigate('/influencer/dashboard?tab=payout'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            } cursor-pointer`}
          >
            <Landmark size={19} /> Bank Details
          </button>
          <button 
            onClick={() => { navigate('/influencer/dashboard?tab=audience'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              isDarkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            } cursor-pointer`}
          >
            <Users size={19} /> Audience
          </button>
        </nav>
        
        {/* Footer/Logout button in sidebar */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isDarkMode 
                ? 'text-rose-400 hover:bg-rose-500/10' 
                : 'text-rose-500 hover:bg-rose-50'
            } cursor-pointer`}
          >
            <X size={19} /> Back to Home
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto">
        
        {/* Header */}
        <header className={`h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b sticky top-0 z-40 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-zinc-950/85 border-zinc-800 backdrop-blur text-white' 
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}>
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <button 
              className={`lg:hidden p-2 rounded-xl transition-all border ${
                isDarkMode ? 'text-zinc-400 hover:bg-zinc-800 border-zinc-800' : 'text-zinc-600 hover:bg-zinc-100 border-zinc-200'
              }`} 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
             <h1 className={`text-lg lg:text-xl font-bold capitalize ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
               Commission Slabs
             </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-xl transition-all border ${
                isDarkMode ? 'bg-white/5 text-primary border-white/5 shadow-xl shadow-primary/10' : 'bg-gray-50 text-primary border-transparent hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className={`p-4 lg:p-8 space-y-8 flex-grow transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
          {/* Back navigation & Header inside container */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/influencer/dashboard')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
                  isDarkMode ? 'bg-gray-900 border-white/5 text-gray-400 hover:text-white' : 'bg-white border-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                 <h2 className="text-xl font-bold tracking-wide">Tiers & Commission Rates</h2>
                <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-450'}`}>
                  See commission targets and earn tiers
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <span className="bg-primary/10 text-primary px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider">
                Earn up to 20% commission
              </span>
            </div>
          </div>

          {/* Info Card */}
          <div className={`p-6 rounded-[2rem] border flex flex-col md:flex-row gap-6 items-start md:items-center transition-colors ${
            isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <HelpCircle className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm">How Commission Slabs Work</h3>
              <p className={`text-xs font-medium mt-1 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Your commission is calculated dynamically each month based on the total referral sales you generate. Reaching higher sales volumes automatically unlocks elevated commission percentages for all sales within that tier.
              </p>
            </div>
          </div>

          {/* Slabs Display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs font-bold text-gray-400">Fetching commission tiers...</p>
            </div>
          ) : slabs.length === 0 ? (
            <div className={`p-12 text-center rounded-[2rem] border ${
              isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'
            }`}>
              <Percent size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-400">No commission slabs defined yet</p>
              <p className="text-xs text-gray-500 mt-1">Check back later for updated targets</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {slabs.map((slab, i) => (
                <div 
                  key={slab._id || i}
                  className={`group rounded-[2.2rem] border p-8 flex flex-col justify-between hover:border-primary/30 transition-all duration-500 relative overflow-hidden ${
                    isDarkMode 
                      ? 'bg-gray-900 border-white/5 hover:shadow-2xl hover:shadow-primary/5' 
                      : 'bg-white border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5'
                  }`}
                >
                  {/* Visual Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-primary/10 rounded-2xl text-primary font-bold text-xl">
                        {slab.commissionRate}%
                      </div>
                      <span className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        i === 0
                          ? (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-550')
                          : i === slabs.length - 1
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            : 'bg-primary/5 text-primary'
                      }`}>
                        {i === 0 ? 'Base Tier' : i === slabs.length - 1 ? 'Elite Tier' : `Tier ${i + 1}`}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-gray-400 mb-2">Monthly Sales Target</h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-bold text-xl">
                        <IndianRupee size={16} className="text-primary/70" />
                        <span>{slab.minSales?.toLocaleString('en-IN')}</span>
                        <span className="text-gray-400 font-bold mx-1 text-sm">to</span>
                        {slab.maxSales === 999999999 || !slab.maxSales ? (
                          <span className="text-sm font-bold text-gray-400">Unlimited</span>
                        ) : (
                          <span>{slab.maxSales?.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`mt-8 pt-6 border-t text-sm font-bold ${isDarkMode ? 'border-white/5 text-gray-400' : 'border-gray-50 text-gray-500'}`}>
                    Requires target referral sales
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

    </div>
  );
};

export default InfluencerCommissionSlabs;
