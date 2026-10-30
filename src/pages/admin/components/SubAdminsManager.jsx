import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Plus, Search, Trash2, Mail, Lock, User, Check, X,
  Loader2, KeyRound, CheckSquare, Pencil, LayoutDashboard, Users,
  Briefcase, BookOpen, Store, CircleAlert, IndianRupee, TrendingUp,
  Percent, Grid, Package, TicketPercent, Sparkles, ShoppingBag,
  CreditCard, Layers, ClipboardList, Image, Wallet, Landmark, Bell
} from 'lucide-react';
import { addSubAdmin, getSubAdmins, deleteSubAdmin, updateSubAdmin, getSubAdminDetails } from '../../../api/adminService';
import Swal from 'sweetalert2';

// ── Complete list of all fields present in the Admin Sidebar ──
const SIDEBAR_SECTIONS = [
  {
    title: 'Overview',
    fields: [
      { id: 'dashboard', label: 'Dashboard', desc: 'Analytics graphs, KPI cards & live statistics', icon: LayoutDashboard, module: 'DASHBOARD' },
    ]
  },
  {
    title: 'People',
    fields: [
      { id: 'users', label: 'User Management', desc: 'Customer accounts, block/unblock & role control', icon: Users, module: 'USERS' },
      { id: 'service-providers', label: 'Service Providers', desc: 'Salons, makeup artists & provider profiles', icon: Briefcase, module: 'SERVICE_PROVIDERS' },
      { id: 'educators', label: 'Educator Approvals', desc: 'Educator onboarding & application approvals', icon: BookOpen, module: 'COURSES' },
      { id: 'all-educators', label: 'Educator Directory', desc: 'Directory of all approved academy educators', icon: BookOpen, module: 'COURSES' },
      { id: 'vendors', label: 'Vendor List', desc: 'Registered vendor stores & shop directory', icon: Store, module: 'VENDORS' },
      { id: 'pending', label: 'Pending Approvals (Vendors)', desc: 'Vendor registration & document verification', icon: CircleAlert, module: 'VENDORS' },
      { id: 'vendor-payouts', label: 'Vendor Payouts', desc: 'Vendor revenue withdrawal & bank settlements', icon: IndianRupee, module: 'VENDORS' },
      { id: 'affiliate-dashboard', label: 'Affiliate Performance', desc: 'Influencer referrals & link conversion stats', icon: LayoutDashboard, module: 'INFLUENCERS' },
      { id: 'influencers', label: 'Influencer List', desc: 'Social influencers directory & profile statuses', icon: Users, module: 'INFLUENCERS' },
      { id: 'commission-slabs', label: 'Commission Slabs', desc: 'Influencer referral tiers & commission %', icon: Percent, module: 'INFLUENCERS' },
      { id: 'influencer-commissions', label: 'Commissions & Payouts', desc: 'Influencer payout requests & transactions', icon: IndianRupee, module: 'INFLUENCERS' },
    ]
  },
  {
    title: 'Catalog',
    fields: [
      { id: 'categories', label: 'Categories', desc: 'Ecommerce product & global categories', icon: Grid, module: 'VENDORS' },
      { id: 'course-categories', label: 'Course Categories', desc: 'Fashion & beauty course academy categories', icon: BookOpen, module: 'COURSES' },
      { id: 'products', label: 'Products', desc: 'Store items, inventory stock & pricing', icon: Package, module: 'VENDORS' },
      { id: 'coupons', label: 'Coupons', desc: 'Discount voucher codes & promotional offers', icon: TicketPercent, module: 'INFLUENCERS' },
      { id: 'subscription-plans', label: 'Beauty Services', desc: 'Salon & beauty service package tiers', icon: Sparkles, module: 'SERVICE_PROVIDERS' },
    ]
  },
  {
    title: 'Operations',
    fields: [
      { id: 'orders', label: 'Orders Manager', desc: 'Store orders, tracking & fulfillment status', icon: ShoppingBag, module: 'VENDORS' },
      { id: 'beauty-services', label: 'Services Subscription', desc: 'Active provider subscriptions & renewals', icon: CreditCard, module: 'SERVICE_PROVIDERS' },
      { id: 'service-categories', label: 'Service Categories', desc: 'Salon haircut, makeup & spa categories', icon: Layers, module: 'SERVICE_PROVIDERS' },
      { id: 'admin-service-leads', label: 'Service Leads', desc: 'Customer quote requests & service leads', icon: ClipboardList, module: 'SERVICE_PROVIDERS' },
      { id: 'home-content', label: 'Home Content', desc: 'App banners, sliders & promotional graphics', icon: Image, module: 'HOME_CONTENT' },
      { id: 'home-booking-cards', label: 'Home Booking Cards', desc: 'Homepage quick-booking cards & highlights', icon: Sparkles, module: 'HOME_CONTENT' },
      { id: 'cashback-slabs', label: 'Cashback Slabs', desc: 'User wallet cashback rules & slabs', icon: Percent, module: 'FINANCE' },
      { id: 'wallet-balances', label: 'Wallet Balances', desc: 'Platform and user wallet ledger balances', icon: Wallet, module: 'FINANCE' },
      { id: 'bank-accounts', label: 'Bank Accounts', desc: 'Registered vendor & educator bank accounts', icon: Landmark, module: 'FINANCE' },
      { id: 'tickets', label: 'Support Tickets', desc: 'Helpdesk complaints & ticket resolutions', icon: CircleAlert, module: 'TICKETS' },
      { id: 'notifications', label: 'Notifications Manager', desc: 'Broadcast announcements & push campaigns', icon: Bell, module: 'NOTIFICATION' },
    ]
  }
];

