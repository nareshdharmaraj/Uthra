import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../types';

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="dashboard-home">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}! Manage the Uthra platform</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Total Crops</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Active Transactions</h3>
          <p className="stat-number">0</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
