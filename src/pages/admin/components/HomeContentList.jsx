import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Eye, TicketPercent, Calendar, Pencil, Trash2, Loader2 } from 'lucide-react';
import DataTable from '../../../components/shared/DataTable';
import config from '../../../config/config';
import Swal from 'sweetalert2';
import { deleteHomeContent } from '../../../api/adminService';
import { toast } from '../../../utils/toast';
import apiClient from '../../../api/apiClient';

const SecureImage = ({ src, alt, className, fallback }) => {
  const [imgUrl, setImgUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgUrl('');
      return;
    }

    const isLocalApi = src.includes('/file/get-file/');
    if (!isLocalApi && (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:'))) {
      setImgUrl(src);
      return;
    }

    const fetchImage = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(src, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(response.data);
        setImgUrl(blobUrl);
      } catch (err) {
        console.error('Failed to load secure image:', err);
        setImgUrl(src);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [src]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100/10">
        <Loader2 className="animate-spin text-primary" size={14} />
      </div>
    );
  }

  if (!imgUrl) return fallback || null;

  return (
    <img 
      src={imgUrl} 
      alt={alt} 
      className={className} 
      onError={(e) => {
        if (imgUrl !== src) {
          setImgUrl(src);
        }
      }}
    />
  );
};

const HomeContentList = ({
  isDarkMode,
  homeContents,
  loading,
  onCreateTrigger,
  onEditTrigger,
  onViewTrigger,
  onDeleteSuccess
}) => {

  const resolveImageUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') {
      if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('blob:')) {
        return img;
      }
      if (/^[0-9a-fA-F]{24}$/.test(img)) {
        return `${config.API_URL}/file/get-file/${img}`;
      }
      return img;
    }
    if (typeof img === 'object' && img?.url) {
      return img.url;
    }
    return '';
  };

  const columns = [
    {
      header: 'Banner / Media',
      render: (item) => (
        <div className="flex items-center gap-4">
          <div className={`w-16 h-10 rounded-xl overflow-hidden flex items-center justify-center border bg-gray-50 dark:bg-gray-900 ${
            isDarkMode ? 'border-white/5' : 'border-gray-100 shadow-sm'
          }`}>
            {item.computerImage ? (
              <SecureImage src={resolveImageUrl(item.computerImage)} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-gray-400" size={16} />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.title}</span>
            {item.subTitle && (
              <span className="text-sm font-bold text-gray-400 truncate">{item.subTitle}</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Content Type',
      render: (item) => (
        <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">
          {item.contentType || 'BANNER'}
        </span>
      )
    },
    {
      header: 'Placement',
      render: (item) => (
        <div className="flex flex-col">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Page {item.page || '1'}
          </span>
          <span className="text-xs font-medium text-gray-400">Order: {item.displayOrder || '1'}</span>
        </div>
      )
    },
    {
      header: 'Validity Period',
      render: (item) => {
        const start = item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Always';
        const end = item.endDate ? new Date(item.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'Open';
        return (
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <Calendar size={12} className="text-gray-400" />
            <span>{start} - {end}</span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
          <span className="text-sm font-semibold uppercase text-gray-400">{item.isActive ? 'Active' : 'Draft'}</span>
        </div>
      )
    },
    {
      header: 'Featured',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
          item.isFeatured 
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25' 
            : 'bg-gray-100 dark:bg-white/5 text-gray-400 border border-transparent'
        }`}>
          {item.isFeatured ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'Redirect Rule',
      render: (item) => {
        let label = 'None';
        let detail = '';
        if (item.redirectType === 'PRODUCT') {
          label = 'Product';
          detail = `ID: ...${item.redirectId?.substring(18) || ''}`;
        } else if (item.redirectType === 'CATEGORY') {
          label = 'Category';
          detail = `ID: ...${item.redirectId?.substring(18) || ''}`;
        } else if (item.redirectType === 'EXTERNAL') {
          label = 'External';
          detail = item.redirectUrl || '';
        }
        return (
          <div className="flex flex-col">
            <span className={`text-sm uppercase font-bold text-gray-700 dark:text-gray-300`}>{label}</span>
            {detail && <span className="text-[11px] text-gray-400 truncate max-w-[120px]">{detail}</span>}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            title="View Details"
            onClick={() => onViewTrigger && onViewTrigger(item)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-primary' : 'bg-gray-50 text-gray-400 hover:text-primary'}`}
          >
            <Eye size={18} />
          </button>
          <button
            title="Edit Banner"
            onClick={() => onEditTrigger(item)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-orange-500' : 'bg-gray-50 text-gray-400 hover:text-orange-500'}`}
          >
            <Pencil size={18} />
          </button>
          <button
            title="Delete Banner"
            onClick={() => {
              Swal.fire({
                title: 'Delete Homepage Banner?',
                text: `Are you sure you want to delete banner "${item.title}"?`,
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
                  const loadingToast = toast.loading('Deleting banner...');
                  try {
                    const res = await deleteHomeContent(item._id);
                    toast.dismiss(loadingToast);
                    if (res.success) {
                      toast.success(res.message || 'Banner deleted successfully!');
                      if (onDeleteSuccess) onDeleteSuccess();
                    } else {
                      toast.error(res.message || 'Failed to delete banner.');
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
    <div className="space-y-6 lg:space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-lg lg:text-3xl font-bold uppercase transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Home Content Manager
          </h2>
          <p className="text-sm font-semibold uppercase text-gray-400 mt-1">
            Publish landing banners and customize slider redirects
          </p>
        </div>
        <div className={`px-4 lg:px-6 py-3 lg:py-4 rounded-2xl lg:rounded-[24px] border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100'}`}>
          <p className="text-sm font-bold uppercase text-gray-400 mb-0.5">Active Items</p>
          <p className="text-xl lg:text-2xl font-bold">{homeContents.length}</p>
        </div>
      </div>

      <div className="flex">
        <button
          onClick={onCreateTrigger}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 lg:px-8 py-3 lg:py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer animate-in fade-in"
        >
          <Plus size={18} />
          Create Banner Content
        </button>
      </div>

      <DataTable
        columns={columns}
        data={homeContents}
        loading={loading}
        onRowClick={() => { /* no-op details */ }}
      />
    </div>
  );
};

export default HomeContentList;
