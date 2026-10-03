import React from 'react';
import { User, BookOpen } from 'lucide-react';

const EducatorOverview = ({
  user,
  stats,
  profile,
  isDarkMode,
  setActiveTab
}) => {
  return (
    <>
      {/* Welcome Message Banner */}
      <div className="mb-6">
        <h2 className={`text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
          Welcome, {user?.name || 'Educator'}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-zinc-400 uppercase mt-1">
          Organize tutorials, analyze academy stats, and engage with online learners
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, i) => (
          <div key={i} className={`p-5 sm:p-6 border rounded-2xl sm:rounded-3xl shadow-sm space-y-3 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-bold uppercase text-zinc-400 leading-none">{stat.label}</span>
              <div className={`p-2 sm:p-2.5 border rounded-xl ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}>
                {React.cloneElement(stat.icon, { size: 18 })}
              </div>
            </div>
            <div>
              <h3 className={`text-xl sm:text-2xl md:text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{stat.value}</h3>
              <p className="text-xs font-semibold text-zinc-400 uppercase mt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Profile Card */}
        <div className={`border p-6 rounded-[2rem] shadow-sm space-y-6 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="text-center space-y-4">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto overflow-hidden border shadow-inner flex items-center justify-center ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
              {profile?.profileImage || profile?.userId?.avatar ? (
                <img 
                  src={profile.profileImage?.url || profile.profileImage || profile.userId?.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={36} className="text-primary" />
              )}
            </div>
            <div>
              <h3 className={`text-base font-extrabold uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                {user?.name || 'Educator'}
              </h3>
              <p className="text-xs font-bold text-primary uppercase mt-1">Certified Academy Educator</p>
            </div>
          </div>

          <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Bio Description</span>
              <p className={`text-xs font-medium leading-relaxed p-3.5 rounded-2xl border ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}>
                {profile?.bio || 'No bio submitted'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Expertise Badges</span>
              <div className="flex flex-wrap gap-2">
                {profile?.expertise?.map((exp, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Workspace / Courses placeholder */}
        <div className={`lg:col-span-2 border p-6 sm:p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center space-y-4 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="p-4 bg-primary/10 text-primary rounded-2xl animate-bounce">
            <BookOpen size={30} />
          </div>
          <h3 className={`text-base sm:text-lg font-bold uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Create Educational Content</h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-sm uppercase leading-relaxed">
            Start uploading course modules, video guides, and beauty lessons to inspire the community. Let's create your first tutorial!
          </p>
          <button 
            onClick={() => setActiveTab('courses')}
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl shadow-md shadow-primary/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
          >
            Create First Course
          </button>
        </div>

      </div>
    </>
  );
};

export default EducatorOverview;
