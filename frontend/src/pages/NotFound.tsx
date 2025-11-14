import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '72px', marginBottom: '20px' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ marginTop: '20px', marginBottom: '30px' }}>
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
