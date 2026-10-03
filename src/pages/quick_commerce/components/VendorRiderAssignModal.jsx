import React from 'react';
import { Truck, X, MapPin, Phone, Zap } from 'lucide-react';

const VendorRiderAssignModal = ({
  assigningOrderId,
  setAssigningOrderId,
  orders = [],
  riders = [],
  handleAssignRider
}) => {
  if (!assigningOrderId) return null;

  const targetOrder = orders.find(o => o._id === assigningOrderId);
  // Filter free riders (AVAILABLE or offline/unassigned)
  const freeRiders = riders.filter(r => r.status === 'AVAILABLE' || !r.status || r.status === 'ONLINE');
  const busyRiders = riders.filter(r => r.status === 'ON_DELIVERY' || r.status === 'BUSY' || r.status === 'BREAK');
  const displayRiders = [...freeRiders, ...busyRiders];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden text-left my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="bg-white/20 p-2 rounded-xl text-white inline-flex">
              <Truck size={22} />
            </span>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">Assign Express Rider</h3>
              <p className="text-rose-100 text-xs font-mono font-bold">
                Order #{assigningOrderId?.substring(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAssigningOrderId(null)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {targetOrder && (
            <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-2xl text-xs space-y-1">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">Customer Info</span>
              <p className="font-extrabold text-slate-800 uppercase">
                {targetOrder.quickOrderId?.customerId?.name || 'Customer'}
              </p>
              {targetOrder.quickOrderId?.shippingAddress && (
                <p className="text-slate-500 font-medium text-xs flex items-center gap-1">
                  <MapPin size={12} className="text-primary inline" />
                  <span>{targetOrder.quickOrderId.shippingAddress.line1}, {targetOrder.quickOrderId.shippingAddress.city}</span>
                </p>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Riders List ({freeRiders.length} Free / {displayRiders.length} Total)
              </span>
            </div>

            {displayRiders.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <Truck className="mx-auto mb-2 text-slate-300" size={32} />
                <p className="text-xs font-bold text-slate-600">No Registered Riders Found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Please register a rider in the "Riders Roster" section on the left first!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayRiders.map((r) => {
                  const isFree = r.status === 'AVAILABLE' || !r.status || r.status === 'ONLINE';
                  return (
                    <div
                      key={r._id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs ${
                        isFree
                          ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-400'
                          : 'border-slate-200 bg-slate-50/50 opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <Truck size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-slate-900 text-xs truncate">{r.name}</p>
                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                              isFree
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              {isFree ? 'FREE' : 'BUSY'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Phone size={12} /> {r.phone}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAssignRider(assigningOrderId, r._id)}
                        className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          isFree
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-800 hover:bg-primary text-white'
                        }`}
                      >
                        <Truck size={12} />
                        <span>Assign</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setAssigningOrderId(null)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorRiderAssignModal;