const ALL_FIELDS = SIDEBAR_SECTIONS.flatMap(s => s.fields);

const TAB_TO_MODULE = {
  dashboard: 'DASHBOARD',
  users: 'USERS',
  'service-providers': 'SERVICE_PROVIDERS',
  educators: 'COURSES',
  'all-educators': 'COURSES',
  vendors: 'VENDORS',
  pending: 'VENDORS',
  'vendor-payouts': 'VENDORS',
  'affiliate-dashboard': 'INFLUENCERS',
  influencers: 'INFLUENCERS',
  'commission-slabs': 'INFLUENCERS',
  'influencer-commissions': 'INFLUENCERS',
  categories: 'VENDORS',
  'course-categories': 'COURSES',
  products: 'VENDORS',
  coupons: 'INFLUENCERS',
  'subscription-plans': 'SERVICE_PROVIDERS',
  orders: 'VENDORS',
  'beauty-services': 'SERVICE_PROVIDERS',
  'service-categories': 'SERVICE_PROVIDERS',
  'admin-service-leads': 'SERVICE_PROVIDERS',
  'home-content': 'HOME_CONTENT',
  'home-booking-cards': 'HOME_CONTENT',
  'cashback-slabs': 'FINANCE',
  'wallet-balances': 'FINANCE',
  'bank-accounts': 'FINANCE',
  tickets: 'TICKETS',
  notifications: 'NOTIFICATION',
};

// Fallback mapping for existing sub-admins with legacy moduleAccess
const MODULE_TO_TABS = {
  DASHBOARD: ['dashboard'],
  USERS: ['users'],
  SERVICE_PROVIDERS: ['service-providers', 'subscription-plans', 'beauty-services', 'service-categories', 'admin-service-leads'],
  COURSES: ['educators', 'all-educators', 'course-categories'],
  VENDORS: ['vendors', 'pending', 'vendor-payouts', 'categories', 'products', 'orders'],
  INFLUENCERS: ['affiliate-dashboard', 'influencers', 'commission-slabs', 'influencer-commissions', 'coupons'],
  HOME_CONTENT: ['home-content', 'home-booking-cards'],
  FINANCE: ['cashback-slabs', 'wallet-balances', 'bank-accounts'],
  TICKETS: ['tickets'],
  NOTIFICATION: ['notifications'],
};

