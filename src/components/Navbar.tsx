import "../styles/fonts.css";
import "../styles/Navbar.css";
import ScrambleText from "./Scramble";
import { useAuth } from "../contexts/AuthContext";
import { useProfileMenu } from "../contexts/ProfileMenuContext";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSound } from "../hooks/useSound";
import clickSound from "../assets/Sound/Click1.wav";

// Reusable nav link with scramble on hover in/out
const NavItem = ({ href, label, minWidth = 100, direction = "left-to-right", onClickSound }: { href: string; label: string; minWidth?: number; direction?: "left-to-right" | "right-to-left" | "center-out" | "random"; onClickSound?: () => void }) => {
  const [hovered, setHovered] = useState(false);
  const location = useLocation();

  // Check if it's an internal route (starts with /) or a hash link (starts with #)
  const isInternalRoute = href.startsWith('/') && !href.startsWith('#');
  const isHashLink = href.startsWith('#');
  
  const linkProps = {
    className: "nav-link text-white aeonik-mono",
    style: { textDecoration: "none" },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  };

  const scrambleText = (
    <ScrambleText
      trigger="hover"
      speed="slow"
      direction={direction}
      randomReveal={true}
      revealSpeed={0.3}
      style={{
        color: hovered ? "#39FF14" : "white",
        whiteSpace: "nowrap",
        display: "inline-block",
        minWidth: `${minWidth}px`,
        textAlign: "center",
      }}
      delay={0}
    >
      {label}
    </ScrambleText>
  );

  if (isInternalRoute) {
    return (
      <Link to={href} {...linkProps} onClick={onClickSound}>
        {scrambleText}
      </Link>
    );
  } else if (isHashLink) {
    // For hash links, navigate to home page first if not already there
    const handleHashClick = (e: React.MouseEvent) => {
      e.preventDefault();
      onClickSound?.();
      if (location.pathname !== '/') {
        // Navigate to home first, then scroll to section
        window.location.href = `/${href}`;
      } else {
        // Already on home page, just scroll to section
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    return (
      <a href={`/${href}`} onClick={handleHashClick} {...linkProps}>
        {scrambleText}
      </a>
    );
  } else {
    return (
      <a href={href} {...linkProps} onClick={onClickSound}>
        {scrambleText}
      </a>
    );
  }
};

const Navbar = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();
  const { openProfileMenu } = useProfileMenu();
  const playClickSound = useSound(clickSound, { volume: 0.3});

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        // Hide navbar only when footer is in view (within 100px of viewport)
        setIsVisible(footerTop - windowHeight >= 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
      <div 
        className="navbar navbar-expand-xxl fixed-bottom" 
        style={{ 
          height: '50px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 20px',
          transform: `translateY(${isVisible ? '0' : '100%'})`,
          transition: 'transform 0.3s ease-in-out'
        }}
      >
      {/* Left side links */}
      <div className="d-flex justify-content-end" style={{ gap: '2rem' }}>
        <NavItem href="#experience" label="EXPERIENCE" minWidth={120} direction="left-to-right" onClickSound={playClickSound} />
        <NavItem href="#articles" label="ARTICLES" minWidth={100} direction="left-to-right" onClickSound={playClickSound} />
      </div>


      {/* Center logo */}
      <Link
        to="/"
        style={{ display: 'inline-block' }}
        aria-label="Go to home"
        onClick={(e) => {
          playClickSound();
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
      >
        <img src="/auxin.svg" alt="Auxin Logo" width="85" height="35" style={{ margin: '0 2rem' }} />
      </Link>

      {/* Right side links */}
      <div className="d-flex justify-content-start align-items-center" style={{ gap: '2rem' }}>
        <NavItem href="#about" label="ABOUT US" minWidth={100} direction="right-to-left" onClickSound={playClickSound} />
        <NavItem href="/meeting" label="MEETINGS" minWidth={120} direction="right-to-left" onClickSound={playClickSound} />
        
        {/* Spacer to push auth section to the right */}
        <div style={{ flex: 1 }}></div>
        
        {/* User Icon / Auth Section */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="aeonik-mono" style={{ color: '#39FF14', fontSize: '0.9rem' }}>
              {user.name}
            </span>
            <button
              onClick={() => { playClickSound(); openProfileMenu(); }}
              className="nav-link text-white"
              style={{ 
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: "color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#39FF14";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "white";
              }}
            >
              <img 
                src="/UserProfile.svg" 
                alt="User Profile" 
                style={{ 
                  width: "30px", 
                  height: "30px",
                  filter: "brightness(0) invert(1)" // Makes the SVG white by default
                }}
              />
            </button>
          </div>
        ) : (
          <NavItem href="/login" label="LOGIN" minWidth={80} direction="right-to-left" onClickSound={playClickSound} />
        )}
      </div>
    </div>
  );
};

export default Navbar; 