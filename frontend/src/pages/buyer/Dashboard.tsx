import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BuyerLayout from '../../components/layouts/BuyerLayout';
import BuyerHome from './Home';
import BuyerProfile from './BuyerProfile';
import UnifiedSearch from './UnifiedSearch';
import WantedCrops from './WantedCrops';
import MyRequests from './MyRequests';
import Settings from './Settings';

const Dashboard: React.FC = () => {
  return (
    <BuyerLayout>
      <Routes>
        <Route path="/" element={<BuyerHome />} />
        <Route path="/profile" element={<BuyerProfile />} />
        <Route path="/search" element={<UnifiedSearch />} />
        <Route path="/wanted-crops" element={<WantedCrops />} />
        <Route path="/requests" element={<MyRequests />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BuyerLayout>
  );
};

export default Dashboard;
