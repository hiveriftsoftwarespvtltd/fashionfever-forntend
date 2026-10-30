import React, { useState, useEffect } from 'react';
import { X, User, Mail, Award, BookOpen, Clock, Users, ShieldCheck, Play, Loader2 } from 'lucide-react';
import { getEducatorDetails } from '../../../api/educatorService';
import { 
  getEducatorWalletBalance,
  getEducatorWalletTransactions
} from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';
import { getImageUrl } from '../../../utils/imageUrl';

/**
 * Educator Details Modal
 */
const EducatorDetailsModal = ({ educatorId, onClose }) => {
  const { isDarkMode } = useTheme();
  const [details, setDetails] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [detailsRes, walletRes, txRes] = await Promise.all([
          getEducatorDetails(educatorId),
          getEducatorWalletBalance(educatorId),
          getEducatorWalletTransactions(educatorId)
        ]);

        if (detailsRes.success && detailsRes.data) {
          setDetails(detailsRes.data?.data ?? detailsRes.data);
        }

        if (walletRes.success) {
          setWallet(walletRes.data);
        }

        if (txRes.success) {
          const list = txRes.data?.data ?? txRes.data ?? [];
          setTransactions(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to fetch educator details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (educatorId) fetchDetail();
  }, [educatorId]);

  if (!educatorId) return null;

  const DetailItem = ({ icon, label, value }) => (
    <div className="flex gap-3 py-3 border-b border-gray-100/50 dark:border-white/5 last:border-b-0">
      <div className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5 animate-pulse">
        {icon}
      </div>
      <div>
        <span className="text-xs font-black text-gray-400 uppercase block tracking-wider leading-none mb-1">{label}</span>
        <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{value || '—'}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto font-outfit text-left">
      <div className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-150 text-gray-800'}`}>
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Educator Details...</span>
          </div>
        ) : details ? (
          <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl overflow-hidden border shadow-inner flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  {(() => {
                    const rawImg = details.profileImage?.url || details.profileImage || details.userId?.avatar?.url || details.userId?.avatar;
                    const imgUrl = rawImg ? getImageUrl(rawImg) : null;
                    return (
                      <>
                        {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt={details.userId?.name || 'Profile'} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full items-center justify-center ${imgUrl ? 'hidden' : 'flex'}`}>
                          <User size={28} className="text-primary" />
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div>
                  <h2 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {details.userId?.name || 'Educator Partner'}
                  </h2>
                  <p className="text-sm font-bold text-primary uppercase mt-1">Certified Academy Educator</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      details.isApproved ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {details.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      details.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {details.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
                <X size={20} />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/40 border-white/5' : 'bg-gray-50/50 border-gray-150'}`}>
                <div className="space-y-1">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-wider block">Total Courses</span>
                  <span className="text-xl font-black text-primary">{details.totalCourses ?? 0}</span>
                </div>
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <BookOpen size={18} />
                </div>
              </div>
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/40 border-white/5' : 'bg-gray-50/50 border-gray-150'}`}>
                <div className="space-y-1">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-wider block">Students Enrolled</span>
                  <span className="text-xl font-black text-blue-500">{details.totalStudents ?? 0}</span>
                </div>
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                  <Users size={18} />
                </div>
              </div>
            </div>

            {/* Bio & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className={`text-sm font-black uppercase tracking-wider pb-2 border-b ${isDarkMode ? 'text-gray-400 border-white/5' : 'text-gray-500 border-gray-100'}`}>Account Information</h3>
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900/10 border-white/5' : 'bg-gray-50/30 border-gray-100'}`}>
                  <DetailItem icon={<User size={15} />} label="Full Name" value={details.userId?.name} />
                  <DetailItem icon={<Mail size={15} />} label="Email Address" value={details.userId?.email} />
                  <DetailItem icon={<ShieldCheck size={15} />} label="Verified Status" value={details.isApproved ? 'Admin Approved' : 'Under Review'} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={`text-sm font-black uppercase tracking-wider pb-2 border-b ${isDarkMode ? 'text-gray-400 border-white/5' : 'text-gray-500 border-gray-100'}`}>Profile Bio & Expertise</h3>
                <div className={`p-4 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-gray-900/10 border-white/5' : 'bg-gray-50/30 border-gray-100'}`}>
                  <div className="space-y-1">
                    <span className="text-xs font-black text-gray-400 uppercase block tracking-wider leading-none">Biography</span>
                    <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {details.bio || 'No bio submitted.'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-black text-gray-400 uppercase block tracking-wider leading-none">Expertise Areas</span>
                    <div className="flex flex-wrap gap-1.5">
                      {details.expertise && details.expertise.length > 0 ? (
                        details.expertise.map((exp, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-primary/5 text-primary border border-primary/10 rounded-full text-xs font-bold uppercase tracking-wider">
                            {exp}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs font-bold">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses List Section */}
            <div className="space-y-4 text-left">
              <h3 className={`text-sm font-black uppercase tracking-wider pb-2 border-b ${isDarkMode ? 'text-gray-400 border-white/5' : 'text-gray-500 border-gray-100'}`}>
                Courses Published ({details.courses?.length || 0})
              </h3>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {details.courses && details.courses.length > 0 ? (
                  details.courses.map((course, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all hover:scale-[1.005] ${isDarkMode ? 'bg-gray-900/40 border-white/5' : 'bg-gray-50/50 border-gray-150'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                          <Play size={18} className="fill-primary text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold leading-tight uppercase">{course.title}</h4>
                          <p className="text-xs font-semibold text-gray-400 uppercase mt-0.5 line-clamp-1">{course.subtitle || 'No subtitle'}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Clock size={10} /> {course.totalDurationInMinutes ?? 0} mins</span>
                            <span>{course.totalLessons ?? 0} lessons</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {course.isFree ? 'Free' : `₹${course.sellingPrice}`}
                        </span>
                        <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-tight">{course.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-gray-450 uppercase font-black tracking-widest animate-pulse">
                    No courses created yet
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Summary Card */}
            {wallet && (
              <div className={`p-5 rounded-2xl border text-left transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-900/40 border-white/5' : 'bg-emerald-50/10 border-emerald-100/50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-black uppercase text-gray-400 tracking-wider">
                    Educator Wallet Ledger
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                    isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Payout Ready
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-gray-400 uppercase">Liquid Balance</span>
                    <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{(wallet.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-gray-100 dark:border-white/5 pl-3">
                    <span className="text-[11px] font-black text-gray-400 uppercase">Pending Escrow</span>
                    <span className="text-sm font-bold text-amber-500">
                      ₹{(wallet.pendingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-gray-100 dark:border-white/5 pl-3">
                    <span className="text-[11px] font-black text-gray-400 uppercase">Total Earnings</span>
                    <span className="text-sm font-bold text-emerald-500">
                      ₹{(wallet.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions History Ledger */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-white/5">
                <span className="text-sm font-black uppercase text-gray-400 tracking-wider">
                  Transaction Audit Ledger
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase">
                  {(transactions || []).length} Records
                </span>
              </div>
              
              {(!transactions || transactions.length === 0) ? (
                <div className="py-6 text-center text-xs font-bold text-gray-400 uppercase italic">
                  No transactions recorded for this educator wallet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {transactions.map((tx) => (
                    <div 
                      key={tx._id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900/20 border-white/5 hover:border-white/10' 
                          : 'bg-gray-50/50 border-gray-100 hover:border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 max-w-[70%] text-left">
                        <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {tx.description || tx.reason || 'Transaction'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-bold uppercase">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className={`font-black text-xs ${
                          tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono font-bold uppercase">
                          Bal: ₹{(tx.balanceAfterTransaction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isDarkMode ? 'bg-gray-900/20 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Joined Academy On</span>
                <span className="font-bold">
                  {details.createdAt ? new Date(details.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100/50 dark:border-white/5 pt-2">
                <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Last Profile Update</span>
                <span className="font-bold">
                  {details.updatedAt ? new Date(details.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                </span>
              </div>
            </div>

            <button onClick={onClose} className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer">
              Close Educator Review
            </button>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-xs font-bold text-gray-450 uppercase tracking-wider">
            Failed to load profile details.
          </div>
        )}
      </div>
    </div>
  );
};

export default EducatorDetailsModal;
