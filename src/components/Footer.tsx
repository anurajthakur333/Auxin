import { useState, useEffect, useRef } from 'react';
import '../styles/fonts.css';
import '../styles/Main.css';

const Footer = () => {
  const [animatedLetters, setAnimatedLetters] = useState<boolean[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const fullText = "Auxin Media";
  const letters = fullText.split('');

  useEffect(() => {
    // Initialize all letters as not animated
    setAnimatedLetters(new Array(letters.length).fill(false));
    
    // Set up Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          
          // Start animation after a short delay
          setTimeout(() => {
            letters.forEach((_, index) => {
              setTimeout(() => {
                setAnimatedLetters(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }, index * 100); // 100ms delay between each letter
            });
          }, 300); // Initial delay before animation starts
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the element is visible
        rootMargin: '0px 0px -100px 0px' // Start animation slightly before the element is fully visible
      }
    );

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
      }
    };
  }, [isVisible]);

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
          .auxin-text > span {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
            display: inline-block !important;
            line-height: 0.7 !important;
            white-space: nowrap !important;
          }
          
          /* Animation styles for individual letters */
          .animated-letter {
            display: inline-block !important;
            transform: translateY(500px);
            transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            vertical-align: baseline;
            opacity: 1;
          }
          
          .animated-letter.visible {
            transform: translateY(0);
          }
        `}
      </style>

      <div className="container-fluid px-4" style={{marginLeft:"0px"}}>
        {/* Top Grid */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-5">
          {/* Column 1 */}
          <div>
            <h1 className="green-text fw-bold mb-4 aeonik-regular" style={{lineHeight:"40px"}}>THE <br />STUDIO</h1>
            <ul className="list-unstyled">
              <li><a href="#about" className="footer-link text-white text-decoration-none aeonik-regular">About Us</a></li>
              <li><a href="#team" className="footer-link text-white text-decoration-none aeonik-regular">Our Team</a></li>
              <li><a href="#careers" className="footer-link text-white text-decoration-none aeonik-regular">Careers</a></li>
            </ul>
          </div>
          {/* Column 2 */}
          <div>
            <h1 className="green-text fw-bold mb-4 aeonik-regular"style={{lineHeight:"40px"}}>THE <br />WORKFLOW</h1>
            <ul className="list-unstyled">
              <li><a href="#portfolio" className="footer-link text-white text-decoration-none aeonik-regular">Portfolio</a></li>
              <li><a href="#case-studies" className="footer-link text-white text-decoration-none aeonik-regular">Case Studies</a></li>
              <li><a href="#testimonials" className="footer-link text-white text-decoration-none aeonik-regular">Client Testimonials</a></li>
            </ul>
          </div>
          {/* Column 3 */}
          <div>
            <h1 className="green-text fw-bold mb-4 aeonik-regular"style={{lineHeight:"40px"}}>THE <br />PLAYBOOK</h1>
            <ul className="list-unstyled">
              <li><a href="#growth-scripts" className="footer-link text-white text-decoration-none aeonik-regular">Growth Scripts</a></li>
              <li><a href="#insights" className="footer-link text-white text-decoration-none aeonik-regular">Insights</a></li>
              <li><a href="#trends" className="footer-link text-white text-decoration-none aeonik-regular">Trends</a></li>
            </ul>
          </div>
          {/* Column 4 */}
          <div>
              <h1 className="green-text fw-bold mb-4 aeonik-regular"style={{lineHeight:"40px"}}>LEGAL & <br />SEO</h1>
            <ul className="list-unstyled">
              <li><a href="#privacy" className="footer-link text-white text-decoration-none aeonik-regular">Privacy Policy</a></li>
              <li><a href="#terms" className="footer-link text-white text-decoration-none aeonik-regular">Terms of Service</a></li>
              <li><a href="#sitemap" className="footer-link text-white text-decoration-none aeonik-regular">Sitemap</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
   

      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center aeonik-regular" style={{marginLeft:"200px",marginRight:"200px"}}>
          <div className="green-text">© Auxin Media 2025</div>
          <div className="green-text">Auxinmedia@gmail.com</div>
          <div className="green-text">Connect with Team</div>
        </div>




      {/* Large AUXINMEDIA text - Flush with bottom */}
      <div 
        ref={textRef}
        className="auxin-text aeonik-regular mb-3" 
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
        {letters.map((letter, index) => (
          <span
            key={index}
            className={`animated-letter ${animatedLetters[index] ? 'visible' : ''}`}
            style={{
              transitionDelay: `${index * 50}ms`
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </span>
    </div>
    </footer>
  );
};

export default Footer;