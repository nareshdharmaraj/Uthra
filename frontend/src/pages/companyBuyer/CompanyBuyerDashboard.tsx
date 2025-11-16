import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CompanyBuyerLayout from './CompanyBuyerLayout';
import CompanyHome from '../buyer/CompanyHome';
import EmployeeManagement from '../buyer/EmployeeManagement';
import CompanyStock from '../buyer/CompanyStock';
import BuyerProfile from '../buyer/BuyerProfile';
import UnifiedSearch from '../buyer/UnifiedSearch';
import MyRequests from '../buyer/MyRequests';
import Settings from '../buyer/Settings';

const CompanyBuyerDashboard: React.FC = () => {
  return (
    <CompanyBuyerLayout>
      <Routes>
        <Route path="/" element={<CompanyHome />} />
        <Route path="/profile" element={<BuyerProfile />} />
        <Route path="/employees" element={<EmployeeManagement />} />
        <Route path="/stock" element={<CompanyStock />} />
        <Route path="/search" element={<UnifiedSearch />} />
        <Route path="/requests" element={<MyRequests />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </CompanyBuyerLayout>
  );
};

export default CompanyBuyerDashboard;
