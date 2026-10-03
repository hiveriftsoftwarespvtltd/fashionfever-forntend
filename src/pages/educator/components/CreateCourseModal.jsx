import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, AlertCircle } from 'lucide-react';
import { getCourseCategories, addCourse, updateCourse } from '../../../api/educatorService';
import { toast } from '../../../utils/toast';
import config from '../../../config/config';

const CreateCourseModal = ({ isOpen, onClose, onCourseCreated, isDarkMode, editCourseData }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [language, setLanguage] = useState('HINDI');
  const [isFree, setIsFree] = useState(false);
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [tags, setTags] = useState(['']);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState('DRAFT');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (editCourseData) {
        setTitle(editCourseData.title || '');
        setSubtitle(editCourseData.subtitle || '');
        setDescription(editCourseData.description || '');
        setCategoryId(editCourseData.categoryId?._id || editCourseData.categoryId || '');
        setLevel(editCourseData.level || 'BEGINNER');
        setLanguage(editCourseData.language || 'HINDI');
        setIsFree(!!editCourseData.isFree);
        setCostPrice(editCourseData.costPrice || '');
        setSellingPrice(editCourseData.sellingPrice || '');
        setOfferedPrice(editCourseData.offeredPrice || '');
        setTags(editCourseData.tags && editCourseData.tags.length > 0 ? editCourseData.tags : ['']);
        setFile(null);
        let thumbUrl = null;
        if (editCourseData.thumbnail) {
          if (editCourseData.thumbnail.url) {
            thumbUrl = editCourseData.thumbnail.url;
          } else if (typeof editCourseData.thumbnail === 'string') {
            if (editCourseData.thumbnail.startsWith('http') || editCourseData.thumbnail.startsWith('data:')) {
              thumbUrl = editCourseData.thumbnail;
            } else {
              thumbUrl = `${config.API_URL}/file/get-file/${editCourseData.thumbnail}`;
            }
          }
        }
        setImagePreview(thumbUrl);
        setStatus(editCourseData.status || 'DRAFT');
      } else {
        resetForm();
      }
    }
  }, [isOpen, editCourseData]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getCourseCategories();
      if (res?.success) {
        const list = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      } else {
        toast.error('Failed to load course categories');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch course categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddTag = () => {
    setTags([...tags, '']);
  };

  const handleRemoveTag = (index) => {
    if (tags.length > 1) {
      setTags(tags.filter((_, i) => i !== index));
    }
  };

  const handleTagChange = (index, value) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
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
    if (!title.trim()) {
      toast.error('Please enter a course title.');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a course category.');
      return;
    }
    if (!editCourseData && !file) {
      toast.error('Please upload a course thumbnail.');
      return;
    }

    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('subtitle', subtitle.trim());
      formData.append('description', description.trim());
      formData.append('categoryId', categoryId);
      formData.append('level', level);
      formData.append('language', language);
      formData.append('isFree', isFree ? 'true' : 'false');
      formData.append('costPrice', isFree ? '0' : costPrice || '0');
      formData.append('sellingPrice', isFree ? '0' : sellingPrice || '0');
      formData.append('offeredPrice', isFree ? '0' : offeredPrice || '0');
      if (editCourseData) {
        formData.append('status', status);
      }
      
      if (file) {
        formData.append('file', file);
      }

      const filteredTags = tags.filter(tag => tag.trim() !== '');
      filteredTags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag.trim());
      });

      let res;
      if (editCourseData) {
        res = await updateCourse(editCourseData._id, formData);
      } else {
        res = await addCourse(formData);
      }

      if (res?.success) {
        toast.success(editCourseData ? 'Course updated successfully!' : 'Course created successfully!');
        onCourseCreated();
        onClose();
        resetForm();
      } else {
        toast.error(res?.message || (editCourseData ? 'Failed to update course.' : 'Failed to create course.'));
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setDescription('');
    setCategoryId('');
    setLevel('BEGINNER');
    setLanguage('HINDI');
    setIsFree(false);
    setCostPrice('');
    setSellingPrice('');
    setOfferedPrice('');
    setTags(['']);
    setFile(null);
    setImagePreview(null);
    setStatus('DRAFT');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content Wrapper */}
      <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl transition-all duration-300 flex flex-col max-h-[90vh] ${
        isDarkMode ? 'bg-gray-900 border-white/5 text-white' : 'bg-white border-gray-150 text-gray-800'
      }`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">{editCourseData ? 'Edit Course Details' : 'Create New Course'}</h3>
            <p className="text-sm font-bold text-gray-400 uppercase mt-0.5">{editCourseData ? 'Modify your course details and settings' : 'Publish a beauty lesson or tutorial to the marketplace'}</p>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-500'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-left">
          
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Course Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Master Bridal Makeup Essentials"
                required
                className={`block w-full px-4 py-3 border rounded-xl font-semibold leading-normal transition-all ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-primary' : 'bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-primary'
                }`}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Subtitle</label>
              <input 
                type="text" 
                value={subtitle} 
                onChange={(e) => setSubtitle(e.target.value)} 
                placeholder="e.g. Learn advanced blending techniques"
                className={`block w-full px-4 py-3 border rounded-xl font-semibold leading-normal transition-all ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-primary' : 'bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-primary'
                }`}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Course Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Provide a detailed outline of what students will learn..."
              rows={3}
              className={`block w-full px-4 py-3 border rounded-xl font-semibold leading-normal transition-all resize-none ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-primary' : 'bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-primary'
              }`}
            />
          </div>

          {/* Category & Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className={`block w-full px-4 py-3 border rounded-xl font-semibold leading-normal outline-none transition-all ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                }`}
              >
                <option value="" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id} className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>{cat.label || cat.name}</option>
                ))}
              </select>
              {loadingCategories && <span className="text-xs text-zinc-400 animate-pulse uppercase font-semibold">Syncing categories...</span>}
            </div>

            {/* Thumbnail upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Course Thumbnail *</label>
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${
                  isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                }`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={18} className="text-zinc-400" />
                  )}
                </div>
                <div>
                  <label 
                    htmlFor="thumbnail-upload" 
                    className={`inline-flex items-center gap-2 px-3.5 py-2 border text-xs font-bold uppercase rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
                    }`}
                  >
                    Select Image
                  </label>
                  <input 
                    type="file" 
                    id="thumbnail-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Level, Language & Access */}
          <div className={`grid grid-cols-1 ${editCourseData ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Difficulty Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={`block w-full px-4 py-3 border rounded-xl font-semibold leading-normal outline-none transition-all ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                }`}
              >
                <option value="BEGINNER" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>Beginner</option>
                <option value="INTERMEDIATE" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>Intermediate</option>
                <option value="ADVANCED" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`block w-full px-4 py-3 border rounded-xl font-semibold leading-normal outline-none transition-all ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                }`}
              >
                <option value="HINDI" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>Hindi</option>
                <option value="ENGLISH" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>English</option>
              </select>
            </div>

            {editCourseData && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Course Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`block w-full px-4 py-3 border rounded-xl font-semibold leading-normal outline-none transition-all ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                  }`}
                >
                  <option value="DRAFT" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>Draft</option>
                  <option value="PUBLISHED" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>Published</option>
                  <option value="REJECTED" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>Rejected</option>
                  <option value="ARCHIVED" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'}>Archived</option>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Access Mode</label>
              <div className="flex gap-4 items-center h-11">
                <label className="flex items-center gap-2 cursor-pointer font-bold uppercase text-sm">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Mark as Free</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing Config (Visible only if NOT Free) */}
          {!isFree && (
            <div className="p-4 rounded-2xl border space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 bg-primary/5 border-primary/10">
              <div className="flex items-center gap-1.5 text-primary text-sm font-black uppercase">
                <AlertCircle size={13} />
                <span>Pricing Specifications (INR)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cost Price</label>
                  <input 
                    type="number" 
                    value={costPrice} 
                    onChange={(e) => setCostPrice(e.target.value)} 
                    placeholder="e.g. 300"
                    required={!isFree}
                    className={`block w-full px-3.5 py-2.5 border rounded-xl font-semibold leading-normal transition-all ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Selling Price</label>
                  <input 
                    type="number" 
                    value={sellingPrice} 
                    onChange={(e) => setSellingPrice(e.target.value)} 
                    placeholder="e.g. 100"
                    required={!isFree}
                    className={`block w-full px-3.5 py-2.5 border rounded-xl font-semibold leading-normal transition-all ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Offered Price</label>
                  <input 
                    type="number" 
                    value={offeredPrice} 
                    onChange={(e) => setOfferedPrice(e.target.value)} 
                    placeholder="e.g. 100"
                    required={!isFree}
                    className={`block w-full px-3.5 py-2.5 border rounded-xl font-semibold leading-normal transition-all ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Course Tags / Keywords</label>
              <button
                type="button"
                onClick={handleAddTag}
                className="text-xs font-bold text-primary hover:underline uppercase cursor-pointer"
              >
                + Add Tag
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {tags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagChange(idx, e.target.value)}
                    placeholder={`Course Tag #${idx + 1} (e.g. Skincare, Eyeshadow)`}
                    className={`block w-full px-4 py-2.5 border rounded-xl font-bold transition-all ${
                      isDarkMode ? 'bg-gray-900 border-white/5 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`}
                  />
                  {tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className={`p-2.5 border hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-500 rounded-xl transition-all cursor-pointer ${
                        isDarkMode ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-155 text-gray-500'
                      }`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className={`p-6 border-t flex gap-3 ${isDarkMode ? 'border-white/5 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitLoading}
            className={`flex-1 py-3 text-sm sm:text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
              isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-150 text-gray-700'
            }`}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitLoading}
            className="flex-1 py-3 bg-primary hover:bg-primary/95 text-white text-sm sm:text-xs font-black uppercase rounded-xl shadow-md shadow-primary/15 transition-all cursor-pointer flex justify-center items-center"
          >
            {submitLoading ? (editCourseData ? 'Saving Changes...' : 'Creating Course...') : (editCourseData ? 'Save Changes' : 'Create Course')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseModal;
