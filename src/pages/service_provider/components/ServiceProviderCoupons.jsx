import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus, Tag, Trash2, ToggleLeft, ToggleRight, Edit2, X,
  CheckCircle2, AlertCircle, Loader2, Sparkles, ChevronDown,
  Search, SlidersHorizontal, Scissors, Calendar, Clock, IndianRupee,
  Layers, RefreshCw, Eye, ShieldCheck, Zap
} from 'lucide-react';
import {
  spGetMyCoupons, spGetMyServicesForCoupon,
  spCreateCoupon, spUpdateCoupon, spDeleteCoupon, spToggleCoupon,
  getServicesList,
} from '../../../api/serviceProviderService';
import { useTheme } from '../../../context/ThemeContext';
import { toast } from '../../../utils/toast';
import Swal from 'sweetalert2';
import DataTable from '../../../components/shared/DataTable';
import { getImageUrl } from '../../../utils/imageUrl';

const EMPTY_FORM = {
  code: '',
  type: 'percentage',
  value: '',
  linkedServiceId: '',
  minimumOrderAmount: '',
  maximumDiscount: '',
  usageLimitPerUser: '1',
  totalUsageLimit: '0',
  startsAt: '',
  expiresAt: '',
  isActive: true,
  description: '',
};

const ServiceProviderCoupons = ({
  isDarkMode: propDarkMode,
  services: initialServices = [],
  servicesLoading: initialServicesLoading = false,
  profileData: propProfileData,
}) => {
  const { isDarkMode: contextDarkMode } = useTheme();
  const isDarkMode = propDarkMode !== undefined ? propDarkMode : contextDarkMode;

  const [coupons, setCoupons] = useState([]);
  const [services, setServices] = useState(initialServices || []);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(initialServicesLoading);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingCoupon, setViewingCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Sync if initialServices updates from parent panel
  useEffect(() => {
    if (Array.isArray(initialServices) && initialServices.length > 0) {
      setServices(initialServices);
    }
  }, [initialServices]);

  // Load coupons and provider services
  const loadData = async () => {
    setLoading(true);
    setServicesLoading(true);
    try {
      const [couponsRes, servicesRes] = await Promise.allSettled([
        spGetMyCoupons(),
        spGetMyServicesForCoupon(),
      ]);

      if (couponsRes.status === 'fulfilled' && couponsRes.value?.success) {
        setCoupons(couponsRes.value.data || []);
      } else {
        setCoupons([]);
      }

      let fetchedServices = [];
      if (
        servicesRes.status === 'fulfilled' &&
        servicesRes.value?.success &&
        Array.isArray(servicesRes.value.data) &&
        servicesRes.value.data.length > 0
      ) {
        fetchedServices = servicesRes.value.data;
      }

      // If /coupons/sp/my-services is empty, fallback to catalog service list
      if (fetchedServices.length === 0) {
        try {
          const listRes = await getServicesList();
          let rawList = [];
          if (Array.isArray(listRes?.data)) {
            rawList = listRes.data;
          } else if (Array.isArray(listRes?.data?.data)) {
            rawList = listRes.data.data;
          } else if (Array.isArray(listRes)) {
            rawList = listRes;
          }

          const activeProfile =
            propProfileData?._id ||
            JSON.parse(localStorage.getItem('sp_profile') || '{}')?._id;

          if (activeProfile && rawList.length > 0) {
            const filtered = rawList.filter((s) => {
              const provId = s.providerId?._id || s.providerId;
              return provId === activeProfile;
            });
            if (filtered.length > 0) {
              fetchedServices = filtered;
            } else {
              fetchedServices = rawList;
            }
          } else if (rawList.length > 0) {
            fetchedServices = rawList;
          }
        } catch (fallbackErr) {
          console.error('Fallback services error:', fallbackErr);
        }
      }

      if (fetchedServices.length > 0) {
        setServices(fetchedServices);
      } else if (Array.isArray(initialServices) && initialServices.length > 0) {
        setServices(initialServices);
      }
    } catch (err) {
      console.error('Error fetching coupon data:', err);
      toast.error('Failed to load coupons.');
    } finally {
      setLoading(false);
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form helpers
  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    const sId = typeof coupon.linkedServiceId === 'object'
      ? coupon.linkedServiceId?._id
      : coupon.linkedServiceId;

    const normalizedType =
      (coupon.type || '').toLowerCase() === 'fixed' || (coupon.type || '').toLowerCase() === 'flat'
        ? 'fixed'
        : 'percentage';

    setForm({
      code: coupon.code || '',
      type: normalizedType,
      value: String(coupon.value ?? ''),
      linkedServiceId: sId || '',
      minimumOrderAmount: coupon.minimumOrderAmount ? String(coupon.minimumOrderAmount) : '',
      maximumDiscount: coupon.maximumDiscount ? String(coupon.maximumDiscount) : '',
      usageLimitPerUser: String(coupon.usageLimitPerUser ?? 1),
      totalUsageLimit: String(coupon.totalUsageLimit ?? 0),
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 10) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      isActive: coupon.isActive ?? true,
      description: coupon.description || '',
    });
    setEditingId(coupon._id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const setFormField = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  // Quick code generator
  const handleGenerateCode = () => {
    const selectedService = services.find(s => s._id === form.linkedServiceId);
    const prefix = selectedService
      ? selectedService.title.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()
      : 'SAVE';
    const discountVal = form.value ? Math.round(Number(form.value)) : '20';
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setFormField('code', `${prefix}${discountVal || randomSuffix}`);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error('Coupon code is required.');
      return;
    }
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) {
      toast.error('Please enter a valid discount value.');
      return;
    }
    if (!form.linkedServiceId) {
      toast.error('Please select a service for this coupon.');
      return;
    }

    setSubmitting(true);
    const normalizedType =
      (form.type || '').toLowerCase() === 'fixed' || (form.type || '').toLowerCase() === 'flat'
        ? 'fixed'
        : 'percentage';

    const payload = {
      code: form.code.trim().toUpperCase(),
      type: normalizedType,
      value: Number(form.value),
      linkedServiceId: form.linkedServiceId,
      ...(form.minimumOrderAmount ? { minimumOrderAmount: Number(form.minimumOrderAmount) } : {}),
      ...(form.maximumDiscount && normalizedType === 'percentage'
        ? { maximumDiscount: Number(form.maximumDiscount) }
        : {}),
      usageLimitPerUser: Number(form.usageLimitPerUser) || 1,
      totalUsageLimit: Number(form.totalUsageLimit) || 0,
      ...(form.startsAt ? { startsAt: new Date(form.startsAt).toISOString() } : {}),
      ...(form.expiresAt ? (() => {
        const [y, m, d] = form.expiresAt.split('-').map(Number);
        const exp = new Date(y, m - 1, d, 23, 59, 59, 999);
        return { expiresAt: exp.toISOString() };
      })() : {}),
      isActive: form.isActive,
      description: form.description.trim(),
    };

    try {
      const res = editingId
        ? await spUpdateCoupon(editingId, payload)
        : await spCreateCoupon(payload);

      if (res?.success) {
        Swal.fire({
          title: 'Success!',
          text: editingId ? 'Coupon updated successfully!' : 'Service coupon created successfully!',
          icon: 'success',
          confirmButtonColor: '#EC4899',
          background: isDarkMode ? '#18181B' : '#FFFFFF',
          color: isDarkMode ? '#FFFFFF' : '#18181B',
          customClass: { popup: 'rounded-2xl font-outfit' }
        });
        handleCloseModal();
        loadData();
      } else {
        toast.error(res?.message || 'Operation failed.');
      }
    } catch (err) {
      toast.error(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggle = async (couponId, currentStatus) => {
    setToggling(prev => ({ ...prev, [couponId]: true }));
    try {
      const res = await spToggleCoupon(couponId);
      if (res?.success) {
        setCoupons(prev => prev.map(c => c._id === couponId ? { ...c, isActive: res.data?.isActive } : c));
        toast.success(`Coupon ${res.data?.isActive ? 'activated' : 'deactivated'}`);
      } else {
        toast.error(res?.message || 'Toggle failed.');
      }
    } catch (err) {
      toast.error('Failed to change coupon status.');
    } finally {
      setToggling(prev => ({ ...prev, [couponId]: false }));
    }
  };

  // Delete coupon
  const handleDelete = async (couponId, code) => {
    const result = await Swal.fire({
      title: `Delete Coupon "${code}"?`,
      text: 'This will permanently remove this coupon from your salon offerings.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EC4899',
      cancelButtonColor: '#71717A',
      confirmButtonText: 'Yes, delete it',
      background: isDarkMode ? '#18181B' : '#FFFFFF',
      color: isDarkMode ? '#FFFFFF' : '#18181B',
      customClass: { popup: 'rounded-2xl font-outfit text-sm' }
    });

    if (!result.isConfirmed) return;

    try {
      const res = await spDeleteCoupon(couponId);
      if (res?.success) {
        setCoupons(prev => prev.filter(c => c._id !== couponId));
        toast.success('Coupon removed successfully.');
      } else {
        toast.error(res?.message || 'Delete failed.');
      }
    } catch (err) {
      toast.error('Failed to delete coupon.');
    }
  };

  // Helper for extracting clean image URL from service
  const getServiceImageUrl = (service) => {
    if (!service) return '';
    const first = service?.images?.[0];
    if (!first) return '';
    if (typeof first === 'object' && first?.url) {
      return getImageUrl(first.url);
    }
    if (typeof first === 'string') {
      if (first.startsWith('http://') || first.startsWith('https://') || first.includes('uploads/')) {
        return getImageUrl(first);
      }
    }
    return '';
  };

  // Safe expiry check (until end of the expiry day 23:59:59.999)
  const isCouponExpired = (expiresAt) => {
    if (!expiresAt) return false;
    const exp = new Date(expiresAt);
    if (isNaN(exp.getTime())) return false;
    const endOfDay = new Date(exp);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.getTime() < Date.now();
  };

  // Helper for finding service
  const getLinkedService = (coupon) => {
    if (typeof coupon?.linkedServiceId === 'object' && coupon.linkedServiceId !== null) {
      return coupon.linkedServiceId;
    }
    return services.find(s => s._id === coupon?.linkedServiceId) || null;
  };

  // Calculations for live discount preview in form
  const selectedServiceForForm = useMemo(() => {
    return services.find(s => s._id === form.linkedServiceId) || null;
  }, [services, form.linkedServiceId]);

  const discountPreview = useMemo(() => {
    if (!selectedServiceForForm) return null;
    const basePrice = Number(selectedServiceForForm.offeredPrice || selectedServiceForForm.sellingPrice || 0);
    const val = Number(form.value) || 0;
    let discountAmount = 0;
    const isPercent = (form.type || '').toLowerCase() === 'percentage';

    if (isPercent) {
      discountAmount = (basePrice * val) / 100;
      if (form.maximumDiscount && Number(form.maximumDiscount) > 0) {
        discountAmount = Math.min(discountAmount, Number(form.maximumDiscount));
      }
    } else {
      discountAmount = val;
    }

    discountAmount = Math.min(discountAmount, basePrice);
    const finalPrice = Math.max(0, basePrice - discountAmount);

    return {
      basePrice,
      discountAmount,
      finalPrice,
      isCapped: isPercent && form.maximumDiscount && ((basePrice * val) / 100) > Number(form.maximumDiscount)
    };
  }, [selectedServiceForForm, form.type, form.value, form.maximumDiscount]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      const service = getLinkedService(coupon);
      const matchSearch =
        coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const isExpired = isCouponExpired(coupon.expiresAt);

      if (!matchSearch) return false;
      if (statusFilter === 'ACTIVE') return coupon.isActive && !isExpired;
      if (statusFilter === 'INACTIVE') return !coupon.isActive;
      if (statusFilter === 'EXPIRED') return isExpired;
      return true;
    });
  }, [coupons, services, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.isActive && !isCouponExpired(c.expiresAt)).length;
    const servicesWithCoupons = new Set(
      coupons.map(c => typeof c.linkedServiceId === 'object' ? c.linkedServiceId?._id : c.linkedServiceId)
    ).size;
    const totalRedeemed = coupons.reduce((acc, c) => acc + (c.totalUsed || 0), 0);

    return { total, active, servicesWithCoupons, totalRedeemed };
  }, [coupons]);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No limit';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // DataTable Columns Definition
  const columns = [
    {
      header: 'Coupon Code',
      key: 'code',
      render: (row) => {
        const isExpired = isCouponExpired(row.expiresAt);
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              row.isActive && !isExpired
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-zinc-800/10 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
            }`}>
              <Tag size={18} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wider text-primary">
                  {row.code}
                </span>
                {(row.type || '').toLowerCase() === 'percentage' ? (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    %{row.value} OFF
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    ₹{row.value} OFF
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[180px]">
                {row.description || 'Exclusive service discount'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Linked Service',
      key: 'linkedService',
      render: (row) => {
        const service = getLinkedService(row);
        if (!service) {
          return <span className="text-xs text-zinc-400 italic">Service not linked</span>;
        }

        const srvImgUrl = getServiceImageUrl(service);
        const originalPrice = service.sellingPrice || 0;
        const offeredPrice = service.offeredPrice || service.sellingPrice || 0;

        return (
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200 shadow-sm'
            }`}>
              {srvImgUrl ? (
                <img
                  src={srvImgUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{ display: srvImgUrl ? 'none' : 'flex' }}
                className="w-full h-full items-center justify-center bg-primary/10 text-primary font-black text-xs uppercase"
              >
                {service.title?.substring(0, 2).toUpperCase() || 'SV'}
              </div>
            </div>
            <div className="flex flex-col max-w-[200px]">
              <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                {service.title}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {originalPrice > offeredPrice && (
                  <span className="text-[11px] text-zinc-400 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs font-extrabold text-zinc-600 dark:text-zinc-300">
                  ₹{offeredPrice.toLocaleString('en-IN')}
                </span>
                {service.durationMinutes && (
                  <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                    <Clock size={10} /> {service.durationMinutes}m
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Discount Breakdown',
      key: 'discount',
      render: (row) => {
        const service = getLinkedService(row);
        const basePrice = Number(service?.offeredPrice || service?.sellingPrice || 0);
        let discountAmt = 0;
        const isPercent = (row.type || '').toLowerCase() === 'percentage';
        if (isPercent) {
          discountAmt = (basePrice * Number(row.value)) / 100;
          if (row.maximumDiscount && Number(row.maximumDiscount) > 0) {
            discountAmt = Math.min(discountAmt, Number(row.maximumDiscount));
          }
        } else {
          discountAmt = Number(row.value);
        }
        discountAmt = Math.min(discountAmt, basePrice);
        const customerFinal = Math.max(0, basePrice - discountAmt);

        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-emerald-500 dark:text-emerald-400">
                -₹{discountAmt.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-zinc-400">
                ({isPercent ? `${row.value}% OFF` : `Flat ₹${row.value}`})
              </span>
            </div>
            {basePrice > 0 && (
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                Customer pays: <strong className="text-zinc-700 dark:text-zinc-200">₹{customerFinal.toLocaleString('en-IN')}</strong>
              </div>
            )}
            {row.maximumDiscount > 0 && row.type === 'PERCENTAGE' && (
              <span className="text-[10px] text-amber-500 font-medium">
                Capped at ₹{row.maximumDiscount}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Limits & Usage',
      key: 'limits',
      render: (row) => {
        const total = row.totalUsageLimit > 0 ? row.totalUsageLimit : '∞';
        const used = row.totalUsed || 0;
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {used} / {total} Redeemed
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              Max {row.usageLimitPerUser || 1} per customer
            </span>
            {row.minimumOrderAmount > 0 && (
              <span className="text-[10px] text-zinc-500 mt-0.5">
                Min. ₹{row.minimumOrderAmount}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Validity',
      key: 'validity',
      render: (row) => {
        const isExpired = isCouponExpired(row.expiresAt);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Till {formatDate(row.expiresAt)}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {isExpired ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Expired
                </span>
              ) : row.isActive ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                  Paused
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const isExpired = isCouponExpired(row.expiresAt);
        const isTogglingThis = toggling[row._id];
        const isLive = Boolean(row.isActive && !isExpired);

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleToggle(row._id, row.isActive)}
              disabled={isTogglingThis || isExpired}
              title={isExpired ? 'Coupon has expired' : row.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
              className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-transform hover:scale-105"
            >
              {isTogglingThis ? (
                <Loader2 size={24} className="animate-spin text-primary" />
              ) : isLive ? (
                <ToggleRight size={28} className="text-primary" />
              ) : (
                <ToggleLeft size={28} className="text-zinc-400" />
              )}
            </button>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              isLive ? 'text-primary' : 'text-zinc-400'
            }`}>
              {isLive ? 'Live' : 'Off'}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            title="View Details"
            onClick={() => {
              setViewingCoupon(row);
              setIsDetailsModalOpen(true);
            }}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            <Eye size={15} />
          </button>
          <button
            title="Edit Coupon"
            onClick={() => handleOpenEdit(row)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            <Edit2 size={15} />
          </button>
          <button
            title="Delete Coupon"
            onClick={() => handleDelete(row._id, row.code)}
            className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 text-left font-outfit">
      
      {/* ── Top Header & Action Banner ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Tag size={20} />
            </div>
            <h1 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Service Coupons
            </h1>
          </div>
          <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Create service-specific coupons with live discount rules for your treatment catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh Data"
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 shadow-sm'
            }`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-primary/25 cursor-pointer"
          >
            <Plus size={16} />
            Create Coupon
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Coupons</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Tag size={15} />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            {stats.total}
          </p>
          <span className="text-[10px] text-zinc-400 font-medium">All campaigns</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Active Live</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Zap size={15} />
            </div>
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-500">
            {stats.active}
          </p>
          <span className="text-[10px] text-zinc-400 font-medium">Available to customers</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Services Covered</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Scissors size={15} />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            {stats.servicesWithCoupons} <span className="text-xs font-bold text-zinc-400">/ {services.length}</span>
          </p>
          <span className="text-[10px] text-zinc-400 font-medium">Catalog services</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Redeemed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ShieldCheck size={15} />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            {stats.totalRedeemed}
          </p>
          <span className="text-[10px] text-zinc-400 font-medium">Bookings discounted</span>
        </div>
      </div>

      {/* ── Search & Filter Bar ────────────────────────────────────────── */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
        isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search code or service title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold outline-none border transition-all ${
              isDarkMode
                ? 'bg-zinc-800/80 border-zinc-700/80 text-white placeholder:text-zinc-500 focus:border-primary'
                : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-primary'
            }`}
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : isDarkMode
                  ? 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ── DataTable ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <DataTable
          columns={columns}
          data={filteredCoupons}
          loading={loading}
          onRowClick={(row) => {
            setViewingCoupon(row);
            setIsDetailsModalOpen(true);
          }}
        />
      </div>

      {/* ── CREATE / EDIT COUPON MODAL ──────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-8 transition-all ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${
              isDarkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Tag size={18} />
                </div>
                <div>
                  <h2 className={`text-base font-bold uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                    {editingId ? 'Edit Service Coupon' : 'Create Service Coupon'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Coupon is strictly bounded to the selected service and your salon.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* 1. SELECT SERVICE (via services API) */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                  1. Select Target Service <span className="text-rose-500">*</span>
                </label>

                {servicesLoading ? (
                  <div className="p-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs text-zinc-400">
                    <Loader2 size={16} className="animate-spin text-primary" /> Loading your services catalog...
                  </div>
                ) : (
                  <select
                    required
                    value={form.linkedServiceId}
                    onChange={(e) => setFormField('linkedServiceId', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-all ${
                      isDarkMode
                        ? 'bg-zinc-800 border-zinc-700 text-white focus:border-primary'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-primary'
                    }`}
                  >
                    <option value="">— Select a service from your catalog —</option>
                    {services.map((srv) => (
                      <option key={srv._id} value={srv._id}>
                        {srv.title} — ₹{srv.offeredPrice || srv.sellingPrice} ({srv.durationMinutes || 0}m)
                      </option>
                    ))}
                  </select>
                )}

                {services.length === 0 && !servicesLoading && (
                  <p className="text-xs text-amber-500 font-medium mt-1">
                    No active services found in your salon. Please add services first.
                  </p>
                )}

                {/* Selected Service Card Preview */}
                {selectedServiceForForm && (() => {
                  const formSrvImg = getServiceImageUrl(selectedServiceForForm);
                  return (
                    <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-primary/5 border-primary/15'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-black flex-shrink-0">
                          {formSrvImg ? (
                            <img
                              src={formSrvImg}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: formSrvImg ? 'none' : 'flex' }}
                            className="w-full h-full items-center justify-center font-black text-xs uppercase"
                          >
                            {selectedServiceForForm.title.substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                            {selectedServiceForForm.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-zinc-400">Regular: ₹{selectedServiceForForm.sellingPrice}</span>
                            <span className="text-xs font-bold text-emerald-500">
                              Salon Price: ₹{selectedServiceForForm.offeredPrice || selectedServiceForForm.sellingPrice}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary">
                        Selected
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* 2. COUPON CODE & TYPE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                      Coupon Code <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Generate Auto
                    </button>
                  </div>
                  <input
                    required
                    type="text"
                    value={form.code}
                    onChange={(e) => setFormField('code', e.target.value.toUpperCase())}
                    placeholder="e.g. HAIR20, GLOW500"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold tracking-wider uppercase outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-zinc-800 border-zinc-700 text-white focus:border-primary'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-primary'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Discount Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setFormField('type', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none cursor-pointer ${
                      isDarkMode
                        ? 'bg-zinc-800 border-zinc-700 text-white focus:border-primary'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-primary'
                    }`}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              {/* 3. DISCOUNT VALUE & MAX CAP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Discount Value ({(form.type || '').toLowerCase() === 'percentage' ? '%' : '₹'}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setFormField('value', e.target.value)}
                    placeholder={(form.type || '').toLowerCase() === 'percentage' ? '20 (for 20% off)' : '500 (for ₹500 off)'}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold outline-none ${
                      isDarkMode
                        ? 'bg-zinc-800 border-zinc-700 text-white focus:border-primary'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-primary'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Max Discount Cap (₹) {(form.type || '').toLowerCase() === 'percentage' ? '(Optional)' : '(N/A for flat)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={(form.type || '').toLowerCase() === 'fixed' || (form.type || '').toLowerCase() === 'flat'}
                    value={form.maximumDiscount}
                    onChange={(e) => setFormField('maximumDiscount', e.target.value)}
                    placeholder={(form.type || '').toLowerCase() === 'fixed' || (form.type || '').toLowerCase() === 'flat' ? 'Not applicable' : 'e.g. 300'}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none disabled:opacity-40 ${
                      isDarkMode
                        ? 'bg-zinc-800 border-zinc-700 text-white focus:border-primary'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-primary'
                    }`}
                  />
                </div>
              </div>

              {/* ── LIVE DISCOUNT & PRICING PREVIEW BOX ────────────────────── */}
              {discountPreview && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 border-zinc-700 shadow-xl'
                    : 'bg-gradient-to-br from-pink-50/80 to-purple-50/80 border-pink-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-700/40">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-wider text-primary">
                      Live Customer Pricing Preview
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Service Salon Price:</span>
                      <span className="font-bold text-zinc-300 dark:text-zinc-200">
                        ₹{discountPreview.basePrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-500 font-bold">
                      <span>
                        Coupon Discount ({(form.type || '').toLowerCase() === 'percentage' ? `${form.value}%` : `Flat ₹${form.value}`}):
                      </span>
                      <span>- ₹{discountPreview.discountAmount.toLocaleString('en-IN')}</span>
                    </div>

                    {discountPreview.isCapped && (
                      <div className="text-[10px] text-amber-500 text-right font-semibold">
                        (Discount capped at max limit ₹{form.maximumDiscount})
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-700/40 flex justify-between items-center">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-100 uppercase text-xs">
                        Customer Actually Pays:
                      </span>
                      <span className="text-base font-black text-primary">
                        ₹{discountPreview.finalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. USAGE LIMITS & MIN ORDER */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-500">
                    Min Booking (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minimumOrderAmount}
                    onChange={(e) => setFormField('minimumOrderAmount', e.target.value)}
                    placeholder="0"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-500">
                    Limit Per Customer
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.usageLimitPerUser}
                    onChange={(e) => setFormField('usageLimitPerUser', e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-500">
                    Total Campaign Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalUsageLimit}
                    onChange={(e) => setFormField('totalUsageLimit', e.target.value)}
                    placeholder="0 = unlimited"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                </div>
              </div>

              {/* 5. VALIDITY SCHEDULE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Valid From (Optional)
                  </label>
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setFormField('startsAt', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Valid Until (Expiry Date)
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setFormField('expiresAt', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                </div>
              </div>

              {/* 6. DESCRIPTION */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                  Description / Customer Terms
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setFormField('description', e.target.value)}
                  placeholder="e.g. Special weekend offer on deep clean facial and styling."
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none resize-none ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200'
                  }`}
                />
              </div>

              {/* 7. ACTIVE STATUS TOGGLE */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormField('isActive', !form.isActive)}
                  className="cursor-pointer"
                >
                  {form.isActive ? (
                    <ToggleRight size={30} className="text-primary" />
                  ) : (
                    <ToggleLeft size={30} className="text-zinc-400" />
                  )}
                </button>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${form.isActive ? 'text-primary' : 'text-zinc-400'}`}>
                    {form.isActive ? 'Coupon is Active (Live Immediately)' : 'Coupon is Inactive (Draft Mode)'}
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Customers can only apply active coupons during checkout.
                  </p>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isDarkMode
                      ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-primary/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Service Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW COUPON DETAILS MODAL ───────────────────────────────────── */}
      {isDetailsModalOpen && viewingCoupon && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 transition-all ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5">
                <Tag size={18} className="text-primary" />
                <h3 className={`text-base font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Coupon: {viewingCoupon.code}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Service info */}
              {(() => {
                const srv = getLinkedService(viewingCoupon);
                const srvImgUrl = getServiceImageUrl(srv);
                return (
                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                      Linked Salon Service
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                        {srvImgUrl ? (
                          <img
                            src={srvImgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          style={{ display: srvImgUrl ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center font-black text-xs uppercase"
                        >
                          {srv?.title?.slice(0, 2).toUpperCase() || 'SV'}
                        </div>
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                          {srv?.title || 'Unknown Service'}
                        </p>
                        <p className="text-zinc-400 mt-0.5">
                          Base Price: ₹{srv?.offeredPrice || srv?.sellingPrice || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Discount Type</span>
                  <span className="font-bold text-sm text-primary mt-0.5 block">
                    {viewingCoupon.type === 'PERCENTAGE' ? `${viewingCoupon.value}% OFF` : `₹${viewingCoupon.value} FLAT`}
                  </span>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Status</span>
                  <span className={`font-bold text-sm mt-0.5 block ${
                    isCouponExpired(viewingCoupon.expiresAt)
                      ? 'text-rose-500'
                      : viewingCoupon.isActive
                      ? 'text-emerald-500'
                      : 'text-zinc-400'
                  }`}>
                    {isCouponExpired(viewingCoupon.expiresAt)
                      ? 'Expired'
                      : viewingCoupon.isActive
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Min Service Price</span>
                  <span className="font-bold text-sm mt-0.5 block text-zinc-700 dark:text-zinc-200">
                    {viewingCoupon.minimumOrderAmount ? `₹${viewingCoupon.minimumOrderAmount}` : 'No minimum'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Max Discount Cap</span>
                  <span className="font-bold text-sm mt-0.5 block text-zinc-700 dark:text-zinc-200">
                    {viewingCoupon.maximumDiscount ? `₹${viewingCoupon.maximumDiscount}` : 'No cap'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Per User Limit</span>
                  <span className="font-bold text-sm mt-0.5 block text-zinc-700 dark:text-zinc-200">
                    {viewingCoupon.usageLimitPerUser || 1} time(s)
                  </span>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Times Redeemed</span>
                  <span className="font-bold text-sm mt-0.5 block text-zinc-700 dark:text-zinc-200">
                    {viewingCoupon.totalUsed || 0} times
                  </span>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Valid From</span>
                  <span className="font-bold text-xs mt-0.5 block text-zinc-700 dark:text-zinc-200">
                    {formatDate(viewingCoupon.startsAt)}
                  </span>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Valid Until</span>
                  <span className="font-bold text-xs mt-0.5 block text-zinc-700 dark:text-zinc-200">
                    {formatDate(viewingCoupon.expiresAt)}
                  </span>
                </div>
              </div>

              {viewingCoupon.description && (
                <div className={`p-3.5 rounded-xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Description</span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    {viewingCoupon.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenEdit(viewingCoupon);
                }}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                Edit This Coupon
              </button>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border cursor-pointer ${
                  isDarkMode ? 'border-zinc-700 text-zinc-400' : 'border-zinc-200 text-zinc-600'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceProviderCoupons;
