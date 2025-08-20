import { useState, useEffect, useRef } from 'react';
import ScrambleText from './Scramble';
import { Link, useLocation } from 'react-router-dom';
import '../styles/fonts.css';
import '../styles/Main.css';

const Footer = () => {
  const location = useLocation();
  const [animatedLetters, setAnimatedLetters] = useState<boolean[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [headerAnimations, setHeaderAnimations] = useState({
    studio: [] as boolean[],
    workflow: [] as boolean[],
    playbook: [] as boolean[],
    legal: [] as boolean[]
  });
  const textRef = useRef<HTMLDivElement>(null);
  const headersRef = useRef<HTMLDivElement>(null);
  const fullText = "Auxin Media";
  const letters = fullText.split('');
  
  const headerTexts = {
    studio: "THE STUDIO",
    workflow: "THE WORKFLOW",
    playbook: "THE PLAYBOOK", 
    legal: "SEO & \u00A0 LEGALITIES"


  };

  useEffect(() => {
    // Initialize all letters as not animated
    setAnimatedLetters(new Array(letters.length).fill(false));
    
    // Initialize header animations
    const initialHeaderAnimations = {
      studio: new Array(headerTexts.studio.length).fill(false),
      workflow: new Array(headerTexts.workflow.length).fill(false),
      playbook: new Array(headerTexts.playbook.length).fill(false),
      legal: new Array(headerTexts.legal.length).fill(false)
    };
    setHeaderAnimations(initialHeaderAnimations);
    
    // Set up Intersection Observer for main text
    const mainObserver = new IntersectionObserver(
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

    // Set up Intersection Observer for headers  
    const headersObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate each header with a delay
          Object.keys(headerTexts).forEach((headerKey, headerIndex) => {
            const key = headerKey as keyof typeof headerTexts;
            const text = headerTexts[key];
            
            setTimeout(() => {
              text.split('').forEach((_, letterIndex) => {
                setTimeout(() => {
                  setHeaderAnimations(prev => {
                    const newLetters = [...prev[key]];
                    newLetters[letterIndex] = true;
                    return {
                      ...prev,
                      [key]: newLetters
                    };
                  });
                }, letterIndex * 50); // 50ms between each letter
              });
            }, headerIndex * 300); // 300ms between each header
          });
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (textRef.current) {
      mainObserver.observe(textRef.current);
    }
    if (headersRef.current) {
      headersObserver.observe(headersRef.current);
    }

    return () => {
      if (textRef.current) {
        mainObserver.unobserve(textRef.current);
      }
      if (headersRef.current) {
        headersObserver.unobserve(headersRef.current);
      }
    };
     }, []);

  // Helper function to render animated header text
  const renderAnimatedHeader = (headerKey: keyof typeof headerTexts) => {
    const text = headerTexts[headerKey];
    const letters = text.split('');
    const animatedLetters = headerAnimations[headerKey];
    
    return letters.map((letter, index) => {
      if (letter === ' ') {
        return <span key={index}>&nbsp;</span>;
      }
      return (
        <span
          key={index}
          className={`header-letter ${animatedLetters[index] ? 'visible' : ''}`}
        >
          {letter}
        </span>
      );
    });
  };

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

  /* Header letter animation - fade in place */
  .header-letter {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  
  .header-letter.visible {
    opacity: 1;
  }

  /* === ENHANCED: Clamp-based responsive font-size for the large "Auxin Media" footer text === */
  .footer-text {
    /* 
    clamp(minimum, preferred, maximum)
    - min: 8vw (viewport width) for very small screens
    - preferred: 25vw for responsive scaling
    - max: 620px for ultra-wide screens
    */
    font-size: clamp(8vw, 21vw, 620px) !important;
    letter-spacing: -0.07em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }


  /* High DPI displays - ensure text remains crisp */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .footer-text {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  }

  /* Fine-tune for very small screens */
  @media (max-width: 320px) {
    .footer-text {
      font-size: clamp(6vw, 20vw, 320px) !important;
    }
  }

  /* Fine-tune for very large screens */
  @media (min-width: 2560px) {
    .footer-text {
      font-size: clamp(400px, 21vw, 800px) !important;
    }
  }

  /* Socials + Newsletter row */
  .socials-row {
    gap: 10px;
  }
  .socials-row .social-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
    display: block;
    transition: filter 200ms ease, transform 200ms ease;
  }
  /* Hover green tint for social icons */
  .social-link:hover .social-icon {
    /* Approximate #39FF14 using CSS filter */
    filter: invert(63%) sepia(92%) saturate(867%) hue-rotate(67deg) brightness(104%) contrast(102%);
    transform: translateY(-1px);
  }
  .newsletter-container {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 600px;
    margin-left: auto;
  }
  .newsletter-input-wrapper {
    position: relative;
    flex: 1;
  }
  .newsletter-input-box {
    border: 1px solid #FFFFFF;
    padding: 16px 20px;
    color: inherit;
    letter-spacing: 0.02em;
    text-align: left;
    background: transparent;
    outline: none;
    width: 100%;
    caret-color: #ffffff;
    font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    white-space: nowrap;
  }
  /* Ensure green-text applies on inputs regardless of cascade order */
  .newsletter-input-box.green-text {
    color: #39FF14 !important;
    caret-color: #39FF14;
  }
  /* Override Chrome/Safari autofill styles so colors and fonts stay consistent */
  .newsletter-input-box:-webkit-autofill,
  .newsletter-input-box:-webkit-autofill:hover,
  .newsletter-input-box:-webkit-autofill:focus,
  .newsletter-input-box:-webkit-autofill:active {
    -webkit-text-fill-color: #39FF14 !important;
    caret-color: #39FF14;
    -webkit-box-shadow: 0 0 0px 1000px #000 inset;
    box-shadow: 0 0 0px 1000px #000 inset;
    transition: background-color 9999s ease-in-out 0s;
    font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
  }
  .newsletter-input-box:autofill {
    -webkit-text-fill-color: #39FF14 !important;
    caret-color: #39FF14;
    box-shadow: 0 0 0px 1000px #000 inset;
    font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
  }
  .newsletter-placeholder-overlay {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #ffffff;
    pointer-events: none;
    white-space: nowrap;
  }
  .newsletter-subscribe {
    border: 1px solid #FFFFFF;
    padding: 16px 28px;
    color: black;
    font-weight: 400;
    background-color:#ffffff;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 22px;
    min-width: 160px; /* Prevent button width jitter while scrambling */
  }
  @media (max-width: 768px) {
    .newsletter-container {
      max-width: 100%;
      margin-left: 0;
    }
    .socials-row {
      gap: 16px;
      margin-bottom: 16px;
    }
    .newsletter-input-box {
      padding: 12px 16px;
    }
    .newsletter-subscribe {
      padding: 12px 20px;
    }
  }
`}
</style>
<div 
  className="container-fluid" 
  style={{ paddingLeft: '110px', paddingRight: '110px', margin: '0 auto' }}
>
  {/* Top Flex Row */}
  <div 
    ref={headersRef} 
    className="d-flex justify-content-between flex-wrap mb-5"
    style={{ gap: "40px" }}   // optional gap between columns
  >
    {/* Column 1 (Left pinned) */}
    <div>
      <h1 className="green-text fw-bold mb-4 aeonik-regular" style={{lineHeight:"40px"}}>
        {renderAnimatedHeader('studio').slice(0, 3)} <br />
        {renderAnimatedHeader('studio').slice(4)}
      </h1>
      <ul className="list-unstyled">
        <li><a href="#about" className="footer-link text-white text-decoration-none aeonik-regular">About Us</a></li>
        <li><a href="#team" className="footer-link text-white text-decoration-none aeonik-regular">Our Team</a></li>
        <li><a href="#careers" className="footer-link text-white text-decoration-none aeonik-regular">Careers</a></li>
      </ul>
    </div>

    {/* Column 2 (Middle) */}
    <div>
      <h1 className="green-text fw-bold mb-4 aeonik-regular" style={{lineHeight:"40px"}}>
        {renderAnimatedHeader('workflow').slice(0, 3)} <br />
        {renderAnimatedHeader('workflow').slice(4)}
      </h1>
      <ul className="list-unstyled">
        <li><a href="#portfolio" className="footer-link text-white text-decoration-none aeonik-regular">Experience</a></li>
        <li><a href="#case-studies" className="footer-link text-white text-decoration-none aeonik-regular">Case Studies</a></li>
        <li><a href="#testimonials" className="footer-link text-white text-decoration-none aeonik-regular">Client Testimonials</a></li>
      </ul>
    </div>

    {/* Column 3 (Middle) */}
    <div>
      <h1 className="green-text fw-bold mb-4 aeonik-regular" style={{lineHeight:"40px"}}>
        {renderAnimatedHeader('playbook').slice(0, 3)} <br />
        {renderAnimatedHeader('playbook').slice(4)}
      </h1>
      <ul className="list-unstyled">
        <li><a href="#growth-scripts" className="footer-link text-white text-decoration-none aeonik-regular">Growth Scripts</a></li>
        <li><a href="#insights" className="footer-link text-white text-decoration-none aeonik-regular">Insights</a></li>
        <li><a href="#trends" className="footer-link text-white text-decoration-none aeonik-regular">Trends</a></li>
      </ul>
    </div>

    {/* Column 4 (Right pinned) */}
    <div>
      <h1 className="green-text fw-bold mb-4 aeonik-regular" style={{lineHeight:"40px"}}>
        {renderAnimatedHeader('legal').slice(0, 7)} <br />
        {renderAnimatedHeader('legal').slice(8)}
      </h1>
      <ul className="list-unstyled">
        <li><Link to="/privacy" className="footer-link text-white text-decoration-none aeonik-regular">Privacy Policy</Link></li>
        <li><Link to="/terms" className="footer-link text-white text-decoration-none aeonik-regular">Terms & Conditions</Link></li>
        <li><a href="#sitemap" className="footer-link text-white text-decoration-none aeonik-regular">Sitemap</a></li>
      </ul>
    </div>
  </div>
</div>



        {/* Bottom Row */}
        <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between socials-row mb-5"
        style={{paddingRight:'110px',paddingLeft:'110px'}
      }>
          {/* Social icons - order: LinkedIn, Facebook, Telegram, Instagram, Discord */}
          <div className="d-flex align-items-center socials-row">
            <a href="#" aria-label="LinkedIn" className="me-1 social-link">
              <img src="/Socials/linkedin.svg" alt="LinkedIn" className="social-icon" width={50} height={50} />
            </a>
            <a href="#" aria-label="Facebook" className="me-1 social-link">
              <img src="/Socials/facebook.svg" alt="Facebook" className="social-icon" width={40} height={40} />
            </a>
            <a href="#" aria-label="Telegram" className="me-1 social-link">
              <img src="/Socials/telegram.svg" alt="Telegram" className="social-icon" width={40} height={40} />
            </a>
            <a href="#" aria-label="Instagram" className="me-1 social-link">
              <img src="/Socials/instagram.svg" alt="Instagram" className="social-icon" width={40} height={40} />
            </a>
            <a href="#" aria-label="Discord" className="social-link">
              <img src="/Socials/discord.svg" alt="Discord" className="social-icon" width={40} height={40} />
            </a>
          </div>

          {/* Static newsletter UI */}
          <div className="newsletter-container mt-4 mt-lg-0">
            <div className="newsletter-input-wrapper aeonik-regular">
              <input
                type="email"
                aria-label="Email"
                className="newsletter-input-box aeonik-regular green-text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                placeholder=""
              />
              {(!isEmailFocused && email.length === 0) && (
                <div className="newsletter-placeholder-overlay aeonik-regular">
                  <ScrambleText
                    trigger="visible"
                    scrambleColor="#fff"
                    speed="slow"
                    revealSpeed={0.3}
                    matchWidth
                  >
                    CONNECT TO OUR NEWSLETTER..
                  </ScrambleText>
                </div>
              )}
            </div>
            <ScrambleText
              trigger="hover"
              scrambleColor="#000"
              speed="slow"
              revealSpeed={0.3}
              matchWidth
              className="newsletter-subscribe aeonik-regular"
              style={{ color: '#000' }}
            >
              CONNECT
            </ScrambleText>
          </div>
        </div>






      <div className="footer-bottom d-flex flex-wrap justify-content-between align-items-center aeonik-regular"
      style={{paddingRight:'110px',paddingLeft:'110px'}
      }>
          <div className="green-text">© Auxin Media 2025</div>
          <div className="green-text">Auxinmedia@gmail.com</div>
          <div className="green-text">Connect with Team</div>
        </div>

      {/* Large AUXINMEDIA text - Flush with bottom */}
      <div 
        ref={textRef}
        className="auxin-text aeonik-regular mb-3" 
        style={{
          height: 'auto',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          width: '100%',
          minWidth: 0
        }}
      >
        <span 
          className="aeonik-regular mt-5 footer-text"
          style={{
            letterSpacing: '-0.07em',
            whiteSpace: 'nowrap',
            transform: 'scale(1)',
            transformOrigin: 'center',
            minWidth: 'max-content'
          }}
        >
          <Link
            to="/"
            aria-label="Go to home"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();
                if (location.hash) {
                  window.history.replaceState(null, "", "/");
                  setTimeout(() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }, 0);
                } else {
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                }
              }
            }}
            style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}
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
          </Link>
        </span>
    </div>
    </footer>
  );
};

export default Footer;