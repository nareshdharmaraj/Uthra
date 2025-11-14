import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FarmerDashboard from './pages/farmer/Dashboard';
import BuyerDashboard from './pages/buyer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';

// Components
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Farmer Routes */}
        <Route
          path="/farmer/*"
          element={
            <PrivateRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </PrivateRoute>
          }
        />

        {/* Buyer Routes */}
        <Route
          path="/buyer/*"
          element={
            <PrivateRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
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
