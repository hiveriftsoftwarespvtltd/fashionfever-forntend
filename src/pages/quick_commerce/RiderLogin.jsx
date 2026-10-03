import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loginUser } from '../../api/authService';
import { Truck, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Swal from 'sweetalert2';

const RiderLogin = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRiderLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both Email and Password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await loginUser({ email, password });
      if (response?.success && response?.data?.access_token) {
        const sessionData = {
          user: response.data.safeUser,
          token: response.data.access_token,
          isLoggedIn: true
        };
        login(sessionData);

        Swal.fire({
          icon: 'success',
          title: 'Welcome Back, Express Rider!',
          text: `Logged in as ${response.data.safeUser?.name || email}`,
          timer: 1500,
          showConfirmButton: false
        });

        setTimeout(() => {
          navigate('/rider/dashboard');
        }, 1000);
      } else {
        setErrorMsg(response?.message || 'Invalid Rider credentials. Please check Email & Password.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Login failed. Please check your network and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] text-white p-6 sm:p-8 text-center relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner">
            <Truck size={32} className="text-white fill-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Express Rider Portal</h2>
          <p className="text-rose-100 text-xs font-semibold mt-1 max-w-xs mx-auto">
            Log in with credentials provided by your Vendor to view assigned deliveries.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleRiderLogin} className="p-6 sm:p-8 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
              <ShieldCheck size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Rider Registered Email / Phone
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rider@express.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-800 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Rider Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password given by vendor"
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl pl-11 pr-11 py-3 text-xs font-bold text-slate-800 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Authenticating Rider...</span>
              </>
            ) : (
              <>
                <span>Login to Rider Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Alternative Links */}
          <div className="border-t border-slate-100 pt-4 text-center space-y-2">
            <p className="text-xs text-slate-400 font-semibold">
              Not a Rider?{' '}
              <Link to="/auth" className="text-primary font-bold hover:underline">
                Main User / Vendor Login
              </Link>
            </p>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1 font-semibold">
              <Zap size={14} className="text-primary fill-primary" /> 10-Minute Lightning Delivery Partner Network
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiderLogin;
