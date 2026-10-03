import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Users,
  FileText,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Phone,
  Camera,
  Video,
  Clock,
  ChevronRight,
  BadgeCheck,
  UserCheck
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { toast } from '../utils/toast';

/* ─── API helpers ────────────────────────────────────── */
const registerInfluencer = async (payload) => {
  try {
    const res = await apiClient.post('/public-user/onboard-influencer', payload);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: 'Registration failed.' };
  }
};

const FOLLOWER_PRESETS = [
  { label: '5K - 25K', value: 15000 },
  { label: '25K - 100K', value: 50000 },
  { label: '100K - 500K', value: 200000 },
  { label: '500K+', value: 500000 },
];

const InfluencerRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMoreSocials, setShowMoreSocials] = useState(false);

  const [form, setForm] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    bio: '',
    followers: '',
    instagram: '',
    youtube: '',
    facebook: '',
    snapchat: '',
  });

  /* ── If no token in URL — show invalid screen (Light Theme) ── */
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-slate-50 to-purple-50/50 font-outfit text-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 md:p-10 text-center space-y-6 shadow-xl shadow-gray-200/60 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500 shadow-md shadow-rose-500/10">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 inline-block">
              Missing Invitation Token
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Invitation Link Required
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              The FashionFever Creator Program is exclusive & invite-only. A valid invitation token in the URL is required to register.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left flex items-start gap-3">
            <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase">Received an email invitation?</p>
              <p className="text-xs text-gray-500 mt-0.5">Please click the direct link provided in your invitation email.</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-primary hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-primary/20"
          >
            Go to FashionFever Home
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePresetFollowers = (val) => {
    setForm((prev) => ({ ...prev, followers: val.toString() }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!form.phone || form.phone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!form.password) {
      toast.error('Please enter a password.');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!form.bio || form.bio.trim().length < 15) {
      toast.error('Please enter your bio (at least 15 characters).');
      return;
    }
    if (!form.followers) {
      toast.error('Please specify your follower count.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        token: token.trim(),
        phone: form.phone.trim(),
        password: form.password,
        bio: form.bio.trim(),
        instagram: form.instagram.trim() || undefined,
        youtube: form.youtube.trim() || undefined,
        facebook: form.facebook.trim() || undefined,
        snapchat: form.snapchat.trim() || undefined,
        followers: Number(form.followers) || 0,
      };

      const res = await registerInfluencer(payload);
      if (res.success) {
        setRegistered(true);
        toast.success(res.message || 'Influencer registration submitted successfully!');
      } else {
        const errorMsg =
          res.message ||
          res.data?.message ||
          (Array.isArray(res.message) ? res.message.join(', ') : 'Registration could not be completed.');
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────── SUCCESS SCREEN (Light Theme) ─── */
  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/60 via-slate-50 to-purple-50/60 font-outfit text-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 md:p-10 text-center space-y-6 shadow-2xl shadow-gray-200/70 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-18 h-18 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={40} className="animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
              <BadgeCheck size={12} /> Application Received
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Registration Complete!
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Your profile has been created successfully. Our team will review your application and activate your creator account within 24 hours.
            </p>
          </div>

          <div className="bg-slate-50 border border-gray-100 rounded-2xl p-5 text-left space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">What Happens Next?</p>
            {[
              { step: '1', title: 'Admin Verification', desc: 'Team reviews invitation token & social handles.' },
              { step: '2', title: 'Activation Notice', desc: 'You will receive your direct login confirmation email.' },
              { step: '3', title: 'Commission Dashboard', desc: 'Create custom promo coupons and track live earnings.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="text-xs font-bold text-gray-800">{item.title}</p>
                  <p className="text-[11px] text-gray-500 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-4 bg-primary hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              Go to Login Page <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
            >
              Explore FashionFever Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────── MAIN FORM (Clean Light Design) ─── */
  const passwordStrength =
    form.password.length === 0 ? 0 : form.password.length < 8 ? 1 : form.password.length < 12 ? 2 : 3;

  return (
    <div className="min-h-screen bg-[#fafafc] font-outfit text-gray-800 py-10 px-4 sm:px-6 relative overflow-x-hidden">
      {/* Subtle soft backdrop accents */}
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/15 text-xs font-black uppercase tracking-wider">
            <Sparkles size={13} />
            Exclusive Creator Invitation
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
            Join FashionFever as <span className="text-primary">Influencer</span>
          </h1>

          <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
            Complete your profile below to unlock customized promo coupons, commission tracking, and partner drops.
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200/70 shadow-xs">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Invitation Verified:</span>
            <span className="font-mono text-gray-600 font-semibold">{token.slice(0, 14)}...</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          
          {/* Top subtle highlight bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-rose-400 to-purple-500" />

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 space-y-8">
            
            {/* ── Section 1: Security & Contact ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                  1
                </span>
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Account Credentials & Contact
                </h2>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-primary" /> Mobile / WhatsApp Number
                  </span>
                  <span className="text-[10px] text-gray-400 lowercase font-medium">required for payouts</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-gray-500 border-r border-gray-200 pr-2.5">
                    <span>🇮🇳</span> +91
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    maxLength={10}
                    required
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm((prev) => ({ ...prev, phone: val }));
                    }}
                    placeholder="98765 43210"
                    className="w-full pl-22 pr-4 py-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <Lock size={13} className="text-primary" /> Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="w-full pl-4 pr-11 py-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {form.password && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 1 ? 'bg-amber-400' : 'bg-gray-200'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 2 ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
                      <span className="text-[10px] font-bold text-gray-500 uppercase ml-1">
                        {passwordStrength === 1 ? 'Weak' : passwordStrength === 2 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-primary" /> Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className="w-full pl-4 pr-11 py-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirmPassword && (
                    <p className={`text-[10px] font-bold pt-1 ${form.password === form.confirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 2: Creator Profile & Audience ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-black">
                  2
                </span>
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Creator Profile & Reach
                </h2>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <FileText size={13} className="text-purple-500" /> Bio & Content Niche
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {form.bio.length} characters
                  </span>
                </div>
                <textarea
                  name="bio"
                  required
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell us about yourself — your beauty/lifestyle focus, audience type, and content style..."
                  className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none"
                />
              </div>

              {/* Followers */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-purple-500" /> Combined Follower Count
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase">Across all platforms</span>
                </label>

                {/* Quick Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FOLLOWER_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetFollowers(preset.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        Number(form.followers) === preset.value
                          ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  name="followers"
                  type="number"
                  min="0"
                  required
                  value={form.followers}
                  onChange={handleChange}
                  placeholder="Or type exact number (e.g. 50000)"
                  className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all"
                />
              </div>
            </div>

            {/* ── Section 3: Social Channels ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <span className="w-6 h-6 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Primary Social Handles
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Instagram */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <Camera size={13} className="text-pink-500" /> Instagram Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-pink-500">@</span>
                    <input
                      name="instagram"
                      type="text"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="your_handle"
                      className="w-full pl-9 pr-4 py-3 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* YouTube */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <Video size={13} className="text-red-500" /> YouTube Channel
                  </label>
                  <input
                    name="youtube"
                    type="text"
                    value={form.youtube}
                    onChange={handleChange}
                    placeholder="youtube.com/@channel"
                    className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Optional Channels */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowMoreSocials(!showMoreSocials)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                >
                  <ChevronRight size={14} className={`transform transition-transform ${showMoreSocials ? 'rotate-90' : ''}`} />
                  {showMoreSocials ? 'Hide additional social links' : '+ Add Facebook / Snapchat handles (optional)'}
                </button>

                {showMoreSocials && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-2 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Facebook</label>
                      <input
                        name="facebook"
                        type="text"
                        value={form.facebook}
                        onChange={handleChange}
                        placeholder="facebook.com/profile"
                        className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200/80 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Snapchat</label>
                      <input
                        name="snapchat"
                        type="text"
                        value={form.snapchat}
                        onChange={handleChange}
                        placeholder="snapchat.com/add/handle"
                        className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200/80 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Submit Action ── */}
            <div className="pt-2 space-y-3">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-4.5 bg-primary hover:opacity-95 active:scale-[0.99] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting Profile...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Complete Registration
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-400 text-center">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>256-Bit SSL Encrypted • Official Partner Verification</span>
              </div>
            </div>
          </form>
        </div>

        <p className="text-center text-xs font-medium text-gray-400 mt-6">
          By registering, you agree to FashionFever's{' '}
          <span className="text-primary font-bold cursor-pointer hover:underline">
            Influencer Partner Agreement
          </span>
        </p>
      </div>
    </div>
  );
};

export default InfluencerRegistration;
