import React from 'react';
import { Loader2, Sparkles, User, Check } from 'lucide-react';

const StylistSelector = ({
  slotsLoading,
  slots = [],
  selectedStaff,
  setSelectedStaff
}) => {
  if (slotsLoading) {
    return null;
  }

  // Extract unique staff from slot details
  const allStaff = [];
  slots.forEach(slot => {
    if (slot.availableStaff) {
      slot.availableStaff.forEach(st => {
        if (!allStaff.some(item => item._id === st._id)) {
          allStaff.push(st);
        }
      });
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span>2. Select Specialist</span>
          <span className="text-xs font-normal text-gray-400">(Optional)</span>
        </label>

        {selectedStaff && (
          <button
            type="button"
            onClick={() => setSelectedStaff(null)}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Option 1: Any Specialist */}
        <button
          type="button"
          onClick={() => setSelectedStaff(null)}
          className={`py-2.5 px-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
            selectedStaff === null
              ? 'bg-pink-50/70 border-primary text-primary font-bold shadow-2xs'
              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Sparkles size={15} className={selectedStaff === null ? 'text-primary' : 'text-gray-400'} />
            <span className="text-xs truncate">Any Specialist (Fastest)</span>
          </div>
          {selectedStaff === null && <Check size={14} className="shrink-0 text-primary stroke-[3]" />}
        </button>

        {/* Named Specialists */}
        {allStaff.map(staff => {
          const isSel = selectedStaff?._id === staff._id;

          return (
            <button
              key={staff._id}
              type="button"
              onClick={() => setSelectedStaff(staff)}
              className={`py-2.5 px-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                isSel
                  ? 'bg-pink-50/70 border-primary text-primary font-bold shadow-2xs'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <User size={15} className={isSel ? 'text-primary' : 'text-gray-400'} />
                <span className="text-xs truncate">{staff.name}</span>
              </div>
              {isSel && <Check size={14} className="shrink-0 text-primary stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StylistSelector;
