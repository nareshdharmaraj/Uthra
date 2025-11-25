import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './features/auth/authSlice';
import { RootState } from './types';
import { AppDispatch } from './store';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPasswordFlow from './pages/auth/forgot-password/ForgotPasswordFlow';
import FarmerDashboard from './pages/farmer/Dashboard';
import BuyerDashboard from './pages/buyer/Dashboard';
import IndividualBuyerDashboard from './pages/individualBuyer/IndividualBuyerDashboard';
import CompanyBuyerDashboard from './pages/companyBuyer/CompanyBuyerDashboard';
import AdminDashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';

// Public Pages
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Help from './pages/Help';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Guidelines from './pages/Guidelines';

// Components
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Only handle page visibility for security (not refresh)
    const handleVisibilityChange = () => {
      // If user navigates away or minimizes for more than 5 minutes, auto-logout
      if (document.hidden && isAuthenticated) {
        const logoutTimer = setTimeout(() => {
          if (document.hidden && isAuthenticated) {
            console.log('🔒 Auto-logout: Tab hidden for too long');
            dispatch(logout());
            localStorage.setItem('autoLogoutMessage', 'You were automatically logged out for security.');
          }
        }, 5 * 60 * 1000); // 5 minutes

        // Clear timer if user comes back
        const handleVisibilityReturn = () => {
          if (!document.hidden) {
            clearTimeout(logoutTimer);
            document.removeEventListener('visibilitychange', handleVisibilityReturn);
          }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityReturn);
      }
    };

    // Handle actual page unload (tab close, navigation away)
    const handlePageHide = () => {
      // Only logout on actual page unload (not refresh)
      if (isAuthenticated) {
        console.log('🔒 Page unload detected - cleaning up session');
        // Clean up session on actual tab close
        localStorage.setItem('sessionCleanup', 'true');
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    // Check for auto-logout message on app load
    const autoLogoutMessage = localStorage.getItem('autoLogoutMessage');
    if (autoLogoutMessage) {
      setTimeout(() => {
        alert(autoLogoutMessage);
        localStorage.removeItem('autoLogoutMessage');
      }, 1000);
    }

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [dispatch, isAuthenticated]);

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
        
        {/* Public Pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/help" element={<Help />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/guidelines" element={<Guidelines />} />

        {/* Farmer Routes */}
        <Route
          path="/farmer/*"
          element={
            <PrivateRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </PrivateRoute>
          }
        />

        {/* Buyer Routes - Legacy (redirects to appropriate dashboard) */}
        <Route
          path="/buyer/*"
          element={
            <PrivateRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
            </PrivateRoute>
          }
        />

        {/* Individual Buyer Routes */}
        <Route
          path="/individual-buyer/*"
          element={
            <PrivateRoute allowedRoles={['buyer']}>
              <IndividualBuyerDashboard />
            </PrivateRoute>
          }
        />

        {/* Company Buyer Routes */}
        <Route
          path="/company-buyer/*"
          element={
            <PrivateRoute allowedRoles={['buyer']}>
              <CompanyBuyerDashboard />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
