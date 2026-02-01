import { useEffect, useState } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"

interface SystemStat {
  label: string
  value: string | number
}

interface Project {
  id: string
  status: "active" | "pending" | "completed" | "on-hold"
}

const Analytics = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [totalProjects, setTotalProjects] = useState<number | null>(null)
  const [activeProjects, setActiveProjects] = useState<number | null>(null)

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken")
        if (!adminToken) {
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        const usersArray = Array.isArray(data.users) ? data.users : []
        setTotalUsers(usersArray.length)
      } catch {
        // Silent fail for analytics; avoid blocking dashboard
      }
    }

    const fetchProjects = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken")
        if (!adminToken) {
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/projects`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        const projectsArray: Project[] = Array.isArray(data.projects) ? data.projects : []
        setTotalProjects(projectsArray.length)
        setActiveProjects(projectsArray.filter(p => p.status === "active").length)
      } catch {
        // Silent fail for analytics; avoid blocking dashboard
      }
    }

    fetchTotalUsers()
    fetchProjects()
  }, [])

  const systemStats: SystemStat[] = [
    { label: "TOTAL USERS", value: totalUsers ?? "—" },
    { label: "TOTAL PROJECTS", value: totalProjects ?? "—" },
    { label: "ACTIVE PROJECTS", value: activeProjects ?? "—" },
    { label: "MONTHLY REVENUE", value: "$285K" },
    { label: "COMPLETION RATE", value: "94%" },
  ]

  return (
    <>
      {/* System Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "25px",
          marginBottom: "50px",
        }}
      >
        {systemStats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "30px",
              borderRadius: "0px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(57, 255, 20, 0.05)"
              e.currentTarget.style.borderColor = "#39FF14"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
            }}
          >
            <div
              className="aeonik-mono"
              style={{
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.5)",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              {stat.label}
              </div>
              <div
                className="aeonik-mono"
                style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                color: "#39FF14",
                  fontWeight: 600,
                lineHeight: "1",
                }}
              >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <h3
        className="aeonik-mono"
        style={{
          fontSize: "clamp(20px, 2.5vw, 28px)",
          color: "#FFF",
          marginBottom: "25px",
          letterSpacing: "-1px",
          fontWeight: 600,
        }}
      >
        RECENT ACTIVITY
      </h3>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "30px",
          borderRadius: "0px",
        }}
      >
        {[
          { action: "New user registration", user: "alice@example.com", time: "5 minutes ago" },
          { action: "Project completed", user: "TechCorp Project", time: "1 hour ago" },
          { action: "Payment received", user: "$12,500", time: "2 hours ago" },
          { action: "Meeting scheduled", user: "Design Review", time: "3 hours ago" },
        ].map((activity, index) => (
          <div
            key={index}
            style={{
              padding: "15px 0",
              borderBottom: index < 3 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className="aeonik-mono" style={{ fontSize: "15px", color: "#FFF", marginBottom: "5px", textTransform: "uppercase" }}>
                {activity.action}
              </div>
              <div className="aeonik-mono" style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>
                {activity.user}
              </div>
            </div>
            <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>
              {activity.time}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Analytics
