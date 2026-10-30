import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Pencil, Trash2, Loader2, Sparkles, CheckCircle2, XCircle, Search, RefreshCw, X, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import { getAllServiceCategories, createServiceCategory, updateServiceCategory, deleteServiceCategory } from '../../../api/adminService';
import config from '../../../config/config';
import { toast } from '../../../utils/toast';

export const initialDefaultCards = [
  {
    id: 'bs1',
    category: 'BRIDAL MAKEUP',
    name: 'HD Bridal Makeup & Hair Styling',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop',
    slug: 'bridal',
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'bs2',
    category: 'SALON AT HOME',
    name: 'Luxury HydraFacial & Skin Glow',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop',
    slug: 'athome',
    isActive: true,
    displayOrder: 2
  },
  {
    id: 'bs3',
    category: 'HAIR EXPERT',
    name: 'Keratin Hair Spa & Smoothening',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop',
    slug: 'hair',
    isActive: true,
    displayOrder: 3
  },
  {
    id: 'bs4',
    category: 'PARTY & EVENT',
    name: 'Sangeet & Reception Glam Look',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop',
    slug: 'party',
    isActive: true,
    displayOrder: 4
  },
  {
    id: 'bs5',
    category: 'NAIL STUDIO',
    name: 'Gel Nail Extensions & Art',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop',
    slug: 'nail',
    isActive: true,
    displayOrder: 5
  }
];

const isMongoId = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);

const resolveCardImage = (item) => {
  const img = item.image?.url || (typeof item.image === 'string' ? item.image : null) || item.file?.url || item.thumbnail?.url;
  if (!img) return initialDefaultCards[0].image;

  if (typeof img === 'string') {
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('blob:')) {
      return img;
    }
    if (/^[0-9a-fA-F]{24}$/.test(img)) {
      return `${config.API_URL}/file/get-file/${img}`;
    }
    if (img.startsWith('/')) {
      return `${config.API_URL}${img}`;
    }
  }
  return initialDefaultCards[0].image;
};

