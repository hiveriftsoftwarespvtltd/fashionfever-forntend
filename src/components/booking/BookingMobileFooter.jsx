import React, { useState } from 'react';
import { ChevronRight, ChevronUp, ChevronDown, Wallet, Loader2 } from 'lucide-react';

const BookingMobileFooter = ({
  currentStep,
  selectedServices = [],
  netTotal = 0,
  advanceRequired = 0,
  walletBalance = 0,
  onNextStep,
  nextDisabled = false,
  nextButtonLabel,
  loadingAction = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSufficientWallet = walletBalance >= advanceRequired;

  if (selectedServices.length === 0 && currentStep === 1) {
    return null;
  }

  // Format a concise mobile label so it NEVER breaks into double lines
  const getCleanMobileLabel = () => {
    if (!nextButtonLabel) return 'Continue';
    const label = String(nextButtonLabel);
    if (label.includes('Recharge Wallet')) {
      return 'Recharge & Pay';
    }
    if (label.includes('Confirm Booking')) {
      return `Pay ₹${advanceRequired}`;
    }
    if (label.includes('Continue to Treatments')) {
      return 'Treatments';
    }
    if (label.includes('Choose Schedule')) {
      return 'Schedule';
    }
    if (label.includes('Review & Pay Advance')) {
      return 'Review & Pay';
    }
    return label;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] font-outfit pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      
      {/* Optional Expanded Breakdown Drawer */}
      {isExpanded && (
        <div className="p-3.5 bg-gray-50 border-b border-gray-200 space-y-2 text-xs font-medium text-gray-700 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Treatments Selected ({selectedServices.length}):</span>
            <span className="font-bold text-gray-900">₹{netTotal}</span>
          </div>

          <div className="flex justify-between items-center text-primary pt-1.5 border-t border-gray-200">
            <span className="flex items-center gap-1 font-bold">
              <Wallet size={13} /> 20% Wallet Advance:
            </span>
            <span className="font-black text-sm">₹{advanceRequired}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Your Wallet Balance:</span>
            <span className={hasSufficientWallet ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
              ₹{walletBalance} ({hasSufficientWallet ? 'Sufficient' : 'Shortfall'})
            </span>
          </div>
        </div>
      )}

      {/* Main Single-line Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Summary Price & Toggle */}
        <div className="text-left min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-primary">
              ₹{advanceRequired}
            </span>
            <span className="text-[11px] font-semibold text-gray-500">
              Advance
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 transition-colors cursor-pointer truncate mt-0.5"
          >
            <span>Total ₹{netTotal} • {selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'}</span>
            {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>

        {/* Right: Clean, Single-line Action Button */}
        <button
          type="button"
          onClick={onNextStep}
          disabled={nextDisabled || loadingAction}
          className="px-4 sm:px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95"
        >
          {loadingAction ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Please wait...</span>
            </>
          ) : (
            <>
              <span>{getCleanMobileLabel()}</span>
              <ChevronRight size={14} className="stroke-[3]" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default BookingMobileFooter;
