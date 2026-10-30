import React, { useState, useEffect } from 'react';
import {
  Bike,
  Plus,
  Search,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Truck,
  Upload
} from 'lucide-react';
import {
  getVendorDeliveryPersons,
  registerDeliveryPerson,
  updateVendorDeliveryPerson,
  deleteVendorDeliveryPerson
} from '../../../api/quickECommerceService';
import { toast } from '../../../utils/toast';
import Swal from 'sweetalert2';
import { getImageUrl as defaultGetImageUrl, handleImageError } from '../../../utils/imageUrl';

const VendorRiders = ({ isDarkMode, getImageUrl }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    aadharNumber: '',
    vehicleType: 'motorcycle',
    vehicleNumber: '',
    profilePhoto: null
  });
  const [photoPreview, setPhotoPreview] = useState('');

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await getVendorDeliveryPersons(1, 50);
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.deliveryPersons)) list = res.data.deliveryPersons;
      else if (Array.isArray(res?.deliveryPersons)) list = res.deliveryPersons;
      
      setRiders(list);
    } catch (err) {
      console.error('Failed to fetch riders:', err);
      toast.error('Failed to load riders list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRider(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      aadharNumber: '',
      vehicleType: 'motorcycle',
      vehicleNumber: '',
      profilePhoto: null
    });
    setPhotoPreview('');
    setShowModal(true);
  };

  const handleOpenEditModal = (rider) => {
    setEditingRider(rider);
    setFormData({
      name: rider.name || '',
      phone: rider.phone || '',
      email: rider.email || '',
      password: '', // Optional on edit
      aadharNumber: rider.aadharNumber || '',
      vehicleType: rider.vehicleType || 'motorcycle',
      vehicleNumber: rider.vehicleNumber || '',
      profilePhoto: null
    });
    setPhotoPreview((getImageUrl || defaultGetImageUrl)(rider.profilePhoto) || '');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error('Name, phone and email are required');
      return;
    }
    if (!editingRider && !formData.password) {
      toast.error('Password is required for new rider registration');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading(editingRider ? 'Updating rider...' : 'Creating rider...');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('email', formData.email);
      if (formData.password) data.append('password', formData.password);
      data.append('aadharNumber', formData.aadharNumber || '000000000000');
      data.append('vehicleType', formData.vehicleType || 'motorcycle');
      if (formData.vehicleNumber) data.append('vehicleNumber', formData.vehicleNumber);
      if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);

      let res;
      if (editingRider) {
        res = await updateVendorDeliveryPerson(editingRider._id, data);
      } else {
        res = await registerDeliveryPerson(data);
      }

      toast.dismiss(loadingToast);

      if (res?.success || res?.message || res?._id) {
        toast.success(res.message || `Rider ${editingRider ? 'updated' : 'added'} successfully!`);
        setShowModal(false);
        fetchRiders();
      } else {
        toast.error(res?.message || 'Failed to save rider');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRider = (riderId) => {
    Swal.fire({
      title: 'Remove Rider?',
      text: 'Are you sure you want to remove this delivery rider?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const tid = toast.loading('Removing rider...');
        try {
          const res = await deleteVendorDeliveryPerson(riderId);
          toast.dismiss(tid);
          if (res?.success) {
            toast.success('Rider removed successfully');
            fetchRiders();
          } else {
            toast.error(res?.message || 'Failed to remove rider');
          }
        } catch (err) {
          toast.dismiss(tid);
          toast.error('Error removing rider');
        }
      }
    });
  };

  const filteredRiders = riders.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.vehicleNumber || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Bike className="text-primary" size={24} />
            Delivery Riders
          </h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your dedicated fleet of riders to deliver Standard & Quick Commerce orders.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20 cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Plus size={16} />
          Add New Rider
        </button>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
        isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search riders by name, phone, vehicle number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full bg-transparent text-xs font-bold outline-none ${
            isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
          }`}
        />
      </div>

      {/* Riders Table / List */}
      <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`${isDarkMode ? 'bg-gray-950/40 border-b border-white/5' : 'bg-gray-50 border-b border-gray-100'}`}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Rider Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-xs font-bold text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-primary" />
                    Loading riders...
                  </td>
                </tr>
              ) : filteredRiders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-xs font-bold text-gray-400">
                    No delivery riders found. Click "Add New Rider" to create one.
                  </td>
                </tr>
              ) : (
                filteredRiders.map((rider) => {
                  let statusBg = isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600';
                  if (rider.status === 'ON_DELIVERY') statusBg = isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600';
                  else if (rider.status === 'INACTIVE' || !rider.isActive) statusBg = isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600';

                  return (
                    <tr key={rider._id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden font-black text-sm uppercase ${
                            isDarkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                          }`}>
                            {rider.profilePhoto ? (
                              <img
                                src={(getImageUrl || defaultGetImageUrl)(rider.profilePhoto)}
                                alt={rider.name}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                              />
                            ) : (
                              rider.name ? rider.name.charAt(0) : 'R'
                            )}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rider.name}</p>
                            <span className="text-xs font-mono text-gray-400">ID: {rider._id?.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs space-y-0.5">
                          <span className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Phone size={12} className="text-gray-400" /> {rider.phone}
                          </span>
                          {rider.email && (
                            <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              <Mail size={12} className="text-gray-400" /> {rider.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs">
                          <span className={`font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                            {rider.vehicleType || 'Bike'}
                          </span>
                          <span className="text-xs font-mono text-gray-400 uppercase">
                            {rider.vehicleNumber || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${statusBg}`}>
                          {rider.status || 'AVAILABLE'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(rider)}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit Rider"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRider(rider._id)}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Remove Rider"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Rider Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 transition-all animate-in fade-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-gray-950 border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <Bike className="text-primary" size={20} />
                {editingRider ? 'Edit Delivery Rider' : 'Add New Delivery Rider'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-xl cursor-pointer ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-400">Rider Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-gray-900 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-400">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-gray-900 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-400">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rider@fashionfever.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-gray-900 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-400">{editingRider ? 'Password (Optional)' : 'App Password *'}</label>
                  <input
                    type="password"
                    required={!editingRider}
                    placeholder="App login password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-gray-900 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-gray-400">Aadhar / ID Number</label>
                  <input
                    type="text"
                    placeholder="12-digit Aadhar"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-gray-900 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-400">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-gray-900 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="motorcycle">Motorcycle / Bike / Scooter / EV</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="walking">On Foot / Walking</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-gray-400">Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-01-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-gray-900 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div>
                <label className="block mb-1 text-gray-400">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border" onError={handleImageError} />
                  )}
                  <label className={`flex-1 border-2 border-dashed rounded-2xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isDarkMode ? 'border-white/10 hover:border-primary/50 bg-gray-900' : 'border-gray-200 hover:border-primary/50 bg-gray-50'
                  }`}>
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-gray-400 text-xs">{formData.profilePhoto ? formData.profilePhoto.name : 'Upload Profile Photo'}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                    isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  {editingRider ? 'Save Changes' : 'Register Rider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorRiders;
