import React from 'react';
import '../styles/Fonts.css';
import '../styles/Main.css';
const Footer: React.FC = () => {
  return (
    <footer className="footer-wrapper text-white">
      {/* Hover effect */}
      <style>
        {`
          .footer-link:hover {
            color: #00ff00 !important;
          }
        `}
      </style>

      <div className="container-fluid px-4  ms-3">
        {/* Top Grid */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-5">
          {/* Column 1 */}
          <div>
            <h1 className="green-text fw-bold mb-4 aeonik-light">THE <br />STUDIO</h1>
            <ul className="list-unstyled">
              <li><a href="#about" className="footer-link text-white text-decoration-none">About Us</a></li>
              <li><a href="#team" className="footer-link text-white text-decoration-none">Our Team</a></li>
              <li><a href="#careers" className="footer-link text-white text-decoration-none">Careers</a></li>
            </ul>
          </div>
          {/* Column 2 */}
          <div>
            <h1 className="green-text fw-bold mb-4 aeonik-light">THE <br />WORKFLOW</h1>
            <ul className="list-unstyled">
              <li><a href="#portfolio" className="footer-link text-white text-decoration-none">Portfolio</a></li>
              <li><a href="#case-studies" className="footer-link text-white text-decoration-none">Case Studies</a></li>
              <li><a href="#testimonials" className="footer-link text-white text-decoration-none">Client Testimonials</a></li>
            </ul>
          </div>
          {/* Column 3 */}
          <div>
            <h1 className="green-text fw-bold mb-4 aeonik-light">THE <br />PLAYBOOK</h1>
            <ul className="list-unstyled">
              <li><a href="#growth-scripts" className="footer-link text-white text-decoration-none">Growth Scripts</a></li>
              <li><a href="#insights" className="footer-link text-white text-decoration-none">Insights</a></li>
              <li><a href="#trends" className="footer-link text-white text-decoration-none">Trends</a></li>
            </ul>
          </div>
          {/* Column 4 */}
          <div>
              <h1 className="green-text fw-bold mb-4 aeonik-regular">LEGAL & <br />SEO</h1>
            <ul className="list-unstyled">
              <li><a href="#privacy" className="footer-link text-white text-decoration-none">Privacy Policy</a></li>
              <li><a href="#terms" className="footer-link text-white text-decoration-none">Terms of Service</a></li>
              <li><a href="#sitemap" className="footer-link text-white text-decoration-none">Sitemap</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="green-text">© Auxin Media 2025</div>
          <div className="green-text">auxinmedia@gmail.com</div>
          <div className="green-text">Connect with Team</div>
        </div>

        {/* Large Logo */}
        <div className="text-center">
          <h1 className="footer-brand aeonik-regular" style={{fontSize : "300px"}}>Auxin Media</h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
