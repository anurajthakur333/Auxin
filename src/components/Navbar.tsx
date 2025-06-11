import "../styles/fonts.css";
import "../styles/Navbar.css";
// import ScrambleText from "./Scramble";

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
  <div className="d-flex justify-content-end gap-4">
    <a href="#experience" className="nav-link text-white aeonik-light">
      EXPERIENCE
    </a>
    <a href="#articles" className="nav-link text-white aeonik-light">
      ARTICLES
    </a>
  </div>

  {/* Center logo */}
  <img src="/auxin.svg" alt="Auxin Logo" width="85" height="35" />

  {/* Right side links */}
  <div className="d-flex justify-content-start gap-4">
    <a href="#about" className="nav-link text-white aeonik-light">
      ABOUT US
    </a>
    <a href="#appointments" className="nav-link text-white aeonik-light">
      APPOINTMENTS
    </a>
  </div>
</div>

  )
}

export default Navbar 