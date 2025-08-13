import { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import ScrambleText from "../components/Scramble";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";
import Squares from "../components/Squares";
import Particles from "../components/Particles";
import "../styles/fonts.css";
import "../styles/Main.css";
import Lenis from "lenis";
import { useState } from "react";

const Home = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,      // approximate duration in seconds
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // custom ease-out expo
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

    // Smooth anchor navigation
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const element = document.querySelector(href);
      if (!element) return;

      e.preventDefault();
      lenis.scrollTo(element as HTMLElement, {
        offset: -60,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  return (
    <>
      {showPreloader && (
        <Preloader 
          onComplete={handlePreloaderComplete}
          duration={2000}
          delay={500}
        />
      )}
      
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        background: "#000",
        position: "relative",
        zIndex: 1
      }}>
        <Navbar />

        {/* Main content wrapper, flex: 1 to fill space */}
        <div style={{ flex: 1 }}>
    {/* Section - 1 */}
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", position: "relative" }}>
          {/* Squares Background - positioned to capture mouse events */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 3 }}>
            <Squares 
              speed={0.3} 
              squareSize={100}
              direction='up'
              borderColor='rgba(255, 255, 255, 0.19)'
              hoverFillColor='rgba(255, 255, 255, 0.1)'
              hoverPattern='plus'
            />
          </div>
          
          {/* Particles Background */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5 }}>
            <Particles 
              density="low"
              speed="slow"
              size="uniform-small"
              color="rgb(255, 255, 255)"
              glow={false}
              fadeInDuration={8000}
              particleLifetime={5000}
            />
          </div>
          
          {/* CSS Vignette Overlay - Ellipse Wide */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "radial-gradient(ellipse 100% 58% at center, transparent 20%, rgba(0, 0, 0, 0.8) 100%)",
              pointerEvents: "none",
              zIndex: 4
            }}
          />
          
          {/* Text Content */}
          <div className="text-center px-4" style={{ position: "relative", zIndex: 3, pointerEvents: "none" }}>
            <div
              className="aeonik-regular text-white"
              style={{
                fontSize: "clamp(32px, 6vw, 77px)",
                letterSpacing: "-4px",
                lineHeight: "70px",
                fontWeight: 400,
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <ScrambleText
                trigger="load"
                  speed="fast"
              direction="left-to-right"
              matchWidth={true}
              revealSpeed={0.3}
                scrambleIntensity={1}
                delay={50}
                style={{ color: "white" }}
              >
                REDEFINING BUSINESS
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                direction="left-to-right"
                matchWidth={true}
                revealSpeed={0.3}
                scrambleIntensity={1}
                delay={100}
                style={{ color: "white" }}
              >
                WITH THE INTELLIGENCE
              </ScrambleText>
              <br />
              <ScrambleText
                      trigger="load"
               speed="fast"
                direction="left-to-right"
               matchWidth={true}
               revealSpeed={0.3}
                scrambleIntensity={1}
                delay={300}
                style={{ color: "white" }}
              >
                YOU CAN TRUST.
              </ScrambleText>
            </div>
          </div>
        </div>

       {/* Section - 2 */}
        <div className="d-flex align-items-start" style={{ minHeight: "100vh", padding: "25px 0 80px 25px", position: "relative" }}>
       
          <div className="" style={{ position: "relative", zIndex: 1 }}>
            <div
              className="aeonik-regular text-white"
              style={{
                fontSize: "clamp(28px, 5vw, 65px)",
                letterSpacing: "-3px",
                lineHeight: "1.1",
                fontWeight: 400,
                maxWidth: "1000px",
                textAlign: "left",
              }}
            >
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                scrambleIntensity={1}
                delay={0}
                style={{ color: "white" }}
              >
                "YES, WE CREATE WEBSITES LIKE
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                scrambleIntensity={1}
                matchWidth={true}
                delay={400}
                style={{ color: "white" }}
              >
                OTHERS — BUT WHAT SETS US
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                scrambleIntensity={1}
                matchWidth={true}
                delay={800}
                style={{ color: "white" }}
              >
                APART IS THE EXTRAORDINARY
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                scrambleIntensity={1}
                matchWidth={true}
                delay={1200}
                style={{ color: "white" }}
              >
                BLEND OF INNOVATION, STRATEGY,
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                scrambleIntensity={1}
                matchWidth={true}
                delay={1600}
                style={{ color: "white" }}
              >
                AND DESIGN THAT TURNS YOUR
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                scrambleIntensity={1}
                matchWidth={true}
                delay={2000}
                style={{ color: "white" }}
              >
                VISION INTO AN UNFORGETTABLE
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                scrambleIntensity={1}
                matchWidth={true}
                delay={2400}
                style={{ color: "white" }}
              >
                DIGITAL EXPERIENCE."
              </ScrambleText>
            </div>
          </div>
        </div>

     {/* Section - 3  */}
        <div className="d-flex align-items-start justify-content-end" style={{ minHeight: "100vh", padding: "25px 25px 80px 0" }}>
          <div className="">
            <div
              className="aeonik-regular text-white"
              style={{
                fontSize: "clamp(28px, 5vw, 65px)",
                letterSpacing: "-3px",
                lineHeight: "1.1",
                fontWeight: 400,
                maxWidth: "1000px",
                textAlign: "right",
              }}
            >
              <ScrambleText
                trigger="load"
                speed="fast"
                  revealSpeed={0.3}
                direction="right-to-left"
                scrambleIntensity={1}
                matchWidth={true}
                delay={0}
                style={{ color: "white" }}
              >
                REACH YOUR AUDIENCE
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                  revealSpeed={0.3}
                direction="right-to-left"
                scrambleIntensity={1}
                matchWidth={true}
                delay={400}
                style={{ color: "white" }}
              >
                SMARTER AND FASTER WITH
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                direction="right-to-left"
                        scrambleIntensity={1}
                matchWidth={true}
                delay={800}
                style={{ color: "white" }}
              >
                OUR AI-POWERED
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                direction="right-to-left"
                scrambleIntensity={1}
                matchWidth={true}
                delay={1200}
                style={{ color: "white" }}
              >
                AD SOLUTIONS.
              </ScrambleText>
            </div>
          </div>
        </div>

       {/* Section - 4  */}
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", padding: "80px 0" }}>
          <div className="text-center px-4">
            <div
              className="aeonik-regular text-white"
              style={{
                fontSize: "clamp(32px, 6vw, 77px)",
                letterSpacing: "-4px",
                lineHeight: "70px",
                fontWeight: 400,
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <ScrambleText
                  trigger="load"
                speed="fast"
                revealSpeed={0.3}
                scrambleIntensity={1}
                matchWidth={true}
                delay={0}
                style={{ color: "white" }}
              >
                AREAS WHERE WE FOCUS
              </ScrambleText>
            </div>
          </div>
        </div>

      {/* Snapscroll - 1 */}
        <div style={{ minHeight: "100vh", padding: "25px 25px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Title */}
          <div className="d-flex align-items-start">
            <div className="">
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(28px, 5vw, 65px)",
                  letterSpacing: "-3px",
                  lineHeight: "0.9",
                  fontWeight: 400,
                  maxWidth: "800px",
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  matchWidth={true}
                                delay={0}
                  style={{ color: "white" }}
                >
                  BRAND IDENTITY &
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  matchWidth={true}
                  delay={400}
                  style={{ color: "white" }}
                >
                  CREATIVE DIRECTION
                </ScrambleText>
              </div>
            </div>
          </div>

          {/* Bottom content with left and right text */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "60px", paddingBottom: "45px"}}>
            {/* Left description */}
            <div style={{ maxWidth: "500px", flex: "1" }}>
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(24.9px, 2.2vw, 22px)",
                  letterSpacing: "-0.5px",
                  lineHeight: "30px",
                  fontWeight: 300,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  matchWidth={true}
                  delay={800}
                  style={{ color: "white" }}
                >
                  We Sculpt Visual DNA That Embeds Itself In
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  matchWidth={true}
                  delay={1000}
                  style={{ color: "white" }}
                >
                  The Cultural Psyche. Not Logos - Legacy
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                      revealSpeed={0.1}
                  scrambleIntensity={1}
                  matchWidth={true}
                  delay={1200}
                  style={{ color: "white" }}
                >
                  Systems. Not Messaging - Magnetic
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  matchWidth={true}
                  delay={1400}
                  style={{ color: "white" }}
                >
                  Resonance.
                </ScrambleText>
              </div>
            </div>

            {/* Right green text */}
            <div style={{ maxWidth: "500px", flex: "1", textAlign: "right", }}>
              <div
                className="aeonik-regular"
                style={{
                  fontSize: "clamp(47.59px, 3vw, 32px)",
                  letterSpacing: "-1px",
                  lineHeight: "50px",
                  fontWeight: 400,
                  textAlign: "right",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  matchWidth={true}
                  direction="right-to-left"
                  delay={1200}
                  style={{ color: "#00ff00" }}
                >
                  Where First
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  matchWidth={true}
                  direction="right-to-left"
                  delay={1400}
                  style={{ color: "#00ff00" }}
                >
                  Impressions Become
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                        scrambleIntensity={1}
                  matchWidth={true}
                  direction="right-to-left"
                  delay={1600}
                  style={{ color: "#00ff00" }}
                >
                  Lasting Legacies
                </ScrambleText>
              </div>
            </div>
          </div>
        </div>

      {/* Snapscroll - 2 */}
        <div style={{ minHeight: "100vh", padding: "25px 25px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Title */}
          <div className="d-flex align-items-start">
            <div className="">
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(28px, 5vw, 65px)",
                  letterSpacing: "-3px",
                  lineHeight: "0.9",
                  fontWeight: 400,
                  maxWidth: "800px",
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  matchWidth={true}
                  delay={0}
                  style={{ color: "white" }}
                >
                  PERFORMANCE
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  matchWidth={true}
                  delay={400}
                  style={{ color: "white" }}
                >
                  MARKETING & MEDIA
                </ScrambleText>
                <br />
                <ScrambleText
                      trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  matchWidth={true}
                  delay={800}
                  style={{ color: "white" }}
                >
                  BUYING
                </ScrambleText>
              </div>
            </div>
          </div>

          {/* Bottom content with left and right text */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "60px", paddingBottom: "40px"}}>
            {/* Left description */}
            <div style={{ maxWidth: "500px", flex: "1" }}>
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(24.9px, 2.2vw, 22px)",
                  letterSpacing: "-0.5px",
                  lineHeight: "30px",
                  fontWeight: 300,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={1200}
                  style={{ color: "white" }}
                >
                  We Treat Ad Campaigns As Blockbuster
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={1400}
                  style={{ color: "white" }}
                >
                  Narratives—Each Funnel Act Engineered For
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={1600}
                  style={{ color: "white" }}
                >
                  Suspense, Revelation, And Standing Ovations.
                </ScrambleText>
              </div>
            </div>

            {/* Right green text */}
            <div style={{ maxWidth: "700px", flex: "1", textAlign: "right" }}>
              <div
                className="aeonik-regular"
                style={{
                  fontSize: "clamp(47.59px, 3vw, 32px)",
                  letterSpacing: "-1px",
                  lineHeight: "50px",
                  fontWeight: 400,
                  textAlign: "right",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  direction="right-to-left"
                  scrambleIntensity={1}
                  delay={1800}
                  style={{ color: "#00ff00" }}
                >
                  Every Click Is A Plot Twist
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                    speed="fast"
                  revealSpeed={0.1}
                  direction="right-to-left"
                  scrambleIntensity={1}
                  matchWidth={true}
                  delay={2000}
                  style={{ color: "#00ff00" }}
                >
                  Every Scroll, A Strategic Climax
                </ScrambleText>
              </div>
            </div>
          </div>
        </div>

       {/* Snapscroll - 3 */}
        <div style={{ minHeight: "100vh", padding: "25px 25px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Title */}
          <div className="d-flex align-items-start">
            <div className="">
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(28px, 5vw, 65px)",
                  letterSpacing: "-3px",
                  lineHeight: "0.9",
                  fontWeight: 400,
                  maxWidth: "800px",
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  delay={0}
                  style={{ color: "white" }}
                >
                  DIGITAL STRATEGY &
                </ScrambleText>
                <br />
                <ScrambleText
                      trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  delay={400}
                  style={{ color: "white" }}
                >
                  SEO
                </ScrambleText>
              </div>
            </div>
          </div>

          {/* Bottom content with left and right text */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "60px", paddingBottom: "40px"}}>
            {/* Left description */}
            <div style={{ maxWidth: "500px", flex: "1" }}>
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(24.9px, 2.2vw, 22px)",
                  letterSpacing: "-0.5px",
                  lineHeight: "30px",
                  fontWeight: 300,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                        trigger="load"
                    speed="fast"
                  revealSpeed={0.1}
                        scrambleIntensity={1}
                  delay={800}
                  style={{ color: "white" }}
                >
                  Consumer Paths Aren't Linear—They're
                </ScrambleText>
                <br />
                <ScrambleText
                      trigger="load"
                    speed="fast"
                      revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={1000}
                  style={{ color: "white" }}
                >
                  Three-Act Structures. We Blueprint SEO And
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  delay={1200}
                  style={{ color: "white" }}
                >
                  Strategy Like Screenplays.
                </ScrambleText>
              </div>
            </div>

            {/* Right green text */}
            <div style={{ maxWidth: "500px", flex: "1", textAlign: "right" }}>
              <div
                className="aeonik-regular"
                style={{
                  fontSize: "clamp(47.59px, 3vw, 32px)",
                  letterSpacing: "-1px",
                  lineHeight: "50px",
                  fontWeight: 400,
                  textAlign: "right",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                    revealSpeed={0.1}
                  direction="right-to-left"
                  scrambleIntensity={1}
                  delay={1200}
                  style={{ color: "#00ff00" }}
                >
                  Architecting Journeys
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  direction="right-to-left"
                  scrambleIntensity={1}
                  delay={1400}
                  style={{ color: "#00ff00" }}
                >
                  In The Algorithmic
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  direction="right-to-left"
                  scrambleIntensity={1}
                  delay={1600}
                  style={{ color: "#00ff00" }}
                >
                  Wilderness
                </ScrambleText>
              </div>
            </div>
          </div>
        </div>

     {/* Snapscroll - 4 */}
        <div style={{ minHeight: "100vh", padding: "25px 25px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Title */}
          <div className="d-flex align-items-start">
            <div className="">
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(28px, 5vw, 65px)",
                  letterSpacing: "-3px",
                  lineHeight: "0.9",
                  fontWeight: 400,
                  maxWidth: "800px",
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}

                  scrambleIntensity={1}
                  delay={0}
                  style={{ color: "white" }}
                >
                  ANALYTICS &
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  delay={400}
                  style={{ color: "white" }}
                >
                  OPTIMIZATION
                </ScrambleText>
              </div>
            </div>
          </div>

          {/* Bottom content with left and right text */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "60px", paddingBottom: "40px"}}>
            {/* Left description */}
            <div style={{ maxWidth: "500px", flex: "1" }}>
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(24.9px, 2.2vw, 22px)",
                  letterSpacing: "-0.5px",
                  lineHeight: "30px",
                  fontWeight: 300,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={800}
                  style={{ color: "white" }}
                >
                  Heatmaps Become Mood Rings. Funnels
                </ScrambleText>
                <br />
                <ScrambleText
                      trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={1000}
                  style={{ color: "white" }}
                >
                  Transform Into Suspense Graphs. We Turn
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                    revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={1200}
                  style={{ color: "white" }}
                >
                  Analytics Into Directorial Notes.
                </ScrambleText>
              </div>
            </div>

            {/* Right green text */}
            <div style={{ maxWidth: "500px", flex: "1", textAlign: "right" }}>
              <div
                className="aeonik-regular"
                style={{
                  fontSize: "clamp(47.59px, 3vw, 32px)",
                  letterSpacing: "-1px",
                  lineHeight: "50px",
                  fontWeight: 400,
                  textAlign: "right",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  direction="right-to-left"
                  scrambleIntensity={1} 
                  delay={1200}
                  style={{ color: "#00ff00" }}
                >
                  Where Numbers Direct
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  direction="right-to-left"
                  scrambleIntensity={1}
                  delay={1400}
                  style={{ color: "#00ff00" }}
                >
                  The Next Scene
                </ScrambleText>
              </div>
            </div>
          </div>
        </div>

      {/* Snapscroll - 5 */}
        <div style={{ minHeight: "100vh", padding: "25px 25px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Title */}
          <div className="d-flex align-items-start">
            <div className="">
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(28px, 5vw, 65px)",
                  letterSpacing: "-3px",
                  lineHeight: "0.9",
                  fontWeight: 400,
                  maxWidth: "800px",
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  direction="left-to-right"
                  scrambleIntensity={1} 
                  delay={0}
                  style={{ color: "white" }}
                >
                  IMMERSIVE 3D
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                    speed="fast"
                      revealSpeed={0.3}
                  direction="left-to-right"
                  scrambleIntensity={1}
                  delay={400}
                  style={{ color: "white" }}
                >
                  WEBSITES: STEP INSIDE
                </ScrambleText>
                <br />
                <ScrambleText
                      trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  direction="left-to-right"
                  scrambleIntensity={1}
                  delay={800}
                  style={{ color: "white" }}
                >
                  YOUR BRAND
                </ScrambleText>
              </div>
            </div>
          </div>

          {/* Bottom content with left and right text */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "60px", paddingBottom: "40px"}}>
            {/* Left description */}
            <div style={{ maxWidth: "500px", flex: "1" }}>
              <div
                className="aeonik-regular text-white"
                style={{
                  fontSize: "clamp(24.9px, 2.2vw, 22px)",
                  letterSpacing: "-0.5px",
                  lineHeight: "30px",
                  fontWeight: 300,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={1200}
                  style={{ color: "white" }}
                >
                  Whether You Need An Immersive 3D Journey
                </ScrambleText>
                <br />
                <ScrambleText
                      trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                      scrambleIntensity={1}
                  delay={1400}
                  style={{ color: "white" }}
                >
                  Or A Conversion-Focused Rocket Ship, Our
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.3}
                  scrambleIntensity={1}
                  delay={1600}
                  style={{ color: "white" }}
                >
                  Team Architects Digital Experiences That
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={1800}
                  style={{ color: "white" }}
                >
                  Audiences Remember And Algorithms
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={2000}
                  style={{ color: "white" }}
                >
                  Reward. Let's Build Your Industry's Next
                </ScrambleText>
                <br />
                <ScrambleText
                    trigger="load"
                  speed="fast"
                    revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={2200}
                  style={{ color: "white" }}
                >
                  Benchmark.
                </ScrambleText>
              </div>
            </div>

            {/* Right green text */}
            <div style={{ maxWidth: "500px", flex: "1", textAlign: "right" }}>
              <div
                className="aeonik-regular"
                style={{
                  fontSize: "clamp(47.59px, 3vw, 32px)",
                  letterSpacing: "-1px",
                  lineHeight: "50px",
                  fontWeight: 400,
                  textAlign: "right",
                }}
              >
                <ScrambleText
                  trigger="load"
                  speed="fast"
                  revealSpeed={0.1}
                  scrambleIntensity={1}
                  delay={200}
                  style={{ color: "#00ff00" }}
                >
                  Immersive 3D Websites
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="load"
                  speed="fast"
                        revealSpeed={0.1}
                      scrambleIntensity={1}
                  delay={200}
                  style={{ color: "#00ff00" }}
                >
                  Step Inside Your Brand
                </ScrambleText>
              </div>
            </div>
          </div>
        </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Home;