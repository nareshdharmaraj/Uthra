import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// Legacy Dashboard - Redirects to new separate dashboards
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Redirect to the appropriate dashboard
    if (user?.buyerType === 'company') {
      navigate('/company-buyer', { replace: true });
    } else {
      navigate('/individual-buyer', { replace: true });
    }
  }, [user, navigate]);

  // Fallback for immediate redirect
  if (user?.buyerType === 'company') {
    return <Navigate to="/company-buyer" replace />;
  }
  return <Navigate to="/individual-buyer" replace />;
};

export default Dashboard;
