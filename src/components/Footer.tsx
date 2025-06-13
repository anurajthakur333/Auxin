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
        <div className="d-flex flex-wrap justify-content-between align-items-center px-5">
          <div className="green-text">© Auxin Media 2025</div>
          <div className="green-text">auxinmedia@gmail.com</div>
          <div className="green-text">Connect with Team</div>
        </div>

      </div>

      {/* Large AUXINMEDIA text - Flush with bottom */}
      <div className="auxin-text aeonik-regular mb-3" style={{
        overflow: 'hidden',
        height: 'auto',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'transparent',
      }}>
        <span className="aeonik-regular  mt-5"style={{fontSize : "300px", letterSpacing: "-0.07em"}}>
          Auxin Media
        </span>
      </div>
    </footer>
  );
};

export default Footer;