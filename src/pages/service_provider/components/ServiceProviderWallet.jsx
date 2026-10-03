import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Wallet, IndianRupee, TrendingUp, Coins, AlertCircle, Clock } from 'lucide-react';
import { getServiceProviderWalletBalance, getServiceProviderWalletTransactions } from '../../../api/serviceProviderService';
import { toast } from '../../../utils/toast';
import DataTable from '../../../components/shared/DataTable';

const ServiceProviderWallet = ({ isDarkMode }) => {
  const [walletBalance, setWalletBalance] = useState({ balance: 0, pendingBalance: 0, totalEarnings: 0 });
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        getServiceProviderWalletBalance(),
        getServiceProviderWalletTransactions()
      ]);
      if (balanceRes?.success && balanceRes.data) {
        setWalletBalance(balanceRes.data);
      }
      if (transactionsRes?.success && Array.isArray(transactionsRes.data)) {
        setWalletTransactions(transactionsRes.data);
      }
    } catch (err) {
      console.error('Fetch service provider wallet data error:', err);
      setError('Failed to fetch wallet information.');
      toast.error('Failed to load wallet dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const columns = [
    {
      header: 'Date',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs font-semibold text-gray-500 block">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : '—'}
        </span>
      )
    },
    {
      header: 'Description',
      key: 'description',
      render: (row) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
            {row.description || row.message || 'Lounge Booking Earning'}
          </span>
          <span className="text-xs font-semibold text-zinc-500 uppercase mt-0.5">
            TXID: {row.transactionId || row._id || '—'}
          </span>
        </div>
      )
    },
    {
      header: 'Type',
      key: 'type',
      render: (row) => {
        const type = row.type?.toUpperCase() || 'CREDIT';
        const isCredit = type === 'CREDIT' || type === 'EARNING' || type === 'DEPOSIT';
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
            isCredit
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}>
            {type}
          </span>
        );
      }
    },
    {
      header: 'Amount',
      key: 'amount',
      render: (row) => {
        const type = row.type?.toUpperCase() || 'CREDIT';
        const isCredit = type === 'CREDIT' || type === 'EARNING' || type === 'DEPOSIT';
        return (
          <span className={`text-sm font-black flex items-center gap-0.5 ${
            isCredit ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {isCredit ? '+' : '-'} ₹{row.amount?.toLocaleString('en-IN') || 0}
          </span>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const status = row.status?.toUpperCase() || 'COMPLETED';
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
            status === 'COMPLETED' || status === 'SUCCESS'
              ? 'bg-emerald-500/10 text-emerald-500'
              : status === 'PENDING'
              ? 'bg-amber-500/10 text-amber-500 animate-pulse'
              : 'bg-rose-500/10 text-rose-500'
          }`}>
            {status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>
            Wallet Ledger
          </h1>
          <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Monitor business earnings, hold balances, and verified payouts log pipeline.
          </p>
        </div>
        
        <button
          onClick={fetchWalletData}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm'
          }`}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh Balance
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Hydrating Wallet Ledger...
          </p>
        </div>
      ) : error ? (
        <div className={`p-8 rounded-3xl border text-center flex flex-col items-center justify-center gap-3 ${
          isDarkMode ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'
        }`}>
          <AlertCircle className="text-red-500" size={32} />
          <p className="text-xs font-black text-red-600 uppercase tracking-wide">{error}</p>
        </div>
      ) : (
        <>
          {/* Balance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Available Balance */}
            <div className={`p-6 rounded-3xl border flex items-center justify-between text-left ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 shadow-xl shadow-primary/5' 
                : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Available Balance</span>
                <span className={`text-2xl font-black block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  ₹{walletBalance.balance?.toLocaleString('en-IN') || 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Coins size={24} />
              </div>
            </div>

            {/* Pending Balance */}
            <div className={`p-6 rounded-3xl border flex items-center justify-between text-left ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 shadow-xl shadow-primary/5' 
                : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Hold Balance</span>
                <span className={`text-2xl font-black block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  ₹{walletBalance.pendingBalance?.toLocaleString('en-IN') || 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500">
                <Clock size={24} />
              </div>
            </div>

            {/* Total Earnings */}
            <div className={`p-6 rounded-3xl border flex items-center justify-between text-left ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 shadow-xl shadow-primary/5' 
                : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Lifetime Earnings</span>
                <span className={`text-2xl font-black block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  ₹{walletBalance.totalEarnings?.toLocaleString('en-IN') || 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Transactions Log Section */}
          <div className={`p-6 rounded-3xl border text-left ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-xl' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <h3 className={`text-sm font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Transactions Pipeline
            </h3>

            {walletTransactions.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center">
                <Wallet size={36} className="text-zinc-400 mb-3" />
                <p className="text-xs font-black uppercase tracking-wider">No transaction logs available</p>
                <p className="text-xs text-zinc-400 font-medium mt-1">Earnings and booking credits will show here.</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={walletTransactions}
                isDarkMode={isDarkMode}
                emptyMessage="No transactions matched active ledger filters."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceProviderWallet;
