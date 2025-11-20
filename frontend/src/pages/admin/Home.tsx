import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../types';
import { adminService } from '../../services';
import '../../styles/Admin.css';
import { formatQuantity, formatPriceWithUnit } from '../../utils/unitConversion';

interface DashboardData {
  summary: {
    totalFarmers: number;
    totalBuyers: number;
    totalCrops: number;
    totalRequests: number;
    totalTransactionValue: number;
  };
  todayActivity: {
    newFarmers: number;
    newBuyers: number;
    newCrops: number;
    newRequests: number;
  };
  recentActivity: {
    users: any[];
    crops: any[];
    requests: any[];
  };
}

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardAnalytics();
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-home">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}! Here's what's happening today.</p>
      </div>

      {/* Summary Statistics */}
      <div className="stats-section">
        <h2>Platform Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Farmers</h3>
              <p className="stat-number">{dashboardData?.summary.totalFarmers || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3>Total Buyers</h3>
              <p className="stat-number">{dashboardData?.summary.totalBuyers || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌾</div>
            <div className="stat-content">
              <h3>Total Crops</h3>
              <p className="stat-number">{dashboardData?.summary.totalCrops || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>Total Requests</h3>
              <p className="stat-number">{dashboardData?.summary.totalRequests || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Transaction Value</h3>
              <p className="stat-number">₹{dashboardData?.summary.totalTransactionValue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="activity-section">
        <h2>Today's Activity</h2>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-icon">🆕</div>
            <div className="activity-content">
              <p className="activity-number">{dashboardData?.todayActivity.newFarmers || 0}</p>
              <p className="activity-label">New Farmers</p>
            </div>
          </div>
          <div className="activity-card">
            <div className="activity-icon">🆕</div>
            <div className="activity-content">
              <p className="activity-number">{dashboardData?.todayActivity.newBuyers || 0}</p>
              <p className="activity-label">New Buyers</p>
            </div>
          </div>
          <div className="activity-card">
            <div className="activity-icon">🌱</div>
            <div className="activity-content">
              <p className="activity-number">{dashboardData?.todayActivity.newCrops || 0}</p>
              <p className="activity-label">New Crops</p>
            </div>
          </div>
          <div className="activity-card">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <p className="activity-number">{dashboardData?.todayActivity.newRequests || 0}</p>
              <p className="activity-label">New Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn primary" onClick={() => navigate('/admin/users')}>
            <span className="btn-icon">👥</span>
            <span className="btn-text">Manage Users</span>
          </button>
          <button className="action-btn success" onClick={() => navigate('/admin/crops')}>
            <span className="btn-icon">🌾</span>
            <span className="btn-text">Manage Crops</span>
          </button>
          <button className="action-btn info" onClick={() => navigate('/admin/requests')}>
            <span className="btn-icon">📋</span>
            <span className="btn-text">View Requests</span>
          </button>
          <button className="action-btn warning" onClick={() => navigate('/admin/analytics')}>
            <span className="btn-icon">📈</span>
            <span className="btn-text">Analytics</span>
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/admin/call-logs')}>
            <span className="btn-icon">📞</span>
            <span className="btn-text">Call Logs</span>
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/admin/sms-logs')}>
            <span className="btn-icon">📱</span>
            <span className="btn-text">SMS Logs</span>
          </button>
          <button className="action-btn dark" onClick={() => navigate('/admin/system-health')}>
            <span className="btn-icon">🔧</span>
            <span className="btn-text">System Health</span>
          </button>
          <button className="action-btn danger" onClick={() => navigate('/admin/activity-logs')}>
            <span className="btn-icon">📊</span>
            <span className="btn-text">Activity Logs</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-section">
        <div className="recent-users">
          <h3>Recent Users</h3>
          <div className="recent-list">
            {dashboardData?.recentActivity.users.length === 0 ? (
              <p className="no-data">No recent users</p>
            ) : (
              dashboardData?.recentActivity.users.map((user: any) => (
                <div key={user._id} className="recent-item">
                  <div className="item-icon">👤</div>
                  <div className="item-content">
                    <p className="item-title">{user.name}</p>
                    <p className="item-subtitle">{user.role} - {user.phone}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="recent-crops">
          <h3>Recent Crops</h3>
          <div className="recent-list">
            {dashboardData?.recentActivity.crops.length === 0 ? (
              <p className="no-data">No recent crops</p>
            ) : (
              dashboardData?.recentActivity.crops.map((crop: any) => {
                const quantityDisplay = formatQuantity(crop.quantity || crop.availableQuantity);
                const priceDisplay = formatPriceWithUnit(crop.price);
                const location = crop.location?.district ? `, ${crop.location.district}` : '';
                
                return (
                <div key={crop._id} className="recent-item">
                  <div className="item-icon">🌾</div>
                  <div className="item-content">
                    <p className="item-title">{crop.name || 'Unknown Crop'}{crop.variety ? ` (${crop.variety})` : ''}</p>
                    <p className="item-subtitle">{quantityDisplay} - {priceDisplay}{location}</p>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>

        <div className="recent-requests">
          <h3>Recent Requests</h3>
          <div className="recent-list">
            {dashboardData?.recentActivity.requests.length === 0 ? (
              <p className="no-data">No recent requests</p>
            ) : (
              dashboardData?.recentActivity.requests.map((request: any) => {
                const quantityDisplay = formatQuantity(request.requestedQuantity);
                const buyerName = request.buyer?.name || 'Unknown Buyer';
                const buyerType = request.buyer?.buyerType || request.buyerType || '';
                
                return (
                <div key={request._id} className="recent-item">
                  <div className="item-icon">📋</div>
                  <div className="item-content">
                    <p className="item-title">{request.crop?.name || 'Unknown'} - {buyerName}</p>
                    <p className="item-subtitle">
                      {request.status} - {quantityDisplay}{buyerType ? ` (${buyerType})` : ''}
                    </p>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
