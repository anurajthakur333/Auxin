import Navbar from './components/Navbar'
import "./styles/fonts.css";
import "./styles/Main.css";
import ScrambleText from "./components/ScrambleText";
import { motion } from "framer-motion";
function App() {
  return (

    
    <div className="bg-black min-vh-100">
      <Navbar />



      <div className="container-fluid">
  <div className="d-flex justify-content-between align-items-start">
    
    {/* Logo with fade-in from left */}
    <motion.img
      src="auxin.svg"
      alt="Auxin Logo"
      width="85"
      height="35"
      className="mt-3"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />

    {/* ScrambleText with fade-in from right */}
    <div>
  <div className="text-white p-6 rounded-lg  text-end">
    <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <ScrambleText
    trigger="click"
    scrambleColor="#FFFFFF"
    waveEffect={true}
    className="text-2xl cursor-pointer"
    style={{
      fontSize: "78.45px",
      letterSpacing: "-3px",
      lineHeight: "70px",
      fontWeight: 300,
    }}
  >
     Adapting your business <br /> with AI <span className="green-text">power</span> - Like <br />never before
  </ScrambleText>
</motion.div>
  </div>
</div>
    
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