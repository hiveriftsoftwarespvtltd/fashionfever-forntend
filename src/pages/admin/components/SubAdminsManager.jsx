import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Trash2, Mail, Lock, User, Check, X, Loader2, KeyRound, CheckSquare, Pencil } from 'lucide-react';
import { addSubAdmin, getSubAdmins, deleteSubAdmin, updateSubAdmin, getSubAdminDetails } from '../../../api/adminService';
import Swal from 'sweetalert2';

const MODULES = [
  { id: 'USERS', name: 'Users Management' },
  { id: 'VENDORS', name: 'Vendors Management' },
  { id: 'COURSES', name: 'Courses & Academy' },
  { id: 'SERVICE_PROVIDERS', name: 'Service Providers' },
  { id: 'INFLUENCERS', name: 'Influencer Hub' },
  { id: 'HOME_CONTENT', name: 'Home Content' },
  { id: 'FINANCE', name: 'Finance & Payments' },
  { id: 'TICKETS', name: 'Support Tickets' },
  { id: 'DASHBOARD', name: 'Admin Dashboard' },
  { id: 'CLEANUP', name: 'System Cleanup' },
  { id: 'NOTIFICATION', name: 'Notifications Manager' }
];

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
  const [password, setPassword] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [moduleAccess, setModuleAccess] = useState(
    MODULES.reduce((acc, mod) => {
      acc[mod.id] = { READ: false, WRITE: false };
      return acc;
    }, {})
  );

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
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
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
        setPassword(''); // Optional on edit
        setRoleTitle(fullAdmin.roleTitle || '');

        // Set moduleAccess permissions
        const accessMap = MODULES.reduce((acc, mod) => {
          acc[mod.id] = { READ: false, WRITE: false };
          return acc;
        }, {});

        if (Array.isArray(fullAdmin.moduleAccess)) {
          fullAdmin.moduleAccess.forEach(item => {
            if (accessMap[item.module]) {
              accessMap[item.module].READ = item.access?.includes('READ') || false;
              accessMap[item.module].WRITE = item.access?.includes('WRITE') || false;
            }
          });
        }
        setModuleAccess(accessMap);
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
    setPassword('');
    setRoleTitle('');
    setModuleAccess(
      MODULES.reduce((acc, mod) => {
        acc[mod.id] = { READ: false, WRITE: false };
        return acc;
      }, {})
    );
    setIsModalOpen(true);
  };

  const handleAccessChange = (module, type) => {
    setModuleAccess(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [type]: !prev[module][type]
      }
    }));
  };

  const handleSelectAll = (type) => {
    setModuleAccess(prev => {
      const next = { ...prev };
      const allSelected = MODULES.every(mod => prev[mod.id][type]);
      MODULES.forEach(mod => {
        next[mod.id][type] = !allSelected;
      });
      return next;
    });
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

    // Format moduleAccess payload
    const formattedAccess = MODULES.map(mod => {
      const accessObj = moduleAccess[mod.id];
      const selectedAccess = [];
      if (accessObj.READ) selectedAccess.push('READ');
      if (accessObj.WRITE) selectedAccess.push('WRITE');
      return {
        module: mod.id,
        access: selectedAccess
      };
    }).filter(item => item.access.length > 0);

    let payload;
    if (isEditing) {
      // Email and Password are NOT sent in the PUT payload
      payload = {
        roleTitle,
        moduleAccess: formattedAccess
      };
    } else {
      payload = {
        name,
        email,
        password,
        roleTitle,
        moduleAccess: formattedAccess
      };
    }

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
        
        // Reset form & Close modal
        handleOpenAddModal();
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
    const q = searchQuery.toLowerCase();
    return (
      admin.name?.toLowerCase().includes(q) ||
      admin.email?.toLowerCase().includes(q) ||
      admin.roleTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase flex items-center gap-2">
            <ShieldCheck className="text-primary" size={22} /> Manage Sub-Admins
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-bold">
            Create sub-admins and assign granular module permissions.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary/95 shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <Plus size={14} /> Add Sub-Admin
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
            placeholder="Search sub-admins by name, email or role title..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
              isDarkMode 
                ? 'bg-gray-900 border-white/5 text-white placeholder:text-gray-500 focus:border-primary/50' 
                : 'bg-gray-50 border-gray-150 text-gray-800 placeholder:text-gray-400 focus:border-primary/50'
            }`}
          />
        </div>
      </div>

      {/* Sub-admins table */}
      <div className={`border rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-gray-955 border-white/5 shadow-sm' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-sm font-bold text-gray-500 uppercase">Loading sub-admins...</p>
          </div>
        ) : filteredSubAdmins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-center mb-4 text-gray-300">
              <ShieldCheck size={28} />
            </div>
            <p className="text-sm font-extrabold text-gray-400 uppercase mb-1">No Sub-admins found</p>
            <p className="text-xs text-gray-400 mb-6">Create sub-admins to delegate management tasks.</p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary/95 shadow-md transition-all cursor-pointer"
            >
              Add First Sub-Admin
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? 'bg-gray-900/50 border-b border-white/5' : 'bg-gray-50/75 border-b border-gray-100'}>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Name & Email</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Role Title</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Granted Modules</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800 bg-zinc-900' : 'divide-zinc-200 bg-white'}`}>
                {filteredSubAdmins.map((admin) => (
                  <tr key={admin._id} className={isDarkMode ? 'hover:bg-zinc-800/50 transition-colors' : 'hover:bg-zinc-50 transition-colors'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{admin.userId?.name || admin.name || 'N/A'}</span>
                        <span className="text-xs text-zinc-400 mt-0.5">{admin.userId?.email || admin.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        {admin.roleTitle}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex flex-wrap gap-1.5 justify-start text-left">
                        {admin.moduleAccess?.map((item, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                          >
                            {item.module} ({item.access?.join(', ')})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(admin)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer"
                          title="Edit Sub-Admin"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(admin._id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          title="Delete Sub-Admin"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Sub Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1100] overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsModalOpen(false)} />

          <div className={`rounded-2xl shadow-2xl border max-w-2xl w-full z-10 overflow-hidden text-left relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] ${
            isDarkMode ? 'bg-gray-950 border-white/5 text-white' : 'bg-white border-gray-150 text-gray-800'
          }`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-base font-extrabold uppercase flex items-center gap-2 text-gray-900 dark:text-white">
                <ShieldCheck size={18} className="text-primary" /> {isEditing ? 'Edit Sub-Admin Details' : 'Create Sub-Admin Account'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg p-1.5 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                
                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-black uppercase text-gray-400 block">Sub-Admin Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        required
                        disabled={isEditing}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="E.g., Vineet"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                          isEditing
                            ? isDarkMode
                              ? 'bg-gray-800 border-white/5 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : isDarkMode
                            ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                            : 'bg-gray-50 border-gray-150 text-gray-800 focus:border-primary/50'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-black uppercase text-gray-400 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="email"
                        required
                        disabled={isEditing}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="E.g., vineet@gmail.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                          isEditing
                            ? isDarkMode
                              ? 'bg-gray-800 border-white/5 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : isDarkMode
                            ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                            : 'bg-gray-50 border-gray-150 text-gray-800 focus:border-primary/50'
                        }`}
                      />
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="space-y-1">
                      <label className="text-sm font-black uppercase text-gray-400 block">Security Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                              : 'bg-gray-50 border-gray-150 text-gray-800 focus:border-primary/50'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-black uppercase text-gray-400 block">Role Title</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        required
                        value={roleTitle}
                        onChange={e => setRoleTitle(e.target.value)}
                        placeholder="E.g., Vendor Manager"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                            : 'bg-gray-50 border-gray-150 text-gray-800 focus:border-primary/50'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Module Permissions Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 dark:border-white/5">
                    <label className="text-sm font-black uppercase text-gray-400 tracking-wider">Module Permissions Matrix</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectAll('READ')}
                        className="text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                      >
                        All Read
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAll('WRITE')}
                        className="text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                      >
                        All Write
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 max-h-[30vh] overflow-y-auto pr-1">
                    {MODULES.map(mod => {
                      const isReadSelected = moduleAccess[mod.id].READ;
                      const isWriteSelected = moduleAccess[mod.id].WRITE;
                      return (
                        <div 
                          key={mod.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            isDarkMode 
                              ? 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900' 
                              : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 uppercase">{mod.name}</span>
                            <span className="text-xs font-bold text-zinc-400 uppercase mt-0.5">{mod.id}</span>
                          </div>

                          <div className="flex items-center gap-3 select-none">
                            <button
                              type="button"
                              onClick={() => handleAccessChange(mod.id, 'READ')}
                              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs ${
                                isReadSelected
                                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.05]'
                                  : isDarkMode
                                  ? 'bg-gray-900 border-white/5 text-gray-500 hover:text-gray-400'
                                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/75'
                              }`}
                            >
                              {isReadSelected ? (
                                <Check size={12} className="stroke-[3.5] animate-in zoom-in-50 duration-200" />
                              ) : (
                                <X size={12} className="opacity-35" />
                              )}
                              Read
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAccessChange(mod.id, 'WRITE')}
                              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs ${
                                isWriteSelected
                                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.05]'
                                  : isDarkMode
                                  ? 'bg-gray-900 border-white/5 text-gray-500 hover:text-gray-400'
                                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/75'
                              }`}
                            >
                              {isWriteSelected ? (
                                <Check size={12} className="stroke-[3.5] animate-in zoom-in-50 duration-200" />
                              ) : (
                                <X size={12} className="opacity-35" />
                              )}
                              Write
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-black uppercase rounded-xl text-white bg-primary hover:bg-primary/95 shadow-md transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin animate-infinite" size={12} />
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
