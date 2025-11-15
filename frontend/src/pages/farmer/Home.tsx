import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../types';
import api from '../../services/api';

interface DashboardStats {
  totalCrops: number;
  activeCrops: number;
  soldOutCrops: number;
  pendingRequests: number;
  acceptedRequests: number;
  totalRequests: number;
  totalIVRCalls: number;
}

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalCrops: 0,
    activeCrops: 0,
    soldOutCrops: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    totalRequests: 0,
    totalIVRCalls: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats from dedicated endpoint
        const dashboardResponse = await api.get('/farmers/dashboard');
        const dashboardData = dashboardResponse.data.data;
        
        // Fetch crops data for sold count
        const cropsResponse = await api.get('/farmers/crops');
        const crops = cropsResponse.data.data || [];
        
        // Fetch all requests for total count
        const requestsResponse = await api.get('/farmers/requests');
        const requests = requestsResponse.data.data || [];
        
        // Fetch IVR call logs (optional)
        let ivrCallsCount = 0;
        try {
          const ivrResponse = await api.get('/ivr/calls');
          ivrCallsCount = ivrResponse.data?.length || 0;
        } catch (err) {
          console.log('IVR calls not available');
        }
        
        setStats({
          totalCrops: dashboardData.stats.totalCrops || 0,
          activeCrops: dashboardData.stats.activeCrops || 0,
          soldOutCrops: crops.filter((crop: any) => crop.status === 'sold_out').length || 0,
          pendingRequests: dashboardData.stats.pendingRequests || 0,
          acceptedRequests: dashboardData.stats.acceptedRequests || 0,
          totalRequests: requests.length || 0,
          totalIVRCalls: ivrCallsCount
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-home">
      <h1>Welcome, {user?.name}! 🌾</h1>
      <p>Farmer Dashboard - Manage your crops and requests</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <h3>Total Crops</h3>
          <p className="stat-number">{loading ? '...' : stats.totalCrops}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <h3>Active Crops</h3>
          <p className="stat-number">{loading ? '...' : stats.activeCrops}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <h3>Sold Out</h3>
          <p className="stat-number">{loading ? '...' : stats.soldOutCrops}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📬</div>
          <h3>Total Requests</h3>
          <p className="stat-number">{loading ? '...' : stats.totalRequests}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <h3>Pending Requests</h3>
          <p className="stat-number">{loading ? '...' : stats.pendingRequests}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <h3>Accepted Requests</h3>
          <p className="stat-number">{loading ? '...' : stats.acceptedRequests}</p>
        </div>
      </div>

      <div className="info-section">
        <h2>⚡ Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate('/farmer/my-crops')}>➕ Add New Crop</button>
          <button className="action-btn" onClick={() => navigate('/farmer/my-crops')}>📋 View All Crops</button>
          <button className="action-btn" onClick={() => navigate('/farmer/my-requests')}>📬 Check Requests</button>
          <button className="action-btn" onClick={() => navigate('/farmer/profile')}>👤 Update Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
