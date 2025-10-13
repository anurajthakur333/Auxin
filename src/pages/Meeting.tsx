import { useEffect, useRef } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShinyText from "../components/ShinyText";
import Calendar from "../components/Calendar";
import MyAppointments from "../components/MyAppointments";
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
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column" ,marginBottom:'100px'}}>
        <div className="container-fluid" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h1
            className="aeonik-regular text-white"
            style={{
              fontSize: "clamp(32px, 15vw, 770px)",
              lineHeight: "0.9",
              letterSpacing: "-15px",
              fontWeight: 600,
              textAlign: "left",
              marginTop: "12px",
              marginBottom: "400px",
            }}
          >
            MEETINGS
          </h1>
          
          <div 
            className="aeonik-regular text-white"
            style={{
              maxWidth: "900px",
              paddingLeft: "10px",
              marginTop: "auto",
              marginBottom: "60px",
            }}
          >
            <ShinyText 
              text="Turn Organized Time Into Lasting Success." 
              disabled={false} 
              speed={3} 
              className="aeonik-regular meeting-subtitle"
            />
          </div>


          {/* Calendar Component */}
          <div style={{ marginBottom: "2rem", paddingLeft: "10px" }}>
            <Calendar 
              onBookingSuccess={() => {
                // Optional: Add success handling
                console.log('Booking successful!');
              }}
            />
          </div>

          {/* My Appointments Component */}
          <div style={{ marginBottom: "4rem", paddingLeft: "10px" }}>
            <MyAppointments />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Meeting;
