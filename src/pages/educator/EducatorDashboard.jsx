import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Video, 
  Users, 
  Star, 
  LogOut, 
  Loader2, 
  Sparkles, 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  Play, 
  Clock,
  Edit,
  Trash2,
  Layers
} from 'lucide-react';
import { 
  getEducatorMyProfile, 
  updateEducatorProfile, 
  getEducatorDashboardStats,
  getPublicUserCourseList,
  deleteCourse
} from '../../api/educatorService';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from '../../utils/toast';
import Swal from 'sweetalert2';
import config from '../../config/config';

// Import modular sub-components
import EducatorSidebar from './components/EducatorSidebar';
import EducatorOverview from './components/EducatorOverview';
import EducatorCourses from './components/EducatorCourses';
import EducatorProfile from './components/EducatorProfile';
import CreateCourseModal from './components/CreateCourseModal';
import ManageSections from './ManageSections';
import PayoutBankDetails from '../../components/shared/PayoutBankDetails';

const EducatorDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const { user, logout } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const containerRef = useRef(null);

  const getThumbnailUrl = (courseItem) => {
    if (!courseItem) return '';
    const thumbnail = courseItem.thumbnail;
    if (!thumbnail) return '';

    // Check if thumbnail is a populated object
    if (thumbnail.url && typeof thumbnail.url === 'string') {
      return thumbnail.url;
    }
    
    // Check if thumbnail is a direct URL string or base64 data
    if (typeof thumbnail === 'string') {
      if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://') || thumbnail.startsWith('data:')) {
        return thumbnail;
      }
      // If it looks like a Mongo ID or filename, resolve via backend file retrieval route
      return `${config.API_URL}/file/get-file/${thumbnail}`;
    }
    
    return '';
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);
  
  // App loading states
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [statsData, setStatsData] = useState({ totalCourses: 0, totalStudents: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Courses list states
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [refreshCoursesTrigger, setRefreshCoursesTrigger] = useState(0);
  const triggerRefreshCourses = () => setRefreshCoursesTrigger(prev => prev + 1);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Sections Modal State
  const [selectedCourseForSections, setSelectedCourseForSections] = useState(null);
  const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false);

  // Sync selectedCourseForSections from URL search params on load/refresh
  const searchCourseId = searchParams.get('courseId');
  useEffect(() => {
    if (activeTab === 'manage-sections' && searchCourseId) {
      if (!selectedCourseForSections || selectedCourseForSections._id !== searchCourseId) {
        const found = courses.find(c => c._id === searchCourseId);
        if (found) {
          setSelectedCourseForSections(found);
        } else if (!selectedCourseForSections) {
          setSelectedCourseForSections({ _id: searchCourseId, title: 'Loading Course...' });
        }
      }
    }
  }, [activeTab, searchCourseId, courses, selectedCourseForSections]);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editExpertise, setEditExpertise] = useState(['']);
  const [editFile, setEditFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const res = await getEducatorMyProfile();
        if (res?.success && res?.data) {
          const profileData = res.data?.data ?? res.data;
          setProfile(profileData);
          setEditBio(profileData.bio || '');
          setEditExpertise(profileData.expertise && profileData.expertise.length > 0 ? profileData.expertise : ['']);
          setEditImagePreview(profileData.profileImage?.url || profileData.profileImage);
          
          if (!profileData || !profileData.isApproved) {
            navigate('/educator/onboard');
            return;
          }

          // Fetch dashboard stats
          try {
            const statsRes = await getEducatorDashboardStats();
            if (statsRes?.success && statsRes?.data) {
              const unpackedStats = statsRes.data?.data ?? statsRes.data;
              setStatsData({
                totalCourses: unpackedStats.totalCourses ?? 0,
                totalStudents: unpackedStats.totalStudents ?? 0
              });
            }
          } catch (statsErr) {
            console.error("Failed to load dashboard stats:", statsErr);
          }
        } else {
          navigate('/educator/onboard');
        }
      } catch (err) {
        console.error("Dashboard profile load error:", err);
        navigate('/educator/onboard');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndStats();
  }, [navigate]);

  // Fetch courses list when courses or manage-sections tab is opened
  useEffect(() => {
    const fetchCoursesList = async () => {
      if (activeTab !== 'courses' && activeTab !== 'manage-sections') return;
      setCoursesLoading(true);
      try {
        const res = await getPublicUserCourseList();
        if (res?.success) {
          const coursesPayload = res.data?.courses ?? res.data?.data?.courses ?? res.data ?? [];
          setCourses(Array.isArray(coursesPayload) ? coursesPayload : []);
        } else {
          toast.error(res?.message || 'Failed to fetch course catalogs.');
        }
      } catch (err) {
        console.error("Fetch courses list error:", err);
        toast.error('Could not load courses.');
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCoursesList();
  }, [activeTab, refreshCoursesTrigger]);

  const handleAddExpertise = () => {
    setEditExpertise([...editExpertise, '']);
  };

  const handleRemoveExpertise = (index) => {
    if (editExpertise.length > 1) {
      setEditExpertise(editExpertise.filter((_, i) => i !== index));
    }
  };

  const handleExpertiseChange = (index, value) => {
    if (index === -1) {
      setEditExpertise(profile?.expertise && profile.expertise.length > 0 ? profile.expertise : ['']);
      return;
    }
    const updated = [...editExpertise];
    updated[index] = value;
    setEditExpertise(updated);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fe3e6a',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteCourse(id);
          if (res?.success) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your course has been deleted.',
              icon: 'success',
              background: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#1f2937',
              confirmButtonColor: '#fe3e6a'
            });
            triggerRefreshCourses();
          } else {
            toast.error(res?.message || 'Failed to delete the course.');
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to delete course.');
        }
      }
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setEditFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editBio.trim()) {
      toast.error('Please write a short bio about yourself.');
      return;
    }

    const filteredExpertise = editExpertise.filter(exp => exp.trim() !== '');
    if (filteredExpertise.length === 0) {
      toast.error('Please add at least one area of expertise.');
      return;
    }

    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', editBio.trim());
      if (editFile) {
        formData.append('file', editFile);
      }
      filteredExpertise.forEach((exp, index) => {
        formData.append(`expertise[${index}]`, exp.trim());
      });

      const res = await updateEducatorProfile(formData);
      if (res?.success) {
        toast.success(res.message || 'Profile updated successfully!');
        const updatedProfile = res.data?.data ?? res.data ?? res;
        setProfile(updatedProfile);
        setIsEditing(false);
      } else {
        toast.error(res?.message || 'Failed to update profile details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong during update.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-955' : 'bg-gray-50'}`}>
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <span className="text-xs font-bold text-gray-455 uppercase tracking-widest animate-pulse">Loading dashboard...</span>
      </div>
    );
  }

  const stats = [
    { label: 'Total Courses', value: String(statsData.totalCourses), icon: <Video className="text-primary" size={20} />, desc: 'Created Tutorials' },
    { label: 'Students Enrolled', value: String(statsData.totalStudents), icon: <Users className="text-blue-500" size={20} />, desc: 'Active learners' },
    { label: 'Educator Rating', value: '5.0', icon: <Star className="text-amber-500 fill-amber-500" size={20} />, desc: 'Average rating' },
    { label: 'Status', value: 'Verified', icon: <Sparkles className="text-green-500" size={20} />, desc: 'Admin approved' }
  ];

  const courseColumns = [
    {
      header: 'Course Details',
      render: (course) => (
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${isDarkMode ? 'bg-gray-905 border-white/5' : 'bg-gray-55 border-gray-200'}`}>
            {getThumbnailUrl(course) ? (
              <img src={getThumbnailUrl(course)} alt={course.title} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Play size={16} className="text-primary fill-primary" />
            )}
          </div>
          <div>
            <h4 className={`font-black uppercase tracking-tight text-sm ${isDarkMode ? 'text-white' : 'text-gray-805'}`}>{course.title}</h4>
            <p className="text-sm font-bold text-gray-400 uppercase mt-0.5">{course.subtitle || 'No subtitle'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      render: (course) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-primary/10 text-primary">
          {course.categoryId?.label || course.categoryId?.name || 'Academy'}
        </span>
      )
    },
    {
      header: 'Duration',
      render: (course) => (
        <div className="flex flex-col text-xs font-semibold uppercase text-zinc-400 space-y-0.5">
          <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {course.totalDurationInMinutes ?? 0} mins</span>
          <span>{course.totalLessons ?? 0} lessons</span>
        </div>
      )
    },
    {
      header: 'Level',
      render: (course) => (
        <div className="font-bold uppercase tracking-wider text-xs text-zinc-400">
          <div>{course.level || 'Beginner'}</div>
          <div className="text-xs text-zinc-400 font-medium mt-0.5">{course.language || 'English'}</div>
        </div>
      )
    },
    {
      header: 'Price',
      render: (course) => (
        <span className="font-bold text-sm text-primary">
          {course.isFree ? 'FREE' : `₹${course.sellingPrice?.toLocaleString()}`}
        </span>
      )
    },
    {
      header: 'Status',
      render: (course) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border tracking-wider ${
          course.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {course.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (course) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedCourseForSections(course);
              setSearchParams({ tab: 'manage-sections', courseId: course._id });
            }}
            className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-500 hover:text-primary hover:bg-primary/10' : 'text-gray-300 hover:text-primary hover:bg-primary/5'} cursor-pointer`}
            title="Manage Sections"
          >
            <Layers size={16} />
          </button>
          <button
            onClick={() => {
              setEditingCourse(course);
              setIsCreateModalOpen(true);
            }}
            className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-500 hover:text-primary hover:bg-primary/10' : 'text-gray-300 hover:text-primary hover:bg-primary/5'} cursor-pointer`}
            title="Edit Course"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(course._id)}
            className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'} cursor-pointer`}
            title="Delete Course"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={`flex h-screen overflow-hidden font-outfit text-left transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* Educator Sidebar */}
      <EducatorSidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        handleLogout={handleLogout}
      />

      {/* Main Content Scrollable Wrapper */}
      <div 
        ref={containerRef}
        className={`flex-grow flex flex-col h-screen overflow-y-scroll transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}
      >
        {/* Header Block */}
        <header className={`h-16 lg:h-20 flex-shrink-0 flex items-center justify-between px-6 lg:px-10 border-b sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
          isDarkMode ? 'bg-zinc-950/85 border-zinc-800/80 text-white' : 'bg-white/95 border-zinc-200 text-zinc-900'
        }`}>
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'}`}
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className={`text-base lg:text-lg font-bold capitalize tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                {activeTab === 'overview' ? 'Overview' : activeTab === 'courses' ? 'Manage Courses' : activeTab === 'manage-sections' ? 'Manage Sections' : 'Profile Settings'}
              </h1>
            </div>
          </div>
          <div className="flex gap-2.5 items-center justify-end sm:justify-start">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className={`p-2.5 rounded-xl transition-all border ${isDarkMode ? 'bg-zinc-900 text-amber-400 border-zinc-800 hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'}`}
            >
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button className={`p-2.5 border rounded-xl transition-all relative cursor-pointer ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`}>
              <Bell size={17} />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
            
            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center justify-center p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 sm:space-y-8 min-w-0">
          {activeTab === 'overview' && (
            <EducatorOverview 
              user={user}
              stats={stats}
              profile={profile}
              isDarkMode={isDarkMode}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'courses' && (
            <EducatorCourses 
              isDarkMode={isDarkMode}
              courses={courses}
              coursesLoading={coursesLoading}
              courseColumns={courseColumns}
              setIsCreateModalOpen={setIsCreateModalOpen}
              setEditingCourse={setEditingCourse}
              handleDelete={handleDelete}
            />
          )}

          {activeTab === 'profile' && (
            <EducatorProfile 
              isDarkMode={isDarkMode}
              profile={profile}
              user={user}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleUpdateProfile={handleUpdateProfile}
              editImagePreview={editImagePreview}
              handleFileChange={handleFileChange}
              editBio={editBio}
              setEditBio={setEditBio}
              editExpertise={editExpertise}
              handleExpertiseChange={handleExpertiseChange}
              handleRemoveExpertise={handleRemoveExpertise}
              handleAddExpertise={handleAddExpertise}
              updateLoading={updateLoading}
              setEditFile={setEditFile}
              setEditImagePreview={setEditImagePreview}
            />
          )}

          {activeTab === 'payout' && (
            <PayoutBankDetails 
              isDarkMode={isDarkMode}
              role="educator"
              ownerId={profile?._id}
            />
          )}

          {activeTab === 'manage-sections' && selectedCourseForSections && (
            <ManageSections 
              course={selectedCourseForSections}
              isDarkMode={isDarkMode}
              onBack={() => {
                setActiveTab('courses');
                setSelectedCourseForSections(null);
              }}
            />
          )}
        </main>
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCourse(null);
        }}
        onCourseCreated={triggerRefreshCourses}
        isDarkMode={isDarkMode}
        editCourseData={editingCourse}
      />


    </div>
  );
};

export default EducatorDashboard;
