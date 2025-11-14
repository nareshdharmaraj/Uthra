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

const FarmerLayout: React.FC<LayoutProps> = ({ children }) => {
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
          <p>Farmer Dashboard</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/farmer" className="nav-item">🏠 Home</Link>
          <Link to="/farmer/crops" className="nav-item">🌾 My Crops</Link>
          <Link to="/farmer/requests" className="nav-item">📬 Requests</Link>
          <Link to="/farmer/profile" className="nav-item">👤 Profile</Link>
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

export default FarmerLayout;
