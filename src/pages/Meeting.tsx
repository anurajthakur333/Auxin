import { useEffect, useRef } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShinyText from "../components/ShinyText";
import "../styles/fonts.css";
import "../styles/Main.css";
import Lenis from "lenis";

const Meeting = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh", 
      background: "#000",
      position: "relative",
      zIndex: 1
    }}>
      <Navbar />
      
      <div style={{ flex: 1, }}>
        <div className="container-fluid">
          <h1
            className="aeonik-regular text-white"
            style={{
              fontSize: "clamp(32px, 15vw, 770px)",
              lineHeight: "0.9",
              letterSpacing: "-8px",
              fontWeight: 400,
              textAlign: "left",
              marginBottom: "500px",
            }}
          >
            MEETING
          </h1>
        </div>
        
        {/* Bottom section with ShinyText */}
        <div className="row" style={{ marginTop: 'auto', paddingBottom: '0px' ,marginBottom: '150px'}}>
          <div className="col-12">
            <div style={{ marginLeft: '10px' }}>
              <ShinyText 
                text="Turn organized time into lasting success." 
                disabled={false} 
                speed={3} 
                className="aeonik-regular meeting-subtitle"
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Meeting;