const HomeBookingCardsManager = ({ isDarkMode }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    image: '',
    slug: '',
    displayOrder: 1,
    isActive: true
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCards = async () => {
    setLoading(true);
    try {
      // Call NestJS Backend API GET /service/get-all-service-categories
      const res = await getAllServiceCategories();
      if (res?.success) {
        const dataList = res.data?.data ?? res.data ?? [];
        if (Array.isArray(dataList) && dataList.length > 0) {
          const apiCards = dataList.map((item, idx) => ({
            id: item._id || item.id,
            category: String(item.label || item.name || 'SERVICE').toUpperCase(),
            name: item.name || item.label || 'Beauty Service',
            image: resolveCardImage(item),
            slug: item.description || item.slug || item._id,
            isActive: item.isActive !== false,
            displayOrder: idx + 1
          }));
          setCards(apiCards);
        } else {
          setCards(initialDefaultCards);
        }
      } else {
        setCards(initialDefaultCards);
      }
    } catch (err) {
      console.error("Failed to fetch service categories from backend:", err);
      setCards(initialDefaultCards);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCard(null);
    setFormData({
      name: '',
      category: '',
      image: '',
      slug: '',
      displayOrder: cards.length + 1,
      isActive: true
    });
    setFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card) => {
    setEditingCard(card);
    setFormData({
      name: card.name || '',
      category: card.category || '',
      image: card.image || '',
      slug: card.slug || '',
      displayOrder: card.displayOrder || 1,
      isActive: card.isActive !== false
    });
    setFile(null);
    setImagePreview(card.image || null);
    setIsModalOpen(true);
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter service title.');
      return;
    }

    setSubmitting(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name.trim());
      dataToSend.append('label', (formData.category || formData.name).toUpperCase());
      dataToSend.append('description', formData.slug || formData.name);
      dataToSend.append('isActive', formData.isActive ? 'true' : 'false');

      if (file) {
        dataToSend.append('file', file);
      }

      let res;
      if (editingCard && isMongoId(editingCard.id)) {
        // Calls NestJS Backend API PUT /service/update-service-category/:id
        res = await updateServiceCategory(editingCard.id, dataToSend);
      } else {
        // Calls NestJS Backend API POST /service/create-service-category
        res = await createServiceCategory(dataToSend);
      }

      if (res?.success) {
        toast.success(editingCard ? 'Category updated in database!' : 'New Category created in database!');
        fetchCards();
        setIsModalOpen(false);
        window.dispatchEvent(new Event('home_booking_cards_updated'));
      } else {
        toast.error(res?.message || 'Failed to save category');
      }
    } catch (err) {
      console.error('Save category error:', err);
      toast.error('Failed to save in database');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCard = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Booking Category?',
      text: 'This item will be removed from NestJS database and Home Page.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d6d',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        if (isMongoId(id)) {
          const res = await deleteServiceCategory(id);
          if (res?.success) {
            toast.success('Category deleted from database!');
          }
        }
        fetchCards();
        window.dispatchEvent(new Event('home_booking_cards_updated'));
      } catch (err) {
        console.error('Delete error:', err);
        toast.error('Failed to delete category from backend');
      }
    }
  };

  const handleToggleStatus = async (card) => {
    try {
      if (isMongoId(card.id)) {
        const dataToSend = new FormData();
        dataToSend.append('name', card.name);
        dataToSend.append('label', card.category);
        dataToSend.append('description', card.slug || card.name);
        dataToSend.append('isActive', !card.isActive ? 'true' : 'false');
        const res = await updateServiceCategory(card.id, dataToSend);
        if (res?.success) {
          toast.success('Status updated in database!');
        }
      }
      fetchCards();
      window.dispatchEvent(new Event('home_booking_cards_updated'));
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const filteredCards = cards.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl lg:text-3xl font-extrabold uppercase tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Sparkles className="text-[#ff4d6d]" /> Home Booking Cards Manager
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-1">
            Super Admin Control Panel with NestJS Backend API & Local Computer Image Upload
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCards}
            className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            title="Refresh List"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#ff4d6d] hover:bg-[#e63956] text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Add New Card</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900/60 border-white/5' : 'bg-white border-gray-200 shadow-2xs'}`}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search booking cards by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition-all ${isDarkMode ? 'bg-white/5 text-white placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400'}`}
          />
        </div>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-gray-400 font-bold gap-2">
          <Loader2 className="animate-spin text-[#ff4d6d]" size={20} />
          <span>Fetching Dynamic Cards from Backend API...</span>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center ${isDarkMode ? 'bg-gray-900/40 border-white/5' : 'bg-white border-gray-200'}`}>
          <ImageIcon className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-sm font-extrabold text-gray-500">No Booking Cards Found in Database</p>
          <button onClick={handleOpenAddModal} className="mt-4 text-xs text-[#ff4d6d] font-black underline cursor-pointer">
            Create First Card Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className={`relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${isDarkMode ? 'bg-gray-900/80 border-white/10 hover:border-[#ff4d6d]' : 'bg-white border-gray-200 shadow-2xs hover:shadow-md hover:border-pink-300'}`}
            >
              {/* Image Box */}
              <div className="relative w-full h-[160px] bg-gray-100 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = initialDefaultCards[0].image; }}
                />
                
                {/* Status Badge */}
                <button
                  onClick={() => handleToggleStatus(card)}
                  className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md border cursor-pointer ${card.isActive !== false ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-gray-700 text-gray-300 border-gray-600'}`}
                >
                  {card.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              {/* Card Details */}
              <div className="p-3 flex flex-col flex-grow text-left">
                <span className="text-xs font-black uppercase text-[#ff4d6d] tracking-wider truncate mb-0.5">
                  {card.category}
                </span>
                <h4 className={`font-extrabold text-xs uppercase leading-snug truncate mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={card.name}>
                  {card.name}
                </h4>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => handleOpenEditModal(card)}
                    className="flex-1 bg-pink-500/10 hover:bg-pink-500/20 text-[#ff4d6d] rounded-lg py-1.5 text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto min-h-screen py-6 sm:py-10">
          <div className={`w-full max-w-md rounded-3xl p-5 sm:p-6 border shadow-2xl transition-all my-auto max-h-[85vh] overflow-y-auto flex flex-col ${isDarkMode ? 'bg-gray-900 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
            
            <div className="flex items-center justify-between mb-5 border-b pb-3 dark:border-white/10">
              <h3 className="text-base font-extrabold uppercase flex items-center gap-2">
                <Sparkles size={18} className="text-[#ff4d6d]" />
                <span>{editingCard ? 'Edit Booking Card' : 'Add New Booking Card'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4 text-left">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-gray-500 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HD Bridal Makeup & Hair Styling"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-gray-500 mb-1">Category Tag</label>
                <input
                  type="text"
                  placeholder="e.g. BRIDAL MAKEUP, SALON AT HOME"
                  value={formData.category}
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Image Input Section (Local System Upload + URL) */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-gray-500 mb-1">
                  Card Image (Local System Upload)
                </label>
                
                <div className="space-y-2">
                  {/* Local File Picker Button */}
                  <label className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed cursor-pointer transition-all ${isDarkMode ? 'border-white/20 bg-white/5 hover:bg-white/10 text-gray-300' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                    <Upload size={18} className="text-[#ff4d6d]" />
                    <span className="text-xs font-extrabold">{file ? file.name : 'Choose File from Computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const selectedFile = e.target.files[0];
                        if (selectedFile) {
                          setFile(selectedFile);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result);
                          };
                          reader.readAsDataURL(selectedFile);
                        }
                      }}
                    />
                  </label>

                  <div className="text-xs text-gray-400 text-center font-bold uppercase tracking-wider">
                    — OR ENTER WEB IMAGE URL BELOW —
                  </div>

                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, image: e.target.value }));
                      setImagePreview(e.target.value);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Image Preview Box */}
              {imagePreview && (
                <div className="w-full h-32 rounded-xl overflow-hidden border bg-gray-100 relative group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Image Selected Preview
                  </span>
                </div>
              )}

              {/* Redirect Slug */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-gray-500 mb-1">Redirect Slug / Link</label>
                <input
                  type="text"
                  placeholder="e.g. bridal, athome, nail"
                  value={formData.slug}
                  onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl font-black text-xs bg-[#ff4d6d] hover:bg-[#e63956] text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={14} />}
                  <span>{editingCard ? 'Save Changes' : 'Create Card'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default HomeBookingCardsManager;
