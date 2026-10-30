import React, { useState } from 'react';
import { Plus, Trash2, Scissors, Clock, User, Sparkles, X, Edit3 } from 'lucide-react';
import Swal from 'sweetalert2';

// ──► ISME PARAMETER MEIN isDarkMode PASS KIYA HAI JO PARENT SE AAYEGA
const AdminServiceManager = ({ isDarkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Static Dummy Data for UI preview (With explicit mode design tokens)
  const [services, setServices] = useState([
    {
      _id: '1',
      name: 'Bridal HD Makeup Package',
      category: 'Bridal',
      duration: '120 mins',
      expertName: 'Mehak Kapoor',
      price: 15000,
      salesPrice: 12000,
      description: 'Premium High-Definition makeup tailored for brides. Includes premium lash placement, hair styling, and outfit draping services.'
    },
    {
      _id: '2',
      name: 'Keratin Hair Smoothing Treatment',
      category: 'Haircare',
      duration: '180 mins',
      expertName: 'Rohan Vicky',
      price: 6000,
      salesPrice: 4500,
      description: 'Intense protein smoothing treatment to eliminate frizz, restore hair health, and provide mirror-like high contrast shine.'
    },
    {
      _id: '3',
      name: 'Vitamin C Glow Facial Therapy',
      category: 'Skincare',
      duration: '60 mins',
      expertName: 'Kriti Verma',
      price: 3500,
      salesPrice: 2499,
      description: 'Advanced skin brightening therapy utilizing pure Vitamin C concentrates and dynamic structural face massage for instant glow.'
    }
  ]);

  const [form, setForm] = useState({
    name: '', category: 'Makeup', duration: '', price: '', salesPrice: '', expertName: '', description: ''
  });

  const handleInputChange = (e, field) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleStaticSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      setServices(prev => prev.map(s => s._id === form._id ? { ...form } : s));
      Swal.fire({
        title: 'Updated!',
        text: 'Service details modified.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#1f2937'
      });
    } else {
      const newService = {
        ...form,
        _id: Date.now().toString()
      };
      setServices(prev => [newService, ...prev]);
      Swal.fire({
        title: 'Published!',
        text: 'New service added to catalog.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#1f2937'
      });
    }

    setShowModal(false);
    setForm({ name: '', category: 'Makeup', duration: '', price: '', salesPrice: '', expertName: '', description: '' });
  };

  const handleStaticDelete = (id) => {
    Swal.fire({
      title: 'Remove Service?',
      text: "This catalog record will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#ff2c61',
      cancelButtonColor: '#94a3b8',
      background: isDarkMode ? '#111827' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      customClass: {
        confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white',
        cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setServices(prev => prev.filter(s => s._id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Record removed.',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#1f2937'
        });
      }
    });
  };

  const openEditModal = (service) => {
    setIsEditing(true);
    setForm(service);
    setShowModal(true);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setForm({ name: '', category: 'Makeup', duration: '', price: '', salesPrice: '', expertName: '', description: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 text-left font-outfit animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-bold text-primary uppercase ">Salon & Artist Grid</span>
          <h2 className={`text-xl font-bold uppercase  ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Beauty Services</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 uppercase  shadow-lg shadow-primary/20 cursor-pointer hover:opacity-95 active:opacity-90 transition-all"
        >
          <Plus size={16} className="stroke-[3]" /> Add Service
        </button>
      </div>

      {/* Grid Container */}
      {services.length === 0 ? (
        <div className={`py-20 text-center rounded-3xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100'}`}>
          <Scissors size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-xs font-bold text-gray-400 uppercase ">No Professional Services Logged Yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
       {services.map((srv) => (
  <div 
    key={srv._id} 
    className={`rounded-2xl border p-6 shadow-sm hover:shadow-xl transition-all relative group text-left ${
      isDarkMode 
        ? 'bg-gray-900 border-white/10 text-white' 
        : 'bg-white border-gray-100 text-gray-800'
    }`}
  >
    
    {/* Actions Button Stack */}
    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button 
        onClick={() => openEditModal(srv)}
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          isDarkMode ? 'text-gray-400 hover:text-primary hover:bg-white/5' : 'text-gray-400 hover:text-primary hover:bg-primary/5'
        }`}
        title="Edit Service"
      >
        <Edit3 size={15} />
      </button>
      <button 
        onClick={() => handleStaticDelete(srv._id)}
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          isDarkMode ? 'text-gray-400 hover:text-red-500 hover:bg-red-950/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
        }`}
        title="Delete Service"
      >
        <Trash2 size={15} />
      </button>
    </div>

    {/* Category Tag */}
    <span className="bg-primary/10 text-primary text-[11px] font-bold uppercase  px-2 py-0.5 rounded-md inline-block">
      {srv.category || 'Makeup'}
    </span>
    
    {/* Service Title */}
    <h3 className={`text-sm font-bold uppercase mt-2 truncate max-w-[80%] ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`}>
      {srv.name}
    </h3>
    
    {/* Service Description */}
    <p className={`text-xs line-clamp-2 mt-1 min-h-[32px] font-medium leading-relaxed ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      {srv.description}
    </p>
    
    <div className={`h-[1px] my-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}></div>
    
    {/* Duration & Expert Details Row */}
    <div className={`grid grid-cols-2 gap-2 text-sm font-bold uppercase  ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="text-gray-400 flex-shrink-0" /> 
        <span>{srv.duration || '60 mins'}</span>
      </div>
      <div className="flex items-center gap-1.5 truncate">
        <User size={12} className="text-gray-400 flex-shrink-0" /> 
        <span>{srv.expertName || 'Top Expert'}</span>
      </div>
    </div>
    
    {/* Pricing Info Footer */}
    <div className={`mt-4 pt-3 border-t flex justify-between items-baseline ${
      isDarkMode ? 'border-white/5' : 'border-gray-50'
    }`}>
      <span className="text-xs font-bold text-gray-400 uppercase ">Booking Cost</span>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ₹{srv.salesPrice}
        </span>
        {srv.price > srv.salesPrice && (
          <span className={`text-sm line-through font-bold ${
            isDarkMode ? 'text-gray-600' : 'text-gray-300'
          }`}>
            ₹{srv.price}
          </span>
        )}
      </div>
    </div>

  </div>
))}
        </div>
      )}

      {/* --- ADD / EDIT STATIC MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <h2 className="text-base font-bold uppercase  flex items-center gap-2">
                <Sparkles size={16} className="text-primary" /> {isEditing ? 'Modify Service Settings' : 'Board New Beauty Service'}
              </h2>
              <button onClick={() => setShowModal(false)} className={`transition-all cursor-pointer ${isDarkMode ? 'text-gray-500 hover:text-red-500' : 'text-gray-400 hover:text-red-500'}`}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleStaticSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-left no-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ">Service Name</label>
                  <input type="text" required value={form.name} onChange={(e) => handleInputChange(e, 'name')} placeholder="e.g. Bridal Glow Facials" className={`w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-gray-900 border-white/5 text-white focus:border-primary' : 'bg-gray-50 border-gray-100 text-gray-700 focus:bg-white focus:border-primary'}`} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ">Category Tag</label>
                  <div className="relative">
                    <select value={form.category} onChange={(e) => handleInputChange(e, 'category')} className={`w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none appearance-none transition-all ${isDarkMode ? 'bg-gray-900 border-white/5 text-white focus:border-primary' : 'bg-gray-50 border-gray-100 text-gray-700 focus:bg-white focus:border-primary'}`}>
                      <option value="Makeup">Makeup</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Haircare">Haircare</option>
                      <option value="Bridal">Bridal Special</option>
                      <option value="Wellness">Wellness Spa</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ">Duration Block</label>
                  <input type="text" required value={form.duration} onChange={(e) => handleInputChange(e, 'duration')} placeholder="e.g. 90 mins" className={`w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-gray-900 border-white/5 text-white focus:border-primary' : 'bg-gray-50 border-gray-100 text-gray-700 focus:bg-white focus:border-primary'}`} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ">Assigned Expert Stylist</label>
                  <input type="text" required value={form.expertName} onChange={(e) => handleInputChange(e, 'expertName')} placeholder="e.g. Kriti Verma" className={`w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-gray-900 border-white/5 text-white focus:border-primary' : 'bg-gray-50 border-gray-100 text-gray-700 focus:bg-white focus:border-primary'}`} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ">Original Price (MRP ₹)</label>
                  <input type="number" required value={form.price} onChange={(e) => handleInputChange(e, 'price')} className={`w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-gray-900 border-white/5 text-white focus:border-primary' : 'bg-gray-50 border-gray-100 text-gray-700 focus:bg-white focus:border-primary'}`} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ">Offer Booking Price (₹)</label>
                  <input type="number" required value={form.salesPrice} onChange={(e) => handleInputChange(e, 'salesPrice')} className={`w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-gray-900 border-white/5 text-white focus:border-primary' : 'bg-gray-50 border-gray-100 text-gray-700 focus:bg-white focus:border-primary'}`} />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ">Service Overview Description</label>
                <textarea rows="3" required value={form.description} onChange={(e) => handleInputChange(e, 'description')} placeholder="Details of includes, skin products brand details..." className={`w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none transition-all resize-none ${isDarkMode ? 'bg-gray-900 border-white/5 text-white focus:border-primary' : 'bg-gray-50 border-gray-100 text-gray-700 focus:bg-white focus:border-primary'}`}></textarea>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm uppercase  cursor-pointer ${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold text-sm uppercase  shadow-md shadow-primary/15 flex items-center justify-center cursor-pointer hover:opacity-95 active:opacity-90 transition-all">
                  {isEditing ? "Save Changes" : "Publish Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceManager;
