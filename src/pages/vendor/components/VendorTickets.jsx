import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Package,
  Send,
  Image as ImageIcon,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useTheme } from '../../../context/ThemeContext';
import { getVendorTickets, addTicketReply, updateTicketStatus } from '../../../api/authService';
import { getImageUrl } from '../../../utils/imageUrl';

const VendorTickets = () => {
  const { isDarkMode } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getVendorTickets();
      if (res?.success) {
        setTickets(res.data || []);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Error fetching vendor tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (activeFilter === 'ALL') return true;
    return (t.ticketStatus || 'PENDING').toUpperCase() === activeFilter;
  });

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      const res = await addTicketReply(selectedTicket._id, replyMessage.trim());
      if (res?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Reply Sent!',
          text: 'Your resolution message has been sent to the customer.',
          timer: 2000,
          showConfirmButton: false,
        });
        setReplyMessage('');
        // Update selected ticket in state
        setSelectedTicket(res.data);
        // Refresh ticket list
        fetchTickets();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: res?.message || 'Could not send reply.',
        });
      }
    } catch (err) {
      console.error('Reply error:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong.' });
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;

    setUpdatingStatus(true);
    try {
      const res = await updateTicketStatus(selectedTicket._id, { ticketStatus: newStatus });
      if (res?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Ticket status set to ${newStatus}`,
          timer: 1800,
          showConfirmButton: false,
        });
        setSelectedTicket({ ...selectedTicket, ticketStatus: newStatus });
        fetchTickets();
      } else {
        Swal.fire({ icon: 'error', title: 'Failed', text: res?.message || 'Status update failed.' });
      }
    } catch (err) {
      console.error('Status error:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const st = (status || 'PENDING').toUpperCase();
    switch (st) {
      case 'OPEN':
        return <span className="px-2.5 py-1 text-xs font-black rounded-md bg-blue-500/10 text-blue-500 uppercase tracking-wider flex items-center gap-1"><Clock size={11} /> OPEN</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 text-xs font-black rounded-md bg-emerald-500/10 text-emerald-500 uppercase tracking-wider flex items-center gap-1"><CheckCircle size={11} /> RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 text-xs font-black rounded-md bg-gray-500/10 text-gray-400 uppercase tracking-wider flex items-center gap-1"><XCircle size={11} /> CLOSED</span>;
      case 'PENDING':
      default:
        return <span className="px-2.5 py-1 text-xs font-black rounded-md bg-amber-500/10 text-amber-500 uppercase tracking-wider flex items-center gap-1"><AlertCircle size={11} /> PENDING</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-xl font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <LifeBuoy className="text-primary" size={24} /> Customer Support Complaints
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Manage & resolve customer tickets directly assigned to your store products and orders.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className={`px-3 py-2 text-xs font-extrabold rounded-xl border flex items-center gap-2 transition-all ${
            isDarkMode
              ? 'border-white/10 hover:bg-white/5 text-gray-300'
              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'PENDING', 'OPEN', 'RESOLVED', 'CLOSED'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-wider ${
              activeFilter === f
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : isDarkMode
                ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'ALL' ? `ALL (${tickets.length})` : `${f} (${tickets.filter((t) => (t.ticketStatus || 'PENDING').toUpperCase() === f).length})`}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tickets List */}
        <div className={`lg:col-span-6 space-y-3 ${selectedTicket ? 'hidden lg:block' : 'block'}`}>
          {loading ? (
            <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'border-white/5 bg-gray-900/50' : 'border-gray-100 bg-white'}`}>
              <RefreshCw className="animate-spin text-primary mx-auto mb-2" size={24} />
              <p className="text-xs font-bold text-gray-400 uppercase">Loading Support Tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className={`p-10 text-center rounded-2xl border ${isDarkMode ? 'border-white/5 bg-gray-900/50' : 'border-gray-100 bg-white'}`}>
              <LifeBuoy className="text-gray-400 mx-auto mb-3 opacity-40" size={36} />
              <p className="text-sm font-extrabold text-gray-400 uppercase mb-1">No Tickets Found</p>
              <p className="text-xs text-gray-400">There are no customer complaints under the "{activeFilter}" status.</p>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = selectedTicket?._id === t._id;
              return (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                      : isDarkMode
                      ? 'border-white/5 bg-gray-900/40 hover:bg-white/5'
                      : 'border-gray-100 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-gray-400 font-mono">
                        #{t._id ? t._id.substring(t._id.length - 8).toUpperCase() : 'N/A'}
                      </span>
                      <h3 className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Category: {t.ticketType || 'OTHER'}
                      </h3>
                    </div>
                    {getStatusBadge(t.ticketStatus)}
                  </div>

                  <p className={`text-xs line-clamp-2 mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t.description}
                  </p>

                  <div className="pt-3 border-t border-dashed border-gray-100 dark:border-white/5 flex justify-between items-center text-xs text-gray-400 font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <User size={11} className="text-primary" /> {t.userId?.name || 'Customer'}
                    </span>
                    <span>{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ticket Details & Resolution Panel */}
        <div className={`lg:col-span-6 ${selectedTicket ? 'block' : 'hidden lg:block'}`}>
          {!selectedTicket ? (
            <div className={`h-full min-h-[350px] p-8 text-center rounded-2xl border flex flex-col justify-center items-center ${isDarkMode ? 'border-white/5 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50'}`}>
              <MessageSquare className="text-gray-400 opacity-30 mb-3" size={40} />
              <p className="text-xs font-black text-gray-400 uppercase">Select a Ticket to View Details & Resolution</p>
            </div>
          ) : (
            <div className={`p-5 rounded-2xl border space-y-5 ${isDarkMode ? 'border-white/10 bg-gray-900/60' : 'border-gray-200 bg-white shadow-xl'}`}>
              {/* Back button for mobile */}
              <button
                onClick={() => setSelectedTicket(null)}
                className="lg:hidden text-xs font-black text-primary flex items-center gap-1 mb-2"
              >
                ← Back to Ticket List
              </button>

              {/* Ticket Top Info */}
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-white/5 pb-4">
                <div>
                  <span className="text-xs font-black text-gray-400 font-mono block">
                    TICKET ID: #{selectedTicket._id?.toUpperCase()}
                  </span>
                  <h2 className={`text-base font-black uppercase tracking-wide mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Category: {selectedTicket.ticketType}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-0.5">
                    Raised by: <span className="text-primary">{selectedTicket.userId?.name || 'Customer'}</span> ({selectedTicket.userId?.email || 'N/A'})
                  </p>
                </div>
                {getStatusBadge(selectedTicket.ticketStatus)}
              </div>

              {/* Product Info if linked */}
              {selectedTicket.productId && (
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-pink-50/40 border-pink-100'}`}>
                  <Package className="text-primary shrink-0" size={20} />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black text-primary uppercase block">Complain Product</span>
                    <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTicket.productId.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Issue Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider block">Customer Complaint Description</span>
                <div className={`p-3.5 rounded-xl border text-xs font-medium leading-relaxed ${isDarkMode ? 'bg-white/5 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                  {selectedTicket.description}
                </div>
              </div>

              {/* Proof Attachments */}
              {selectedTicket.mediaFiles && selectedTicket.mediaFiles.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon size={12} /> Uploaded Proofs ({selectedTicket.mediaFiles.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.mediaFiles.map((m, idx) => (
                      <a key={idx} href={getImageUrl(m.url || m)} target="_blank" rel="noopener noreferrer">
                        <img src={getImageUrl(m.url || m)} alt="Proof" className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-white/10 hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Action Buttons */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider block">Update Resolution Status</span>
                <div className="flex flex-wrap gap-2">
                  {['OPEN', 'RESOLVED', 'CLOSED'].map((st) => (
                    <button
                      key={st}
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${
                        (selectedTicket.ticketStatus || '').toUpperCase() === st
                          ? 'bg-primary text-white shadow-sm'
                          : isDarkMode
                          ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Set {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply History Thread */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-white/5">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider block">
                  Conversation & Resolution Thread
                </span>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                  {(!selectedTicket.replies || selectedTicket.replies.length === 0) ? (
                    <p className="text-[11px] text-gray-400 italic">No resolution replies sent yet. Write a message below to resolve customer issue.</p>
                  ) : (
                    selectedTicket.replies.map((r, idx) => {
                      const isVendor = r.senderRole === 'VENDOR';
                      const isAdmin = r.senderRole === 'ADMIN';
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs ${
                            isVendor
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-950 dark:text-emerald-200 ml-4'
                              : isAdmin
                              ? 'bg-blue-500/5 border-blue-500/20 text-blue-950 dark:text-blue-200 ml-4'
                              : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 mr-4'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs font-black uppercase mb-1 opacity-75">
                            <span>{r.senderName} ({r.senderRole})</span>
                            <span>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="font-medium">{r.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type resolution answer for customer..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    className={`flex-1 px-3.5 py-2.5 text-xs font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${
                      isDarkMode
                        ? 'bg-gray-950 border-white/10 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <button
                    disabled={sendingReply || !replyMessage.trim()}
                    onClick={handleSendReply}
                    className="px-4 py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
                  >
                    <Send size={14} /> Reply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorTickets;
