import "../styles/fonts.css";
import "../styles/Navbar.css";
// import ScrambleText from "./Scramble";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg fixed-bottom" style={{ height: '50px' }}>
      <div className="container-fluid d-flex justify-content-center">
        <div className="d-flex align-items-center gap-5">
          {/* Navigation links commented out
          <a 
            className="nav-link aeonik-light px-4 fw-light navbar-item" 
            href="#experience" 
            style={{ 
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative'
            }}
          >
            <ScrambleText
              trigger="hover"
              speed="fast"
              revealSpeed={0.9}
              scrambleIntensity={5}
              delay={0}
              style={{ 
                color: "white",
                transition: "color 0.3s ease",
                display: "inline-block",
                whiteSpace: "nowrap"
              }}
              scrambleColor="#39FF14"
              glowEffect={false}
              waveEffect={false}
            >
              EXPERIENCE
            </ScrambleText>
          </a>
          <a 
            className="nav-link aeonik-light px-3 ms-4 fw-light navbar-item" 
            href="#articles" 
            style={{ 
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative'
            }}
          >
            <ScrambleText
              trigger="hover"
              speed="fast"
              revealSpeed={0.9}
              scrambleIntensity={5}
              delay={0}
              style={{ 
                color: "white",
                transition: "color 0.3s ease",
                display: "inline-block",
                whiteSpace: "nowrap",
                paddingLeft: "10px"
              }}
              scrambleColor="#39FF14"
              glowEffect={false}
              waveEffect={false}
            >
              ARTICLES
            </ScrambleText>
          </a>
          */}
          <img src="/auxin.svg" alt="Auxin Logo" width="85" height="35" />
          {/* Navigation links commented out
          <a 
            className="nav-link aeonik-light pe-4 fw-light navbar-item" 
            href="#about" 
            style={{ 
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative'
            }}
          >
            <ScrambleText
              trigger="hover"
              speed="fast"
              revealSpeed={0.9}
              scrambleIntensity={5}
              delay={0}
              style={{ 
                color: "white",
                transition: "color 0.3s ease",
                display: "inline-block",
                whiteSpace: "nowrap"
              }}
              scrambleColor="#39FF14"
              glowEffect={false}
              waveEffect={false}
            >
              ABOUT US
            </ScrambleText>
          </a>
          <a 
            className="nav-link aeonik-light px-4 fw-light navbar-item" 
            href="#appointments" 
            style={{ 
              textDecoration: 'none',
              display: 'inline-block',
              position: 'relative'
            }}
          >
            <ScrambleText
              trigger="hover"
              speed="fast"
              revealSpeed={0.9}
              scrambleIntensity={5}
              delay={0}
              style={{ 
                color: "white",
                transition: "color 0.3s ease",
                display: "inline-block",
                whiteSpace: "nowrap"
              }}
              scrambleColor="#39FF14"
              glowEffect={false}
              waveEffect={false}
            >
              APPOINTMENTS
            </ScrambleText>
          </a>
          */}
        </div>
      </div>
    </nav>
  )
}

export default Navbar 