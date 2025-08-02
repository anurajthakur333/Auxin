import { useEffect, useRef } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/fonts.css";
import "../styles/Main.css";
import Lenis from "lenis";

const Privacy = () => {
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
              fontSize: "clamp(32px, 8vw, 770px)",
              letterSpacing: "-9px",
              lineHeight: "1.1",
              fontWeight: 400,
              textAlign: "left",
              marginBottom: "500px"
            }}
          >
            PRIVACY <br />POLICY
          </h1>
          
          <div 
            className="aeonik-regular text-white"
            style={{
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: "1.6",
              maxWidth: "800px",
              textAlign: "left"
            }}
          >
            <p>Last updated: January 2025</p>
            
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", marginTop: "40px", marginBottom: "20px" }}>
              Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when you contact us through our website, 
              subscribe to our newsletter, or engage with our services.
            </p>
            
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", marginTop: "40px", marginBottom: "20px" }}>
              How We Use Your Information
            </h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, 
              communicate with you, and comply with legal obligations.
            </p>
            
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", marginTop: "40px", marginBottom: "20px" }}>
              Information Sharing
            </h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy.
            </p>
            
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", marginTop: "40px", marginBottom: "20px" }}>
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at 
              Auxinmedia@gmail.com
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;