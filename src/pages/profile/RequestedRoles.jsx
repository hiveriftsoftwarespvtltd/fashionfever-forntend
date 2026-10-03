import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ShieldCheck, 
  Store, 
  Sparkles, 
  BookOpen, 
  User, 
  Loader2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import UserSidebar from './UserSidebar';
import { getRequestedRoles, applyForRoles } from '../../api/authService';
import { toast } from '../../utils/toast';

const RequestedRoles = () => {
  const [rolesStatus, setRolesStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingRole, setSubmittingRole] = useState(null);

  const fetchRoles = async () => {
    try {
      const response = await getRequestedRoles();
      if (response.success && response.data) {
        setRolesStatus(response.data);
      } else {
        setError(response.message || 'Failed to load role statuses.');
      }
    } catch (err) {
      console.error('Error fetching requested roles:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleApplyRole = async (roleKey) => {
    if (submittingRole) return;
    setSubmittingRole(roleKey);
    try {
      const response = await applyForRoles({ roles: [roleKey] });
      if (response.success) {
        toast.success(response.message || `Application for ${roleKey} role submitted successfully!`);
        // Re-fetch statuses to update UI
        await fetchRoles();
      } else {
        toast.error(response.message || `Failed to submit application for ${roleKey}.`);
      }
    } catch (err) {
      console.error('Error applying for role:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmittingRole(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 uppercase animate-pulse">
            Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
            Rejected
          </span>
        );
      case 'NOT_ONBOARDED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200 uppercase">
            Not Onboarded
          </span>
        );
    }
  };

  const getRoleCardDetails = (roleKey, status) => {
    const details = {
      user: {
        title: 'Customer',
        description: 'Shop cosmetics, book luxury salon slots, and learn via beauty academy courses.',
        icon: <User className="text-blue-500" size={24} />,
        actionLink: '/'
      },
      vendor: {
        title: 'Vendor Partner',
        description: 'Sell cosmetic products, manage stock lists, and run sales campaigns on our marketplace.',
        icon: <Store className="text-pink-500" size={24} />,
        actionLink: status === 'APPROVED' ? '/vendor/dashboard' : '/vendor/register'
      },
      service_provider: {
        title: 'Service Provider',
        description: 'Provide premium beauty, hair, bridal salon treatments, and manage bookings.',
        icon: <Sparkles className="text-purple-500" size={24} />,
        actionLink: '/service-provider/dashboard'
      },
      educator: {
        title: 'Educator / Instructor',
        description: 'Launch academies, create structured beauty video tutorials, and certify students.',
        icon: <BookOpen className="text-orange-500" size={24} />,
        actionLink: status === 'APPROVED' ? '/educator/dashboard' : '/educator/onboard'
      },
      influencer: {
        title: 'Influencer / Creator',
        description: 'Partner with beauty brands, share products referral links, and earn commissions.',
        icon: <Sparkles className="text-emerald-500" size={24} />,
        actionLink: status === 'APPROVED' ? '/influencer/dashboard' : '/influencer/registration'
      }
    };

    return details[roleKey] || {
      title: roleKey.replace('_', ' ').toUpperCase(),
      description: 'Manage specialized activities and integrations within FASHIONFEVER.',
      icon: <ShieldCheck className="text-primary" size={24} />,
      actionLink: null
    };
  };

  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 font-outfit">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8 text-left">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">Role Status</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <UserSidebar />

          {/* Right Content */}
          <div className="flex-grow">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] overflow-hidden flex flex-col justify-between text-left">
              
              <div>
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <h1 className="text-xl font-extrabold text-gray-900 uppercase flex items-center gap-2">
                    <ShieldCheck size={20} className="text-primary" /> Requested Role Status
                  </h1>
                  <p className="text-xs text-gray-500 mt-1 font-bold">
                    View approval status and register/onboard for business roles within the beauty ecosystem.
                  </p>
                </div>

                {/* Content Area */}
                <div className="p-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                      <Loader2 className="animate-spin text-primary mb-4" size={32} />
                      <p className="text-sm font-bold text-gray-500 uppercase">Fetching requested roles status...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <AlertCircle className="text-red-500 mb-4" size={40} />
                      <p className="text-sm font-bold text-red-600 uppercase mb-1">{error}</p>
                      <p className="text-xs text-gray-400">Please reload the page or try again later.</p>
                    </div>
                  ) : rolesStatus ? (
                    <div className="space-y-6">
                      {['user', 'vendor', 'service_provider', 'educator', 'influencer'].map((roleKey) => {
                        const status = rolesStatus[roleKey] || 'NOT_ONBOARDED';
                        const { title, description, icon, actionLink } = getRoleCardDetails(roleKey, status);
                        return (
                          <div 
                            key={roleKey}
                            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border rounded-2xl gap-4 transition-all duration-300 ${
                              status === 'APPROVED' 
                                ? 'border-green-100 bg-green-50/[0.08] hover:border-green-200' 
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                            <div className="flex gap-4 items-start">
                              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                                {icon}
                              </div>
                              <div>
                                <h3 className="text-sm font-extrabold text-gray-900 uppercase flex items-center gap-2">
                                  {title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-bold max-w-lg">
                                  {description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start">
                              {getStatusBadge(status)}
                              
                              {status === 'APPROVED' && actionLink && (
                                <Link 
                                  to={actionLink}
                                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-98"
                                >
                                  Go to Dashboard
                                </Link>
                              )}

                              {status === 'NOT_ONBOARDED' && actionLink && (
                                <Link 
                                  to={actionLink}
                                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase rounded-xl text-white bg-primary hover:bg-primary/95 shadow-sm transition-all whitespace-nowrap cursor-pointer hover:translate-x-0.5"
                                >
                                  Onboard Form
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <ShieldCheck className="text-gray-300 mb-4" size={40} />
                      <p className="text-sm font-bold text-gray-400 uppercase">No active roles statuses found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Footer */}
              <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-xs text-gray-400 font-bold leading-relaxed">
                * Note: Processing of educator, service provider, or vendor roles requires verification of submitted registration applications. It usually takes 24-48 business hours to receive review decisions.
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RequestedRoles;
