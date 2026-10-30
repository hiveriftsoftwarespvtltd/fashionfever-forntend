import React, { useState, useEffect } from 'react';
import { PlayCircle, Clock, Award, ChevronRight, Loader2, BookOpen, ShoppingBag, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserSidebar from '../profile/UserSidebar';
import { getUserEnrollments } from '../../api/educatorService';

import config from '../../config/config';
import { getImageUrl } from '../../utils/imageUrl';

const MyLearning = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const res = await getUserEnrollments();
        if (res?.success) {
          const list = res.data?.data || res.data || [];
          setEnrollments(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Error fetching user enrollments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const getThumbnailUrl = (courseItem) => {
    if (!courseItem) return 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=300&fit=crop';
    
    const thumbnail = courseItem.thumbnail;
    if (!thumbnail) return 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=300&fit=crop';

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
    
    // Otherwise return fallback placeholder
    return 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=300&fit=crop';
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 font-outfit text-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">My Learning</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <UserSidebar />

          {/* Right Content */}
          <div className="flex-grow space-y-6">
            
            {/* Header section */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 text-left space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-black text-primary uppercase block">Education Portfolio</span>
                  <h1 className="text-2xl font-black uppercase text-gray-900 flex items-center gap-2">
                    <BookOpen className="text-primary stroke-[2.5]" size={24} /> My Learning
                  </h1>
                </div>
                <div className="flex gap-4 flex-shrink-0 self-start sm:self-center">
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2">
                     <Award className="text-primary" size={18} />
                     <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Certificates</p>
                        <p className="text-sm font-black text-gray-900">
                          {enrollments.filter(e => e.progressPercentage === 100).length} Earned
                        </p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Learning Content */}
            {loading ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={36} />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Hydrating Learning Portfolio...</p>
              </div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 p-16 text-center space-y-6">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto text-primary border border-primary/10">
                  <BookOpen size={28} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-base font-extrabold uppercase text-gray-800">No Enrollments Found</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase leading-relaxed">
                    You haven't enrolled in any courses yet on FashionFever.
                  </p>
                </div>
                <Link 
                  to="/academy" 
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Explore Academy <ChevronRight size={14} className="stroke-[3]" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {enrollments.map((enrollment) => {
                   const courseItem = enrollment.courseId || {};
                   const isCompleted = enrollment.progressPercentage === 100;
                   return (
                     <div key={enrollment._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between sm:h-60">
                        <div className="flex flex-col sm:flex-row h-full">
                           {/* Thumbnail */}
                           <div className="w-full sm:w-40 h-40 sm:h-full relative overflow-hidden flex-shrink-0 bg-gray-50 border-r border-gray-100">
                              <img src={getThumbnailUrl(courseItem)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <PlayCircle className="text-white" size={36} />
                              </div>
                           </div>
                           
                           {/* Info Details */}
                           <div className="flex-grow p-5 flex flex-col justify-between text-left h-full">
                              <div className="space-y-2">
                                 <div className="flex items-center justify-between gap-2">
                                    <span className="bg-primary/10 text-primary text-xs font-bold uppercase px-2.5 py-1 rounded">
                                       {courseItem.level || 'BEGINNER'}
                                    </span>
                                    <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded ${
                                       isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                       {isCompleted ? 'Completed' : 'Active'}
                                    </span>
                                 </div>
                                 <Link to={`/academy/course/${courseItem._id}`}>
                                    <h3 className="text-base font-black text-gray-800 leading-snug group-hover:text-primary transition-colors line-clamp-2 uppercase">
                                       {courseItem.title || 'Untitled Course'}
                                    </h3>
                                 </Link>
                                 
                                 {/* Progress slider */}
                                 <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-600">
                                       <span>Progress</span>
                                       <span>{enrollment.progressPercentage || 0}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                       <div 
                                          className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`} 
                                          style={{ width: `${enrollment.progressPercentage || 0}%` }}
                                       ></div>
                                    </div>
                                 </div>
                              </div>
                              
                              <Link 
                                 to={`/academy/course/${courseItem._id}`} 
                                 className="mt-4 w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                              >
                                 Resume Masterclass <ChevronRight size={14} className="stroke-[2.5]" />
                              </Link>
                           </div>
                        </div>
                     </div>
                   );
                 })}
              </div>
            )}

          </div>{/* end right */}
        </div>
      </div>
    </div>
  );
};

export default MyLearning;
