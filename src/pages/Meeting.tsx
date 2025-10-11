import { useEffect, useRef, useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShinyText from "../components/ShinyText";
import Calendar from "../components/Calendar";
import MyAppointments from "../components/MyAppointments";
import { useAuth } from "../contexts/AuthContext";
import "../styles/fonts.css";
import "../styles/Main.css";
import Lenis from "lenis";

const Meeting = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

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

          {/* User Welcome Section */}
          {user && showWelcome && (
            <div 
              style={{
                background: "linear-gradient(135deg, #39FF14 0%, #2ecc11 100%)",
                color: "#000",
                padding: "2rem",
                borderRadius: "12px",
                marginBottom: "3rem",
                maxWidth: "900px",
                marginLeft: "10px"
              }}
            >
              <h2 
                className="aeonik-regular"
                style={{
                  fontSize: "clamp(24px, 4vw, 48px)",
                  fontWeight: 600,
                  marginBottom: "1rem"
                }}
              >
                Welcome back, {user.name}!
              </h2>
              <p 
                className="aeonik-regular"
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "1.5rem",
                  opacity: 0.8
                }}
              >
                Ready to schedule your next meeting? Choose a date and time that works best for you.
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                style={{
                  background: "#000",
                  color: "#39FF14",
                  border: "2px solid #000",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontFamily: "Aeonik, sans-serif",
                  fontWeight: 600,
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#000";
                  e.currentTarget.style.color = "#39FF14";
                }}
              >
                Let's Schedule →
              </button>
            </div>
          )}

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
