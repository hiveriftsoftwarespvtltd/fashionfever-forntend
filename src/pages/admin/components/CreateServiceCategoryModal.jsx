import React, { useState, useEffect } from 'react';
import { Layers, X, Loader2, Upload } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { createServiceCategory, updateServiceCategory } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Create / Update Service Category Modal
 */
const CreateServiceCategoryModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          label: initialData.label || '',
          description: initialData.description || '',
          isActive: initialData.isActive ?? true
        });
        setImagePreview(initialData.image?.url || null);
        setFile(null);
      } else {
        setFormData({
          name: '',
          label: '',
          description: '',
          isActive: true
        });
        setFile(null);
        setImagePreview(null);
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const nextData = { ...prev, [name]: value };
      
      // Auto-generate label from name if label hasn't been manually edited (only in create mode)
      if (!initialData && name === 'name' && (!prev.label || prev.label === prev.name)) {
        nextData.label = value;
      }
      
      return nextData;
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!initialData && !file) {
      toast.error('Please upload a service category image file.');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name.trim());
      dataToSend.append('label', formData.label.trim());
      dataToSend.append('description', formData.description.trim());
      dataToSend.append('isActive', formData.isActive);
      
      if (file) {
        dataToSend.append('file', file);
      }

      let res;
      if (initialData) {
        const catId = initialData._id || initialData.id;
        console.log("Submitting PUT request to updateServiceCategory with ID:", catId, "and formData entries:", Object.fromEntries(dataToSend.entries()));
        res = await updateServiceCategory(catId, dataToSend);
      } else {
        console.log("Submitting POST request to createServiceCategory with formData entries:", Object.fromEntries(dataToSend.entries()));
        res = await createServiceCategory(dataToSend);
      }

      if (res.success) {
        toast.success(res.message || (initialData ? 'Service category updated successfully!' : 'Service category created successfully!'));
        if (!initialData) {
          setFormData({ name: '', label: '', description: '', isActive: true });
          setFile(null);
          setImagePreview(null);
        }
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || (initialData ? 'Failed to update service category.' : 'Failed to create service category.'));
      }
    } catch (err) {
      console.error(err);
      toast.error(initialData ? 'Something went wrong while updating service category.' : 'Something went wrong while creating service category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit">
      <div className={`w-full max-w-xl my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="p-5 md:p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Layers size={24} />
              </div>
              <div>
                <h2 className={`text-xl font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {initialData ? 'Update Service Category' : 'Create Service Category'}
                </h2>
                <p className="text-sm font-bold text-gray-400 uppercase mt-1">
                  {initialData ? `Modify details for: ${initialData.label || initialData.name}` : 'Add a new service category to the platform'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-50 text-gray-400'}`}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="grid grid-cols-1 gap-5">
              
              {/* Category Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Category Cover Image</label>
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 rounded-2xl overflow-hidden border flex items-center justify-center ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700 shadow-sm'}`}>
                      <Upload size={14} />
                      Choose Image File
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-xs font-medium text-gray-400 uppercase mt-1.5">{initialData ? 'Choose new file to replace existing image' : 'Supports PNG, JPG, JPEG. Max file size: 5MB.'}</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Category Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Manicure" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
              </div>

              {/* Display Label */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Display Label</label>
                <input required name="label" value={formData.label} onChange={handleChange} placeholder="e.g. Manicure Services" className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-gray-400">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Category overview..." className={`w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none border transition-all resize-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary/50' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-primary/30'}`}></textarea>
              </div>

              {/* Status Toggle (only in Edit mode) */}
              {initialData && (
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-gray-400">Category Status</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all duration-200 cursor-pointer ${
                        formData.isActive
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}
                    >
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button disabled={loading} type="submit" className="flex-1 order-2 sm:order-1 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:opacity-95 active:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                {loading ? <Loader2 size={18} className="animate-spin" /> : initialData ? 'Save Changes' : 'Confirm Category'}
              </button>
              <button type="button" onClick={onClose} className={`w-full sm:w-auto order-1 sm:order-2 px-8 py-4 rounded-2xl font-bold text-xs uppercase transition-all cursor-pointer ${isDarkMode ? 'bg-gray-900 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceCategoryModal;
