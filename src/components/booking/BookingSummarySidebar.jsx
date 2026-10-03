import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Scissors, 
  Clock, 
  Calendar as CalendarIcon, 
  User, 
  Wallet, 
  ChevronRight, 
  ArrowLeft,
  Loader2, 
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

const BookingSummarySidebar = ({
  currentStep,
  selectedResult,
  selectedServices = [],
  onRemoveService,
  selectedDate,
  selectedSlot,
  selectedStaff,
  appliedCoupons = {},
  couponDiscount = 0,
  walletBalance = 0,
  walletLoading = false,
  onOpenTopupModal,
  onNextStep,
  onPrevStep,
  nextDisabled = false,
  nextButtonLabel,
  loadingAction = false,
}) => {
  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.durationMinutes || 30), 0);
  const subtotal = selectedServices.reduce((sum, s) => {
    const price = s.offeredPrice || s.sellingPrice || s.costPrice || 0;
    return sum + price;
  }, 0);
  const netTotal = Math.max(0, subtotal - couponDiscount);
  const advanceRequired = parseFloat((netTotal * 0.2).toFixed(2));
  const hasSufficientWallet = walletBalance >= advanceRequired;

  const formatSlotTime = (timeVal) => {
    if (!timeVal) return '';
    return String(timeVal).trim();
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs sticky top-6 text-left space-y-5 font-outfit">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-150">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-50 text-primary flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Booking Summary
            </h3>
            <p className="text-xs text-gray-500">
              Step {currentStep} of 4
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-primary border border-pink-200">
          Verified Salon
        </span>
      </div>

      {/* Selected Provider Card */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
          Selected Lounge
        </span>
        {selectedResult ? (
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900 truncate">
                {selectedResult.provider?.businessName || 'Beauty Lounge'}
              </p>
              <span className="text-xs font-semibold text-primary bg-pink-50 px-2 py-0.5 rounded-md">
                ★ {selectedResult.provider?.rating || 5}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate flex items-center gap-1">
              <MapPin size={13} className="text-primary shrink-0" />
              {selectedResult.provider?.address || selectedResult.provider?.city || 'Delhi'}
            </p>
          </div>
        ) : (
          <div className="py-3.5 px-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs font-medium text-gray-400 text-center">
            No salon selected yet
          </div>
        )}
      </div>

      {/* Selected Services List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Selected Treatments ({selectedServices.length})
          </span>
          {totalDuration > 0 && (
            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <Clock size={12} className="text-primary" /> {totalDuration} Mins
            </span>
          )}
        </div>

        {selectedServices.length > 0 ? (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
            {selectedServices.map((service) => {
              const price = service.offeredPrice || service.sellingPrice || service.costPrice || 0;
              return (
                <div
                  key={service._id}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate capitalize">
                      {service.title || service.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {service.durationMinutes || 30} mins
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      ₹{price}
                    </span>
                    {onRemoveService && (
                      <button
                        type="button"
                        onClick={() => onRemoveService(service)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Remove service"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-3.5 px-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs font-medium text-gray-400 text-center">
            No treatments selected
          </div>
        )}
      </div>

      {/* Schedule Info (Date & Slot) */}
      {(selectedDate || selectedSlot) && (
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
            Schedule & Specialist
          </span>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs sm:text-sm text-gray-700">
            {selectedDate && (
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-primary shrink-0" />
                <span className="font-semibold text-gray-900">{selectedDate}</span>
              </div>
            )}
            {selectedSlot && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-primary shrink-0" />
                <span className="font-semibold text-gray-900">
                  {formatSlotTime(selectedSlot.startTime)} - {formatSlotTime(selectedSlot.endTime)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <User size={14} className="text-primary shrink-0" />
              <span className="font-medium">{selectedStaff ? selectedStaff.name : 'Any Specialist'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Financials & 20% Wallet Advance Box */}
      <div className="pt-3 border-t border-gray-150 space-y-3">
        <div className="space-y-2 text-sm font-medium">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-gray-900">₹{subtotal}</span>
          </div>

          {/* Per-service coupon breakdown */}
          {Object.entries(appliedCoupons).map(([svcId, c]) => (
            <div key={svcId} className="flex justify-between text-emerald-600 text-xs">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={11} className="shrink-0" />
                {c.code}:
              </span>
              <span className="font-semibold">-₹{c.discountAmount}</span>
            </div>
          ))}

          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Total Savings:</span>
              <span>-₹{couponDiscount}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-150">
            <span>Total Amount:</span>
            <span>₹{netTotal}</span>
          </div>
        </div>

        {/* 20% Wallet Advance Box */}
        {netTotal > 0 && (
          <div className={`p-4 rounded-xl border transition-all ${
            hasSufficientWallet 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/90 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                <Wallet size={15} /> 20% Wallet Advance:
              </span>
              <span className="text-base font-black">₹{advanceRequired}</span>
            </div>

            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-black/5">
              <span className="text-gray-600">Your Wallet:</span>
              <span className={hasSufficientWallet ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                ₹{walletBalance} ({hasSufficientWallet ? 'Sufficient' : 'Shortfall'})
              </span>
            </div>

            {!hasSufficientWallet && onOpenTopupModal && (
              <button
                type="button"
                onClick={onOpenTopupModal}
                className="w-full mt-2.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                + Recharge Wallet
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation CTA Buttons */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={onNextStep}
          disabled={nextDisabled || loadingAction}
          className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          {loadingAction ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{nextButtonLabel || 'Continue'}</span>
              <ChevronRight size={16} />
            </>
          )}
        </button>

        {currentStep > 1 && onPrevStep && (
          <button
            type="button"
            onClick={onPrevStep}
            className="w-full py-2 px-3 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Go Back</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default BookingSummarySidebar;
