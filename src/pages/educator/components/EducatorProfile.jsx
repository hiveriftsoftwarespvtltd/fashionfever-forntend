import React from 'react';
import { User, Upload, X } from 'lucide-react';

const EducatorProfile = ({
  isDarkMode,
  profile,
  user,
  isEditing,
  setIsEditing,
  handleUpdateProfile,
  editImagePreview,
  handleFileChange,
  editBio,
  setEditBio,
  editExpertise,
  handleExpertiseChange,
  handleRemoveExpertise,
  handleAddExpertise,
  updateLoading,
  setEditFile,
  setEditImagePreview
}) => {
  return (
    <div className={`border p-5 sm:p-7 md:p-8 rounded-[2rem] shadow-sm max-w-2xl space-y-6 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-md' : 'bg-white border-zinc-200'}`}>
      <div className={`flex justify-between items-center gap-4 border-b pb-4 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <h3 className={`text-base font-extrabold uppercase tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
          Profile specifications
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="whitespace-nowrap flex-shrink-0 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl shadow-md shadow-primary/10 transition-all cursor-pointer"
          >
            Edit Profile
          </button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="space-y-5 text-left">
          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
                {editImagePreview ? (
                  <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={22} className="text-zinc-400" />
                )}
              </div>
              <div>
                <label 
                  htmlFor="profile-image-upload" 
                  className={`inline-flex items-center gap-2 px-3.5 py-2 border text-xs font-bold uppercase rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'}`}
                >
                  <Upload size={14} className="text-primary" />
                  Upload Image
                </label>
                <input 
                  type="file" 
                  id="profile-image-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">Short Bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={4}
              required
              className={`block w-full px-4 py-3 border rounded-xl leading-normal placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs font-semibold transition-all resize-none font-outfit ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-primary' : 'bg-white border-zinc-200 text-zinc-800'}`}
            />
          </div>

          {/* Expertise */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">Areas of Expertise</label>
              <button
                type="button"
                onClick={handleAddExpertise}
                className="text-xs font-bold text-primary hover:underline uppercase cursor-pointer"
              >
                + Add Tag
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {editExpertise.map((exp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={exp}
                    onChange={(e) => handleExpertiseChange(idx, e.target.value)}
                    placeholder={`Expertise Tag #${idx + 1}`}
                    required
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-normal text-xs font-semibold transition-all font-outfit ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-800'}`}
                  />
                  {editExpertise.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(idx)}
                      className={`p-2.5 border hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-500 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-3 pt-4 border-t font-outfit ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <button
              type="submit"
              disabled={updateLoading}
              className="flex-1 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl shadow-md shadow-primary/15 transition-all cursor-pointer flex justify-center items-center"
            >
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditBio(profile?.bio || '');
                handleExpertiseChange(-1, null); // custom trigger to reset
                setEditImagePreview(profile?.profileImage?.url || profile?.profileImage);
                setEditFile(null);
              }}
              className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className={`space-y-4 text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-zinc-400">Full Name</span>
              <p className={`p-3 border rounded-xl mt-1 text-sm font-semibold ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'}`}>{user?.name}</p>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-zinc-400">Email Address</span>
              <p className={`p-3 border rounded-xl mt-1 text-sm font-mono font-medium ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'}`}>{user?.email}</p>
            </div>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-zinc-400">Bio Specification</span>
            <p className={`p-3 border rounded-xl mt-1 leading-relaxed text-xs font-medium ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-800'}`}>{profile?.bio}</p>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-zinc-400">Expertise Tags</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile?.expertise?.map((exp, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase">
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducatorProfile;
