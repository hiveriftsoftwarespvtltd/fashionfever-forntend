import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  Server, 
  MapPin, 
  CreditCard, 
  Bell, 
  CheckCircle2, 
  ChevronRight,
  Mail,
  Phone,
  HelpCircle
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('collect');

  const sections = [
    { id: 'collect', title: '1. Information We Collect', icon: <FileText size={18} /> },
    { id: 'usage', title: '2. How We Use Your Data', icon: <Eye size={18} /> },
    { id: 'security', title: '3. Payment & Security', icon: <Lock size={18} /> },
    { id: 'location', title: '4. Location & GPS Data', icon: <MapPin size={18} /> },
    { id: 'sharing', title: '5. Data Sharing & Third Parties', icon: <Server size={18} /> },
    { id: 'cookies', title: '6. Cookies & Tracking', icon: <ShieldCheck size={18} /> },
    { id: 'rights', title: '7. Your Privacy Rights', icon: <CheckCircle2 size={18} /> },
    { id: 'contact', title: '8. Contact Privacy Team', icon: <Mail size={18} /> },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-8 pb-20 font-outfit text-left">
      {/* ── 1. Hero Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-rose-950 text-white py-14 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden shadow-lg">
        {/* Background Decorative Circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-rose-300 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white">Privacy Policy</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-2xl mt-2 leading-relaxed">
                Your trust is our utmost priority. Learn how FashionFever (WakeUp MakeUp) collects, safeguards, and respects your personal information.
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold">
                <Lock size={16} className="text-rose-400" />
                <span>Last Updated: July 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Policy Content Layout ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sticky Navigation Sidebar (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-left">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-2">
                Table of Contents
              </h3>
              <div className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                      activeSection === sec.id
                        ? 'bg-rose-50 text-primary border border-rose-200/80 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <span className={activeSection === sec.id ? 'text-primary' : 'text-slate-400'}>
                      {sec.icon}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Need Help Box */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-100/60 rounded-3xl p-6 border border-rose-200/80 shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
                <HelpCircle size={20} />
              </div>
              <h4 className="text-sm font-black uppercase text-slate-900 tracking-wide">
                Have Privacy Questions?
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Our Data Protection Officer is ready to assist you with any questions regarding your data privacy.
              </p>
              <a
                href="mailto:privacy@fashionfever.in"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-primary hover:underline pt-1"
              >
                <Mail size={14} /> privacy@fashionfever.in
              </a>
            </div>
          </div>

          {/* Main Detail Content Area (8 cols) */}
          <div className="lg:col-span-8 space-y-8 text-left">
            
            {/* Intro Alert Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-wider">
                <ShieldCheck size={18} />
                <span>Our Privacy Commitment</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                At <strong>FashionFever (WakeUp MakeUp)</strong>, we are committed to maintaining the trust and confidence of our users. This Privacy Policy details how we collect, store, process, and protect your information across our website, mobile applications, salon booking portal, pro academy, and 10-minute quick e-commerce delivery network.
              </p>
            </div>

            {/* Section 1: Information We Collect */}
            <section id="collect" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 scroll-mt-28">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 text-primary rounded-2xl">
                  <FileText size={20} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wide">1. Information We Collect</h2>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                We collect personal information that you voluntarily provide to us when registering for an account, expressing interest in obtaining information about us or our services, placing an order, or booking a salon/spa appointment.
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-medium list-disc pl-5">
                <li><strong>Personal Identity Data:</strong> Full name, email address, phone number, date of birth, and avatar image.</li>
                <li><strong>Transaction & Order Data:</strong> Items purchased, quick commerce bag contents, appointment booking dates, and payment status receipts.</li>
                <li><strong>Delivery & Address Data:</strong> Street address, city, state, pincode, landmark, and GPS pin coordinates for 10-minute lightning delivery.</li>
                <li><strong>Vendor & Professional Data:</strong> Business license, GST details, bank payout details, service menus, and stylist roster schedules.</li>
              </ul>
            </section>

            {/* Section 2: How We Use Your Data */}
            <section id="usage" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 scroll-mt-28">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 text-primary rounded-2xl">
                  <Eye size={20} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wide">2. How We Use Your Data</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                We use the information we collect or receive for various legitimate business purposes:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-800">Order & Booking Fulfillment</h4>
                  <p className="text-xs text-slate-500 font-medium">To process purchases, allocate salon stylists, dispatch 10-minute riders, and issue e-receipts.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-800">Customer Support & Updates</h4>
                  <p className="text-xs text-slate-500 font-medium">To notify you of order status changes, appointment reminders via SMS/WhatsApp, and support tickets.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-800">Commission & Payouts</h4>
                  <p className="text-xs text-slate-500 font-medium">To calculate and disburse affiliate earnings, vendor revenues, and educator course royalties.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-800">Security & Fraud Prevention</h4>
                  <p className="text-xs text-slate-500 font-medium">To detect suspicious logins, prevent unauthorized transactions, and maintain platform integrity.</p>
                </div>
              </div>
            </section>

            {/* Section 3: Payment & Security */}
            <section id="security" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 scroll-mt-28">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 text-primary rounded-2xl">
                  <Lock size={20} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wide">3. Payment & Security Guarantee</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                FashionFever does <strong>NOT</strong> store or record your full credit card numbers, CVVs, or net banking passwords on our servers.
              </p>

              <div className="bg-emerald-50 border border-emerald-200/80 p-4.5 rounded-2xl text-emerald-900 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-black uppercase">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span>PCI-DSS Compliant Payment Gateways</span>
                </div>
                <p className="font-medium text-emerald-800">
                  All online payments (Credit Card, Debit Card, UPI, NetBanking, Paytm, PhonePe) are processed directly through Reserve Bank of India (RBI) authorized PCI-DSS Level 1 compliant payment gateways (Razorpay / Cashfree / Stripe).
                </p>
              </div>
            </section>

            {/* Section 4: Location & GPS Data */}
            <section id="location" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 scroll-mt-28">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 text-primary rounded-2xl">
                  <MapPin size={20} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wide">4. Location & GPS Data (Quick Delivery)</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                For our <strong>Quick E-Commerce 10-Minute Express Delivery</strong> and <strong>Salon-at-Home</strong> services, we request access to your device's geolocation coordinates.
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium list-disc pl-5">
                <li>Location access is requested only with your explicit browser/device permission.</li>
                <li>Riders assigned to your delivery receive pincode and street navigation data strictly during the active delivery window.</li>
                <li>You can clear saved location data at any time via your Account Settings.</li>
              </ul>
            </section>

            {/* Section 5: Data Sharing & Third Parties */}
            <section id="sharing" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 scroll-mt-28">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 text-primary rounded-2xl">
                  <Server size={20} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wide">5. Data Sharing & Third Parties</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes. We share data only with:
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <strong>Service Vendors & Stylists:</strong> Required customer name, booked service time, and venue for salon appointments.
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <strong>Logistics & Delivery Partners:</strong> Street address and contact phone for order dispatch and 10-min courier delivery.
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <strong>Legal Authorities:</strong> When mandated by applicable Indian laws, court summons, or regulatory authorities.
                </div>
              </div>
            </section>

            {/* Section 6: Cookies & Tracking */}
            <section id="cookies" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 scroll-mt-28">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 text-primary rounded-2xl">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wide">6. Cookies & Tracking Technologies</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                We use cookies and similar session tracking technologies to enhance user experience, preserve active cart items, remember login sessions, and analyze website traffic. You can configure your web browser to disable cookies, though certain interactive features may be limited.
              </p>
            </section>

            {/* Section 7: Your Privacy Rights */}
            <section id="rights" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 scroll-mt-28">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 text-primary rounded-2xl">
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wide">7. Your Privacy Rights</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                You possess full control over your personal information. Under applicable Indian data privacy regulations, you have the right to:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-slate-800">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span>Access & Export Your Personal Data</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span>Rectify Inaccurate Account Details</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span>Request Full Account Deletion</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span>Unsubscribe from Promotional Emails</span>
                </div>
              </div>
            </section>

            {/* Section 8: Contact Privacy Team */}
            <section id="contact" className="bg-gradient-to-r from-slate-900 via-gray-900 to-rose-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-white/15 pb-4">
                <div className="p-2.5 bg-white/10 rounded-2xl text-rose-300">
                  <Mail size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wide">8. Contact Our Privacy Officer</h2>
                  <p className="text-xs text-gray-300 font-medium">For data requests, grievances, or privacy questions.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-xs font-black uppercase text-rose-300 block">Email Us</span>
                  <a href="mailto:privacy@fashionfever.in" className="font-bold hover:underline block text-white">
                    privacy@fashionfever.in
                  </a>
                </div>

                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-xs font-black uppercase text-rose-300 block">Call Support</span>
                  <a href="tel:+919999988888" className="font-bold hover:underline block text-white">
                    +91 99999 88888
                  </a>
                </div>

                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-xs font-black uppercase text-rose-300 block">Office Address</span>
                  <span className="font-semibold block text-gray-200">
                    Saket, New Delhi 110017
                  </span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
