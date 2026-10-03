import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Upload, X, Loader2, Check } from 'lucide-react';
import { registerVendor, getVendorDetails } from '../api/vendorService';
import { toast } from '../utils/toast';
import { useUser } from '../context/UserContext';

const VendorRegistration = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);

  // Redirect if vendor onboarding already completed or vendor already exists
  useEffect(() => {
    let isMounted = true;
    const checkExistingVendor = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('user_session') || '{}');
        const currentUser = user || session?.user;

        // Check if vendor profile already exists on backend
        const res = await getVendorDetails();
        const vendorData = res?.data || res;
        if (vendorData && (vendorData._id || vendorData.businessName) && isMounted) {
          try {
            if (session?.user) {
              session.user.vendorId = vendorData._id;
              session.user.isVendorOnboardingCompleted = true;
              localStorage.setItem('user_session', JSON.stringify(session));
            }
          } catch (_) {}
          navigate('/vendor/dashboard', { replace: true });
        }
      } catch (_) {}
    };

    checkExistingVendor();
    return () => { isMounted = false; };
  }, [user, navigate]);

  // Form State
  const [formData, setFormData] = useState(() => {
    let initialEmail = '';
    let initialPhone = '';
    try {
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      initialEmail = session?.user?.email || '';
      initialPhone = session?.user?.phone || '';
    } catch (_) {}
    return {
      businessName: '',
      slug: '',
      description: '',
      address: '',
      phone: initialPhone,
      email: initialEmail,
      vendorPincode: '',
      city: '',
      state: '',
    };
  });

  // Sync email & phone from user context if available
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Files & Previews
  const [files, setFiles] = useState({
    logo: null,
    banner: null,
  });
  const [previews, setPreviews] = useState({
    logo: null,
    banner: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Automatically generate slug from business name
    if (name === 'businessName') {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setPreviews(prev => ({ ...prev, [type]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      toast.error('Store Name is required');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Store URL slug is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.vendorPincode.trim()) {
      toast.error('Pincode is required');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!formData.state.trim()) {
      toast.error('State is required');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });
      if (files.logo) data.append('logo', files.logo);
      if (files.banner) data.append('banner', files.banner);

      const response = await registerVendor(data);

      if (response && response.success) {
        toast.success('Store registered successfully!');
        setTimeout(() => {
          window.location.href = '/vendor/dashboard';
        }, 1200);
      } else {
        toast.error(response?.message || 'Registration failed');
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || '';
      if (errorMsg.toLowerCase().includes('already exist')) {
        toast.info('Your store already exists. Redirecting to dashboard...');
        try {
          const session = JSON.parse(localStorage.getItem('user_session') || '{}');
          if (session?.user) {
            session.user.isVendorOnboardingCompleted = true;
            localStorage.setItem('user_session', JSON.stringify(session));
          }
        } catch (_) {}
        setTimeout(() => {
          navigate('/vendor/dashboard', { replace: true });
        }, 1200);
        return;
      }
      toast.error(errorMsg || 'Failed to register vendor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 text-slate-900">
      <div className="max-w-3xl mx-auto">

        {/* Clean Header */}
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <Store size={18} />
            <span>Merchant Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Register Your Store
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Fill in your store and business details to start selling on Fashion Fever.
          </p>
        </div>

        {/* Main Clean Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1: Store Information */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Store Information
              </h2>

              <div className="space-y-4">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Store / Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="e.g. Urban Style Studio"
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Storefront URL <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                    <span className="px-3 bg-slate-100 text-slate-600 text-xs sm:text-sm flex items-center border-r border-slate-300 select-none whitespace-nowrap">
                      fashionfever.in/store/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      required
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="urban-style-studio"
                      className="flex-1 px-3.5 py-2.5 bg-white text-slate-900 text-sm outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Auto-generated from your store name. Only lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Store Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell customers about your brand, specialty, and products..."
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Contact & Address
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Business Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="merchant@example.com"
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Auto-filled from your logged-in account.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Shop/Office No., Street, Landmark"
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Gorakhpur"
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="e.g. Uttar Pradesh"
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="vendorPincode"
                      required
                      value={formData.vendorPincode}
                      onChange={handleInputChange}
                      placeholder="e.g. 273001"
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Store Images */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Store Images <span className="text-xs font-normal text-slate-500">(Optional)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Store Logo
                  </label>
                  {previews.logo ? (
                    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <img
                        src={previews.logo}
                        alt="Logo"
                        className="w-12 h-12 rounded object-cover border border-slate-300 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">Logo selected</p>
                        <p className="text-[11px] text-slate-500">Ready to upload</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('logo')}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md cursor-pointer"
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-lg hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors bg-white">
                      <Upload size={20} className="text-slate-400 mb-1" />
                      <span className="text-xs font-medium text-slate-700">Choose logo image</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Store Banner
                  </label>
                  {previews.banner ? (
                    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <img
                        src={previews.banner}
                        alt="Banner"
                        className="w-16 h-12 rounded object-cover border border-slate-300 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">Banner selected</p>
                        <p className="text-[11px] text-slate-500">Ready to upload</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('banner')}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md cursor-pointer"
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-lg hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors bg-white">
                      <Upload size={20} className="text-slate-400 mb-1" />
                      <span className="text-xs font-medium text-slate-700">Choose banner image</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Recommended 1200x400</span>
                      <input
                        type="file"
                        name="banner"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default VendorRegistration;
