import React from 'react';
import { Link } from 'react-router-dom';
import './PublicPages.css';

const Terms: React.FC = () => {
  return (
    <div className="public-page">
      <header className="public-header">
        <div className="container">
          <Link to="/" className="logo">
            <img src="/uthralogo.png" alt="Uthra Logo" style={{height: '40px', width: 'auto'}} />
            <span>Uthra</span>
          </Link>
          <nav>
            <Link to="/" className="nav-link">Back to Home</Link>
          </nav>
        </div>
      </header>

      <main className="terms-main">
        <div className="container">
          <div className="terms-hero">
            <h1>📜 Terms of Service</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="terms-content">
            <section className="terms-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using Uthra agricultural marketplace platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="terms-section">
              <h2>2. Platform Description</h2>
              <p>
                Uthra is an agricultural marketplace that connects farmers directly with buyers, eliminating middlemen. Our platform supports web, SMS, and IVR (phone call) channels to ensure accessibility for all users.
              </p>
            </section>

            <section className="terms-section">
              <h2>3. User Responsibilities</h2>
              <ul>
                <li>Provide accurate and truthful information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the platform in compliance with applicable laws</li>
                <li>Respect other users and maintain professional conduct</li>
                <li>Report any suspicious or fraudulent activities</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2>4. For Farmers</h2>
              <ul>
                <li>List only genuine crops that you own or have authorization to sell</li>
                <li>Provide accurate descriptions, quantities, and pricing</li>
                <li>Honor commitments made to buyers through the platform</li>
                <li>Maintain quality standards for listed agricultural products</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2>5. For Buyers</h2>
              <ul>
                <li>Respect farmers' pricing and negotiate in good faith</li>
                <li>Honor purchase commitments made through the platform</li>
                <li>Arrange timely pickup or payment as agreed</li>
                <li>Report quality issues through proper channels</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2>6. Platform Usage</h2>
              <ul>
                <li>The platform is provided "as is" without warranties</li>
                <li>We reserve the right to modify or discontinue services</li>
                <li>Users are responsible for their own internet connectivity and devices</li>
                <li>Multiple communication channels (web, SMS, IVR) are available</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2>7. Privacy and Data</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information. By using Uthra, you consent to our data practices as described in our Privacy Policy.
              </p>
            </section>

            <section className="terms-section">
              <h2>8. Limitation of Liability</h2>
              <p>
                Uthra acts as a marketplace facilitator and is not responsible for the actual transactions between farmers and buyers. We do not guarantee the quality, safety, or legality of crops listed on the platform.
              </p>
            </section>

            <section className="terms-section">
              <h2>9. Dispute Resolution</h2>
              <p>
                In case of disputes between users, we encourage direct resolution. For unresolved issues, disputes will be handled according to Indian law and jurisdiction.
              </p>
            </section>

            <section className="terms-section">
              <h2>10. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of significant changes through the platform. Continued use of the service constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="terms-section">
              <h2>11. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at:
                <br />
                Email: legal@uthra.com
                <br />
                Phone: +91 1800-123-4567
              </p>
            </section>
          </div>

          <div className="terms-footer">
            <p>By using Uthra, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
            <div className="terms-actions">
              <Link to="/" className="btn-primary">Accept & Continue</Link>
              <Link to="/contact" className="btn-secondary">Contact Legal Team</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;