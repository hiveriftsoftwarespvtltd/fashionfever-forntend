import React from 'react';
import { Sparkles, Calendar as CalendarIcon, Clock, Users, Loader2, ChevronRight } from 'lucide-react';

const BookingSummary = ({
  selectedResult,
  selectedServices,
  selectedDate,
  selectedSlot,
  selectedStaff,
  calculateTotal,
  handleConfirmBooking,
  bookingConfirmLoading
}) => {
  // Helper to format slot time safely without Invalid Date errors
  const formatSlotTime = (timeVal) => {
    if (!timeVal) return '';
    const str = String(timeVal).trim();
    if (str.toUpperCase().includes('AM') || str.toUpperCase().includes('PM') || str.includes(':')) {
      return str;
    }
    try {
      const date = new Date(str);
      if (isNaN(date.getTime())) {
        return str;
      }
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return str;
    }
  };

  return (
    <>
      {/* Desktop Sticky Booking Summary Panel */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xl sticky top-8 text-left space-y-6">
        
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <Sparkles size={16} className="text-primary" />
          <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider">
            Booking Summary
          </h3>
        </div>

        {/* Step 1 summary: Lounge details */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-gray-400 block">1. Lounge Location</span>
          {selectedResult ? (
            <div className="p-3 bg-gray-50 border border-gray-150 rounded-2xl space-y-0.5">
              <p className="text-[11px] font-black text-gray-800 uppercase truncate">
                {selectedResult.provider.businessName}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase truncate">
                {selectedResult.provider.address}, {selectedResult.provider.city}
              </p>
            </div>
          ) : (
            <div className="py-5 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-xs font-bold uppercase">
              No lounge selected
            </div>
          )}
        </div>

        {/* Step 2 summary: Services catalog items */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-gray-400 block">
            2. Services Selected ({selectedServices.length})
          </span>
          {selectedServices.length > 0 ? (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {selectedServices.map(s => {
                const price = s.offeredPrice || s.sellingPrice || s.costPrice || 0;
                return (
                  <div key={s._id} className="flex justify-between items-center gap-2 text-sm font-black uppercase">
                    <span className="text-gray-600 truncate flex-1">{s.title}</span>
                    <span className="text-gray-800 font-extrabold flex-shrink-0">₹{price}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-5 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-xs font-bold uppercase">
              No services selected
            </div>
          )}
        </div>

        {/* Step 3 summary: Schedule slot and Stylist details */}
        {selectedResult && selectedServices.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-gray-400 block">3. Slot & Stylist</span>
            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl space-y-2 text-sm font-black uppercase text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarIcon size={12} className="text-primary flex-shrink-0" />
                <span>{selectedDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={12} className="text-primary flex-shrink-0" />
                <span>{selectedSlot ? `${formatSlotTime(selectedSlot.startTime)} - ${formatSlotTime(selectedSlot.endTime)}` : 'Choose Time Slot'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users size={12} className="text-primary flex-shrink-0" />
                <span>{selectedStaff ? selectedStaff.name : 'Any Stylist'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Final totals and Booking trigger checkout button */}
        {selectedResult && selectedServices.length > 0 && (
          <div className="pt-5 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center text-xs font-black uppercase">
              <span className="text-gray-500">Total Price</span>
              <span className="text-base text-primary">₹{calculateTotal()}</span>
            </div>

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={!selectedSlot || bookingConfirmLoading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:shadow-none"
            >
              {bookingConfirmLoading ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Confirming...
                </>
              ) : (
                <>
                  Confirm Booking <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* MOBILE-ONLY FLOATING ACTION SHEET */}
      {selectedResult && selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200/80 shadow-2xl p-4 lg:hidden flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="text-left min-w-0">
            <p className="text-[11px] font-black uppercase text-gray-400 leading-none">
              Total ({selectedServices.length} Services)
            </p>
            <p className="text-base font-black text-primary leading-tight mt-1">
              ₹{calculateTotal()}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase truncate mt-0.5 leading-none">
              Lounge: {selectedResult.provider.businessName}
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirmBooking}
            disabled={!selectedSlot || bookingConfirmLoading}
            className="bg-primary hover:bg-primary/95 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-sm shadow-md shadow-primary/25 flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {bookingConfirmLoading ? (
              <>
                <Loader2 className="animate-spin" size={13} /> Booking...
              </>
            ) : (
              <>
                Book Slot <ChevronRight size={13} />
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default BookingSummary;
