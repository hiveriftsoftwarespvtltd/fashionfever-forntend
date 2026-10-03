import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  History,
  Gift,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Loader2,
  Plus
} from 'lucide-react';
import { getWalletTransactions, addWalletBalance } from '../../api/walletService';
import { useWallet } from '../../context/WalletContext';
import UserSidebar from './UserSidebar';
import Swal from 'sweetalert2';

const Wallet = () => {
  const { balanceData, loading: balanceLoading, refreshWalletBalance } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const handleAddMoneyPrompt = () => {
    Swal.fire({
      title: 'Add Money to Wallet',
      html: `
        <div class="space-y-4 text-left font-outfit mt-4">
          <div class="space-y-1.5">
            <label class="text-sm font-black text-gray-400 uppercase block">Amount (₹) *</label>
            <input 
              id="swal-amount-input" 
              type="number" 
              placeholder="e.g. 20000" 
              class="w-full px-4 py-3 bg-gray-50/70 border border-gray-100 focus:bg-white rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-800"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-black text-gray-400 uppercase block">Description</label>
            <input 
              id="swal-desc-input" 
              type="text" 
              placeholder="e.g. For Ordering / Top-up" 
              class="w-full px-4 py-3 bg-gray-50/70 border border-gray-100 focus:bg-white rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-800"
            />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#fe3e6a',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Add Balance Now 💰',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const amountVal = document.getElementById('swal-amount-input').value;
        const descVal = document.getElementById('swal-desc-input').value;

        if (!amountVal || parseFloat(amountVal) <= 0) {
          Swal.showValidationMessage('Please enter a valid positive amount.');
          return false;
        }

        return {
          amount: parseFloat(amountVal),
          description: descVal || 'Wallet Top-up',
          reason: 'ADD_MONEY'
        };
      },
      customClass: {
        popup: 'rounded-3xl font-outfit p-8',
        confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3.5 shadow-lg shadow-primary/20',
        cancelButton: 'rounded-xl font-black uppercase text-xs px-6 py-3.5'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Processing Transaction...',
          text: 'Please wait while we update your wallet account.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          customClass: {
            popup: 'rounded-3xl font-outfit p-8',
          }
        });

        try {
          const res = await addWalletBalance(result.value);
          if (res?.success) {
            Swal.fire({
              title: 'Success! 🎉',
              text: res.message || 'Money has been successfully added to your wallet.',
              icon: 'success',
              confirmButtonColor: '#fe3e6a',
              customClass: {
                popup: 'rounded-3xl font-outfit p-8',
                confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3.5',
              }
            });

            // Refresh wallet balance and transactions
            await refreshWalletBalance();
            const txRes = await getWalletTransactions();
            if (txRes?.success) {
              const payload = txRes.data ?? txRes;
              setTransactions(Array.isArray(payload) ? payload : []);
            }
          } else {
            Swal.fire({
              title: 'Failed to Add Money',
              text: res.message || 'The wallet pipeline encountered an error.',
              icon: 'error',
              confirmButtonColor: '#fe3e6a',
              customClass: {
                popup: 'rounded-3xl font-outfit p-8',
                confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3.5',
              }
            });
          }
        } catch (err) {
          console.error("Add money failed:", err);
          Swal.fire({
            title: 'Network Error',
            text: 'Could not connect to the wallet server. Please try again.',
            icon: 'error',
            confirmButtonColor: '#fe3e6a',
            customClass: {
              popup: 'rounded-3xl font-outfit p-8',
              confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3.5',
            }
          });
        }
      }
    });
  };

  useEffect(() => {
    const fetchWalletDetails = async () => {
      setLoadingTransactions(true);
      try {
        await Promise.allSettled([
          refreshWalletBalance(),
          getWalletTransactions().then(res => {
            if (res?.success) {
              const payload = res.data ?? res;
              setTransactions(Array.isArray(payload) ? payload : []);
            }
          })
        ]);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchWalletDetails();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.type?.toUpperCase() === filterType;
  });

  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 font-outfit text-left">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">My Wallet</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <UserSidebar />

          <div className="flex-grow space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900 uppercase">My Wallet</h1>

            {/* Compact Balance & Stats Banner Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-left">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner shrink-0">
                    <WalletIcon size={28} />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-extrabold text-gray-400 uppercase tracking-wider block">Wallet Balance</span>
                    {balanceLoading ? (
                      <Loader2 className="animate-spin text-primary mt-1" size={24} />
                    ) : (
                      <span className="text-3xl font-black text-gray-900 block">
                        ₹{balanceData.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddMoneyPrompt}
                  className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs uppercase px-5 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={14} className="stroke-[3]" /> Add Money
                </button>
              </div>

              <div className="flex gap-8 border-t sm:border-t-0 sm:border-l border-gray-100 pt-6 sm:pt-0 sm:pl-8">
                <div className="text-left">
                  <div className="flex items-center gap-1.5 text-green-500 mb-1">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold uppercase text-gray-400">Total Credits</span>
                  </div>
                  {balanceLoading ? (
                    <Loader2 className="animate-spin text-gray-400" size={14} />
                  ) : (
                    <span className="text-base font-extrabold text-gray-800">
                      ₹{balanceData.totalCredits?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                    <TrendingDown size={14} />
                    <span className="text-xs font-bold uppercase text-gray-400">Total Debits</span>
                  </div>
                  {balanceLoading ? (
                    <Loader2 className="animate-spin text-gray-400" size={14} />
                  ) : (
                    <span className="text-base font-extrabold text-gray-800">
                      ₹{balanceData.totalDebits?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Transactions Listing */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-50 rounded-xl"><History size={20} className="text-gray-400" /></div>
                  <h2 className="text-base font-extrabold text-gray-900 uppercase">Transactions</h2>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-gray-50 border-none text-xs font-bold uppercase py-2 px-3 rounded-lg outline-none cursor-pointer text-gray-650 hover:bg-gray-100 transition-colors"
                >
                  <option value="ALL">All Transactions</option>
                  <option value="CREDIT">Credits Only</option>
                  <option value="DEBIT">Debits Only</option>
                </select>
              </div>

              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loadingTransactions ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="text-sm font-bold text-gray-400 uppercase">Loading Transactions...</span>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs font-bold uppercase">
                    No transactions found.
                  </div>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.type?.toUpperCase() === 'CREDIT';
                    return (
                      <div key={tx._id || tx.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-gray-50/50 rounded-xl px-2 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
                            {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-gray-800">{tx.description || tx.reason?.replace(/_/g, ' ') || 'Wallet Transaction'}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase">
                              {tx.reason?.replace(/_/g, ' ') || 'Transaction'} • {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-extrabold ${isCredit ? 'text-green-500' : 'text-gray-900'}`}>
                            {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Compact Policy Alert & Promotion Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-900 text-white rounded-2xl text-left relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <AlertCircle className="text-primary shrink-0 animate-pulse" size={20} />
                <p className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  90-Day Expiry Policy: <span className="text-white normal-case font-medium">All cashback earned expires in 90 days.</span>
                </p>
              </div>
              <div className="text-sm font-bold uppercase tracking-wider text-primary hover:text-white transition-colors relative z-10 cursor-pointer flex items-center gap-1 shrink-0">
                <span>Earn More Rewards</span> <ChevronRight size={12} />
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
