import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <header className="header">
        <div className="container">
          <div className="logo">
            <h1>🌾 Uthra</h1>
          </div>
          <nav className="nav">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Light of Communication between Farmers and Buyers</h1>
            <p className="hero-subtitle">
              Empowering farmers to connect directly with buyers through voice, SMS, and web technology
            </p>
            <div className="hero-buttons">
              <Link to="/register?role=farmer" className="btn btn-large btn-primary">
                Register as Farmer
              </Link>
              <Link to="/register?role=buyer" className="btn btn-large btn-secondary">
                Register as Buyer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>IVR System</h3>
              <p>Access platform through simple phone calls with voice-guided menu</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>SMS Integration</h3>
              <p>Receive instant updates and communicate via SMS</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Web Dashboard</h3>
              <p>Manage crops, view requests, and track transactions online</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Direct Connection</h3>
              <p>Connect farmers directly with buyers for fair pricing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Updates</h3>
              <p>Get instant notifications about requests and price changes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>PIN-based authentication for farmers, secure login for buyers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register</h3>
              <p>Sign up as a farmer or buyer with your mobile number</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>List or Browse</h3>
              <p>Farmers list crops, buyers browse available produce</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Connect</h3>
              <p>Buyers make requests, farmers receive notifications</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Trade</h3>
              <p>Negotiate prices and complete transactions</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Uthra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
