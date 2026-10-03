import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Loader2, Sparkles, User } from 'lucide-react';
import StylistSelector from './StylistSelector';

const DateTimeSlotSelector = ({
  selectedResult,
  selectedServices = [],
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  selectedStaff,
  setSelectedStaff,
  slots = [],
  slotsLoading,
  scheduleRef
}) => {
  // Generate 7 days starting from today
  const dateList = useMemo(() => {
    const list = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      list.push({
        dateString,
        dayNum: d.getDate(),
        dayName: days[d.getDay()],
        monthName: months[d.getMonth()],
        isToday: i === 0
      });
    }
    return list;
  }, []);

  // Format time safely (e.g. "9:00 AM" or "09:00 AM")
  const formatSlotTime = (timeVal) => {
    if (!timeVal) return '';
    const str = String(timeVal).trim();
    if (str.toUpperCase().includes('AM') || str.toUpperCase().includes('PM')) {
      return str;
    }
    try {
      const date = new Date(str);
      if (isNaN(date.getTime())) return str;
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return str;
    }
  };

  // Filter slots if a specific stylist is selected
  const availableSlots = useMemo(() => {
    if (!slots || slots.length === 0) return [];
    if (!selectedStaff) return slots;
    return slots.filter((slot) => {
      return slot.availableStaff && slot.availableStaff.some(st => st?._id === selectedStaff._id);
    });
  }, [slots, selectedStaff]);

  return (
    <div ref={scheduleRef} className="space-y-6 text-left py-2">
      {!selectedResult || selectedServices.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-200 p-6">
          <CalendarIcon size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-semibold text-gray-800">Select Salon & Treatments First</p>
          <p className="text-xs text-gray-500 mt-0.5">Please choose your salon and services to view schedule.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 1. DATE SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-bold text-gray-900">
                1. Select Date
              </label>

              {/* Direct Calendar Picker Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => document.getElementById('simple-date-picker')?.showPicker?.()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  <CalendarIcon size={13} />
                  <span>Choose other date</span>
                </button>
                <input
                  id="simple-date-picker"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                      setSelectedStaff(null);
                    }
                  }}
                  className="absolute opacity-0 pointer-events-none w-0 h-0"
                />
              </div>
            </div>

            {/* Clean Date Pills */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {dateList.map((d) => {
                const isSel = selectedDate === d.dateString;

                return (
                  <button
                    key={d.dateString}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.dateString);
                      setSelectedSlot(null);
                      setSelectedStaff(null);
                    }}
                    className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border text-center ${
                      isSel
                        ? 'bg-primary border-primary text-white shadow-sm ring-1 ring-primary'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isSel ? 'text-white/80' : 'text-gray-400'
                    }`}>
                      {d.isToday ? 'Today' : d.dayName}
                    </span>

                    <span className="text-lg font-bold leading-none my-1">
                      {d.dayNum}
                    </span>

                    <span className={`text-[10px] font-medium ${
                      isSel ? 'text-white/90' : 'text-gray-500'
                    }`}>
                      {d.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SPECIALIST SELECTION (CLEAN & OPTIONAL) */}
          <StylistSelector
            slotsLoading={slotsLoading}
            slots={slots}
            selectedStaff={selectedStaff}
            setSelectedStaff={setSelectedStaff}
          />

          {/* 3. TIME SLOT SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-bold text-gray-900">
                3. Select Time Slot
              </label>
              {availableSlots.length > 0 && !slotsLoading && (
                <span className="text-xs text-gray-500 font-medium">
                  {availableSlots.length} slots available
                </span>
              )}
            </div>

            {slotsLoading ? (
              <div className="py-8 bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-primary">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-semibold text-gray-600">Loading open slots...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availableSlots.map((slot, idx) => {
                  const isSel = selectedSlot?.startTime === slot.startTime;
                  const isAvail = slot.isAvailable !== false;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isAvail}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer font-bold text-sm ${
                        isSel
                          ? 'bg-primary border-primary text-white shadow-sm ring-1 ring-primary'
                          : isAvail
                          ? 'bg-white border-gray-200 text-gray-800 hover:border-primary hover:text-primary hover:bg-pink-50/20'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {formatSlotTime(slot.startTime)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 bg-gray-50 rounded-xl text-center text-xs text-gray-500 border border-dashed border-gray-200 p-4">
                No slots available on this date. Please pick another date above.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default DateTimeSlotSelector;
