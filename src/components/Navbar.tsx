import "../styles/fonts.css";
import "../styles/Navbar.css";


const Navbar = () => {

  return (
  <nav className="navbar navbar-expand-lg fixed-bottom" style={{ height: '36px' }}>
      <div className="container">
          <div className="navbar-nav mx-auto align-items-center gap-5">
            <a className="nav-link text-white aeonik-light" href="#experience">Experience</a>
            <a className="nav-link text-white aeonik-light" href="#articles">Articles</a>
            <div className="mx-4">
              <img src="/auxin.svg" alt="Auxin Logo" width="72" height="36" />
            </div>
            <a className="nav-link text-white aeonik-light" href="#about">About Us</a>
            <a className="nav-link text-white aeonik-light" href="#appointments">Appointments</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 