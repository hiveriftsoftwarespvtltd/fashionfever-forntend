import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Headphones, 
  Loader2, 
  ArrowRight,
  Upload,
  X,
  FileText,
  AlertCircle,
  Plus,
  Calendar,
  MessageSquare,
  HelpCircle,
  Paperclip
} from 'lucide-react';
import UserSidebar from './UserSidebar';
import { raiseTicket, getUserTickets, updateTicketStatus, editTicket, deleteTicket, addTicketReply, getUserOrders } from '../../api/authService';
import { toast } from '../../utils/toast';
import Swal from 'sweetalert2';

const ticketTypes = [
  { id: 'ORDER', name: 'Order Issue' },
  { id: 'PRODUCT', name: 'Product Quality / Defect' },
  { id: 'DELIVERY', name: 'Delivery / Rider Problem' },
  { id: 'PAYMENT', name: 'Payment / Refund Query' },
  { id: 'OTHER', name: 'Other General Inquiry' }
];

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // User Orders State for Vendor/Product Linking
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Discussion Modal State
  const [selectedTicketForView, setSelectedTicketForView] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);

  // Form States
  const [ticketType, setTicketType] = useState('ORDER');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await getUserTickets();
      if (response.success && response.data) {
        setTickets(response.data);
      }
      const ordersRes = await getUserOrders();
      if (ordersRes?.success) {
        setUserOrders(ordersRes.data?.orders || ordersRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching user tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const validFiles = selected.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const isLt5M = file.size / 1024 / 1024 < 5;

        if (!isImage && !isPdf) {
          toast.error(`${file.name} is not an image or PDF.`);
        }
        if (!isLt5M) {
          toast.error(`${file.name} is larger than 5MB.`);
        }
        return (isImage || isPdf) && isLt5M;
      });

      setMediaFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleOpenEditModal = (ticket) => {
    setIsEditing(true);
    setEditingTicketId(ticket._id);
    setTicketType(ticket.ticketType || 'ORDER');
    setDescription(ticket.description || '');
    setSelectedOrderId(ticket.orderId?._id || ticket.orderId || '');
    setExistingMedia(
      Array.isArray(ticket.mediaFiles)
        ? ticket.mediaFiles
        : ticket.mediaFiles
        ? [ticket.mediaFiles]
        : []
    );
    setMediaFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenNewTicketModal = () => {
    setIsEditing(false);
    setEditingTicketId(null);
    setTicketType('ORDER');
    setDescription('');
    setSelectedOrderId('');
    setExistingMedia([]);
    setMediaFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please enter a description of your issue.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('ticketType', ticketType);
      formData.append('description', description);
      
      if (selectedOrderId) {
        const chosenOrd = userOrders.find(o => o._id === selectedOrderId);
        if (chosenOrd) {
          const vId = chosenOrd.vendorId?._id || chosenOrd.vendorId;
          const pId = chosenOrd.items?.[0]?.productId?._id || chosenOrd.items?.[0]?.productId || chosenOrd.items?.[0]?._id;
          if (vId) formData.append('vendorId', vId);
          if (pId) formData.append('productId', pId);
          formData.append('orderId', chosenOrd._id);
        }
      }

      mediaFiles.forEach(file => {
        formData.append('mediaFiles', file);
      });

      let response;
      if (isEditing) {
        response = await editTicket(editingTicketId, formData);
      } else {
        response = await raiseTicket(formData);
      }

      if (response.success) {
        Swal.fire({
          title: 'Success!',
          text: response.message || (isEditing ? 'Support ticket updated successfully!' : 'Support ticket raised successfully!'),
          icon: 'success',
          confirmButtonColor: '#E11D48',
          customClass: {
            title: 'text-lg font-bold font-outfit uppercase',
            confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white'
          }
        });
        
        // Reset form & Close modal
        setTicketType('ORDER');
        setDescription('');
        setMediaFiles([]);
        setExistingMedia([]);
        setIsEditing(false);
        setEditingTicketId(null);
        setIsModalOpen(false);
        // Refresh ticket list table
        fetchTickets();
      } else {
        Swal.fire({
          title: 'Failed!',
          text: response.message || 'Failed to submit support ticket.',
          icon: 'error',
          confirmButtonColor: '#E11D48',
          customClass: {
            title: 'text-lg font-bold font-outfit uppercase',
            confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white'
          }
        });
      }
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to close this support ticket?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E11D48',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, close it!',
      customClass: {
        title: 'text-lg font-bold font-outfit uppercase',
        htmlContainer: 'text-xs font-bold font-outfit text-gray-500 uppercase',
        confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white',
        cancelButton: 'bg-slate-100 text-slate-800 px-6 py-2.5 rounded-xl font-bold uppercase text-xs ml-2'
      }
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Closing ticket...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        const response = await updateTicketStatus(ticketId, { ticketStatus: 'CLOSED' });
        if (response.success) {
          Swal.fire({
            title: 'Closed!',
            text: response.message || 'Ticket marked as CLOSED successfully!',
            icon: 'success',
            confirmButtonColor: '#E11D48',
            customClass: {
              title: 'text-lg font-bold font-outfit uppercase',
              confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white'
            }
          });
          fetchTickets();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.message || 'Failed to update ticket status.',
            icon: 'error',
            confirmButtonColor: '#E11D48',
            customClass: {
              title: 'text-lg font-bold font-outfit uppercase',
              confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white'
            }
          });
        }
      } catch (err) {
        console.error('Error updating ticket status:', err);
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to permanently delete this support ticket?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E11D48',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        title: 'text-lg font-bold font-outfit uppercase',
        htmlContainer: 'text-xs font-bold font-outfit text-gray-500 uppercase',
        confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white',
        cancelButton: 'bg-slate-100 text-slate-800 px-6 py-2.5 rounded-xl font-bold uppercase text-xs ml-2'
      }
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Deleting ticket...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        const response = await deleteTicket(ticketId);
        if (response.success) {
          Swal.fire({
            title: 'Deleted!',
            text: response.message || 'Ticket deleted successfully!',
            icon: 'success',
            confirmButtonColor: '#E11D48',
            customClass: {
              title: 'text-lg font-bold font-outfit uppercase',
              confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white'
            }
          });
          fetchTickets();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.message || 'Failed to delete support ticket.',
            icon: 'error',
            confirmButtonColor: '#E11D48',
            customClass: {
              title: 'text-lg font-bold font-outfit uppercase',
              confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white'
            }
          });
        }
      } catch (err) {
        console.error('Error deleting ticket:', err);
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const handleCustomerSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicketForView) return;

    setSendingReply(true);
    try {
      const res = await addTicketReply(selectedTicketForView._id, replyMessage.trim());
      if (res?.success) {
        toast.success('Reply sent to vendor & support team!');
        setReplyMessage('');
        setSelectedTicketForView(res.data);
        fetchTickets();
      } else {
        toast.error(res?.message || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Customer reply error:', err);
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-green-50 text-green-700 border border-green-100 uppercase">
            Resolved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-yellow-50 text-yellow-700 border border-yellow-100 uppercase animate-pulse">
            Pending
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-gray-50 text-gray-500 border border-gray-100 uppercase">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const renderAttachments = (media) => {
    if (!media) return <span className="text-gray-300">-</span>;
    
    // If it's a single object with url
    if (typeof media === 'object' && !Array.isArray(media)) {
      if (media.url) {
        return (
          <a 
            href={media.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-extrabold"
          >
            <Paperclip size={12} /> View File
          </a>
        );
      }
    }

    // If it's an array of files
    if (Array.isArray(media) && media.length > 0) {
      return (
        <div className="flex flex-col gap-1.5">
          {media.map((file, idx) => {
            const fileUrl = file.url || (typeof file === 'string' ? file : null);
            if (!fileUrl) return null;
            return (
              <a 
                key={idx}
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-extrabold"
              >
                <Paperclip size={12} /> File {idx + 1}
              </a>
            );
          })}
        </div>
      );
    }

    return <span className="text-gray-300">-</span>;
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const paginatedTickets = tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 font-outfit">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8 text-left">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">Help & Support</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <UserSidebar />

          {/* Right Content */}
          <div className="flex-grow min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] overflow-hidden flex flex-col justify-between text-left">
              
              <div>
                {/* Header with New Ticket Trigger Button */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-extrabold text-gray-900 uppercase flex items-center gap-2">
                      <Headphones size={20} className="text-primary" /> Support Center
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 font-bold">
                      View your ticket history or raise a new request for help.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenNewTicketModal}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/10 transition-all cursor-pointer hover:-translate-y-0.5 shrink-0"
                  >
                    <Plus size={14} /> Raise New Ticket
                  </button>
                </div>

                {/* Tickets Table Area */}
                <div className="p-4 sm:p-6">
                  {loadingTickets ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Loader2 className="animate-spin text-primary mb-4" size={32} />
                      <p className="text-sm font-bold text-gray-500 uppercase">Loading tickets...</p>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-4 text-gray-300">
                        <MessageSquare size={28} />
                      </div>
                      <p className="text-sm font-extrabold text-gray-400 uppercase mb-1">No support tickets found</p>
                      <p className="text-xs text-gray-400 mb-6">Have any query or issue? Raise a ticket and get help instantly.</p>
                      <button
                        onClick={handleOpenNewTicketModal}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary-hover shadow-md transition-all cursor-pointer"
                      >
                        Raise First Ticket
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-2xl w-full">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-gray-50/75 border-b border-gray-100">
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">Ticket ID</th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">Category</th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">Description</th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">Attachments</th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">Date Raised</th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">Status</th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                          {paginatedTickets.map((ticket) => (
                            <tr key={ticket._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-extrabold text-primary">
                                #{ticket._id ? ticket._id.substring(ticket._id.length - 8).toUpperCase() : 'N/A'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700">
                                  {ticket.ticketType}
                                </span>
                              </td>
                              <td className="px-4 py-3 max-w-[180px] truncate text-xs font-bold text-gray-600">
                                {ticket.description}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-gray-600">
                                {renderAttachments(ticket.mediaFiles)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-gray-400 flex items-center gap-1 mt-1">
                                <Calendar size={11} className="shrink-0" />
                                {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {getStatusBadge(ticket.ticketStatus || 'PENDING')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1 font-sans">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTicketForView(ticket)}
                                    className="px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <MessageSquare size={11} /> Discussion ({ticket.replies?.length || 0})
                                  </button>
                                  {ticket.ticketStatus !== 'CLOSED' && ticket.ticketStatus !== 'RESOLVED' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(ticket)}
                                        className="px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCloseTicket(ticket._id)}
                                        className="px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                      >
                                        Close
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTicket(ticket._id)}
                                    className="px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4 select-none">
                          <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 border border-gray-200 bg-white text-xs font-extrabold uppercase rounded-xl text-gray-500 hover:text-primary hover:border-primary disabled:opacity-50 disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-all cursor-pointer"
                          >
                            Prev
                          </button>
                          <span className="text-xs font-bold text-gray-500">
                            Page <span className="text-gray-900 font-extrabold">{currentPage}</span> of <span className="text-gray-900 font-extrabold">{totalPages}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 border border-gray-200 bg-white text-xs font-extrabold uppercase rounded-xl text-gray-500 hover:text-primary hover:border-primary disabled:opacity-50 disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-all cursor-pointer"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Help Footer */}
              <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-start gap-2.5 text-xs text-gray-400 font-bold leading-relaxed">
                <HelpCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <span>
                  Our support specialists resolve tickets within 12-24 hours. For critical payment-related refunds or missing items issues, please upload a clear screenshot of payment confirmation or invoice sheets.
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* COMPACT RAISE TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal content box */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full z-10 overflow-hidden text-left relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-900 uppercase flex items-center gap-2">
                <Headphones size={18} className="text-primary" /> {isEditing ? 'Edit Support Ticket' : 'Raise New Ticket'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg p-1 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* Category Select Dropdown */}
                <div className="space-y-1 relative">
                  <label className="text-sm font-black uppercase text-gray-400 block">Select Issue Category</label>
                  <select
                    value={ticketType}
                    onChange={e => setTicketType(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold cursor-pointer appearance-none"
                  >
                    {ticketTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 mt-4.5">
                    <ChevronRight size={16} className="rotate-90" />
                  </div>
                </div>

                {/* Link Order & Vendor Dropdown */}
                <div className="space-y-1 relative">
                  <label className="text-sm font-black uppercase text-gray-400 block">Related Order & Vendor Product (Optional)</label>
                  <select
                    value={selectedOrderId}
                    onChange={e => setSelectedOrderId(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold cursor-pointer appearance-none"
                  >
                    <option value="">-- General Platform Inquiry (No specific order/vendor) --</option>
                    {userOrders.map((ord) => {
                      const vName = ord.vendorId?.businessName || ord.vendorId?.storeName || ord.vendorId?.name || 'Vendor';
                      const pName = ord.items?.[0]?.name || ord.items?.[0]?.product?.name || 'Product Item';
                      const shortId = ord._id ? ord._id.slice(-6).toUpperCase() : 'N/A';
                      return (
                        <option key={ord._id} value={ord._id}>
                          Order #{shortId} — {vName} ({pName})
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 mt-4.5">
                    <ChevronRight size={16} className="rotate-90" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-sm font-black uppercase text-gray-400 block">Problem Description</label>
                  <textarea
                    rows="4"
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter details of your problem..."
                    className="w-full p-4 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl text-xs font-medium outline-none transition-all resize-none bg-gray-50/20"
                  />
                </div>

                {/* Existing Attachments for Edit Mode */}
                {isEditing && existingMedia.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase text-gray-400 block">Existing Attachments</label>
                    <div className="flex flex-wrap gap-2">
                      {existingMedia.map((file, index) => {
                        const fileUrl = file.url || (typeof file === 'string' ? file : null);
                        if (!fileUrl) return null;
                        const fileName = file.publicId || fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
                        return (
                          <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-extrabold text-gray-700">
                            <Paperclip size={10} className="text-primary" />
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline max-w-[150px] truncate">{fileName}</a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* File Attachment Drag and Drop */}
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase text-gray-400 block">{isEditing ? 'Upload Additional Attachments (Optional)' : 'Attachments (Optional)'}</label>
                  <label className="border border-dashed border-gray-200 hover:border-primary/50 bg-gray-50/30 hover:bg-primary/[0.01] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5 group">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />
                    <Upload size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-extrabold uppercase text-gray-700">Upload Files</span>
                  </label>

                  {/* Attachment Previews */}
                  {mediaFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {mediaFiles.map((file, index) => {
                        const isImage = file.type.startsWith('image/');
                        return (
                          <div key={index} className="relative border border-gray-100 rounded-lg overflow-hidden bg-white p-1 h-16 flex items-center justify-center">
                            {isImage ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="max-h-full max-w-full rounded object-contain"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-primary text-xs font-bold">
                                <FileText size={18} />
                                <span className="max-w-[70px] truncate">{file.name}</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-md scale-75 cursor-pointer"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Actions Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/75 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary-hover shadow-md transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    isEditing ? 'Update Ticket' : 'Submit'
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* TICKET CONVERSATION & VENDOR REPLY MODAL */}
      {selectedTicketForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedTicketForView(null)} />
          
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-xl w-full z-10 overflow-hidden text-left relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-gray-400 font-mono">TICKET #{selectedTicketForView._id?.toUpperCase()}</span>
                <h2 className="text-sm font-extrabold text-gray-900 uppercase">
                  Category: {selectedTicketForView.ticketType}
                </h2>
              </div>
              <button onClick={() => setSelectedTicketForView(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Vendor Info if assigned */}
              {selectedTicketForView.vendorId && (
                <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-xl">
                  <span className="text-[9px] font-black text-primary uppercase block">Assigned Store Partner</span>
                  <p className="text-xs font-black text-gray-900">
                    {selectedTicketForView.vendorId.businessName || selectedTicketForView.vendorId.storeName || selectedTicketForView.vendorId.name}
                  </p>
                </div>
              )}

              {/* Original Complaint */}
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Your Complaint</span>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium text-gray-700">
                  {selectedTicketForView.description}
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="pt-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Replies & Resolution History</span>
                <div className="space-y-2">
                  {(!selectedTicketForView.replies || selectedTicketForView.replies.length === 0) ? (
                    <p className="text-xs text-gray-400 italic">No replies yet. Vendor/Support team will reply shortly.</p>
                  ) : (
                    selectedTicketForView.replies.map((r, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border text-xs ${
                        r.senderRole === 'VENDOR' ? 'bg-emerald-50 border-emerald-100 text-emerald-950 ml-3' :
                        r.senderRole === 'ADMIN' ? 'bg-blue-50 border-blue-100 text-blue-950 ml-3' : 'bg-gray-50 border-gray-100 mr-3'
                      }`}>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase mb-1 opacity-70">
                          <span>{r.senderName} ({r.senderRole})</span>
                          <span>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="font-medium">{r.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Customer Reply Input Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/75 flex items-center gap-2">
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your message to vendor/support..."
                onKeyDown={(e) => e.key === 'Enter' && handleCustomerSendReply()}
                className="flex-1 px-3.5 py-2.5 text-xs font-medium rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                disabled={sendingReply || !replyMessage.trim()}
                onClick={handleCustomerSendReply}
                className="px-4 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition-all cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportTickets;
