import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Ticket, 
  Wallet, 
  ShoppingBag, 
  Heart, 
  CreditCard, 
  LogOut,
  Package,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  ShieldCheck,
  Headphones,
  ClipboardList
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

const sidebarLinks = [
  { icon: <User size={19} />,        label: 'My Profile',       path: '/profile' },
  { icon: <ShieldCheck size={19} />, label: 'Role Status',      path: '/requested-roles' },
  { icon: <Headphones size={19} />,  label: 'Help & Support',   path: '/support' },
  { icon: <Package size={19} />,     label: 'My Orders',        path: '/orders' },
  { icon: <MapPin size={19} />,      label: 'My Addresses',     path: '/address' },
  { icon: <Ticket size={19} />,      label: 'My Coupons',       path: '/coupons' },
  { icon: <Wallet size={19} />,      label: 'My Wallet',        path: '/wallet' },
  { icon: <ShoppingBag size={19} />, label: 'My booking',       path: '/my-appointments' },
  { icon: <ClipboardList size={19} />, label: 'Custom Requests', path: '/profile/service-leads' },
  { icon: <BookOpen size={19} />,    label: 'My Learning',      path: '/my-learning' },
  { icon: <Heart size={19} />,       label: 'My Wishlist',      path: '/wishlist' },
  // { icon: <CreditCard size={19} />,  label: 'My Saved Payment', path: '/payments' },
];

const UserSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Find the active link details
  const activeLink = sidebarLinks.find(link => location.pathname === link.path);

  return (
    <div className="w-full lg:w-72 lg:sticky lg:top-28 self-start flex-shrink-0 z-30 font-outfit">
      
      {/* Mobile Toggle Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center justify-between shadow-sm cursor-pointer lg:hidden hover:border-primary/20 transition-all"
      >
        <div className="flex items-center gap-3 text-primary font-bold text-sm uppercase">
          {activeLink?.icon || <Menu size={19} />}
          <span>{activeLink?.label || 'Account Menu'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 font-bold text-sm uppercase">
          <span>{isOpen ? 'Close' : 'Menu'}</span>
          {isOpen ? <X size={16} className="text-primary stroke-[3]" /> : <ChevronDown size={16} className="stroke-[3]" />}
        </div>
      </button>

      {/* Sidebar Links Menu (Expandable on Mobile, Always Block on Desktop) */}
      <div className={`mt-3 lg:mt-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
        isOpen ? 'block animate-in fade-in slide-in-from-top-4 duration-300' : 'hidden lg:block'
      }`}>
        <div className="px-5 py-4 border-b border-gray-100 bg-rose-50/40 text-left">
          <p className="text-xs font-black uppercase text-primary tracking-widest leading-none">FashionFever</p>
          <p className="text-sm font-extrabold uppercase text-gray-900 tracking-wide mt-1">User Account Dashboard</p>
        </div>
        <div className="flex flex-col">
          {sidebarLinks.map((link, idx) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={idx}
                to={link.path}
                onClick={() => setIsOpen(false)} // Close drawer on link click on mobile
                className={`flex items-center gap-4 px-6 py-4 transition-all border-b border-gray-50 last:border-0 group ${
                  isActive
                    ? 'bg-rose-50/30 text-primary border-r-4 border-r-primary font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}>
                  {link.icon}
                </span>
                <span className="text-sm font-semibold uppercase">{link.label}</span>
              </Link>
            );
          })}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 w-full text-left transition-all border-t border-gray-50 cursor-pointer"
          >
            <LogOut size={19} />
            <span className="text-sm font-semibold uppercase">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;

