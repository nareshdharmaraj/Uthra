import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../types';
import api from '../../services/api';

interface DashboardStats {
  totalCrops: number;
  activeCrops: number;
  pendingRequests: number;
  totalIVRCalls: number;
}

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalCrops: 0,
    activeCrops: 0,
    pendingRequests: 0,
    totalIVRCalls: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch crops data
        const cropsResponse = await api.get('/farmers/crops');
        const crops = cropsResponse.data.data || [];
        
        // Fetch requests data
        const requestsResponse = await api.get('/farmers/requests');
        const requests = requestsResponse.data.data || [];
        
        // Fetch IVR call logs (optional, set to 0 if not available)
        let ivrCalls = [];
        try {
          const ivrResponse = await api.get('/ivr/calls');
          ivrCalls = ivrResponse.data || [];
        } catch (err) {
          // IVR endpoint might not exist yet
          console.log('IVR calls not available');
        }
        
        setStats({
          totalCrops: crops.length || 0,
          activeCrops: crops.filter((crop: any) => crop.status === 'active').length || 0,
          pendingRequests: requests.filter((req: any) => req.status === 'pending').length || 0,
          totalIVRCalls: ivrCalls.length || 0
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
          <h3>Total Crops</h3>
          <p className="stat-number">{loading ? '...' : stats.totalCrops}</p>
        </div>
        <div className="stat-card">
          <h3>Active Crops</h3>
          <p className="stat-number">{loading ? '...' : stats.activeCrops}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p className="stat-number">{loading ? '...' : stats.pendingRequests}</p>
        </div>
        <div className="stat-card">
          <h3>Total IVR Calls</h3>
          <p className="stat-number">{loading ? '...' : stats.totalIVRCalls}</p>
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
