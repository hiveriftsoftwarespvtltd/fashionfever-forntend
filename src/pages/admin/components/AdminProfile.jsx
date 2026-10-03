import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, Calendar, KeyRound, Loader2, Phone, Award, CheckCircle2 } from 'lucide-react';
import { getAdminProfile } from '../../../api/adminService';

const AdminProfile = ({ isDarkMode }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await getAdminProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
        <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Fetching Account Profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`p-12 text-center rounded-2xl border max-w-xl mx-auto ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <User size={36} className="text-zinc-400 mx-auto mb-3" />
        <p className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
          Unable to load profile details
        </p>
      </div>
    );
  }

  const { user, adminAccess, roleTitle } = profile;

  return (
    <div className="space-y-6 max-w-5xl text-left animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-black uppercase tracking-tight flex items-center gap-2.5 ${
          isDarkMode ? 'text-white' : 'text-zinc-900'
        }`}>
          <User className="text-primary" size={26} /> My Account Profile
        </h1>
        <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Manage your personal credentials, assigned privileges, and administrative roles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Identity Card */}
        <div className={`p-7 rounded-2xl border text-center flex flex-col items-center justify-between relative overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20' 
            : 'bg-white border-zinc-200/90 shadow-sm'
        }`}>
          {/* Top subtle line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-pink-500 to-rose-500" />
          
          <div className="flex flex-col items-center w-full">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black text-2xl mb-4 border border-primary/20 shadow-md">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>

            <h2 className={`text-base font-extrabold mb-1 tracking-tight ${
              isDarkMode ? 'text-white' : 'text-zinc-900'
            }`}>
              {user?.name || 'Administrator'}
            </h2>
            <span className="text-xs font-bold text-primary px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              {roleTitle || (user?.roles?.includes('super_admin') ? 'Super Admin' : 'Admin')}
            </span>
          </div>

          <div className={`w-full border-t mt-6 pt-5 text-left space-y-4 ${
            isDarkMode ? 'border-zinc-800' : 'border-zinc-100'
          }`}>
            <div className="flex items-center gap-3">
              <Calendar size={16} className={isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} />
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                }`}>Joined On</p>
                <p className={`text-xs font-extrabold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-emerald-500" />
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                }`}>Account Status</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active & Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Information & Permissions */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className={`p-7 rounded-2xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20' 
              : 'bg-white border-zinc-200/90 shadow-sm'
          }`}>
            <h3 className={`text-sm font-extrabold uppercase tracking-wider mb-5 pb-3 border-b ${
              isDarkMode ? 'text-zinc-100 border-zinc-800' : 'text-zinc-800 border-zinc-100'
            }`}>
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  <User size={13} className="text-primary" /> Full Name
                </p>
                <p className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  {user?.name || 'Administrator'}
                </p>
              </div>

              <div className="space-y-1">
                <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  <Mail size={13} className="text-primary" /> Email Address
                </p>
                <p className={`text-sm font-extrabold break-all ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  {user?.email || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  <Phone size={13} className="text-primary" /> Phone Number
                </p>
                <p className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  {user?.phone || 'Not Specified'}
                </p>
              </div>

              <div className="space-y-1">
                <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  <Award size={13} className="text-primary" /> Assigned Roles
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {user?.roles?.map((r, idx) => (
                    <span 
                      key={idx} 
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border ${
                        r === 'super_admin'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}
                    >
                      {r.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions / Module Access */}
          <div className={`p-7 rounded-2xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-zinc-900/90 border-zinc-800 shadow-xl shadow-black/20' 
              : 'bg-white border-zinc-200/90 shadow-sm'
          }`}>
            <h3 className={`text-sm font-extrabold uppercase tracking-wider mb-5 pb-3 border-b ${
              isDarkMode ? 'text-zinc-100 border-zinc-800' : 'text-zinc-800 border-zinc-100'
            }`}>
              Assigned Permissions & Modules
            </h3>

            {user?.roles?.includes('super_admin') ? (
              <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                isDarkMode 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <CheckCircle2 size={20} className="flex-shrink-0 text-emerald-500" />
                <span className="text-xs font-bold">
                  Full System Control Granted (Super Admin privileges bypass module restrictions).
                </span>
              </div>
            ) : Array.isArray(adminAccess) && adminAccess.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adminAccess.map((access, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <span className={`text-xs font-extrabold capitalize ${
                      isDarkMode ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      {access.module || access}
                    </span>
                    <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Enabled
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Standard administrative dashboard view.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
