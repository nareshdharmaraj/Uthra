import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../types';
import api from '../../services/api';

interface AdminStats {
  totalUsers: number;
  totalCrops: number;
  totalRequests: number;
  activeTransactions: number;
}

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCrops: 0,
    totalRequests: 0,
    activeTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch users data
        const usersResponse = await api.get('/admin/users');
        const users = usersResponse.data;
        
        // Fetch crops data
        const cropsResponse = await api.get('/admin/crops');
        const crops = cropsResponse.data;
        
        // Fetch requests data
        const requestsResponse = await api.get('/admin/requests');
        const requests = requestsResponse.data;
        
        setStats({
          totalUsers: users.length || 0,
          totalCrops: crops.length || 0,
          totalRequests: requests.length || 0,
          activeTransactions: requests.filter((req: any) => req.status === 'confirmed').length || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-home">
      <h1>Admin Dashboard 👨‍💼</h1>
      <p>Welcome, {user?.name}! Manage the Uthra platform</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{loading ? '...' : stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Crops</h3>
          <p className="stat-number">{loading ? '...' : stats.totalCrops}</p>
        </div>
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p className="stat-number">{loading ? '...' : stats.totalRequests}</p>
        </div>
        <div className="stat-card">
          <h3>Active Transactions</h3>
          <p className="stat-number">{loading ? '...' : stats.activeTransactions}</p>
        </div>
      </div>

      <div className="info-section">
        <h2>⚡ Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate('/admin/users')}>👥 Manage Users</button>
          <button className="action-btn" onClick={() => navigate('/admin/crops')}>🌾 Manage Crops</button>
          <button className="action-btn" onClick={() => navigate('/admin/requests')}>📋 View Requests</button>
          <button className="action-btn" onClick={() => navigate('/admin/analytics')}>📈 View Analytics</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
