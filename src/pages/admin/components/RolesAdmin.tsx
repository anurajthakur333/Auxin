import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Role {
  _id?: string
  name: string
  description?: string
  isActive: boolean
}

const RolesAdmin = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Role>({
    name: "",
    description: "",
    isActive: true,
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setMessage({ type: "error", text: "ADMIN AUTHENTICATION REQUIRED" })
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/roles`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: "FAILED TO FETCH ROLES" }))
        setMessage({ type: "error", text: errorData.error || `HTTP ERROR! STATUS: ${response.status}` })
        setRoles([])
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error)
      setMessage({ type: "error", text: error instanceof Error ? error.message : "NETWORK ERROR" })
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      name: "",
      description: "",
      isActive: true,
    })
  }

  const handleEdit = (role: Role) => {
    playClickSound()
    setEditingId(role._id || null)
    setFormData({
      name: role.name,
      description: role.description || "",
      isActive: role.isActive,
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

      const url = editingId
        ? `${API_BASE_URL}/api/admin/roles/${editingId}`
        : `${API_BASE_URL}/api/admin/roles`

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
        setMessage({ type: "success", text: editingId ? "ROLE UPDATED" : "ROLE CREATED" })
        resetForm()
        fetchRoles()
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
    if (!roleToDelete?._id) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/roles/${roleToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "ROLE DELETED" })
        setRoleToDelete(null)
        fetchRoles()
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

  const toggleActive = async (role: Role) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/roles/${role._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ...role, isActive: !role.isActive }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: role.isActive ? "ROLE DEACTIVATED" : "ROLE ACTIVATED" })
        fetchRoles()
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Failed to toggle role:", error)
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
          {"ROLES"}
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
          {"+ ADD ROLE"}
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
              {editingId ? "EDIT ROLE" : "NEW ROLE"}
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

          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"NAME *"}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              placeholder="MANAGER"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"DESCRIPTION"}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Role description..."
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
            {editingId ? "UPDATE ROLE" : "CREATE ROLE"}
          </button>
        </div>
      )}

      {/* Roles List */}
      {loading ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"LOADING..."}
        </p>
      ) : roles.length === 0 ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"NO ROLES FOUND"}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {roles.map((role) => (
            <div
              key={role._id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${role.isActive ? "#39FF14" : "rgba(255, 255, 255, 0.1)"}`,
                padding: "25px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#FFF", fontWeight: 600, marginBottom: "5px" }}>
                    {role.name}
                  </h3>
                  {role.description && (
                    <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "5px" }}>
                      {role.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    playClickSound()
                    toggleActive(role)
                  }}
                  className="aeonik-mono"
                  style={{
                    padding: "6px 12px",
                    background: role.isActive ? "rgba(57, 255, 20, 0.1)" : "transparent",
                    border: `1px solid ${role.isActive ? "#39FF14" : "rgba(255, 0, 0, 0.3)"}`,
                    color: role.isActive ? "#39FF14" : "#FF0000",
                    fontSize: "10px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                >
                  {role.isActive ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleEdit(role)}
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
                    setRoleToDelete(role)
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
      {roleToDelete && (
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
          onClick={() => setRoleToDelete(null)}
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
              {"DELETE ROLE?"}
            </h3>
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "25px" }}>
              {`ARE YOU SURE YOU WANT TO DELETE "${roleToDelete.name}"? THIS ACTION CANNOT BE UNDONE.`}
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => {
                  playClickSound()
                  setRoleToDelete(null)
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

export default RolesAdmin

