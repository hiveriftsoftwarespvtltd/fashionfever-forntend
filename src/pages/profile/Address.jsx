import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Loader2, MapPin, Plus, Pencil,
  Trash2, X, Check, Home, Phone
} from 'lucide-react';
import { getAddresses, getAddressDetails, addAddress, editAddress, deleteAddress } from '../../api/authService';
import { lookupPincode } from '../../utils/pincodeLookup';
import { toast } from '../../utils/toast';
import UserSidebar from './UserSidebar';

/* ── Empty form state ──────────────────────────────────────── */
const EMPTY_FORM = {
  line1: '', line2: '', phone1: '', phone2: '',
  landmark: '', city: '', state: '', pincode: ''
};

/* ══════════════════════════════════════════════════════════ */
const Address = () => {
  const navigate = useNavigate();

  const [addresses, setAddresses]   = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);   // null = add mode
  const [form, setForm]             = useState(EMPTY_FORM);
  const [isSaving, setIsSaving]     = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeAutoDetected, setPincodeAutoDetected] = useState(false);

  /* ── Pincode auto-fill ──────────────────────────────────── */
  const handlePincodeChange = async (e) => {
    const rawVal = e.target.value;
    const cleanPin = rawVal.replace(/\D/g, '').slice(0, 6);
    
    setForm(f => ({ ...f, pincode: cleanPin }));
    setPincodeAutoDetected(false);

    if (cleanPin.length === 6) {
      setIsPincodeLoading(true);
      try {
        const res = await lookupPincode(cleanPin);
        if (res.success) {
          setForm(f => ({
            ...f,
            city: res.city || f.city,
            state: res.state || f.state
          }));
          setPincodeAutoDetected(true);
          toast.success(`📍 Auto-filled: ${res.city}, ${res.state}`);
        } else {
          toast.error(res.error || 'Pincode not found. Please enter city & state manually.');
        }
      } catch (err) {
        console.error('Pincode lookup error:', err);
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  /* ── fetch ─────────────────────────────────────────────── */
  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await getAddresses();
      if (res?.success) {
        const list = res.data?.data ?? res.data ?? [];
        setAddresses(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Fetch addresses error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  /* ── open form ─────────────────────────────────────────── */
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setPincodeAutoDetected(false);
    setIsPincodeLoading(false);
    setShowForm(true);
  };

  const openEdit = async (addr) => {
    setEditingId(addr._id);
    setShowForm(true);
    // Pre-fill from list data immediately so user sees something
    setForm({
      line1:    addr.line1    || '',
      line2:    addr.line2    || '',
      phone1:   addr.phone1   || '',
      phone2:   addr.phone2   || '',
      landmark: addr.landmark || '',
      city:     addr.city     || '',
      state:    addr.state    || '',
      pincode:  addr.pincode  || '',
    });
    // Fetch fresh details from server
    try {
      const res = await getAddressDetails(addr._id);
      if (res?.success) {
        const detail = res.data?.data ?? res.data;
        if (detail) {
          setForm({
            line1:    detail.line1    || '',
            line2:    detail.line2    || '',
            phone1:   detail.phone1   || '',
            phone2:   detail.phone2   || '',
            landmark: detail.landmark || '',
            city:     detail.city     || '',
            state:    detail.state    || '',
            pincode:  detail.pincode  || '',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch address details:', err);
      // Form already has list data as fallback, so no toast needed
    }
  };

  const closeForm = () => { 
    setShowForm(false); 
    setEditingId(null); 
    setForm(EMPTY_FORM); 
    setPincodeAutoDetected(false);
    setIsPincodeLoading(false);
  };

  /* ── save (add / edit) ─────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.line1.trim() || !form.city.trim() || !form.pincode.trim() || !form.phone1.trim()) {
      toast.error('Line 1, City, Pincode & Phone are required.');
      return;
    }
    setIsSaving(true);
    try {
      const res = editingId
        ? await editAddress(editingId, form)
        : await addAddress(form);

      if (res?.success) {
        toast.success(editingId ? 'Address updated!' : 'Address added!');
        closeForm();
        fetchAddresses();
      } else {
        toast.error(res?.message || 'Operation failed.');
      }
    } catch { toast.error('Something went wrong.'); }
    finally  { setIsSaving(false); }
  };

  /* ── delete ────────────────────────────────────────────── */
  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-gray-800">Delete this address?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const res = await deleteAddress(id);
              if (res?.success) { toast.success('Address deleted.'); fetchAddresses(); }
              else              toast.error(res?.message || 'Delete failed.');
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
          >Yes, Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  /* ══════════════════════════════════════════════════════ */
  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 font-outfit">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">My Addresses</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ──────────────────────────────────── */}
          <UserSidebar />

          {/* ── Right Content ─────────────────────────────── */}
          <div className="flex-grow">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] overflow-hidden">

              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h1 className="text-xl font-extrabold text-gray-900 uppercase  flex items-center gap-2">
                  <MapPin size={20} className="text-primary" /> My Addresses
                  <span className="text-primary text-base">({addresses.length})</span>
                </h1>
                {!showForm && (
                  <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase  px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer"
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                )}
              </div>

              {/* ── Add / Edit Form ────────────────────────── */}
              {showForm && (
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-extrabold text-gray-900 uppercase ">
                      {editingId ? 'Edit Address' : 'Add New Address'}
                    </h2>
                    <button onClick={closeForm} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer transition-all">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Line 1 */}
                    <div className="sm:col-span-2">
                      <label className="text-sm font-bold text-gray-400 uppercase  mb-1 block">Address Line 1 *</label>
                      <input
                        value={form.line1}
                        onChange={e => setForm(f => ({ ...f, line1: e.target.value }))}
                        placeholder="House / Flat / Block No."
                        className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-all bg-white"
                      />
                    </div>

                    {/* Line 2 */}
                    <div className="sm:col-span-2">
                      <label className="text-sm font-bold text-gray-400 uppercase  mb-1 block">Address Line 2</label>
                      <input
                        value={form.line2}
                        onChange={e => setForm(f => ({ ...f, line2: e.target.value }))}
                        placeholder="Street / Colony / Area"
                        className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-all bg-white"
                      />
                    </div>

                    {/* Landmark */}
                    <div className="sm:col-span-2">
                      <label className="text-sm font-bold text-gray-400 uppercase  mb-1 block">Landmark</label>
                      <input
                        value={form.landmark}
                        onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))}
                        placeholder="Near hospital / park etc."
                        className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-all bg-white"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-bold text-gray-400 uppercase block">City *</label>
                        {pincodeAutoDetected && form.city && (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check size={11} className="stroke-[3]" /> Auto-Filled
                          </span>
                        )}
                      </div>
                      <input
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        placeholder="City"
                        className={`w-full border rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-all bg-white ${
                          pincodeAutoDetected && form.city
                            ? 'border-emerald-300 bg-emerald-50/15'
                            : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                        }`}
                      />
                    </div>

                    {/* State */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-bold text-gray-400 uppercase block">State</label>
                        {pincodeAutoDetected && form.state && (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check size={11} className="stroke-[3]" /> Auto-Filled
                          </span>
                        )}
                      </div>
                      <input
                        value={form.state}
                        onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                        placeholder="State"
                        className={`w-full border rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-all bg-white ${
                          pincodeAutoDetected && form.state
                            ? 'border-emerald-300 bg-emerald-50/15'
                            : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                        }`}
                      />
                    </div>

                    {/* Pincode */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-bold text-gray-400 uppercase block">Pincode *</label>
                        {isPincodeLoading && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-primary animate-pulse">
                            <Loader2 size={11} className="animate-spin" /> Fetching location...
                          </span>
                        )}
                        {!isPincodeLoading && pincodeAutoDetected && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <Check size={12} className="stroke-[3]" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={form.pincode}
                          onChange={handlePincodeChange}
                          placeholder="6-Digit Pincode"
                          className={`w-full border rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-all bg-white ${
                            pincodeAutoDetected 
                              ? 'border-emerald-400 ring-2 ring-emerald-100' 
                              : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                          }`}
                        />
                        {isPincodeLoading && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone 1 */}
                    <div>
                      <label className="text-sm font-bold text-gray-400 uppercase  mb-1 block">Phone 1 *</label>
                      <input
                        value={form.phone1}
                        onChange={e => setForm(f => ({ ...f, phone1: e.target.value }))}
                        placeholder="Primary phone"
                        className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-all bg-white"
                      />
                    </div>

                    {/* Phone 2 */}
                    <div>
                      <label className="text-sm font-bold text-gray-400 uppercase  mb-1 block">Phone 2 (Optional)</label>
                      <input
                        value={form.phone2}
                        onChange={e => setForm(f => ({ ...f, phone2: e.target.value }))}
                        placeholder="Alternate phone"
                        className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-all bg-white"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="sm:col-span-2 flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase  py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {editingId ? 'Save Changes' : 'Add Address'}
                      </button>
                      <button
                        type="button"
                        onClick={closeForm}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── Address List ───────────────────────────── */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <p className="text-xs font-bold text-gray-400 uppercase ">Loading Addresses...</p>
                    </div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                      <MapPin size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-extrabold text-gray-400 uppercase  mb-1">No Addresses Yet</p>
                    <p className="text-xs text-gray-400 mb-6">Add a delivery address to get started</p>
                    <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-white text-xs font-bold uppercase px-5 py-3 rounded-xl cursor-pointer hover:bg-primary-hover transition-all shadow-md shadow-primary/20">
                      <Plus size={14} /> Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="group relative border border-gray-100 rounded-2xl p-5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all"
                      >
                        {/* Icon */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            <Home size={18} />
                          </div>

                          <div className="flex-grow min-w-0">
                            {/* Address lines */}
                            <p className="text-sm font-bold text-gray-900 leading-snug">{addr.line1}</p>
                            {addr.line2 && <p className="text-xs text-gray-500 font-medium mt-0.5">{addr.line2}</p>}
                            {addr.landmark && (
                              <p className="text-xs text-gray-400 mt-0.5">Near: {addr.landmark}</p>
                            )}
                            <p className="text-xs font-bold text-gray-700 uppercase mt-1.5">
                              {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                            </p>

                            {/* Phones */}
                            <div className="flex flex-wrap gap-3 mt-2.5">
                              {addr.phone1 && (
                                <span className="flex items-center gap-1 text-sm font-bold text-gray-500 uppercase">
                                  <Phone size={10} /> {addr.phone1}
                                </span>
                              )}
                              {addr.phone2 && (
                                <span className="flex items-center gap-1 text-sm font-bold text-gray-400 uppercase">
                                  <Phone size={10} /> {addr.phone2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                          <button
                            onClick={() => openEdit(addr)}
                            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold uppercase text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 py-2 rounded-lg transition-all cursor-pointer"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(addr._id)}
                            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold uppercase text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add another card */}
                    <button
                      onClick={openAdd}
                      className="border-2 border-dashed border-gray-200 hover:border-primary/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-primary transition-all cursor-pointer group min-h-[160px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-primary/5 border border-gray-100 group-hover:border-primary/20 flex items-center justify-center transition-all">
                        <Plus size={20} />
                      </div>
                      <span className="text-sm font-bold uppercase ">Add Another Address</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>{/* end right */}
        </div>
      </div>
    </div>
  );
};

export default Address;
