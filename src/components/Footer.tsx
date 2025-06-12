import React from 'react';

const Footer: React.FC = () => {
  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: 400,
    transition: 'color 0.3s ease'
  };

  return (
    <footer style={{ position: 'relative', backgroundColor: '#000', overflow: 'hidden' }}>
      {/* Add CSS for hover effects */}
      <style>
        {`
          .footer-link:hover {
            color: #00ff00 !important;
          }
        `}
      </style>



      {/* Footer Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '80px 25px 40px 25px' }}>
        {/* Navigation Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '60px', 
          marginBottom: '80px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* THE STUDIO */}
          <div>
            <h3 className="aeonik-regular" style={{
              color: '#00ff00',
              fontSize: '24px',
              fontWeight: 400,
              marginBottom: '30px',
              letterSpacing: '-0.5px'
            }}>
              THE STUDIO
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '15px' }}>
                <a href="#about" className="aeonik-regular footer-link" style={linkStyle}>
                  About Us
                </a>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <a href="#team" className="aeonik-regular footer-link" style={linkStyle}>
                  Our Team
                </a>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <a href="#careers" className="aeonik-regular footer-link" style={linkStyle}>
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* THE WORKFLOW */}
          <div>
            <h3 className="aeonik-regular" style={{
              color: '#00ff00',
              fontSize: '24px',
              fontWeight: 400,
              marginBottom: '30px',
              letterSpacing: '-0.5px'
            }}>
              THE WORKFLOW
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '15px' }}>
                <a href="#portfolio" className="aeonik-regular footer-link" style={linkStyle}>
                  Portfolio
                </a>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <a href="#case-studies" className="aeonik-regular footer-link" style={linkStyle}>
                  Case Studies
                </a>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <a href="#testimonials" className="aeonik-regular footer-link" style={linkStyle}>
                  Client Testimonials
                </a>
              </li>
            </ul>
          </div>

          {/* THE PLAYBOOK */}
          <div>
            <h3 className="aeonik-regular" style={{
              color: '#00ff00',
              fontSize: '24px',
              fontWeight: 400,
              marginBottom: '30px',
              letterSpacing: '-0.5px'
            }}>
              THE PLAYBOOK
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '15px' }}>
                <a href="#growth-scripts" className="aeonik-regular footer-link" style={linkStyle}>
                  Growth Scripts
                </a>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <a href="#insights" className="aeonik-regular footer-link" style={linkStyle}>
                  Insights
                </a>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <a href="#trends" className="aeonik-regular footer-link" style={linkStyle}>
                  Trends
                </a>
              </li>
            </ul>
          </div>

          {/* LEGAL & SEO */}
          <div>
            <h3 className="aeonik-regular" style={{
              color: '#00ff00',
              fontSize: '24px',
              fontWeight: 400,
              marginBottom: '30px',
              letterSpacing: '-0.5px'
            }}>
              LEGAL & SEO
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '15px' }}>
                <a href="#privacy" className="aeonik-regular footer-link" style={linkStyle}>
                  Privacy Policy
                </a>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <a href="#terms" className="aeonik-regular footer-link" style={linkStyle}>
                  Terms of Service
                </a>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <a href="#sitemap" className="aeonik-regular footer-link" style={linkStyle}>
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div className="aeonik-regular" style={{
            color: '#00ff00',
            fontSize: '16px',
            fontWeight: 400
          }}>
            © Auxin Media 2025
          </div>
          
          <div className="aeonik-regular" style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: 400
          }}>
            auxinmedia@gmail.com
          </div>
          
          <div className="aeonik-regular" style={{
            color: '#00ff00',
            fontSize: '16px',
            fontWeight: 400
          }}>
            Connect with Team
          </div>
        </div>

        {/* Large Brand Name */}
        <div style={{ textAlign: 'center' }}>
          <h1 className="aeonik-regular" style={{
            color: 'white',
            fontSize: 'clamp(60px, 12vw, 180px)',
            fontWeight: 400,
            margin: 0,
            letterSpacing: '-2px',
            lineHeight: '0.9'
          }}>
            Auxin Media
          </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 