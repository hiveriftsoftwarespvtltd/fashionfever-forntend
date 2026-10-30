import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Landmark, CreditCard, PlusCircle, CheckCircle2, AlertCircle, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { addBankAccount, getBankAccounts, updateBankAccount, deleteBankAccount } from '../../api/payoutService';
import { toast } from '../../utils/toast';
import Swal from 'sweetalert2';

const PayoutBankDetails = ({ isDarkMode, role = null, ownerId = null }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // Form states
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('SAVINGS');
  const [isPrimary, setIsPrimary] = useState(true);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBankAccounts();
      if (res?.success) {
        const list = res.data?.data ?? res.data ?? [];
        const array = Array.isArray(list) ? list : (list ? [list] : []);
        
        // Filter using localStorage keys to keep roles isolated on client-side
        if (role) {
          const storageKey = `payout_bank_ids_${role}`;
          const savedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const filtered = array.filter(acc => savedIds.includes(acc._id));
          setAccounts(filtered);
        } else {
          setAccounts(array);
        }
      }
    } catch (err) {
      console.error('Fetch bank accounts error:', err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleStartEdit = (acc) => {
    setEditingAccount(acc);
    setAccountHolderName(acc.accountHolderName || '');
    setBankName(acc.bankName || '');
    setIfscCode(acc.ifscCode || '');
    setAccountNumber(acc.accountNumber || '');
    setAccountType(acc.accountType || 'SAVINGS');
    setIsPrimary(acc.isPrimary ?? true);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setAccountHolderName('');
    setBankName('');
    setIfscCode('');
    setAccountNumber('');
    setAccountType('SAVINGS');
    setIsPrimary(true);
    setEditingAccount(null);
    setShowAddForm(false);
  };

  const handleDeleteAccount = (id) => {
    Swal.fire({
      title: 'Delete Bank Account?',
      text: 'Are you sure you want to delete this bank account? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#da016a',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      borderRadius: '20px',
      customClass: {
        popup: 'rounded-3xl border-none',
        confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
        cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const loadingToast = toast.loading('Deleting bank account...');
        try {
          const res = await deleteBankAccount(id);
          toast.dismiss();
          if (res?.success) {
            toast.success(res.message || 'Bank account deleted successfully!');
            
            // Clean up localStorage for this role if applicable
            if (role) {
              const storageKey = `payout_bank_ids_${role}`;
              const savedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
              const updated = savedIds.filter(savedId => savedId !== id);
              localStorage.setItem(storageKey, JSON.stringify(updated));
            }
            
            fetchAccounts();
          } else {
            toast.error(res?.message || 'Failed to delete bank account.');
          }
        } catch (err) {
          toast.dismiss();
          toast.error('Something went wrong while deleting bank details.');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountHolderName || !bankName || !ifscCode || !accountNumber) {
      toast.error('Please fill in all bank details fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        accountHolderName,
        bankName,
        ifscCode,
        accountNumber,
        accountType,
        isPrimary
      };
      
      const res = editingAccount
        ? await updateBankAccount(editingAccount._id, payload)
        : await addBankAccount(payload);
        
      if (res?.success) {
        toast.success(res.message || (editingAccount ? 'Bank account updated successfully!' : 'Bank account added successfully!'));
        
        // Store account ID locally mapped to the dashboard role (only when adding new)
        const addedAcc = res.data?.data ?? res.data;
        if (!editingAccount && role && addedAcc?._id) {
          const storageKey = `payout_bank_ids_${role}`;
          const savedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
          if (!savedIds.includes(addedAcc._id)) {
            savedIds.push(addedAcc._id);
            localStorage.setItem(storageKey, JSON.stringify(savedIds));
          }
        }

        handleCancel();
        // Refresh list
        fetchAccounts();
      } else {
        toast.error(res?.message || 'Failed to save bank account.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      case 'PENDING':
      default:
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>
            Payout Bank Accounts
          </h1>
          <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage bank accounts for automatic withdrawals, lounge bookings settlements, and earnings transfers.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchAccounts}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm'
            }`}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <button
            onClick={() => {
              if (showAddForm) {
                handleCancel();
              } else {
                setShowAddForm(true);
              }
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            <PlusCircle size={14} />
            {showAddForm ? 'View Accounts' : 'Add Bank Details'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Hydrating Bank Accounts settings...
          </p>
        </div>
      ) : showAddForm ? (
        /* Form container */
        <div className={`p-6 rounded-3xl border text-left ${
          isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <h3 className={`text-sm font-black uppercase tracking-wider mb-5 ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>
            {editingAccount ? 'Edit Bank Account Details' : 'Register New Bank Account'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Account Holder Name */}
              <div className="space-y-1">
                <label className={`text-xs font-black uppercase tracking-wider block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prashant Kumar Maurya"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-white/5 text-white focus:border-primary/40'
                      : 'bg-gray-50 border-gray-150 text-gray-800 focus:bg-white focus:border-primary'
                  }`}
                />
              </div>

              {/* Bank Name */}
              <div className="space-y-1">
                <label className={`text-xs font-black uppercase tracking-wider block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Punjab National Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-white/5 text-white focus:border-primary/40'
                      : 'bg-gray-50 border-gray-150 text-gray-800 focus:bg-white focus:border-primary'
                  }`}
                />
              </div>

              {/* Account Number */}
              <div className="space-y-1">
                <label className={`text-xs font-black uppercase tracking-wider block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-white/5 text-white focus:border-primary/40'
                      : 'bg-gray-50 border-gray-150 text-gray-800 focus:bg-white focus:border-primary'
                  }`}
                />
              </div>

              {/* IFSC Code */}
              <div className="space-y-1">
                <label className={`text-xs font-black uppercase tracking-wider block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PUNB0123456"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-white/5 text-white focus:border-primary/40'
                      : 'bg-gray-50 border-gray-150 text-gray-800 focus:bg-white focus:border-primary'
                  }`}
                />
              </div>

              {/* Account Type */}
              <div className="space-y-1">
                <label className={`text-xs font-black uppercase tracking-wider block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-white/5 text-white focus:border-primary/40'
                      : 'bg-gray-50 border-gray-150 text-gray-800 focus:bg-white focus:border-primary'
                  }`}
                >
                  <option value="SAVINGS">Savings Account</option>
                  <option value="CURRENT">Current Account</option>
                </select>
              </div>

              {/* Primary account settings checkbox */}
              <div className="flex items-center gap-3.5 pt-4">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-gray-300 text-primary focus:ring-primary/45 cursor-pointer"
                />
                <label htmlFor="isPrimary" className={`text-xs font-bold select-none cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mark this as my primary payout account
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase cursor-pointer ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase text-white bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={13} /> : null}
                Save Bank Details
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Accounts Listing */
        <div className="space-y-6">
          {accounts.length === 0 ? (
            <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center gap-3 ${
              isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'
            }`}>
              <Landmark className="text-gray-300 stroke-[1.5]" size={40} />
              <div>
                <p className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  No Bank Accounts Found
                </p>
                <p className="text-xs text-gray-450 font-bold uppercase mt-1">
                  Add your bank details to get payouts from your balance.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/95 transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                <PlusCircle size={14} /> Add Bank Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accounts.map((acc) => (
                <div
                  key={acc._id}
                  className={`p-6 rounded-3xl border text-left relative overflow-hidden flex flex-col justify-between min-h-[180px] transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-900 border-white/5 shadow-xl hover:border-white/10' 
                      : 'bg-white border-gray-150 shadow-sm hover:border-gray-200'
                  }`}
                >
                  {/* Decorative background glow */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/5 rounded-full blur-2xl"></div>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Landmark size={20} />
                        </div>
                        <div>
                          <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>
                            {acc.bankName || 'Partner Bank'}
                          </h4>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            IFSC: {acc.ifscCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(acc)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-gray-800 hover:bg-gray-755 border-white/10 text-gray-300' 
                              : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'
                          }`}
                          title="Edit Account"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc._id)}
                          className="p-1.5 rounded-lg border transition-all cursor-pointer bg-red-500/10 hover:bg-red-500/20 border-red-550/20 text-red-500"
                          title="Delete Account"
                        >
                          <Trash2 size={12} />
                        </button>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-widest ${getStatusColor(acc.status)}`}>
                          {acc.status || 'PENDING'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className={`text-xs font-bold tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        ACCOUNT HOLDER
                      </p>
                      <p className={`text-xs font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {acc.accountHolderName}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-gray-500 dark:text-gray-400">
                      <CreditCard size={14} className="text-gray-450" />
                      <span>•••• {acc.accountNumber?.slice(-4) || '1234'}</span>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md uppercase ml-2 text-gray-400">
                        {acc.accountType}
                      </span>
                    </div>

                    {acc.isPrimary && (
                      <span className="flex items-center gap-1 text-xs font-black text-emerald-500 uppercase">
                        <CheckCircle2 size={12} /> Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayoutBankDetails;
