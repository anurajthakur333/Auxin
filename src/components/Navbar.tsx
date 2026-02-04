import "../styles/fonts.css";
import "../styles/Navbar.css";
import ScrambleText from "./Scramble";
import LiquidGlass from "./LiquidGlass";
import StaggeredMenu from "./StaggeredMenu";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSound } from "../hooks/useSound";
import clickSound from "../assets/Sound/Click1.wav";

// Reusable nav link with scramble on hover in/out
const NavItem = ({ href, label, minWidth = 100, direction = "left-to-right", onClickSound, loadDelay = 0 }: { href: string; label: string; minWidth?: number; direction?: "left-to-right" | "right-to-left" | "center-out" | "random"; onClickSound?: () => void; loadDelay?: number }) => {
  const [hovered, setHovered] = useState(false);
  const [phase, setPhase] = useState<'initial' | 'loading' | 'ready'>('initial');
  const location = useLocation();

  // Handle the load animation phase
  useEffect(() => {
    // Start with initial phase, then transition to loading after delay
    const loadTimer = setTimeout(() => {
      setPhase('loading');
    }, loadDelay);

    return () => clearTimeout(loadTimer);
  }, [loadDelay]);

  // Check if it's an internal route (starts with /) or a hash link (starts with #)
  const isInternalRoute = href.startsWith('/') && !href.startsWith('#');
  const isHashLink = href.startsWith('#');
  
  const linkProps = {
    className: "nav-link text-white aeonik-mono",
    style: { textDecoration: "none" },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  };

  // Don't render until loading phase
  if (phase === 'initial') {
    return (
      <span style={{ 
        display: 'inline-block', 
        minWidth: `${minWidth}px`,
        textAlign: 'center',
        opacity: 0 
      }}>
        {label}
      </span>
    );
  }

  // Use a wrapper with transition to prevent flash when switching phases
  const scrambleText = (
    <span style={{ display: 'inline-block', transition: 'opacity 0.1s ease' }}>
      <ScrambleText
        trigger={phase === 'ready' ? "hover" : "load"}
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
        onComplete={() => {
          if (phase === 'loading') {
            // Small delay before switching to ready phase to prevent flash
            setTimeout(() => setPhase('ready'), 50);
          }
        }}
      >
        {label}
      </ScrambleText>
    </span>
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
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [navWidth, setNavWidth] = useState(1920);
  const [isMobile, setIsMobile] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
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

  // Detect mobile viewport to hide bottom navbar on small screens
  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  // Track navbar width for LiquidGlass
  useEffect(() => {
    const updateWidth = () => {
      if (navRef.current) {
        setNavWidth(navRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Base menu items (used differently on mobile vs desktop)
  const baseMenuItems = [
    { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
    { label: 'EXPERIENCE', ariaLabel: 'View experience section', link: '/#experience' },
    { label: 'ARTICLES', ariaLabel: 'View articles page', link: '/articles' },
    { label: 'ABOUT US', ariaLabel: 'Learn about us', link: '/#about' },
    { label: 'MEETINGS', ariaLabel: 'Book a meeting', link: '/meeting' },
  ];

  const authItems = user
    ? [
        ...(user.clientCode
          ? [{ label: 'DASHBOARD', ariaLabel: 'Go to dashboard', link: '/dashboard' }]
          : []),
        { label: 'PROFILE', ariaLabel: 'View profile', link: '/profile' },
        {
          label: 'LOGOUT',
          ariaLabel: 'Logout from your account',
          link: '#',
          onClick: () => {
            playClickSound();
            logout();
            navigate('/');
          },
        },
      ]
    : [{ label: 'LOGIN', ariaLabel: 'Login to your account', link: '/login' }];

  // On mobile: show all links in the menu (no bottom navbar).
  // On desktop: hide the links that already exist in the bottom navbar.
  const menuItems = isMobile
    ? [...baseMenuItems, ...authItems]
    : [
        // Only HOME plus auth-related items on desktop menu
        baseMenuItems[0],
        ...authItems,
      ];

  return (
    <>
      {/* StaggeredMenu at top (all screens) */}
      <StaggeredMenu
        position="right"
        items={menuItems}
        displaySocials={false}
        displayItemNumbering={true}
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        changeMenuColorOnOpen={true}
        colors={['#111', '#000']}
        accentColor="#39FF14"
        isFixed={true}
        closeOnClickAway={true}
        onMenuOpen={() => playClickSound()}
        onMenuClose={() => playClickSound()}
      />
      
      {/* Bottom Navbar (desktop / larger screens only) */}
      {!isMobile && (
      <div 
        ref={navRef}
        className="navbar navbar-expand-xxl fixed-bottom" 
        style={{ 
          height: '50px',
          transform: `translateY(${isVisible ? '0' : '100%'})`,
          transition: 'transform 0.3s ease-in-out',
          position: 'fixed',
          overflow: 'hidden'
        }}
      >
      {/* Liquid Glass Background */}
      <LiquidGlass
        width={navWidth}
        height={50}
        radius={0}
        border={0.1}
        lightness={50}
        alpha={0.85}
        blur={8}
        scale={-120}
        frost={0.08}
        saturation={1.2}
        chromatic={{ r: 0, g: 8, b: 16 }}
        blend="difference"
      />
      
      {/* Navbar Content */}
      <div 
        className="navbar-content"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 20px',
        }}
      >
      {/* Left side links */}
      <div className="d-flex justify-content-end" style={{ gap: '2rem' }}>
        <NavItem href="#experience" label="EXPERIENCE" minWidth={120} direction="left-to-right" onClickSound={playClickSound} loadDelay={200} />
        <NavItem href="/articles" label="ARTICLES" minWidth={100} direction="left-to-right" onClickSound={playClickSound} loadDelay={350} />
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
        <NavItem href="#about" label="ABOUT US" minWidth={100} direction="right-to-left" onClickSound={playClickSound} loadDelay={500} />
        <NavItem href="/meeting" label="MEETINGS" minWidth={120} direction="right-to-left" onClickSound={playClickSound} loadDelay={650} />
        
        {/* Spacer to push auth section to the right */}
        <div style={{ flex: 1 }}></div>
        
        {/* User Name & Menu */}
        {user && (
            <span className="aeonik-mono" style={{ color: '#39FF14', fontSize: '0.9rem' }}>
              {user.name}
            </span>
        )}
        {!user && (
          <NavItem href="/login" label="LOGIN" minWidth={80} direction="right-to-left" onClickSound={playClickSound} loadDelay={800} />
        )}
      </div>
      </div>
    </div>
    )}
    </>
  );
};

export default Navbar;
