import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FarmerLayout from '../../components/layouts/FarmerLayout';
import FarmerHome from './Home';
import MyCrops from './MyCrops';
import MyRequests from './MyRequests';

const Dashboard: React.FC = () => {
  return (
    <FarmerLayout>
      <Routes>
        <Route path="/" element={<FarmerHome />} />
        <Route path="/crops" element={<MyCrops />} />
        <Route path="/requests" element={<MyRequests />} />
      </Routes>
    </FarmerLayout>
  );
};

export default Dashboard;
