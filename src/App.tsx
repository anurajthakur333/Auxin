import Navbar from './components/Navbar'
import "./styles/fonts.css";
import "./styles/Main.css";
import ScrambleText from "./components/ScrambleText";

function App() {
  return (
    <div className="bg-black min-vh-100">
      <Navbar />

      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-start">
          {/* Logo */}
          <img src="auxin.svg" alt="Auxin Logo" width="85" height="35" className="mt-3"/>

          {/* Heading */}
          <ScrambleText
            {...{
              as: "h1",
              className: "text-white text-end aeonik-light me-2",
              style: {
                fontSize: "78.45px",
                letterSpacing: "-3px",
                lineHeight: "70px",
                fontWeight: 300,
              },
              text: "Adapting your business with AI power - Like never before",
              duration: 3000,
              frameInterval: 60, // 60fps for smoothness
              letters: "abcdbcdefghijklmnopqrstuvwxyz0123456789@#$%&*",
              scrambleColorClass: "green",
              easing: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2, // sine easeInOut
              trigger: "load"
            } as any}
          />
        </div>
      </div>

      <div className="position-absolute bottom-0 start-0 ms-3 aeonik-light fw-light" style={{paddingBottom:"70px",fontWeight:"300"}}>
        <p className="text-white m-0" style={{ fontSize: '48.49px', letterSpacing: '-2px', lineHeight: '50px' }}>
          Crafted with <span className="green-text">INTENT.</span><br />
          Optimized with <span className="green-text">PURPOSE.</span>
        </p>
      </div>

      <main className="container">
        <div className="row">
          <div className="col-12 text-center">
            {/* Your other content here */}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App