import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  FileText, 
  AlertCircle, 
  ChevronRight,
  PlusCircle,
  Download,
  History
} from 'lucide-react';

const DistributorDashboard = () => {
  const [activeTab, setActiveTab] = useState('bulk');

  const pricingTiers = [
    { qty: '50-100 units', discount: '15% OFF' },
    { qty: '101-500 units', discount: '25% OFF' },
    { qty: '500+ units', discount: '40% OFF' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 hidden lg:flex flex-col">
        <div className="h-20 px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-black text-primary uppercase tracking-widest leading-none">
              FashionFever
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide block mt-1.5 whitespace-nowrap">
              Distributor Dashboard
            </span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          <button 
            onClick={() => setActiveTab('bulk')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'bulk' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Package size={19} /> Bulk Orders
          </button>
          <button 
            onClick={() => setActiveTab('preorder')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              activeTab === 'preorder' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Clock size={19} /> Pre-orders
          </button>
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-all text-left cursor-pointer"
          >
            <History size={19} /> Order History
          </button>
        </nav>
      </div>

      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
           <h1 className="text-2xl font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
             {activeTab === 'bulk' ? 'Bulk Order Management' : 'Pre-Order System'}
           </h1>
           <div className="flex gap-4">
              <button className="bg-zinc-900 dark:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-all cursor-pointer">
                 <Download size={15} /> Catalog
              </button>
           </div>
        </header>

        {activeTab === 'bulk' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Bulk Form */}
            <div className="xl:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
               <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Create New Bulk Request</h2>
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Product</label>
                        <select className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-primary transition-all">
                           <option>Velvet Matte Lipstick (Pack of 50)</option>
                           <option>Hydrating Serum (Pack of 100)</option>
                           <option>Moisturizer Bulk Kit</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Quantity</label>
                        <input type="number" placeholder="Min 50 units" className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-primary transition-all" />
                     </div>
                  </div>
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                     <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Applied Discount:</span>
                        <span className="text-sm font-bold text-primary">25% (Bulk Tier 2)</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Estimated Total:</span>
                        <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">₹42,500</span>
                     </div>
                  </div>
                  <button className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transition-all">
                     Submit Bulk Order <ChevronRight size={18} />
                  </button>
               </div>
            </div>

            {/* Tiers & Info */}
            <div className="space-y-6">
               <div className="bg-zinc-900 border border-zinc-800 text-white p-8 rounded-3xl">
                  <h3 className="text-sm font-bold uppercase tracking-wide mb-6">Distributor Pricing Tiers</h3>
                  <div className="space-y-4">
                     {pricingTiers.map((tier, i) => (
                       <div key={i} className="flex justify-between items-center p-3 border-b border-zinc-800 last:border-0">
                          <span className="text-xs font-semibold text-zinc-400">{tier.qty}</span>
                          <span className="text-sm font-bold text-primary">{tier.discount}</span>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Truck size={24} /></div>
                  <div>
                     <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">Priority Shipping</p>
                     <p className="text-xs font-semibold text-zinc-500 uppercase mt-0.5">Distributors get 48h delivery</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                   <AlertCircle size={18} />
                   <span className="text-xs font-bold uppercase tracking-wider">Low Stock Notifications</span>
                </div>
                <h2 className="text-lg font-bold uppercase tracking-wide">Pre-Order Status</h2>
             </div>
             <table className="w-full text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                   <tr>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Estimated Restock</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">My Pre-orders</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                   {[1,2].map((i) => (
                     <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-xs text-zinc-500">FF</div>
                              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Skin Glow Kit</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">15 May 2024</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">250 Units</td>
                        <td className="px-6 py-4">
                           <button className="text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer">Update Qty</button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Clock = ({ size }) => <AlertCircle size={size} />;

export default DistributorDashboard;
