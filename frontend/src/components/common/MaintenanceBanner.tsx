import React from 'react';
import '../../styles/MaintenanceBanner.css';

interface MaintenanceBannerProps {
  message?: string;
  startTime?: Date;
}

const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ 
  message = 'System is currently in maintenance mode',
  startTime 
}) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="maintenance-banner">
      <div className="maintenance-banner-content">
        <span className="maintenance-icon">🔧</span>
        <div className="maintenance-text">
          <strong>Maintenance Mode Active</strong>
          <span className="maintenance-message">{message}</span>
          {startTime && (
            <span className="maintenance-time">
              Since: {formatTime(startTime)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
