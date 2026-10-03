import React, { useState, useEffect } from 'react';
import { Send, Bell, Calendar, Eye, Users, Layers, ExternalLink, ChevronLeft, ChevronRight, Loader2, Mail, CheckCircle, XCircle, Plus, X, Trash2, Clock, Settings, Pencil, Search } from 'lucide-react';
import { getAllCampaigns, getAllNotifications, addCampaign, updateCampaign, deleteCampaign } from '../../../api/adminService';
import Swal from 'sweetalert2';

const NotificationsManager = ({ isDarkMode }) => {
  const [activeSubTab, setActiveSubTab] = useState('campaigns'); // 'campaigns' or 'notifications'
  
  // Campaigns list states
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsPage, setCampaignsPage] = useState(1);
  const [campaignsTotal, setCampaignsTotal] = useState(0);
  const CAMPAIGNS_LIMIT = 8;

  // Notifications list states
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsTotal, setNotificationsTotal] = useState(0);
  const NOTIFICATIONS_LIMIT = 8;

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Create & Edit campaign form states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [action, setAction] = useState('OPEN_HOME');
  const [actionUrl, setActionUrl] = useState('');
  const [targetRoles, setTargetRoles] = useState([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [customParams, setCustomParams] = useState([{ key: '', value: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const rolesList = [
    { id: 'user', label: 'Customers' },
    { id: 'vendor', label: 'Vendors' },
    { id: 'service_provider', label: 'Service Providers' },
    { id: 'influencer', label: 'Influencers' },
    { id: 'educator', label: 'Educators' }
  ];

  // Client-side filtered campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const titleMatch = campaign.title?.toLowerCase().includes(query);
    const bodyMatch = campaign.body?.toLowerCase().includes(query);
    const senderMatch = campaign.senderId?.name?.toLowerCase().includes(query) || campaign.senderId?.email?.toLowerCase().includes(query);
    const targetRolesMatch = campaign.targetRoles?.some(role => role.toLowerCase().includes(query));
    return titleMatch || bodyMatch || senderMatch || targetRolesMatch;
  });

  // Client-side filtered notifications
  const filteredNotifications = notifications.filter(notification => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const titleMatch = notification.title?.toLowerCase().includes(query);
    const bodyMatch = notification.body?.toLowerCase().includes(query);
    const senderMatch = notification.senderId?.name?.toLowerCase().includes(query) || notification.senderId?.email?.toLowerCase().includes(query);
    const receiverMatch = notification.receiverId?.name?.toLowerCase().includes(query) || notification.receiverId?.email?.toLowerCase().includes(query);
    const typeMatch = notification.type?.toLowerCase().includes(query);
    return titleMatch || bodyMatch || senderMatch || receiverMatch || typeMatch;
  });

  const fetchCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const res = await getAllCampaigns(campaignsPage, CAMPAIGNS_LIMIT);
      if (res.success && res.data) {
        setCampaigns(res.data.data || []);
        setCampaignsTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await getAllNotifications(notificationsPage, NOTIFICATIONS_LIMIT);
      if (res.success && res.data) {
        setNotifications(res.data.data || []);
        setNotificationsTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'campaigns') {
      fetchCampaigns();
    } else {
      fetchNotifications();
    }
  }, [activeSubTab, campaignsPage, notificationsPage]);

  // Reset pagination and search on tab change
  const handleTabChange = (tab) => {
    setActiveSubTab(tab);
    setCampaignsPage(1);
    setNotificationsPage(1);
    setSearchQuery('');
  };

  // Campaigns pagination logic
  const totalCampaignsPages = Math.ceil(campaignsTotal / CAMPAIGNS_LIMIT);
  const handlePrevCampaigns = () => {
    if (campaignsPage > 1) setCampaignsPage(p => p - 1);
  };
  const handleNextCampaigns = () => {
    if (campaignsPage < totalCampaignsPages) setCampaignsPage(p => p + 1);
  };

  // Notifications pagination logic
  const totalNotificationsPages = Math.ceil(notificationsTotal / NOTIFICATIONS_LIMIT);
  const handlePrevNotifications = () => {
    if (notificationsPage > 1) setNotificationsPage(p => p - 1);
  };
  const handleNextNotifications = () => {
    if (notificationsPage < totalNotificationsPages) setNotificationsPage(p => p + 1);
  };

  // Form helpers
  const handleRoleToggle = (roleId) => {
    if (targetRoles.includes(roleId)) {
      setTargetRoles(prev => prev.filter(r => r !== roleId));
    } else {
      setTargetRoles(prev => [...prev, roleId]);
    }
  };

  const handleAddParam = () => {
    setCustomParams(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveParam = (index) => {
    setCustomParams(prev => prev.filter((_, i) => i !== index));
  };

  const handleParamChange = (index, field, val) => {
    setCustomParams(prev => {
      const next = [...prev];
      next[index][field] = val;
      return next;
    });
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingCampaignId(null);
    setTitle('');
    setBody('');
    setAction('OPEN_HOME');
    setActionUrl('');
    setTargetRoles([]);
    setIsScheduled(false);
    setScheduledAt('');
    setIsRecurring(false);
    setCustomParams([{ key: '', value: '' }]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (campaign) => {
    setIsEditing(true);
    setEditingCampaignId(campaign._id);
    setTitle(campaign.title || '');
    setBody(campaign.body || '');
    setAction(campaign.action || 'OPEN_HOME');
    setActionUrl(campaign.actionUrl || '');
    setTargetRoles(campaign.targetRoles || []);
    setIsScheduled(!!campaign.scheduledAt);
    
    if (campaign.scheduledAt) {
      const date = new Date(campaign.scheduledAt);
      const pad = (num) => String(num).padStart(2, '0');
      const localString = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
      setScheduledAt(localString);
    } else {
      setScheduledAt('');
    }
    
    setIsRecurring(campaign.isRecurring || false);

    if (campaign.data && typeof campaign.data === 'object' && Object.keys(campaign.data).length > 0) {
      const parsed = Object.entries(campaign.data).map(([key, value]) => ({ key, value: String(value) }));
      setCustomParams(parsed);
    } else {
      setCustomParams([{ key: '', value: '' }]);
    }

    setIsCreateModalOpen(true);
  };

  const handleDeleteCampaign = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this campaign!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#da016a',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteCampaign(id);
          if (res.success) {
            Swal.fire({
              title: 'Deleted!',
              text: res.message || 'Campaign has been deleted.',
              icon: 'success',
              confirmButtonColor: '#da016a'
            });
            fetchCampaigns();
          } else {
            Swal.fire({
              title: 'Failed',
              text: res.message || 'Failed to delete campaign.',
              icon: 'error',
              confirmButtonColor: '#da016a'
            });
          }
        } catch (err) {
          console.error('Error deleting campaign:', err);
          Swal.fire({
            title: 'Error',
            text: 'Something went wrong during deletion.',
            icon: 'error',
            confirmButtonColor: '#da016a'
          });
        }
      }
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || targetRoles.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Title, Body, and at least one target role are required.',
        icon: 'error',
        confirmButtonColor: '#da016a'
      });
      return;
    }

    if (isScheduled && !scheduledAt) {
      Swal.fire({
        title: 'Error',
        text: 'Please select a scheduled date and time.',
        icon: 'error',
        confirmButtonColor: '#da016a'
      });
      return;
    }

    // Format custom payload data
    const dataObj = {};
    customParams.forEach(param => {
      if (param.key.trim()) {
        const val = param.value.trim();
        if (!isNaN(val) && val !== '') {
          dataObj[param.key.trim()] = Number(val);
        } else if (val.toLowerCase() === 'true') {
          dataObj[param.key.trim()] = true;
        } else if (val.toLowerCase() === 'false') {
          dataObj[param.key.trim()] = false;
        } else {
          dataObj[param.key.trim()] = val;
        }
      }
    });

    const payload = {
      title: title.trim(),
      body: body.trim(),
      moduleType: 'OTHER',
      action,
      actionUrl: actionUrl.trim(),
      targetRoles,
      sendOption: [],
      data: dataObj
    };

    if (isScheduled) {
      payload.scheduledAt = new Date(scheduledAt).toISOString();
      payload.isRecurring = isRecurring;
    }

    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await updateCampaign(editingCampaignId, payload);
      } else {
        res = await addCampaign(payload);
      }

      if (res.success) {
        Swal.fire({
          title: isEditing ? 'Campaign Updated!' : 'Campaign Created!',
          text: res.message || `Notification campaign ${isEditing ? 'updated' : 'created'} successfully.`,
          icon: 'success',
          confirmButtonColor: '#da016a'
        });
        
        // Reset states
        setTitle('');
        setBody('');
        setAction('OPEN_HOME');
        setActionUrl('');
        setTargetRoles([]);
        setIsScheduled(false);
        setScheduledAt('');
        setIsRecurring(false);
        setCustomParams([{ key: '', value: '' }]);
        setIsCreateModalOpen(false);
        setIsEditing(false);
        setEditingCampaignId(null);
        
        // Refresh campaigns
        fetchCampaigns();
      } else {
        Swal.fire({
          title: 'Failed',
          text: res.message || 'Failed to process campaign.',
          icon: 'error',
          confirmButtonColor: '#da016a'
        });
      }
    } catch (err) {
      console.error('Error processing campaign:', err);
      Swal.fire({
        title: 'Error',
        text: 'Something went wrong during campaign operation.',
        icon: 'error',
        confirmButtonColor: '#da016a'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 text-left animate-in fade-in duration-300">
      {/* Header section (Matches standard directories directory headers style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-lg lg:text-3xl font-bold uppercase transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Notifications Manager
          </h2>
          <p className="text-sm font-semibold uppercase text-gray-400 mt-1">
            Monitor sent campaigns, targeted roles, and user-specific notification logs
          </p>
        </div>
        <div className={`px-4 lg:px-6 py-3 lg:py-4 rounded-2xl lg:rounded-[24px] border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-955 border-white/5' : 'bg-white border-gray-100'}`}>
          <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">
            Total {activeSubTab === 'campaigns' ? 'Campaigns' : 'Logs'}
          </p>
          <p className="text-xl lg:text-2xl font-bold">
            {activeSubTab === 'campaigns' ? campaignsTotal : notificationsTotal}
          </p>
        </div>
      </div>

      {/* Main Large Action Button */}
      <div className="flex">
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 lg:px-8 py-3 lg:py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Create Campaign
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-gray-100 dark:border-white/5 gap-6">
        <button
          onClick={() => handleTabChange('campaigns')}
          className={`pb-4 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
            activeSubTab === 'campaigns'
              ? 'text-primary'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Notification Campaigns ({campaignsTotal})
          {activeSubTab === 'campaigns' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => handleTabChange('notifications')}
          className={`pb-4 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'text-primary'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Notifications Logs ({notificationsTotal})
          {activeSubTab === 'notifications' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Filter and search bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-4 items-center justify-between ${
        isDarkMode ? 'bg-gray-955 border-white/5 shadow-sm' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'campaigns' ? 'Search campaigns by title, body, roles...' : 'Search logs by receiver, sender, title, type...'}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
              isDarkMode 
                ? 'bg-gray-900 border-white/5 text-white placeholder:text-gray-500 focus:border-primary/50' 
                : 'bg-gray-55 border-gray-150 text-gray-800 placeholder:text-gray-400 focus:border-primary/50'
            }`}
          />
        </div>
      </div>

      {/* Content Section */}
      {activeSubTab === 'campaigns' ? (
        <div className="space-y-4">
          {campaignsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p className="text-xs font-bold text-gray-400 uppercase">Fetching campaigns data...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className={`p-16 text-center border rounded-2xl ${isDarkMode ? 'bg-gray-955 border-white/5 shadow-sm' : 'bg-white border-gray-100 shadow-sm'}`}>
              <Send size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-405">No matching campaigns found</p>
            </div>
          ) : (
            <>
              <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gray-955 border-white/5 shadow-sm' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={isDarkMode ? 'bg-gray-900/50 border-b border-white/5' : 'bg-gray-50/75 border-b border-gray-100'}>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Sender</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Campaign Title & Body</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Target Roles</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Recipients</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Scheduled/Sent</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                      {filteredCampaigns.map((row) => (
                        <tr key={row._id} className={isDarkMode ? 'hover:bg-white/5 transition-colors' : 'hover:bg-gray-55/50 transition-colors'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col text-left">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{row.senderId?.name || 'System'}</span>
                              <span className="text-xs font-bold uppercase text-gray-400 mt-0.5">{row.senderId?.email || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-sm">
                            <div className="flex flex-col text-left">
                              <span className="text-sm font-bold text-primary">{row.title}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{row.body}</span>
                              {row.actionUrl && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1 font-bold">
                                  Action: {row.action} ({row.actionUrl})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {row.targetRoles?.map((r, i) => (
                                <span key={i} className="px-2.5 py-1 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/10 uppercase tracking-wider">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              <Users size={12} className="text-gray-400" />
                              <span className="font-bold text-gray-700 dark:text-gray-300">{row.sentCount || 0}</span>
                              <span className="text-gray-400 font-medium">/</span>
                              <span className="text-gray-400 font-medium">{row.totalRecipients || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <Calendar size={11} className="text-gray-400" />
                                {row.sentAt ? new Date(row.sentAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                }) : new Date(row.scheduledAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-xs font-bold uppercase text-gray-400 mt-0.5">
                                {row.sentAt ? new Date(row.sentAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'Scheduled'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!row.sentAt && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(row)}
                                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer"
                                    title="Edit Scheduled Campaign"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCampaign(row._id)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                                    title="Delete Scheduled Campaign"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Standard Centralized Admin Pagination Controls */}
              {totalCampaignsPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button 
                    onClick={handlePrevCampaigns} 
                    disabled={campaignsPage === 1} 
                    className={`p-4 rounded-2xl disabled:opacity-30 shadow-sm transition-all cursor-pointer ${
                      isDarkMode ? 'bg-gray-800 text-white hover:bg-primary' : 'bg-white text-gray-600 hover:bg-primary hover:text-white border border-gray-100'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-14 h-14 flex items-center justify-center bg-primary text-white rounded-2xl font-bold shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
                    {campaignsPage}
                  </div>
                  <button 
                    onClick={handleNextCampaigns} 
                    disabled={campaignsPage === totalCampaignsPages} 
                    className={`p-4 rounded-2xl disabled:opacity-30 shadow-sm transition-all cursor-pointer ${
                      isDarkMode ? 'bg-gray-800 text-white hover:bg-primary' : 'bg-white text-gray-600 hover:bg-primary hover:text-white border border-gray-100'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {notificationsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p className="text-xs font-bold text-gray-400 uppercase">Fetching notifications log...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={`p-16 text-center border rounded-2xl ${isDarkMode ? 'bg-gray-955 border-white/5 shadow-sm' : 'bg-white border-gray-100 shadow-sm'}`}>
              <Send size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-405">No matching notification logs found</p>
            </div>
          ) : (
            <>
              <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gray-955 border-white/5 shadow-sm' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={isDarkMode ? 'bg-gray-900/50 border-b border-white/5' : 'bg-gray-50/75 border-b border-gray-100'}>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Receiver</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Sender</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Title & Content</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Type / Priority</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Read / Email Status</th>
                        <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Sent At</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                      {filteredNotifications.map((row) => (
                        <tr key={row._id} className={isDarkMode ? 'hover:bg-white/5 transition-colors' : 'hover:bg-gray-55/50 transition-colors'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col text-left">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{row.receiverId?.name || 'N/A'}</span>
                              <span className="text-xs font-bold uppercase text-gray-400 mt-0.5">{row.receiverId?.email || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col text-left">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{row.senderId?.name || 'System'}</span>
                              <span className="text-xs font-bold uppercase text-gray-400 mt-0.5">{row.senderId?.email || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <div className="flex flex-col text-left">
                              <span className="text-sm font-bold text-primary">{row.title}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{row.body}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="inline-block px-2.5 py-1 text-xs font-bold rounded bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-transparent text-center uppercase tracking-wider">
                                {row.type || 'PROMOTIONAL'}
                              </span>
                              <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded text-center uppercase tracking-wider ${
                                row.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {row.priority || 'NORMAL'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-bold">
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5">
                                {row.isRead ? <CheckCircle size={12} className="text-green-500" /> : <XCircle size={12} className="text-gray-400" />}
                                <span className={row.isRead ? 'text-green-600' : 'text-gray-500 dark:text-gray-455'}>{row.isRead ? 'Read' : 'Unread'}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                {row.isEmailSent ? <CheckCircle size={12} className="text-green-500" /> : <XCircle size={12} className="text-gray-400" />}
                                <span className={row.isEmailSent ? 'text-green-600' : 'text-gray-500 dark:text-gray-455'}>{row.isEmailSent ? 'Email Sent' : 'Email Skipped'}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <Calendar size={11} className="text-gray-400" />
                                {new Date(row.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-xs font-bold uppercase text-gray-400 mt-0.5">
                                {new Date(row.createdAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Standard Centralized Admin Pagination Controls */}
              {totalNotificationsPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button 
                    onClick={handlePrevNotifications} 
                    disabled={notificationsPage === 1} 
                    className={`p-4 rounded-2xl disabled:opacity-30 shadow-sm transition-all cursor-pointer ${
                      isDarkMode ? 'bg-gray-800 text-white hover:bg-primary' : 'bg-white text-gray-600 hover:bg-primary hover:text-white border border-gray-100'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-14 h-14 flex items-center justify-center bg-primary text-white rounded-2xl font-bold shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
                    {notificationsPage}
                  </div>
                  <button 
                    onClick={handleNextNotifications} 
                    disabled={notificationsPage === totalNotificationsPages} 
                    className={`p-4 rounded-2xl disabled:opacity-30 shadow-sm transition-all cursor-pointer ${
                      isDarkMode ? 'bg-gray-800 text-white hover:bg-primary' : 'bg-white text-gray-600 hover:bg-primary hover:text-white border border-gray-100'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Floating Create Campaign Modal Overlay ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1100] overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCreateModalOpen(false)} />

          <div className={`rounded-3xl shadow-2xl border max-w-2xl w-full z-10 overflow-hidden text-left relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] ${
            isDarkMode ? 'bg-gray-955 border-white/5 text-white' : 'bg-white border-gray-150 text-gray-800'
          }`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between flex-shrink-0">
              <h2 className="text-base font-extrabold uppercase flex items-center gap-2 text-gray-900 dark:text-white">
                <Bell size={18} className="text-primary" /> {isEditing ? 'Edit Campaign Details' : 'Create Campaign'}
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg p-1.5 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* Form fields: Title & Body */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 block">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="E.g., Weekend Special Discount Offer"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                        : 'bg-gray-55 border-gray-150 text-gray-850 focus:border-primary/50'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 block">Message Body</label>
                  <textarea
                    required
                    rows={3}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Enter the push notification message details here..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all resize-none ${
                      isDarkMode 
                        ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                        : 'bg-gray-55 border-gray-150 text-gray-850 focus:border-primary/50'
                    }`}
                  />
                </div>

                {/* Target Roles Checkbox List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 block">Target Audience Roles</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {rolesList.map(roleItem => {
                      const selected = targetRoles.includes(roleItem.id);
                      return (
                        <button
                          key={roleItem.id}
                          type="button"
                          onClick={() => handleRoleToggle(roleItem.id)}
                          className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary/10 border-primary/30 text-primary font-bold'
                              : isDarkMode
                              ? 'bg-gray-900 border-white/5 text-gray-400 hover:text-white'
                              : 'bg-gray-50 border-gray-100 text-gray-650 hover:bg-gray-105'
                          }`}
                        >
                          <span>{roleItem.label}</span>
                          {selected && <CheckCircle size={13} className="text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 block">Click Action</label>
                    <select
                      value={action}
                      onChange={e => setAction(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                          : 'bg-gray-55 border-gray-150 text-gray-850 focus:border-primary/50'
                      }`}
                    >
                      <option value="OPEN_HOME">Open Home Page</option>
                      <option value="OPEN_OFFERS">Open Offers list</option>
                      <option value="OPEN_PROFILE">Open Profile Page</option>
                      <option value="OPEN_WALLET">Open Wallet Panel</option>
                      <option value="OPEN_ORDERS">Open Orders Panel</option>
                      <option value="OPEN_FLASH_SALE">Open Flash Sale Page</option>
                      <option value="OTHER">Other Custom URL</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 block">Action Deep Link URL</label>
                    <input
                      type="text"
                      value={actionUrl}
                      onChange={e => setActionUrl(e.target.value)}
                      placeholder="E.g., fashionfever://offers"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                          : 'bg-gray-55 border-gray-150 text-gray-850 focus:border-primary/50'
                      }`}
                    />
                  </div>
                </div>

                {/* Dynamic Custom Payload Parameters */}
                <div className="space-y-2.5 border-t border-gray-100 dark:border-white/5 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-400 block">Custom Payload Parameters</label>
                    <button
                      type="button"
                      onClick={handleAddParam}
                      className="text-[10px] font-black uppercase text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={11} /> Add Parameter
                    </button>
                  </div>

                  <div className="space-y-2">
                    {customParams.map((param, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={param.key}
                          onChange={e => handleParamChange(index, 'key', e.target.value)}
                          placeholder="Key (e.g. discount)"
                          className={`flex-1 px-3 py-2 rounded-xl border text-[11px] font-bold outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                              : 'bg-gray-55 border-gray-150 text-gray-850 focus:border-primary/50'
                          }`}
                        />
                        <input
                          type="text"
                          value={param.value}
                          onChange={e => handleParamChange(index, 'value', e.target.value)}
                          placeholder="Value (e.g. 50)"
                          className={`flex-1 px-3 py-2 rounded-xl border text-[11px] font-bold outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                              : 'bg-gray-55 border-gray-150 text-gray-850 focus:border-primary/50'
                          }`}
                        />
                        {customParams.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveParam(index)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheduling Settings */}
                <div className="space-y-4 border-t border-gray-100 dark:border-white/5 pt-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsScheduled(false)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        !isScheduled
                          ? 'bg-primary text-white border-primary shadow-md'
                          : isDarkMode
                          ? 'bg-gray-900 border-white/5 text-gray-400 hover:text-white'
                          : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-105'
                      }`}
                    >
                      Send Instantly
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScheduled(true)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isScheduled
                          ? 'bg-primary text-white border-primary shadow-md'
                          : isDarkMode
                          ? 'bg-gray-900 border-white/5 text-gray-400 hover:text-white'
                          : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-105'
                      }`}
                    >
                      <Clock size={13} /> Schedule for Later
                    </button>
                  </div>

                  {isScheduled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top duration-300">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 block">Scheduled Date & Time</label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            required={isScheduled}
                            value={scheduledAt}
                            onChange={e => setScheduledAt(e.target.value)}
                            onClick={(e) => e.target.showPicker?.()}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all cursor-pointer ${
                              isDarkMode 
                                ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                                : 'bg-gray-55 border-gray-150 text-gray-850 focus:border-primary/50'
                            }`}
                          />
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={16} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 h-full pt-6">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          checked={isRecurring}
                          onChange={e => setIsRecurring(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
                        />
                        <label htmlFor="isRecurring" className="text-xs font-semibold text-gray-600 dark:text-gray-350 cursor-pointer">
                          Make this a recurring campaign
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase border transition-all cursor-pointer ${
                    isDarkMode ? 'border-white/5 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-600 hover:bg-gray-55'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase text-white bg-primary hover:bg-primary/95 shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Processing...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> {isEditing ? 'Save Changes' : isScheduled ? 'Schedule Campaign' : 'Send Campaign'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManager;
