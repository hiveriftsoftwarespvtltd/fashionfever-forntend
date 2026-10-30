import React from 'react';
import { Info, Scissors, Clock, Check } from 'lucide-react';

const ServicesCatalog = ({
  selectedResult,
  selectedServices,
  handleToggleService,
  servicesRef
}) => {
  return (
    <div ref={servicesRef} className="space-y-6 scroll-mt-24">
      <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
        <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-gray-800 flex items-center gap-2">
          <span className="bg-primary text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-bold">2</span>
          Choose Services
        </h2>
      </div>

      {!selectedResult ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-4">
          <div className="w-14 h-14 rounded-full bg-pink-100/60 border border-pink-200/50 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-[#ff4d6d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 mb-1">No Lounge Selected</h3>
          <p className="text-xs text-gray-500 font-medium max-w-xs leading-relaxed">
            Please select a lounge above first to unlock their catalog services.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Catalog Header Banner */}
          <div className="p-3.5 bg-pink-50/60 border border-pink-100 rounded-2xl flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold text-[#ff4d6d] uppercase truncate">
                Catalog for {selectedResult.provider.businessName}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Click items to add or remove them from your appointment
              </p>
            </div>
            <span className="text-xs font-bold text-white bg-[#ff4d6d] px-3 py-1 rounded-full shrink-0 shadow-2xs whitespace-nowrap inline-flex items-center gap-1">
              <span>{selectedResult.services?.length || 0}</span>
              <span>Available</span>
            </span>
          </div>

          {/* Single Column Services List */}
          <div className="space-y-3">
            {selectedResult.services && selectedResult.services.length > 0 ? (
              selectedResult.services.map((service) => {
                const isChecked = selectedServices.some(s => s._id === service._id);
                const price = service.offeredPrice || service.sellingPrice || service.costPrice || 0;

                return (
                  <div
                    key={service._id}
                    onClick={() => handleToggleService(service)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 bg-white ${isChecked
                        ? 'border-[#ff4d6d] ring-2 ring-[#ff4d6d]/10 bg-pink-50/20 shadow-xs'
                        : 'border-gray-150 hover:border-gray-300 hover:shadow-2xs'
                      }`}
                  >
                    {/* Left: Cover Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 flex items-center justify-center">
                      {service.images?.[0]?.url ? (
                        <img src={service.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Scissors size={20} className="text-gray-300" />
                      )}
                    </div>

                    {/* Center: Service Name, Description, Duration, Type */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xs font-bold truncate ${isChecked ? 'text-[#ff4d6d]' : 'text-gray-900'}`}>
                        {service.title || service.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                        {service.description || 'Beauty service'}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} className="text-gray-400" /> {service.durationMinutes || 30} MIN
                        </span>
                        {service.serviceType && (
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded-md text-xs uppercase font-semibold text-gray-500">
                            {service.serviceType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Price & Check Icon */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span className={`text-xs font-extrabold ${isChecked ? 'text-[#ff4d6d]' : 'text-gray-900'}`}>
                        ₹{price}
                      </span>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isChecked ? 'bg-[#ff4d6d] border-[#ff4d6d] text-white shadow-2xs' : 'border-gray-300 bg-white'
                        }`}>
                        {isChecked && <Check size={11} className="stroke-[3]" />}
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-12 bg-white rounded-2xl border border-gray-150 text-center text-gray-400 text-xs font-bold">
                No Services Listed by this Lounge
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ServicesCatalog;
