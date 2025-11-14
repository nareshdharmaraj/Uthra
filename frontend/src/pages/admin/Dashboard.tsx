import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHome from './Home';

const Dashboard: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
      </Routes>
    </AdminLayout>
  );
};

export default Dashboard;
