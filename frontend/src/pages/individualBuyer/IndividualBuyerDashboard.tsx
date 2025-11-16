import React from 'react';
import { Routes, Route } from 'react-router-dom';
import IndividualBuyerLayout from './IndividualBuyerLayout';
import BuyerHome from '../buyer/Home';
import BuyerProfile from '../buyer/BuyerProfile';
import UnifiedSearch from '../buyer/UnifiedSearch';
import WantedCrops from '../buyer/WantedCrops';
import MyRequests from '../buyer/MyRequests';
import Settings from '../buyer/Settings';

const IndividualBuyerDashboard: React.FC = () => {
  return (
    <IndividualBuyerLayout>
      <Routes>
        <Route path="/" element={<BuyerHome />} />
        <Route path="/profile" element={<BuyerProfile />} />
        <Route path="/search" element={<UnifiedSearch />} />
        <Route path="/wanted-crops" element={<WantedCrops />} />
        <Route path="/requests" element={<MyRequests />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </IndividualBuyerLayout>
  );
};

export default IndividualBuyerDashboard;
