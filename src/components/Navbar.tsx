import "../styles/fonts.css";
import "../styles/Navbar.css";
import ScrambleText from "./Scramble";

const Navbar = () => {
  return (


<div 
  className="navbar navbar-expand-xxl fixed-bottom" 
  style={{ 
    height: '50px',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    padding: '0 20px'
  }}
>
  {/* Left side links */}
  <div className="d-flex justify-content-end" style={{ gap: '2rem' }}>
    <a href="#experience" className="nav-link text-white aeonik-light" style={{ textDecoration: 'none' }}>
      <ScrambleText 
        trigger="hover" 
        scrambleColor="#39FF14" 
        speed="fast"
        waveEffect={false}
        style={{ 
          color: 'white', 
          whiteSpace: 'nowrap',
          display: 'inline-block',
          minWidth: '120px',
          textAlign: 'center'
        }}
        delay={0}
      >
        EXPERIENCE
      </ScrambleText>
    </a>
    <a href="#articles" className="nav-link text-white aeonik-light" style={{ textDecoration: 'none' }}>
      <ScrambleText 
        trigger="hover" 
        scrambleColor="#39FF14" 
        speed="fast"
        waveEffect={false}
        style={{ 
          color: 'white', 
          whiteSpace: 'nowrap',
          display: 'inline-block',
          minWidth: '100px',
          textAlign: 'center'
        }}
        delay={0}
      >
        ARTICLES
      </ScrambleText>
    </a>
  </div>

  {/* Center logo */}
  <img src="/auxin.svg" alt="Auxin Logo" width="85" height="35" style={{ margin: '0 2rem' }} />

  {/* Right side links */}
  <div className="d-flex justify-content-start" style={{ gap: '2rem' }}>
    <a href="#about" className="nav-link text-white aeonik-light" style={{ textDecoration: 'none' }}>
      <ScrambleText 
        trigger="hover" 
        scrambleColor="#39FF14" 
        speed="fast"
        waveEffect={false}
        style={{ 
          color: 'white', 
          whiteSpace: 'nowrap',
          display: 'inline-block',
          minWidth: '100px',
          textAlign: 'center'
        }}
        delay={0}
      >
        ABOUT US
      </ScrambleText>
    </a>
    <a href="#appointments" className="nav-link text-white aeonik-light" style={{ textDecoration: 'none' }}>
      <ScrambleText 
        trigger="hover" 
        scrambleColor="#39FF14" 
        speed="fast"
        waveEffect={false}
        style={{ 
          color: 'white', 
          whiteSpace: 'nowrap',
          display: 'inline-block',
          minWidth: '140px',
          textAlign: 'center'
        }}
        delay={0}
      >
        APPOINTMENTS
      </ScrambleText>
    </a>
  </div>
</div>
  )
}

export default Navbar 