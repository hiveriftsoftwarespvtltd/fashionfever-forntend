import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const VendorProducts = ({
  isDarkMode,
  products,
  productsLoading,
  getImageUrl,
  onAddProduct,
  onViewProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page to 1 if products list length changes (e.g., deleted or added)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  // Sort: Last added item at the top of the table (sorted by createdAt descending / fallback to _id)
  const sortedProducts = React.useMemo(() => {
    return [...products].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateB !== dateA) {
        return dateB - dateA;
      }
      return (b._id || '').toString().localeCompare((a._id || '').toString());
    });
  }, [products]);

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Generate page numbers with ellipses for a clean UI
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Product Catalog</h2>
        <button
          onClick={onAddProduct}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 cursor-pointer"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gray-900 border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.2)]' : 'bg-white border-gray-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`${isDarkMode ? 'bg-gray-950/40 border-b border-white/5' : 'bg-gray-50 border-b border-gray-100'}`}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
              {productsLoading ? (
                <tr><td colSpan="5" className="p-10 text-center font-bold text-gray-400">Loading products...</td></tr>
              ) : paginatedProducts.map((product) => {
                const rawImg = product.variants?.[0]?.thumbnail || product.variants?.[0]?.images?.[0] || product.images?.[0] || product.image || product.thumbnail;
                const imgUrl = rawImg ? getImageUrl(rawImg) : null;
                const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'Product')}&background=random`;

                return (
                  <tr key={product._id} className={`${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center font-bold border flex-shrink-0 ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
                        }`}>
                          <img 
                            src={imgUrl || fallbackAvatar} 
                            alt={product.name || ''} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = fallbackAvatar;
                            }}
                          />
                        </div>
                        <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-250' : 'text-gray-800'}`}>{product.name}</span>
                      </div>
                    </td>
                  <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>₹{product.variants?.[0]?.salesPrice || 0}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-650'}`}>{product.variants?.[0]?.stock || 0} units</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                      product.status === 'ACTIVE'
                        ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600')
                        : (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600')
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onViewProduct(product)}
                        className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50'} cursor-pointer`}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEditProduct(product)}
                        className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-500 hover:text-primary hover:bg-primary/10' : 'text-gray-300 hover:text-primary hover:bg-primary/5'} cursor-pointer`}
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product._id)}
                        className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'} cursor-pointer`}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
              {sortedProducts.length === 0 && !productsLoading && (
                <tr><td colSpan="5" className="p-10 text-center font-bold text-gray-400">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className={`px-6 py-4 flex items-center justify-between border-t transition-colors duration-300 ${isDarkMode ? 'border-white/5 bg-gray-950/20' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="text-xs font-bold text-gray-400 uppercase">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  currentPage === 1
                    ? 'text-gray-500 opacity-40 cursor-not-allowed'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-xs font-bold text-gray-500">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  currentPage === totalPages
                    ? 'text-gray-500 opacity-40 cursor-not-allowed'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProducts;
