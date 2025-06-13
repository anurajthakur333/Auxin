import '../styles/fonts.css';
import '../styles/Main.css';

const Footer = () => {
  return (
    <footer className="footer-wrapper text-white" style={{ overflow: 'hidden', margin: 0, padding: 0 }}>
      {/* Hover effect */}
      <style>
        {`
          .footer-link:hover {
            color: #00ff00 !important;
          }
          .footer-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }
          .auxin-text {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 0.7 !important;
            overflow: hidden !important;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }
          .auxin-text span {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
            display: block !important;
            line-height: 0.7 !important;
          }
        `}
      </style>

      <div className="container-fluid px-4 ms-3">
        {/* Top Grid */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-5">
          {/* Column 1 */}
          <div>
            <h1 className="green-text fw-bold mb-4 aeonik-regular">THE <br />STUDIO</h1>
            <ul className="list-unstyled">
              <li><a href="#about" className="footer-link text-white text-decoration-none aeonik-regular">About Us</a></li>
              <li><a href="#team" className="footer-link text-white text-decoration-none aeonik-regular">Our Team</a></li>
              <li><a href="#careers" className="footer-link text-white text-decoration-none aeonik-regular">Careers</a></li>
            </ul>
          </div>
          {/* Column 2 */}
          <div>
            <h1 className="green-text fw-bold mb-4 aeonik-regular">THE <br />WORKFLOW</h1>
            <ul className="list-unstyled">
              <li><a href="#portfolio" className="footer-link text-white text-decoration-none aeonik-regular">Portfolio</a></li>
              <li><a href="#case-studies" className="footer-link text-white text-decoration-none aeonik-regular">Case Studies</a></li>
              <li><a href="#testimonials" className="footer-link text-white text-decoration-none aeonik-regular">Client Testimonials</a></li>
            </ul>
          </div>
          {/* Column 3 */}
          <div>
            <h1 className="green-text fw-bold mb-4 aeonik-regular">THE <br />PLAYBOOK</h1>
            <ul className="list-unstyled">
              <li><a href="#growth-scripts" className="footer-link text-white text-decoration-none aeonik-regular">Growth Scripts</a></li>
              <li><a href="#insights" className="footer-link text-white text-decoration-none aeonik-regular">Insights</a></li>
              <li><a href="#trends" className="footer-link text-white text-decoration-none aeonik-regular">Trends</a></li>
            </ul>
          </div>
          {/* Column 4 */}
          <div>
              <h1 className="green-text fw-bold mb-4 aeonik-regular">LEGAL & <br />SEO</h1>
            <ul className="list-unstyled">
              <li><a href="#privacy" className="footer-link text-white text-decoration-none aeonik-regular">Privacy Policy</a></li>
              <li><a href="#terms" className="footer-link text-white text-decoration-none aeonik-regular">Terms of Service</a></li>
              <li><a href="#sitemap" className="footer-link text-white text-decoration-none aeonik-regular">Sitemap</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="d-flex flex-wrap justify-content-between align-items-center px-5">
          <div className="green-text">© Auxin Media 2025</div>
          <div className="green-text">auxinmedia@gmail.com</div>
          <div className="green-text">Connect with Team</div>
        </div>

      </div>

      {/* Large AUXINMEDIA text - Flush with bottom */}
      <div className="auxin-text aeonik-regular mb-3" 
      style={{
        overflow: 'hidden',
        height: 'auto',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'transparent',
        width: '100%',
        minWidth: 0
      }}
    >
      <span 
        className="aeonik-regular mt-5 leading-none"
        style={{
          fontSize: '300px', 
          letterSpacing: '-0.07em',
          whiteSpace: 'nowrap',
          transform: 'scale(1)',
          transformOrigin: 'center',
          minWidth: 'max-content'
        }}
      >
        Auxin Media
      </span>
    </div>
    </footer>
  );
};

export default Footer;