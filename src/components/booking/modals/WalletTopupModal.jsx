import React, { useState } from 'react';
import { X, Wallet, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { addWalletBalance } from '../../../api/walletService';
import { toast } from '../../../utils/toast';

const QUICK_AMOUNTS = [200, 500, 1000, 2000];

const WalletTopupModal = ({ isOpen, onClose, shortfall = 0, currentBalance = 0, onSuccess }) => {
  const [amount, setAmount] = useState(() => (shortfall > 0 ? Math.ceil(shortfall) : 500));
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      const res = await addWalletBalance({
        amount: Number(amount),
        reason: 'TOPUP',
        description: 'Instant recharge for Service Booking Advance'
      });

      if (res?.success) {
        toast.success(`Successfully added ₹${amount} to your wallet!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res?.message || 'Failed to top up wallet.');
      }
    } catch (err) {
      console.error('Wallet topup error:', err);
      toast.error('Failed to recharge wallet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs font-outfit animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-150 p-6 text-left animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-150">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-primary flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Recharge Wallet
              </h3>
              <p className="text-xs font-medium text-gray-500">
                Current Balance: ₹{currentBalance}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortfall Notice */}
        {shortfall > 0 && (
          <div className="my-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <p className="font-bold text-sm">
              Appointment Shortfall: ₹{Math.ceil(shortfall)}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Add at least ₹{Math.ceil(shortfall)} to pay the 20% booking advance securely.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleTopup} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Top-up Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
              <input
                type="number"
                min="10"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 outline-none focus:border-primary transition-all bg-white"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${amount === val
                    ? 'bg-primary border-primary text-white shadow-xs'
                    : 'bg-gray-50 border-gray-250 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                +₹{val}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>Add Balance</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default WalletTopupModal;
