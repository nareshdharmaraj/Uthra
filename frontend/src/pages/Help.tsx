import React from 'react';
import { Link } from 'react-router-dom';
import './PublicPages.css';

const Help: React.FC = () => {
  const helpTopics = [
    {
      icon: '🌾',
      title: 'Getting Started as a Farmer',
      description: 'Learn how to create your account, list crops, and connect with buyers.',
      topics: ['Account registration', 'Listing crops', 'Managing inventory', 'Pricing guidelines']
    },
    {
      icon: '🛒',
      title: 'Buyer\'s Guide',
      description: 'Find crops, connect with farmers, and manage your purchases.',
      topics: ['Searching crops', 'Contacting farmers', 'Negotiating prices', 'Order management']
    },
    {
      icon: '📱',
      title: 'Using SMS & IVR',
      description: 'Access Uthra features through phone calls and text messages.',
      topics: ['IVR navigation', 'SMS commands', 'Voice prompts', 'Multi-language support']
    },
    {
      icon: '🔒',
      title: 'Account & Security',
      description: 'Manage your profile, security settings, and privacy preferences.',
      topics: ['Profile management', 'Security settings', 'Privacy controls', 'Data protection']
    }
  ];

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

      <main className="help-main">
        <div className="container">
          <div className="help-hero">
            <h1>❓ Help Center</h1>
            <p>Find guides, tutorials, and resources to make the most of Uthra platform</p>
          </div>

          <div className="help-grid">
            {helpTopics.map((topic, index) => (
              <div key={index} className="help-card">
                <div className="help-icon">{topic.icon}</div>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <ul className="topic-list">
                  {topic.topics.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="help-support">
            <h2>Need More Help?</h2>
            <p>Can't find what you're looking for? Our support team is here to help.</p>
            <div className="support-options">
              <Link to="/faq" className="support-btn">
                📋 View FAQ
              </Link>
              <Link to="/contact" className="support-btn">
                📞 Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Help;