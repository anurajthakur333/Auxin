// src/App.tsx

import Navbar from "./components/Navbar";
import ScrambleText from "./components/Scramble";
import "./styles/fonts.css";
import "./styles/Main.css";

export default function App() {
  return (
    <div className="bg-black min-vh-100" style={{ minHeight: "100vh" }}>
      <Navbar />

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
    </div>
  );
}
