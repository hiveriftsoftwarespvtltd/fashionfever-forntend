import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { registerServiceProvider, updateServiceProvider } from '../../../api/serviceProviderService';
import MapPinpointer from './MapPinpointer';

const ServiceProviderProfile = ({ isDarkMode, profileData, setProfileData }) => {
  const isRegistered = !!(profileData && profileData._id);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    description: '',
    experienceYears: '',
    phone: '',
    gstNumber: '',
    panNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    providerType: 'INDIVIDUAL',
    providedGenderService: 'BOTH',
    homeServiceAvailable: false,
    salonVisitAvailable: false,
    serviceRadiusKm: 25,
    latitude: 0,
    longitude: 0,
  });

  // Sync form state when profileData is loaded/changed from the backend/parent panel
  useEffect(() => {
    if (profileData) {
      setForm({
        businessName: profileData.businessName || '',
        description: profileData.description || '',
        experienceYears: profileData.experienceYears || '',
        phone: profileData.phone || '',
        gstNumber: profileData.gstNumber || '',
        panNumber: profileData.panNumber || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        pincode: profileData.pincode || '',
        providerType: profileData.providerType || 'INDIVIDUAL',
        providedGenderService: profileData.providedGenderService || 'BOTH',
        homeServiceAvailable: profileData.homeServiceAvailable ?? false,
        salonVisitAvailable: profileData.salonVisitAvailable ?? false,
        serviceRadiusKm: profileData.serviceRadiusKm ?? 25,
        latitude: profileData.coordinates ? profileData.coordinates[1] : 0,
        longitude: profileData.coordinates ? profileData.coordinates[0] : 0,
      });
    }
  }, [profileData]);

  const handleInputChange = (e, field) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: val });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      businessName: form.businessName,
      description: form.description,
      experienceYears: Number(form.experienceYears),
      phone: form.phone,
      gstNumber: form.gstNumber,
      panNumber: form.panNumber,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      providerType: form.providerType,
      providedGenderService: form.providedGenderService,
      homeServiceAvailable: form.homeServiceAvailable,
      salonVisitAvailable: form.salonVisitAvailable,
      coordinates: [Number(form.longitude), Number(form.latitude)],
      serviceRadiusKm: Number(form.serviceRadiusKm),
    };

    try {
      console.log(`Executing ${isRegistered ? 'PUT update' : 'POST registration'} API with payload:`, payload);
      const res = isRegistered 
        ? await updateServiceProvider(payload)
        : await registerServiceProvider(payload);
      console.log("API response:", res);
      
      const isOk = res?.success && (res.data?.success !== false);
      if (isOk) {
        const registeredData = res.data?.data ?? res.data ?? {};
        setProfileData(registeredData);
        
        Swal.fire({
          title: 'Profile Saved!',
          text: res.data?.message || res.message || (isRegistered ? 'Service provider profile updated successfully.' : 'Service provider profile registered successfully.'),
          icon: 'success',
          confirmButtonColor: '#da016a',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#1f2937',
          borderRadius: '20px'
        });
      } else {
        const errDetail = res?.data?.message || res?.message || (isRegistered ? 'Something went wrong during profile update.' : 'Something went wrong during registration.');
        Swal.fire({
          title: isRegistered ? 'Update Failed' : 'Registration Failed',
          text: errDetail,
          icon: 'error',
          confirmButtonColor: '#da016a',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#1f2937',
          borderRadius: '20px'
        });
      }
    } catch (err) {
      console.error("API handler execution failed:", err);
      Swal.fire({
        title: 'Network Error',
        text: err.message || 'Failed to connect to the backend registration API.',
        icon: 'error',
        confirmButtonColor: '#da016a',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#1f2937',
        borderRadius: '20px'
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-xs font-semibold outline-none border transition-all ${
    isDarkMode 
      ? 'bg-gray-950 border-gray-800 text-white focus:border-primary/40' 
      : 'bg-gray-50 border-gray-150 text-gray-850 focus:bg-white focus:border-primary/20'
  }`;

  return (
    <div className="space-y-6 text-left font-outfit animate-in fade-in duration-300 max-w-2xl mx-auto">
      
      {/* Header section */}
      <div>
        <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">KYC & Business Setup</span>
        <h2 className={`text-lg md:text-xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
          Service Provider Registration
        </h2>
        <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Enter business details and submit to register/update your active profile on the platform.
        </p>
      </div>

      {/* Verification Status Banner if Registered */}
      {isRegistered && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          profileData.verificationStatus === 'APPROVED'
            ? isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'
            : isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'
        }`}>
          <div className="flex items-center gap-2.5">
            {profileData.verificationStatus === 'APPROVED' ? (
              <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
            ) : (
              <Clock className="text-amber-500 flex-shrink-0 animate-pulse" size={20} />
            )}
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${
                profileData.verificationStatus === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                Verification Status: {profileData.verificationStatus}
              </p>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {profileData.verificationStatus === 'APPROVED'
                  ? 'Your profile is approved and active in searches.'
                  : 'Your profile registration is pending review by FashionFever admin.'}
              </p>
            </div>
          </div>
          <span className={`w-fit px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
            profileData.verificationStatus === 'APPROVED'
              ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
          }`}>
            {profileData.verificationStatus}
          </span>
        </div>
      )}

      {/* Profile Form card */}
      <div className={`p-5 md:p-8 rounded-2xl border ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800 text-white' 
          : 'bg-white border-zinc-200 text-zinc-900 shadow-md shadow-zinc-200/20'
      }`}>
        <form onSubmit={handleRegisterSubmit} className="space-y-6">
          
          {/* Section 1: Business Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} /> 1. Business Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Business Name</label>
                <input 
                  type="text" 
                  required 
                  value={form.businessName} 
                  onChange={(e) => handleInputChange(e, 'businessName')} 
                  placeholder="e.g. Butiq" 
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Provider Type</label>
                <select 
                  value={form.providerType} 
                  onChange={(e) => handleInputChange(e, 'providerType')} 
                  className={inputClass}
                >
                  <option value="INDIVIDUAL">Individual Professional</option>
                  <option value="SALON">Salon Business</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Gender Serviced</label>
                <select 
                  value={form.providedGenderService} 
                  onChange={(e) => handleInputChange(e, 'providedGenderService')} 
                  className={inputClass}
                >
                  <option value="BOTH">Men & Women</option>
                  <option value="ONLY_WOMEN">Only Women</option>
                  <option value="ONLY_MEN">Only Men</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Experience (Years)</label>
                <input 
                  type="number" 
                  required 
                  value={form.experienceYears} 
                  onChange={(e) => handleInputChange(e, 'experienceYears')} 
                  placeholder="e.g. 2" 
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Business Overview Description</label>
              <textarea 
                rows="2" 
                required 
                value={form.description} 
                onChange={(e) => handleInputChange(e, 'description')} 
                placeholder="Write a summary about your salon services..." 
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div className={`h-[1px] ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`} />

          {/* Section 2: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} /> 2. Contact Registry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Contact Phone</label>
                <input 
                  type="text" 
                  required 
                  value={form.phone} 
                  onChange={(e) => handleInputChange(e, 'phone')} 
                  placeholder="e.g. 1234567890" 
                  className={inputClass}
                />
              </div>

              {isRegistered && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Business Email</label>
                  <input 
                    type="email" 
                    disabled 
                    value={profileData.email || ''} 
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold outline-none bg-transparent opacity-60 cursor-not-allowed border border-dashed border-zinc-300 dark:border-zinc-700" 
                  />
                </div>
              )}
            </div>
          </div>

          <div className={`h-[1px] ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`} />

          {/* Section 3: Legal Verification */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} /> 3. Verification Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">GST Registration Number</label>
                <input 
                  type="text" 
                  value={form.gstNumber} 
                  onChange={(e) => handleInputChange(e, 'gstNumber')} 
                  placeholder="e.g. 12344" 
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">PAN Card Number</label>
                <input 
                  type="text" 
                  required 
                  value={form.panNumber} 
                  onChange={(e) => handleInputChange(e, 'panNumber')} 
                  placeholder="e.g. 12345" 
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className={`h-[1px] ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`} />

          {/* Section 4: Service Availability Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} /> 4. Service Delivery Configuration
            </h3>
            
            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, homeServiceAvailable: !f.homeServiceAvailable }))}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold uppercase transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  form.homeServiceAvailable
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>Home Service Available</span>
                <span className={`w-2 h-2 rounded-full ${form.homeServiceAvailable ? 'bg-primary shadow-[0_0_8px_rgba(218,1,106,0.6)]' : 'bg-zinc-400'}`}></span>
              </button>

              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, salonVisitAvailable: !f.salonVisitAvailable }))}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold uppercase transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  form.salonVisitAvailable
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>Salon Visit Available</span>
                <span className={`w-2 h-2 rounded-full ${form.salonVisitAvailable ? 'bg-primary shadow-[0_0_8px_rgba(218,1,106,0.6)]' : 'bg-zinc-400'}`}></span>
              </button>
            </div>

            {/* Radius and Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Service Radius (Km)</label>
                <input 
                  type="number" 
                  required 
                  value={form.serviceRadiusKm} 
                  onChange={(e) => handleInputChange(e, 'serviceRadiusKm')} 
                  placeholder="e.g. 25" 
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Latitude Coordinate</label>
                <input 
                  type="number" 
                  step="any"
                  required 
                  value={form.latitude} 
                  onChange={(e) => handleInputChange(e, 'latitude')} 
                  placeholder="e.g. 0.0" 
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Longitude Coordinate</label>
                <input 
                  type="number" 
                  step="any"
                  required 
                  value={form.longitude} 
                  onChange={(e) => handleInputChange(e, 'longitude')} 
                  placeholder="e.g. 0.0" 
                  className={inputClass}
                />
              </div>
            </div>

            {/* Interactive Map Pinpointer and Geocoder */}
            <MapPinpointer 
              latitude={form.latitude}
              longitude={form.longitude}
              isDarkMode={isDarkMode}
              onCoordinatesChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
            />
          </div>

          <div className={`h-[1px] ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`} />

          {/* Section 5: Physical Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} /> 5. Physical Location
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Business Address</label>
              <input 
                type="text" 
                required 
                value={form.address} 
                onChange={(e) => handleInputChange(e, 'address')} 
                placeholder="Plot no, Area, Landmark..." 
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">City</label>
                <input 
                  type="text" 
                  required 
                  value={form.city} 
                  onChange={(e) => handleInputChange(e, 'city')} 
                  placeholder="e.g. Gorakhpur" 
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">State</label>
                <input 
                  type="text" 
                  required 
                  value={form.state} 
                  onChange={(e) => handleInputChange(e, 'state')} 
                  placeholder="e.g. U.P" 
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Pincode</label>
                <input 
                  type="text" 
                  required 
                  value={form.pincode} 
                  onChange={(e) => handleInputChange(e, 'pincode')} 
                  placeholder="e.g. 273001" 
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:opacity-95 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting Data...</span>
              ) : (
                <>
                  <UserCheck size={14} /> 
                  <span>{isRegistered ? 'Update Business Profile' : 'Register Service Provider'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ServiceProviderProfile;
