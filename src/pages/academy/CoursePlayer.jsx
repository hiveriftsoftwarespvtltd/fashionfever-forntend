import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ChevronLeft, 
  Clock, 
  Globe, 
  BookOpen,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lock,
  Video,
  Award,
  MessageSquare,
  Send,
  Star,
  Trash2,
  Pencil
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  getUserCourseDetails,
  getCourseSectionsList,
  getCourseLessonsListBySection,
  getCourseAttachmentsListByCourse,
  purchaseCourse,
  enrollCourse,
  updateCourseProgress,
  createCourseComment,
  getCourseCommentsList,
  createCourseCommentReply,
  getCourseCommentRepliesList,
  createCourseReview,
  updateCourseReview,
  getCourseReviewsList,
  deleteCourseReview
} from '../../api/educatorService';
import { useUser } from '../../context/UserContext';
import { toast } from '../../utils/toast';
import config from '../../config/config';
import { getImageUrl } from '../../utils/imageUrl';

const CoursePlayer = () => {
  const { id } = useParams();
  const { user } = useUser();
  
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [attachments, setAttachments] = useState([]);
  
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [expandedSectionIds, setExpandedSectionIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isEnrolledLocal, setIsEnrolledLocal] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Tabs within course player left card
  const [activePlayerTab, setActivePlayerTab] = useState('about'); // 'about', 'comments', 'reviews'

  // Comments states
  const [commentsList, setCommentsList] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reply states
  const [repliesMap, setRepliesMap] = useState({}); // key: commentId, value: array of reply objects
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Reviews states
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const getThumbnailUrl = (courseItem) => {
    if (!courseItem) return '';
    const thumbnail = courseItem.thumbnail;
    if (!thumbnail) return '';

    // Check if thumbnail is a populated object
    if (thumbnail.url && typeof thumbnail.url === 'string') {
      return getImageUrl(thumbnail.url);
    }
    
    // Check if thumbnail is a direct URL string or base64 data
    if (typeof thumbnail === 'string') {
      if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://') || thumbnail.startsWith('data:')) {
        return getImageUrl(thumbnail);
      }
      // If it looks like a Mongo ID or filename, resolve via backend file retrieval route
      return `${config.API_URL}/file/get-file/${thumbnail}`;
    }
    
    return '';
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-pink-500 to-rose-500 text-white',
      'from-purple-500 to-indigo-500 text-white',
      'from-blue-500 to-cyan-500 text-white',
      'from-teal-500 to-emerald-500 text-white',
      'from-amber-500 to-orange-500 text-white',
      'from-fuchsia-500 to-pink-500 text-white'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const fetchComments = async () => {
    if (!activeLessonId) return;
    setCommentsLoading(true);
    try {
      const res = await getCourseCommentsList(activeLessonId);
      if (res?.success) {
        const comments = res.data || [];
        setCommentsList(comments);

        // Fetch replies for each parent comment in parallel using getCourseCommentRepliesList
        const parentCommentsOnly = comments.filter(c => !c.parentId);
        const repliesPromises = parentCommentsOnly.map(async (c) => {
          try {
            const repliesRes = await getCourseCommentRepliesList(c._id);
            if (repliesRes?.success) {
              return { commentId: c._id, replies: repliesRes.data || [] };
            }
          } catch (err) {
            console.error(`Error fetching replies for comment ${c._id}:`, err);
          }
          return { commentId: c._id, replies: [] };
        });

        const repliesResults = await Promise.all(repliesPromises);
        const nextRepliesMap = {};
        repliesResults.forEach(item => {
          nextRepliesMap[item.commentId] = item.replies;
        });
        setRepliesMap(nextRepliesMap);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await getCourseReviewsList(id);
      if (res?.success) {
        setReviewsList(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // Fetch course details, sections, and attachments in parallel
        const [courseRes, secRes, attRes] = await Promise.all([
          getUserCourseDetails(id),
          getCourseSectionsList(id),
          getCourseAttachmentsListByCourse(id)
        ]);

        if (courseRes?.success) {
          const courseData = courseRes.data?.data || courseRes.data || null;
          setCourse(courseData);
          if (courseData?.isEnrolled || courseData?.isPurchased || courseData?.isFree) {
            setIsEnrolledLocal(true);
            
            // Extract initial progress if present
            const enrollment = courseData?.enrollment || courseData?.enrollmentDetails || courseData;
            if (enrollment) {
              if (typeof enrollment.progressPercentage === 'number') {
                setProgressPercentage(enrollment.progressPercentage);
              }
              if (Array.isArray(enrollment.completedLessons)) {
                setCompletedLessonIds(new Set(enrollment.completedLessons));
              }
            }
          }
        } else {
          toast.error(courseRes?.message || 'Failed to fetch course details');
        }

        let loadedSections = [];
        let loadedLessons = [];
        let loadedAttachments = [];

        if (secRes?.success) {
          loadedSections = secRes.data?.data || secRes.data || [];
          if (Array.isArray(loadedSections)) {
            setSections(loadedSections);
            setExpandedSectionIds(new Set());

            // Fetch lessons for each section in parallel
            const lessonsPromises = loadedSections.map(sec => getCourseLessonsListBySection(sec._id));
            const lessonsResponses = await Promise.all(lessonsPromises);
            lessonsResponses.forEach(res => {
              if (res?.success) {
                const list = res.data?.data || res.data || [];
                if (Array.isArray(list)) {
                  loadedLessons.push(...list);
                }
              }
            });
            setLessons(loadedLessons);
          }
        }

        if (attRes?.success) {
          loadedAttachments = attRes.data?.data || attRes.data || [];
          if (Array.isArray(loadedAttachments)) {
            setAttachments(loadedAttachments);
          }
        }

        // Set the first lesson as active by default
        if (loadedLessons.length > 0) {
          const sorted = [...loadedLessons].sort((a, b) => (a.order || 0) - (b.order || 0));
          setActiveLessonId(sorted[0]._id);
        }
      } catch (err) {
        console.error('Error loading course player:', err);
        toast.error('Could not load course data');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
    fetchReviews();
  }, [id]);

  // Load comments when active lesson or active tab changes
  useEffect(() => {
    if (activeLessonId && activePlayerTab === 'comments') {
      fetchComments();
    }
  }, [activeLessonId, activePlayerTab]);

  const toggleSection = (sectionId) => {
    setExpandedSectionIds(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleEnroll = () => {
    Swal.fire({
      title: 'Enroll in Course',
      text: `Do you want to enroll in "${course.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#fe3e6a',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, enroll me!',
      customClass: {
        popup: 'rounded-2xl font-outfit'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.showLoading();
          
          let response;
          if (course.isFree) {
            response = await enrollCourse({ courseId: id });
          } else {
            response = await purchaseCourse({
              courseId: id,
              paymentMethod: 'Wallet'
            });
          }

          if (response?.success) {
            setIsEnrolledLocal(true);
            Swal.fire({
              title: 'Enrolled Successfully!',
              text: response.message || response.data?.message || 'You now have full access to this course.',
              icon: 'success',
              confirmButtonColor: '#fe3e6a',
              customClass: {
                popup: 'rounded-2xl font-outfit'
              }
            });
          } else {
            Swal.fire({
              title: 'Enrollment Failed',
              text: response?.message || 'Failed to complete course purchase.',
              icon: 'error',
              confirmButtonColor: '#fe3e6a',
              customClass: {
                popup: 'rounded-2xl font-outfit'
              }
            });
          }
        } catch (err) {
          console.error('Enrollment error:', err);
          Swal.fire({
            title: 'Error',
            text: 'An error occurred during enrollment. Please try again.',
            icon: 'error',
            confirmButtonColor: '#fe3e6a',
            customClass: {
              popup: 'rounded-2xl font-outfit'
            }
          });
        }
      }
    });
  };

  const handleToggleLessonCompletion = async (lessonId) => {
    if (!lessonId || updatingProgress) return;
    
    const isCompleted = !completedLessonIds.has(lessonId);
    
    try {
      setUpdatingProgress(true);
      const targetLesson = lessons.find(l => l._id === lessonId);
      const watchedDuration = targetLesson?.durationInSeconds || 600;
      
      const response = await updateCourseProgress({
        courseId: id,
        lessonId,
        isCompleted,
        watchedDurationInSeconds: watchedDuration
      });

      if (response?.success) {
        const progressData = response.data?.data || response.data || {};
        setProgressPercentage(progressData.progressPercentage ?? progressPercentage);
        
        setCompletedLessonIds(prev => {
          const next = new Set(prev);
          if (isCompleted) {
            next.add(lessonId);
          } else {
            next.delete(lessonId);
          }
          return next;
        });

        toast.success(response.message || 'Lesson progress updated successfully!');
      } else {
        toast.error(response?.message || 'Failed to update progress.');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Could not update progress.');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || submittingComment || !activeLesson) return;

    setSubmittingComment(true);
    try {
      const payload = {
        courseId: id,
        courseSectionId: activeLesson.sectionId,
        courseLessonId: activeLesson._id,
        comment: newCommentText.trim()
      };
      const res = await createCourseComment(payload);
      if (res?.success) {
        setNewCommentText('');
        toast.success('Comment posted successfully!');
        fetchComments();
      } else {
        toast.error(res?.message || 'Failed to post comment.');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePostReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim() || submittingReply || !activeLesson) return;

    setSubmittingReply(true);
    try {
      const payload = {
        courseId: id,
        courseSectionId: activeLesson.sectionId,
        courseLessonId: activeLesson._id,
        comment: replyText.trim(),
        parentId
      };
      const res = await createCourseCommentReply(payload);
      if (res?.success) {
        setReplyText('');
        setReplyingCommentId(null);
        toast.success('Reply posted successfully!');
        fetchComments();
      } else {
        toast.error(res?.message || 'Failed to post reply.');
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (submittingReview || !newReviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const payload = {
        courseId: id,
        review: newReviewText.trim(),
        rating: newReviewRating
      };
      const res = await createCourseReview(payload);
      if (res?.success) {
        setNewReviewText('');
        setNewReviewRating(5);
        toast.success('Review submitted successfully!');
        fetchReviews();
      } else {
        toast.error(res?.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReviewSwal = (reviewItem) => {
    Swal.fire({
      title: 'Edit Your Review',
      html: `
        <div class="text-left space-y-4 font-outfit text-sm">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Rating (1-5)</label>
            <select id="swal-review-rating" class="w-full px-3 py-2 border rounded-xl outline-none focus:border-primary">
              <option value="5" ${reviewItem.rating === 5 ? 'selected' : ''}>5 Stars - Excellent</option>
              <option value="4" ${reviewItem.rating === 4 ? 'selected' : ''}>4 Stars - Good</option>
              <option value="3" ${reviewItem.rating === 3 ? 'selected' : ''}>3 Stars - Average</option>
              <option value="2" ${reviewItem.rating === 2 ? 'selected' : ''}>2 Stars - Poor</option>
              <option value="1" ${reviewItem.rating === 1 ? 'selected' : ''}>1 Star - Very Bad</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Your Review</label>
            <textarea id="swal-review-text" rows="3" class="w-full px-3 py-2 border rounded-xl outline-none focus:border-primary resize-none">${reviewItem.review}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#fe3e6a',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Update Review',
      customClass: {
        popup: 'rounded-2xl font-outfit'
      },
      preConfirm: () => {
        const ratingVal = parseInt(document.getElementById('swal-review-rating').value);
        const reviewTextVal = document.getElementById('swal-review-text').value;
        if (!reviewTextVal.trim()) {
          Swal.showValidationMessage('Please write a review message');
          return false;
        }
        return { rating: ratingVal, review: reviewTextVal.trim() };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.showLoading();
          const res = await updateCourseReview(reviewItem._id, result.value);
          if (res?.success) {
            Swal.fire({
              title: 'Updated!',
              text: 'Your review has been updated.',
              icon: 'success',
              confirmButtonColor: '#fe3e6a',
              customClass: { popup: 'rounded-2xl font-outfit' }
            });
            fetchReviews();
          } else {
            Swal.fire({
              title: 'Failed',
              text: res?.message || 'Failed to update review.',
              icon: 'error',
              confirmButtonColor: '#fe3e6a',
              customClass: { popup: 'rounded-2xl font-outfit' }
            });
          }
        } catch (err) {
          console.error('Error updating review:', err);
          Swal.fire({
            title: 'Error',
            text: 'An error occurred. Please try again.',
            icon: 'error',
            confirmButtonColor: '#fe3e6a',
            customClass: { popup: 'rounded-2xl font-outfit' }
          });
        }
      }
    });
  };

  const handleDeleteReviewSwal = (reviewId) => {
    Swal.fire({
      title: 'Delete Review',
      text: 'Are you sure you want to delete your review? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fe3e6a',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-2xl font-outfit'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.showLoading();
          const res = await deleteCourseReview(reviewId);
          if (res?.success) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your review has been deleted.',
              icon: 'success',
              confirmButtonColor: '#fe3e6a',
              customClass: { popup: 'rounded-2xl font-outfit' }
            });
            fetchReviews();
          } else {
            Swal.fire({
              title: 'Failed',
              text: res?.message || 'Failed to delete review.',
              icon: 'error',
              confirmButtonColor: '#fe3e6a',
              customClass: { popup: 'rounded-2xl font-outfit' }
            });
          }
        } catch (err) {
          console.error('Error deleting review:', err);
          Swal.fire({
            title: 'Error',
            text: 'An error occurred. Please try again.',
            icon: 'error',
            confirmButtonColor: '#fe3e6a',
            customClass: { popup: 'rounded-2xl font-outfit' }
          });
        }
      }
    });
  };

  const activeLesson = lessons.find(l => l._id === activeLessonId) || lessons[0];
  const activeLessonAttachments = activeLesson ? attachments.filter(a => a.lessonId === activeLesson._id) : [];
  const activeSectionAttachments = activeLesson ? attachments.filter(a => a.sectionId === activeLesson.sectionId && !a.lessonId) : [];

  // Filter parent comments only
  const parentCommentsOnly = commentsList.filter(c => !c.parentId);
  const totalDiscussionCount = parentCommentsOnly.length + Object.values(repliesMap).reduce((acc, curr) => acc + curr.length, 0);

  const getYouTubeEmbedUrl = (lesson) => {
    if (!lesson) return null;
    
    // Prioritize extracting a valid 11-character video ID from the URL if present
    const urlToParse = lesson.youtubeUrl || lesson.videoUrl;
    let parsedVideoId = null;
    if (urlToParse) {
      const match = urlToParse.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]+)/);
      if (match && match[1] && match[1].trim().length === 11) {
        parsedVideoId = match[1].trim();
      }
    }

    const videoId = parsedVideoId || lesson.youtubeVideoId || lesson.videoId;
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : null;
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={12} 
            className={star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-outfit text-gray-650">
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <span className="text-xs font-semibold uppercase tracking-wider">Loading...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-outfit p-8 text-center text-gray-500">
        <BookOpen size={48} className="text-gray-300 mb-3" />
        <p className="font-bold text-sm uppercase">Course not found.</p>
        <Link to="/academy" className="text-primary hover:underline text-xs font-semibold mt-2">Back to Catalog</Link>
      </div>
    );
  }

  // --- DUAL MODE RENDERING ---

  // MODE A: Course Landing / Details Page (If NOT enrolled/purchased)
  if (!isEnrolledLocal) {
    return (
      <div className="min-h-screen bg-gray-50 font-outfit text-left text-gray-800 pb-24">
        {/* Banner header (Light, simple, decent) */}
        <div className="bg-white border-b border-gray-150 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/academy" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-primary transition-all uppercase mb-4">
              <ChevronLeft size={18} /> Back to Catalog
            </Link>
            
            <div className="space-y-3">
              <span className="bg-primary/10 text-primary border border-primary/20 text-xs sm:text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                {course.categoryId?.label || course.categoryId?.name || 'Academy'}
              </span>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {course.title}
              </h1>
              
              {course.subtitle && (
                <p className="text-base text-gray-600 font-medium">{course.subtitle}</p>
              )}

              <div className="flex flex-wrap gap-5 pt-2 text-sm font-bold text-gray-600 uppercase tracking-wide">
                <div className="flex items-center gap-1.5"><Globe size={15} className="text-primary" /> {course.language}</div>
                <div className="flex items-center gap-1.5"><Clock size={15} className="text-primary" /> {course.totalDurationInMinutes || 0} Mins</div>
                <div className="flex items-center gap-1.5"><BookOpen size={15} className="text-primary" /> {course.level}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main details */}
            <div className="lg:col-span-8 space-y-8">
              {/* About Course */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">About This Course</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">{course.description}</p>
              </div>

              {/* Syllabus list */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Course Curriculum</h3>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{sections.length} Sections • {lessons.length} Lessons</span>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {sections.length === 0 ? (
                    <div className="py-6 text-center text-gray-450 text-sm font-semibold">No lessons added yet.</div>
                  ) : (
                    sections.map((section, sIdx) => {
                      const sectionLessons = lessons.filter(l => l.sectionId === section._id);
                      return (
                        <div key={section._id} className="py-4 first:pt-0 last:pb-0">
                          <h4 className="text-sm font-bold text-gray-900 uppercase flex items-center justify-between">
                            <span>Section {sIdx + 1}: {section.title}</span>
                            <span className="text-xs font-semibold text-gray-500 normal-case">
                              {section.totalVideos || 0} Videos • {section.totalAttachments || 0} Attachments
                            </span>
                          </h4>
                          
                          <div className="mt-2.5 space-y-2 pl-4">
                            {sectionLessons.map((lesson) => (
                              <div key={lesson._id} className="flex items-center justify-between text-sm text-gray-700 font-medium py-1">
                                <div className="flex items-center gap-2.5">
                                  <Lock size={14} className="text-gray-400" />
                                  <span>{lesson.title}</span>
                                </div>
                                <span className="text-xs text-gray-500 font-semibold">
                                  {lesson.durationInSeconds ? `${Math.floor(lesson.durationInSeconds / 60)}m` : '10m'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Student Reviews list inside MODE A (Landing Page) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Student Feedback</h3>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {reviewsList.length} Reviews • {reviewsList.length > 0
                      ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
                      : '0.0'} ★
                  </span>
                </div>

                {reviewsList.length === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-sm font-semibold uppercase">No reviews yet for this course.</div>
                ) : (
                  <div className="space-y-4 divide-y divide-gray-100">
                    {reviewsList.map((reviewItem, rIdx) => {
                      const reviewUserName = reviewItem.userId?.name || 'Student';
                      const reviewInitial = reviewUserName.charAt(0).toUpperCase();
                      const reviewAvatarGrad = getAvatarGradient(reviewUserName);
                      return (
                        <div key={reviewItem._id} className={`flex gap-3.5 text-sm leading-relaxed ${rIdx > 0 ? 'pt-4' : ''}`}>
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${reviewAvatarGrad} flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs`}>
                            {reviewInitial}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-gray-900 text-sm block">{reviewUserName}</span>
                                <div className="mt-0.5">
                                  {renderStars(reviewItem.rating)}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 font-semibold">
                                {new Date(reviewItem.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 font-normal text-sm leading-relaxed mt-1">{reviewItem.review}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sticky Sidebar purchase card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Thumbnail / Placeholder */}
                <div className="aspect-[16/10] bg-gray-100 relative border-b border-gray-150 flex items-center justify-center">
                  {getThumbnailUrl(course) ? (
                    <img src={getThumbnailUrl(course)} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <Play size={28} className="text-primary opacity-60" />
                  )}
                </div>

                <div className="p-6 space-y-5">
                  {/* Price Block */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Course Fee</span>
                    <div className="flex items-baseline gap-2">
                      {course.isFree ? (
                        <span className="text-2xl font-black text-emerald-600">FREE</span>
                      ) : (
                        <>
                          <span className="text-2xl font-black text-gray-900">₹{course.sellingPrice}</span>
                          {course.offeredPrice > course.sellingPrice && (
                            <span className="text-sm font-semibold text-gray-400 line-through">₹{course.offeredPrice}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Enrollment Button */}
                  <button 
                    onClick={handleEnroll}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-95 text-center"
                  >
                    Enroll & Start Learning
                  </button>

                  {/* Bullet features */}
                  <div className="space-y-3 pt-4 border-t border-gray-100 text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2.5"><Video size={16} className="text-primary" /> Full Video Masterclass</div>
                    <div className="flex items-center gap-2.5"><Clock size={16} className="text-primary" /> {course.totalDurationInMinutes || 0} Mins Content</div>
                    <div className="flex items-center gap-2.5"><FileText size={16} className="text-primary" /> References & Attachments</div>
                    <div className="flex items-center gap-2.5"><Award size={16} className="text-primary" /> Completion Certification</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MODE B: Enrolled Course Player Page (Clean grid layout matching catalog)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-left font-outfit text-gray-800">
      
      {/* Header (Clean & Simple) */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <Link to="/academy" className="text-gray-500 hover:text-gray-900 transition-all">
               <ChevronLeft size={22} />
            </Link>
            <div>
               <h1 className="text-xs font-bold text-primary uppercase tracking-wider">Academy Player</h1>
               <p className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1">{course.title}</p>
            </div>
         </div>
      </header>

      {/* Main Content Layout (Two columns grid on desktop, responsive & simple) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Video player & Lesson detail card (col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Video Player Card */}
            <div className="bg-black rounded-2xl border border-gray-200 overflow-hidden shadow-sm aspect-video relative flex items-center justify-center">
              {getYouTubeEmbedUrl(activeLesson) ? (
                <iframe 
                  className="w-full h-full border-none"
                  src={getYouTubeEmbedUrl(activeLesson)}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8">
                  <Play size={32} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">No video available for this lesson.</p>
                </div>
              )}
            </div>

            {/* Active Lesson details & Discussion Board Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5 shadow-sm">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">Active Lesson</span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                   {activeLesson ? activeLesson.title : 'No Lesson Selected'}
                </h2>
              </div>

              {/* Sub tabs inside the lesson card */}
              <div className="flex border-b border-gray-150 gap-6 mt-2">
                <button
                  onClick={() => setActivePlayerTab('about')}
                  className={`pb-2.5 text-sm font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                    activePlayerTab === 'about' ? 'text-primary font-black' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  About & Resources
                  {activePlayerTab === 'about' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in duration-300" />
                  )}
                </button>
                <button
                  onClick={() => setActivePlayerTab('comments')}
                  className={`pb-2.5 text-sm font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                    activePlayerTab === 'comments' ? 'text-primary font-black' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Discussion ({totalDiscussionCount})
                  {activePlayerTab === 'comments' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in duration-300" />
                  )}
                </button>
                <button
                  onClick={() => setActivePlayerTab('reviews')}
                  className={`pb-2.5 text-sm font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                    activePlayerTab === 'reviews' ? 'text-primary font-black' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Reviews ({reviewsList.length})
                  {activePlayerTab === 'reviews' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in duration-300" />
                  )}
                </button>
              </div>

              {/* Tab Panels */}
              {activePlayerTab === 'about' ? (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {activeLesson?.description && (
                     <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                        {activeLesson.description}
                     </p>
                  )}

                  {activeLesson && (
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => handleToggleLessonCompletion(activeLesson._id)}
                        disabled={updatingProgress}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold uppercase transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 ${
                          completedLessonIds.has(activeLesson._id)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-55'
                        }`}
                      >
                        {completedLessonIds.has(activeLesson._id) ? (
                          <>Completed ✓</>
                        ) : (
                          <>Mark as Completed</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Reference Attachments */}
                  {(activeLessonAttachments.length > 0 || activeSectionAttachments.length > 0) && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Reference Attachments</h4>
                      
                      {/* Lesson Resources */}
                      {activeLessonAttachments.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-gray-600 uppercase block">Lesson Resources</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeLessonAttachments.map(att => (
                              <a 
                                key={att._id}
                                href={att.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-800 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                              >
                                <span className="truncate pr-4">{att.type} • {att.url}</span>
                                <span className="text-xs text-gray-600 bg-gray-200/70 px-2 py-0.5 rounded font-semibold">{att.duration}s</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section Resources */}
                      {activeSectionAttachments.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-gray-600 uppercase block">Section Resources</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeSectionAttachments.map(att => (
                              <a 
                                key={att._id}
                                href={att.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-800 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                              >
                                <span className="truncate pr-4">{att.type} • {att.url}</span>
                                <span className="text-xs text-gray-600 bg-gray-200/70 px-2 py-0.5 rounded font-semibold">{att.duration}s</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activePlayerTab === 'comments' ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Create Comment Form - Premium Design */}
                  <form onSubmit={handlePostComment} className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-150 transition-all hover:border-gray-200">
                    <textarea
                      required
                      rows={2}
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      placeholder="Ask a question or share your thoughts on this lesson..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-250 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none bg-white text-gray-800 placeholder:text-gray-400"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingComment || !newCommentText.trim()}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Post Comment
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  {commentsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Loader2 className="animate-spin text-primary mb-2" size={28} />
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Loading discussion thread...</p>
                    </div>
                  ) : parentCommentsOnly.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-gray-255 rounded-2xl bg-gray-50/30">
                      <MessageSquare size={36} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">No discussion yet</p>
                      <p className="text-sm text-gray-500 mt-1">Be the first to comment on this lesson!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                      {parentCommentsOnly.map(commentItem => {
                        const userName = commentItem.userId?.name || 'Student';
                        const initial = userName.charAt(0).toUpperCase();
                        const isReplying = replyingCommentId === commentItem._id;
                        const replies = repliesMap[commentItem._id] || [];
                        const avatarGrad = getAvatarGradient(userName);
                        
                        return (
                          <div key={commentItem._id} className="p-4 rounded-2xl bg-white border border-gray-150 hover:shadow-xs transition-all duration-300">
                            <div className="flex items-start gap-3.5 text-sm leading-relaxed">
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatarGrad} flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm`}>
                                {initial}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-900 text-sm">{userName}</span>
                                  <span className="text-xs text-gray-500 font-semibold">
                                    {new Date(commentItem.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-gray-800 font-normal text-sm leading-relaxed mt-1">{commentItem.comment}</p>
                                
                                <button
                                  onClick={() => {
                                    if (isReplying) {
                                      setReplyingCommentId(null);
                                      setReplyText('');
                                    } else {
                                      setReplyingCommentId(commentItem._id);
                                      setReplyText('');
                                    }
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider hover:underline mt-2 focus:outline-none cursor-pointer"
                                >
                                  <MessageSquare size={13} />
                                  {isReplying ? 'Cancel' : 'Reply'}
                                </button>
                              </div>
                            </div>

                            {/* Reply Input Form */}
                            {isReplying && (
                              <form onSubmit={(e) => handlePostReply(e, commentItem._id)} className="mt-3 ml-12 flex gap-2 items-center animate-in slide-in-from-top-2 duration-200 bg-gray-55/50 p-2.5 rounded-xl border border-gray-150">
                                <textarea
                                  required
                                  rows={1}
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="flex-1 px-3 py-2 rounded-xl border border-gray-250 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none bg-white text-gray-800"
                                />
                                <button
                                  type="submit"
                                  disabled={submittingReply || !replyText.trim()}
                                  className="p-2.5 bg-primary text-white rounded-lg font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                                >
                                  {submittingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                </button>
                              </form>
                            )}

                            {/* Replies List */}
                            {replies.length > 0 && (
                              <div className="ml-12 mt-3 space-y-3.5 border-l-2 border-primary/20 pl-4 bg-gray-55/30 p-3.5 rounded-r-xl animate-in fade-in duration-200">
                                {replies.map(replyItem => {
                                  const replyUserName = replyItem.userId?.name || 'Student';
                                  const replyInitial = replyUserName.charAt(0).toUpperCase();
                                  const replyAvatarGrad = getAvatarGradient(replyUserName);
                                  return (
                                    <div key={replyItem._id} className="flex items-start gap-2.5 text-sm leading-relaxed">
                                      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${replyAvatarGrad} flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs`}>
                                        {replyInitial}
                                      </div>
                                      <div className="flex-1 space-y-0.5">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-gray-900 text-sm">{replyUserName}</span>
                                          <span className="text-xs text-gray-500 font-semibold">
                                            {new Date(replyItem.createdAt).toLocaleDateString('en-IN', {
                                              day: 'numeric',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-gray-800 font-normal text-sm leading-relaxed mt-0.5">{replyItem.comment}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Course Reviews Tab Panel */
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Reviews Summary Header */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-150 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Course Rating</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl font-black text-gray-900">
                          {reviewsList.length > 0
                            ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
                            : '0.0'}
                        </span>
                        <span className="text-sm font-bold text-gray-500">/ 5.0</span>
                      </div>
                      <div className="mt-1">
                        {renderStars(
                          reviewsList.length > 0
                            ? Math.round(reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length)
                            : 0
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Reviews</span>
                      <span className="text-2xl font-black text-gray-900 block mt-0.5">{reviewsList.length}</span>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Verified Learners</span>
                    </div>
                  </div>

                  {/* Create Review Form (Only if not already reviewed) */}
                  {!reviewsList.some(r => (r.userId?._id || r.userId) === user?._id) && (
                    <form onSubmit={handleCreateReview} className="space-y-3 bg-gray-50/50 p-5 rounded-2xl border border-gray-150 transition-all hover:border-gray-200">
                      <div>
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Your Rating</span>
                        <div className="flex gap-2 my-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReviewRating(star)}
                              className="focus:outline-none hover:scale-110 transition-all cursor-pointer"
                            >
                              <Star 
                                size={24} 
                                className={star <= newReviewRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Write a Review</span>
                        <textarea
                          required
                          rows={2}
                          value={newReviewText}
                          onChange={e => setNewReviewText(e.target.value)}
                          placeholder="Tell others what you think about this course..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-255 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none bg-white text-gray-805 placeholder:text-gray-400"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingReview || !newReviewText.trim()}
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Submit Review
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reviews List */}
                  {reviewsList.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-gray-255 rounded-2xl bg-gray-50/30">
                      <Star size={36} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">No reviews yet</p>
                      <p className="text-sm text-gray-500 mt-1">Be the first to review this course!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                      {reviewsList.map(reviewItem => {
                        const reviewUserName = reviewItem.userId?.name || 'Student';
                        const reviewInitial = reviewUserName.charAt(0).toUpperCase();
                        const reviewAvatarGrad = getAvatarGradient(reviewUserName);
                        const isOwn = (reviewItem.userId?._id || reviewItem.userId) === user?._id;
                        
                        return (
                          <div key={reviewItem._id} className="p-4 rounded-2xl bg-white border border-gray-150 hover:shadow-xs transition-all duration-300">
                            <div className="flex items-start gap-3.5 text-sm leading-relaxed">
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${reviewAvatarGrad} flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm`}>
                                {reviewInitial}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-gray-900 text-sm block">{reviewUserName}</span>
                                    <div className="mt-0.5">
                                      {renderStars(reviewItem.rating)}
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500 font-semibold">
                                    {new Date(reviewItem.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-gray-800 font-normal text-sm leading-relaxed mt-1.5">{reviewItem.review}</p>
                                
                                {isOwn && (
                                  <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
                                    <button
                                      onClick={() => handleEditReviewSwal(reviewItem)}
                                      className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider hover:underline focus:outline-none cursor-pointer"
                                    >
                                      <Pencil size={13} />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReviewSwal(reviewItem._id)}
                                      className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider hover:underline focus:outline-none cursor-pointer"
                                    >
                                      <Trash2 size={13} />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Course Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
               <span className="text-xs font-bold text-primary uppercase tracking-wider block">Course Overview</span>
               <h3 className="text-base font-bold text-gray-900">{course.title}</h3>
               {course.subtitle && <p className="text-sm text-gray-600 font-medium">{course.subtitle}</p>}
               <p className="text-sm text-gray-700 leading-relaxed font-normal">{course.description}</p>
               
               <div className="flex flex-wrap gap-5 pt-3 border-t border-gray-100 text-xs font-bold text-gray-600 uppercase">
                 <div className="flex items-center gap-1.5"><Globe size={15} className="text-primary" /> {course.language}</div>
                 <div className="flex items-center gap-1.5"><Clock size={15} className="text-primary" /> {course.totalDurationInMinutes || 0} Mins</div>
                 <div className="flex items-center gap-1.5"><BookOpen size={15} className="text-primary" /> {course.level}</div>
               </div>
            </div>

          </div>

          {/* Right Column: Curriculum Accordion Playlist (col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 border-b border-gray-150 bg-gray-50/50">
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Course Curriculum</h3>
                 <p className="text-gray-500 text-xs font-bold uppercase mt-1 tracking-wide">{sections.length} Sections • {lessons.length} Lessons</p>
                 
                 {/* Progress Bar */}
                 <div className="mt-3.5 space-y-1.5">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-600">
                     <span>Your Progress</span>
                     <span className="text-emerald-600 font-black">{progressPercentage}%</span>
                   </div>
                   <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                   </div>
                 </div>
              </div>
              
              <div className="divide-y divide-gray-150">
                  {sections.map((section, sIdx) => {
                    const sectionLessons = lessons.filter(l => l.sectionId === section._id);
                    const isExpanded = expandedSectionIds.has(section._id);
                    return (
                      <div key={section._id} className="bg-white">
                        
                        {/* Section Header Toggle */}
                        <button 
                          onClick={() => toggleSection(section._id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-55 transition-all text-left cursor-pointer"
                        >
                          <div>
                            <span className="text-xs font-bold text-primary uppercase tracking-wider block">Section {sIdx + 1}</span>
                            <h4 className="text-sm font-bold text-gray-900 uppercase mt-0.5">{section.title}</h4>
                            <span className="text-xs font-semibold text-gray-500 normal-case mt-0.5 block">
                              {section.totalVideos || 0} Videos • {section.totalAttachments || 0} Attachments
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-600 bg-gray-200/70 px-2.5 py-0.5 rounded-full">
                              {sectionLessons.length}
                            </span>
                            {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                          </div>
                        </button>
                        
                        {/* Section Lessons List */}
                        {isExpanded && (
                          <div className="bg-gray-50 divide-y divide-gray-100">
                            {sectionLessons.length === 0 ? (
                              <div className="p-4 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">No lessons in this section.</div>
                            ) : (
                              sectionLessons.map((lesson) => {
                                const isCurrent = activeLessonId === lesson._id;
                                const isCompleted = completedLessonIds.has(lesson._id);
                                return (
                                  <button
                                    key={lesson._id}
                                    onClick={() => setActiveLessonId(lesson._id)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-all text-left cursor-pointer border-l-2 ${
                                      isCurrent ? 'bg-primary/5 border-primary' : 'border-transparent pl-[18px]'
                                    }`}
                                  >
                                    <div className="flex items-center justify-center mt-0.5 flex-shrink-0">
                                      {isCompleted ? (
                                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">✓</div>
                                      ) : (
                                        <Play size={13} className={`${isCurrent ? 'text-primary fill-primary' : 'text-gray-400'}`} />
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <h5 className={`text-sm font-semibold ${isCurrent ? 'text-primary font-bold' : 'text-gray-900'}`}>
                                        {lesson.title}
                                      </h5>
                                      <span className="text-xs text-gray-500 font-semibold">
                                        {lesson.durationInSeconds ? `${Math.floor(lesson.durationInSeconds / 60)}m ${lesson.durationInSeconds % 60}s` : '10:00'}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default CoursePlayer;
