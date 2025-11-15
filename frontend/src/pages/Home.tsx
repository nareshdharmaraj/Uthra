import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      <header className={`header ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">Uthra</span>
          </Link>
          <nav className="nav">
            <Link to="/login" className="nav-link">Login</Link>
            <div 
              className="nav-dropdown"
              onMouseEnter={() => setShowRegisterDropdown(true)}
              onMouseLeave={() => setShowRegisterDropdown(false)}
            >
              <button className="nav-link dropdown-trigger">
                Register
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L2 4h8L6 8z"/>
                </svg>
              </button>
              {showRegisterDropdown && (
                <div className="dropdown-menu">
                  <Link to="/register?role=farmer" className="dropdown-item">
                    <span className="dropdown-icon">👨‍🌾</span>
                    Register as Farmer
                  </Link>
                  <Link to="/register?role=buyer" className="dropdown-item">
                    <span className="dropdown-icon">🛒</span>
                    Register as Buyer
                  </Link>
                  <Link to="/register?role=donator" className="dropdown-item">
                    <span className="dropdown-icon">💝</span>
                    Register as Donator
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">Connecting Agriculture 🌱</div>
            <p className="hero-subtitle">
              Uthra bridges the gap in agricultural trade by providing a multi-channel platform where farmers can list their produce and buyers can discover quality crops directly, eliminating middlemen and ensuring fair prices for everyone.
            </p>
            <div className="hero-buttons">
              <Link to="/register?role=farmer" className="btn btn-primary">
                <span>Register as Farmer</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/register?role=buyer" className="btn btn-secondary">
                <span>Register as Buyer</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Active Farmers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">500+</div>
                <div className="stat-label">Verified Buyers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">5000+</div>
                <div className="stat-label">Successful Trades</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-title">What is Uthra?</h2>
              <p className="about-text">
                Uthra is a comprehensive agricultural marketplace platform designed to empower farmers and streamline the buying process. Our platform supports multiple communication channels including IVR (Interactive Voice Response), SMS, and web interfaces to ensure accessibility for all users.
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-check">✓</div>
                  <div>
                    <h4>Multi-Channel Access</h4>
                    <p>Use phone calls, SMS, or web dashboard based on your preference</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-check">✓</div>
                  <div>
                    <h4>Real-Time Notifications</h4>
                    <p>Get instant alerts about new requests, price updates, and transactions</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-check">✓</div>
                  <div>
                    <h4>Secure Transactions</h4>
                    <p>PIN-based authentication and encrypted data for complete security</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-check">✓</div>
                  <div>
                    <h4>Fair Pricing</h4>
                    <p>Direct farmer-buyer connection ensures transparent and fair market rates</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <div className="placeholder-icon">🌾</div>
                <div className="placeholder-text">Empowering Agriculture</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>IVR System</h3>
              <p>Voice-guided menu system accessible via phone calls in multiple regional languages</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>SMS Alerts</h3>
              <p>Instant SMS notifications for requests, updates, and transaction confirmations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Web Dashboard</h3>
              <p>Full-featured online dashboard for managing crops, requests, and analytics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Direct Connect</h3>
              <p>Eliminate middlemen and connect directly for transparent fair-trade pricing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Live Updates</h3>
              <p>Real-time market trends, price changes, and buyer request notifications</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Access</h3>
              <p>PIN authentication for farmers, encrypted data, and secure payment tracking</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Register</h3>
              <p>Create your account as a farmer or buyer via web, phone, or SMS</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>List/Browse</h3>
              <p>Farmers list crops with details; Buyers search available produce</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Connect</h3>
              <p>Send requests and negotiate prices directly without middlemen</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Transact</h3>
              <p>Finalize deals, arrange delivery, and complete secure payments</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join the agricultural revolution and connect with transparency</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section footer-about">
              <div className="footer-logo">
                <span className="logo-icon">🌾</span>
                <span className="logo-text">Uthra</span>
              </div>
              <p className="footer-tagline">Connecting farmers and buyers for transparent, fair-trade agriculture</p>
              <div className="footer-social">
                <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><span>📘</span></a>
                <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><span>🐦</span></a>
                <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><span>📷</span></a>
                <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><span>💼</span></a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register?role=farmer">Register as Farmer</Link></li>
                <li><Link to="/register?role=buyer">Register as Buyer</Link></li>
                <li><Link to="/register?role=donator">Register as Donator</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contact Us</h4>
              <ul className="footer-contact">
                <li>📧 support@uthra.com</li>
                <li>📞 +91 1800-123-4567</li>
                <li>📍 Agricultural Tech Hub<br />Chennai, Tamil Nadu, India</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a href="/faq">FAQs</a></li>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/guidelines">Community Guidelines</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Uthra. All rights reserved.</p>
            <p className="footer-credits">Built with 💚 for farmers and buyers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
