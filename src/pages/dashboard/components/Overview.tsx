import { useState } from "react"

interface Project {
  id: string
  name: string
  status: "active" | "pending" | "completed"
  progress: number
  deadline: string
}

interface Appointment {
  id: string
  title: string
  date: string
  time: string
}

interface Notification {
  id: string
  message: string
  time: string
  read: boolean
}

const Overview = () => {

  // Mock data - replace with actual API calls
  const [projects] = useState<Project[]>([
    { id: "1", name: "WEBSITE REDESIGN", status: "active", progress: 65, deadline: "2024-02-15" },
    { id: "2", name: "BRAND IDENTITY", status: "active", progress: 40, deadline: "2024-02-28" },
    { id: "3", name: "MARKETING CAMPAIGN", status: "pending", progress: 10, deadline: "2024-03-10" },
  ])

  const [appointments] = useState<Appointment[]>([
    { id: "1", title: "PROJECT REVIEW", date: "2024-01-25", time: "10:00 AM" },
    { id: "2", title: "DESIGN DISCUSSION", date: "2024-01-26", time: "2:00 PM" },
  ])

  const [notifications] = useState<Notification[]>([
    { id: "1", message: "NEW PROJECT MILESTONE COMPLETED", time: "2 HOURS AGO", read: false },
    { id: "2", message: "MEETING SCHEDULED FOR TOMORROW", time: "5 HOURS AGO", read: false },
    { id: "3", message: "PAYMENT RECEIVED", time: "1 DAY AGO", read: true },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#39FF14"
      case "pending":
        return "#FFD700"
      case "completed":
        return "#00CED1"
      default:
        return "#FFF"
    }
  }

  return (
    <>
      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "25px",
          marginBottom: "50px",
        }}
      >
        {/* Active Projects Stat */}
        <div
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
            style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "#39FF14", fontWeight: 600, lineHeight: "1" }}
          >
            {projects.filter((p) => p.status === "active").length}
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "10px", letterSpacing: "1px" }}
          >
            ACTIVE PROJECTS
          </div>
        </div>

        {/* Upcoming Meetings Stat */}
        <div
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
            style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "#39FF14", fontWeight: 600, lineHeight: "1" }}
          >
            {appointments.length}
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "10px", letterSpacing: "1px" }}
          >
            UPCOMING MEETINGS
          </div>
        </div>

        {/* Notifications Stat */}
        <div
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
            style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "#39FF14", fontWeight: 600, lineHeight: "1" }}
          >
            {notifications.filter((n) => !n.read).length}
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "10px", letterSpacing: "1px" }}
          >
            NEW NOTIFICATIONS
          </div>
        </div>
      </div>

      {/* Main Content Grid - 2 Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "30px",
          marginBottom: "50px",
        }}
      >
        {/* Active Projects Section */}
        <div>
          <h2
            className="aeonik-mono"
            style={{
              fontSize: "clamp(20px, 2.5vw, 28px)",
              color: "#FFF",
              marginBottom: "25px",
              letterSpacing: "-1px",
              fontWeight: 600,
            }}
          >
            ACTIVE PROJECTS
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "20px",
                  borderRadius: "0px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                  e.currentTarget.style.borderColor = getStatusColor(project.status)
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <div
                      className="aeonik-mono"
                      style={{ fontSize: "15px", color: "#FFF", fontWeight: 600, marginBottom: "5px" }}
                    >
                      {project.name}
                    </div>
                    <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                      DUE: {new Date(project.deadline).toLocaleDateString().toUpperCase()}
                    </div>
                  </div>
                  <div
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      color: getStatusColor(project.status),
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "4px 10px",
                      border: `1px solid ${getStatusColor(project.status)}`,
                      borderRadius: "0px",
                    }}
                  >
                    {project.status}
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginTop: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                      PROGRESS
                    </span>
                    <span className="aeonik-mono" style={{ fontSize: "12px", color: "#39FF14", fontWeight: 600 }}>
                      {project.progress}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "0px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${project.progress}%`,
                        height: "100%",
                        background: "#39FF14",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings Section */}
        <div>
          <h2
            className="aeonik-mono"
            style={{
              fontSize: "clamp(20px, 2.5vw, 28px)",
              color: "#FFF",
              marginBottom: "25px",
              letterSpacing: "-1px",
              fontWeight: 600,
            }}
          >
            UPCOMING MEETINGS
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "20px",
                  borderRadius: "0px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                  e.currentTarget.style.borderColor = "#39FF14"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                }}
              >
                <div
                  className="aeonik-mono"
                  style={{ fontSize: "15px", color: "#FFF", fontWeight: 600, marginBottom: "10px" }}
                >
                  {appointment.title}
                </div>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                  <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                    📅{" "}
                    {new Date(appointment.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).toUpperCase()}
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                    🕒 {appointment.time.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div style={{ marginBottom: "50px" }}>
        <h2
          className="aeonik-mono"
          style={{
            fontSize: "clamp(20px, 2.5vw, 28px)",
            color: "#FFF",
            marginBottom: "25px",
            letterSpacing: "-1px",
            fontWeight: 600,
          }}
        >
          RECENT NOTIFICATIONS
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: notification.read ? "rgba(255, 255, 255, 0.02)" : "rgba(57, 255, 20, 0.05)",
                border: notification.read
                  ? "1px solid rgba(255, 255, 255, 0.05)"
                  : "1px solid rgba(57, 255, 20, 0.2)",
                padding: "20px 25px",
                borderRadius: "0px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = notification.read
                  ? "rgba(255, 255, 255, 0.02)"
                  : "rgba(57, 255, 20, 0.05)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                {!notification.read && (
                  <div style={{ width: "8px", height: "8px", background: "#39FF14", borderRadius: "0px" }} />
                )}
                <span className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>
                  {notification.message}
                </span>
              </div>
              <span className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)" }}>
                {notification.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Overview
