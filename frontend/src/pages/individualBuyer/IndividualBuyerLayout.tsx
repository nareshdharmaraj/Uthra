import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { RootState } from '../../types';
import { AppDispatch } from '../../store';
import '../../components/layouts/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const IndividualBuyerLayout: React.FC<LayoutProps> = ({ children }) => {
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
          <p>Individual Buyer</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/individual-buyer" className={`nav-item ${isActive('/individual-buyer') ? 'active' : ''}`}>
            🏠 Home
          </Link>
          <Link to="/individual-buyer/profile" className={`nav-item ${isActive('/individual-buyer/profile') ? 'active' : ''}`}>
            👤 Profile
          </Link>
          <Link to="/individual-buyer/search" className={`nav-item ${isActive('/individual-buyer/search') ? 'active' : ''}`}>
            🔍 Search
          </Link>
          <Link to="/individual-buyer/wanted-crops" className={`nav-item ${isActive('/individual-buyer/wanted-crops') ? 'active' : ''}`}>
            📋 Wanted Crops
          </Link>
          <Link to="/individual-buyer/requests" className={`nav-item ${isActive('/individual-buyer/requests') ? 'active' : ''}`}>
            📬 My Requests
          </Link>
          <Link to="/individual-buyer/settings" className={`nav-item ${isActive('/individual-buyer/settings') ? 'active' : ''}`}>
            ⚙️ Settings
          </Link>
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

export default IndividualBuyerLayout;
