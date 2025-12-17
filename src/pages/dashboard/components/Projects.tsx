import { useState } from "react"

interface Project {
  id: string
  name: string
  category: "branding" | "web-design" | "marketing" | "seo" | "development"
  status: "active" | "pending" | "completed" | "on-hold"
  progress: number
  deadline: string
  startDate: string
  budget: string
  team: string[]
  description: string
  tasks: {
    completed: number
    total: number
  }
}

const Projects = () => {
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "WEBSITE REDESIGN",
      category: "web-design",
      status: "active",
      progress: 65,
      deadline: "2024-02-15",
      startDate: "2024-01-01",
      budget: "$15,000",
      team: ["JOHN DOE", "JANE SMITH"],
      description: "COMPLETE OVERHAUL OF CORPORATE WEBSITE WITH MODERN UI/UX DESIGN",
      tasks: { completed: 13, total: 20 },
    },
    {
      id: "2",
      name: "BRAND IDENTITY",
      category: "branding",
      status: "active",
      progress: 40,
      deadline: "2024-02-28",
      startDate: "2024-01-10",
      budget: "$8,000",
      team: ["ALICE JOHNSON"],
      description: "CREATING COMPREHENSIVE BRAND GUIDELINES AND VISUAL IDENTITY SYSTEM",
      tasks: { completed: 6, total: 15 },
    },
    {
      id: "3",
      name: "MARKETING CAMPAIGN",
      category: "marketing",
      status: "pending",
      progress: 10,
      deadline: "2024-03-10",
      startDate: "2024-01-20",
      budget: "$12,000",
      team: ["BOB WILSON", "CAROL DAVIS"],
      description: "MULTI-CHANNEL MARKETING CAMPAIGN FOR Q1 PRODUCT LAUNCH",
      tasks: { completed: 2, total: 18 },
    },
    {
      id: "4",
      name: "SEO OPTIMIZATION",
      category: "seo",
      status: "active",
      progress: 80,
      deadline: "2024-02-05",
      startDate: "2023-12-15",
      budget: "$5,000",
      team: ["DAVID LEE"],
      description: "COMPLETE TECHNICAL SEO AUDIT AND IMPLEMENTATION OF RECOMMENDATIONS",
      tasks: { completed: 16, total: 20 },
    },
    {
      id: "5",
      name: "E-COMMERCE PLATFORM",
      category: "development",
      status: "on-hold",
      progress: 25,
      deadline: "2024-04-01",
      startDate: "2024-01-05",
      budget: "$25,000",
      team: ["EMMA WILSON", "FRANK CHEN", "GRACE PARK"],
      description: "CUSTOM E-COMMERCE SOLUTION WITH ADVANCED FEATURES",
      tasks: { completed: 8, total: 32 },
    },
    {
      id: "6",
      name: "SOCIAL MEDIA STRATEGY",
      category: "marketing",
      status: "completed",
      progress: 100,
      deadline: "2024-01-20",
      startDate: "2023-12-01",
      budget: "$6,000",
      team: ["HANNAH BROWN"],
      description: "COMPREHENSIVE SOCIAL MEDIA STRATEGY AND CONTENT CALENDAR",
      tasks: { completed: 12, total: 12 },
    },
  ])

  const [filter, setFilter] = useState<"all" | Project["status"]>("all")
  const [categoryFilter, setCategoryFilter] = useState<"all" | Project["category"]>("all")
  const [sortBy, setSortBy] = useState<"deadline" | "progress" | "name">("deadline")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#39FF14"
      case "pending":
        return "#FFD700"
      case "completed":
        return "#00CED1"
      case "on-hold":
        return "#FF6B6B"
      default:
        return "#FFF"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "branding":
        return "#FF69B4"
      case "web-design":
        return "#00CED1"
      case "marketing":
        return "#FFD700"
      case "seo":
        return "#9370DB"
      case "development":
        return "#39FF14"
      default:
        return "#FFF"
    }
  }

  const filteredProjects = projects
    .filter((project) => {
      if (filter !== "all" && project.status !== filter) return false
      if (categoryFilter !== "all" && project.category !== categoryFilter) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      if (sortBy === "progress") return b.progress - a.progress
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return 0
    })

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    avgProgress: Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length),
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
        MY PROJECTS
      </h3>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {[
          { label: "TOTAL PROJECTS", value: stats.total, color: "#39FF14" },
          { label: "ACTIVE", value: stats.active, color: "#39FF14" },
          { label: "COMPLETED", value: stats.completed, color: "#00CED1" },
          { label: "AVG PROGRESS", value: `${stats.avgProgress}%`, color: "#FFD700" },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "25px",
              borderRadius: "0px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = stat.color
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
            }}
          >
            <div
              className="aeonik-mono"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                color: stat.color,
                fontWeight: 600,
                marginBottom: "10px",
                letterSpacing: "-2px",
              }}
            >
              {stat.value}
            </div>
            <div
              className="aeonik-mono"
              style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", letterSpacing: "1px" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Sort */}
      <div style={{ marginBottom: "40px" }}>
        {/* Status Filters */}
        <div style={{ marginBottom: "20px" }}>
          <p
            className="aeonik-mono"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
              marginBottom: "10px",
              letterSpacing: "1px",
            }}
          >
            STATUS
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {(["all", "active", "pending", "completed", "on-hold"] as const).map((statusType) => (
              <button
                key={statusType}
                onClick={() => setFilter(statusType)}
                className="aeonik-mono"
                style={{
                  fontSize: "12px",
                  color: filter === statusType ? "#000" : "#FFF",
                  background: filter === statusType ? "#39FF14" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${filter === statusType ? "#39FF14" : "rgba(255, 255, 255, 0.2)"}`,
                  padding: "8px 16px",
                  borderRadius: "0px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (filter !== statusType) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                    e.currentTarget.style.borderColor = "#39FF14"
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== statusType) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                  }
                }}
              >
                {statusType}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ marginBottom: "20px" }}>
          <p
            className="aeonik-mono"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
              marginBottom: "10px",
              letterSpacing: "1px",
            }}
          >
            CATEGORY
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {(["all", "branding", "web-design", "marketing", "seo", "development"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="aeonik-mono"
                style={{
                  fontSize: "12px",
                  color: categoryFilter === cat ? "#000" : "#FFF",
                  background: categoryFilter === cat ? getCategoryColor(cat) : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${categoryFilter === cat ? getCategoryColor(cat) : "rgba(255, 255, 255, 0.2)"}`,
                  padding: "8px 16px",
                  borderRadius: "0px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== cat) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                    e.currentTarget.style.borderColor = getCategoryColor(cat)
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== cat) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                  }
                }}
              >
                {cat.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <p
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", letterSpacing: "1px" }}
          >
            SORT BY:
          </p>
          {(["deadline", "progress", "name"] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className="aeonik-mono"
              style={{
                fontSize: "12px",
                color: sortBy === sort ? "#39FF14" : "rgba(255, 255, 255, 0.5)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                letterSpacing: "1px",
                textTransform: "uppercase",
                textDecoration: sortBy === sort ? "underline" : "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#39FF14"
              }}
              onMouseLeave={(e) => {
                if (sortBy !== sort) {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"
                }
              }}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "25px" }}>
        {filteredProjects.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "60px 40px",
              borderRadius: "0px",
              textAlign: "center",
            }}
          >
            <p className="aeonik-mono" style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.5)" }}>
              NO PROJECTS FOUND
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "30px",
                borderRadius: "0px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.borderColor = getStatusColor(project.status)
                e.currentTarget.style.transform = "translateY(-5px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "10px",
                  }}
                >
                  <h3
                    className="aeonik-mono"
                    style={{
                      fontSize: "20px",
                      color: "#FFF",
                      fontWeight: 600,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {project.name}
                  </h3>
                  <div
                    className="aeonik-mono"
                    style={{
                      fontSize: "10px",
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

                <div
                  className="aeonik-mono"
                  style={{
                    fontSize: "11px",
                    color: getCategoryColor(project.category),
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                  }}
                >
                  {project.category.replace("-", " ")}
                </div>

                <p
                  className="aeonik-mono"
                  style={{
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.6)",
                    lineHeight: "1.5",
                  }}
                >
                  {project.description}
                </p>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: "20px" }}>
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
                    height: "8px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "0px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${project.progress}%`,
                      height: "100%",
                      background: getStatusColor(project.status),
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div>
                  <p
                    className="aeonik-mono"
                    style={{
                      fontSize: "10px",
                      color: "rgba(255, 255, 255, 0.4)",
                      marginBottom: "5px",
                      letterSpacing: "1px",
                    }}
                  >
                    DEADLINE
                  </p>
                  <p className="aeonik-mono" style={{ fontSize: "13px", color: "#FFF" }}>
                    {new Date(project.deadline).toLocaleDateString().toUpperCase()}
                  </p>
                </div>
                <div>
                  <p
                    className="aeonik-mono"
                    style={{
                      fontSize: "10px",
                      color: "rgba(255, 255, 255, 0.4)",
                      marginBottom: "5px",
                      letterSpacing: "1px",
                    }}
                  >
                    BUDGET
                  </p>
                  <p className="aeonik-mono" style={{ fontSize: "13px", color: "#FFF" }}>
                    {project.budget}
                  </p>
                </div>
                <div>
                  <p
                    className="aeonik-mono"
                    style={{
                      fontSize: "10px",
                      color: "rgba(255, 255, 255, 0.4)",
                      marginBottom: "5px",
                      letterSpacing: "1px",
                    }}
                  >
                    TASKS
                  </p>
                  <p className="aeonik-mono" style={{ fontSize: "13px", color: "#FFF" }}>
                    {project.tasks.completed} / {project.tasks.total}
                  </p>
                </div>
                <div>
                  <p
                    className="aeonik-mono"
                    style={{
                      fontSize: "10px",
                      color: "rgba(255, 255, 255, 0.4)",
                      marginBottom: "5px",
                      letterSpacing: "1px",
                    }}
                  >
                    TEAM
                  </p>
                  <p className="aeonik-mono" style={{ fontSize: "13px", color: "#FFF" }}>
                    {project.team.length} MEMBERS
                  </p>
                </div>
              </div>

              {/* Team Members */}
              <div style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {project.team.map((member, idx) => (
                    <div
                      key={idx}
                      className="aeonik-mono"
                      style={{
                        fontSize: "11px",
                        color: "rgba(255, 255, 255, 0.8)",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        padding: "4px 10px",
                        borderRadius: "0px",
                      }}
                    >
                      {member}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default Projects
