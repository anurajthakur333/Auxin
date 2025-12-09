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
    <footer className="footer-wrapper text-white" style={{ overflow: 'hidden', margin: 0, padding: 0, position: 'relative' }}>
      {/* Hover effect */}
      <style>
{`
  .footer-link:hover {
    color: #00ff00 !important;
  }
  .footer-wrapper {
    margin-top:0px  !important;
    padding: 0 !important;
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  /* Background logo behind footer */
.footer-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url('/Footer-logo.svg');
  background-size: cover; /* Changed from 'contain' to 'cover' for full coverage */
  background-position: center center; /* Center the logo both horizontally and vertically */
  background-repeat: no-repeat;
  opacity: 0.18;
  filter: grayscale(100%) brightness(0.6) contrast(100%);
  /* Add responsive scaling */
  width: 100%;
  height: 100%;
}
  .footer-content {
    position: relative;
    z-index: 1;
  }
  /* Ensure footer has enough height for the background to fully fit without cropping */
  footer.footer-wrapper {
    min-height: 520px;
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
    display: block;
    background-color: #ffffff;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: contain;
    mask-size: contain;
    transition: background-color 200ms ease;
  }
  /* Inline SVG color control */
  .social-icon-svg {
    width: 40px;
    height: 40px;
    display: block;
    color: #ffffff;
    transition: color 200ms ease;
  }
  .icon-linkedin { -webkit-mask-image: url('/Socials/linkedin.svg'); mask-image: url('/Socials/linkedin.svg'); }
  .icon-facebook { -webkit-mask-image: url('/Socials/facebook.svg'); mask-image: url('/Socials/facebook.svg'); }
  .icon-telegram { -webkit-mask-image: url('/Socials/telegram.svg'); mask-image: url('/Socials/telegram.svg'); }
  .icon-instagram { -webkit-mask-image: url('/Socials/instagram.svg'); mask-image: url('/Socials/instagram.svg'); }
  .icon-discord { -webkit-mask-image: url('/Socials/discord.svg'); mask-image: url('/Socials/discord.svg'); }
  /* Hover neon green */
  .social-link:hover .social-icon {
    background-color: #39FF14;
  }
  .social-link:hover .social-icon-svg {
    color: #39FF14;
  }
  .newsletter-container {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 600px;
    margin-left: auto;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
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
      {/* Background logo (gray) */}
      <div className="footer-bg" aria-hidden="true" />
      <div className="footer-content">
<div 
  className="container-fluid" 
  style={{ paddingLeft: '110px', paddingRight: '110px', margin: '0 auto', marginBottom: '96px' ,marginTop:'110px'}}
>
  {/* Top Flex Row */}
  <div 
    ref={headersRef} 
    className="d-flex justify-content-between align-items-start flex-wrap"
    style={{ gap: "40px" }}
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
        <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between socials-row "
        style={{paddingRight:'110px',paddingLeft:'110px'}
      }>
          {/* Social icons - order: LinkedIn, Facebook, Telegram, Instagram, Discord */}
          <div className="d-flex align-items-center socials-row">
          <a href="#" aria-label="Instagram" className="me-1 social-link">
              <span className="social-icon icon-instagram" aria-hidden="true" />
            </a>
          <a href="#" aria-label="LinkedIn" className="me-1 social-link">
          <span className="social-icon icon-linkedin" aria-hidden="true" />
        </a>
        <a href="#" aria-label="Facebook" className="me-1 social-link">
          <span className="social-icon icon-facebook" aria-hidden="true" />
        </a>
        <a href="#" aria-label="Telegram" className="me-1 social-link">
          <span className="social-icon icon-telegram" aria-hidden="true" />
        </a>
       
            <a href="#" aria-label="Discord" className="social-link">
              <span className="social-icon icon-discord" aria-hidden="true" />
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
      style={{paddingRight:'110px',paddingLeft:'110px',marginTop:'96px'}
      }>
          <div className="green-text">© Auxin Media 2025</div>
          <a href="mailto:Auxinmedia@gmail.com" className="green-text" style={{ textDecoration: 'none' }}>Auxinmedia@gmail.com</a>
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
          className="aeonik-regular footer-text"
          style={{
            marginTop:'96px',
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
    </div>
    </footer>
  );
};

export default Footer;