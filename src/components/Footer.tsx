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

      {/* SVG Background Pattern */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <svg width="100%" height="100%" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Angular geometric pattern matching the design */}
          
          {/* Top layer angular shapes */}
          <polygon points="0,0 300,0 240,120 60,120" fill="#1a1a1a" opacity="0.9"/>
          <polygon points="300,0 600,0 540,120 240,120" fill="#0f0f0f" opacity="0.7"/>
          <polygon points="600,0 900,0 840,120 540,120" fill="#1a1a1a" opacity="0.9"/>
          <polygon points="900,0 1200,0 1140,120 840,120" fill="#0f0f0f" opacity="0.7"/>
          <polygon points="1200,0 1440,0 1440,120 1140,120" fill="#1a1a1a" opacity="0.9"/>
          
          {/* Middle layer with more angular cuts */}
          <polygon points="60,120 240,120 320,250 140,250" fill="#0f0f0f" opacity="0.8"/>
          <polygon points="240,120 540,120 620,250 320,250" fill="#1a1a1a" opacity="0.6"/>
          <polygon points="540,120 840,120 920,250 620,250" fill="#0f0f0f" opacity="0.8"/>
          <polygon points="840,120 1140,120 1220,250 920,250" fill="#1a1a1a" opacity="0.6"/>
          <polygon points="1140,120 1440,120 1440,250 1220,250" fill="#0f0f0f" opacity="0.8"/>
          
          {/* Central hexagonal area */}
          <polygon points="320,250 620,250 720,350 520,450 220,450 120,350" fill="#0a0a0a" opacity="0.9"/>
          <polygon points="620,250 920,250 1020,350 820,450 520,450 720,350" fill="#0a0a0a" opacity="0.9"/>
          <polygon points="920,250 1220,250 1320,350 1120,450 820,450 1020,350" fill="#0a0a0a" opacity="0.9"/>
          <polygon points="1220,250 1440,250 1440,450 1320,350 1120,450" fill="#0a0a0a" opacity="0.9"/>
          <polygon points="0,250 120,350 220,450 0,450" fill="#0a0a0a" opacity="0.9"/>
          
          {/* Bottom angular shapes */}
          <polygon points="0,450 220,450 280,600 0,600" fill="#1a1a1a" opacity="0.9"/>
          <polygon points="220,450 520,450 580,600 280,600" fill="#0f0f0f" opacity="0.7"/>
          <polygon points="520,450 820,450 880,600 580,600" fill="#1a1a1a" opacity="0.9"/>
          <polygon points="820,450 1120,450 1180,600 880,600" fill="#0f0f0f" opacity="0.7"/>
          <polygon points="1120,450 1440,450 1440,600 1180,600" fill="#1a1a1a" opacity="0.9"/>
          
          {/* Blue/cyan outline strokes for the geometric pattern */}
          <polygon points="320,250 620,250 720,350 520,450 220,450 120,350" 
                   fill="none" stroke="#00aaff" strokeWidth="2" opacity="0.8"/>
          <polygon points="620,250 920,250 1020,350 820,450 520,450 720,350" 
                   fill="none" stroke="#00aaff" strokeWidth="2" opacity="0.8"/>
          <polygon points="920,250 1220,250 1320,350 1120,450 820,450 1020,350" 
                   fill="none" stroke="#00aaff" strokeWidth="2" opacity="0.8"/>
          
          {/* Additional angular outline elements */}
          <path d="M120,350 L320,250 L620,250 L720,350 L920,250 L1220,250 L1320,350" 
                stroke="#00aaff" strokeWidth="2" fill="none" opacity="0.6"/>
          <path d="M220,450 L520,450 L820,450 L1120,450" 
                stroke="#00aaff" strokeWidth="2" fill="none" opacity="0.6"/>
          
          {/* Corner accent lines */}
          <path d="M0,120 L60,120 L140,250 L0,250" 
                stroke="#00aaff" strokeWidth="1.5" fill="none" opacity="0.5"/>
          <path d="M1440,120 L1380,120 L1300,250 L1440,250" 
                stroke="#00aaff" strokeWidth="1.5" fill="none" opacity="0.5"/>
          <path d="M0,450 L140,350 L220,450" 
                stroke="#00aaff" strokeWidth="1.5" fill="none" opacity="0.5"/>
          <path d="M1440,450 L1300,350 L1220,450" 
                stroke="#00aaff" strokeWidth="1.5" fill="none" opacity="0.5"/>
        </svg>
      </div>

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