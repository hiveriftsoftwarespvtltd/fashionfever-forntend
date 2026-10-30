import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, RefreshCw, Layers, AlertCircle,
  CheckCircle2, XCircle, ImageOff, Tag, Plus, Pencil, Eye, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getAllServiceCategories, deleteServiceCategory } from '../../../api/adminService';
import { toast } from '../../../utils/toast';
import DataTable from '../../../components/shared/DataTable';
import CreateServiceCategoryModal from './CreateServiceCategoryModal';
import ServiceCategoryDetailsModal from './ServiceCategoryDetailsModal';

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const formatSize = (bytes) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Main Component ────────────────────────────────────────────────────
const ServiceCategories = ({ isDarkMode }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'with-image' | 'no-image'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllServiceCategories();
      if (res?.success) {
        const data = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(data) ? data : []);
      } else {
        setError(res?.message || 'Failed to load service categories.');
        toast.error(res?.message || 'Failed to load service categories.');
      }
    } catch {
      const msg = 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const filtered = categories.filter((c) => {
    if (filter === 'active') return c.isActive;
    if (filter === 'inactive') return !c.isActive;
    if (filter === 'with-image') return !!c.image?.url;
    if (filter === 'no-image') return !c.image?.url;
    return true;
  });

  // ── Loading ──
  if (loading) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-4 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'} shadow-xl`}>
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Loading Service Categories...
        </p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-5 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'} shadow-xl p-10`}>
        <AlertCircle className="text-rose-500" size={40} />
        <div className="text-center">
          <p className={`font-black text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Failed to Load</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
        <button
          onClick={fetchCategories}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  const columns = [
    {
      header: 'Category',
      render: (cat) => (
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center font-bold border ${isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-gray-100 border-gray-100 shadow-sm'} flex-shrink-0`}>
            {cat.image?.url ? (
              <img src={cat.image.url} alt={cat.label || cat.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold">{cat.label?.charAt(0) || cat.name?.charAt(0) || 'C'}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{cat.label || cat.name}</span>
            {cat.name !== cat.label && (
              <span className="text-sm font-bold uppercase text-gray-400">/{cat.name}</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Description',
      render: (cat) => (
        <span className={`text-xs font-medium line-clamp-2 max-w-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {cat.description || 'No description'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (cat) => (
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
          <span className="text-sm font-semibold uppercase text-gray-400">{cat.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      )
    },
    {
      header: 'Created At',
      render: (cat) => (
        <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {formatDate(cat.createdAt)}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (cat) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            title="View Details"
            onClick={() => setSelectedCategoryId(cat._id)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-primary' : 'bg-gray-50 text-gray-400 hover:text-primary'}`}
          >
            <Eye size={18} />
          </button>
          <button
            title="Edit Category"
            onClick={() => {
              setEditingCategory(cat);
              setIsCreateModalOpen(true);
            }}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-orange-500' : 'bg-gray-50 text-gray-400 hover:text-orange-500'}`}
          >
            <Pencil size={18} />
          </button>
          <button
            title="Delete Category"
            onClick={() => {
              Swal.fire({
                title: 'Delete Service Category?',
                text: `Are you sure you want to delete service category "${cat.label || cat.name}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#da016a',
                cancelButtonColor: '#94a3b8',
                confirmButtonText: 'Yes, Delete',
                cancelButtonText: 'Cancel',
                background: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#1f2937',
                borderRadius: '20px',
                customClass: {
                  popup: 'rounded-3xl border-none',
                  confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
                  cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
                }
              }).then(async (result) => {
                if (result.isConfirmed) {
                  const loadingToast = toast.loading('Deleting service category...');
                  try {
                    const res = await deleteServiceCategory(cat._id);
                    toast.dismiss(loadingToast);
                    if (res.success) {
                      toast.success(res.message || 'Service category deleted successfully!');
                      fetchCategories();
                    } else {
                      toast.error(res.message || 'Failed to delete service category.');
                    }
                  } catch (err) {
                    toast.dismiss(loadingToast);
                    toast.error('Something went wrong during deletion.');
                  }
                }
              });
            }}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-primary uppercase tracking-widest block mb-1">
            Operations
          </span>
          <h2 className={`text-2xl lg:text-3xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Service Categories
          </h2>
          <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            All service categories configured in the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:opacity-95 text-white rounded-2xl font-bold text-xs uppercase shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} /> Add Category
          </button>
          <div className={`px-5 py-3 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'} shadow-sm`}>
            <p className="text-xs font-black uppercase text-gray-400 mb-0.5">Total</p>
            <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{categories.length}</p>
          </div>
          <button
            onClick={fetchCategories}
            disabled={loading}
            className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-900 border-white/5 text-gray-400 hover:text-white hover:bg-white/5' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: categories.filter(c => c.isActive).length, color: 'text-emerald-500', bg: isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-50', icon: <CheckCircle2 size={15} /> },
          { label: 'Inactive', value: categories.filter(c => !c.isActive).length, color: 'text-rose-500', bg: isDarkMode ? 'bg-rose-500/5' : 'bg-rose-50', icon: <XCircle size={15} /> },
          { label: 'With Image', value: categories.filter(c => !!c.image?.url).length, color: 'text-primary', bg: isDarkMode ? 'bg-primary/5' : 'bg-primary/5', icon: <Tag size={15} /> },
          { label: 'No Image', value: categories.filter(c => !c.image?.url).length, color: 'text-gray-400', bg: isDarkMode ? 'bg-white/5' : 'bg-gray-50', icon: <ImageOff size={15} /> },
        ].map((s, i) => (
          <div key={i} className={`px-4 py-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'} shadow-sm`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div className={`flex flex-wrap gap-2 p-1.5 rounded-2xl ${isDarkMode ? 'bg-gray-900 border border-white/5' : 'bg-gray-100'} w-fit`}>
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
          { key: 'with-image', label: 'With Image' },
          { key: 'no-image', label: 'No Image' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-200 ${filter === f.key
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : isDarkMode
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── DataTable ── */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
      />

      {/* ── Create / Update Service Category Modal ── */}
      <CreateServiceCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={fetchCategories}
        initialData={editingCategory}
      />

      {/* ── Service Category Details Modal ── */}
      <ServiceCategoryDetailsModal
        categoryId={selectedCategoryId}
        onClose={() => setSelectedCategoryId(null)}
      />
    </div>
  );
};

export default ServiceCategories;
