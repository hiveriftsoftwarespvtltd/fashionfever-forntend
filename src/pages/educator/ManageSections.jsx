import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, BookOpen, Layers, Edit2, Trash2, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import Swal from 'sweetalert2';
import { 
  getCourseSectionsList, 
  createCourseSection, 
  updateCourseSection, 
  deleteCourseSection,
  createCourseLesson,
  updateCourseLesson,
  getCourseLessonsListBySection,
  deleteCourseLesson,
  createCourseAttachment,
  updateCourseAttachment,
  getCourseAttachmentsListByCourse,
  getCourseAttachmentsListBySection,
  getCourseAttachmentsListByLesson,
  deleteCourseAttachment
} from '../../api/educatorService';
import { toast } from '../../utils/toast';
import { useTheme } from '../../context/ThemeContext';

const ManageSections = ({ course: propCourse, isDarkMode: propDarkMode, onBack }) => {
  const { courseId: paramCourseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode: themeDarkMode } = useTheme();

  const isDarkMode = propDarkMode !== undefined ? propDarkMode : themeDarkMode;
  const course = propCourse || location.state?.course || { _id: paramCourseId, title: 'Course' };
  const courseId = course?._id || paramCourseId;

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState('1');

  // Lesson state variables
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [addingAttachmentSectionId, setAddingAttachmentSectionId] = useState(null);

  // Lesson Form Fields
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonVideoId, setLessonVideoId] = useState('');
  const [lessonDuration, setLessonDuration] = useState('600');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [lessonSubmitLoading, setLessonSubmitLoading] = useState(false);

  // Attachment Form Fields
  const [addingAttachmentLessonId, setAddingAttachmentLessonId] = useState(null);
  const [attachmentType, setAttachmentType] = useState('OTHER');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentDuration, setAttachmentDuration] = useState('60');
  const [attachmentSubmitLoading, setAttachmentSubmitLoading] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchSections();
    }
  }, [courseId]);

  const resetForm = () => {
    setTitle('');
    setOrder('1');
    setEditingSection(null);
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const secRes = await getCourseSectionsList(courseId);
      const attRes = await getCourseAttachmentsListByCourse(courseId);
      
      let loadedSections = [];
      if (secRes?.success) {
        loadedSections = secRes.data?.data || secRes.data || [];
        setSections(Array.isArray(loadedSections) ? loadedSections : []);
      } else {
        toast.error(secRes?.message || 'Failed to load course sections');
      }

      if (Array.isArray(loadedSections) && loadedSections.length > 0) {
        const lessonsPromises = loadedSections.map(sec => getCourseLessonsListBySection(sec._id));
        const lessonsResponses = await Promise.all(lessonsPromises);
        const loadedLessons = [];
        lessonsResponses.forEach(res => {
          if (res?.success) {
            const list = res.data?.data || res.data || [];
            if (Array.isArray(list)) {
              loadedLessons.push(...list);
            }
          }
        });
        setLessons(loadedLessons);
      } else {
        setLessons([]);
      }

      if (attRes?.success) {
        const list = attRes.data?.data || attRes.data || [];
        setAttachments(Array.isArray(list) ? list : []);
      } else {
        toast.error(attRes?.message || 'Failed to load course attachments');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch course sections, lessons or attachments');
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
          courseId: courseId,
          title: title.trim(),
          order: parseInt(order, 10) || 1
        };
        const res = await createCourseSection(payload);
        if (res?.success) {
          toast.success(res?.message || 'Section created successfully!');
          setTitle('');
          setOrder(String(sections.length + 2)); // Auto-increment suggestion
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

  const handleToggleExpandSection = (sectionId) => {
    if (expandedSectionId === sectionId) {
      setExpandedSectionId(null);
    } else {
      setExpandedSectionId(sectionId);
      resetLessonForm();
    }
  };

  const resetLessonForm = () => {
    setEditingLesson(null);
    setLessonTitle('');
    setLessonDescription('');
    setLessonVideoUrl('');
    setLessonVideoId('');
    setLessonDuration('600');
    setLessonOrder('1');
    setLessonIsPreview(false);
  };

  const handleLessonSubmit = async (e, sectionId) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      toast.error('Please enter a lesson title.');
      return;
    }

    setLessonSubmitLoading(true);
    try {
      if (editingLesson) {
        const payload = {
          title: lessonTitle.trim(),
          description: lessonDescription.trim(),
          videoUrl: lessonVideoUrl.trim(),
          videoId: lessonVideoId.trim(),
          durationInSeconds: parseInt(lessonDuration, 10) || 0,
          order: parseInt(lessonOrder, 10) || 1,
          isPreview: lessonIsPreview
        };
        const res = await updateCourseLesson(editingLesson._id, payload);
        if (res?.success) {
          toast.success(res?.message || 'Lesson updated successfully!');
          resetLessonForm();
          fetchSections();
        } else {
          toast.error(res?.message || 'Failed to update lesson.');
        }
      } else {
        const payload = {
          courseId,
          sectionId,
          title: lessonTitle.trim(),
          description: lessonDescription.trim(),
          videoUrl: lessonVideoUrl.trim(),
          videoId: lessonVideoId.trim(),
          durationInSeconds: parseInt(lessonDuration, 10) || 0,
          order: parseInt(lessonOrder, 10) || 1,
          isPreview: lessonIsPreview
        };
        const res = await createCourseLesson(payload);
        if (res?.success) {
          toast.success(res?.message || 'Lesson created successfully!');
          resetLessonForm();
          fetchSections();
        } else {
          toast.error(res?.message || 'Failed to create lesson.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    } finally {
      setLessonSubmitLoading(false);
    }
  };

  const handleLessonEditClick = (lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title || '');
    setLessonDescription(lesson.description || '');
    setLessonVideoUrl(lesson.videoUrl || lesson.youtubeUrl || '');
    setLessonVideoId(lesson.videoId || lesson.youtubeVideoId || '');
    setLessonDuration(String(lesson.durationInSeconds || 600));
    setLessonOrder(String(lesson.order ?? 1));
    setLessonIsPreview(!!lesson.isPreview);
  };

  const handleLessonDeleteClick = async (lessonId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this lesson?',
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
      const res = await deleteCourseLesson(lessonId);
      if (res?.success) {
        toast.success(res?.message || 'Lesson deleted successfully!');
        if (editingLesson?._id === lessonId) {
          resetLessonForm();
        }
        fetchSections();
      } else {
        toast.error(res?.message || 'Failed to delete lesson.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    }
  };

  const resetAttachmentForm = () => {
    setAddingAttachmentLessonId(null);
    setAddingAttachmentSectionId(null);
    setAttachmentType('OTHER');
    setAttachmentUrl('');
    setAttachmentDuration('60');
    setEditingAttachment(null);
  };

  const handleAttachmentEditClick = (attachment, lessonId) => {
    setAddingAttachmentLessonId(lessonId);
    setEditingAttachment(attachment);
    setAttachmentType(attachment.type || 'OTHER');
    setAttachmentUrl(attachment.url || '');
    setAttachmentDuration(String(attachment.duration || 60));
  };

  const handleAttachmentSubmit = async (e, sectionId, lessonId) => {
    e.preventDefault();
    if (!attachmentUrl.trim()) {
      toast.error('Please enter an attachment URL.');
      return;
    }

    setAttachmentSubmitLoading(true);
    try {
      if (editingAttachment) {
        const payload = {
          type: attachmentType,
          url: attachmentUrl.trim(),
          duration: parseInt(attachmentDuration, 10) || 0
        };
        const res = await updateCourseAttachment(editingAttachment._id, payload);
        if (res?.success) {
          toast.success(res?.message || 'Attachment updated successfully!');
          resetAttachmentForm();
          fetchSections();
        } else {
          toast.error(res?.message || 'Failed to update attachment.');
        }
      } else {
        const payload = {
          courseId,
          sectionId,
          type: attachmentType,
          url: attachmentUrl.trim(),
          duration: parseInt(attachmentDuration, 10) || 0
        };
        if (lessonId) {
          payload.lessonId = lessonId;
        }

        const res = await createCourseAttachment(payload);
        if (res?.success) {
          toast.success(res?.message || 'Attachment created successfully!');
          resetAttachmentForm();
          fetchSections();
        } else {
          toast.error(res?.message || 'Failed to create attachment.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    } finally {
      setAttachmentSubmitLoading(false);
    }
  };

  const handleAttachmentDeleteClick = async (attachmentId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this attachment?',
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
      const res = await deleteCourseAttachment(attachmentId);
      if (res?.success) {
        toast.success(res?.message || 'Attachment deleted successfully!');
        if (editingAttachment?._id === attachmentId) {
          resetAttachmentForm();
        }
        fetchSections();
      } else {
        toast.error(res?.message || 'Failed to delete attachment.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/educator/dashboard?tab=courses');
    }
  };

  return (
    <div className={`transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'} ${onBack ? 'p-0' : 'p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-gray-955'}`}>
      <div className={`${onBack ? 'w-full' : 'max-w-4xl mx-auto'} space-y-6`}>
        
        {/* Back navigation & Page Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer font-bold uppercase text-xs tracking-wider ${
              isDarkMode 
                ? 'bg-gray-900 border-white/5 text-gray-400 hover:text-white' 
                : 'bg-white border-gray-150 text-gray-550 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft size={14} /> Back to Courses
          </button>
          
          <div className="flex items-center gap-2.5 text-primary">
            <Layers size={18} />
            <span className="text-xs font-black uppercase tracking-wider">Manage Course Sections</span>
          </div>
        </div>

        {/* Course Banner */}
        <div className={`p-6 rounded-3xl border text-left ${
          isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <h2 className={`text-base sm:text-lg font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {course.title}
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase mt-1">Course ID: {courseId}</p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left">
          
          {/* Form Pane */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className={`p-5 rounded-3xl border sticky top-6 ${
              isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-150/50 shadow-sm'
            } space-y-4`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary">
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
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Section Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Overview, Advanced Techniques"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full text-xs font-bold px-3.5 py-3 rounded-xl border outline-none transition-all ${
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
                    className={`w-full text-xs font-bold px-3.5 py-3 rounded-xl border outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-950 border-white/5 focus:border-primary/50 text-white' 
                        : 'bg-white border-gray-200 focus:border-primary/50 text-gray-800'
                    }`}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitLoading}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-primary hover:bg-primary/95 text-white text-sm font-black uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20 active:scale-95 disabled:opacity-50"
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
          </div>

          {/* List Pane */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Sections List</h4>
            
            <div className="space-y-2.5">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={28} />
                </div>
              ) : sections.length > 0 ? (
                sections.map((section, idx) => {
                  const isExpanded = expandedSectionId === section._id;

                  return (
                    <div 
                      key={section._id} 
                      className={`rounded-2xl border transition-all ${
                        isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100 hover:border-gray-150 shadow-sm'
                      }`}
                    >
                      {/* Section Card Header */}
                      <div className="flex items-center justify-between p-4.5">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
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
                            onClick={() => handleToggleExpandSection(section._id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold uppercase transition-all cursor-pointer ${
                              isExpanded
                                ? 'bg-primary/10 border-primary/20 text-primary'
                                : isDarkMode
                                  ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                                  : 'bg-gray-50 border-gray-150 hover:bg-gray-100 text-gray-600'
                            }`}
                            title="Manage Lessons"
                          >
                            Lessons
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                          
                          <button
                            onClick={() => handleEditClick(section)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isDarkMode 
                                ? 'bg-white/5 border-white/5 text-gray-400 hover:text-primary hover:border-primary/30' 
                                : 'bg-gray-50 border-gray-100 text-gray-550 hover:text-primary hover:bg-primary/5 hover:border-primary/20'
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
                                : 'bg-gray-50 border-gray-100 text-gray-550 hover:text-red-650 hover:bg-red-50 hover:border-red-200'
                            }`}
                            title="Delete Section"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Section Card Lessons Body (Collapsible) */}
                      {isExpanded && (
                        <div className={`p-4.5 border-t ${isDarkMode ? 'border-white/5 bg-gray-955/45' : 'border-gray-100 bg-gray-50/50'} rounded-b-2xl space-y-4`}>
                          
                          {/* Section-level attachments list & form */}
                          <div className="space-y-2 border-b border-gray-100 dark:border-white/5 pb-4">
                            <div className="flex justify-between items-center">
                              <h5 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Section Attachments</h5>
                              <button 
                                onClick={() => setAddingAttachmentSectionId(addingAttachmentSectionId === section._id ? null : section._id)}
                                className="text-xs font-bold uppercase text-primary hover:underline cursor-pointer"
                              >
                                {addingAttachmentSectionId === section._id ? 'Cancel' : '+ Add Section Attachment'}
                              </button>
                            </div>
                            
                            {/* Section Attachments List */}
                            {attachments.filter(att => att.sectionId === section._id && !att.lessonId).length > 0 ? (
                              <div className="space-y-1.5">
                                {attachments.filter(att => att.sectionId === section._id && !att.lessonId).map(att => (
                                  <div key={att._id} className={`flex justify-between items-center p-2 rounded-lg text-xs font-semibold ${
                                    isDarkMode ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-50 text-zinc-600'
                                  }`}>
                                    <span>{att.type} • <a href={att.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{att.url}</a> ({att.duration}s)</span>
                                    <div className="flex items-center gap-1">
                                      <button 
                                        type="button"
                                        onClick={() => handleAttachmentEditClick(att, null)}
                                        className="p-1 text-gray-400 hover:text-primary transition-all cursor-pointer"
                                        title="Edit Attachment"
                                      >
                                        <Edit2 size={10} />
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => handleAttachmentDeleteClick(att._id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                                        title="Delete Attachment"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-zinc-400 uppercase">No section-level attachments yet.</p>
                            )}

                            {/* Section Attachment Form */}
                            {addingAttachmentSectionId === section._id && (
                              <form onSubmit={(e) => handleAttachmentSubmit(e, section._id, null)} className={`mt-2 p-3.5 rounded-lg border ${
                                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                              } space-y-2.5`}>
                                <span className="text-xs font-bold uppercase text-primary tracking-wider">{editingAttachment ? 'Edit Attachment Details' : 'Add Section Attachment'}</span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                  <div>
                                    <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Type</label>
                                    <select 
                                      value={attachmentType}
                                      onChange={(e) => setAttachmentType(e.target.value)}
                                      className={`w-full text-xs font-bold p-2 rounded-lg border outline-none ${
                                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                                      }`}
                                    >
                                      <option value="OTHER">OTHER</option>
                                      <option value="PDF">PDF</option>
                                      <option value="VIDEO">VIDEO</option>
                                      <option value="DOCUMENT">DOCUMENT</option>
                                    </select>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Attachment URL</label>
                                    <input 
                                      type="text" 
                                      placeholder="e.g. dropbox.com/my-resource"
                                      value={attachmentUrl}
                                      onChange={(e) => setAttachmentUrl(e.target.value)}
                                      className={`w-full text-xs font-bold p-2 rounded-lg border outline-none ${
                                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                                      }`}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                  <div>
                                    <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Duration (Seconds)</label>
                                    <input 
                                      type="number" 
                                      value={attachmentDuration}
                                      onChange={(e) => setAttachmentDuration(e.target.value)}
                                      className={`w-28 text-xs font-bold p-2 rounded-lg border outline-none ${
                                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                                      }`}
                                    />
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <button 
                                      type="button" 
                                      onClick={resetAttachmentForm}
                                      className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      type="submit" 
                                      disabled={attachmentSubmitLoading}
                                      className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                    >
                                      {attachmentSubmitLoading ? 'Saving...' : editingAttachment ? 'UPDATE' : 'ADD'}
                                    </button>
                                  </div>
                                </div>
                              </form>
                            )}
                          </div>

                          {/* Lessons list */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-black uppercase text-gray-400 tracking-wider">Lessons in this Section</h5>
                            {lessons.filter(lesson => lesson.sectionId === section._id).length > 0 ? (
                              <div className="space-y-1.5">
                                {lessons.filter(lesson => lesson.sectionId === section._id).map((lesson) => (
                                  <div 
                                    key={lesson._id}
                                    className={`p-3 rounded-xl border text-xs ${
                                      isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-white border-gray-200/60 shadow-sm'
                                    } space-y-2`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-xs">#{lesson.order}</span>
                                          <p className="font-bold text-zinc-800 dark:text-zinc-200">{lesson.title}</p>
                                          {lesson.isPreview && (
                                            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Preview</span>
                                          )}
                                        </div>
                                        <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">
                                          Duration: {Math.floor(lesson.durationInSeconds / 60)}m {lesson.durationInSeconds % 60}s • Video ID: {lesson.videoId || lesson.youtubeVideoId || 'None'}
                                        </p>
                                        {lesson.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{lesson.description}</p>}
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => setAddingAttachmentLessonId(addingAttachmentLessonId === lesson._id ? null : lesson._id)}
                                          className={`p-1.5 rounded border transition-all cursor-pointer ${
                                            isDarkMode ? 'bg-white/5 border-white/5 text-gray-400 hover:text-primary' : 'bg-gray-50 border-gray-100 text-gray-555 hover:text-primary'
                                          }`}
                                          title="Add Attachment"
                                        >
                                          <Paperclip size={11} />
                                        </button>
                                        <button
                                          onClick={() => handleLessonEditClick(lesson)}
                                          className={`p-1.5 rounded border transition-all cursor-pointer ${
                                            isDarkMode ? 'bg-white/5 border-white/5 text-gray-400 hover:text-primary' : 'bg-gray-50 border-gray-100 text-gray-550 hover:text-primary'
                                          }`}
                                          title="Edit Lesson"
                                        >
                                          <Edit2 size={11} />
                                        </button>
                                        <button
                                          onClick={() => handleLessonDeleteClick(lesson._id)}
                                          className={`p-1.5 rounded border transition-all cursor-pointer ${
                                            isDarkMode ? 'bg-white/5 border-white/5 text-gray-400 hover:text-red-500' : 'bg-gray-50 border-gray-100 text-gray-550 hover:text-red-655'
                                          }`}
                                          title="Delete Lesson"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Render Attachments of this Lesson */}
                                    {attachments.filter(att => att.lessonId === lesson._id).length > 0 && (
                                      <div className="mt-2 space-y-1.5 pl-4 border-l border-primary/20">
                                        <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Attachments:</span>
                                        {attachments.filter(att => att.lessonId === lesson._id).map(att => (
                                          <div key={att._id} className={`flex justify-between items-center p-2 rounded-lg text-xs font-semibold ${
                                            isDarkMode ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-50 text-zinc-600'
                                          }`}>
                                            <span>{att.type} • <a href={att.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{att.url}</a> ({att.duration}s)</span>
                                            <div className="flex items-center gap-1">
                                              <button 
                                                type="button"
                                                onClick={() => handleAttachmentEditClick(att, lesson._id)}
                                                className="p-1 text-gray-400 hover:text-primary transition-all cursor-pointer"
                                                title="Edit Attachment"
                                              >
                                                <Edit2 size={10} />
                                              </button>
                                              <button 
                                                type="button"
                                                onClick={() => handleAttachmentDeleteClick(att._id)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                                                title="Delete Attachment"
                                              >
                                                <Trash2 size={10} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Add Attachment Form */}
                                    {addingAttachmentLessonId === lesson._id && (
                                      <form onSubmit={(e) => handleAttachmentSubmit(e, section._id, lesson._id)} className={`mt-2 p-3.5 rounded-lg border ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                                      } space-y-2.5`}>
                                        <span className="text-xs font-bold uppercase text-primary tracking-wider">{editingAttachment ? 'Edit Attachment Details' : 'Add Attachment'}</span>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                          <div>
                                            <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Type</label>
                                            <select 
                                              value={attachmentType}
                                              onChange={(e) => setAttachmentType(e.target.value)}
                                              className={`w-full text-xs font-bold p-2 rounded-lg border outline-none ${
                                                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                                              }`}
                                            >
                                              <option value="OTHER">OTHER</option>
                                              <option value="PDF">PDF</option>
                                              <option value="VIDEO">VIDEO</option>
                                              <option value="DOCUMENT">DOCUMENT</option>
                                            </select>
                                          </div>
                                          <div className="sm:col-span-2">
                                            <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Attachment URL</label>
                                            <input 
                                              type="text" 
                                              placeholder="e.g. dropbox.com/my-resource"
                                              value={attachmentUrl}
                                              onChange={(e) => setAttachmentUrl(e.target.value)}
                                              className={`w-full text-xs font-bold p-2 rounded-lg border outline-none ${
                                                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                                              }`}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                          <div>
                                            <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Duration (Seconds)</label>
                                            <input 
                                              type="number" 
                                              value={attachmentDuration}
                                              onChange={(e) => setAttachmentDuration(e.target.value)}
                                              className={`w-28 text-xs font-bold p-2 rounded-lg border outline-none ${
                                                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                                              }`}
                                            />
                                          </div>
                                          <div className="flex gap-2 mt-2">
                                            <button 
                                              type="button" 
                                              onClick={resetAttachmentForm}
                                              className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
                                            >
                                              Cancel
                                            </button>
                                            <button 
                                              type="submit" 
                                              disabled={attachmentSubmitLoading}
                                              className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                            >
                                              {attachmentSubmitLoading ? 'Saving...' : editingAttachment ? 'UPDATE' : 'ADD'}
                                            </button>
                                          </div>
                                        </div>
                                      </form>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm font-bold text-gray-400 uppercase py-2">No lessons in this section yet.</p>
                            )}
                          </div>

                          {/* Lesson form */}
                          <form onSubmit={(e) => handleLessonSubmit(e, section._id)} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} space-y-3`}>
                            <h5 className="text-xs font-bold uppercase text-primary tracking-wider">
                              {editingLesson ? 'Edit Lesson Details' : 'Add New Lesson'}
                            </h5>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Lesson Title</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. Skin Prep Basics"
                                  value={lessonTitle}
                                  onChange={(e) => setLessonTitle(e.target.value)}
                                  className={`w-full text-xs font-bold px-3 py-2 rounded-lg border outline-none transition-all ${
                                    isDarkMode 
                                      ? 'bg-zinc-950 border-zinc-800 focus:border-primary/50 text-white' 
                                      : 'bg-zinc-50 border-zinc-200 focus:border-primary/50 text-zinc-800'
                                  }`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Display Order</label>
                                <input 
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  value={lessonOrder}
                                  onChange={(e) => setLessonOrder(e.target.value)}
                                  className={`w-full text-xs font-bold px-3 py-2 rounded-lg border outline-none transition-all ${
                                    isDarkMode 
                                      ? 'bg-zinc-950 border-zinc-800 focus:border-primary/50 text-white' 
                                      : 'bg-zinc-50 border-zinc-200 focus:border-primary/50 text-zinc-800'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Description</label>
                              <textarea 
                                placeholder="Explain what students will learn in this lesson..."
                                value={lessonDescription}
                                onChange={(e) => setLessonDescription(e.target.value)}
                                rows={2}
                                className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border outline-none transition-all resize-none ${
                                  isDarkMode 
                                    ? 'bg-zinc-950 border-zinc-800 focus:border-primary/50 text-white' 
                                    : 'bg-zinc-50 border-zinc-200 focus:border-primary/50 text-zinc-800'
                                }`}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Video URL</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                                  value={lessonVideoUrl}
                                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                                  className={`w-full text-xs font-bold px-3 py-2 rounded-lg border outline-none transition-all ${
                                    isDarkMode 
                                      ? 'bg-zinc-950 border-zinc-800 focus:border-primary/50 text-white' 
                                      : 'bg-zinc-50 border-zinc-200 focus:border-primary/50 text-zinc-800'
                                  }`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Video ID</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. mv82MM1rU_g"
                                  value={lessonVideoId}
                                  onChange={(e) => setLessonVideoId(e.target.value)}
                                  className={`w-full text-xs font-bold px-3 py-2 rounded-lg border outline-none transition-all ${
                                    isDarkMode 
                                      ? 'bg-zinc-950 border-zinc-800 focus:border-primary/50 text-white' 
                                      : 'bg-zinc-50 border-zinc-200 focus:border-primary/50 text-zinc-800'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-2">
                              <div className="flex items-center gap-3">
                                <div className="space-y-1">
                                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider">Duration (Seconds)</label>
                                  <input 
                                    type="number"
                                    min="0"
                                    placeholder="600"
                                    value={lessonDuration}
                                    onChange={(e) => setLessonDuration(e.target.value)}
                                    className={`w-24 text-xs font-bold px-3 py-1.5 rounded-lg border outline-none transition-all ${
                                      isDarkMode 
                                        ? 'bg-gray-955 border-white/5 focus:border-primary/50 text-white' 
                                        : 'bg-gray-55 border-gray-200 focus:border-primary/50 text-gray-800'
                                    }`}
                                  />
                                </div>

                                <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                                  <input 
                                    type="checkbox"
                                    checked={lessonIsPreview}
                                    onChange={(e) => setLessonIsPreview(e.target.checked)}
                                    className="accent-primary w-3.5 h-3.5 cursor-pointer"
                                  />
                                  <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Free Preview</span>
                                </label>
                              </div>

                              <div className="flex items-center gap-2">
                                {editingLesson && (
                                  <button
                                    type="button"
                                    onClick={resetLessonForm}
                                    className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  type="submit"
                                  disabled={lessonSubmitLoading}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                  {lessonSubmitLoading ? (
                                    <Loader2 size={10} className="animate-spin" />
                                  ) : editingLesson ? (
                                    <Edit2 size={10} />
                                  ) : (
                                    <Plus size={10} />
                                  )}
                                  {editingLesson ? 'Save Lesson' : 'Add Lesson'}
                                </button>
                              </div>
                            </div>
                          </form>

                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={`p-12 text-center rounded-3xl border ${
                  isDarkMode ? 'border-white/5 bg-gray-900' : 'border-gray-100 bg-white shadow-sm'
                }`}>
                  <BookOpen size={24} className="mx-auto mb-3 text-gray-400" />
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

export default ManageSections;
