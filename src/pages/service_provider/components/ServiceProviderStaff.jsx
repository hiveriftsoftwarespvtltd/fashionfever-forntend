import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  ImageOff, 
  Loader2, 
  SlidersHorizontal,
  X,
  Upload,
  User,
  Phone,
  Mail,
  Award,
  Briefcase,
  Trash2,
  Eye,
  Calendar,
  Pencil
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from '../../../utils/toast';
import { addServiceStaff, getServiceStaffDetails, deleteServiceStaff, updateServiceStaff, getServiceStaff, getProviderServices } from '../../../api/serviceProviderService';
import { useUser } from '../../../context/UserContext';

const ServiceProviderStaff = ({ isDarkMode, profileData }) => {
  const { user } = useUser();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    experienceYears: '',
    gender: 'FEMALE'
  });
  
  const [skills, setSkills] = useState(['']); // Start with one empty skill input
  const [selectedServices, setSelectedServices] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // The backend uses user's _id (stored as providerId in staff collection) for retrieving and managing staff
  const providerId = profileData?.userId?._id || profileData?.userId || user?._id;

  // Default mock staff from JSON
  const defaultStaff = [
    {
      "_id": "6a216542a39f58b5f9fae961",
      "providerId": "6a2004fb222884d952cb2c4f",
      "name": "Priti",
      "phone": "1234567890",
      "email": "priti@gmail.com",
      "experienceYears": 6,
      "skills": [
        "Padicure",
        "Manicure",
        "Bridal Look"
      ],
      "isActive": true,
      "createdAt": "2026-06-04T11:45:06.826Z",
      "updatedAt": "2026-06-04T11:45:06.826Z",
      "__v": 0
    }
  ];

  // Load staff list dynamically from backend, fallback to localStorage if offline
  const fetchStaffList = useCallback(async () => {
    const activeProviderId = profileData?._id;
    if (!activeProviderId) return;

    setLoading(true);
    try {
      const res = await getServiceStaff(activeProviderId);
      const unpacked = res?.data?.data ?? res?.data ?? res;
      if (Array.isArray(unpacked)) {
        setStaffList(unpacked);
        localStorage.setItem(`sp_staff_list_${activeProviderId}`, JSON.stringify(unpacked));
      } else {
        const savedStaff = localStorage.getItem(`sp_staff_list_${activeProviderId}`);
        if (savedStaff) setStaffList(JSON.parse(savedStaff));
      }
    } catch (e) {
      console.error("Failed to fetch staff from backend:", e);
      const savedStaff = localStorage.getItem(`sp_staff_list_${activeProviderId}`);
      if (savedStaff) {
        setStaffList(JSON.parse(savedStaff));
      } else {
        setStaffList(defaultStaff);
      }
    } finally {
      setLoading(false);
    }
  }, [profileData?._id]);

  // Fetch all services for provider
  const fetchServices = useCallback(async () => {
    const activeProviderId = profileData?._id;
    if (!activeProviderId) return;

    try {
      const res = await getProviderServices(activeProviderId);
      const unpacked = res?.data?.data ?? res?.data ?? res;
      if (Array.isArray(unpacked)) {
        setServicesList(unpacked);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  }, [profileData?._id]);

  useEffect(() => {
    fetchStaffList();
    fetchServices();
  }, [fetchStaffList, fetchServices]);

  // Handle standard input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle skill input change
  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  // Add new skill input
  const addSkillInput = () => {
    setSkills([...skills, '']);
  };

  // Remove skill input
  const removeSkillInput = (index) => {
    if (skills.length > 1) {
      const newSkills = skills.filter((_, i) => i !== index);
      setSkills(newSkills);
    }
  };

  // Handle profile image upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Open modal and fetch details from API
  const handleViewDetailsClick = async (member) => {
    const staffId = member._id;
    const provId = member.providerId?._id || member.providerId || providerId;
    if (!staffId || !provId) return;

    setLoading(true);
    try {
      const res = await getServiceStaffDetails(provId, staffId);
      
      // Unpack double-nested JSON response for staff details
      const nestedData = res?.data?.data ?? res?.data ?? res;
      const freshStaff = (nestedData && typeof nestedData === 'object' && (nestedData._id || nestedData.name)) ? nestedData : member;
      
      setViewingStaff(freshStaff);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching staff details:', err);
      toast.error('Failed to load staff details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle staff deletion
  const handleDeleteStaffClick = async (staffId) => {
    if (!staffId) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EC4899',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      background: isDarkMode ? '#1F2937' : '#FFFFFF',
      color: isDarkMode ? '#FFFFFF' : '#1F2937'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const res = await deleteServiceStaff(staffId);
        if (res?.success || res?.statusCode === 404) {
          Swal.fire({
            title: 'Deleted!',
            text: res.message || 'Staff member has been deleted.',
            icon: 'success',
            confirmButtonColor: '#EC4899',
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#FFFFFF' : '#1F2937'
          });

          // Sync with backend
          await fetchStaffList();
        } else {
          toast.error(res?.message || 'Failed to delete staff member.');
        }
      } catch (err) {
        console.error('Error deleting staff:', err);
        toast.error('Something went wrong while deleting staff.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Open modal and pre-fill form for editing
  const handleEditStaffClick = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      experienceYears: member.experienceYears || '',
      gender: member.gender || 'FEMALE'
    });
    setSkills(member.skills && member.skills.length > 0 ? member.skills : ['']);
    setSelectedServices(member.services ? member.services.map(s => typeof s === 'object' ? s._id : s) : []);
    setFile(null);
    setImagePreview(member.image?.url || member.image || null);
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter staff name.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter staff phone number.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter staff email.');
      return;
    }
    if (!formData.experienceYears || formData.experienceYears < 0) {
      toast.error('Please enter valid experience years.');
      return;
    }

    const filteredSkills = skills.filter(s => s.trim() !== '');
    if (filteredSkills.length === 0) {
      toast.error('Please add at least one skill.');
      return;
    }

    setSubmitLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name.trim());
      dataToSend.append('phone', formData.phone.trim());
      dataToSend.append('email', formData.email.trim());
      dataToSend.append('experienceYears', Number(formData.experienceYears));
      dataToSend.append('gender', formData.gender);

      // Append skills using indexed keys skills[0], skills[1] etc
      filteredSkills.forEach((skill, index) => {
        dataToSend.append(`skills[${index}]`, skill.trim());
      });

      // Append services using indexed keys services[0], services[1] etc
      selectedServices.forEach((serviceId, index) => {
        dataToSend.append(`services[${index}]`, serviceId);
      });

      // Append profile file
      if (file) {
        dataToSend.append('file', file);
      }

      let res;
      if (editingStaff) {
        res = await updateServiceStaff(editingStaff._id, dataToSend);
      } else {
        res = await addServiceStaff(dataToSend);
      }

      if (res?.success) {
        Swal.fire({
          title: 'Success!',
          text: res.message || (editingStaff ? 'Staff member updated successfully.' : 'Staff member added successfully.'),
          icon: 'success',
          confirmButtonColor: '#EC4899',
          background: isDarkMode ? '#1F2937' : '#FFFFFF',
          color: isDarkMode ? '#FFFFFF' : '#1F2937'
        });

        // Pull fresh roster details from backend
        await fetchStaffList();

        // Reset state
        setFormData({ name: '', phone: '', email: '', experienceYears: '', gender: 'FEMALE' });
        setSkills(['']);
        setSelectedServices([]);
        setFile(null);
        setImagePreview(null);
        setEditingStaff(null);
        setIsModalOpen(false);
      } else {
        toast.error(res?.message || 'Failed to submit staff details.');
      }
    } catch (err) {
      console.error('Error submitting staff:', err);
      toast.error('Something went wrong while submitting staff details.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter staff list by search term
  const filteredStaff = staffList.filter(member => {
    const nameMatch = member.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = member.phone?.includes(searchTerm);
    const emailMatch = member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const skillMatch = member.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return nameMatch || phoneMatch || emailMatch || skillMatch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-lg lg:text-3xl font-bold uppercase transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Manage Staff
          </h2>
          <p className="text-sm font-semibold uppercase text-gray-400 mt-1">
            Oversee your salon team, experience levels, contacts, and specialized skill categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStaff(null);
            setFormData({ name: '', phone: '', email: '', experienceYears: '', gender: 'FEMALE' });
            setSkills(['']);
            setSelectedServices([]);
            setFile(null);
            setImagePreview(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-95 self-start sm:self-center"
        >
          <Plus size={15} />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="flex items-center gap-2 mb-4 text-left">
          <SlidersHorizontal size={16} className="text-primary" />
          <span className="text-xs font-black uppercase tracking-wider">Search Team Directory</span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search staff by name, phone, email, or skill badge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-bold outline-none border transition-all ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700 focus:border-primary/50 text-white' 
                : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 text-gray-800'
            }`}
          />
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Staff Table Card */}
      <div className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing staff directory...</span>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <User size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <p className={`text-sm font-black uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Staff Members Found</p>
            <p className="text-sm text-gray-400 font-bold uppercase mt-1">Register your team members to allocate salon bookings</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              Add Staff Member Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`border-b text-left text-sm font-black uppercase tracking-wider ${
                  isDarkMode ? 'bg-gray-900/30 border-white/5 text-gray-400' : 'bg-gray-50/50 border-gray-100 text-gray-500'
                }`}>
                  <th className="py-5 px-6">Staff Member</th>
                  <th className="py-5 px-6">Contact info</th>
                  <th className="py-5 px-6">Experience</th>
                  <th className="py-5 px-6">Skill Tags</th>
                  <th className="py-5 px-6 text-center">Status</th>
                  <th className="py-5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredStaff.map((item) => (
                  <tr 
                    key={item._id} 
                    className={`transition-colors text-left hover:bg-primary/5 dark:hover:bg-primary/10`}
                  >
                    {/* Name & Avatar Preview */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 ${
                          isDarkMode ? 'bg-gray-700 border-white/5' : 'bg-gray-100 border-gray-100 shadow-sm'
                        }`}>
                          {item.image?.url || item.image ? (
                            <img 
                              src={item.image?.url || item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span 
                            style={{ display: (item.image?.url || item.image) ? 'none' : 'flex' }}
                            className="text-primary font-black uppercase"
                          >
                            {item.name?.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                            {item.name}
                            <span className="px-1.5 py-0.5 bg-zinc-150 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded text-xs font-semibold">
                              {item.gender || 'FEMALE'}
                            </span>
                          </span>
                          <span className="text-xs text-zinc-400 font-medium">
                            Staff ID: {item._id?.substring(18)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          <Phone size={11} className="text-primary/70" />
                          {item.phone}
                        </span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <Mail size={11} />
                          {item.email}
                        </span>
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <Award size={12} className="text-amber-500" />
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          {item.experienceYears} Years
                        </span>
                      </div>
                    </td>

                    {/* Skills pills */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {item.skills && item.skills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 bg-primary/5 text-primary border border-primary/10 rounded-full text-xs font-bold uppercase tracking-wider"
                          >
                            {skill}
                          </span>
                        ))}
                        {item.services && item.services.map((srv, idx) => {
                          const serviceName = typeof srv === 'object' ? (srv.title || srv.name) : (servicesList.find(s => s._id === srv)?.title || servicesList.find(s => s._id === srv)?.name || 'Service');
                          return (
                            <span 
                              key={`srv-${idx}`} 
                              className="px-2 py-0.5 bg-green-500/5 text-green-500 border border-green-500/10 rounded-full text-xs font-bold uppercase tracking-wider"
                              title="Assigned Service"
                            >
                              {serviceName}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Status Toggle or Badge */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          item.isActive 
                            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                            : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        }`} />
                        <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>

                    {/* Actions column */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          title="View Details"
                          onClick={() => handleViewDetailsClick(item)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isDarkMode ? 'bg-white/5 text-gray-400 hover:text-primary' : 'bg-gray-50 text-gray-400 hover:text-primary'
                          }`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title="Edit Staff"
                          onClick={() => handleEditStaffClick(item)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isDarkMode ? 'bg-white/5 text-gray-400 hover:text-orange-500' : 'bg-gray-50 text-gray-400 hover:text-orange-500'
                          }`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete Staff"
                          onClick={() => handleDeleteStaffClick(item._id)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isDarkMode ? 'bg-white/5 text-gray-400 hover:text-red-400' : 'bg-gray-50 text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Trash2 size={14} />
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

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit">
          <div className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <User size={20} />
                  </div>
                  <div className="text-left">
                    <h2 className={`text-lg font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-850'}`}>
                      {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
                    </h2>
                    <p className="text-sm font-bold text-gray-400 uppercase mt-0.5">
                      {editingStaff ? 'Modify details for the selected stylist or consultant' : 'Register a stylist or beauty consultant under your provider profile'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStaff(null);
                  }} 
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-white' : 'hover:bg-gray-50 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Staff Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-wider text-gray-400">
                      Staff Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Priti Sharma"
                      required
                      className={`w-full px-4 py-3 rounded-xl text-xs font-bold outline-none border transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900 border-gray-700 focus:border-primary/50 text-white' 
                          : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 text-gray-800'
                      }`}
                    />
                  </div>

                  {/* Staff Phone */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-wider text-gray-400">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 1234567890"
                      required
                      className={`w-full px-4 py-3 rounded-xl text-xs font-bold outline-none border transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900 border-gray-700 focus:border-primary/50 text-white' 
                          : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 text-gray-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Staff Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-wider text-gray-400">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. priti@gmail.com"
                      required
                      className={`w-full px-4 py-3 rounded-xl text-xs font-bold outline-none border transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900 border-gray-700 focus:border-primary/50 text-white' 
                          : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 text-gray-800'
                      }`}
                    />
                  </div>

                  {/* Experience Years */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Award size={11} /> Experience (Years) *
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      placeholder="6"
                      required
                      min="0"
                      className={`w-full px-4 py-3 rounded-xl text-xs font-bold outline-none border transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        isDarkMode 
                          ? 'bg-gray-900 border-gray-700 focus:border-primary/50 text-white' 
                          : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 text-gray-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Single Image Upload */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Upload size={11} /> Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${
                        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor="avatar-upload-input"
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all ${
                            isDarkMode 
                              ? 'bg-gray-900 border-gray-700 text-gray-300' 
                              : 'bg-white border-gray-200 text-gray-700 shadow-sm'
                          }`}
                        >
                          <Upload size={14} className="text-primary" />
                          Choose Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="avatar-upload-input"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Skills / Specializations list */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-wider text-gray-400 flex items-center justify-between">
                      <span>Skills & Specializations *</span>
                      <button 
                        type="button" 
                        onClick={addSkillInput}
                        className="text-xs font-bold text-primary hover:underline uppercase"
                      >
                        + Add Skill
                      </button>
                    </label>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => handleSkillChange(index, e.target.value)}
                            placeholder={`Skill #${index + 1} (e.g. Pedicure)`}
                            required
                            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                              isDarkMode 
                                ? 'bg-gray-900 border-gray-700 focus:border-primary/50 text-white' 
                                : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 text-gray-800'
                            }`}
                          />
                          {skills.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSkillInput(index)}
                              className={`p-2.5 rounded-xl transition-all ${
                                isDarkMode ? 'bg-white/5 text-gray-400 hover:text-red-400' : 'bg-gray-50 text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gender Select */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-wider text-gray-400">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl text-xs font-bold outline-none border transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900 border-gray-700 focus:border-primary/50 text-white' 
                          : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 text-gray-800'
                      }`}
                    >
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Services Multiselect Checkboxes */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black uppercase tracking-wider text-gray-400">
                      Assign Services *
                    </label>
                    <div className={`p-3 rounded-xl border max-h-36 overflow-y-auto space-y-2 ${
                      isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'
                    }`}>
                      {servicesList.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400 uppercase">No services available</p>
                      ) : (
                        servicesList.map((srv) => (
                          <label key={srv._id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(srv._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedServices([...selectedServices, srv._id]);
                                } else {
                                  setSelectedServices(selectedServices.filter(id => id !== srv._id));
                                }
                              }}
                              className="accent-primary"
                            />
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                              {srv.title || srv.name}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitLoading}
                    className={`px-5 py-3 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'border-gray-700 text-gray-300 hover:bg-white/5' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{editingStaff ? 'Saving...' : 'Adding...'}</span>
                      </>
                    ) : (
                      <span>{editingStaff ? 'Save Changes' : 'Confirm Staff'}</span>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Read-Only Staff Details Modal */}
      {isDetailsModalOpen && viewingStaff && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit">
          <div className={`w-full max-w-md my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            {/* Header Info */}
            <div className="p-6 md:p-8 space-y-6 text-left">
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center font-bold border shadow-inner flex-shrink-0 ${
                    isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-150'
                  }`}>
                    {viewingStaff.image?.url || viewingStaff.image ? (
                      <img src={viewingStaff.image?.url || viewingStaff.image} alt={viewingStaff.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-850'}`}>
                      {viewingStaff.name}
                    </h3>
                    <p className="text-sm font-bold text-primary uppercase mt-0.5">Stylist & Consultant</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailsModalOpen(false)} 
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-white' : 'hover:bg-gray-50 text-gray-400'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status, Experience & Gender */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${viewingStaff.isActive ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className={`text-sm font-black uppercase ${viewingStaff.isActive ? 'text-green-500' : 'text-amber-500'}`}>
                      {viewingStaff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-1 flex items-center gap-1">
                    <Award size={10} className="text-amber-500" /> Exp
                  </p>
                  <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>
                    {viewingStaff.experienceYears} Years
                  </p>
                </div>
                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Gender</p>
                  <p className={`text-sm font-black uppercase ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>
                    {viewingStaff.gender || 'FEMALE'}
                  </p>
                </div>
              </div>

              {/* Contact details */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-zinc-900/30 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800 pb-1">
                  Contact Specifications
                </p>
                <div className="flex items-center gap-2.5 text-xs font-bold">
                  <Phone size={13} className="text-primary/75" />
                  <span>{viewingStaff.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold">
                  <Mail size={13} className="text-primary/75" />
                  <span>{viewingStaff.email || '—'}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <p className="text-sm font-black text-gray-400 uppercase">Specialized Skill Tags</p>
                <div className="flex flex-wrap gap-2">
                  {viewingStaff.skills && viewingStaff.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-black uppercase tracking-wider"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Services */}
              <div className="space-y-2">
                <p className="text-sm font-black text-gray-400 uppercase">Assigned Services</p>
                <div className="flex flex-wrap gap-2">
                  {viewingStaff.services && viewingStaff.services.length > 0 ? (
                    viewingStaff.services.map((srv, index) => {
                      const serviceName = typeof srv === 'object' ? (srv.title || srv.name) : (servicesList.find(s => s._id === srv)?.title || servicesList.find(s => s._id === srv)?.name || srv);
                      return (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-green-500/10 text-green-550 border border-green-500/20 rounded-full text-sm font-black uppercase tracking-wider"
                        >
                          {serviceName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-405 font-bold uppercase">No services assigned</span>
                  )}
                </div>
              </div>

              {/* Joined Date timestamp */}
              {viewingStaff.createdAt && (
                <div className={`p-3 rounded-2xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 justify-center border ${
                  isDarkMode ? 'bg-gray-900/10 border-white/5 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}>
                  <Calendar size={11} />
                  <span>Joined: {new Date(viewingStaff.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className={`w-full py-3.5 rounded-2xl font-bold uppercase text-xs transition-all border cursor-pointer ${
                    isDarkMode 
                      ? 'bg-white/5 text-white border-white/5 hover:bg-white/10' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
                  }`}
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceProviderStaff;
