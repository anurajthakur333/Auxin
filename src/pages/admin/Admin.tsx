import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import ScrambleText from "../../components/Scramble"
import { useAuth } from "../../contexts/AuthContext"
import Analytics from "./components/Analytics"
import Users from "./components/Users"
import Projects from "./components/Projects"
import Settings from "./components/Settings"
import MeetingDurations from "./components/MeetingDurations"
import { useSound } from "../../hooks/useSound"
import clickSound from "../../assets/Sound/Click1.wav"
import "../../styles/fonts.css"
import "../../styles/Main.css"
import Lenis from "lenis"

const Admin = () => {
  const lenisRef = useRef<Lenis | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"users" | "projects" | "analytics" | "settings" | "meetings">("analytics")
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  // Mock admin check - in production, check user.role === 'admin'
  useEffect(() => {
    // Check if admin token exists
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin')
    }
  }, [user, navigate])

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
      case "analytics":
        return <Analytics />
      case "users":
        return <Users />
      case "projects":
        return <Projects />
      case "settings":
        return <Settings />
      case "meetings":
        return <MeetingDurations />
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
      {/* Admin Header with Title and Logout */}
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
            ADMIN PANEL
          </ScrambleText>
        </h1>

        {/* Exit Button */}
        <button
          onClick={() => {
            playClickSound()
            localStorage.removeItem('adminToken')
            navigate("/")
          }}
          className="aeonik-mono"
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            fontSize: "12px",
            cursor: "pointer",
            borderRadius: "0px",
            letterSpacing: "1px",
            transition: "all 0.3s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#39FF14"
            e.currentTarget.style.color = "#39FF14"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
            e.currentTarget.style.color = "white"
          }}
        >
          EXIT ADMIN PANEL
        </button>
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
        {(["analytics", "users", "projects", "settings", "meetings"] as const).map((tab) => (
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

export default Admin
