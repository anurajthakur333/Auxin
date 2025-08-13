import "../styles/fonts.css";
import "../styles/Navbar.css";
import ScrambleText from "./Scramble";
import { useEffect, useState } from "react";

// Reusable nav link with scramble on hover in/out
const NavItem = ({ href, label, minWidth = 100, direction = "left-to-right" }: { href: string; label: string; minWidth?: number; direction?: "left-to-right" | "right-to-left" | "center-out" | "random" }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      className="nav-link text-white aeonik-light"
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ScrambleText
        trigger="hover"
        speed="slow"
        direction={direction}
        randomReveal={false}
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
    </a>
  );
};

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);

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
        <NavItem href="#experience" label="EXPERIENCE" minWidth={120} direction="left-to-right" />
        <NavItem href="#articles" label="ARTICLES" minWidth={100} direction="left-to-right" />
      </div>

      {/* Center logo */}
      <img src="/auxin.svg" alt="Auxin Logo" width="85" height="35" style={{ margin: '0 2rem' }} />

      {/* Right side links */}
      <div className="d-flex justify-content-start" style={{ gap: '2rem' }}>
        <NavItem href="#about" label="ABOUT US" minWidth={100} direction="right-to-left" />
        <NavItem href="#appointments" label="MEETINGS" minWidth={120} direction="right-to-left" />
      </div>
    </div>
  );
};

export default Navbar; 