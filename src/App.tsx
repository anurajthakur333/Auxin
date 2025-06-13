// src/App.tsx

import Navbar from "./components/Navbar";
import ScrambleText from "./components/Scramble";
import Footer from "./components/Footer";
import "./styles/fonts.css";
import "./styles/Main.css";

export default function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#000" }}>
      <Navbar />

      {/* Main content wrapper, flex: 1 to fill space */}
      <div style={{ flex: 1 }}>
        {/* Fullscreen centered container */}
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
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
                trigger="visible"
                speed="fast"
                revealSpeed={0.7}
                scrambleIntensity={8}
                delay={0}
                style={{ color: "white" }}
              >
                REDEFINING BUSINESS
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed="medium"
                revealSpeed={0.5}
                scrambleIntensity={6}
                delay={800}
                style={{ color: "white" }}
              >
                WITH THE INTELLIGENCE
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed={2}  // Custom speed: 2x faster than default
                revealSpeed={0.8}
                scrambleIntensity={10}
                delay={1200}
                style={{ color: "white" }}
              >
                YOU CAN TRUST.
              </ScrambleText>
            </div>
          </div>
        </div>

        {/* Second section with scroll-triggered text */}
        <div className="d-flex align-items-start" style={{ minHeight: "100vh", padding: "25px 0 80px 25px" }}>
          <div className="">
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
                trigger="visible"
                speed="medium"
                revealSpeed={0.6}
                scrambleIntensity={7}
                delay={0}
                style={{ color: "white" }}
              >
                "YES, WE CREATE WEBSITES LIKE
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed="fast"
                revealSpeed={0.7}
                scrambleIntensity={6}
                delay={400}
                style={{ color: "white" }}
              >
                OTHERS — BUT WHAT SETS US
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed="medium"
                revealSpeed={0.5}
                scrambleIntensity={8}
                delay={800}
                style={{ color: "white" }}
              >
                APART IS THE EXTRAORDINARY
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed="fast"
                revealSpeed={0.8}
                scrambleIntensity={7}
                delay={1200}
                style={{ color: "white" }}
              >
                BLEND OF INNOVATION, STRATEGY,
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed="medium"
                revealSpeed={0.6}
                scrambleIntensity={9}
                delay={1600}
                style={{ color: "white" }}
              >
                AND DESIGN THAT TURNS YOUR
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed="fast"
                revealSpeed={0.7}
                scrambleIntensity={8}
                delay={2000}
                style={{ color: "white" }}
              >
                VISION INTO AN UNFORGETTABLE
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed={2}
                revealSpeed={0.9}
                scrambleIntensity={10}
                delay={2400}
                style={{ color: "white" }}
              >
                DIGITAL EXPERIENCE."
              </ScrambleText>
            </div>
          </div>
        </div>

        {/* Third section with AI-powered ad solutions text */}
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
                trigger="visible"
                speed="fast"
                revealSpeed={0.7}
                scrambleIntensity={8}
                delay={0}
                style={{ color: "white" }}
              >
                REACH YOUR AUDIENCE
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed="medium"
                revealSpeed={0.6}
                scrambleIntensity={7}
                delay={400}
                style={{ color: "white" }}
              >
                SMARTER AND FASTER WITH
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed="fast"
                revealSpeed={0.8}
                scrambleIntensity={9}
                delay={800}
                style={{ color: "white" }}
              >
                OUR AI-POWERED
              </ScrambleText>
              <br />
              <ScrambleText
                trigger="visible"
                speed={2}
                revealSpeed={0.9}
                scrambleIntensity={10}
                delay={1200}
                style={{ color: "white" }}
              >
                AD SOLUTIONS.
              </ScrambleText>
            </div>
          </div>
        </div>

        {/* Fourth section with Areas Where We Focus text */}
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
                trigger="visible"
                speed="fast"
                revealSpeed={0.8}
                scrambleIntensity={9}
                delay={0}
                style={{ color: "white" }}
              >
                AREAS WHERE WE FOCUS
              </ScrambleText>
            </div>
          </div>
        </div>

        {/* Fifth section with Brand Identity & Creative Direction */}
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.7}
                  scrambleIntensity={8}
                  delay={0}
                  style={{ color: "white" }}
                >
                  BRAND IDENTITY &
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={7}
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
                  lineHeight: "35px",
                  fontWeight: 400,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={800}
                  style={{ color: "white" }}
                >
                  We Sculpt Visual DNA That Embeds Itself In
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1000}
                  style={{ color: "white" }}
                >
                  The Cultural Psyche. Not Logos - Legacy
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1200}
                  style={{ color: "white" }}
                >
                  Systems. Not Messaging - Magnetic
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1200}
                  style={{ color: "#00ff00" }}
                >
                  Where First
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1400}
                  style={{ color: "#00ff00" }}
                >
                  Impressions Become
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1600}
                  style={{ color: "#00ff00" }}
                >
                  Lasting Legacies
                </ScrambleText>
              </div>
            </div>
          </div>
        </div>

        {/* Sixth section with Performance Marketing & Media Buying */}
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.7}
                  scrambleIntensity={8}
                  delay={0}
                  style={{ color: "white" }}
                >
                  PERFORMANCE
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={7}
                  delay={400}
                  style={{ color: "white" }}
                >
                  MARKETING & MEDIA
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.7}
                  scrambleIntensity={8}
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
                  lineHeight: "35px",
                  fontWeight: 400,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1200}
                  style={{ color: "white" }}
                >
                  We Treat Ad Campaigns As Blockbuster
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1400}
                  style={{ color: "white" }}
                >
                  Narratives—Each Funnel Act Engineered For
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1600}
                  style={{ color: "white" }}
                >
                  Suspense, Revelation, And Standing Ovations.
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1800}
                  style={{ color: "#00ff00" }}
                >
                  Every Click Is A Plot Twist.
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={2000}
                  style={{ color: "#00ff00" }}
                >
                  Every Scroll, A Strategic
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={2200}
                  style={{ color: "#00ff00" }}
                >
                  Climax
                </ScrambleText>
              </div>
            </div>
          </div>
        </div>

        {/* Seventh section with Digital Strategy & SEO */}
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.7}
                  scrambleIntensity={8}
                  delay={0}
                  style={{ color: "white" }}
                >
                  DIGITAL STRATEGY &
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={7}
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
                  lineHeight: "35px",
                  fontWeight: 400,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={800}
                  style={{ color: "white" }}
                >
                  Consumer Paths Aren't Linear—They're
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1000}
                  style={{ color: "white" }}
                >
                  Three-Act Structures. We Blueprint SEO And
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1200}
                  style={{ color: "#00ff00" }}
                >
                  Architecting Journeys
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1400}
                  style={{ color: "#00ff00" }}
                >
                  In The Algorithmic
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1600}
                  style={{ color: "#00ff00" }}
                >
                  Wilderness
                </ScrambleText>
              </div>
            </div>
          </div>
        </div>

        {/* Eighth section with Analytics & Optimization */}
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.7}
                  scrambleIntensity={8}
                  delay={0}
                  style={{ color: "white" }}
                >
                  ANALYTICS &
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={7}
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
                  lineHeight: "35px",
                  fontWeight: 400,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={800}
                  style={{ color: "white" }}
                >
                  Heatmaps Become Mood Rings. Funnels
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1000}
                  style={{ color: "white" }}
                >
                  Transform Into Suspense Graphs. We Turn
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1200}
                  style={{ color: "#00ff00" }}
                >
                  Where Numbers Direct
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1400}
                  style={{ color: "#00ff00" }}
                >
                  The Next Scene
                </ScrambleText>
              </div>
            </div>
          </div>
        </div>

        {/* Ninth section with Immersive 3D Websites */}
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.7}
                  scrambleIntensity={8}
                  delay={0}
                  style={{ color: "white" }}
                >
                  IMMERSIVE 3D
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={7}
                  delay={400}
                  style={{ color: "white" }}
                >
                  WEBSITES: STEP INSIDE
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.7}
                  scrambleIntensity={8}
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
                  lineHeight: "35px",
                  fontWeight: 400,
                  textAlign: "left",
                }}
              >
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1200}
                  style={{ color: "white" }}
                >
                  Whether You Need An Immersive 3D Journey
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1400}
                  style={{ color: "white" }}
                >
                  Or A Conversion-Focused Rocket Ship, Our
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1600}
                  style={{ color: "white" }}
                >
                  Team Architects Digital Experiences That
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={1800}
                  style={{ color: "white" }}
                >
                  Audiences Remember And Algorithms
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
                  delay={2000}
                  style={{ color: "white" }}
                >
                  Reward. Let's Build Your Industry's Next
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="medium"
                  revealSpeed={0.6}
                  scrambleIntensity={5}
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
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={1800}
                  style={{ color: "#00ff00" }}
                >
                  Immersive 3D Websites
                </ScrambleText>
                <br />
                <ScrambleText
                  trigger="visible"
                  speed="fast"
                  revealSpeed={0.8}
                  scrambleIntensity={7}
                  delay={2000}
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
  );
}
 