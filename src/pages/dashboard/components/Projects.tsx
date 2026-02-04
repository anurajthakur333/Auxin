import { useState, useEffect } from "react"
import { API_BASE_URL, getAuthToken } from "../../../lib/apiConfig"

interface Project {
  id: string
  name: string
  projectCode?: string
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

interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "done"
  dueDate?: string
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/projects/my-projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        const formattedProjects = (data.projects || []).map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          projectCode: p.projectCode,
          category: p.category || "web-design",
          status: p.status || "pending",
          progress: p.progress || 0,
          deadline: p.deadline ? new Date(p.deadline).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          budget: p.budget || "$0",
          team: p.team || [],
          description: p.description || "",
          tasks: p.tasks || { completed: 0, total: 0 }
        }))
        setProjects(formattedProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchTasksForProject = async (project: Project) => {
    try {
      const token = getAuthToken()
      if (!token) return

      setSelectedProject(project)
      setTasksLoading(true)
      setTasksError(null)
      setTasks([])

      const response = await fetch(`${API_BASE_URL}/api/projects/${project.id}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('Failed to fetch tasks:', response.status, text)
        setTasksError('Failed to load tasks')
        return
      }

      const data = await response.json()
      const formattedTasks: Task[] = (data.tasks || []).map((t: any) => ({
        id: t.id || t._id,
        title: t.title,
        description: t.description,
        status: t.status || "todo",
        dueDate: t.dueDate,
      }))

      setTasks(formattedTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasksError('Failed to load tasks')
    } finally {
      setTasksLoading(false)
    }
  }

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
    avgProgress:
      projects.length === 0
        ? 0
        : Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length),
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
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
                  {project.projectCode && (
                    <div
                      className="aeonik-mono"
                      style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.6)",
                        padding: "4px 8px",
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "0px",
                        letterSpacing: "2px",
                      }}
                    >
                      {project.projectCode}
                    </div>
                  )}
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

              {/* Progress - segmented bar UI */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                    PROGRESS
                  </span>
                  <span className="aeonik-mono" style={{ fontSize: "12px", color: "#39FF14", fontWeight: 600 }}>
                    {project.progress}%
                  </span>
                </div>
                {(() => {
                  const totalSegments = 30;
                  const activeSegments = Math.round((project.progress / 100) * totalSegments);
                  return (
                    <div
                      style={{
                        width: "100%",
                        padding: "4px 0",
                        background: "transparent",
                        borderRadius: "0px",
                        border: "none",
                        display: "flex",
                        gap: "3px",
                      }}
                    >
                      {Array.from({ length: totalSegments }).map((_, index) => {
                        const filled = index < activeSegments;
                        return (
                          <div
                            key={index}
                            style={{
                              flex: 1,
                              height: "70px",
                              borderRadius: "0px",
                              background: filled ? "#39FF14" : "rgba(255, 255, 255, 0.25)",
                              opacity: filled ? 1 : 0.8,
                              transition: "background 0.3s ease, opacity 0.3s ease",
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })()}
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

              {/* Tasks Button */}
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="aeonik-mono"
                  onClick={(e) => {
                    e.stopPropagation()
                    fetchTasksForProject(project)
                  }}
                  style={{
                    fontSize: "11px",
                    padding: "8px 16px",
                    borderRadius: "0px",
                    border: "1px solid #39FF14",
                    background: "transparent",
                    color: "#39FF14",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  VIEW TASKS
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tasks Modal */}
      {selectedProject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => {
            setSelectedProject(null)
            setTasks([])
            setTasksError(null)
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              maxHeight: "80vh",
              overflow: "auto",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "30px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h3 className="aeonik-mono" style={{ fontSize: "20px", color: "#FFF", marginBottom: "6px" }}>
                  TASKS – {selectedProject.name}
                </h3>
                {selectedProject.projectCode && (
                  <div
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.6)",
                      letterSpacing: "3px",
                    }}
                  >
                    {selectedProject.projectCode}
                  </div>
                )}
              </div>
              <button
                className="aeonik-mono"
                onClick={() => {
                  setSelectedProject(null)
                  setTasks([])
                  setTasksError(null)
                }}
                style={{
                  padding: "6px 12px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  background: "transparent",
                  color: "#FFF",
                  fontSize: "11px",
                  letterSpacing: "1px",
                }}
              >
                CLOSE
              </button>
            </div>

            {tasksLoading ? (
              <div className="aeonik-mono" style={{ color: "rgba(255,255,255,0.6)" }}>
                Loading tasks...
              </div>
            ) : tasksError ? (
              <div className="aeonik-mono" style={{ color: "#FF6B6B" }}>
                {tasksError}
              </div>
            ) : tasks.length === 0 ? (
              <div className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
                No tasks for this project yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.03)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div className="aeonik-mono" style={{ fontSize: "13px", color: "#FFF", marginBottom: "4px" }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                          {task.description}
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                          DUE {new Date(task.dueDate).toLocaleDateString().toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div
                      className="aeonik-mono"
                      style={{
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        padding: "4px 8px",
                        borderRadius: "0px",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color:
                          task.status === "done"
                            ? "#39FF14"
                            : task.status === "in-progress"
                            ? "#FFD700"
                            : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {task.status.replace("-", " ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Projects
