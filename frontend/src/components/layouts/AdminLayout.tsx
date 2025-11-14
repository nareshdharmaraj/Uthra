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

const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
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
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item">📊 Dashboard</Link>
          <Link to="/admin/users" className="nav-item">👥 Users</Link>
          <Link to="/admin/crops" className="nav-item">🌾 Crops</Link>
          <Link to="/admin/requests" className="nav-item">📋 Requests</Link>
          <Link to="/admin/analytics" className="nav-item">📈 Analytics</Link>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h3>Admin: {user?.name}</h3>
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

export default AdminLayout;
