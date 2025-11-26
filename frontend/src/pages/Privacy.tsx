import React from 'react';
import { Link } from 'react-router-dom';
import './PublicPages.css';

const Privacy: React.FC = () => {
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

      <main className="privacy-main">
        <div className="container">
          <div className="privacy-hero">
            <h1>🔒 Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="privacy-content">
            <section className="privacy-section">
              <h2>1. Information We Collect</h2>
              <h3>Personal Information</h3>
              <ul>
                <li>Name, phone number, and location during registration</li>
                <li>Agricultural details for farmers (farm size, crop types)</li>
                <li>Business information for buyers (company details, purchase requirements)</li>
                <li>Communication preferences and contact history</li>
              </ul>

              <h3>Usage Information</h3>
              <ul>
                <li>Platform usage patterns and feature interactions</li>
                <li>SMS and IVR call logs for service improvement</li>
                <li>Search queries and marketplace activities</li>
                <li>Technical information (device type, browser, IP address)</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>2. How We Use Your Information</h2>
              <ul>
                <li><strong>Service Provision:</strong> To enable connections between farmers and buyers</li>
                <li><strong>Communication:</strong> Send notifications via web, SMS, or voice calls</li>
                <li><strong>Platform Improvement:</strong> Analyze usage to enhance user experience</li>
                <li><strong>Security:</strong> Prevent fraud and ensure platform safety</li>
                <li><strong>Support:</strong> Provide customer assistance and troubleshooting</li>
                <li><strong>Legal Compliance:</strong> Meet regulatory requirements and legal obligations</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>3. Information Sharing</h2>
              <p>We share information only in these circumstances:</p>
              <ul>
                <li><strong>Between Users:</strong> Connecting farmers and buyers for transactions</li>
                <li><strong>Service Providers:</strong> Third-party services that help operate the platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or government authorities</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale</li>
                <li><strong>Consent:</strong> When you explicitly authorize sharing</li>
              </ul>
              <p><strong>We never sell your personal data to third parties for marketing purposes.</strong></p>
            </section>

            <section className="privacy-section">
              <h2>4. Data Security</h2>
              <ul>
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication measures</li>
                <li>Secure hosting infrastructure with backup systems</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>5. Your Rights and Choices</h2>
              <ul>
                <li><strong>Access:</strong> Request information about data we have collected</li>
                <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from SMS or email communications</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in standard format</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>6. Contact Information</h2>
              <p>
                For privacy-related questions or requests:
                <br />
                Email: noreply.uthra@gmail.com
                <br />
                Phone: +91 7200 7545 66
              </p>
            </section>
          </div>

          <div className="privacy-footer">
            <p>Your privacy is fundamental to our mission of connecting agricultural communities safely and securely.</p>
            <div className="privacy-actions">
              <Link to="/" className="btn-primary">Understood</Link>
              <Link to="/contact" className="btn-secondary">Contact Privacy Team</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;