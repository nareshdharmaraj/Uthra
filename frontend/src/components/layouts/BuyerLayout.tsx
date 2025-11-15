import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { RootState } from '../../types';
import { AppDispatch } from '../../store';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const BuyerLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🌾 Uthra</h2>
          <p>Buyer Dashboard</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/buyer" className={`nav-item ${isActive('/buyer') ? 'active' : ''}`}>🏠 Home</Link>
          <Link to="/buyer/profile" className={`nav-item ${isActive('/buyer/profile') ? 'active' : ''}`}>👤 My Profile</Link>
          <Link to="/buyer/search" className={`nav-item ${isActive('/buyer/search') ? 'active' : ''}`}>🔍 Search</Link>
          <Link to="/buyer/wanted-crops" className={`nav-item ${isActive('/buyer/wanted-crops') ? 'active' : ''}`}>📋 Wanted Crops</Link>
          <Link to="/buyer/requests" className={`nav-item ${isActive('/buyer/requests') ? 'active' : ''}`}>📬 My Requests</Link>
          <Link to="/buyer/settings" className={`nav-item ${isActive('/buyer/settings') ? 'active' : ''}`}>⚙️ Settings</Link>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h3>Welcome, {user?.name}</h3>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="btn btn-logout">🚪 Logout</button>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BuyerLayout;
