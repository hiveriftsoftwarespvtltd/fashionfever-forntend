import React from 'react';
import { X, Compass, Loader2, Navigation, AlertCircle, MapPin, Zap } from 'lucide-react';

const CustomerLocationPromptModal = ({
  showLocationPromptModal,
  setShowLocationPromptModal,
  handleDetectLocation,
  detectingLocation,
  handleManualPincodeSubmit,
  manualPincodeInput,
  setManualPincodeInput,
  locationError,
  pincode,
  isAuthenticated,
  addresses = [],
  selectedAddressId,
  setSelectedAddressId,
  setPincode
}) => {
  if (!showLocationPromptModal) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Close button */}
        {pincode && (
          <button
            onClick={() => setShowLocationPromptModal(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}

        <div className="mb-6 flex justify-center">
          <div className="bg-rose-50 p-4 rounded-3xl text-primary animate-bounce duration-1000">
            <Compass size={36} />
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-800 tracking-tight">
          Where should we deliver? ⚡
        </h3>
        <p className="text-xs text-slate-500 font-semibold mt-2 mb-6 max-w-xs mx-auto">
          Please enter your pincode or use current location to see cosmetic items available for 10-minute delivery in your area!
        </p>

        <div className="flex flex-col gap-3">
          {/* Option A: Detect location */}
          <button
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold uppercase py-3.5 rounded-2xl shadow-md text-xs tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
          >
            {detectingLocation ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Detecting Location...</span>
              </>
            ) : (
              <>
                <Navigation size={14} className="fill-white" />
                <span>Use Current Location</span>
              </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-150"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or enter manually</span>
            <div className="flex-grow border-t border-slate-150"></div>
          </div>

          {/* Option B: Manual Pincode */}
          <form onSubmit={handleManualPincodeSubmit} className="flex gap-2">
            <input
              type="text"
              pattern="\d*"
              maxLength={6}
              value={manualPincodeInput}
              onChange={(e) => setManualPincodeInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit Pincode"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary transition-colors text-center"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white font-extrabold uppercase px-5 rounded-2xl shadow-lg shadow-primary/20 text-xs tracking-wider cursor-pointer transition-colors active:scale-[0.98] inline-flex items-center gap-1"
            >
              <span>Go</span>
              <Zap size={12} className="fill-white" />
            </button>
          </form>

          {locationError && (
            <p className="text-xs font-bold text-rose-500 mt-1 uppercase flex items-center justify-center gap-1">
              <AlertCircle size={10} />
              <span>{locationError}</span>
            </p>
          )}

          {/* Option C: Saved Addresses */}
          {isAuthenticated && addresses.length > 0 && (
            <div className="mt-4 text-left border-t border-slate-100 pt-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Or select saved address</p>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin">
                {addresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => {
                      setSelectedAddressId(addr._id);
                      if (addr.pincode) {
                        setPincode(addr.pincode.toString());
                        localStorage.setItem('quick_delivery_pincode', addr.pincode.toString());
                      }
                      setShowLocationPromptModal(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-semibold flex items-start gap-2 ${
                      selectedAddressId === addr._id
                        ? 'bg-rose-50/50 border-primary text-slate-800'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-655'
                    }`}
                  >
                    <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    <div className="truncate">
                      <p className="font-extrabold uppercase text-xs text-slate-800">{addr.addressType || 'Address'}</p>
                      <p className="truncate text-slate-500">{addr.streetAddress || addr.line1}, {addr.city} ({addr.pincode})</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLocationPromptModal;
