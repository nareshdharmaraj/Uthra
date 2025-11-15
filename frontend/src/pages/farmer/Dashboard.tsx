import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FarmerLayout from '../../components/layouts/FarmerLayout';
import FarmerHome from './Home';
import MyCrops from './MyCrops';
import MyRequests from './MyRequests';
import Profile from './Profile';

const Dashboard: React.FC = () => {
  return (
    <FarmerLayout>
      <Routes>
        <Route path="/" element={<FarmerHome />} />
        <Route path="/my-crops" element={<MyCrops />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </FarmerLayout>
  );
};

export default Dashboard;
