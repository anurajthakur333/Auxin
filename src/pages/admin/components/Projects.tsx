import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Project {
  id: string
  name: string
  projectCode?: string
  description?: string
  category: string
  status: "active" | "pending" | "completed" | "on-hold"
  progress: number
  deadline: string
  startDate: string
  budget?: string
  team?: string[]
  tasks?: {
    completed: number
    total: number
  }
  clientId?: string
  clientName?: string
  clientEmail?: string
  clientCode?: string
}

interface ProjectCategory {
  id: string
  name: string
  slug: string
  color?: string
}

const Projects = () => {
  const navigate = useNavigate()
  const playClickSound = useSound(clickSound, { volume: 0.3 })
  
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Actions
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    fetchProjects()
    fetchCategories()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/projects`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/project-categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      setDeletingId(projectId)
      setError(null)

      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      setSuccess("Project deleted successfully!")
      fetchProjects()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error deleting project:", err)
      setError(err instanceof Error ? err.message : "Failed to delete project")
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (projectId: string, newStatus: Project["status"]) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update project status")
      }

      setSuccess("Project status updated!")
      fetchProjects()
      setTimeout(() => setSuccess(null), 2000)
      playClickSound()
    } catch (err) {
      console.error("Error updating status:", err)
      setError(err instanceof Error ? err.message : "Failed to update status")
    }
  }

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

  const getCategoryColor = (categorySlug: string) => {
    const cat = categories.find(c => c.slug === categorySlug)
    return cat?.color || "#39FF14"
  }

  const getCategoryName = (categorySlug: string) => {
    const cat = categories.find(c => c.slug === categorySlug)
    return cat?.name || categorySlug
  }

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        project.name.toLowerCase().includes(query) ||
        (project.projectCode || "").toLowerCase().includes(query) ||
        (project.clientName || "").toLowerCase().includes(query) ||
        (project.clientCode || "").toLowerCase().includes(query) ||
        (project.description || "").toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter !== "all" && project.status !== statusFilter) {
      return false
    }

    // Category filter
    if (categoryFilter !== "all" && project.category !== categoryFilter) {
      return false
    }

    return true
  })

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    pending: projects.filter(p => p.status === "pending").length,
    completed: projects.filter(p => p.status === "completed").length,
    onHold: projects.filter(p => p.status === "on-hold").length,
  }

  return (
    <div style={{ color: "#FFF" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <h3
          className="aeonik-mono"
          style={{
            fontSize: "clamp(20px, 2.5vw, 28px)",
            color: "#FFF",
            margin: 0,
            letterSpacing: "-1px",
            fontWeight: 600,
          }}
        >
          ALL PROJECTS
        </h3>
        <button
          onClick={() => {
            playClickSound()
            // Could open a modal to add project, but for now redirect to clients
          }}
          className="aeonik-mono"
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "#FFF",
            fontSize: "12px",
            cursor: "pointer",
            borderRadius: "0px",
            letterSpacing: "1px",
          }}
          title="Projects are created from the Clients tab - select a client and manage their projects"
        >
          + ADD PROJECT (VIA CLIENTS TAB)
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        {[
          { label: "TOTAL", value: stats.total, color: "#FFF" },
          { label: "ACTIVE", value: stats.active, color: "#39FF14" },
          { label: "PENDING", value: stats.pending, color: "#FFD700" },
          { label: "COMPLETED", value: stats.completed, color: "#00CED1" },
          { label: "ON HOLD", value: stats.onHold, color: "#FF6B6B" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "15px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
            }}
          >
            <div className="aeonik-mono" style={{ fontSize: "24px", color: stat.color, fontWeight: 600 }}>
              {stat.value}
            </div>
            <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginTop: "5px" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
            SEARCH
          </label>
          <Input
            label=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY NAME, CODE, CLIENT..."
            style={{ marginBottom: 0 }}
          />
        </div>
        <div style={{ minWidth: "150px" }}>
          <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
            STATUS
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              playClickSound()
            }}
            className="aeonik-mono"
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFF",
              fontSize: "14px",
              borderRadius: "0px",
            }}
          >
            <option value="all">ALL STATUS</option>
            <option value="active">ACTIVE</option>
            <option value="pending">PENDING</option>
            <option value="completed">COMPLETED</option>
            <option value="on-hold">ON HOLD</option>
          </select>
        </div>
        <div style={{ minWidth: "150px" }}>
          <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
            CATEGORY
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              playClickSound()
            }}
            className="aeonik-mono"
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFF",
              fontSize: "14px",
              borderRadius: "0px",
            }}
          >
            <option value="all">ALL CATEGORIES</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setCategoryFilter("all")
              playClickSound()
            }}
            className="aeonik-mono"
            style={{
              padding: "12px 20px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#FFF",
              fontSize: "12px",
              cursor: "pointer",
              borderRadius: "0px",
              letterSpacing: "1px",
            }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && projects.length > 0 && (
        <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "15px" }}>
          SHOWING {filteredProjects.length} OF {projects.length} PROJECTS
        </div>
      )}

      {/* Messages */}
      {error && (
        <div
          className="aeonik-mono"
          style={{
            padding: "15px",
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid #FF6B6B",
            color: "#FF6B6B",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="aeonik-mono"
          style={{
            padding: "15px",
            background: "rgba(57, 255, 20, 0.1)",
            border: "1px solid #39FF14",
            color: "#39FF14",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="aeonik-mono" style={{ color: "#FFF", fontSize: "14px", padding: "40px", textAlign: "center" }}>
          LOADING PROJECTS...
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div
          className="aeonik-mono"
          style={{
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
            padding: "60px 40px",
            textAlign: "center",
            border: "1px dashed rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ marginBottom: "15px", fontSize: "16px" }}>NO PROJECTS FOUND</div>
          <div style={{ fontSize: "12px" }}>
            GO TO THE CLIENTS TAB AND SELECT A CLIENT TO CREATE THEIR FIRST PROJECT
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <div
          className="aeonik-mono"
          style={{
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          NO PROJECTS MATCH YOUR FILTERS
        </div>
      )}

      {/* Projects List */}
      {!loading && filteredProjects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${selectedProject?.id === project.id ? getStatusColor(project.status) : "rgba(255, 255, 255, 0.1)"}`,
                padding: "20px",
                borderRadius: "0px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedProject?.id !== project.id) {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProject?.id !== project.id) {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                }
              }}
            >
              {/* Header Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px", flexWrap: "wrap" }}>
                    <span
                      className="aeonik-mono"
                      style={{ fontSize: "16px", color: "#FFF", fontWeight: 600, textTransform: "uppercase" }}
                    >
                      {project.name}
                    </span>
                    {project.projectCode && (
                      <span
                        className="aeonik-mono"
                        style={{
                          fontSize: "11px",
                          color: "#39FF14",
                          padding: "3px 8px",
                          background: "rgba(57, 255, 20, 0.1)",
                          border: "1px solid rgba(57, 255, 20, 0.3)",
                        }}
                      >
                        {project.projectCode}
                      </span>
                    )}
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                    CLIENT: {project.clientName || "N/A"}
                    {project.clientCode && <span style={{ color: "#39FF14", marginLeft: "8px" }}>({project.clientCode})</span>}
                  </div>
                </div>

                {/* Status & Category badges */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span
                    className="aeonik-mono"
                    style={{
                      fontSize: "10px",
                      color: getCategoryColor(project.category),
                      padding: "4px 10px",
                      border: `1px solid ${getCategoryColor(project.category)}`,
                      textTransform: "uppercase",
                    }}
                  >
                    {getCategoryName(project.category)}
                  </span>
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value as Project["status"])}
                    onClick={(e) => e.stopPropagation()}
                    className="aeonik-mono"
                    style={{
                      fontSize: "10px",
                      color: getStatusColor(project.status),
                      padding: "4px 10px",
                      background: "transparent",
                      border: `1px solid ${getStatusColor(project.status)}`,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    <option value="active">ACTIVE</option>
                    <option value="pending">PENDING</option>
                    <option value="completed">COMPLETED</option>
                    <option value="on-hold">ON HOLD</option>
                  </select>
                </div>
              </div>

              {/* Details Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "3px" }}>
                    BUDGET
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14" }}>
                    {project.budget || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "3px" }}>
                    PROGRESS
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>
                    {project.progress}%
                  </div>
                </div>
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "3px" }}>
                    TASKS
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>
                    {project.tasks ? `${project.tasks.completed}/${project.tasks.total}` : "0/0"}
                  </div>
                </div>
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "3px" }}>
                    START DATE
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "3px" }}>
                    DEADLINE
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: new Date(project.deadline) < new Date() && project.status !== "completed" ? "#FF6B6B" : "#FFF" }}>
                    {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
                  </div>
                </div>
                {project.team && project.team.length > 0 && (
                  <div>
                    <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "3px" }}>
                      TEAM
                    </div>
                    <div className="aeonik-mono" style={{ fontSize: "12px", color: "#FFF" }}>
                      {project.team.length} member{project.team.length > 1 ? "s" : ""}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    height: "4px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "0px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${project.progress}%`,
                      background: getStatusColor(project.status),
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  onClick={() => {
                    playClickSound()
                    setSelectedProject(selectedProject?.id === project.id ? null : project)
                  }}
                  className="aeonik-mono"
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#FFF",
                    fontSize: "11px",
                    cursor: "pointer",
                    borderRadius: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  {selectedProject?.id === project.id ? "HIDE DETAILS" : "VIEW DETAILS"}
                </button>
                <button
                  onClick={() => {
                    playClickSound()
                    // Navigate to client's projects page
                    if (project.clientId) {
                      navigate(`/admin/client-projects/${project.clientId}?name=${encodeURIComponent(project.clientName || "")}&code=${project.clientCode || ""}`)
                    }
                  }}
                  className="aeonik-mono"
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid #39FF14",
                    color: "#39FF14",
                    fontSize: "11px",
                    cursor: "pointer",
                    borderRadius: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  MANAGE
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  disabled={deletingId === project.id}
                  className="aeonik-mono"
                  style={{
                    padding: "8px 16px",
                    background: deletingId === project.id ? "rgba(255, 107, 107, 0.2)" : "transparent",
                    border: "1px solid #FF6B6B",
                    color: "#FF6B6B",
                    fontSize: "11px",
                    cursor: deletingId === project.id ? "not-allowed" : "pointer",
                    borderRadius: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  {deletingId === project.id ? "DELETING..." : "DELETE"}
                </button>
              </div>

              {/* Expanded Details */}
              {selectedProject?.id === project.id && (
                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {project.description && (
                    <div style={{ marginBottom: "15px" }}>
                      <div className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px" }}>
                        DESCRIPTION
                      </div>
                      <div className="aeonik-mono" style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.5" }}>
                        {project.description}
                      </div>
                    </div>
                  )}

                  {project.team && project.team.length > 0 && (
                    <div style={{ marginBottom: "15px" }}>
                      <div className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px" }}>
                        TEAM MEMBERS
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {project.team.map((member, idx) => (
                          <span
                            key={idx}
                            className="aeonik-mono"
                            style={{
                              fontSize: "12px",
                              color: "#FFF",
                              padding: "4px 10px",
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
                    <div>
                      <div className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px" }}>
                        CLIENT EMAIL
                      </div>
                      <div className="aeonik-mono" style={{ fontSize: "13px", color: "#FFF" }}>
                        {project.clientEmail || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px" }}>
                        PROJECT ID
                      </div>
                      <div className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
                        {project.id}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects
