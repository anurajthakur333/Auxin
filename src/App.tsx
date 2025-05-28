import Navbar from './components/Navbar'
import ScrambleText from './components/Scramble'
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
                  className="text-2xl cursor-pointer aeonik-regular" 
                  style={{ 
                    fontSize: "78.45px",
                    letterSpacing: "-3px", 
                    lineHeight: "70px", 
                    fontWeight: 300 
                  }}
                >
                  <ScrambleText
                    trigger="load"
                    duration={1500}
                    speed={30}
                  >
                    Adapting your business
                  </ScrambleText>
                  <br /> 
                  <ScrambleText
                    trigger="load"
                    duration={1500}
                    speed={30}
                  >
                    with AI 
                  </ScrambleText>
                  <ScrambleText
                    trigger="load"
                    duration={1500}
                    speed={30}
                    scrambleColor="#39FF14"
                    className="green-text"
                  >
                     power
                  </ScrambleText>
                  <ScrambleText
                    trigger="load"
                    duration={1500}
                    speed={30}
                  >
                     - Like
                  </ScrambleText>
                  <br />
                  <ScrambleText
                    trigger="load"
                    duration={1500}
                    speed={30}
                  >
                    never before
                  </ScrambleText>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="position-absolute bottom-0 ms-3 aeonik-light fw-light" 
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
            <ScrambleText
              trigger="visible"
              duration={1200}
              speed={40}
            >
              Crafted with 
            </ScrambleText>
            <ScrambleText
              trigger="visible"
              duration={1200}
              speed={40}
              scrambleColor="#39FF14"
              className="green-text"
            >
              INTENT.
            </ScrambleText>
            <br />
            <ScrambleText
              trigger="visible"
              duration={1200}
              speed={40}
            >
              Optimized with 
            </ScrambleText>
            <ScrambleText
              trigger="visible"
              duration={1200}
              speed={40}
              scrambleColor="#39FF14"
              className="green-text"
            >
              PURPOSE.
            </ScrambleText>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;