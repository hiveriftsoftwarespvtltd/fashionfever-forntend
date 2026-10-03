import React from 'react';
import { X, Phone } from 'lucide-react';

const VendorRiderMetricsModal = ({
  viewingRider,
  setViewingRider,
  formatDate
}) => {
  if (!viewingRider) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl relative border border-slate-100 text-left animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setViewingRider(null)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
          {viewingRider.profilePhoto?.url ? (
            <img
              src={viewingRider.profilePhoto.url}
              alt={viewingRider.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center font-black text-xl uppercase shadow-xs">
              {viewingRider.name?.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-base font-black text-slate-800 uppercase flex items-center gap-2">
              {viewingRider.name}
            </h3>
            <p className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
              <Phone size={12} /> {viewingRider.phone}
            </p>
            <span className={`inline-block mt-1 text-xs font-bold uppercase px-2.5 py-0.5 rounded-md border ${
              viewingRider.status === 'AVAILABLE'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : viewingRider.status === 'ON_DELIVERY'
                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                  : viewingRider.status === 'BREAK'
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
              {viewingRider.status || 'AVAILABLE'}
            </span>
          </div>
        </div>

        {/* Performance Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Delivered Orders</span>
            <span className="text-xl font-black text-slate-800">{viewingRider.totalDeliveredOrders || 0}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Avg Delivery Time</span>
            <span className="text-xl font-black text-primary">{viewingRider.avgDeliveryTimeInMinutes || 0} <span className="text-xs font-bold text-slate-500">Mins</span></span>
          </div>
        </div>

        {/* Rider Credentials & Details */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs font-semibold text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase text-xs">Email</span>
            <span className="font-mono font-bold text-slate-800">{viewingRider.userId?.email || viewingRider.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase text-xs">Vehicle</span>
            <span className="font-bold text-slate-800 capitalize">{viewingRider.vehicleType || 'motorcycle'} ({viewingRider.vehicleNumber || 'N/A'})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase text-xs">Aadhar No</span>
            <span className="font-mono font-bold text-slate-800">{viewingRider.aadharNumber || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase text-xs">Joined Date</span>
            <span className="font-bold text-slate-800">{formatDate(viewingRider.createdAt)}</span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={() => setViewingRider(null)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs py-3 rounded-2xl transition-colors cursor-pointer text-center"
          >
            Close Metrics
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorRiderMetricsModal;
