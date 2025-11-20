import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHome from './Home';
import Users from './Users';
import Crops from './Crops';
import Analytics from './Analytics';
import Requests from './Requests';
import Logs from './Logs';
import SystemHealth from './SystemHealth';
import Settings from './Settings';

const Dashboard: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<Users />} />
        <Route path="/crops" element={<Crops />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/system-health" element={<SystemHealth />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AdminLayout>
  );
};

export default Dashboard;
