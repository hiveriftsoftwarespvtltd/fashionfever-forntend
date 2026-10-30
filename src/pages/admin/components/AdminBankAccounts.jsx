import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, RefreshCw, Landmark, ShieldCheck, Clock, XCircle, 
  ChevronRight, Calendar, User, Eye, X, CreditCard
} from 'lucide-react';
import { getAdminAllBankAccounts, getBankAccountDetails, updateBankAccountStatus } from '../../../api/payoutService';
import { toast } from '../../../utils/toast';

const AdminBankAccounts = ({ isDarkMode }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Details Modal state
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Status verification states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [decision, setDecision] = useState(null);
  const [verificationReference, setVerificationReference] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchAllAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminAllBankAccounts();
      if (res?.success) {
        setAccounts(res.data || []);
      } else {
        toast.error(res?.message || 'Failed to fetch bank accounts.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAccounts();
  }, [fetchAllAccounts]);

  const handleCloseDetails = () => {
    setSelectedAccountId(null);
    setAccountDetails(null);
    setDecision(null);
    setVerificationReference('');
    setRejectionReason('');
  };

  const loadDetails = async (id) => {
    setSelectedAccountId(id);
    setLoadingDetails(true);
    try {
      const res = await getBankAccountDetails(id);
      if (res?.success) {
        setAccountDetails(res.data);
      } else {
        toast.error(res?.message || 'Failed to load details.');
        handleCloseDetails();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bank account details.');
      handleCloseDetails();
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusSubmit = async () => {
    if (!decision) return;
    setUpdatingStatus(true);
    try {
      const payload = {
        status: decision,
        verificationReference: decision === 'VERIFIED' ? (verificationReference || 'Nothing') : '',
        rejectionReason: decision === 'REJECTED' ? rejectionReason : ''
      };
      
      const res = await updateBankAccountStatus(selectedAccountId, payload);
      if (res?.success) {
        toast.success(res.message || `Bank account status updated to ${decision}!`);
        // Update details state
        setAccountDetails(res.data?.data ?? res.data);
        setDecision(null);
        setVerificationReference('');
        setRejectionReason('');
        // Refresh table list
        fetchAllAccounts();
      } else {
        toast.error(res?.message || 'Failed to update bank account status.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      case 'PENDING':
      default:
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
    }
  };

  // Metrics
  const totalCount = accounts.length;
  const verifiedCount = accounts.filter(a => a.status?.toUpperCase() === 'VERIFIED' || a.status?.toUpperCase() === 'APPROVED').length;
  const pendingCount = accounts.filter(a => a.status?.toUpperCase() === 'PENDING' || !a.status).length;
  const rejectedCount = accounts.filter(a => a.status?.toUpperCase() === 'REJECTED').length;

  // Filter & Search
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.accountHolderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.accountNumber?.includes(searchQuery) ||
      acc.ownerId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'PENDING') return matchesSearch && (acc.status?.toUpperCase() === 'PENDING' || !acc.status);
    if (statusFilter === 'VERIFIED') return matchesSearch && (acc.status?.toUpperCase() === 'VERIFIED' || acc.status?.toUpperCase() === 'APPROVED');
    if (statusFilter === 'REJECTED') return matchesSearch && acc.status?.toUpperCase() === 'REJECTED';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>
            Bank Accounts Control
          </h1>
          <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Review, verify, and audit user and partner payout bank accounts list.
          </p>
        </div>
        <button
          onClick={fetchAllAccounts}
          disabled={loading}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm'
          }`}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh Console
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-150 shadow-sm'}`}>
          <div className="flex items-center gap-2.5 text-gray-400 mb-2">
            <Landmark size={15} />
            <span className="text-xs font-black uppercase tracking-widest">Total Accounts</span>
          </div>
          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{totalCount}</span>
        </div>

        <div className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-150 shadow-sm'}`}>
          <div className="flex items-center gap-2.5 text-amber-500 mb-2">
            <Clock size={15} />
            <span className="text-xs font-black uppercase tracking-widest">Pending Verification</span>
          </div>
          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{pendingCount}</span>
        </div>

        <div className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-150 shadow-sm'}`}>
          <div className="flex items-center gap-2.5 text-emerald-500 mb-2">
            <ShieldCheck size={15} />
            <span className="text-xs font-black uppercase tracking-widest">Verified Accounts</span>
          </div>
          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{verifiedCount}</span>
        </div>

        <div className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-150 shadow-sm'}`}>
          <div className="flex items-center gap-2.5 text-rose-500 mb-2">
            <XCircle size={15} />
            <span className="text-xs font-black uppercase tracking-widest">Rejected Accounts</span>
          </div>
          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{rejectedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
        isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-150 shadow-sm'
      }`}>
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search size={14} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by holder, bank, account number or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
              isDarkMode 
                ? 'bg-gray-800 border-white/5 text-white focus:border-primary/40' 
                : 'bg-gray-50 border-gray-150 text-gray-800 focus:bg-white focus:border-primary'
            }`}
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                statusFilter === filter
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-755 text-gray-400 hover:text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-650'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-150 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs font-black uppercase tracking-widest ${isDarkMode ? 'border-white/5 bg-gray-950/40 text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>
                <th className="px-6 py-4">Account Holder & Bank</th>
                <th className="px-6 py-4">Account Number</th>
                <th className="px-6 py-4">IFSC Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Primary</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-primary" size={24} />
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading accounts log...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-wider">
                    No bank accounts found matching filters
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc._id} className={`hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all`}>
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-800 dark:text-white uppercase">{acc.accountHolderName}</div>
                      <div className="text-xs font-semibold text-gray-400 uppercase mt-0.5">{acc.bankName}</div>
                    </td>
                    <td className="px-6 py-4 font-bold tracking-wider text-gray-600 dark:text-gray-300">
                      {acc.accountNumber}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase">
                      {acc.ifscCode}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md text-gray-500">
                        {acc.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {acc.isPrimary ? (
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Primary</span>
                      ) : (
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-widest ${getStatusBadge(acc.status)}`}>
                        {acc.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => loadDetails(acc._id)}
                        className={`flex items-center justify-center gap-1.5 mx-auto px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isDarkMode
                            ? 'bg-gray-800 hover:bg-gray-700 text-white'
                            : 'bg-gray-100 hover:bg-primary hover:text-white text-gray-700'
                        }`}
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Inspector Modal */}
      {selectedAccountId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
            isDarkMode ? 'bg-gray-900 border border-white/5 text-white' : 'bg-white text-gray-800'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-gray-950/20' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Landmark size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Account Audit File</h3>
                  <p className="text-xs font-bold text-gray-450 uppercase mt-0.5">ID: {selectedAccountId}</p>
                </div>
              </div>
              <button
                onClick={handleCloseDetails}
                className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            {loadingDetails ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-primary" size={30} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-450 animate-pulse">Inspecting details...</p>
              </div>
            ) : accountDetails ? (
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
                {/* Visual Card representation */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between min-h-[160px] ${
                  isDarkMode ? 'bg-gray-955 border-white/5' : 'bg-gray-50 border-gray-200/60 shadow-inner'
                }`}>
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/5 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-start justify-between z-10">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">{accountDetails.bankName}</h4>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">IFSC: {accountDetails.ifscCode}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-widest ${getStatusBadge(accountDetails.status)}`}>
                      {accountDetails.status || 'PENDING'}
                    </span>
                  </div>

                  <div className="space-y-1 mt-4 z-10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Account Holder</span>
                    <span className="text-xs font-black uppercase">{accountDetails.accountHolderName}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200/50 dark:border-white/5 mt-4 flex items-center justify-between z-10">
                    <span className="text-xs font-black tracking-wider flex items-center gap-1.5">
                      <CreditCard size={14} className="text-gray-400" />
                      {accountDetails.accountNumber}
                    </span>
                    <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase">
                      {accountDetails.accountType}
                    </span>
                  </div>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-gray-450 uppercase block">Owner type</span>
                    <span className="font-bold uppercase">{accountDetails.ownerType || 'USER'}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-black text-gray-450 uppercase block">Registered on</span>
                    <span className="font-bold flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" />
                      {accountDetails.createdAt ? new Date(accountDetails.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <span className="text-xs font-black text-gray-450 uppercase block">Owner Database ID</span>
                    <span className="font-mono text-xs break-all bg-gray-100 dark:bg-white/5 p-2 rounded-xl block">
                      {accountDetails.ownerId}
                    </span>
                  </div>

                  {accountDetails.verifiedAt && (
                    <div className="space-y-1 col-span-2">
                      <span className="text-xs font-black text-gray-450 uppercase block">Verified At</span>
                      <span className="font-bold flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        {new Date(accountDetails.verifiedAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {accountDetails.verificationReference && (
                    <div className="space-y-1 col-span-2">
                      <span className="text-xs font-black text-gray-450 uppercase block">Verification Reference</span>
                      <span className="font-semibold italic text-gray-500">
                        {accountDetails.verificationReference}
                      </span>
                    </div>
                  )}
                </div>

                {/* Verification Control Console */}
                <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-gray-955 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Verification Actions</p>
                  
                  {decision === null ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDecision('VERIFIED')}
                        className="flex-1 py-2.5 rounded-2xl text-xs font-black uppercase text-white bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer text-center"
                      >
                        Verify / Approve
                      </button>
                      <button
                        onClick={() => setDecision('REJECTED')}
                        className="flex-1 py-2.5 rounded-2xl text-xs font-black uppercase text-white bg-rose-500 hover:bg-rose-600 transition-all cursor-pointer text-center"
                      >
                        Reject Account
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {decision === 'VERIFIED' ? (
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider text-gray-400 block">Verification Reference (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Transaction Ref, Bank Confirmation No."
                            value={verificationReference}
                            onChange={(e) => setVerificationReference(e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                              isDarkMode 
                                ? 'bg-gray-800 border-white/5 text-white focus:border-primary/40' 
                                : 'bg-white border-gray-150 text-gray-800 focus:border-primary'
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider text-gray-400 block font-bold text-rose-500">Rejection Reason</label>
                          <input
                            type="text"
                            placeholder="e.g. Invalid IFSC Code, Name mismatch"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                              isDarkMode 
                                ? 'bg-gray-800 border-white/5 text-white focus:border-primary/40' 
                                : 'bg-white border-gray-150 text-gray-800 focus:border-primary'
                            }`}
                          />
                        </div>
                      )}

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setDecision(null)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer ${
                            isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-250 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleStatusSubmit}
                          disabled={updatingStatus || (decision === 'REJECTED' && !rejectionReason)}
                          className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-black uppercase text-white bg-primary hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {updatingStatus && <RefreshCw size={10} className="animate-spin" />}
                          Confirm Decision
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'border-white/5 bg-gray-950/20' : 'border-gray-100 bg-gray-50'}`}>
              <button
                onClick={handleCloseDetails}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase cursor-pointer ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Close Audit File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBankAccounts;
