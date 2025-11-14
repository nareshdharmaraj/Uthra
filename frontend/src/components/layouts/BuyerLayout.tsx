import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🌾 Uthra</h2>
          <p>Buyer Dashboard</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/buyer" className="nav-item">🏠 Home</Link>
          <Link to="/buyer/profile" className="nav-item">👤 My Profile</Link>
          <Link to="/buyer/search" className="nav-item">🔍 Search</Link>
          <Link to="/buyer/wanted-crops" className="nav-item">📋 Wanted Crops</Link>
          <Link to="/buyer/requests" className="nav-item">📬 My Requests</Link>
          <Link to="/buyer/settings" className="nav-item">⚙️ Settings</Link>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h3>Welcome, {user?.name}</h3>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="btn btn-logout">Logout</button>
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