const SubAdminsManager = ({ isDarkMode }) => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedTabs, setSelectedTabs] = useState([]);
  const [tabFilter, setTabFilter] = useState('');

  const fetchSubAdmins = async () => {
    setLoading(true);
    try {
      const response = await getSubAdmins();
      if (response.success && response.data) {
        setSubAdmins(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setSubAdmins([]);
      }
    } catch (err) {
      console.error('Error fetching sub-admins:', err);
      setSubAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const handleOpenEditModal = async (admin) => {
    Swal.fire({
      title: 'Loading Details...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: isDarkMode ? '#18181b' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#18181b',
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await getSubAdminDetails(admin._id);
      Swal.close();
      if (response.success && response.data) {
        const fullAdmin = response.data;
        setIsEditing(true);
        setEditingAdminId(fullAdmin._id);
        setName(fullAdmin.userId?.name || fullAdmin.name || '');
        setEmail(fullAdmin.userId?.email || fullAdmin.email || '');
        setPhone(fullAdmin.userId?.phone || fullAdmin.phone || '');
        setPassword(''); // Optional on edit
        setRoleTitle(fullAdmin.roleTitle || '');
        setIsActive(fullAdmin.isActive ?? true);
        setTabFilter('');

        // Populate selectedTabs from allowedTabs or fallback from moduleAccess
        if (Array.isArray(fullAdmin.allowedTabs) && fullAdmin.allowedTabs.length > 0) {
          setSelectedTabs(fullAdmin.allowedTabs);
        } else if (Array.isArray(fullAdmin.moduleAccess) && fullAdmin.moduleAccess.length > 0) {
          const derived = [];
          fullAdmin.moduleAccess.forEach(item => {
            const tabs = MODULE_TO_TABS[item.module] || [];
            derived.push(...tabs);
          });
          setSelectedTabs(Array.from(new Set(derived)));
        } else {
          setSelectedTabs([]);
        }

        setIsModalOpen(true);
      } else {
        Swal.fire({
          title: 'Error',
          text: response.message || 'Failed to fetch sub-admin details.',
          icon: 'error',
          confirmButtonColor: '#E11D48'
        });
      }
    } catch (err) {
      console.error('Error fetching sub-admin details:', err);
      Swal.close();
      Swal.fire({
        title: 'Error',
        text: 'Something went wrong while fetching details.',
        icon: 'error',
        confirmButtonColor: '#E11D48'
      });
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingAdminId(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRoleTitle('');
    setIsActive(true);
    setSelectedTabs([]);
    setTabFilter('');
    setIsModalOpen(true);
  };

  const handleToggleTab = (tabId) => {
    setSelectedTabs(prev =>
      prev.includes(tabId) ? prev.filter(id => id !== tabId) : [...prev, tabId]
    );
  };

  const handleSelectAllTabs = () => {
    setSelectedTabs(ALL_FIELDS.map(f => f.id));
  };

  const handleDeselectAllTabs = () => {
    setSelectedTabs([]);
  };

  const handleToggleSection = (section) => {
    const sectionIds = section.fields.map(f => f.id);
    const allSelected = sectionIds.every(id => selectedTabs.includes(id));
    if (allSelected) {
      setSelectedTabs(prev => prev.filter(id => !sectionIds.includes(id)));
    } else {
      setSelectedTabs(prev => Array.from(new Set([...prev, ...sectionIds])));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleTitle) {
      Swal.fire({
        title: 'Error',
        text: 'Role Title is required.',
        icon: 'error',
        confirmButtonColor: '#E11D48'
      });
      return;
    }

    if (!isEditing && (!name || !email || !password)) {
      Swal.fire({
        title: 'Error',
        text: 'Name, Email and Password are required.',
        icon: 'error',
        confirmButtonColor: '#E11D48'
      });
      return;
    }

    if (selectedTabs.length === 0) {
      const confirmZero = await Swal.fire({
        title: 'No Fields Selected',
        text: 'This sub-admin will not have access to any sidebar items. Do you want to proceed?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#E11D48',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'Yes, proceed'
      });
      if (!confirmZero.isConfirmed) return;
    }

    // Format moduleAccess payload to satisfy backend API guards
    const uniqueModules = Array.from(
      new Set(selectedTabs.map(t => TAB_TO_MODULE[t]).filter(Boolean))
    );
    const formattedAccess = uniqueModules.map(mod => ({
      module: mod,
      access: ['READ', 'WRITE', 'DELETE']
    }));

    const payload = {
      name,
      phone,
      roleTitle,
      allowedTabs: selectedTabs,
      moduleAccess: formattedAccess,
      ...(isEditing ? { isActive } : { email, password }),
      ...(isEditing && password?.trim() ? { password: password.trim() } : {})
    };

    setSubmitting(true);
    try {
      let response;
      if (isEditing) {
        response = await updateSubAdmin(editingAdminId, payload);
      } else {
        response = await addSubAdmin(payload);
      }

      if (response.success) {
        Swal.fire({
          title: isEditing ? 'Admin Updated!' : 'Admin Created!',
          text: response.message || (isEditing ? 'Sub-admin details updated successfully.' : 'Sub-admin created successfully.'),
          icon: 'success',
          confirmButtonColor: '#E11D48'
        });
        
        setIsModalOpen(false);
        fetchSubAdmins();
      } else {
        Swal.fire({
          title: 'Operation Failed',
          text: response.message || 'Failed to submit sub-admin details.',
          icon: 'error',
          confirmButtonColor: '#E11D48'
        });
      }
    } catch (err) {
      console.error('Error submitting sub-admin:', err);
      Swal.fire({
        title: 'Error',
        text: 'Something went wrong.',
        icon: 'error',
        confirmButtonColor: '#E11D48'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to permanently delete this sub-admin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E11D48',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, delete!'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteSubAdmin(id);
        if (response.success) {
          Swal.fire({
            title: 'Deleted!',
            text: response.message || 'Sub-admin deleted successfully.',
            icon: 'success',
            confirmButtonColor: '#E11D48'
          });
          fetchSubAdmins();
        } else {
          Swal.fire({
            title: 'Failed',
            text: response.message || 'Failed to delete sub-admin.',
            icon: 'error',
            confirmButtonColor: '#E11D48'
          });
        }
      } catch (err) {
        console.error('Delete sub-admin error:', err);
        Swal.fire({
          title: 'Error',
          text: 'Something went wrong.',
          icon: 'error',
          confirmButtonColor: '#E11D48'
        });
      }
    }
  };

  const filteredSubAdmins = subAdmins.filter(admin => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const adminName = (admin.userId?.name || admin.name || '').toLowerCase();
    const adminEmail = (admin.userId?.email || admin.email || '').toLowerCase();
    const adminPhone = (admin.userId?.phone || admin.phone || '').toLowerCase();
    const adminRole = (admin.roleTitle || '').toLowerCase();
    return adminName.includes(q) || adminEmail.includes(q) || adminPhone.includes(q) || adminRole.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase flex items-center gap-2 tracking-tight">
            <ShieldCheck className="text-primary" size={24} /> Manage Sub-Admins
          </h1>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            Create sub-admins and assign granular sidebar permissions with check inputs.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/25 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={15} /> Add Sub-Admin
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="p-4 rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search sub-admins by name, email, phone or role title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 text-xs font-semibold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Sub-admins table */}
      <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Loading sub-admins...</p>
          </div>
        ) : filteredSubAdmins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-4 text-zinc-400">
              <ShieldCheck size={30} />
            </div>
            <p className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase mb-1">No Sub-admins found</p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-6">Create sub-admins to delegate management tasks.</p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary-hover shadow-md transition-all cursor-pointer"
            >
              Add First Sub-Admin
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Name & Email</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Role Title</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Granted Sidebar Fields</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-right text-zinc-700 dark:text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {filteredSubAdmins.map((admin) => {
                  const allowedList = Array.isArray(admin.allowedTabs) && admin.allowedTabs.length > 0
                    ? admin.allowedTabs
                    : (admin.moduleAccess || []).map(m => m.module);

                  return (
                    <tr key={admin._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{admin.userId?.name || admin.name || 'N/A'}</span>
                          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5">{admin.userId?.email || admin.email || 'N/A'}</span>
                          {admin.userId?.phone && (
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono font-medium mt-0.5">{admin.userId.phone}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20">
                          {admin.roleTitle}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          admin.isActive
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${admin.isActive ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        {allowedList.length === 0 ? (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic">No fields assigned</span>
                        ) : admin.allowedTabs && admin.allowedTabs.length >= ALL_FIELDS.length ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            <Check size={13} className="stroke-[3]" /> All Sidebar Fields ({allowedList.length})
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 justify-start text-left items-center">
                            {allowedList.slice(0, 4).map((tabId, idx) => {
                              const matchField = ALL_FIELDS.find(f => f.id === tabId);
                              const label = matchField ? matchField.label : tabId;
                              return (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700"
                                >
                                  {label}
                                </span>
                              );
                            })}
                            {allowedList.length > 4 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black bg-primary/10 text-primary border border-primary/20">
                                +{allowedList.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(admin)}
                            className="p-2 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400 rounded-xl transition-all cursor-pointer"
                            title="Edit Sub-Admin"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(admin._id)}
                            className="p-2 text-red-600 hover:bg-red-500/10 dark:text-red-400 rounded-xl transition-all cursor-pointer"
                            title="Delete Sub-Admin"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Sub Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1100] overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setIsModalOpen(false)} />

          <div className="rounded-2xl shadow-2xl border max-w-3xl w-full z-10 overflow-hidden text-left relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
            {/* Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase flex items-center gap-2.5 text-zinc-900 dark:text-zinc-50 tracking-tight">
                  <ShieldCheck size={20} className="text-primary" /> {isEditing ? 'Edit Sub-Admin Details' : 'Create Sub-Admin Account'}
                </h2>
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                  Set credentials and mark checkboxes to grant specific sidebar access.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl p-2 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block">
                      Sub-Admin Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="E.g., Vineet"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="email"
                        required
                        disabled={isEditing}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="E.g., vineet@gmail.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                          isEditing
                            ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-zinc-500 cursor-not-allowed'
                            : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="E.g., +91 9876543210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block">
                      Role Title <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="text"
                        required
                        value={roleTitle}
                        onChange={e => setRoleTitle(e.target.value)}
                        placeholder="E.g., Vendor Manager"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block">
                      {isEditing ? 'New Password (Leave blank to keep unchanged)' : 'Security Password'} {!isEditing && <span className="text-rose-500">*</span>}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="password"
                        required={!isEditing}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={isEditing ? 'Enter new password only if changing' : '••••••••'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="space-y-1 md:col-span-2 flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      <div>
                        <span className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-100 block">Account Status</span>
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Enable or disable sub-admin login access</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Sidebar Access Permissions (Checkbox Input in front of each field) ── */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <div>
                      <label className="text-sm font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-wider flex items-center gap-2">
                        <CheckSquare size={18} className="text-primary" /> Sidebar Permissions
                        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                          {selectedTabs.length} of {ALL_FIELDS.length} selected
                        </span>
                      </label>
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                        Select the sidebar pages and tabs this sub-admin can view & operate.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllTabs}
                        className="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-primary text-white hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllTabs}
                        className="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Quick search input within permissions */}
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={tabFilter}
                      onChange={e => setTabFilter(e.target.value)}
                      placeholder="Quick search field (e.g. vendors, orders, payouts, users)..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Sections and Checkbox inputs */}
                  <div className="space-y-4 max-h-[42vh] overflow-y-auto pr-1 scrollbar-thin">
                    {SIDEBAR_SECTIONS.map(section => {
                      const filteredFields = section.fields.filter(f => {
                        if (!tabFilter.trim()) return true;
                        const q = tabFilter.toLowerCase().trim();
                        return f.label.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q) || f.id.toLowerCase().includes(q);
                      });

                      if (filteredFields.length === 0) return null;

                      const sectionAllSelected = section.fields.every(f => selectedTabs.includes(f.id));

                      return (
                        <div key={section.title} className="space-y-2">
                          {/* Section Header */}
                          <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-100 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-750">
                            <span className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              {section.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSection(section)}
                              className="text-xs font-extrabold text-primary hover:text-primary-hover hover:underline cursor-pointer"
                            >
                              {sectionAllSelected ? 'Deselect Section' : 'Select Section'}
                            </button>
                          </div>

                          {/* Fields Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {filteredFields.map(field => {
                              const isChecked = selectedTabs.includes(field.id);
                              const FieldIcon = field.icon;
                              return (
                                <label
                                  key={field.id}
                                  htmlFor={`tab-input-${field.id}`}
                                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                    isChecked
                                      ? 'bg-pink-50/90 dark:bg-primary/20 border-primary shadow-xs ring-1 ring-primary/40'
                                      : 'bg-white dark:bg-zinc-900 border-zinc-250 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-850 shadow-2xs'
                                  }`}
                                >
                                  {/* Check input in front */}
                                  <input
                                    type="checkbox"
                                    id={`tab-input-${field.id}`}
                                    checked={isChecked}
                                    onChange={() => handleToggleTab(field.id)}
                                    className="mt-0.5 w-4.5 h-4.5 rounded border-2 border-zinc-400 dark:border-zinc-600 text-primary accent-primary focus:ring-primary cursor-pointer flex-shrink-0"
                                  />

                                  {/* Icon, Title and Description */}
                                  <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center gap-1.5">
                                      <FieldIcon
                                        size={15}
                                        className={isChecked ? 'text-primary dark:text-pink-400 flex-shrink-0' : 'text-zinc-700 dark:text-zinc-300 flex-shrink-0'}
                                      />
                                      <span className={`text-xs font-extrabold truncate ${
                                        isChecked ? 'text-primary dark:text-pink-400' : 'text-zinc-900 dark:text-zinc-100'
                                      }`}>
                                        {field.label}
                                      </span>
                                    </div>
                                    <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                                      {field.desc}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-black uppercase rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin animate-infinite" size={14} />
                  ) : (
                    isEditing ? 'Update Sub-Admin' : 'Add Sub-Admin'
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

export default SubAdminsManager;
