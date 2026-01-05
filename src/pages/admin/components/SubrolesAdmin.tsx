import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Subrole {
  _id?: string
  name: string
  description?: string
  role: string
  isActive: boolean
}

interface Role {
  _id: string
  name: string
  description?: string
}

const SubrolesAdmin = () => {
  const [subroles, setSubroles] = useState<Subrole[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [rolesLoading, setRolesLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Subrole>({
    name: "",
    description: "",
    role: "",
    isActive: true,
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [subroleToDelete, setSubroleToDelete] = useState<Subrole | null>(null)
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  useEffect(() => {
    fetchSubroles()
    fetchRoles()
  }, [])

  const fetchSubroles = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setMessage({ type: "error", text: "ADMIN AUTHENTICATION REQUIRED" })
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/subroles`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubroles(data.subroles || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: "FAILED TO FETCH SUBROLES" }))
        setMessage({ type: "error", text: errorData.error || `HTTP ERROR! STATUS: ${response.status}` })
        setSubroles([])
      }
    } catch (error) {
      console.error("Failed to fetch subroles:", error)
      setMessage({ type: "error", text: error instanceof Error ? error.message : "NETWORK ERROR" })
      setSubroles([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      setRolesLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/roles/public`)
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles || [])
      } else {
        console.error("Failed to fetch roles")
        setRoles([])
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      setRoles([])
    } finally {
      setRolesLoading(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      name: "",
      description: "",
      role: "",
      isActive: true,
    })
  }

  const handleEdit = (subrole: Subrole) => {
    playClickSound()
    setEditingId(subrole._id || null)
    setFormData({
      name: subrole.name,
      description: subrole.description || "",
      role: subrole.role || "",
      isActive: subrole.isActive,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      // Validate required fields
      if (!formData.name.trim()) {
        setMessage({ type: "error", text: "NAME IS REQUIRED" })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      if (!formData.role || !formData.role.trim()) {
        setMessage({ type: "error", text: "ROLE IS REQUIRED" })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const url = editingId
        ? `${API_BASE_URL}/api/admin/subroles/${editingId}`
        : `${API_BASE_URL}/api/admin/subroles`

      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: "success", text: editingId ? "SUBROLE UPDATED" : "SUBROLE CREATED" })
        resetForm()
        fetchSubroles()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: "error", text: errorData.error || "FAILED TO SAVE" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Save error:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDelete = async () => {
    if (!subroleToDelete?._id) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/subroles/${subroleToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "SUBROLE DELETED" })
        setSubroleToDelete(null)
        fetchSubroles()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: "error", text: errorData.error || "FAILED TO DELETE" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Delete error:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const toggleActive = async (subrole: Subrole) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/subroles/${subrole._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ...subrole, isActive: !subrole.isActive }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: subrole.isActive ? "SUBROLE DEACTIVATED" : "SUBROLE ACTIVATED" })
        fetchSubroles()
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Failed to toggle subrole:", error)
    }
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2
          className="aeonik-mono"
          style={{
            fontSize: "24px",
            color: "#FFF",
            fontWeight: 600,
            letterSpacing: "-1px",
          }}
        >
          {"SUBROLES"}
        </h2>
        <button
          onClick={() => {
            playClickSound()
            resetForm()
            setShowForm(true)
          }}
          className="aeonik-mono"
          style={{
            padding: "10px 20px",
            background: "#39FF14",
            border: "1px solid #39FF14",
            color: "#000",
            fontSize: "12px",
            cursor: "pointer",
            letterSpacing: "1px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2ecc11"
            e.currentTarget.style.borderColor = "#2ecc11"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#39FF14"
            e.currentTarget.style.borderColor = "#39FF14"
          }}
        >
          {"+ ADD SUBROLE"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className="aeonik-mono"
          style={{
            padding: "15px 20px",
            marginBottom: "20px",
            background: message.type === "success" ? "rgba(57, 255, 20, 0.1)" : "rgba(255, 0, 0, 0.1)",
            border: `1px solid ${message.type === "success" ? "#39FF14" : "#FF0000"}`,
            color: message.type === "success" ? "#39FF14" : "#FF0000",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "30px",
            marginBottom: "30px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
            <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#FFF", fontWeight: 600 }}>
              {editingId ? "EDIT SUBROLE" : "NEW SUBROLE"}
            </h3>
            <button
              onClick={() => {
                playClickSound()
                resetForm()
              }}
              className="aeonik-mono"
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#FFF",
                fontSize: "11px",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
            >
              {"CANCEL"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"NAME *"}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                placeholder="SENIOR MANAGER"
              />
            </div>

            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"CONNECT TO ROLE *"}
              </label>
              {rolesLoading ? (
                <div className="aeonik-mono" style={{ padding: "8px 12px", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                  {"LOADING ROLES..."}
                </div>
              ) : roles.length === 0 ? (
                <div className="aeonik-mono" style={{ padding: "8px 12px", color: "#FF0000", fontSize: "12px" }}>
                  {"NO ROLES AVAILABLE. CREATE ROLES FIRST."}
                </div>
              ) : (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="aeonik-mono"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFF",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <option value="" style={{ background: "#000" }}>
                    {"SELECT ROLE"}
                  </option>
                  {roles.map((role) => (
                    <option key={role._id} value={role.name} style={{ background: "#000" }}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"DESCRIPTION"}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Subrole description..."
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "12px 15px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFF",
                fontSize: "14px",
                minHeight: "80px",
                resize: "vertical",
              }}
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ cursor: "pointer", width: "18px", height: "18px" }}
            />
            <span className="aeonik-mono" style={{ fontSize: "12px", color: "#FFF" }}>
              {"ACTIVE"}
            </span>
          </label>

          <button
            onClick={() => {
              playClickSound()
              handleSave()
            }}
            className="aeonik-mono"
            style={{
              padding: "12px 30px",
              background: "#39FF14",
              border: "1px solid #39FF14",
              color: "#000",
              fontSize: "12px",
              cursor: "pointer",
              letterSpacing: "1px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2ecc11"
              e.currentTarget.style.borderColor = "#2ecc11"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#39FF14"
              e.currentTarget.style.borderColor = "#39FF14"
            }}
          >
            {editingId ? "UPDATE SUBROLE" : "CREATE SUBROLE"}
          </button>
        </div>
      )}

      {/* Subroles List */}
      {loading ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"LOADING..."}
        </p>
      ) : subroles.length === 0 ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"NO SUBROLES FOUND"}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {subroles.map((subrole) => (
            <div
              key={subrole._id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${subrole.isActive ? "#39FF14" : "rgba(255, 255, 255, 0.1)"}`,
                padding: "25px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#FFF", fontWeight: 600, marginBottom: "5px" }}>
                    {subrole.name}
                  </h3>
                  {subrole.role && (
                    <p className="aeonik-mono" style={{ fontSize: "11px", color: "#39FF14", marginTop: "5px", marginBottom: "5px" }}>
                      {"CONNECTED TO: "}{subrole.role}
                    </p>
                  )}
                  {subrole.description && (
                    <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "5px" }}>
                      {subrole.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    playClickSound()
                    toggleActive(subrole)
                  }}
                  className="aeonik-mono"
                  style={{
                    padding: "6px 12px",
                    background: subrole.isActive ? "rgba(57, 255, 20, 0.1)" : "transparent",
                    border: `1px solid ${subrole.isActive ? "#39FF14" : "rgba(255, 0, 0, 0.3)"}`,
                    color: subrole.isActive ? "#39FF14" : "#FF0000",
                    fontSize: "10px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                >
                  {subrole.isActive ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleEdit(subrole)}
                  className="aeonik-mono"
                  style={{
                    flex: 1,
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#FFF",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#39FF14"
                    e.currentTarget.style.color = "#39FF14"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"
                    e.currentTarget.style.color = "#FFF"
                  }}
                >
                  {"EDIT"}
                </button>
                <button
                  onClick={() => {
                    playClickSound()
                    setSubroleToDelete(subrole)
                  }}
                  className="aeonik-mono"
                  style={{
                    flex: 1,
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid rgba(255, 0, 0, 0.3)",
                    color: "#FF0000",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 0, 0, 0.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  {"DELETE"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {subroleToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setSubroleToDelete(null)}
        >
          <div
            style={{
              background: "#111",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "30px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="aeonik-mono" style={{ fontSize: "16px", color: "#FFF", marginBottom: "15px" }}>
              {"DELETE SUBROLE?"}
            </h3>
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "25px" }}>
              {`ARE YOU SURE YOU WANT TO DELETE "${subroleToDelete.name}"? THIS ACTION CANNOT BE UNDONE.`}
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => {
                  playClickSound()
                  setSubroleToDelete(null)
                }}
                className="aeonik-mono"
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#FFF",
                  fontSize: "12px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"CANCEL"}
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  handleDelete()
                }}
                className="aeonik-mono"
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1px solid #FF0000",
                  color: "#FF0000",
                  fontSize: "12px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 0, 0, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                {"DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubrolesAdmin

