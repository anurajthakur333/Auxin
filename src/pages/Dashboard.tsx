import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import ScrambleText from "../components/Scramble"
import { useAuth } from "../contexts/AuthContext"
import { useSound } from "../hooks/useSound"
import clickSound from "../assets/Sound/Click1.wav"
import Overview from "./dashboard/components/Overview"
import Projects from "./dashboard/components/Projects"
import Notifications from "./dashboard/components/Notifications"
import Billing from "./dashboard/components/Billing"
import "../styles/fonts.css"
import "../styles/Main.css"
import Lenis from "lenis"

const Dashboard = () => {
  const lenisRef = useRef<Lenis | null>(null)
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "notifications" | "billing">("overview")
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  // Refresh user data on mount to get latest clientCode
  useEffect(() => {
    refreshUser()
  }, [])

  // Debug: Log user data
  useEffect(() => {
    console.log('🔍 Dashboard - Current user data:', user)
    console.log('🔍 Dashboard - Client code:', user?.clientCode)
  }, [user])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    })

    lenisRef.current = lenis

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />
      case "projects":
        return <Projects />
      case "notifications":
        return <Notifications />
      case "billing":
        return <Billing />
      default:
        return null
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        position: "relative",
        padding: "40px 50px",
      }}
    >
      {/* Dashboard Header with Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
          paddingBottom: "20px",
          gap: "20px",
        }}
      >
        {/* Page Title */}
        <h1
          className="aeonik-mono text-white"
          style={{
            fontSize: "clamp(32px, 10vw, 150px)",
            lineHeight: "0.9",
            letterSpacing: "-8px",
            fontWeight: 600,
            textAlign: "left",
            margin: 0,
            flex: 1,
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
            DASHBOARD
          </ScrambleText>
        </h1>
        
        {/* Right side - Client Code & Home Button */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", marginTop: "10px" }}>
          {/* Client Code Display */}
          {user?.clientCode && (
            <div
              className="aeonik-mono"
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.4)",
                letterSpacing: "3px",
                fontWeight: 500,
                padding: "8px 16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "0px",
                whiteSpace: "nowrap",
              }}
            >
              {user.clientCode}
            </div>
          )}
          
          {/* Go Back to Home Button */}
          <button
            onClick={() => {
              playClickSound()
              navigate("/")
            }}
            className="aeonik-mono"
            style={{
              fontSize: "12px",
              color: "#39FF14",
              letterSpacing: "1px",
              fontWeight: 500,
              padding: "8px 16px",
              border: "1px solid #39FF14",
              background: "transparent",
              borderRadius: "0px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(57, 255, 20, 0.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            ← BACK TO HOME
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div
        className="aeonik-mono"
        style={{
          fontSize: "clamp(14px, 2vw, 24px)",
          color: "#39FF14",
          marginBottom: "40px",
          letterSpacing: "-1px",
        }}
      >
        <ScrambleText
          trigger="load"
          speed="fast"
          revealSpeed={0.2}
          scrambleIntensity={1}
          delay={300}
          style={{ color: "#39FF14" }}
        >
          {`WELCOME BACK, ${user?.name?.toUpperCase() || "USER"}`}
        </ScrambleText>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "50px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          paddingBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {(["overview", "projects", "notifications", "billing"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              playClickSound()
              setActiveTab(tab)
            }}
            className="aeonik-mono"
            style={{
              fontSize: "14px",
              color: activeTab === tab ? "#39FF14" : "rgba(255, 255, 255, 0.6)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              padding: "10px 20px",
              background: activeTab === tab ? "rgba(57, 255, 20, 0.1)" : "transparent",
              border: activeTab === tab ? "1px solid #39FF14" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "0px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontWeight: activeTab === tab ? 600 : 400,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"
                e.currentTarget.style.color = "#FFF"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ marginBottom: "60px" }}>{renderContent()}</div>
    </div>
  )
}

export default Dashboard
