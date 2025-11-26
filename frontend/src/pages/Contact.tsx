import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PublicPages.css';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

      <main className="contact-main">
        <div className="container">
          <div className="contact-hero">
            <h1>📞 Contact Us</h1>
            <p>Get in touch with our team. We're here to help with any questions about Uthra platform.</p>
          </div>

          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">📧</div>
                <h3>Email Support</h3>
                <p>noreply.uthra@gmail.com</p>
                <span>Response within 24 hours</span>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h3>Phone Support</h3>
                <p>+91 7200 7545 66</p>
                <span>Mon-Fri: 9 AM - 6 PM IST</span>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <h3>Office Address</h3>
                <p>Agricultural Tech Hub<br />Chennai, Tamil Nadu, India</p>
                <span>Visit by appointment</span>
              </div>
            </div>

            <div className="contact-form">
              <h2>Send us a Message</h2>
              {submitMessage && (
                <div className="success-message">{submitMessage}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Brief subject of your inquiry"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Please describe your question or issue in detail"
                  />
                </div>
                
                <button type="submit" disabled={isSubmitting} className="submit-btn">
                  {isSubmitting ? '📤 Sending...' : '📩 Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;