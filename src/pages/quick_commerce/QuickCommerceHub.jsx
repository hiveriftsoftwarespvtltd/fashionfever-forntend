import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import CustomerFlow from './CustomerFlow';
import { Zap, Sliders } from 'lucide-react';
import quickHeroImg from '../../assets/quickhero.png';

const QuickCommerceHub = () => {
  const { user, role, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const isVendor = isAuthenticated && role === 'vendor';
  const isRider = isAuthenticated && (role === 'delivery_person' || role === 'rider' || role === 'driver');

  const handleOpenVendorDashboard = () => {
    localStorage.setItem('vendorActiveTab', 'quickcommerce');
    navigate('/vendor/dashboard');
  };

  const handleOpenRiderDashboard = () => {
    navigate('/rider/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 sm:pb-20">
      {/* Quick E-Commerce Full-Width Hero Banner with Clean Text Overlay */}
      <div className="relative w-full overflow-hidden bg-pink-100/50 border-b border-gray-200 h-[140px] sm:h-[200px] md:h-[240px]">
        <img
          src={quickHeroImg}
          alt="Quick E-Commerce Banner"
          className="w-full h-full object-cover object-center block absolute inset-0"
        />

        {/* Transparent Text Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-2xl text-left space-y-1.5 sm:space-y-2">

              <h1 className="text-xl sm:text-3xl md:text-4xl font-normal text-gray-900 font-serif leading-[1.1] tracking-tight">
                Quick E-Commerce
              </h1>

              <p className="text-gray-700 font-normal text-xs sm:text-sm md:text-base leading-snug max-w-md hidden sm:block">
                10-Minute Lightning-Fast Delivery Services for Cosmetics & Skin Essentials.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="bg-[#ff4d6d] hover:bg-[#e63956] text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
                >
                  <Zap size={15} className="fill-white" /> Shop Lightning Deals
                </button>

                {isVendor && (
                  <button
                    onClick={handleOpenVendorDashboard}
                    className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white text-gray-800 hover:bg-gray-50 font-bold text-xs sm:text-sm shadow-md border border-gray-200 transition-all cursor-pointer"
                  >
                    <Sliders size={15} /> Manage in Vendor Dashboard
                  </button>
                )}

                {isRider && (
                  <button
                    onClick={handleOpenRiderDashboard}
                    className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white text-gray-800 hover:bg-gray-50 font-bold text-xs sm:text-sm shadow-md border border-gray-200 transition-all cursor-pointer"
                  >
                    <Sliders size={15} /> Open Rider Dashboard
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 max-w-[1600px] mt-4 sm:mt-8 md:mt-12">
        {/* Customer Quick-Commerce Storefront */}
        <div className="transition-all duration-300">
          <CustomerFlow />
        </div>
      </div>
    </div>
  );
};

export default QuickCommerceHub;
