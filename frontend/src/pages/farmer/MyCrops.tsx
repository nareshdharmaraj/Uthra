import React from 'react';

const MyCrops: React.FC = () => {
  return (
    <div className="my-crops">
      <h1>My Crops</h1>
      <p>Manage your crop listings here</p>
      <button className="btn btn-primary">Add New Crop</button>
      
      <div className="crops-list">
        <p className="text-center text-muted">No crops listed yet. Add your first crop to get started!</p>
      </div>
    </div>
  );
};

export default MyCrops;
