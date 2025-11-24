import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PublicPages.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    {
      id: 1,
      category: 'general',
      question: 'What is Uthra?',
      answer: 'Uthra is a comprehensive agricultural marketplace platform that connects farmers and buyers directly, eliminating middlemen. It supports multiple communication channels including web, SMS, and IVR (phone calls) to ensure accessibility for all users.'
    },
    {
      id: 2,
      category: 'farmer',
      question: 'How can farmers register and start selling?',
      answer: 'Farmers can register through our website, SMS, or phone call. After creating an account with basic details, they can list their crops with quantities, prices, and location. Our team verifies listings to ensure quality and authenticity.'
    },
    {
      id: 3,
      category: 'buyer',
      question: 'How do buyers find and purchase crops?',
      answer: 'Buyers can search for crops by type, location, quantity, and price range. They can contact farmers directly through the platform, negotiate prices, and arrange pickup or delivery. Both individual and company buyers are supported.'
    },
    {
      id: 4,
      category: 'general',
      question: 'What communication channels does Uthra support?',
      answer: 'Uthra supports web dashboard, SMS notifications, and IVR (Interactive Voice Response) system for phone calls. This ensures that farmers without internet access can still use the platform effectively.'
    },
    {
      id: 5,
      category: 'farmer',
      question: 'Is there any commission or fees for farmers?',
      answer: 'No! Uthra does not charge any commission or listing fees from farmers. Our platform is designed to maximize farmer profits by eliminating middlemen and providing direct access to buyers.'
    },
    {
      id: 6,
      category: 'buyer',
      question: 'How is payment handled?',
      answer: 'Currently, payments are handled directly between farmers and buyers. We provide a secure messaging system for communication and negotiation. Future updates will include integrated payment processing.'
    },
    {
      id: 7,
      category: 'technical',
      question: 'How does the IVR system work?',
      answer: 'Farmers can call our IVR number and use simple voice commands or keypad inputs to list crops, check requests, and manage their account. The system supports multiple regional languages for better accessibility.'
    },
    {
      id: 8,
      category: 'technical',
      question: 'What information is required to register?',
      answer: 'Basic information includes name, phone number, location, and role (farmer/buyer). Farmers additionally provide farming details, while buyers may specify their business type and requirements.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: '❓' },
    { id: 'general', name: 'General', icon: '🌾' },
    { id: 'farmer', name: 'For Farmers', icon: '👨‍🌾' },
    { id: 'buyer', name: 'For Buyers', icon: '🛒' },
    { id: 'technical', name: 'Technical', icon: '⚙️' }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
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

      <main className="faq-main">
        <div className="container">
          <div className="faq-hero">
            <h1>❓ Frequently Asked Questions</h1>
            <p>Find answers to common questions about Uthra platform</p>
          </div>

          <div className="faq-categories">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          <div className="faq-list">
            {filteredFAQs.map(item => (
              <div key={item.id} className="faq-item">
                <button 
                  className="faq-question"
                  onClick={() => toggleItem(item.id)}
                >
                  <span>{item.question}</span>
                  <span className={`faq-toggle ${openItems.includes(item.id) ? 'open' : ''}`}>+</span>
                </button>
                {openItems.includes(item.id) && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="faq-contact">
            <h3>Still have questions?</h3>
            <p>Can't find what you're looking for? Contact our support team.</p>
            <Link to="/contact" className="contact-btn">
              📞 Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;