import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../types';

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="dashboard-home">
      <h1>Welcome, {user?.name}! 🌾</h1>
      <p>Farmer Dashboard - Manage your crops and requests</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Crops</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Active Crops</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Total IVR Calls</h3>
          <p className="stat-number">0</p>
        </div>
      </div>

      <div className="info-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn">➕ Add New Crop</button>
          <button className="action-btn">📋 View All Crops</button>
          <button className="action-btn">📬 Check Requests</button>
          <button className="action-btn">👤 Update Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
