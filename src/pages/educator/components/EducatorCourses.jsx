import React from 'react';
import { Loader2, Play, Clock, Edit, Trash2 } from 'lucide-react';
import DataTable from '../../../components/shared/DataTable';

const EducatorCourses = ({
  isDarkMode,
  courses,
  coursesLoading,
  courseColumns,
  setIsCreateModalOpen,
  setEditingCourse,
  handleDelete
}) => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className={`text-base sm:text-lg font-extrabold uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>My Courses List</h3>
          <p className="text-xs sm:text-sm font-semibold text-zinc-400 uppercase mt-1">Manage and organize your published beauty tutorials</p>
        </div>
        <button 
          onClick={() => {
            setEditingCourse(null);
            setIsCreateModalOpen(true);
          }}
          className="whitespace-nowrap flex-shrink-0 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl shadow-md shadow-primary/20 transition-all cursor-pointer hover:scale-[1.01]"
        >
          + Add Course
        </button>
      </div>

      {coursesLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary mb-3" size={32} />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Syncing Course Catalog...</span>
        </div>
      ) : courses.length > 0 ? (
        <>
          {/* Course View Table */}
          <div className="overflow-x-auto w-full">
            <DataTable columns={courseColumns} data={courses} loading={coursesLoading} />
          </div>
        </>
      ) : (
        <div className={`border p-6 sm:p-12 rounded-3xl shadow-sm text-center space-y-4 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Play size={22} className="text-primary fill-primary" />
          </div>
          <h4 className={`text-base font-extrabold uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>No Courses Listed</h4>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium uppercase max-w-xs mx-auto leading-relaxed">
            Start uploading course modules, lessons, and tutorials to share your beauty skills with the platform!
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            Create First Course
          </button>
        </div>
      )}
    </div>
  );
};

export default EducatorCourses;
