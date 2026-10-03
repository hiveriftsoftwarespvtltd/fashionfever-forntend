import React, { useState } from 'react';
import { X, Sparkles, Loader2, Mail, User } from 'lucide-react';
import { sendInfluencerInvitationLink } from '../../../api/adminService';
import { toast } from '../../../utils/toast';

const SendInvitationModal = ({ isOpen, onClose, isDarkMode }) => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendInfluencerInvitationLink({
        name: form.name.trim(),
        email: form.email.trim(),
      });

      if (res.success) {
        const inner = res.data?.data || res.data || {};
        const expiresAt = inner.expiresAt
          ? new Date(inner.expiresAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
          : null;

        toast.success(res.data?.message || res.message || 'Invitation sent successfully!');
        if (expiresAt) {
          setTimeout(() => toast.success(`Link expires: ${expiresAt}`), 600);
        }
        setForm({ name: '', email: '' });
        onClose();
      } else {
        toast.error(res.data?.message || res.message || 'Failed to send invitation.');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto ${
        isDarkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white text-gray-800'
      }`}>
        <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Influencer Outreach</span>
              </div>
              <h2 className={`text-xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Send Invitation Link
              </h2>
              <p className="text-sm font-bold text-gray-400 uppercase mt-1">
                Invitation link will be emailed directly
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Influencer Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' 
                      : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. priya@gmail.com"
                  className={`w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' 
                      : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'
                  }`}
                />
              </div>
            </div>

            {/* Info Banner */}
            <div className={`flex items-start gap-3 p-4 rounded-2xl border ${isDarkMode ? 'bg-primary/5 border-primary/20' : 'bg-primary/5 border-primary/15'}`}>
              <Sparkles size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm font-bold text-primary/80 leading-relaxed uppercase">
                A secure invitation link will be sent to the email. The link expires in 7 days.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                disabled={loading}
                type="submit"
                className="flex-1 order-2 sm:order-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-primary/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <><Sparkles size={16} /> Send Invitation</>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`w-full sm:w-auto order-1 sm:order-2 px-8 py-4 rounded-2xl font-bold text-xs uppercase transition-all ${
                  isDarkMode ? 'bg-gray-900 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendInvitationModal;
