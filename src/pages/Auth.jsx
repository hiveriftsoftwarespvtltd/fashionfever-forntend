import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, KeyRound, Phone, ChevronDown, Tag } from 'lucide-react';
import { registerUser, verifyEmail, loginUser, verifyLoginOtp, sendForgotPasswordOtp, verifyForgotPasswordOtp, sendVerifyEmailOtp } from '../api/authService';
import { getStoredReferralCode, clearStoredReferralCode } from '../utils/referralTracking';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    roles: ['user'], // Default roles as an array
    phone: '' // Added phone
  });
  const [referralCode, setReferralCode] = useState(() => getStoredReferralCode() || '');

  useEffect(() => {
    const code = getStoredReferralCode();
    if (code && !referralCode) {
      setReferralCode(code);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [isRolesDropdownOpen, setIsRolesDropdownOpen] = useState(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [resetData, setResetData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const roles = [
    { id: 'user', name: 'User' },
    { id: 'vendor', name: 'Vendor' },
    { id: 'service_provider', name: 'Service Provider' },
    { id: 'educator', name: 'Educator' },
    { id: 'delivery_person', name: 'Delivery Rider 🛵' },
  ];

  const handleRoleCheckboxChange = (roleId) => {
    setFormData(prev => {
      const currentRoles = prev.roles || [];
      const updatedRoles = currentRoles.includes(roleId)
        ? currentRoles.filter(r => r !== roleId)
        : [...currentRoles, roleId];
      return { ...prev, roles: updatedRoles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (isLogin) {
      try {
        const response = await loginUser({
          email: formData.email,
          password: formData.password
        });
        const result = response;

        if (response.success && result.success) {
          setMessage({
            type: 'success',
            text: result.message || 'Login successful!'
          });

          const sessionData = {
            user: result.data.safeUser,
            token: result.data.access_token,
            isLoggedIn: true
          };
          login(sessionData);

          setTimeout(() => {
            const user = result.data.safeUser;
            const rolesList = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['user']);
            const roleStatuses = typeof user.roleStatus === 'object' && user.roleStatus ? user.roleStatus : {};
            
            const isVendor = rolesList.includes('vendor') || user.role === 'vendor' || !!roleStatuses.vendor || !!roleStatuses['vendor'] || !!user.vendorId || !!user.vendor;

            if (rolesList.includes('admin') || rolesList.includes('super_admin') || user.role === 'admin') {
              navigate('/admin?tab=dashboard');
            } else if (isVendor) {
              if (user.vendorId || user.isVendorOnboardingCompleted || user.vendor || rolesList.includes('vendor') || roleStatuses.vendor === 'APPROVED') {
                navigate('/vendor/dashboard');
              } else {
                navigate('/vendor/register');
              }
            } else if (rolesList.includes('delivery_person') || rolesList.includes('rider') || user.role === 'delivery_person') {
              navigate('/rider/dashboard');
            } else if (rolesList.includes('service_provider') || user.role === 'service_provider' || !!roleStatuses.service_provider) {
              navigate('/service-provider/dashboard');
            } else if (rolesList.includes('educator') || user.role === 'educator' || !!roleStatuses.educator) {
              navigate('/educator/dashboard');
            } else if (rolesList.includes('influencer') || user.role === 'influencer' || !!roleStatuses.influencer) {
              navigate('/influencer/dashboard');
            } else if (rolesList.includes('distributor') || user.role === 'distributor' || !!roleStatuses.distributor) {
              navigate('/distributor/dashboard');
            } else {
              navigate('/');
            }
          }, 1500);
        } else {
          setMessage({
            type: 'error',
            text: result.message || response.message || 'Login failed'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Login failed. Please check your credentials.'
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const effectiveReferral = (referralCode || getStoredReferralCode() || '').trim().toUpperCase();
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          roles: formData.roles && formData.roles.length > 0 ? formData.roles : ['user'],
          ...(effectiveReferral && { referralCode: effectiveReferral })
        };
        const response = await registerUser(payload);
        const result = response;

        if (response.success && result.success) {
          setMessage({
            type: 'success',
            text: result.message || 'Verification OTP sent to your email'
          });
          setTimeout(() => {
            setShowOTP(true);
            setMessage({ type: '', text: '' });
          }, 2000);
        } else {
          setMessage({
            type: 'error',
            text: result.message || response.message || 'Registration failed'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Something went wrong. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        email: formData.email,
        otp: otp
      };

      const response = isLogin
        ? await verifyLoginOtp(payload)
        : await verifyEmail(payload);

      const result = response;

      if (response.success && result.success) {
        setMessage({
          type: 'success',
          text: result.message || (isLogin ? 'Login successful!' : 'Email verified successfully!')
        });

        if (isLogin) {
          const sessionData = {
            user: result.data.safeUser,
            token: result.data.access_token,
            isLoggedIn: true
          };
          login(sessionData);

          setTimeout(() => {
            const user = result.data.safeUser;
            const rolesList = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['user']);
            let role = user.role || (Array.isArray(user.roles) ? (user.roles.find(r => r !== 'user') || 'user') : 'user');
            if (role === 'super_admin') role = 'admin';
            if (role === 'admin') navigate('/admin?tab=dashboard');
            else if (role === 'vendor' || user.vendorId || user.vendor || rolesList.includes('vendor')) {
              navigate('/vendor/dashboard');
            }
            else if (role === 'influencer') navigate('/influencer/dashboard');
            else if (role === 'distributor') navigate('/distributor/dashboard');
            else if (role === 'service_provider') navigate('/service-provider/dashboard');
            else if (role === 'educator') {
              navigate('/educator/dashboard');
            } else navigate('/');
          }, 1500);
        } else {
          clearStoredReferralCode();
          setTimeout(() => {
            setIsLogin(true);
            setShowOTP(false);
            setOtp('');
            setMessage({ type: 'success', text: 'Account verified! Please login.' });
          }, 2500);
        }
      } else {
        setMessage({
          type: 'error',
          text: result.message || response.message || 'Invalid OTP'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Verification failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await sendVerifyEmailOtp({ email: formData.email });
      const result = response;
      if (response.success && result.success) {
        setMessage({ type: 'success', text: result.message || 'OTP resent successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to resend OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (forgotStep === 1) {
        const response = await sendForgotPasswordOtp({ email: resetData.email });
        const result = response;
        if (response.success && result.success) {
          setMessage({ type: 'success', text: result.message || 'OTP sent successfully!' });
          setForgotStep(2);
        } else {
          setMessage({ type: 'error', text: result.message || 'Failed to send OTP' });
        }
      } else {
        if (resetData.newPassword !== resetData.confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match!' });
          setLoading(false);
          return;
        }

        const response = await verifyForgotPasswordOtp(resetData);
        const result = response;
        if (response.success && result.success) {
          setMessage({ type: 'success', text: 'Password reset successful!' });
          setTimeout(() => {
            setIsForgotPassword(false);
            setForgotStep(1);
            setIsLogin(true);
            setMessage({ type: 'success', text: 'Please login with your new password.' });
          }, 2000);
        } else {
          setMessage({ type: 'error', text: result.message || 'Reset failed' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isForgotPassword) {
      setResetData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 transition-all duration-500">
        <div className="text-center">
          <h2 className="text-[32px] font-bold text-primary uppercase mb-2">
            FASHIONFEVER
          </h2>
          <h3 className="mt-4 text-2xl font-bold text-gray-900 uppercase">
            {isForgotPassword ? 'Reset Password' : (showOTP ? 'Verification' : (isLogin ? 'Sign In' : 'Join Us'))}
          </h3>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            {isForgotPassword
              ? (forgotStep === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password')
              : (showOTP ? 'Enter the code sent to your email' : (isLogin ? 'Access your beauty portal' : 'Start your journey with FASHIONFEVER'))}
          </p>
        </div>

        <div className="mt-8">
          {!showOTP && !isForgotPassword && (
            <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setMessage({ type: '', text: '' });
                }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${isLogin ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setMessage({ type: '', text: '' });
                }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${!isLogin ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Sign up
              </button>
            </div>
          )}

          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold border transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
              {message.text}
            </div>
          )}

          {isForgotPassword ? (
            <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
              {forgotStep === 1 ? (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={resetData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all font-bold"
                    placeholder="Email address"
                  />
                </div>
              ) : (
                <>
                  <div className="relative group">
                    <input
                      name="otp"
                      type="text"
                      required
                      maxLength="6"
                      value={resetData.otp}
                      onChange={(e) => setResetData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                      className="block w-full text-center text-xl font-bold py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="000000"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      name="newPassword"
                      type="password"
                      required
                      value={resetData.newPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all font-bold"
                      placeholder="New Password"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={resetData.confirmPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all font-bold"
                      placeholder="Confirm New Password"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  forgotStep === 1 ? 'Send Reset Link' : 'Reset Password'
                )}
                {!loading && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={18} />
                  </span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotStep(1);
                    setMessage({ type: '', text: '' });
                  }}
                  className="text-sm font-bold text-gray-400 hover:text-primary transition-colors"
                >
                  Back to Sign in
                </button>
              </div>
            </form>
          ) : showOTP ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 uppercase">Verify your email</h3>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a 6-digit code to <span className="font-bold text-gray-900">{formData.email}</span>
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleVerifyOTP}>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="block w-full text-center text-2xl font-bold py-4 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    'Verify Code'
                  )}
                  {!loading && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={18} />
                    </span>
                  )}
                </button>

                <div className="text-center space-y-4">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm font-bold text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
                  >
                    Didn't receive code? Resend OTP
                  </button>
                  <br />
                  <button
                    type="button"
                    onClick={() => setShowOTP(false)}
                    className="text-sm font-bold text-gray-400 hover:text-primary transition-colors"
                  >
                    Back to {isLogin ? 'Sign in' : 'Sign up'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all font-bold"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 text-xs font-bold text-gray-400 uppercase -top-2 bg-white px-1 whitespace-nowrap z-10 pointer-events-none">Select Roles</span>
                    <button
                      type="button"
                      onClick={() => setIsRolesDropdownOpen(!isRolesDropdownOpen)}
                      style={{ border: '1px solid #e5e7eb' }}
                      className="flex justify-between items-center w-full pl-4 pr-3 py-3 border border-solid border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all font-bold cursor-pointer"
                    >
                      <span className="truncate">
                        {roles.filter(r => formData.roles?.includes(r.id)).map(r => r.name).join(', ') || 'Select Roles'}
                      </span>
                      <ChevronDown size={18} className="text-gray-400 shrink-0 ml-2" />
                    </button>

                    {isRolesDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsRolesDropdownOpen(false)}
                        />
                        <div className="absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                          {roles.map(role => {
                            const isChecked = formData.roles?.includes(role.id);
                            return (
                              <label
                                key={role.id}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer select-none transition-colors ${isChecked
                                  ? 'bg-primary/5 text-primary'
                                  : 'hover:bg-gray-50 text-gray-600'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleRoleCheckboxChange(role.id)}
                                  className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
                                />
                                <span className="text-sm font-bold">{role.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                      <Phone size={18} />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all font-bold"
                      placeholder="Phone Number"
                    />
                  </div>
                </>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all font-bold"
                  placeholder="Email address"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all font-bold"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <Tag size={18} />
                  </div>
                  <input
                    name="referralCode"
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="block w-full pl-10 pr-20 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all font-bold tracking-wider uppercase"
                    placeholder="Referral Code (Optional)"
                  />
                  {referralCode && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Applied
                    </span>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer font-bold">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setForgotStep(1);
                        setMessage({ type: '', text: '' });
                      }}
                      className="font-bold text-primary hover:text-primary-hover"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
                {!loading && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>
          )}

          {!showOTP && !isForgotPassword && (
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-bold uppercase text-sm">
                  {isLogin ? 'New to FashionFever?' : 'Already have an account?'}
                </span>
              </div>
            </div>
          )}

          {!showOTP && !isForgotPassword && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage({ type: '', text: '' });
                }}
                className="w-full flex justify-center py-3.5 px-4 border-2 border-gray-100 rounded-xl text-sm font-bold uppercase text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all duration-300"
              >
                {isLogin ? 'Create Account' : 'Sign In Now'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/rider/login')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-primary bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all cursor-pointer shadow-xs"
              >
                🛵 Express Delivery Rider Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
