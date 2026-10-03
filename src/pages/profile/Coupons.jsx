import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Ticket, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import UserSidebar from './UserSidebar';
import { toast } from '../../utils/toast';

const Coupons = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [copiedCode, setCopiedCode] = useState('');
  const [promoInput, setPromoInput] = useState('');

  const coupons = [
    {
      id: 1,
      code: 'BEAUTY50',
      discount: '50% OFF',
      title: 'Mega Summer Beauty Sale',
      desc: 'Valid on all skincare, makeup products & luxury perfume catalog.',
      minOrder: '₹1,499',
      expiry: '31 May 2026',
      status: 'active',
      premium: true
    },
    {
      id: 2,
      code: 'FASHIONFEVERNEW',
      discount: '₹200 OFF',
      title: 'First Order Special Gift',
      desc: 'Flat discount on your very first order of cosmetics or salon slots.',
      minOrder: '₹799',
      expiry: '30 Jun 2026',
      status: 'active',
      premium: false
    },
    {
      id: 3,
      code: 'GLAM25',
      discount: '25% OFF',
      title: 'Glam & Glow Weekend Tier',
      desc: 'Exclusive discount code on booking premium salon service trials.',
      minOrder: '₹1,999',
      expiry: '29 May 2026',
      status: 'active',
      premium: false
    },
    {
      id: 4,
      code: 'EXPIRED30',
      discount: '30% OFF',
      title: 'Spring Festival Clearance',
      desc: 'Expired clearance sale coupons for cosmetics and lip kits.',
      minOrder: '₹999',
      expiry: '10 May 2026',
      status: 'expired',
      premium: false
    },
    {
      id: 5,
      code: 'WELCOME10',
      discount: '10% OFF',
      title: 'Newsletter Signup Reward',
      desc: 'Already redeemed discount for joining the FashionFever squad.',
      minOrder: '₹499',
      expiry: '15 Apr 2026',
      status: 'redeemed',
      premium: false
    }
  ];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied!`);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) {
      toast.error('Please enter a coupon code.');
      return;
    }
    const matched = coupons.find(c => c.code.toLowerCase() === promoInput.trim().toLowerCase());
    if (matched) {
      if (matched.status === 'active') {
        toast.success(`Coupon "${matched.code}" is valid! Go to checkout to apply.`);
      } else {
        toast.error(`Coupon "${matched.code}" has already expired or been used.`);
      }
    } else {
      toast.error('Invalid coupon code. Please check and try again.');
    }
    setPromoInput('');
  };

  const filteredCoupons = coupons.filter(c => {
    if (activeTab === 'active') return c.status === 'active';
    return c.status === 'expired' || c.status === 'redeemed';
  });

  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 font-outfit">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8 text-left">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">My Coupons</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <UserSidebar />

          {/* Right Content */}
          <div className="flex-grow">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] overflow-hidden flex flex-col justify-between text-left">
              
              <div>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h1 className="text-xl font-extrabold text-gray-900 uppercase flex items-center gap-2">
                    <Ticket size={20} className="text-primary" /> My Coupons & Offers
                    <span className="text-primary text-base">({coupons.filter(c => c.status === 'active').length})</span>
                  </h1>

                  {/* Apply coupon promo input form */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2 w-full sm:w-auto">
                    <input 
                      type="text"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      placeholder="ENTER PROMO CODE"
                      className="border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase outline-none transition-all w-full sm:w-48 bg-gray-50/50"
                    />
                    <button 
                      type="submit"
                      className="bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase px-5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                      Check Code
                    </button>
                  </form>
                </div>

                {/* Tabs selection */}
                <div className="px-6 border-b border-gray-50 flex gap-6">
                  <button 
                    onClick={() => setActiveTab('active')}
                    className={`py-4 text-xs font-bold uppercase transition-all border-b-2 cursor-pointer ${
                      activeTab === 'active' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    Active Coupons ({coupons.filter(c => c.status === 'active').length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`py-4 text-xs font-bold uppercase transition-all border-b-2 cursor-pointer ${
                      activeTab === 'history' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    Redeemed / Expired ({coupons.filter(c => c.status !== 'active').length})
                  </button>
                </div>

                {/* Coupon Cards Grid */}
                <div className="p-6">
                  {filteredCoupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-4">
                        <Ticket size={28} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-extrabold text-gray-400 uppercase mb-1">No coupons available</p>
                      <p className="text-xs text-gray-400">Keep shopping to unlock exclusive reward discounts!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredCoupons.map((coupon) => (
                        <div 
                          key={coupon.id} 
                          className={`relative border rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                            coupon.status !== 'active'
                              ? 'border-gray-100 bg-gray-50/40 opacity-60'
                              : coupon.premium
                              ? 'border-primary/30 bg-primary/[0.01] hover:border-primary/50'
                              : 'border-gray-100 hover:border-gray-200 bg-white'
                          }`}
                        >
                          {/* Premium badge */}
                          {coupon.status === 'active' && coupon.premium && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
                              <Sparkles size={10} /> Mega Offer
                            </div>
                          )}

                          {/* Red / Gray Coupon status tag for history */}
                          {coupon.status !== 'active' && (
                            <div className={`absolute top-0 right-0 text-xs font-bold uppercase px-3 py-1 rounded-bl-xl ${
                              coupon.status === 'redeemed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {coupon.status}
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            {/* Discount bubble tag */}
                            <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-center font-bold ${
                              coupon.status !== 'active'
                                ? 'bg-gray-100 text-gray-400 border border-gray-200/50'
                                : 'bg-primary/5 text-primary border border-primary/10'
                            }`}>
                              <span className="text-xs leading-none">FLAT</span>
                              <span className="text-base tracking-tighter mt-0.5 leading-none">{coupon.discount.split(' ')[0]}</span>
                              <span className="text-xs leading-none mt-0.5">{coupon.discount.split(' ')[1] || 'OFF'}</span>
                            </div>

                            {/* Details info */}
                            <div className="flex-grow min-w-0 pr-4">
                              <h3 className={`text-sm font-extrabold truncate ${coupon.status === 'active' ? 'text-gray-950' : 'text-gray-500'}`}>
                                {coupon.title}
                              </h3>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1 line-clamp-2">
                                {coupon.desc}
                              </p>
                              
                              {/* Order & expiry restrictions */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-dashed border-gray-100 text-xs font-bold text-gray-400 uppercase">
                                <span className="flex items-center gap-1">
                                  Min. Order: <strong className="text-gray-600">{coupon.minOrder}</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> Expired: <strong className="text-gray-600">{coupon.expiry}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Copy promo action button */}
                          {coupon.status === 'active' && (
                            <div className="mt-4 flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                              <code className="text-xs font-bold uppercase text-gray-900 tracking-normal pl-2 select-all">
                                {coupon.code}
                              </code>
                              <button 
                                onClick={() => handleCopy(coupon.code)}
                                className="flex items-center gap-1 bg-white hover:bg-primary hover:text-white border border-gray-200 hover:border-primary text-gray-700 text-sm font-bold uppercase px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
                              >
                                {copiedCode === coupon.code ? (
                                  <>
                                    <Check size={12} className="text-green-500 hover:text-white" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} /> Copy Code
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Policy info footer banner */}
              <div className="m-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3 text-left">
                <AlertCircle className="text-gray-400 flex-shrink-0" size={16} />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-gray-600 uppercase">Coupon Usage Policy</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xl">
                    Only one coupon code can be applied per checkout pipeline session. Certain rewards cannot be combined with sitewide promotions or sales.
                  </p>
                </div>
              </div>

            </div>
          </div>{/* end right content */}

        </div>
      </div>
    </div>
  );
};

export default Coupons;
