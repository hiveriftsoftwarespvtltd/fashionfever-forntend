import React, { useState, useEffect } from 'react';
import { Store, X, Loader2 } from 'lucide-react';
import { 
  getVendorById, 
  getVendorWalletBalance,
  getVendorWalletTransactions
} from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Vendor Details Modal with integrated Wallet Balance and Transactions details
 */
const VendorDetailsModal = ({ vendorId, onClose }) => {
  const { isDarkMode } = useTheme();
  const [details, setDetails] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const vendor = details?.vendor || details;
  const productsCount = details?.vendorProducts?.length || 0;
  const categoriesCount = details?.vendorCategories?.length || 0;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [vendorRes, walletRes, txRes] = await Promise.all([
          getVendorById(vendorId),
          getVendorWalletBalance(vendorId),
          getVendorWalletTransactions(vendorId)
        ]);
        if (vendorRes.success) setDetails(vendorRes.data);
        if (walletRes.success) setWallet(walletRes.data);
        if (txRes.success) {
          const list = txRes.data?.data ?? txRes.data ?? [];
          setTransactions(Array.isArray(list) ? list : []);
        }
      } catch (err) { 
        console.error(err); 
      }
      setLoading(false);
    };
    if (vendorId) fetchDetail();
  }, [vendorId]);

  if (!vendorId) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-left">
      <div className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Shop...</span>
          </div>
        ) : vendor ? (
          <div className="flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5 bg-gray-900/10' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm overflow-hidden flex-shrink-0 ${isDarkMode ? 'bg-gray-900 text-gray-500 border border-white/5' : 'bg-gray-50 text-primary border border-gray-100'}`}>
                  {vendor.logo?.url ? (
                    <img src={vendor.logo.url} alt={vendor.businessName} className="w-full h-full object-cover" />
                  ) : (
                    <Store size={24} />
                  )}
                </div>
                <div className="text-left">
                  <h2 className={`text-base font-black leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{vendor.businessName || 'Vendor Details'}</h2>
                  <p className="text-xs font-bold text-primary lowercase tracking-wider mt-0.5">/{vendor.slug || 'brand'}</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow scrollbar-thin">
              
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-left">
                {[
                  { label: 'Shop Status', value: vendor.status || 'PENDING', isTag: true, color: vendor.status === 'APPROVED' ? 'text-green-500 bg-green-500/10' : vendor.status === 'REJECTED' ? 'text-red-500 bg-red-500/10' : 'text-amber-500 bg-amber-500/10' },
                  { label: 'Owner Name', value: vendor.ownerId?.name || 'N/A' },
                  { label: 'Owner Email', value: vendor.ownerId?.email || vendor.email || 'N/A', isMono: true },
                  { label: 'Contact Phone', value: vendor.phone || vendor.ownerId?.phone || 'N/A' },
                  { label: 'Location / City', value: [vendor.city, vendor.state].filter(Boolean).join(', ') || 'N/A' },
                  { label: 'Pincode', value: vendor.vendorPincode || 'N/A' },
                  { label: 'Store Address', value: vendor.address || 'N/A', colSpan: 'col-span-2' },
                  { label: 'Commission Rate', value: `${vendor.commissionRate || 0}%` },
                  { label: 'Products Listed', value: `${productsCount} Items` },
                  { label: 'Onboarding Date', value: vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A' },
                  { label: 'Shop ID', value: vendor._id, isMono: true, colSpan: 'col-span-2' }
                ].map((item, i) => (
                  <div key={i} className={`flex flex-col justify-center p-3.5 rounded-2xl ${item.colSpan || ''} ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{item.label}</span>
                    {item.isTag ? (
                      <span className={`inline-block w-fit px-2.5 py-0.5 rounded-lg text-xs font-black uppercase ${item.color}`}>{item.value}</span>
                    ) : (
                      <span className={`text-sm font-bold break-all ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'} ${item.isMono ? 'font-mono text-xs' : ''}`}>
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Vendor Wallet Balance Summary */}
              {wallet && (
                <div className={`p-5 rounded-2xl border text-left transition-colors duration-300 ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-emerald-50/20 border-emerald-200/60'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                      Merchant Wallet Ledger
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Payout Ready
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Liquid Balance</span>
                      <span className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                        ₹{(wallet.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-zinc-200 dark:border-zinc-800 pl-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Pending Escrow</span>
                      <span className="text-base font-bold text-amber-500">
                        ₹{(wallet.pendingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-zinc-200 dark:border-zinc-800 pl-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Total Earnings</span>
                      <span className="text-base font-bold text-emerald-500">
                        ₹{(wallet.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions History Ledger */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                    Transaction Audit Ledger
                  </span>
                  <span className="text-xs text-zinc-400 font-bold uppercase">
                    {(transactions || []).length} Records
                  </span>
                </div>
                
                {(!transactions || transactions.length === 0) ? (
                  <div className="py-6 text-center text-xs font-bold text-zinc-400 uppercase italic">
                    No transactions recorded for this merchant wallet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                    {transactions.map((tx) => (
                      <div 
                        key={tx._id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                          isDarkMode 
                            ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                            : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 max-w-[70%] text-left">
                          <span className={`font-bold text-xs ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                            {tx.description || tx.reason || 'Transaction'}
                          </span>
                          <span className="text-xs text-zinc-400 font-bold uppercase">
                            {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="text-right flex flex-col items-end gap-0.5 flex-shrink-0">
                          <span className={`font-black text-sm ${
                            tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono font-bold uppercase">
                            Bal: ₹{(tx.balanceAfterTransaction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'border-white/5 bg-gray-900/10' : 'border-gray-100 bg-gray-50/50'}`}>
              <button onClick={onClose} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
                Close Review
              </button>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VendorDetailsModal;
