import React from 'react';
import Swal from 'sweetalert2';
import { Zap, ShoppingCart, Package } from 'lucide-react';

const CustomerSubNav = ({
  activeSubTab,
  setActiveSubTab,
  quickCartCount = 0,
  ordersCount = 0,
  isAuthenticated
}) => {
  const tabs = [
    {
      id: 'shop',
      label: 'Lightning Deals',
      icon: <Zap size={14} className="shrink-0" />,
      count: null,
      onClick: () => setActiveSubTab('shop'),
    },
    {
      id: 'cart',
      label: 'Express Cart',
      icon: <ShoppingCart size={14} className="shrink-0" />,
      count: quickCartCount,
      onClick: () => {
        setActiveSubTab('cart');
      },
    },
  ];

  return (
    <div className="flex items-center gap-2 mb-5 sm:mb-8 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeSubTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={tab.onClick}
            className={`
              relative flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl
              font-bold text-[11px] sm:text-xs uppercase tracking-wide whitespace-nowrap
              transition-all duration-300 cursor-pointer select-none
              ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.03]'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }
            `}
          >
            <span className={`transition-colors duration-300 ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`
                  inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                  rounded-full text-xs font-extrabold leading-none transition-all duration-300
                  ${isActive
                    ? 'bg-white/25 text-white'
                    : tab.count > 0
                      ? 'bg-primary text-white'
                      : 'bg-slate-300 text-slate-500'
                  }
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CustomerSubNav;
