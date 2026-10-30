import React from 'react';
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

      {/* Course View Table */}
      <div className="overflow-x-auto w-full">
        <DataTable columns={courseColumns} data={courses} loading={coursesLoading} />
      </div>
    </div>
  );
};

export default EducatorCourses;
