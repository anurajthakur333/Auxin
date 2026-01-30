import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import DropdownMenu from "../../../components/ui/DropdownMenu"
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
}

interface ProjectCategory {
  id: string
  name: string
  slug: string
  color?: string
  isActive: boolean
}

interface Invoice {
  id: string
  invoiceNumber: string
  projectCode?: string
  total: number
  status: "pending" | "paid" | "overdue"
  date: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "done"
  dueDate?: string
}

interface ClientProjectsAdminProps {
  clientId: string
  clientName: string
  clientCode: string
  onClose: () => void
}

const ClientProjectsAdmin = ({ clientId, clientName, clientCode, onClose }: ClientProjectsAdminProps) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectInvoices, setProjectInvoices] = useState<Map<string, Invoice[]>>(new Map())
  const [showInvoicesProject, setShowInvoicesProject] = useState<Project | null>(null)
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    projectCode: "",
    description: "",
    category: "",
    status: "pending" as Project["status"],
    progress: 0,
    deadline: "",
    startDate: "",
    budget: "",
    team: [] as string[],
    tasks: { completed: 0, total: 0 }
  })

  // Raw input for team members (to preserve commas while typing)
  const [teamInput, setTeamInput] = useState("")

  // Tasks modal state
  const [tasksProject, setTasksProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskStatus, setNewTaskStatus] = useState<Task["status"]>("todo")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")

  useEffect(() => {
    fetchProjects()
    fetchCategories()
  }, [clientId])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/project-categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setError('Admin authentication required')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/projects/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }

      const data = await response.json()
      const normalizedProjects: Project[] = (data.projects || []).map((p: any) => ({
        id: p.id || p._id,
        name: p.name,
        projectCode: p.projectCode,
        description: p.description,
        category: p.category,
        status: p.status,
        progress: p.progress ?? 0,
        deadline: p.deadline,
        startDate: p.startDate,
        budget: p.budget,
        team: p.team || [],
        tasks: p.tasks || { completed: 0, total: 0 },
      }))

      setProjects(normalizedProjects)
      
      // Fetch invoices for each project with a projectCode
      fetchInvoicesForProjects(normalizedProjects)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoicesForProjects = async (projectsList: Project[]) => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/invoices`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) return

      const data = await response.json()
      const allInvoices: Invoice[] = (data.invoices || []).map((inv: any) => ({
        id: inv.id || inv._id,
        invoiceNumber: inv.invoiceNumber,
        projectCode: inv.projectCode,
        total: inv.total,
        status: inv.status,
        date: inv.date,
      }))

      // Group invoices by projectCode
      const invoiceMap = new Map<string, Invoice[]>()
      projectsList.forEach(project => {
        if (project.projectCode) {
          const linkedInvoices = allInvoices.filter(inv => inv.projectCode === project.projectCode)
          if (linkedInvoices.length > 0) {
            invoiceMap.set(project.id, linkedInvoices)
          }
        }
      })
      setProjectInvoices(invoiceMap)
    } catch (err) {
      console.error('Error fetching invoices:', err)
    }
  }

  const handleAddProject = () => {
    setEditingProject(null)
    setFormData({
      name: "",
      projectCode: "",
      description: "",
      category: categories.length > 0 ? categories[0].slug : "",
      status: "pending",
      progress: 0,
      deadline: "",
      startDate: "",
      budget: "",
      team: [],
      tasks: { completed: 0, total: 0 }
    })
    setTeamInput("")
    setShowAddModal(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      projectCode: project.projectCode || "",
      description: project.description || "",
      category: project.category,
      status: project.status,
      progress: project.progress,
      deadline: project.deadline.split('T')[0],
      startDate: project.startDate.split('T')[0],
      budget: project.budget || "",
      team: project.team || [],
      tasks: project.tasks || { completed: 0, total: 0 }
    })
    setTeamInput((project.team || []).join(", "))
    setShowAddModal(true)
  }

  const handleSaveProject = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        alert('Admin authentication required')
        return
      }

      const url = editingProject
        ? `${API_BASE_URL}/api/admin/projects/${editingProject.id}`
        : `${API_BASE_URL}/api/admin/projects/client/${clientId}`

      const method = editingProject ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save project' }))
        throw new Error(errorData.error || 'Failed to save project')
      }

      await fetchProjects()
      setShowAddModal(false)
      setEditingProject(null)
      setTeamInput("")
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save project')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        alert('Admin authentication required')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      await fetchProjects()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "#39FF14"
      case "pending": return "#FFD700"
      case "completed": return "#00CED1"
      case "on-hold": return "#FF6B6B"
      default: return "#FFF"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "branding": return "#FF69B4"
      case "web-design": return "#00CED1"
      case "marketing": return "#FFD700"
      case "seo": return "#9370DB"
      case "development": return "#39FF14"
      default: return "#FFF"
    }
  }

  const resetTaskForm = () => {
    setNewTaskTitle("")
    setNewTaskDescription("")
    setNewTaskStatus("todo")
    setNewTaskDueDate("")
  }

  const fetchTasksForProject = async (project: Project) => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        alert('Admin authentication required')
        return
      }

      setTasksProject(project)
      setTasksLoading(true)
      setTasksError(null)
      setTasks([])
      resetTaskForm()

      const response = await fetch(`${API_BASE_URL}/api/admin/projects/${project.id}/tasks`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
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

  const addTask = async () => {
    if (!tasksProject || !newTaskTitle) return
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        alert('Admin authentication required')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/projects/${tasksProject.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || undefined,
          status: newTaskStatus,
          dueDate: newTaskDueDate || undefined,
        })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to add task')
      }

      resetTaskForm()
      await fetchTasksForProject(tasksProject)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add task')
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        alert('Admin authentication required')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to update task')
      }

      if (tasksProject) {
        await fetchTasksForProject(tasksProject)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update task')
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        alert('Admin authentication required')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to delete task')
      }

      if (tasksProject) {
        await fetchTasksForProject(tasksProject)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete task')
    }
  }

  return (
    <>
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        padding: "40px 50px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "0px",
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h2 className="aeonik-mono" style={{ fontSize: "28px", color: "#FFF", marginBottom: "10px" }}>
              MANAGE PROJECTS
            </h2>
            <p className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
              {clientName} ({clientCode})
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                playClickSound()
                handleAddProject()
              }}
              className="aeonik-mono"
              style={{
                padding: "10px 20px",
                background: "#39FF14",
                color: "#000",
                border: "1px solid #39FF14",
                borderRadius: "0px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "1px"
              }}
            >
              ADD PROJECT
            </button>
            <button
              onClick={() => {
                playClickSound()
                onClose()
              }}
              className="aeonik-mono"
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#FFF",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "0px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "1px"
              }}
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* Projects List */}
        {loading && (
          <div className="aeonik-mono" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
            Loading projects...
          </div>
        )}

        {error && (
          <div className="aeonik-mono" style={{ padding: "20px", background: "rgba(255,107,107,0.1)", border: "1px solid #FF6B6B", color: "#FF6B6B", marginBottom: "20px" }}>
            Error: {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="aeonik-mono" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
            No projects found. Click "ADD PROJECT" to create one.
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "20px" }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "20px",
                  borderRadius: "0px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                  <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#FFF", fontWeight: 600 }}>
                    {project.name}
                  </h3>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                    <button
                      onClick={() => {
                        playClickSound()
                        handleEditProject(project)
                      }}
                      className="aeonik-mono"
                      style={{
                        padding: "4px 8px",
                        background: "transparent",
                        border: "1px solid #3B82F6",
                        color: "#3B82F6",
                        borderRadius: "0px",
                        cursor: "pointer",
                        fontSize: "10px"
                      }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => {
                        playClickSound()
                        handleDeleteProject(project.id)
                      }}
                      className="aeonik-mono"
                      style={{
                        padding: "4px 8px",
                        background: "transparent",
                        border: "1px solid #FF6B6B",
                        color: "#FF6B6B",
                        borderRadius: "0px",
                        cursor: "pointer",
                        fontSize: "10px"
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>

                <div className="aeonik-mono" style={{ fontSize: "11px", color: getCategoryColor(project.category), marginBottom: "10px" }}>
                  {project.category.toUpperCase().replace("-", " ")}
                </div>

                {project.description && (
                  <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "15px" }}>
                    {project.description}
                  </p>
                )}

                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                      PROGRESS
                    </span>
                    <span className="aeonik-mono" style={{ fontSize: "11px", color: "#39FF14" }}>
                      {project.progress}%
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "0px" }}>
                    <div
                      style={{
                        width: `${project.progress}%`,
                        height: "100%",
                        background: getStatusColor(project.status),
                        transition: "width 0.3s ease"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap" }}>
                  <div
                    className="aeonik-mono"
                    style={{
                      fontSize: "10px",
                      color: getStatusColor(project.status),
                      padding: "4px 8px",
                      border: `1px solid ${getStatusColor(project.status)}`,
                      borderRadius: "0px"
                    }}
                  >
                    {project.status.toUpperCase()}
                  </div>
                  {project.budget && (
                    <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                      {project.budget}
                    </div>
                  )}
                  {project.team && project.team.length > 0 && (
                    <div
                      className="aeonik-mono"
                      style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.7)",
                        padding: "4px 8px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "0px"
                      }}
                    >
                      {project.team.length} MEMBER{project.team.length > 1 ? "S" : ""}:{" "}
                      {project.team.join(", ")}
                    </div>
                  )}
                </div>

                {/* Billing Summary */}
                {projectInvoices.has(project.id) && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "12px",
                      background: "rgba(255, 215, 0, 0.05)",
                      border: "1px solid rgba(255, 215, 0, 0.2)",
                    }}
                  >
                    <div
                      className="aeonik-mono"
                      style={{
                        fontSize: "11px",
                        color: "#FFD700",
                        marginBottom: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span>LINKED INVOICES ({projectInvoices.get(project.id)?.length})</span>
                      <span>
                        TOTAL: ${projectInvoices.get(project.id)?.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {projectInvoices.get(project.id)?.slice(0, 3).map(inv => (
                        <div
                          key={inv.id}
                          className="aeonik-mono"
                          style={{
                            fontSize: "10px",
                            padding: "4px 8px",
                            background: inv.status === 'paid' ? 'rgba(57, 255, 20, 0.1)' : 
                                       inv.status === 'overdue' ? 'rgba(255, 107, 107, 0.1)' : 
                                       'rgba(255, 215, 0, 0.1)',
                            border: `1px solid ${inv.status === 'paid' ? '#39FF14' : 
                                    inv.status === 'overdue' ? '#FF6B6B' : '#FFD700'}`,
                            color: inv.status === 'paid' ? '#39FF14' : 
                                   inv.status === 'overdue' ? '#FF6B6B' : '#FFD700',
                          }}
                        >
                          {inv.invoiceNumber}: ${inv.total.toFixed(2)} ({inv.status.toUpperCase()})
                        </div>
                      ))}
                      {(projectInvoices.get(project.id)?.length || 0) > 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            playClickSound()
                            setShowInvoicesProject(project)
                          }}
                          className="aeonik-mono"
                          style={{
                            fontSize: "10px",
                            padding: "4px 8px",
                            background: "transparent",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            color: "rgba(255, 255, 255, 0.7)",
                            cursor: "pointer"
                          }}
                        >
                          +{(projectInvoices.get(project.id)?.length || 0) - 3} MORE
                        </button>
                      )}
                    </div>
                    {project.budget && (
                      <div
                        className="aeonik-mono"
                        style={{
                          marginTop: "10px",
                          fontSize: "10px",
                          color: "rgba(255, 255, 255, 0.6)"
                        }}
                      >
                        BUDGET: {project.budget} | BILLED: ${projectInvoices.get(project.id)?.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
                        {project.budget && (
                          <span style={{ 
                            marginLeft: "10px",
                            color: (parseFloat(project.budget.replace(/[^0-9.-]+/g,"")) || 0) < 
                                   (projectInvoices.get(project.id)?.reduce((sum, inv) => sum + inv.total, 0) || 0)
                              ? '#FF6B6B' : '#39FF14'
                          }}>
                            ({(parseFloat(project.budget.replace(/[^0-9.-]+/g,"")) || 0) >= 
                              (projectInvoices.get(project.id)?.reduce((sum, inv) => sum + inv.total, 0) || 0)
                              ? 'WITHIN BUDGET' : 'OVER BUDGET'})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tasks Button */}
                <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  {projectInvoices.has(project.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        playClickSound()
                        setShowInvoicesProject(project)
                      }}
                      className="aeonik-mono"
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        padding: "6px 14px",
                        borderRadius: "0px",
                        cursor: "pointer",
                        border: "1px solid #FFD700",
                        color: "#FFD700",
                        background: "transparent",
                      }}
                    >
                      VIEW INVOICES
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      playClickSound()
                      fetchTasksForProject(project)
                    }}
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "6px 14px",
                      borderRadius: "0px",
                      cursor: "pointer",
                      border: "1px solid #39FF14",
                      color: "#39FF14",
                      background: "transparent",
                    }}
                  >
                    MANAGE TASKS
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoices Modal */}
        {showInvoicesProject && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.95)",
              zIndex: 10001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowInvoicesProject(null)
              }
            }}
          >
            <div
              style={{
                background: "#0A0A0A",
                border: "1px solid #FFD700",
                padding: "30px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "80vh",
                overflow: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#FFD700", margin: 0 }}>
                  INVOICES FOR {showInvoicesProject.name}
                  {showInvoicesProject.projectCode && (
                    <span style={{ fontSize: "14px", color: "#39FF14", marginLeft: "10px" }}>
                      ({showInvoicesProject.projectCode})
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowInvoicesProject(null)}
                  className="aeonik-mono"
                  style={{
                    fontSize: "20px",
                    background: "transparent",
                    border: "none",
                    color: "#FFF",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              </div>

              {showInvoicesProject.budget && (
                <div
                  className="aeonik-mono"
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    background: "rgba(255, 215, 0, 0.05)",
                    border: "1px solid rgba(255, 215, 0, 0.2)",
                    fontSize: "13px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>PROJECT BUDGET:</span>
                    <span style={{ color: "#FFD700" }}>{showInvoicesProject.budget}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>TOTAL BILLED:</span>
                    <span style={{ color: "#FFF" }}>
                      ${projectInvoices.get(showInvoicesProject.id)?.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>REMAINING:</span>
                    <span style={{ 
                      color: (parseFloat(showInvoicesProject.budget.replace(/[^0-9.-]+/g,"")) || 0) >= 
                             (projectInvoices.get(showInvoicesProject.id)?.reduce((sum, inv) => sum + inv.total, 0) || 0)
                        ? '#39FF14' : '#FF6B6B'
                    }}>
                      ${((parseFloat(showInvoicesProject.budget.replace(/[^0-9.-]+/g,"")) || 0) - 
                         (projectInvoices.get(showInvoicesProject.id)?.reduce((sum, inv) => sum + inv.total, 0) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {projectInvoices.get(showInvoicesProject.id)?.map(inv => (
                  <div
                    key={inv.id}
                    className="aeonik-mono"
                    style={{
                      padding: "15px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${inv.status === 'paid' ? 'rgba(57, 255, 20, 0.3)' : 
                              inv.status === 'overdue' ? 'rgba(255, 107, 107, 0.3)' : 
                              'rgba(255, 215, 0, 0.3)'}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", color: "#FFF", marginBottom: "5px" }}>
                        {inv.invoiceNumber}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                        {new Date(inv.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", color: "#FFF", marginBottom: "5px" }}>
                        ${inv.total.toFixed(2)}
                      </div>
                      <div style={{ 
                        fontSize: "10px", 
                        padding: "3px 8px",
                        background: inv.status === 'paid' ? 'rgba(57, 255, 20, 0.1)' : 
                                   inv.status === 'overdue' ? 'rgba(255, 107, 107, 0.1)' : 
                                   'rgba(255, 215, 0, 0.1)',
                        color: inv.status === 'paid' ? '#39FF14' : 
                               inv.status === 'overdue' ? '#FF6B6B' : '#FFD700',
                      }}>
                        {inv.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.95)",
              zIndex: 10001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddModal(false)
                setEditingProject(null)
              }
            }}
          >
            <div
              style={{
                background: "#000",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0px",
                padding: "40px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflow: "auto"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="aeonik-mono" style={{ fontSize: "20px", color: "#FFF", marginBottom: "30px" }}>
                {editingProject ? "EDIT PROJECT" : "ADD PROJECT"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                    PROJECT NAME *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                    placeholder="PROJECT NAME"
                  />
                </div>

                <div>
                  <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                    PROJECT CODE (6 LETTERS)
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={formData.projectCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectCode: e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase(),
                      })
                    }
                    placeholder="ABCDEF"
                  />
                </div>

                <div>
                  <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                    DESCRIPTION
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value.toUpperCase() })}
                    placeholder="PROJECT DESCRIPTION"
                    className="aeonik-mono"
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#FFF",
                      fontSize: "12px",
                      minHeight: "100px",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                      CATEGORY *
                    </label>
                    <DropdownMenu
                      value={formData.category}
                      onChange={(value) => setFormData({ ...formData, category: value })}
                      options={categories.length > 0 
                        ? categories.map(cat => ({ value: cat.slug, label: cat.name.toUpperCase() }))
                        : [{ value: "", label: "NO CATEGORIES AVAILABLE" }]
                      }
                    />
                    {categories.length === 0 && (
                      <p className="aeonik-mono" style={{ fontSize: "10px", color: "#FFD700", marginTop: "5px" }}>
                        ADD CATEGORIES IN PROJECT CATEGORIES TAB
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                      STATUS *
                    </label>
                    <DropdownMenu
                      value={formData.status}
                      onChange={(value) => setFormData({ ...formData, status: value as Project["status"] })}
                      options={[
                        { value: "pending", label: "PENDING" },
                        { value: "active", label: "ACTIVE" },
                        { value: "on-hold", label: "ON-HOLD" },
                        { value: "completed", label: "COMPLETED" }
                      ]}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                      START DATE *
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                      DEADLINE *
                    </label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                      PROGRESS (%)
                    </label>
                    <Input
                      type="number"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                      BUDGET
                    </label>
                    <Input
                      type="text"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="$0,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "8px", display: "block" }}>
                    TEAM MEMBERS (COMMA SEPARATED)
                  </label>
                  <Input
                    type="text"
                    value={teamInput}
                    onChange={(e) => {
                      const raw = e.target.value
                      setTeamInput(raw)
                      const members = raw
                        .split(",")
                        .map((m) => m.trim())
                        .filter((m) => m.length > 0)
                        .map((m) => m.toUpperCase())
                      setFormData({ ...formData, team: members })
                    }}
                    placeholder="JOHN DOE, JANE SMITH"
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button
                    onClick={() => {
                      playClickSound()
                      handleSaveProject()
                    }}
                    className="aeonik-mono"
                    style={{
                      padding: "12px 24px",
                      background: "#39FF14",
                      color: "#000",
                      border: "1px solid #39FF14",
                      borderRadius: "0px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "1px",
                      flex: 1
                    }}
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      setShowAddModal(false)
                      setEditingProject(null)
                      setTeamInput("")
                    }}
                    className="aeonik-mono"
                    style={{
                      padding: "12px 24px",
                      background: "transparent",
                      color: "#FFF",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "0px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "1px",
                      flex: 1
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Tasks Modal */}
    {tasksProject && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          zIndex: 10002,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setTasksProject(null)
            setTasks([])
            setTasksError(null)
            resetTaskForm()
          }
        }}
      >
        <div
          style={{
            background: "#000",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "0px",
            width: "100%",
            maxWidth: "1200px",
            maxHeight: "90vh",
            overflow: "auto",
            padding: "36px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h3 className="aeonik-mono" style={{ fontSize: "20px", color: "#FFF", marginBottom: "6px" }}>
                TASKS – {tasksProject!.name}
              </h3>
              {tasksProject!.projectCode && (
                <div
                  className="aeonik-mono"
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: "3px",
                  }}
                >
                  {tasksProject!.projectCode}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                playClickSound()
                setTasksProject(null)
                setTasks([])
                setTasksError(null)
                resetTaskForm()
              }}
              className="aeonik-mono"
              style={{
                padding: "6px 12px",
                borderRadius: "0px",
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

          {/* Add Task */}
          <div
            style={{
              marginBottom: "25px",
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "10px" }}>
              ADD TASK
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) repeat(2, minmax(0, 1fr))",
                gap: "12px",
                marginBottom: "10px",
              }}
            >
              <Input
                type="text"
                placeholder="TASK TITLE"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value.toUpperCase())}
              />
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
              />
              <DropdownMenu
                value={newTaskStatus}
                onChange={(v) => setNewTaskStatus(v as Task["status"])}
                options={[
                  { value: "todo", label: "TODO" },
                  { value: "in-progress", label: "IN PROGRESS" },
                  { value: "done", label: "DONE" },
                ]}
              />
            </div>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value.toUpperCase())}
              placeholder="TASK DESCRIPTION"
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#FFF",
                fontSize: "12px",
                minHeight: "60px",
                marginBottom: "10px",
              }}
            />
            <button
              onClick={() => {
                playClickSound()
                addTask()
              }}
              disabled={!newTaskTitle}
              className="aeonik-mono"
              style={{
                padding: "10px 20px",
                borderRadius: "0px",
                border: "1px solid #39FF14",
                background: "#39FF14",
                color: "#000",
                fontSize: "12px",
                letterSpacing: "1px",
                cursor: newTaskTitle ? "pointer" : "not-allowed",
              }}
            >
              SAVE TASK
            </button>
          </div>

          {/* Tasks List */}
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
              No tasks yet for this project.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)",
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
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <DropdownMenu
                      value={task.status}
                      onChange={(v) => updateTaskStatus(task.id, v as Task["status"])}
                      options={[
                        { value: "todo", label: "TODO" },
                        { value: "in-progress", label: "IN PROGRESS" },
                        { value: "done", label: "DONE" },
                      ]}
                    />
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="aeonik-mono"
                      style={{
                        fontSize: "10px",
                        padding: "4px 8px",
                        borderRadius: "0px",
                        border: "1px solid #FF6B6B",
                        background: "transparent",
                        color: "#FF6B6B",
                        letterSpacing: "1px",
                      }}
                    >
                      DELETE
                    </button>
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

export default ClientProjectsAdmin
