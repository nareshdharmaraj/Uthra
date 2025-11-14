import React from 'react';

const MyRequests: React.FC = () => {
  return (
    <div className="my-requests">
      <h1>My Requests</h1>
      <p>View and manage buyer requests</p>
      
      <div className="requests-list">
        <p className="text-center text-muted">No requests yet.</p>
      </div>
    </div>
  );
};

export default MyRequests;
