import React, { useState, useEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from '../../../utils/toast';
import { updateProviderAvailability, getProviderAvailability } from '../../../api/serviceProviderService';

const ServiceProviderAvailability = ({ isDarkMode, user, profileData }) => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const defaultList = [
    { dayOfWeek: "MONDAY", isActive: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
    { dayOfWeek: "TUESDAY", isActive: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
    { dayOfWeek: "WEDNESDAY", isActive: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
    { dayOfWeek: "THURSDAY", isActive: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
    { dayOfWeek: "FRIDAY", isActive: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
    { dayOfWeek: "SATURDAY", isActive: false, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
    { dayOfWeek: "SUNDAY", isActive: false, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
  ];

  const providerId = profileData?._id || user?._id;

  const [availabilities, setAvailabilities] = useState(() => {
    try {
      const saved = localStorage.getItem(`sp_availability_${providerId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultList;
  });

  // Fetch current availability from database on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!providerId) return;
      setLoading(true);
      try {
        const res = await getProviderAvailability(providerId);
        
        // Unpack double-nested JSON response for availability
        const listData = res?.data?.data ?? res?.data ?? res;
        
        if (Array.isArray(listData) && listData.length > 0) {
          // Map backend items to Monday-Sunday checklist
          const updatedList = defaultList.map(defaultDay => {
            const matched = listData.find(item => item?.dayOfWeek === defaultDay.dayOfWeek);
            if (matched) {
              return {
                ...defaultDay,
                isActive: true,
                startTime: matched.startTime || defaultDay.startTime,
                endTime: matched.endTime || defaultDay.endTime,
                breakStart: matched.breakStart || defaultDay.breakStart,
                breakEnd: matched.breakEnd || defaultDay.breakEnd
              };
            }
            return { ...defaultDay, isActive: false };
          });
          setAvailabilities(updatedList);
          localStorage.setItem(`sp_availability_${providerId}`, JSON.stringify(updatedList));
        } else {
          // If no availability found on backend, try to load from localStorage
          const saved = localStorage.getItem(`sp_availability_${providerId}`);
          if (saved) {
            setAvailabilities(JSON.parse(saved));
          }
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        // Fallback to localStorage
        const saved = localStorage.getItem(`sp_availability_${providerId}`);
        if (saved) {
          setAvailabilities(JSON.parse(saved));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [providerId]);

  const handleToggleDay = (dayIndex) => {
    setAvailabilities(prev => prev.map((day, idx) => {
      if (idx === dayIndex) {
        return { ...day, isActive: !day.isActive };
      }
      return day;
    }));
  };

  const handleTimeChange = (dayIndex, field, value) => {
    setAvailabilities(prev => prev.map((day, idx) => {
      if (idx === dayIndex) {
        return { ...day, [field]: value };
      }
      return day;
    }));
  };

  const handleSaveAvailability = async () => {
    const activeAvailabilities = availabilities
      .filter(day => day.isActive)
      .map(({ dayOfWeek, startTime, endTime, breakStart, breakEnd }) => ({
        dayOfWeek,
        startTime,
        endTime,
        breakStart,
        breakEnd
      }));

    if (activeAvailabilities.length === 0) {
      toast.error("Please select at least one active day.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProviderAvailability({ availabilities: activeAvailabilities });
      const isOk = res?.success && (res.data?.success !== false);
      if (isOk) {
        Swal.fire({
          title: 'Availability Saved!',
          text: res.message || res.data?.message || 'Your weekly availability has been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#EC4899',
          background: isDarkMode ? '#1F2937' : '#FFFFFF',
          color: isDarkMode ? '#FFFFFF' : '#1F2937'
        });
        localStorage.setItem(`sp_availability_${providerId}`, JSON.stringify(availabilities));
      } else {
        toast.error(res?.message || res?.data?.message || 'Failed to save availability.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while saving availability.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-lg lg:text-3xl font-bold uppercase transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Work Availability
          </h2>
          <p className="text-sm font-semibold uppercase text-gray-400 mt-1">
            Configure your active hours and resting days for booking scheduling
          </p>
        </div>
      </div>

      {/* Weekly Work Availability Schedule */}
      <div className={`p-6 md:p-8 rounded-3xl border text-left ${
        isDarkMode 
          ? 'bg-gray-900 border-white/5' 
          : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className={`text-sm font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-850'}`}>
              Weekly Work Availability
            </h3>
            <p className="text-sm font-bold text-gray-400 uppercase mt-0.5">
              Set your active operating hours and break times for bookings allocation
            </p>
          </div>
          <button
            onClick={handleSaveAvailability}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-95 disabled:opacity-50 self-start sm:self-center"
          >
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing weekly schedule...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {availabilities.map((day, idx) => (
              <div 
                key={day.dayOfWeek}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  day.isActive 
                    ? isDarkMode ? 'bg-gray-950/60 border-primary/20' : 'bg-pink-50/5 border-pink-100'
                    : isDarkMode ? 'bg-gray-900/30 border-white/5 opacity-50' : 'bg-gray-50/50 border-gray-100 opacity-60'
                }`}
              >
                {/* Day Toggle */}
                <div className="flex items-center gap-3 w-40 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                      day.isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      day.isActive ? 'right-1 translate-x-0' : 'left-1'
                    }`} />
                  </button>
                  <span className={`text-xs font-black uppercase ${
                    day.isActive 
                      ? 'text-primary' 
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {day.dayOfWeek}
                  </span>
                </div>

                {/* Working Hours */}
                {day.isActive ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Start Time</label>
                      <input 
                        type="time" 
                        value={day.startTime}
                        onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold outline-none border transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-gray-800 text-white focus:border-primary/50' 
                            : 'bg-white border-gray-150 text-gray-750 focus:border-primary/20'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">End Time</label>
                      <input 
                        type="time" 
                        value={day.endTime}
                        onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold outline-none border transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-gray-800 text-white focus:border-primary/50' 
                            : 'bg-white border-gray-150 text-gray-750 focus:border-primary/20'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Break Start</label>
                      <input 
                        type="time" 
                        value={day.breakStart}
                        onChange={(e) => handleTimeChange(idx, 'breakStart', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold outline-none border transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-gray-800 text-white focus:border-primary/50' 
                            : 'bg-white border-gray-150 text-gray-750 focus:border-primary/20'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500">Break End</label>
                      <input 
                        type="time" 
                        value={day.breakEnd}
                        onChange={(e) => handleTimeChange(idx, 'breakEnd', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold outline-none border transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900 border-gray-800 text-white focus:border-primary/50' 
                            : 'bg-white border-gray-150 text-gray-750 focus:border-primary/20'
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center h-14">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      Closed / Resting Day
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceProviderAvailability;
