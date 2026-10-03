import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  CreditCard, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  Lock,
  Smartphone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import UserSidebar from './UserSidebar';
import { toast } from '../../utils/toast';

const Payments = () => {
  const [cards, setCards] = useState([
    {
      id: 1,
      number: '•••• •••• •••• 4202',
      holder: 'KAPIL KHATRI',
      expiry: '12/29',
      brand: 'VISA',
      primary: true,
      bg: 'from-purple-600 via-indigo-700 to-blue-800'
    },
    {
      id: 2,
      number: '•••• •••• •••• 8810',
      holder: 'KAPIL KHATRI',
      expiry: '04/28',
      brand: 'MASTERCARD',
      primary: false,
      bg: 'from-amber-600 via-orange-600 to-red-700'
    }
  ]);

  const [upis, setUpis] = useState([
    { id: 1, handle: 'kapilkhatri@okaxis', provider: 'Axis UPI', primary: true },
    { id: 2, handle: 'kapilkhatri@ybl', provider: 'PhonePe UPI', primary: false }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
    brand: 'VISA'
  });

  const handleCopyUPI = (handle) => {
    navigator.clipboard.writeText(handle);
    toast.success('UPI Handle copied!');
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!cardForm.number || !cardForm.holder || !cardForm.expiry || !cardForm.cvv) {
      toast.error('Please fill in all card details.');
      return;
    }
    if (cardForm.number.replace(/\s/g, '').length < 16) {
      toast.error('Invalid Card Number.');
      return;
    }
    
    setIsAdding(true);
    setTimeout(() => {
      const formattedNum = `•••• •••• •••• ${cardForm.number.slice(-4)}`;
      const randomBgs = [
        'from-pink-600 via-rose-700 to-red-800',
        'from-emerald-600 via-teal-700 to-cyan-800',
        'from-blue-600 via-indigo-700 to-violet-800',
        'from-zinc-700 via-slate-800 to-gray-950'
      ];
      const newCard = {
        id: Date.now(),
        number: formattedNum,
        holder: cardForm.holder.toUpperCase(),
        expiry: cardForm.expiry,
        brand: cardForm.brand,
        primary: cards.length === 0,
        bg: randomBgs[Math.floor(Math.random() * randomBgs.length)]
      };
      setCards(prev => [...prev, newCard]);
      setIsAdding(false);
      setShowForm(false);
      setCardForm({ number: '', holder: '', expiry: '', cvv: '', brand: 'VISA' });
      toast.success('Card added successfully!');
    }, 1500);
  };

  const handleDeleteCard = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 text-left">
        <p className="text-sm font-bold text-gray-800">Remove this card?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              setCards(prev => prev.filter(c => c.id !== id));
              toast.success('Saved payment method removed.');
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
          >
            Yes, Remove
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleDeleteUPI = (id) => {
    setUpis(prev => prev.filter(u => u.id !== id));
    toast.success('UPI handle removed.');
  };

  const formatCardNumberInput = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryInput = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 font-outfit">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8 text-left">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">Saved Payments</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <UserSidebar />

          {/* Right Content */}
          <div className="flex-grow text-left">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] overflow-hidden p-6 flex flex-col justify-between">
              
              <div>
                {/* Header */}
                <div className="border-b border-gray-100 pb-6 flex items-center justify-between">
                  <h1 className="text-xl font-extrabold text-gray-900 uppercase flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" /> Saved Payment Methods
                  </h1>
                  {!showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer"
                    >
                      <Plus size={14} /> Add New Card
                    </button>
                  )}
                </div>

                {/* ─── Add Card Form ──────────────────────────────── */}
                {showForm && (
                  <div className="mt-6 p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xs font-bold uppercase text-gray-900">Add Credit / Debit Card</h2>
                      <button 
                        onClick={() => setShowForm(false)}
                        className="p-1.5 hover:bg-gray-200 text-gray-400 rounded-lg cursor-pointer transition-all"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <form onSubmit={handleAddCardSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-sm font-bold text-gray-400 uppercase mb-1 block">Card Number</label>
                        <input 
                          type="text"
                          maxLength={19}
                          value={cardForm.number}
                          onChange={e => setCardForm(f => ({ ...f, number: formatCardNumberInput(e.target.value) }))}
                          placeholder="0000 0000 0000 0000"
                          className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-gray-400 uppercase mb-1 block">Card Brand</label>
                        <select 
                          value={cardForm.brand}
                          onChange={e => setCardForm(f => ({ ...f, brand: e.target.value }))}
                          className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-2.5 text-sm font-bold uppercase outline-none transition-all bg-white"
                        >
                          <option value="VISA">Visa</option>
                          <option value="MASTERCARD">MasterCard</option>
                          <option value="RUPAY">RuPay</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-sm font-bold text-gray-400 uppercase mb-1 block">Cardholder Name</label>
                        <input 
                          type="text"
                          value={cardForm.holder}
                          onChange={e => setCardForm(f => ({ ...f, holder: e.target.value }))}
                          placeholder="NAME ON CARD"
                          className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-2.5 text-sm font-bold uppercase outline-none transition-all bg-white"
                        />
                      </div>

                      <div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-1 block">Expiry</label>
                            <input 
                              type="text"
                              maxLength={5}
                              value={cardForm.expiry}
                              onChange={e => setCardForm(f => ({ ...f, expiry: formatExpiryInput(e.target.value) }))}
                              placeholder="MM/YY"
                              className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-1 block">CVV</label>
                            <input 
                              type="password"
                              maxLength={3}
                              value={cardForm.cvv}
                              onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/[^0-9]/gi, '') }))}
                              placeholder="***"
                              className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-3 flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isAdding}
                          className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {isAdding ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          Save Card Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ─── Cards Grid ─────────────────────────────────── */}
                <div className="mt-8">
                  <h2 className="text-sm font-extrabold text-gray-800 uppercase mb-4">Credit / Debit Cards</h2>
                  {cards.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl py-12 text-center text-gray-400 mb-6">
                      <CreditCard className="mx-auto mb-2 text-gray-300" size={32} />
                      <p className="text-xs font-bold uppercase">No saved cards found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {cards.map((card) => (
                        <div 
                          key={card.id}
                          className={`relative rounded-3xl p-6 text-white shadow-lg bg-gradient-to-br ${card.bg} group transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[190px]`}
                        >
                          {/* Holographic chip simulation */}
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-8 rounded-lg bg-yellow-400/80 border border-yellow-300 shadow flex items-center justify-center overflow-hidden">
                              <span className="text-sm text-yellow-800 font-mono font-bold tracking-tight">CHIP</span>
                            </div>
                            <span className="text-sm font-bold italic tracking-wider">{card.brand}</span>
                          </div>

                          {/* Card Number */}
                          <div className="my-5">
                            <p className="text-lg font-bold tracking-wider font-mono text-white/95">{card.number}</p>
                          </div>

                          {/* Holder & Expiry details */}
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Card Holder</p>
                              <p className="text-xs font-bold font-mono tracking-wide mt-0.5 uppercase">{card.holder}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Expires</p>
                              <p className="text-xs font-bold font-mono tracking-wide mt-0.5">{card.expiry}</p>
                            </div>
                          </div>

                          {/* Delete overlay button */}
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-red-500 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                            title="Remove Card"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ─── UPI handles ────────────────────────────────── */}
                <div className="mt-10 pt-10 border-t border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800 uppercase mb-4">Saved UPI Handles</h2>
                  {upis.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl py-8 text-center text-gray-400">
                      <Smartphone className="mx-auto mb-2 text-gray-300" size={28} />
                      <p className="text-xs font-bold uppercase">No linked UPI handles</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upis.map((upi) => (
                        <div 
                          key={upi.id}
                          className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50/50 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-500">
                              <Smartphone size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{upi.provider}</p>
                              <code onClick={() => handleCopyUPI(upi.handle)} className="text-xs font-bold text-gray-500 cursor-pointer hover:text-primary transition-colors mt-0.5 block">{upi.handle}</code>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {upi.primary && (
                              <span className="text-xs font-bold uppercase text-green-700 bg-green-50 border border-green-100/50 px-2.5 py-1 rounded-md">Primary</span>
                            )}
                            <button 
                              onClick={() => handleDeleteUPI(upi.id)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition-all"
                              title="Delete UPI handle"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Security Shield checkout info */}
              <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left bg-gray-50/50 p-4 rounded-2xl border border-gray-100/80">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 border border-green-100 flex-shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1">
                    <Lock size={12} className="text-green-600" /> PCI-DSS Compliant Encryption
                  </p>
                  <p className="text-sm text-gray-400 font-bold uppercase leading-relaxed max-w-xl">
                    Your full card details are securely encrypted on merchant token vault storage. We strictly follow PCI-DSS certification tier guidelines.
                  </p>
                </div>
              </div>

            </div>
          </div>{/* end right */}

        </div>
      </div>
    </div>
  );
};

export default Payments;
