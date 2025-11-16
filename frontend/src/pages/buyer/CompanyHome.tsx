import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../Home.css';
import './CompanyHome.css';

interface CompanyDashboardData {
  company: {
    _id: string;
    companyName: string;
    businessType: string;
    subscriptionPlan: string;
    maxEmployees: number;
    isVerified: boolean;
  };
  stats: {
    totalRequests: number;
    pendingRequests: number;
    confirmedRequests: number;
    completedRequests: number;
    availableCrops: number;
    activeEmployees: number;
    totalStock: number;
    stockValue: number;
  };
  recentRequests: any[];
  stockByCategory: any[];
}

const CompanyHome: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<CompanyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/buyers/company/dashboard');
      setDashboardData(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error);
      alert(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { title: 'Manage Employees', path: '/company-buyer/employees', icon: '👥', color: '#4CAF50' },
    { title: 'Company Stock', path: '/company-buyer/stock', icon: '📦', color: '#FF9800' },
    { title: 'Search Crops', path: '/company-buyer/search', icon: '🌾', color: '#2196F3' },
    { title: 'Team Requests', path: '/company-buyer/requests', icon: '📋', color: '#9C27B0' },
    { title: 'Company Profile', path: '/company-buyer/profile', icon: '🏢', color: '#673AB7' }
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pending', color: '#FF9800' },
      farmer_countered: { label: 'Counter Offer', color: '#2196F3' },
      buyer_accepted: { label: 'Accepted', color: '#4CAF50' },
      confirmed: { label: 'Confirmed', color: '#4CAF50' },
      completed: { label: 'Completed', color: '#00796B' },
      cancelled: { label: 'Cancelled', color: '#f44336' }
    };
    const badge = badges[status] || { label: status, color: '#666' };
    return <span className="status-badge" style={{ background: badge.color }}>{badge.label}</span>;
  };

  if (isLoading) {
    return <div className="loading-container">Loading company dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="error-container">Failed to load dashboard data</div>;
  }

  const { company, stats, recentRequests, stockByCategory } = dashboardData;

  return (
    <div className="company-dashboard-home">
      {/* Welcome Header */}
      <div className="welcome-section company-welcome">
        <div className="welcome-content">
          <h1>🏢 {company.companyName}</h1>
          <p className="subtitle">Company Buyer Dashboard - Manage team, employees & inventory</p>
          <span style={{background: '#FFD700', color: '#333', padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700, marginTop: '0.5rem', display: 'inline-block'}}>⭐ COMPANY BUYER</span>
          <div className="company-badges">
            <span className="badge badge-type">{company.businessType}</span>
            <span className="badge badge-plan">{company.subscriptionPlan} Plan</span>
            {company.isVerified && <span className="badge badge-verified">✓ Verified</span>}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid company-stats">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Active Employees</h3>
            <p className="stat-number">{stats.activeEmployees}</p>
            <span className="stat-limit">of {company.maxEmployees} allowed</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Requests</h3>
            <p className="stat-number">{stats.totalRequests}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pendingRequests}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Confirmed</h3>
            <p className="stat-number">{stats.confirmedRequests}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✔️</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-number">{stats.completedRequests}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-content">
            <h3>Available Crops</h3>
            <p className="stat-number">{stats.availableCrops}</p>
          </div>
        </div>
      </div>

      {/* Stock Overview */}
      <div className="stock-overview-section">
        <div className="section-header">
          <h2>📦 Stock Overview</h2>
          <button 
            className="btn-link"
            onClick={() => navigate('/buyer/company-stock')}
          >
            View Details →
          </button>
        </div>
        <div className="stock-summary-grid">
          <div className="stock-summary-card">
            <h3>Total Stock</h3>
            <p className="stock-number">{stats.totalStock.toLocaleString()}</p>
            <span className="stock-unit">kg</span>
          </div>
          <div className="stock-summary-card">
            <h3>Stock Value</h3>
            <p className="stock-number">₹{stats.stockValue.toLocaleString()}</p>
          </div>
          <div className="stock-summary-card">
            <h3>Categories</h3>
            <p className="stock-number">{stockByCategory.length}</p>
          </div>
        </div>

        {stockByCategory.length > 0 && (
          <div className="stock-categories">
            {stockByCategory.slice(0, 4).map((item: any) => (
              <div key={item._id} className="category-item">
                <div className="category-info">
                  <span className="category-name">{item._id || 'Other'}</span>
                  <span className="category-qty">{item.totalQuantity.toLocaleString()} kg</span>
                </div>
                <div className="category-value">
                  ₹{item.totalValue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid company-actions">
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

      {/* Recent Team Activity */}
      {recentRequests && recentRequests.length > 0 && (
        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Team Activity</h2>
            <button 
              className="btn-link"
              onClick={() => navigate('/buyer/requests')}
            >
              View All →
            </button>
          </div>
          <div className="recent-list company-activity">
            {recentRequests.slice(0, 8).map((request: any) => (
              <div key={request._id} className="recent-item activity-item">
                <div className="activity-icon">📋</div>
                <div className="activity-info">
                  <h4>{request.crop?.name || 'Crop'}</h4>
                  <p className="activity-meta">
                    <span>By: {request.buyer?.name || request.buyer?.businessName}</span>
                    <span>•</span>
                    <span>Farmer: {request.farmer?.name || 'Unknown'}</span>
                  </p>
                  <p className="activity-details">
                    {request.quantity} kg @ ₹{request.agreedPrice || request.offeredPrice}/kg
                  </p>
                </div>
                <div className="activity-status">
                  {getStatusBadge(request.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyHome;
