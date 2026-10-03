import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { createProduct, updateProduct, deleteProductVariant, getProductDetails } from '../../../api/vendorService';
import { useTheme } from '../../../context/ThemeContext';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const ProductModal = ({ isOpen, onClose, isEditing, isViewing, productId, categories, onSuccess, getImageUrl }) => {
  const { isDarkMode } = useTheme();
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    brand: 'ponds',
    description: '',
    categoryId: '',
    metaTitle: '',
    metaDescription: '',
    status: 'ACTIVE',
    hasVariants: false,
    isShippingApply: true,
    tags: '',
    variants: [
      {
        sku: '',
        salesPrice: '',
        costPrice: '',
        offeredPrice: '',
        stock: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        attributes: { color: '', size: '' },
        thumbnail: null,
        images: []
      }
    ]
  });
  const [productLoading, setProductLoading] = useState(false);
  const [originalProductForm, setOriginalProductForm] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        const freshForm = {
          name: '', slug: '', brand: '', description: '', categoryId: '', metaTitle: '', metaDescription: '', status: 'ACTIVE', hasVariants: false, isShippingApply: true, tags: '',
          variants: [{ sku: '', salesPrice: '', costPrice: '', offeredPrice: '', stock: '', weight: '', length: '', width: '', height: '', attributes: { color: '', size: '' }, thumbnail: null, images: [] }]
        };
        setProductForm(freshForm);
        setOriginalProductForm(freshForm);
        return;
      }

      Swal.fire({ title: 'Fetching full details...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await getProductDetails(productId);
        Swal.close();

        if (res.success) {
          const fullProduct = res.data?.data || res.data;
          const initialData = {
            name: fullProduct.name,
            slug: fullProduct.slug,
            brand: fullProduct.brand || 'ponds',
            description: fullProduct.description,
            categoryId: fullProduct.categoryId?._id || fullProduct.categoryId,
            metaTitle: fullProduct.metaTitle || '',
            metaDescription: fullProduct.metaDescription || '',
            status: fullProduct.status || 'ACTIVE',
            hasVariants: fullProduct.hasVariants || false,
            isShippingApply: fullProduct.isShippingApply !== undefined ? fullProduct.isShippingApply : true,
            tags: (fullProduct.tags || []).join(', '),
            variants: (fullProduct.variants || []).map(v => ({
              _id: v._id,
              sku: v.sku,
              salesPrice: v.salesPrice,
              costPrice: v.costPrice || '',
              offeredPrice: v.offeredPrice || '',
              stock: v.stock,
              weight: v.weight || '',
              length: v.length || '',
              width: v.width || '',
              height: v.height || '',
              attributes: v.attributes || { color: '', size: '' },
              thumbnail: v.thumbnail,
              images: v.images || []
            }))
          };

          if (initialData.variants.length === 0) {
            initialData.variants = [{ sku: '', salesPrice: '', costPrice: '', offeredPrice: '', stock: '', weight: '', length: '', width: '', height: '', attributes: { color: '', size: '' }, thumbnail: null, images: [] }];
          }

          setProductForm(initialData);
          setOriginalProductForm(JSON.parse(JSON.stringify(initialData)));
        } else {
          Toast.fire({ icon: 'error', title: 'Failed to fetch product details' });
          onClose();
        }
      } catch (error) {
        Swal.close();
        console.error(error);
        Toast.fire({ icon: 'error', title: 'Error fetching details' });
        onClose();
      }
    };

    if (isOpen) {
      fetchProductDetails();
    }
  }, [isOpen, productId]);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation: Duplicate variants are not allowed
    if (productForm.hasVariants && productForm.variants?.length > 1) {
      const attrKeys = productForm.variants.map(v => {
        const color = (v.attributes?.color || '').trim().toLowerCase();
        const size = (v.attributes?.size || '').trim().toLowerCase();
        return `${color}-${size}`;
      });
      
      const duplicateCombinations = [];
      attrKeys.forEach((key, index) => {
        if (attrKeys.indexOf(key) !== index && !duplicateCombinations.includes(key)) {
          duplicateCombinations.push(key);
        }
      });

      if (duplicateCombinations.length > 0) {
        Toast.fire({
          icon: 'warning',
          title: 'Duplicate variants are not allowed. Please ensure each variant has a unique color and size combination.'
        });
        return;
      }
    }

    setProductLoading(true);
    try {
      // Map tags input from comma-separated string to tag arrays
      const processedTags = productForm.tags
        ? productForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];
      
      const payload = {
        ...productForm,
        tags: processedTags
      };

      const response = isEditing
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

      if (response.success) {
        Toast.fire({ icon: 'success', title: response.data?.message || `Product ${isEditing ? 'updated' : 'created'} successfully!` });
        onSuccess();
        onClose();
      } else {
        Toast.fire({ icon: 'error', title: response.data?.message || response.message || 'Action failed' });
      }
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'System error' });
    } finally {
      setProductLoading(false);
    }
  };

  const handleAddVariant = () => {
    setProductForm({
      ...productForm,
      variants: [...productForm.variants, { sku: '', salesPrice: '', costPrice: '', offeredPrice: '', stock: '', weight: '', length: '', width: '', height: '', attributes: { color: '', size: '' }, thumbnail: null, images: [] }]
    });
  };

  const updateVariant = (idx, field, value) => {
    const newVariants = [...productForm.variants];
    newVariants[idx][field] = value;
    setProductForm({ ...productForm, variants: newVariants });
  };

  const updateVariantAttr = (vIdx, key, value) => {
    const newVariants = [...productForm.variants];
    newVariants[vIdx].attributes[key] = value;
    setProductForm({ ...productForm, variants: newVariants });
  };

  const closeProductModal = async () => {
    if (isViewing) {
      onClose();
      return;
    }

    const hasChanges = JSON.stringify(productForm) !== JSON.stringify(originalProductForm);
    
    if (hasChanges) {
      const result = await Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have modified some fields. Are you sure you want to close without saving?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Discard Changes',
        cancelButtonText: 'Keep Editing',
        background: '#fff',
        customClass: {
          confirmButton: 'bg-red-500 px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white',
          cancelButton: 'bg-gray-100 text-gray-800 px-6 py-2.5 rounded-xl font-bold uppercase text-xs'
        }
      });
      if (!result.isConfirmed) return;
    }

    onClose();
  };

  const handleDeleteVariant = async (vIdx) => {
    const variant = productForm.variants[vIdx];

    if (!variant._id) {
      setProductForm({
        ...productForm,
        variants: productForm.variants.filter((_, i) => i !== vIdx)
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Variant?',
      text: "This will permanently remove this variant from the database.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      background: '#fff',
      customClass: {
        title: 'text-sm font-bold uppercase',
        htmlContainer: 'text-xs font-bold text-gray-500 uppercase',
        confirmButton: 'bg-red-500 px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white',
        cancelButton: 'bg-gray-100 text-gray-800 px-6 py-2.5 rounded-xl font-bold uppercase text-xs'
      }
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Deleting variant...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const response = await deleteProductVariant(variant._id);
        Swal.close();
        if (response.success) {
          Toast.fire({ icon: 'success', title: 'Variant deleted successfully!' });
          setProductForm({
            ...productForm,
            variants: productForm.variants.filter((_, i) => i !== vIdx)
          });
        } else {
          Toast.fire({ icon: 'error', title: response.data?.message || 'Failed to delete variant' });
        }
      } catch (error) {
        Swal.close();
        Toast.fire({ icon: 'error', title: 'System error' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
      }`}>
        <div className={`p-6 border-b flex items-center justify-between sticky top-0 z-10 ${
          isDarkMode ? 'border-white/5 bg-gray-900 text-white' : 'border-gray-100 bg-white text-gray-800'
        }`}>
          <h2 className="text-xl font-bold uppercase ">
            {isViewing ? 'Product Details' : (isEditing ? 'Update Product' : 'Add New Product')}
          </h2>
          <button onClick={closeProductModal} className={`transition-colors cursor-pointer ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-10 overflow-y-auto flex-1">
          {isViewing ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className={`text-3xl font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{productForm.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-bold text-gray-400 uppercase">
                      {categories.find(c => c._id === productForm.categoryId)?.name || 'Uncategorized'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-bold text-primary uppercase">
                      Brand: {productForm.brand || 'ponds'}
                    </span>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                  productForm.status === 'ACTIVE'
                    ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700')
                    : (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700')
                }`}>
                  {productForm.status}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className={`text-xs font-bold text-gray-400 uppercase border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>Description</h3>
                <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-655'}`}>{productForm.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`p-5 rounded-2xl space-y-3 ${isDarkMode ? 'bg-gray-950/40' : 'bg-gray-50'}`}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase">SEO Title</h3>
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{productForm.metaTitle || '—'}</p>
                </div>
                <div className={`p-5 rounded-2xl space-y-3 ${isDarkMode ? 'bg-gray-950/40' : 'bg-gray-50'}`}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase">SEO Description</h3>
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{productForm.metaDescription || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`p-5 rounded-2xl space-y-3 ${isDarkMode ? 'bg-gray-950/40' : 'bg-gray-50'}`}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase">Tags</h3>
                  <div className="flex gap-2 flex-wrap">
                    {productForm.tags ? productForm.tags.split(',').map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/10 text-primary font-bold text-xs rounded-lg uppercase">
                        {tag.trim()}
                      </span>
                    )) : '—'}
                  </div>
                </div>
                <div className={`p-5 rounded-2xl space-y-3 ${isDarkMode ? 'bg-gray-950/40' : 'bg-gray-50'}`}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase">Shipping Status</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    productForm.isShippingApply 
                      ? (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600') 
                      : (isDarkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400')
                  }`}>
                    {productForm.isShippingApply ? 'Shipping Applied' : 'No Shipping'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-l-4 border-primary pl-3">
                  <h3 className={`text-sm font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Inventory & Variants ({productForm.variants.length})</h3>
                  {isViewing && productForm.variants.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-400 uppercase">Remove Variant:</span>
                      <select
                        onChange={async (e) => {
                          const idx = parseInt(e.target.value);
                          if (!isNaN(idx)) {
                            await handleDeleteVariant(idx);
                            e.target.value = ""; // reset select
                          }
                        }}
                        className={`border-none rounded-lg px-2.5 py-1 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none text-red-500 cursor-pointer ${
                          isDarkMode ? 'bg-gray-950 text-red-400' : 'bg-gray-100'
                        }`}
                        defaultValue=""
                      >
                        <option value="" disabled>Select to delete</option>
                        {productForm.variants.map((v, i) => (
                          <option key={i} value={i} className={`${isDarkMode ? 'text-gray-300 bg-gray-900' : 'text-gray-700'}`}>
                            {v.sku || `Variant ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {productForm.variants.map((v, idx) => (
                    <div key={idx} className={`group border rounded-3xl p-6 hover:border-primary/20 hover:bg-primary/[0.01] transition-all ${
                      isDarkMode ? 'border-white/5 hover:bg-primary/[0.01]' : 'border-gray-100'
                    }`}>
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex gap-3 overflow-x-auto pb-2 min-w-[200px]">
                          <div className={`w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden border ${
                            isDarkMode ? 'bg-gray-950 border-white/5' : 'bg-gray-100 border-gray-100'
                          }`}>
                            <img src={getImageUrl(v.thumbnail)} alt="thumb" className="w-full h-full object-cover" />
                          </div>
                          {(v.images || []).map((img, i) => (
                            <div key={i} className={`w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden border ${
                              isDarkMode ? 'bg-gray-950 border-white/5' : 'bg-gray-100 border-gray-100'
                            }`}>
                              <img src={getImageUrl(img)} alt="gal" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>

                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 content-center">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase">SKU</p>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>{v.sku}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase">Sales Price</p>
                            <p className="text-sm font-bold text-primary">₹{v.salesPrice}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase">Stock</p>
                            <p className={`text-sm font-bold ${v.stock < 10 ? 'text-orange-500' : (isDarkMode ? 'text-zinc-200' : 'text-zinc-900')}`}>{v.stock} Units</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase">Attributes</p>
                            <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                              {v.attributes.color || 'N/A'} • {v.attributes.size || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Advanced details in view panel */}
                      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mt-4 pt-4 border-t ${
                        isDarkMode ? 'border-zinc-800' : 'border-zinc-100'
                      }`}>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-zinc-400 uppercase">Cost Price</p>
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>₹{v.costPrice || '—'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-zinc-400 uppercase">Offered Price</p>
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>₹{v.offeredPrice || '—'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-zinc-400 uppercase">Weight</p>
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{v.weight ? `${v.weight} kg` : '—'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-zinc-400 uppercase">Dimensions (L x W x H)</p>
                          <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                            {v.length || '0'} x {v.width || '0'} x {v.height || '0'} cm
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProductSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className={`text-sm font-bold uppercase border-l-4 border-primary pl-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Product Name</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Premium Silk Saree"
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                        isDarkMode ? 'bg-gray-950 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Brand</label>
                    <input
                      type="text"
                      required
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="e.g. ponds"
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                        isDarkMode ? 'bg-gray-950 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                    <select
                      required
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none appearance-none transition-all ${
                        isDarkMode ? 'bg-gray-950 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                  <textarea
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Tell customers about your product..."
                    className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none transition-all ${
                      isDarkMode ? 'bg-gray-950 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'
                    }`}
                  ></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    placeholder="e.g. Saree, Silk, Festive"
                    className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      isDarkMode ? 'bg-gray-950 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={`text-sm font-bold uppercase border-l-4 pl-3 ${isDarkMode ? 'text-white border-white/20' : 'text-gray-900 border-gray-200'}`}>SEO Metadata (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Meta Title</label>
                    <input
                      type="text"
                      value={productForm.metaTitle}
                      onChange={(e) => setProductForm({ ...productForm, metaTitle: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none transition-all ${
                        isDarkMode ? 'bg-gray-955 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Meta Description</label>
                    <input
                      type="text"
                      value={productForm.metaDescription}
                      onChange={(e) => setProductForm({ ...productForm, metaDescription: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none transition-all ${
                        isDarkMode ? 'bg-gray-955 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold uppercase border-l-4 border-primary pl-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pricing & Variants</h3>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs font-bold text-primary uppercase hover:underline cursor-pointer"
                  >
                    + Add Another Variant
                  </button>
                </div>

                <div className="space-y-6">
                  {productForm.variants.map((variant, vIdx) => (
                    <div key={vIdx} className={`p-6 rounded-2xl border space-y-6 relative transition-all duration-300 ${
                      isDarkMode ? 'bg-gray-950/40 border-white/5' : 'bg-gray-50 border-gray-100'
                    }`}>
                      {productForm.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(vIdx)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">SKU</label>
                          <input
                            type="text" required
                            value={variant.sku}
                            onChange={(e) => updateVariant(vIdx, 'sku', e.target.value)}
                            placeholder="BLK-MED"
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Sales Price</label>
                          <input
                            type="number" required
                            value={variant.salesPrice}
                            onChange={(e) => updateVariant(vIdx, 'salesPrice', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Stock</label>
                          <input
                            type="number" required
                            value={variant.stock}
                            onChange={(e) => updateVariant(vIdx, 'stock', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Cost Price</label>
                          <input
                            type="number"
                            value={variant.costPrice}
                            onChange={(e) => updateVariant(vIdx, 'costPrice', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Offered Price</label>
                          <input
                            type="number"
                            value={variant.offeredPrice}
                            onChange={(e) => updateVariant(vIdx, 'offeredPrice', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Weight (kg)</label>
                          <input
                            type="number" step="0.01"
                            value={variant.weight}
                            onChange={(e) => updateVariant(vIdx, 'weight', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Length (cm)</label>
                          <input
                            type="number"
                            value={variant.length}
                            onChange={(e) => updateVariant(vIdx, 'length', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Width (cm)</label>
                          <input
                            type="number"
                            value={variant.width}
                            onChange={(e) => updateVariant(vIdx, 'width', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Height (cm)</label>
                          <input
                            type="number"
                            value={variant.height}
                            onChange={(e) => updateVariant(vIdx, 'height', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Color</label>
                          <input
                            type="text"
                            value={variant.attributes.color}
                            onChange={(e) => updateVariantAttr(vIdx, 'color', e.target.value)}
                            placeholder="e.g. Black"
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 uppercase">Size</label>
                          <input
                            type="text"
                            value={variant.attributes.size}
                            onChange={(e) => updateVariantAttr(vIdx, 'size', e.target.value)}
                            placeholder="e.g. Medium"
                            className={`w-full px-3 py-2 border rounded-lg text-xs font-bold outline-none transition-all ${
                              isDarkMode ? 'bg-gray-900 border-white/5 text-gray-200' : 'bg-white border-transparent text-gray-700'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Thumbnail (Featured Image)</label>
                          <div className={`relative h-24 rounded-xl border-2 border-dashed overflow-hidden group transition-all ${
                            isDarkMode ? 'bg-gray-900 border-white/10 hover:bg-white/5' : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}>
                            {variant.thumbnail ? (
                              <div className="w-full h-full relative">
                                <img 
                                  src={getImageUrl(variant.thumbnail)} 
                                  alt="preview" 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-sm font-bold text-white uppercase bg-primary px-3 py-1.5 rounded-lg">Change</span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                <Upload size={16} className="text-zinc-400" />
                                <span className="text-xs font-bold text-zinc-400 uppercase">Pick Main</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              onChange={(e) => updateVariant(vIdx, 'thumbnail', e.target.files[0])}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Gallery (Multiple Images)</label>
                          <div className={`relative min-h-[96px] rounded-xl border-2 border-dashed p-2 group transition-all ${
                            isDarkMode ? 'bg-gray-900 border-white/10 hover:bg-white/5' : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}>
                            {variant.images && variant.images.length > 0 ? (
                              <div className="grid grid-cols-4 gap-2">
                                {variant.images.map((img, i) => (
                                  <div key={i} className={`aspect-square rounded-lg overflow-hidden border relative group/img ${
                                    isDarkMode ? 'bg-gray-950 border-white/5' : 'bg-gray-50 border-gray-100'
                                  }`}>
                                    <img src={getImageUrl(img)} alt="gal" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                <div className={`aspect-square rounded-lg flex items-center justify-center border-2 border-dashed relative ${
                                  isDarkMode ? 'bg-gray-950 border-white/10' : 'bg-gray-50 border-gray-200'
                                }`}>
                                   <Plus size={14} className="text-gray-400" />
                                   <input 
                                    type="file" multiple
                                    onChange={(e) => updateVariant(vIdx, 'images', [...variant.images, ...Array.from(e.target.files)])}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-20 flex flex-col items-center justify-center gap-1">
                                <Plus size={16} className="text-zinc-400" />
                                <span className="text-xs font-bold text-zinc-400 uppercase">Add Gallery</span>
                                <input 
                                  type="file" multiple
                                  onChange={(e) => updateVariant(vIdx, 'images', Array.from(e.target.files))}
                                  className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`flex gap-4 pt-6 sticky bottom-0 py-4 border-t transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-50'
              }`}>
                <button
                  type="button"
                  onClick={closeProductModal}
                  className={`flex-1 px-4 py-3 border rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    isDarkMode ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productLoading}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold uppercase text-sm shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer hover:bg-primary/95 transition-all"
                >
                  {productLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Save Product')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
