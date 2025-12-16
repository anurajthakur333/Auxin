import { useState } from "react"

interface ProjectData {
  id: string
  name: string
  client: string
  status: "active" | "pending" | "completed"
  revenue: number
  startDate: string
}

const Projects = () => {
  const [projects] = useState<ProjectData[]>([
    {
      id: "1",
      name: "E-commerce Platform",
      client: "TechCorp",
      status: "active",
      revenue: 25000,
      startDate: "2024-01-05",
    },
    { id: "2", name: "Brand Redesign", client: "StyleCo", status: "active", revenue: 18000, startDate: "2024-01-12" },
    { id: "3", name: "Mobile App", client: "StartupX", status: "pending", revenue: 35000, startDate: "2024-01-20" },
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
        PROJECT MANAGEMENT
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "25px",
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
                  style={{ fontSize: "20px", color: "#FFF", fontWeight: 600, marginBottom: "5px", textTransform: "uppercase" }}
                >
                  {project.name}
                </div>
                <div className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>
                  Client: {project.client}
                </div>
              </div>
              <div
                className="aeonik-mono"
                style={{
                  fontSize: "11px",
                  color: getStatusColor(project.status),
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  padding: "6px 12px",
                  border: `1px solid ${getStatusColor(project.status)}`,
                  borderRadius: "0px",
                }}
              >
                {project.status}
              </div>
            </div>

            <div style={{ display: "flex", gap: "30px", marginTop: "15px" }}>
              <div>
                <div
                  className="aeonik-mono"
                  style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px", textTransform: "uppercase" }}
                >
                  Revenue
                </div>
                <div className="aeonik-mono" style={{ fontSize: "18px", color: "#39FF14", fontWeight: 600, textTransform: "uppercase" }}>
                  ${project.revenue.toLocaleString()}
                </div>
              </div>
              <div>
                <div
                  className="aeonik-mono"
                  style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px", textTransform: "uppercase" }}
                >
                  Start Date
                </div>
                <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF", textTransform: "uppercase" }}>
                  {new Date(project.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Projects
