import React from 'react';
import { Edit } from 'lucide-react';

const VendorProfile = ({
  isDarkMode,
  vendorData,
  getImageUrl,
  onEditProfile
}) => {
  return (
    <div className="max-w-4xl space-y-8 text-left">
      <div className={`rounded-3xl shadow-sm border overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="h-48 bg-gray-100 relative">
          <img
            src={getImageUrl(vendorData.banner)}
            alt="Banner"
            className={`w-full h-full object-cover ${isDarkMode ? 'opacity-85' : ''}`}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80'; }}
          />
          <div className={`absolute -bottom-12 left-8 w-24 h-24 rounded-2xl shadow-xl border-4 flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-gray-950 border-gray-950' : 'bg-white border-white'}`}>
            <img
              src={getImageUrl(vendorData.logo)}
              alt="Logo"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${vendorData.businessName}&background=random&size=128`; }}
            />
          </div>
          <button
            onClick={onEditProfile}
            className={`absolute bottom-4 right-4 backdrop-blur shadow-lg p-3 rounded-xl hover:scale-110 transition-all flex items-center gap-2 font-bold text-xs cursor-pointer ${
              isDarkMode ? 'bg-gray-900/80 text-primary border border-white/10' : 'bg-white/90 text-primary'
            }`}
          >
            <Edit size={16} /> Edit Profile
          </button>
        </div>
        <div className="pt-16 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{vendorData.businessName}</h2>
              <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{vendorData.slug}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${vendorData.status === 'APPROVED' ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600') : (isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-655')}`}>
              {vendorData.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Email Address</label>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {vendorData.email || vendorData.ownerId?.email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Phone Number</label>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {vendorData.phone || vendorData.ownerId?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Commission Rate</label>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{vendorData.commissionRate || 0}%</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Region / Location</label>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {[vendorData.city, vendorData.state].filter(Boolean).join(', ') || 'N/A'} {vendorData.vendorPincode ? `(${vendorData.vendorPincode})` : ''}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Store Description</label>
                <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{vendorData.description || 'No description added yet.'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Registered Address</label>
                <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-650'}`}>
                  {vendorData.address || [vendorData.city, vendorData.state, vendorData.vendorPincode].filter(Boolean).join(', ') || 'No address added yet.'}
                </p>
              </div>
              {vendorData.ownerId?.name && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Account Owner</label>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{vendorData.ownerId.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
