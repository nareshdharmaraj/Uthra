import React from 'react';
import { Link } from 'react-router-dom';
import './PublicPages.css';

const Guidelines: React.FC = () => {
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

      <main className="guidelines-main">
        <div className="container">
          <div className="guidelines-hero">
            <h1>📋 Community Guidelines</h1>
            <p>Best practices for farmers and buyers to ensure a successful agricultural marketplace experience</p>
          </div>

          <div className="guidelines-content">
            <section className="guidelines-section">
              <h2>🌾 For Farmers</h2>
              
              <h3>Listing Your Crops</h3>
              <ul>
                <li>Provide accurate crop descriptions, quantities, and quality grades</li>
                <li>Include clear photos showing the actual condition of your crops</li>
                <li>Set fair and competitive pricing based on market rates</li>
                <li>Update availability in real-time to avoid disappointment</li>
                <li>Specify harvest dates and storage conditions</li>
              </ul>

              <h3>Communication Best Practices</h3>
              <ul>
                <li>Respond promptly to buyer inquiries (within 24 hours)</li>
                <li>Be honest about crop conditions and any limitations</li>
                <li>Clearly communicate pickup locations and timing</li>
                <li>Use professional language in all communications</li>
                <li>Provide contact information for direct coordination</li>
              </ul>

              <h3>Quality Standards</h3>
              <ul>
                <li>Ensure crops meet the quality described in listings</li>
                <li>Follow proper post-harvest handling procedures</li>
                <li>Maintain hygiene and safety standards during storage</li>
                <li>Sort crops by quality grades before listing</li>
                <li>Be transparent about any chemical treatments used</li>
              </ul>
            </section>

            <section className="guidelines-section">
              <h2>🛒 For Buyers</h2>
              
              <h3>Searching and Selection</h3>
              <ul>
                <li>Use specific search criteria to find relevant crops</li>
                <li>Review farmer profiles and previous transaction history</li>
                <li>Ask detailed questions about crop quality and specifications</li>
                <li>Compare multiple options before making decisions</li>
                <li>Consider location and logistics for pickup</li>
              </ul>

              <h3>Negotiation Ethics</h3>
              <ul>
                <li>Negotiate prices fairly and in good faith</li>
                <li>Respect farmers' pricing based on quality and market conditions</li>
                <li>Make reasonable offers considering production costs</li>
                <li>Honor verbal agreements made through the platform</li>
                <li>Provide timely responses during negotiations</li>
              </ul>

              <h3>Transaction Completion</h3>
              <ul>
                <li>Arrange pickup or delivery within agreed timeframes</li>
                <li>Bring proper transportation and storage equipment</li>
                <li>Inspect crops upon pickup and address issues immediately</li>
                <li>Complete payments as agreed (cash, bank transfer, etc.)</li>
                <li>Provide feedback to help improve the marketplace</li>
              </ul>
            </section>

            <section className="guidelines-section">
              <h2>🤝 General Platform Etiquette</h2>
              
              <h3>Communication Standards</h3>
              <ul>
                <li>Maintain respectful and professional communication</li>
                <li>Use appropriate language in all platform interactions</li>
                <li>Respond promptly to messages and calls</li>
                <li>Keep conversations focused on agricultural business</li>
                <li>Report inappropriate behavior to platform moderators</li>
              </ul>

              <h3>Safety and Security</h3>
              <ul>
                <li>Verify identity and credentials before large transactions</li>
                <li>Meet in public places for initial discussions</li>
                <li>Bring trusted associates for high-value transactions</li>
                <li>Keep records of all agreements and communications</li>
                <li>Report suspicious activities to the platform immediately</li>
              </ul>
            </section>

            <section className="guidelines-section">
              <h2>📱 Multi-Channel Usage</h2>
              
              <h3>Web Platform</h3>
              <ul>
                <li>Keep your profile updated with current information</li>
                <li>Use clear, professional photos for crop listings</li>
                <li>Regularly check messages and notifications</li>
                <li>Utilize search filters effectively</li>
              </ul>

              <h3>SMS Services</h3>
              <ul>
                <li>Use standard text format for better understanding</li>
                <li>Include essential details in SMS communications</li>
                <li>Respond to SMS notifications promptly</li>
                <li>Follow SMS command formats for system interactions</li>
              </ul>

              <h3>IVR System</h3>
              <ul>
                <li>Speak clearly when using voice commands</li>
                <li>Follow menu prompts carefully</li>
                <li>Have information ready before calling</li>
                <li>Use keypad options when voice recognition fails</li>
              </ul>
            </section>

            <section className="guidelines-section">
              <h2>⚠️ Prohibited Activities</h2>
              <ul>
                <li>False or misleading crop descriptions</li>
                <li>Price manipulation or artificial scarcity</li>
                <li>Harassment or inappropriate behavior</li>
                <li>Sharing personal information publicly</li>
                <li>Creating multiple accounts for fraudulent purposes</li>
                <li>Bypassing platform communication channels</li>
                <li>Selling non-agricultural products</li>
              </ul>
            </section>

            <section className="guidelines-section">
              <h2>🚨 Reporting Issues</h2>
              <p>If you encounter any problems:</p>
              <ul>
                <li>Report inappropriate behavior immediately</li>
                <li>Document evidence of policy violations</li>
                <li>Contact customer support for assistance</li>
                <li>Provide detailed information about incidents</li>
                <li>Follow up on reported issues</li>
              </ul>
            </section>
          </div>

          <div className="guidelines-footer">
            <h3>Building a Trusted Agricultural Community</h3>
            <p>Following these guidelines helps create a fair, transparent, and efficient marketplace for everyone.</p>
            <div className="guidelines-actions">
              <Link to="/" className="btn-primary">Start Trading</Link>
              <Link to="/contact" className="btn-secondary">Report an Issue</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Guidelines;