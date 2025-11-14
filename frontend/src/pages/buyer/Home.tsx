import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { fetchDashboardStats } from '../../features/buyer/buyerSlice';
import '../Home.css';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { dashboardStats, isLoading } = useSelector((state: RootState) => state.buyer);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const quickActions = [
    { title: 'My Profile', path: '/buyer/profile', icon: '👤', color: '#4CAF50' },
    { title: 'Search Crops', path: '/buyer/search-crops', icon: '🌾', color: '#2196F3' },
    { title: 'Search Farmers', path: '/buyer/search-farmers', icon: '🚜', color: '#FF9800' },
    { title: 'Wanted Crops', path: '/buyer/wanted-crops', icon: '📋', color: '#9C27B0' }
  ];

  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h1>Welcome back, {user?.name}! 🧺</h1>
        <p className="subtitle">Manage your purchases and connect with farmers</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="loading-stats">Loading dashboard...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Requests</h3>
              <p className="stat-number">{dashboardStats?.stats.totalRequests || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending</h3>
              <p className="stat-number">{dashboardStats?.stats.pendingRequests || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Confirmed</h3>
              <p className="stat-number">{dashboardStats?.stats.confirmedRequests || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌾</div>
            <div className="stat-content">
              <h3>Available Crops</h3>
              <p className="stat-number">{dashboardStats?.stats.availableCrops || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ borderColor: action.color }}
            >
              <div className="action-icon" style={{ background: `${action.color}20`, color: action.color }}>
                {action.icon}
              </div>
              <h3>{action.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {dashboardStats?.recentRequests && dashboardStats.recentRequests.length > 0 && (
        <div className="recent-section">
          <h2>Recent Requests</h2>
          <div className="recent-list">
            {dashboardStats.recentRequests.map((request: any) => (
              <div key={request._id} className="recent-item">
                <div className="recent-info">
                  <h4>{request.crop?.name || 'Crop'}</h4>
                  <p>Farmer: {request.farmer?.name || 'Unknown'}</p>
                  <p>Mobile: {request.farmer?.mobile || 'N/A'}</p>
                </div>
                <div className="recent-status">
                  <span className={`status-badge status-${request.status}`}>
                    {request.status}
                  </span>
                  <small>{new Date(request.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started Guide */}
      {(!dashboardStats || dashboardStats.stats.totalRequests === 0) && (
        <div className="getting-started">
          <h2>Getting Started</h2>
          <div className="guide-steps">
            <div className="guide-step">
              <span className="step-number">1</span>
              <div>
                <h4>Complete Your Profile</h4>
                <p>Add your organization details and preferred crops</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="step-number">2</span>
              <div>
                <h4>Browse Available Crops</h4>
                <p>Search for crops by category, location, or price</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="step-number">3</span>
              <div>
                <h4>Connect with Farmers</h4>
                <p>Send requests directly to farmers and negotiate</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
