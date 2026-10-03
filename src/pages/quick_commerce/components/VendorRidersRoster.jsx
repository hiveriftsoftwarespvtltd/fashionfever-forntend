import React from 'react';
import { Truck, Plus, X, Upload, Sliders, Eye } from 'lucide-react';

const VendorRidersRoster = ({
  riders = [],
  onNavigateToRiders,
  showRiderForm,
  editingRider,
  riderName,
  setRiderName,
  riderPhone,
  setRiderPhone,
  riderEmail,
  setRiderEmail,
  riderPassword,
  setRiderPassword,
  showRiderPassword,
  setShowRiderPassword,
  riderAadhar,
  setRiderAadhar,
  riderVehicleType,
  setRiderVehicleType,
  riderVehicleNumber,
  setRiderVehicleNumber,
  riderStatus,
  setRiderStatus,
  riderPhoto,
  setRiderPhoto,
  handleSaveRiderSubmit,
  handleOpenAddRider,
  handleOpenEditRider,
  handleDeleteRider,
  handleViewRiderDetails,
  resetRiderForm
}) => {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-primary" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Riders Roster</h3>
          <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full">
            {riders.length}
          </span>
        </div>
        <button
          onClick={() => {
            if (onNavigateToRiders) {
              onNavigateToRiders();
            } else if (showRiderForm) {
              resetRiderForm();
            } else {
              handleOpenAddRider();
            }
          }}
          className="bg-primary hover:bg-primary/95 text-white px-2.5 py-1 rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-[1.02]"
        >
          {showRiderForm ? (
            <>
              <X size={13} /> Cancel
            </>
          ) : (
            <>
              <Plus size={13} /> Onboard / Manage Riders
            </>
          )}
        </button>
      </div>

      {showRiderForm ? (
        <form onSubmit={handleSaveRiderSubmit} className="space-y-3.5 text-xs font-semibold text-slate-600 text-left">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary">
              {editingRider ? 'Edit Express Rider' : 'Register Express Rider'}
            </h4>
            {editingRider && (
              <span className="text-xs font-bold uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">
                Editing Mode
              </span>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 block mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="RIDER NAME"
              value={riderName}
              onChange={(e) => setRiderName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 outline-none font-medium text-xs"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 block mb-1">Phone Number *</label>
            <input
              type="tel"
              placeholder="PHONE NUMBER"
              value={riderPhone}
              onChange={(e) => setRiderPhone(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 outline-none font-medium text-xs"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 block mb-1">Email Address {editingRider ? '' : '*'}</label>
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={riderEmail}
              onChange={(e) => setRiderEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 outline-none font-medium text-xs"
              required={!editingRider}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 block mb-1">
              Password {editingRider ? '(Leave blank to keep existing)' : '*'}
            </label>
            <div className="relative">
              <input
                type={showRiderPassword ? 'text' : 'password'}
                placeholder={editingRider ? "NEW PASSWORD (OPTIONAL)" : "LOGIN PASSWORD"}
                value={riderPassword}
                onChange={(e) => setRiderPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-10 outline-none font-medium text-xs"
                required={!editingRider}
              />
              <button
                type="button"
                onClick={() => setShowRiderPassword(!showRiderPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                title={showRiderPassword ? "Hide Password" : "Show Password"}
              >
                {showRiderPassword ? <X size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 block mb-1">Aadhar Card No {editingRider ? '' : '*'}</label>
            <input
              type="text"
              placeholder="AADHAR CARD NO"
              value={riderAadhar}
              onChange={(e) => setRiderAadhar(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 outline-none font-medium text-xs"
              required={!editingRider}
            />
          </div>

          {editingRider && (
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 block mb-1">Duty Status</label>
              <select
                value={riderStatus}
                onChange={(e) => setRiderStatus(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 outline-none cursor-pointer font-bold text-xs"
              >
                <option value="AVAILABLE">AVAILABLE 🟢</option>
                <option value="ON_DELIVERY">ON DELIVERY 🔵</option>
                <option value="BREAK">ON BREAK 🟡</option>
                <option value="OFFLINE">OFFLINE ⚪</option>
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <div className="w-2/3">
              <label className="text-xs font-semibold uppercase text-slate-500 block mb-1">Vehicle No</label>
              <input
                type="text"
                placeholder="BIKE NO (OPTIONAL)"
                value={riderVehicleNumber}
                onChange={(e) => setRiderVehicleNumber(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 outline-none font-medium text-xs"
              />
            </div>
            <div className="w-1/3">
              <label className="text-xs font-semibold uppercase text-slate-500 block mb-1">Type</label>
              <select
                value={riderVehicleType}
                onChange={(e) => setRiderVehicleType(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 outline-none cursor-pointer font-bold text-xs"
              >
                <option value="motorcycle">Bike</option>
                <option value="bicycle">Bicycle</option>
                <option value="walking">Foot</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Profile Pic:</span>
            <label className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-800 text-xs">
              <Upload size={12} />
              <span>{editingRider ? 'Change Photo' : 'Upload'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setRiderPhoto(e.target.files[0])}
                className="hidden"
              />
            </label>
            {riderPhoto && <span className="text-xs text-emerald-600 font-bold truncate max-w-[100px]">{riderPhoto.name}</span>}
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-200/60">
            <button
              type="button"
              onClick={resetRiderForm}
              className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-600 py-2.5 rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 bg-primary hover:bg-primary/95 text-white py-2.5 rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-md text-xs"
            >
              {editingRider ? 'Save Changes' : 'Submit Rider'}
            </button>
          </div>
        </form>
      ) : riders.length === 0 ? (
        <div className="text-center py-8">
          <Truck className="mx-auto mb-2 text-slate-350 stroke-[1.5]" size={28} />
          <p className="text-xs font-bold uppercase text-slate-500">No delivery riders registered</p>
          <button
            onClick={handleOpenAddRider}
            className="mt-2 text-xs font-bold uppercase text-primary hover:underline cursor-pointer"
          >
            + Onboard a rider
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
          {riders.map((r) => (
            <div key={r._id} className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col gap-2 shadow-xs hover:shadow-sm transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-left">
                  {r.profilePhoto?.url ? (
                    <img
                      src={r.profilePhoto.url}
                      alt={r.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-black text-sm uppercase">
                      {r.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                      {r.name}
                    </h4>
                    <span className="text-xs font-medium text-slate-500 block mt-0.5 capitalize font-mono">
                      {r.vehicleType} • {r.phone}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                  r.status === 'AVAILABLE'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : r.status === 'ON_DELIVERY'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : r.status === 'BREAK'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  {r.status || 'AVAILABLE'}
                </span>
              </div>

              {/* Action buttons bar */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 text-xs font-semibold">
                <button
                  onClick={() => handleViewRiderDetails(r._id)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                  title="View Rider Performance Stats"
                >
                  <Eye size={12} /> Metrics
                </button>
                <button
                  onClick={() => handleOpenEditRider(r)}
                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Edit Rider Details"
                >
                  <Sliders size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteRider(r)}
                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Deboard Rider"
                >
                  <X size={11} /> Deboard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorRidersRoster;
