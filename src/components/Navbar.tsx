import "../styles/fonts.css";
import "../styles/Navbar.css";


const Navbar = () => {

  return (
  <nav className="navbar navbar-expand-lg fixed-bottom" style={{ height: '60px' }}>
      <div className="container-fluid justify-content-center">
          <div className="navbar-nav gap-5">
            <a className="nav-link text-white aeonik-light" href="#experience">Experience</a>
            <a className="nav-link text-white aeonik-light" href="#articles">Articles</a>
              <img src="/auxin.svg" alt="Auxin Logo" width="85" height="41.9" />
            <a className="nav-link text-white aeonik-light" href="#about">About Us</a>
            <a className="nav-link text-white aeonik-light" href="#appointments">Appointments</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 