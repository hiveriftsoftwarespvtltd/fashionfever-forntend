import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2, BookOpen, Layers, Edit2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { getCourseSectionsList, createCourseSection, updateCourseSection, deleteCourseSection } from '../../../api/educatorService';
import { toast } from '../../../utils/toast';

const ManageSectionsModal = ({ isOpen, onClose, course, isDarkMode }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState('1');

  useEffect(() => {
    if (isOpen && course) {
      fetchSections();
    } else {
      resetForm();
      setSections([]);
    }
  }, [isOpen, course]);

  const resetForm = () => {
    setTitle('');
    setOrder('1');
    setEditingSection(null);
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await getCourseSectionsList(course._id);
      if (res?.success) {
        const list = res.data?.data || res.data || [];
        setSections(Array.isArray(list) ? list : []);
      } else {
        toast.error(res?.message || 'Failed to load course sections');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch course sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a section title.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingSection) {
        // Edit Section Flow
        const payload = {
          title: title.trim(),
          order: parseInt(order, 10) || 1
        };
        const res = await updateCourseSection(editingSection._id, payload);
        if (res?.success) {
          toast.success(res?.message || 'Section updated successfully!');
          resetForm();
          fetchSections();
        } else {
          toast.error(res?.message || 'Failed to update course section.');
        }
      } else {
        // Create Section Flow
        const payload = {
          courseId: course._id,
          title: title.trim(),
          order: parseInt(order, 10) || 1
        };
        const res = await createCourseSection(payload);
        if (res?.success) {
          toast.success(res?.message || 'Section created successfully!');
          setTitle('');
          setOrder(String(sections.length + 2)); // Auto-increment order suggestion
          fetchSections();
        } else {
          toast.error(res?.message || 'Failed to create course section.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (section) => {
    setEditingSection(section);
    setTitle(section.title || '');
    setOrder(String(section.order || 1));
  };

  const handleDeleteClick = async (sectionId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this section?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: isDarkMode ? '#111827' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      customClass: {
        popup: 'rounded-3xl border border-white/5 font-outfit uppercase font-bold text-xs tracking-normal',
        title: 'text-lg font-bold',
        confirmButton: 'rounded-xl px-4 py-2 font-bold uppercase text-xs cursor-pointer',
        cancelButton: 'rounded-xl px-4 py-2 font-bold uppercase text-xs cursor-pointer'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const res = await deleteCourseSection(sectionId);
      if (res?.success) {
        toast.success(res?.message || 'Section deleted successfully!');
        if (editingSection?._id === sectionId) {
          resetForm();
        }
        fetchSections();
      } else {
        toast.error(res?.message || 'Failed to delete section.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border ${
        isDarkMode ? 'bg-gray-900 border-white/5 text-white' : 'bg-white border-gray-100 text-gray-800'
      }`}>
        
        {/* Header */}
        <div className={`p-6 flex items-center justify-between border-b ${isDarkMode ? 'border-white/5 bg-gray-950/40' : 'border-gray-50 bg-gray-50/50'}`}>
          <div className="flex items-center gap-3">
            <Layers className="text-primary" size={20} />
            <div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight">Course Sections</h3>
              <p className="text-sm font-semibold text-gray-400 uppercase mt-0.5">{course?.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white' : 'bg-white border-gray-150 hover:bg-gray-50 text-gray-500'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Create/Edit Section Form */}
          <form onSubmit={handleSubmit} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-150/50'} space-y-4`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </h4>
              {editingSection && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-black uppercase text-gray-400 hover:text-primary transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Section Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Overview, Advanced Techniques"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 focus:border-primary/50 text-white' 
                      : 'bg-white border-zinc-200 focus:border-primary/50 text-zinc-800'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Display Order</label>
                <input 
                  type="number"
                  min="1"
                  placeholder="1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 focus:border-primary/50 text-white' 
                      : 'bg-white border-zinc-200 focus:border-primary/50 text-zinc-800'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1 gap-2">
              <button 
                type="submit"
                disabled={submitLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                {submitLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : editingSection ? (
                  <Edit2 size={12} />
                ) : (
                  <Plus size={12} />
                )}
                {editingSection ? 'Update Section' : 'Create Section'}
              </button>
            </div>
          </form>

          {/* Current Sections List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Current Sections List</h4>
            
            <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
              {loading ? (
                <div className="py-10 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : sections.length > 0 ? (
                sections.map((section, idx) => (
                  <div 
                    key={section._id} 
                    className={`flex items-center justify-between p-4 rounded-xl border text-xs transition-all ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        #{section.order || (idx + 1)}
                      </span>
                      <div>
                        <p className={`font-bold text-xs ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>{section.title}</p>
                        <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">
                          {section.totalVideos || 0} Videos • {section.totalAttachments || 0} Attachments
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(section)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/5 text-gray-400 hover:text-primary hover:border-primary/30' 
                            : 'bg-gray-50 border-gray-100 text-gray-500 hover:text-primary hover:bg-primary/5 hover:border-primary/20'
                        }`}
                        title="Edit Section"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(section._id)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/5 text-gray-400 hover:text-red-500 hover:border-red-500/30' 
                            : 'bg-gray-50 border-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                        }`}
                        title="Delete Section"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50/50'}`}>
                  <BookOpen size={20} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-bold text-gray-400 uppercase">No Sections added to this course yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSectionsModal;
