import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { RootState } from '../../types';
import { AppDispatch } from '../../store';
import MaintenanceBanner from '../common/MaintenanceBanner';
import adminService from '../../services/adminService';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceStart, setMaintenanceStart] = useState<Date | null>(null);

  useEffect(() => {
    // Check maintenance mode status
    const checkMaintenanceMode = async () => {
      try {
        const response = await adminService.getSystemSettings();
        setIsMaintenanceMode(!response.data.isOperational);
        setMaintenanceStart(response.data.currentMaintenanceStart);
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
      }
    };

    checkMaintenanceMode();
    // Check every 30 seconds
    const interval = setInterval(checkMaintenanceMode, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {isMaintenanceMode && (
        <MaintenanceBanner 
          message="System is in maintenance mode - Only admins can access"
          startTime={maintenanceStart || undefined}
        />
      )}
      <div className="dashboard-layout" style={{ marginTop: isMaintenanceMode ? '80px' : '0' }}>
        <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/uthralogo.png" alt="Uthra Logo" style={{height: '40px', width: 'auto', marginBottom: '8px'}} />
          <h2 style={{fontSize: '1.5rem', margin: '0'}}>Uthra</h2>
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>📊 Dashboard</Link>
          <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>👥 Users</Link>
          <Link to="/admin/crops" className={`nav-item ${isActive('/admin/crops') ? 'active' : ''}`}>🌾 Crops</Link>
          <Link to="/admin/requests" className={`nav-item ${isActive('/admin/requests') ? 'active' : ''}`}>📋 Requests</Link>
          <Link to="/admin/analytics" className={`nav-item ${isActive('/admin/analytics') ? 'active' : ''}`}>📈 Analytics</Link>
          <Link to="/admin/logs" className={`nav-item ${isActive('/admin/logs') ? 'active' : ''}`}>📝 System Logs</Link>
          <Link to="/admin/system-health" className={`nav-item ${isActive('/admin/system-health') ? 'active' : ''}`}>🔧 System Health</Link>
          <Link to="/admin/settings" className={`nav-item ${isActive('/admin/settings') ? 'active' : ''}`}>⚙️ Settings</Link>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h3>Admin: {user?.name}</h3>
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
    </>
  );
};

export default AdminLayout;
