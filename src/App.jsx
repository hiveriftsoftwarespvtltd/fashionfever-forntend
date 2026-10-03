import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TopStrip from './components/TopStrip';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import VendorDashboard from './pages/vendor/VendorDashboard';
import InfluencerDashboard from './pages/InfluencerDashboard';
import InfluencerCommissionSlabs from './pages/InfluencerCommissionSlabs';
import Booking from './pages/Booking';
import AdminPanel from './pages/admin/AdminPanel';
import ServiceProviderPanel from './pages/service_provider/ServiceProviderPanel';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wallet from './pages/profile/Wallet';
import CourseCatalog from './pages/academy/CourseCatalog';
import DistributorDashboard from './pages/DistributorDashboard';
import CoursePlayer from './pages/academy/CoursePlayer';
import MyAppointments from './pages/profile/MyAppointments';
import Wishlist from './pages/profile/Wishlist';
import MyLearning from './pages/academy/MyLearning';
import EducatorDashboard from './pages/educator/EducatorDashboard';
import ManageSections from './pages/educator/ManageSections';
import EducatorOnboard from './pages/educator/EducatorOnboard';
import VendorRegistration from './pages/VendorRegistration';
import InfluencerRegistration from './pages/InfluencerRegistration';
import Profile from './pages/profile/Profile';
import RequestedRoles from './pages/profile/RequestedRoles';
import SupportTickets from './pages/profile/SupportTickets';
import Address from './pages/profile/Address';
import Coupons from './pages/profile/Coupons';
import Payments from './pages/profile/Payments';
import Orders from './pages/profile/Orders';
import UserServiceLeads from './pages/profile/UserServiceLeads';
import QuickCommerceHub from './pages/quick_commerce/QuickCommerceHub';
import RiderFlow from './pages/quick_commerce/RiderFlow';
import RiderLogin from './pages/quick_commerce/RiderLogin';
import LegalPrivacy from './pages/LegalPrivacy';
import TermsConditions from './pages/TermsConditions';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';
import { SearchProvider } from './context/SearchContext';
import { WishlistProvider } from './context/WishlistContext';
import { WalletProvider } from './context/WalletContext';
import { RoleGuard } from './components/AuthGuards';
import AiChatWidget from './components/AiChatWidget';
import { captureReferralFromUrl } from './utils/referralTracking';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.search) {
      captureReferralFromUrl(location.search);
    }
  }, [location.search]);

  const isDashboard = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/vendor') ||
    location.pathname.startsWith('/influencer') ||
    location.pathname.startsWith('/distributor') ||
    location.pathname.startsWith('/service-provider') ||
    location.pathname.startsWith('/educator') ||
    location.pathname.startsWith('/rider') ||
    location.pathname.startsWith('/quick-commerce/rider');

  return (
    <UserProvider>
      <WishlistProvider>
        <WalletProvider>
          <SearchProvider>
            <CartProvider>
              <ThemeProvider>
        <div className="min-h-screen flex flex-col antialiased">
          <ScrollToTop />

          {!isDashboard && <TopStrip />}
          {!isDashboard && <Navbar />}

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* Protected Dashboards */}
              <Route path="/admin/*" element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminPanel />
                </RoleGuard>
              } />

              <Route path="/vendor/dashboard" element={
                <RoleGuard allowedRoles={['vendor', 'admin']}>
                  <VendorDashboard />
                </RoleGuard>
              } />

              <Route path="/vendor/register" element={
                <RoleGuard allowedRoles={['user', 'vendor', 'admin']}>
                  <VendorRegistration />
                </RoleGuard>
              } />

              <Route path="/influencer/dashboard" element={
                <RoleGuard allowedRoles={['influencer', 'admin']}>
                  <InfluencerDashboard />
                </RoleGuard>
              } />

              <Route path="/influencer/commission-slabs" element={
                <RoleGuard allowedRoles={['influencer', 'admin']}>
                  <Navigate to="/influencer/dashboard?tab=commission-slabs" replace />
                </RoleGuard>
              } />

              <Route path="/distributor/dashboard" element={
                <RoleGuard allowedRoles={['distributor', 'admin']}>
                  <DistributorDashboard />
                </RoleGuard>
              } />

              <Route path="/service-provider/dashboard" element={
                <RoleGuard allowedRoles={['user', 'service_provider', 'admin']}>
                  <ServiceProviderPanel />
                </RoleGuard>
              } />

              <Route path="/service-provider/panel" element={
                <RoleGuard allowedRoles={['user', 'service_provider', 'admin']}>
                  <ServiceProviderPanel />
                </RoleGuard>
              } />

              <Route path="/educator/dashboard" element={
                <RoleGuard allowedRoles={['educator', 'admin']}>
                  <EducatorDashboard />
                </RoleGuard>
              } />

              <Route path="/educator/course/:courseId/sections" element={
                <RoleGuard allowedRoles={['educator', 'admin']}>
                  <ManageSections />
                </RoleGuard>
              } />

              <Route path="/educator/onboard" element={
                <RoleGuard allowedRoles={['user', 'educator', 'admin']}>
                  <EducatorOnboard />
                </RoleGuard>
              } />

              {/* Customer & Rider Routes */}
              <Route path="/quick-commerce" element={<QuickCommerceHub />} />
              <Route path="/quick-delivery" element={<QuickCommerceHub />} />
              <Route path="/rider/login" element={<RiderLogin />} />
              <Route path="/rider/dashboard" element={
                <RoleGuard allowedRoles={['delivery_person', 'rider', 'admin']}>
                  <RiderFlow />
                </RoleGuard>
              } />
              <Route path="/quick-commerce/rider" element={
                <RoleGuard allowedRoles={['delivery_person', 'rider', 'admin']}>
                  <RiderFlow />
                </RoleGuard>
              } />
              <Route path="/booking" element={<Booking />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/academy" element={<CourseCatalog />} />
              <Route path="/academy/course/:id" element={<CoursePlayer />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              <Route path="/my-learning" element={<MyLearning />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/requested-roles" element={<RequestedRoles />} />
              <Route path="/support" element={<SupportTickets />} />
              <Route path="/address" element={<Address />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile/service-leads" element={<UserServiceLeads />} />

              <Route path="/influencer/registration" element={<InfluencerRegistration />} />
              <Route path="/services" element={<Booking />} />
              <Route path="/about" element={<Home />} />
              <Route path="/contact" element={<Home />} />
              <Route path="/get-app" element={<Home />} />
              <Route path="/stores" element={<Home />} />
              <Route path="/help" element={<SupportTickets />} />
              <Route path="/luxe" element={<Shop />} />
              <Route path="/advice" element={<Home />} />
              <Route path="/privacy-policy" element={<LegalPrivacy />} />
              <Route path="/terms" element={<TermsConditions />} />
            </Routes>
          </main>

          {!isDashboard && <AiChatWidget />}

          {!isDashboard && <Footer />}
        </div>
              </ThemeProvider>
            </CartProvider>
          </SearchProvider>
        </WalletProvider>
      </WishlistProvider>
    </UserProvider>
  );
};

export default App;
