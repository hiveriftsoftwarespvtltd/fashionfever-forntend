import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { 
  getUserById, 
  getUserWalletBalance, 
  getUserWalletTransactions 
} from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * User Details Modal with integrated Wallet Balances and Transactions ledger
 */
export const UserDetailsModal = ({ userId, onClose }) => {
  const { isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [userRes, walletRes, txRes] = await Promise.all([
          getUserById(userId),
          getUserWalletBalance(userId),
          getUserWalletTransactions(userId)
        ]);
        if (userRes.success) setUser(userRes.data);
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
    if (userId) fetchDetail();
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Profile...</span>
          </div>
        ) : user ? (
          <div className="flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5 bg-gray-900/10' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-white border border-gray-100 text-primary'}`}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h2 className={`text-sm font-black leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</h2>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{user.email}</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow scrollbar-thin">
              
              {/* Profile Details Cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Access Role', value: user.role, isTag: true },
                  { label: 'Status', value: user.isActive ? 'Active' : 'Inactive', isStatus: true },
                  { label: 'Registration', value: new Date(user.createdAt).toLocaleDateString() },
                  { label: 'System ID', value: user._id, isMono: true }
                ].map((item, i) => (
                  <div key={i} className={`flex flex-col justify-center p-4 rounded-2xl text-left ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{item.label}</span>
                    {item.isTag ? (
                      <span className="inline-block w-fit px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-sm font-bold uppercase">{item.value}</span>
                    ) : item.isStatus ? (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]'}`}></div>
                        <span className={`text-sm font-bold uppercase ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>{item.value}</span>
                      </div>
                    ) : (
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'} ${item.isMono ? 'font-mono opacity-60 text-xs' : 'uppercase'}`}>
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Wallet Summary Card */}
              {wallet && (
                <div className={`p-5 rounded-2xl border text-left transition-colors duration-300 ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-emerald-50/20 border-emerald-200/60'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                      Customer Wallet Balance
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Liquid
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Available</span>
                      <span className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                        ₹{(wallet.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-zinc-200 dark:border-zinc-800 pl-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Total Credits</span>
                      <span className="text-base font-bold text-emerald-500">
                        ₹{(wallet.totalCredits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-zinc-200 dark:border-zinc-800 pl-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Total Debits</span>
                      <span className="text-base font-bold text-rose-500">
                        ₹{(wallet.totalDebits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    No transactions recorded for this wallet.
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
                Close Profile
              </button>
            </div>
            
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserDetailsModal;
