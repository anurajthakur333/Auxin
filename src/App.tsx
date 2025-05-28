import Navbar from './components/Navbar'
import "./styles/fonts.css";
import "./styles/Main.css";

function App() {
  return (
    <div className="bg-black min-vh-100">
      <Navbar />
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-start">
          {/* Logo in left */}
          <img 
            className="mt-3" 
            src="auxin.svg" 
            alt="Auxin Logo" 
            width="85" 
            height="35"
          />

          <div>
            <div className="text-white p-6 rounded-lg text-end">
              <div>
                <div 
                  className="text-2xl cursor-pointer" 
                  style={{ 
                    fontSize: "78.45px",
                    letterSpacing: "-3px", 
                    lineHeight: "70px", 
                    fontWeight: 300 
                  }}
                >
                  Adapting your business <br /> 
                  with AI <span className="green-text">power</span> - Like <br />
                  never before
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="position-absolute bottom-0 start-0 ms-3 aeonik-light fw-light" 
          style={{paddingBottom:"70px", fontWeight:"300"}}
        >
          <p 
            className="text-white m-0" 
            style={{ 
              fontSize: '48.49px', 
              letterSpacing: '-2px', 
              lineHeight: '50px' 
            }}
          >
            Crafted with <span className="green-text">INTENT.</span><br />
            Optimized with <span className="green-text">PURPOSE.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;