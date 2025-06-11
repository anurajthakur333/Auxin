import "../styles/fonts.css";
import "../styles/Navbar.css";
// import ScrambleText from "./Scramble";

const Navbar = () => {
  return (


        <div className="d-flex align-items-center justify-content-center navbar navbar-expand-xxl fixed-bottom" style={{ height: '50px' }}>
          <a href="#experience" className="nav-link text-white aeonik-light">
            EXPERIENCE
          </a>
          <a href="#articles" className="nav-link text-white aeonik-light">
            ARTICLES
          </a>

          <img src="/auxin.svg" alt="Auxin Logo" width="85" height="35" />
              <a href="#about" className="nav-link text-white aeonik-light">
            ABOUT US
          </a>
          <a href="#appointments" className="nav-link text-white aeonik-light">
            APPOINTMENTS
          </a>
          
      </div>

  )
}

export default Navbar 