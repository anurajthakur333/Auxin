import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Employee {
  _id?: string
  name: string
  email: string
  password?: string
  role: string
  isActive: boolean
}

interface Role {
  _id: string
  name: string
  description?: string
}

const EmployeesAdmin = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [rolesLoading, setRolesLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Employee & { password?: string }>({
    name: "",
    email: "",
    password: "",
    role: "",
    isActive: true,
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [showPassword, setShowPassword] = useState(true) // Default to showing password for admin convenience
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  useEffect(() => {
    fetchEmployees()
    fetchRoles()
  }, [])


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

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setMessage({ type: "error", text: "ADMIN AUTHENTICATION REQUIRED" })
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/employees`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: "FAILED TO FETCH EMPLOYEES" }))
        setMessage({ type: "error", text: errorData.error || `HTTP ERROR! STATUS: ${response.status}` })
        setEmployees([])
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      setMessage({ type: "error", text: error instanceof Error ? error.message : "NETWORK ERROR" })
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employee: Employee) => {
    playClickSound()
    setEditingId(employee._id || null)
    setShowPassword(true) // Show password field when editing (admin can type new password and see it)
    setFormData({
      name: employee.name,
      email: employee.email,
      password: employee.password || "", // Pre-fill with decrypted password if available
      role: employee.role,
      isActive: employee.isActive,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setShowPassword(true) // Reset to showing password when creating new employee
    setFormData({
      name: "",
      email: "",
      password: "",
      role: roles.length > 0 ? roles[0].name : "",
      isActive: true,
    })
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

      if (!formData.email.trim()) {
        setMessage({ type: "error", text: "EMAIL IS REQUIRED" })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
      if (!emailRegex.test(formData.email)) {
        setMessage({ type: "error", text: "INVALID EMAIL FORMAT" })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      // Validate role
      if (!formData.role || !formData.role.trim()) {
        setMessage({ type: "error", text: "ROLE IS REQUIRED" })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      // Validate password for new employees
      if (!editingId && (!formData.password || formData.password.length < 6)) {
        setMessage({ type: "error", text: "PASSWORD MUST BE AT LEAST 6 CHARACTERS" })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const url = editingId
        ? `${API_BASE_URL}/api/admin/employees/${editingId}`
        : `${API_BASE_URL}/api/admin/employees`

      const method = editingId ? "PUT" : "POST"

      const requestBody: any = {
        name: formData.name.toUpperCase(),
        email: formData.email.toLowerCase(),
        role: formData.role,
        isActive: formData.isActive,
      }

      // Only include password if it's provided (for new employees or when updating)
      // NOTE: Employee passwords are stored as PLAIN TEXT (not encrypted/hashed)
      // Backend should save password as-is without any hashing
      if (formData.password && formData.password.length > 0) {
        requestBody.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        setMessage({ type: "success", text: editingId ? "EMPLOYEE UPDATED" : "EMPLOYEE CREATED" })
        resetForm()
        fetchEmployees()
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
    if (!employeeToDelete?._id) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/employees/${employeeToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "EMPLOYEE DELETED" })
        setEmployeeToDelete(null)
        fetchEmployees()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: "error", text: "FAILED TO DELETE" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Delete error:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const toggleActive = async (employee: Employee) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/employees/${employee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ...employee, isActive: !employee.isActive }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: employee.isActive ? "EMPLOYEE DEACTIVATED" : "EMPLOYEE ACTIVATED" })
        fetchEmployees()
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Failed to toggle employee:", error)
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
          {"EMPLOYEES"}
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
          {"+ ADD EMPLOYEE"}
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
              {editingId ? "EDIT EMPLOYEE" : "NEW EMPLOYEE"}
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
                placeholder="JOHN DOE"
              />
            </div>

            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"EMAIL *"}
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block" }}>
                  {editingId ? "PASSWORD (LEAVE BLANK TO KEEP CURRENT)" : "PASSWORD *"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound()
                    setShowPassword(!showPassword)
                  }}
                  className="aeonik-mono"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: "10px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    padding: "4px 8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#39FF14"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"
                  }}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="MINIMUM 6 CHARACTERS"
              />
            </div>

            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"ROLE *"}
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
                  {roles.map((role) => (
                    <option key={role._id} value={role.name} style={{ background: "#000" }}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
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
            {editingId ? "UPDATE EMPLOYEE" : "CREATE EMPLOYEE"}
          </button>
        </div>
      )}

      {/* Employees List */}
      {loading ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"LOADING..."}
        </p>
      ) : employees.length === 0 ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"NO EMPLOYEES FOUND"}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {employees.map((employee) => (
            <div
              key={employee._id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${employee.isActive ? "#39FF14" : "rgba(255, 255, 255, 0.1)"}`,
                padding: "25px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#FFF", fontWeight: 600, marginBottom: "5px" }}>
                    {employee.name}
                  </h3>
                  <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
                    {employee.email}
                  </p>
                  {employee.password && (
                    <p className="aeonik-mono" style={{ fontSize: "11px", color: "#39FF14", marginBottom: "8px", wordBreak: "break-all" }}>
                      {"PASSWORD: "}{employee.password}
                    </p>
                  )}
                  <span
                    className="aeonik-mono"
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      fontSize: "10px",
                      color: "#39FF14",
                      background: "rgba(57, 255, 20, 0.1)",
                      border: "1px solid #39FF14",
                      letterSpacing: "1px",
                    }}
                  >
                    {employee.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    playClickSound()
                    toggleActive(employee)
                  }}
                  className="aeonik-mono"
                  style={{
                    padding: "6px 12px",
                    background: employee.isActive ? "rgba(57, 255, 20, 0.1)" : "transparent",
                    border: `1px solid ${employee.isActive ? "#39FF14" : "rgba(255, 0, 0, 0.3)"}`,
                    color: employee.isActive ? "#39FF14" : "#FF0000",
                    fontSize: "10px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                >
                  {employee.isActive ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  onClick={() => handleEdit(employee)}
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
                    setEmployeeToDelete(employee)
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
      {employeeToDelete && (
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
          onClick={() => setEmployeeToDelete(null)}
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
              {"DELETE EMPLOYEE?"}
            </h3>
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "25px" }}>
              {`ARE YOU SURE YOU WANT TO DELETE "${employeeToDelete.name}"? THIS ACTION CANNOT BE UNDONE.`}
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => {
                  playClickSound()
                  setEmployeeToDelete(null)
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

export default EmployeesAdmin


