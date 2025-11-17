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

const CompanyBuyerLayout: React.FC<LayoutProps> = ({ children }) => {
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
          <img src="/uthralogo.png" alt="Uthra Logo" style={{height: '40px', width: 'auto', marginBottom: '8px'}} />
          <h2 style={{fontSize: '1.5rem', margin: '0'}}>Uthra</h2>
          <p>Company Dashboard</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/company-buyer" className={`nav-item ${isActive('/company-buyer') ? 'active' : ''}`}>
            🏠 Dashboard
          </Link>
          <Link to="/company-buyer/profile" className={`nav-item ${isActive('/company-buyer/profile') ? 'active' : ''}`}>
            🏢 Company Profile
          </Link>
          <Link to="/company-buyer/employees" className={`nav-item ${isActive('/company-buyer/employees') ? 'active' : ''}`}>
            👥 Employees
          </Link>
          <Link to="/company-buyer/stock" className={`nav-item ${isActive('/company-buyer/stock') ? 'active' : ''}`}>
            📦 Stock Inventory
          </Link>
          <Link to="/company-buyer/search" className={`nav-item ${isActive('/company-buyer/search') ? 'active' : ''}`}>
            🔍 Search Crops
          </Link>
          <Link to="/company-buyer/requests" className={`nav-item ${isActive('/company-buyer/requests') ? 'active' : ''}`}>
            📬 Team Requests
          </Link>
          <Link to="/company-buyer/settings" className={`nav-item ${isActive('/company-buyer/settings') ? 'active' : ''}`}>
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

export default CompanyBuyerLayout;
