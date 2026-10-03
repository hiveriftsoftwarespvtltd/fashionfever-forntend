import React from 'react';
import { Wallet, Clock, TrendingUp, HelpCircle, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const VendorWallet = ({
  isDarkMode,
  vendorWallet,
  walletLoading,
  walletTransactions,
  walletTransactionsLoading,
  formatCurrency
}) => {
  const handleWithdrawalRequest = async () => {
    const balance = vendorWallet?.balance || 0;
    if (balance <= 0) {
      Swal.fire({
        title: 'Insufficient Balance',
        text: 'You do not have enough usable balance in your wallet to withdraw.',
        icon: 'error',
        confirmButtonColor: '#ff2d55',
        customClass: {
          title: 'font-outfit uppercase font-bold text-lg',
          htmlContainer: 'font-outfit uppercase font-bold text-xs text-gray-500'
        }
      });
      return;
    }

    const { value: amount } = await Swal.fire({
      title: 'Withdraw Funds',
      html: `
        <div class="text-left font-outfit uppercase">
          <p class="text-xs font-bold text-gray-400 mb-2">Usable Balance: <span class="text-emerald-500 font-extrabold">${formatCurrency(balance)}</span></p>
          <p class="text-xs text-gray-400 leading-relaxed">Please enter the amount you wish to withdraw to your linked bank account. Processing takes 2-3 business days.</p>
        </div>
      `,
      input: 'number',
      inputPlaceholder: 'Enter amount in INR',
      showCancelButton: true,
      confirmButtonText: 'Submit Request',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6c757d',
      customClass: {
        title: 'font-outfit uppercase font-extrabold text-base mb-2',
        input: 'font-outfit font-extrabold text-sm border-gray-200 rounded-xl p-3 focus:ring-primary',
        confirmButton: 'font-outfit uppercase font-bold text-xs px-6 py-2.5 rounded-xl',
        cancelButton: 'font-outfit uppercase font-bold text-xs px-6 py-2.5 rounded-xl'
      },
      inputValidator: (value) => {
        if (!value || isNaN(value) || Number(value) <= 0) {
          return 'Please enter a valid amount!';
        }
        if (Number(value) > balance) {
          return 'Amount exceeds your usable balance!';
        }
      }
    });

    if (amount) {
      Swal.fire({
        title: 'Request Submitted',
        text: `Your withdrawal request for ${formatCurrency(amount)} has been sent to the admin team for approval.`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          title: 'font-outfit uppercase font-bold text-lg',
          htmlContainer: 'font-outfit uppercase font-bold text-xs text-gray-500'
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      
      {/* Wallet Summary Header Banner */}
      <div className={`p-6 lg:p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden backdrop-blur-xl ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800 shadow-md' 
          : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <span className="text-xs font-bold text-primary uppercase block mb-1">Financial Node</span>
            <h2 className="text-xl font-extrabold uppercase text-zinc-900 dark:text-zinc-100">Merchant Wallet</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase mt-1">Manage your store funds, earnings, and withdrawal requests</p>
          </div>
          <button 
            onClick={handleWithdrawalRequest}
            className="bg-primary hover:bg-primary/95 text-white px-6 py-3.5 rounded-2xl font-bold uppercase text-xs transition-all shadow-lg shadow-primary/20 hover:opacity-95 active:opacity-90 cursor-pointer flex items-center gap-2"
          >
            <Wallet size={16} />
            Withdraw Funds
          </button>
        </div>
        
        {/* Decorative Gradients */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
          isDarkMode ? 'bg-gray-900 border-white/5 shadow-xl text-white' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-gray-800'
        }`}>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Usable Wallet Balance</p>
          <span className={`text-xl font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {walletLoading ? '...' : formatCurrency(vendorWallet?.balance || 0)}
          </span>
          <div className="absolute right-4 bottom-4 text-emerald-500/20"><Wallet size={28} /></div>
        </div>

        <div className={`p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
          isDarkMode ? 'bg-gray-900 border-white/5 shadow-xl text-white' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-gray-800'
        }`}>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Wallet Balance</p>
          <span className={`text-xl font-extrabold ${isDarkMode ? 'text-amber-450' : 'text-amber-600'}`}>
            {walletLoading ? '...' : formatCurrency(vendorWallet?.pendingBalance || 0)}
          </span>
          <div className="absolute right-4 bottom-4 text-amber-500/20"><Clock size={28} /></div>
        </div>

        <div className={`p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
          isDarkMode ? 'bg-gray-900 border-white/5 shadow-xl text-white' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-gray-800'
        }`}>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Lifetime Wallet Earnings</p>
          <span className="text-xl font-extrabold text-primary">
            {walletLoading ? '...' : formatCurrency(vendorWallet?.totalEarnings || 0)}
          </span>
          <div className="absolute right-4 bottom-4 text-primary/20"><TrendingUp size={28} /></div>
        </div>
      </div>

      {/* Wallet Transactions Table */}
      <div className={`rounded-[32px] border overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900 border-white/5 shadow-xl' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-gray-50'}`}>
          <div>
            <h3 className={`text-base font-extrabold uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Wallet Transaction History</h3>
            <p className="text-sm text-gray-400 font-bold uppercase mt-1">Real-time ledger logs of credits and debits</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            Wallet Ledger
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`${isDarkMode ? 'bg-gray-950/40 border-b border-white/5' : 'bg-gray-50 border-b border-gray-100'}`}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Transaction ID / Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Reason</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
              {walletTransactionsLoading ? (
                <tr><td colSpan="6" className="p-10 text-center font-bold text-gray-400">Loading transactions...</td></tr>
              ) : (walletTransactions || []).map((txn) => {
                const isCredit = txn.type === 'CREDIT';
                const typeColor = isCredit
                  ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600')
                  : (isDarkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600');
                
                const amountColor = isCredit ? 'text-green-500' : 'text-rose-500';
                const amountPrefix = isCredit ? '+' : '-';

                return (
                  <tr key={txn._id} className={`${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-mono text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-650'}`}>{txn._id?.slice(-8).toUpperCase() || 'TXN'}</span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-550' : 'text-gray-400'}`}>
                          {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {txn.reason ? txn.reason.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') : 'Other'}
                    </td>
                    <td className={`px-6 py-4 text-xs text-gray-500 dark:text-gray-400`}>
                      {txn.description || 'No description provided'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold uppercase px-2 py-1 rounded-full ${typeColor}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-black ${amountColor}`}>
                      {amountPrefix}{formatCurrency(txn.amount || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-gray-700 dark:text-gray-300">
                      {formatCurrency(txn.balanceAfterTransaction !== undefined ? txn.balanceAfterTransaction : 0)}
                    </td>
                  </tr>
                );
              })}
              {(!walletTransactions || walletTransactions.length === 0) && !walletTransactionsLoading && (
                <tr><td colSpan="6" className="p-10 text-center font-bold text-gray-400">No transactions recorded in wallet ledger.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorWallet;
