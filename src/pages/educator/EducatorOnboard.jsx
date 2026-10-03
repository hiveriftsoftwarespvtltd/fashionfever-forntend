import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  BookOpen, 
  X, 
  Award, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  ArrowRight,
  Loader2 
} from 'lucide-react';
import { onboardEducator, getEducatorMyProfile } from '../../api/educatorService';
import { useUser } from '../../context/UserContext';
import { toast } from '../../utils/toast';

const EducatorOnboard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // Form States
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState(['']); // Start with one expertise tag
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getEducatorMyProfile();
        if (res?.success && res?.data) {
          const profileData = res.data?.data ?? res.data;
          setProfile(profileData);
          // If approved, redirect to dashboard
          if (profileData && profileData.isApproved) {
            updateUser({ isEducatorApproved: true, educatorId: profileData._id });
            navigate('/educator/dashboard');
          }
        }
      } catch (err) {
        console.error("Profile check error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [navigate, updateUser]);

  const handleAddExpertise = () => {
    setExpertise([...expertise, '']);
  };

  const handleRemoveExpertise = (index) => {
    if (expertise.length > 1) {
      setExpertise(expertise.filter((_, i) => i !== index));
    }
  };

  const handleExpertiseChange = (index, value) => {
    const updated = [...expertise];
    updated[index] = value;
    setExpertise(updated);
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
    if (!bio.trim()) {
      toast.error('Please write a short bio about yourself.');
      return;
    }

    const filteredExpertise = expertise.filter(exp => exp.trim() !== '');
    if (filteredExpertise.length === 0) {
      toast.error('Please add at least one area of expertise.');
      return;
    }

    if (!file) {
      toast.error('Please upload your professional profile picture.');
      return;
    }

    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio.trim());
      formData.append('file', file);
      filteredExpertise.forEach((exp, index) => {
        formData.append(`expertise[${index}]`, exp.trim());
      });

      const res = await onboardEducator(formData);
      if (res?.success) {
        toast.success(res.message || 'Onboarding submitted successfully!');
        const unpacked = res.data?.data ?? res.data ?? res;
        setProfile(unpacked);
      } else {
        toast.error(res?.message || 'Failed to submit onboarding details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong during onboarding.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Checking status...</span>
      </div>
    );
  }

  // Waiting for Approval state
  if (profile && !profile.isApproved) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-outfit">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-amber-50 text-amber-500 mb-6">
            <Clock size={40} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black uppercase text-gray-800 tracking-tight">Onboarding Pending</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Status: Awaiting Verification</p>
          
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-left space-y-3">
            <p className="text-xs font-bold uppercase text-zinc-500">Submitted Specifications</p>
            <div className="flex items-start gap-2 text-xs">
              <User size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-zinc-800 font-bold leading-normal truncate">{user?.name || 'Educator'}</p>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <FileText size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-zinc-600 font-medium leading-relaxed line-clamp-3">{profile.bio}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.expertise?.map((exp, i) => (
                <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/25 rounded-full text-xs font-bold uppercase">
                  {exp}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs font-medium text-zinc-500 leading-normal">
            Thank you for applying! Our admin team is reviewing your profile. You will gain access to your Educator Dashboard once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-outfit">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-zinc-200 transition-all duration-500">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <BookOpen size={30} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-zinc-900 uppercase tracking-tight">Educator Onboarding</h2>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">Submit your profile details for admin approval</p>
        </div>

        {/* Form */}
        <form className="space-y-6 text-left" onSubmit={handleSubmit}>
          
          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Professional Profile Photo *</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden bg-zinc-50 relative flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-zinc-400" />
                )}
              </div>
              <div className="flex-grow">
                <label 
                  htmlFor="avatar-upload-input"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold uppercase cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all bg-white text-zinc-700 shadow-sm"
                >
                  <Upload size={14} className="text-primary" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload-input"
                    required
                  />
                </label>
                <p className="text-xs text-zinc-400 font-semibold uppercase mt-1">Recommended: Square format, PNG/JPG</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Short Bio *</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your teaching experience, philosophy, or specialized background..."
              rows={4}
              required
              className="block w-full px-4 py-3 border border-zinc-200 rounded-xl leading-normal bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold transition-all resize-none text-zinc-800"
            />
          </div>

          {/* Areas of Expertise */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Areas of Expertise *</label>
              <button
                type="button"
                onClick={handleAddExpertise}
                className="text-xs font-bold text-primary hover:underline uppercase cursor-pointer"
              >
                + Add Tag
              </button>
            </div>
            
            <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
              {expertise.map((exp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Award size={13} className="text-primary/70" />
                    </div>
                    <input
                      type="text"
                      value={exp}
                      onChange={(e) => handleExpertiseChange(idx, e.target.value)}
                      placeholder={`Expertise Tag #${idx + 1} (e.g. Bridal Makeup)`}
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold transition-all"
                    />
                  </div>
                  {expertise.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(idx)}
                      className="p-2.5 bg-gray-50 border border-gray-150 hover:bg-red-50 hover:border-red-200 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitLoading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed pt-4"
          >
            {submitLoading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              'Submit Onboarding Details'
            )}
            {!submitLoading && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

export default EducatorOnboard;
