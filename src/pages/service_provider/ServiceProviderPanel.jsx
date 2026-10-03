import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu, Sun, Moon, Clock, AlertOctagon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { toast } from '../../utils/toast';
import { getAllServiceProviders } from '../../api/adminService';
import { getServicesList } from '../../api/serviceProviderService';

// Sub components
import ServiceProviderSidebar from './components/ServiceProviderSidebar';
import ServiceProviderOverview from './components/ServiceProviderOverview';
import ServiceProviderProfile from './components/ServiceProviderProfile';
import ServiceProviderServices from './components/ServiceProviderServices';
import ServiceProviderStaff from './components/ServiceProviderStaff';
import ServiceProviderAvailability from './components/ServiceProviderAvailability';
import ServiceProviderWallet from './components/ServiceProviderWallet';
import ServiceProviderLeads from './components/ServiceProviderLeads';
import PayoutBankDetails from '../../components/shared/PayoutBankDetails';
import ServiceProviderCoupons from './components/ServiceProviderCoupons';

const ServiceProviderPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useUser();
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditingRejected, setIsEditingRejected] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('sp_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?._id) return parsed;
    }
    return null; // Start null so we check if registered
  });

  // Sync profile from backend if registered
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;
      try {
        const res = await getAllServiceProviders();
        if (res?.success) {
          const list = res.data?.data ?? res.data ?? [];
          const matched = list.find(prov => (prov.userId?._id === user._id || prov.userId === user._id));
          if (matched) {
            setProfileData(matched);
          } else {
            setProfileData(null);
          }
        }
      } catch (err) {
        console.error("Failed to load service provider profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profileData && profileData._id) {
      localStorage.setItem('sp_profile', JSON.stringify(profileData));
    } else {
      localStorage.removeItem('sp_profile');
    }
  }, [profileData]);

  // Fetch services from /service/list
  useEffect(() => {
    const fetchServices = async () => {
      if (!profileData?._id || profileData.verificationStatus !== 'APPROVED') return;
      setServicesLoading(true);
      try {
        const res = await getServicesList();
        let list = [];
        if (res?.data) {
          if (Array.isArray(res.data)) {
            list = res.data;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            list = res.data.data;
          }
        } else if (Array.isArray(res)) {
          list = res;
        }
        
        // Filter by current provider ID
        const matchedServices = list.filter(service => {
          const provId = service.providerId?._id || service.providerId;
          return provId === profileData._id;
        });
        setServices(matchedServices);
      } catch (err) {
        console.error("Failed to load services list:", err);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, [profileData]);

  const handleSetProfileData = (newProfile) => {
    setProfileData(newProfile);
    setIsEditingRejected(false); // Reset editing rejected status upon successful update
  };

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  // 1. Loading State
  if (profileLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-outfit uppercase font-bold text-xs tracking-widest ${
        isDarkMode ? 'bg-gray-950 text-gray-500' : 'bg-gray-50 text-gray-400'
      }`}>
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        Loading Partner Console...
      </div>
    );
  }

  // 2. Unregistered State (No Profile Data at all)
  if (!profileData || !profileData._id) {
    return (
      <div className={`flex flex-col min-h-screen font-outfit transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'
      }`}>
        {/* Simple Header */}
        <header className={`h-24 flex-shrink-0 flex items-center justify-between px-6 lg:px-10 border-b sticky top-0 z-[1000] ${
          isDarkMode 
            ? 'bg-gray-950/90 backdrop-blur-xl border-white/5' 
            : 'bg-white/80 backdrop-blur-xl border-gray-100'
        }`}>
          <span className={`text-xs font-black uppercase tracking-wider ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            FASHIONFEVER PARTNER CONSOLE
          </span>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className={`p-3 rounded-xl transition-all border cursor-pointer ${
                isDarkMode 
                  ? 'bg-white/5 text-primary border-white/5 shadow-xl shadow-primary/10' 
                  : 'bg-gray-50 text-primary border-transparent hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-primary/10"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Registration Form container */}
        <main className="p-6 lg:p-10 flex-grow flex items-start justify-center overflow-y-auto">
          <div className="w-full">
            <div className="text-center max-w-md mx-auto mb-8 space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block">Profile Registration</span>
              <h2 className="text-xl font-black uppercase">Create Your Service Profile</h2>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-450' : 'text-gray-500'}`}>
                To list services and receive bookings, please complete your partner registration form first.
              </p>
            </div>
            <ServiceProviderProfile 
              isDarkMode={isDarkMode} 
              profileData={profileData} 
              setProfileData={handleSetProfileData} 
            />
          </div>
        </main>
      </div>
    );
  }

  // 3. Application Rejected State
  if (profileData && profileData.verificationStatus === 'REJECTED' && !isEditingRejected) {
    return (
      <div className={`min-h-screen transition-colors duration-300 font-outfit flex flex-col items-center justify-center p-6 text-center ${
        isDarkMode ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200'
      }`}>
        <div className={`max-w-md w-full rounded-3xl p-8 shadow-2xl border flex flex-col items-center gap-6 relative overflow-hidden ${
          isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'
        }`}>
          {/* Decorative gradients */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10">
            <AlertOctagon size={36} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-rose-650 dark:text-rose-500">Application Rejected</h2>
            <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Business: {profileData.businessName}
            </p>
          </div>
          
          <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Your application was rejected by the administration team. This might be due to missing details or invalid credentials. 
            Please click the button below to update your business credentials and submit again for re-verification.
          </p>
          
          <div className="w-full flex flex-col gap-3">
            <button 
              onClick={() => setIsEditingRejected(true)}
              className="w-full bg-primary hover:bg-primary/95 text-white py-4 rounded-2xl font-bold uppercase text-xs transition-all shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-98 cursor-pointer"
            >
              Modify Profile & Resubmit
            </button>
            <div className="flex gap-3">
              <button 
                onClick={toggleTheme}
                className={`flex-1 py-3.5 rounded-2xl font-bold uppercase text-xs transition-all border cursor-pointer ${
                  isDarkMode 
                    ? 'bg-white/5 text-white border-white/5 hover:bg-white/10' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Toggle Theme
              </button>
              <button 
                onClick={handleLogout}
                className={`flex-1 py-3.5 rounded-2xl font-bold uppercase text-xs transition-all border cursor-pointer ${
                  isDarkMode 
                    ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' 
                    : 'border-red-200 text-red-500 hover:bg-red-50'
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Editing Rejected Profile State (Form shown with Cancel option)
  if (profileData && profileData.verificationStatus === 'REJECTED' && isEditingRejected) {
    return (
      <div className={`flex flex-col min-h-screen font-outfit transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'
      }`}>
        <header className={`h-24 flex-shrink-0 flex items-center justify-between px-6 lg:px-10 border-b sticky top-0 z-[1000] ${
          isDarkMode 
            ? 'bg-gray-950/90 backdrop-blur-xl border-white/5' 
            : 'bg-white/80 backdrop-blur-xl border-gray-100'
        }`}>
          <span className={`text-xs font-black uppercase tracking-wider ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            FASHIONFEVER PARTNER CONSOLE
          </span>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className={`p-3 rounded-xl transition-all border cursor-pointer ${
                isDarkMode 
                  ? 'bg-white/5 text-primary border-white/5 shadow-xl shadow-primary/10' 
                  : 'bg-gray-50 text-primary border-transparent hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsEditingRejected(false)}
              className={`px-4 py-2 border text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
                isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-10 flex-grow flex items-start justify-center overflow-y-auto">
          <div className="w-full">
            <div className="text-center max-w-md mx-auto mb-8 space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest block">Update Rejected Profile</span>
              <h2 className="text-xl font-black uppercase">Resubmit Profile</h2>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Make necessary changes and submit the profile again for admin review.
              </p>
            </div>
            <ServiceProviderProfile 
              isDarkMode={isDarkMode} 
              profileData={profileData} 
              setProfileData={handleSetProfileData} 
            />
          </div>
        </main>
      </div>
    );
  }

  // 5. Verification Pending State
  if (profileData && profileData.verificationStatus !== 'APPROVED') {
    return (
      <div className={`min-h-screen transition-colors duration-300 font-outfit flex flex-col items-center justify-center p-6 text-center ${
        isDarkMode ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200'
      }`}>
        <div className={`max-w-md w-full rounded-3xl p-8 shadow-2xl border flex flex-col items-center gap-6 relative overflow-hidden ${
          isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'
        }`}>
          {/* Decorative gradients */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10 animate-pulse">
            <Clock size={36} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Approval Pending</h2>
            <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Business: {profileData.businessName}
            </p>
          </div>
          
          <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Your service provider application has been received and is currently under review by our administrator team. 
            Once approved, you will get full access to your partner console to list services, manage bookings, and grow your business!
          </p>
          
          <div className={`w-full rounded-2xl p-4 border flex items-center gap-4 text-left ${
            isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
          }`}>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
            <div>
              <p className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Current Status</p>
              <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400 uppercase">{profileData.verificationStatus || 'PENDING'}</p>
            </div>
          </div>
          
          <div className="w-full flex gap-3">
            <button 
              onClick={toggleTheme}
              className={`flex-1 py-4 rounded-2xl font-bold uppercase text-xs transition-all border cursor-pointer ${
                isDarkMode 
                  ? 'bg-white/5 text-white border-white/5 hover:bg-white/10' 
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Toggle Theme
            </button>
            <button 
              onClick={handleLogout}
              className="flex-[2] bg-primary hover:bg-primary/95 text-white py-4 rounded-2xl font-bold uppercase text-xs transition-all shadow-lg shadow-primary/20 hover:opacity-95 active:opacity-90 cursor-pointer"
            >
              Logout & Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. Approved State (Full Access Dashboard)
  return (
    <div className={`flex min-h-screen font-outfit transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'
    }`}>
      {/* Sidebar */}
      <ServiceProviderSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        handleLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col min-h-screen min-w-0 h-screen overflow-y-scroll"
      >
        
        {/* Header */}
        <header className={`h-20 flex-shrink-0 flex items-center justify-between px-6 lg:px-10 border-b sticky top-0 z-[1000] ${
          isDarkMode 
            ? 'bg-zinc-950/90 backdrop-blur-xl border-zinc-800' 
            : 'bg-white/80 backdrop-blur-xl border-zinc-200'
        }`}>
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600'
              }`}
            >
              <Menu size={20} />
            </button>
            <span className={`text-xs font-bold uppercase tracking-wider hidden sm:inline-block ${
              isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              FASHIONFEVER PARTNER CONSOLE
            </span>
          </div>

          <div className="flex items-center gap-4 ml-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className={`p-3 rounded-xl transition-all border cursor-pointer ${
                isDarkMode 
                  ? 'bg-white/5 text-primary border-white/5 shadow-xl shadow-primary/10' 
                  : 'bg-gray-50 text-primary border-transparent hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* User Initials Badge */}
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">
              {(profileData?.businessName?.charAt(0) || user?.name?.charAt(0) || 'SP').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab View */}
        <main className="p-6 lg:p-10 space-y-8 flex-grow">
          <div key={activeTab} className="animate-in fade-in duration-200">
          {activeTab === 'dashboard' && (
            <ServiceProviderOverview 
              isDarkMode={isDarkMode} 
              user={user} 
              services={services} 
              servicesLoading={servicesLoading}
              bookings={[]} 
            />
          )}

          {activeTab === 'services' && (
            <ServiceProviderServices 
              isDarkMode={isDarkMode} 
              services={services} 
              setServices={setServices} 
            />
          )}

          {activeTab === 'staff' && (
            <ServiceProviderStaff 
              isDarkMode={isDarkMode} 
              profileData={profileData}
            />
          )}

          {activeTab === 'availability' && (
            <ServiceProviderAvailability 
              isDarkMode={isDarkMode} 
              user={user}
              profileData={profileData}
            />
          )}

           {activeTab === 'wallet' && (
             <ServiceProviderWallet 
               isDarkMode={isDarkMode} 
             />
           )}

            {activeTab === 'leads' && (
              <ServiceProviderLeads 
                isDarkMode={isDarkMode} 
              />
            )}

            {activeTab === 'payout' && (
              <PayoutBankDetails 
                isDarkMode={isDarkMode} 
                role="service_provider"
                ownerId={profileData?._id}
              />
            )}

            {activeTab === 'coupons' && (
              <ServiceProviderCoupons 
                isDarkMode={isDarkMode}
                services={services}
                servicesLoading={servicesLoading}
                profileData={profileData}
              />
            )}

           {activeTab === 'profile' && (
             <ServiceProviderProfile 
               isDarkMode={isDarkMode} 
               profileData={profileData} 
               setProfileData={handleSetProfileData} 
             />
           )}
           </div>
        </main>

      </div>
    </div>
  );
};

export default ServiceProviderPanel;

