import React from 'react';
import { IndianRupee, Clock, Truck, ShieldCheck } from 'lucide-react';

const VendorStatsOverview = ({ stats, orders = [], riders = [], enabled }) => {
  const activePipelineCount = orders.filter(o =>
    ['PLACED', 'PREPARING', 'WAITING_FOR_DELIVERY_BOY'].includes(o.status)
  ).length;

  const availableRidersCount = riders.filter(r => r.status === 'AVAILABLE').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
      <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-xl">
          <IndianRupee size={20} />
        </div>
        <p className="text-white/70 font-semibold text-xs uppercase tracking-wider mb-2">Express Revenue</p>
        <h2 className="text-2xl font-black">₹{(stats?.totalRevenue || stats?.totalSales || 0).toFixed(2)}</h2>
        <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full mt-2 inline-block">
          {stats?.totalOrders || 0} Orders Received
        </span>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Active Pipeline</span>
          <div className="bg-amber-50 text-amber-500 p-2 rounded-xl">
            <Clock size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800">
          {activePipelineCount}
        </h2>
        <p className="text-xs font-semibold text-slate-400 mt-2">Orders in preparation or transit</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Active Riders</span>
          <div className="bg-emerald-50 text-emerald-500 p-2 rounded-xl">
            <Truck size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800">
          {availableRidersCount} / {riders.length}
        </h2>
        <p className="text-xs font-semibold text-slate-400 mt-2">Available express deliverers</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Delivery Mode</span>
          <div className={`p-2 rounded-xl ${enabled ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
            <ShieldCheck size={16} />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 uppercase">
          {enabled ? 'ONLINE' : 'OFFLINE'}
        </h2>
        <p className="text-xs font-semibold text-slate-400 mt-2">Accepting instant requests</p>
      </div>
    </div>
  );
};

export default VendorStatsOverview;
