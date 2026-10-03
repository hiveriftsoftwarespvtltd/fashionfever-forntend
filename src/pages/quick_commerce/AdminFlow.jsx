import React, { useState, useEffect } from 'react';
import { 
  getQuickAdminDashboard, 
  getQuickAdminVendors 
} from '../../api/quickECommerceService';
import { 
  DollarSign, TrendingUp, Users, ShoppingBag, 
  Store, ShieldAlert, Award, CheckCircle, RefreshCw 
} from 'lucide-react';

const AdminFlow = () => {
  const [stats, setStats] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminDashboard();
    fetchAdminVendors();
  }, []);

  const fetchAdminDashboard = async () => {
    try {
      const res = await getQuickAdminDashboard();
      if (res?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminVendors = async () => {
    setLoading(true);
    try {
      const res = await getQuickAdminVendors(1, 50);
      if (res?.success) {
        setVendors(res.data?.vendors || res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-3xl border border-slate-100 p-6 md:p-8">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-xl">
            <DollarSign size={20} />
          </div>
          <p className="text-white/70 font-semibold text-xs uppercase tracking-wider mb-2">Global Gross Volume</p>
          <h2 className="text-2xl font-black">₹{(stats?.totalSales || 0).toFixed(2)}</h2>
          <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full mt-2 inline-block">
            All Express Orders
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Platform Earnings</span>
            <div className="bg-emerald-50 text-emerald-500 p-2 rounded-xl">
              <TrendingUp size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            ₹{(stats?.platformCommission || 0).toFixed(2)}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-2">Commission collected on profits</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Vendor Settlements</span>
            <div className="bg-indigo-50 text-indigo-500 p-2 rounded-xl">
              <Store size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            ₹{(stats?.vendorPayoutAmount || 0).toFixed(2)}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-2">Payout settlements generated</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Net Express Orders</span>
            <div className="bg-rose-50 text-rose-500 p-2 rounded-xl">
              <ShoppingBag size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            {stats?.totalOrders || 0}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-2">Placed quick delivery counts</p>
        </div>
      </div>

      {/* Enabled Vendors Directory */}
      <div className="flex flex-col gap-6 text-left">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Store size={16} className="text-primary" />
            <span>Quick-Commerce Enabled Vendors Directory ({vendors.length})</span>
          </h3>
          <button
            onClick={() => {
              fetchAdminDashboard();
              fetchAdminVendors();
            }}
            className="text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="animate-spin text-primary" size={24} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching directory...</span>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <Store className="mx-auto mb-4 text-slate-350 stroke-[1.5]" size={48} />
            <h4 className="text-sm font-black uppercase text-slate-700 tracking-wider">No Active Vendors</h4>
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-2">
              There are no stores on the platform with quick delivery capabilities turned ON at this moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-3xl shadow-sm">
            <table className="w-full border-collapse text-left text-slate-600">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-150 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Vendor Info</th>
                  <th className="py-4 px-6 text-center">Service Status</th>
                  <th className="py-4 px-6 text-center">Accepting Orders</th>
                  <th className="py-4 px-6 text-center">Service Radius</th>
                  <th className="py-4 px-6 text-center">Max Concurrent</th>
                  <th className="py-4 px-6 text-center">Avg Prep Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {vendors.map((vendor) => {
                  const qc = vendor.quickCommerce || {};
                  return (
                    <tr key={vendor._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                          {vendor.businessName?.charAt(0) || vendor.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 uppercase truncate">
                            {vendor.businessName || vendor.name || 'Store Merchant'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {vendor.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${
                          qc.enabled 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-red-50 text-red-500 border-red-100'
                        }`}>
                          {qc.enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${
                          qc.acceptingOrders 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {qc.acceptingOrders ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-700">
                        {qc.serviceRadius || 5} KM
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-700">
                        {qc.maxConcurrentOrders || 20} Orders
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-700">
                        {qc.defaultPreparationTime || 10} Mins
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFlow;
