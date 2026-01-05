import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface SalaryHistory {
  date: string
  amount: number
  currency: string
  reason?: string
  previousAmount: number
}

interface Employee {
  _id?: string
  employeeId?: string
  name: string
  email: string
  personalEmail?: string
  password?: string
  role: string
  subrole?: string
  age?: number
  location?: string
  joinedDate?: string
  videoProof?: string
  documentProof?: string
  salary?: number
  currency?: string
  salaryHistory?: SalaryHistory[]
  isActive: boolean
  isBanned?: boolean
  isVerified?: boolean
}

interface Role {
  _id: string
  name: string
  description?: string
}

interface Subrole {
  _id: string
  name: string
  description?: string
}

const EmployeesAdmin = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [subroles, setSubroles] = useState<Subrole[]>([])
  const [loading, setLoading] = useState(true)
  const [rolesLoading, setRolesLoading] = useState(true)
  const [subrolesLoading, setSubrolesLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Employee & { password?: string }>({
    name: "",
    employeeId: "",
    email: "",
    personalEmail: "",
    password: "",
    role: "",
    subrole: "",
    age: undefined,
    location: "",
    joinedDate: new Date().toISOString().split('T')[0],
    salary: undefined,
    currency: "USD",
    isActive: true,
    isBanned: false,
    isVerified: false,
  })
  const [employeeIdError, setEmployeeIdError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<{ type: 'video' | 'document'; url: string } | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [employeeToBan, setEmployeeToBan] = useState<Employee | null>(null)
  const [showSalaryHikeModal, setShowSalaryHikeModal] = useState(false)
  const [selectedEmployeeForHike, setSelectedEmployeeForHike] = useState<Employee | null>(null)
  const [salaryHikeData, setSalaryHikeData] = useState({ amount: "", currency: "USD", reason: "" })
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null)
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(true) // Default to showing password for admin convenience
  const playClickSound = useSound(clickSound, { volume: 0.3 })
  
  const currencies = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY", "SGD", "AED", "SAR", "PKR", "BDT", "LKR", "NPR", "MYR", "THB", "PHP", "IDR", "VND", "KRW", "HKD", "NZD", "ZAR", "BRL", "MXN"]

  // Convert number to words (for salary display)
  const numberToWords = (num: number): string => {
    if (num === 0) return "zero"
    if (num < 0) return "negative " + numberToWords(-num)
    
    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
    
    if (num < 20) return ones[num]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
    if (num < 1000) return ones[Math.floor(num / 100)] + " hundred" + (num % 100 ? " " + numberToWords(num % 100) : "")
    if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + " thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "")
    if (num < 1000000000) return numberToWords(Math.floor(num / 1000000)) + " million" + (num % 1000000 ? " " + numberToWords(num % 1000000) : "")
    return numberToWords(Math.floor(num / 1000000000)) + " billion" + (num % 1000000000 ? " " + numberToWords(num % 1000000000) : "")
  }

  // Validate employee ID format
  const validateEmployeeIdFormat = (id: string): boolean => {
    return /^[A-Z]{4}$/.test(id)
  }

  // Check if employee ID is duplicate
  const checkEmployeeIdDuplicate = async (id: string, excludeId?: string): Promise<boolean> => {
    if (!id || !validateEmployeeIdFormat(id)) return false
    
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return false

      const response = await fetch(`${API_BASE_URL}/api/admin/employees`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const duplicate = data.employees?.find((e: Employee) => 
          e.employeeId?.toUpperCase() === id.toUpperCase() && e._id !== excludeId
        )
        return !!duplicate
      }
    } catch (error) {
      console.error("Error checking employee ID:", error)
    }
    return false
  }

  useEffect(() => {
    fetchEmployees()
    fetchRoles()
    fetchSubroles() // Initial fetch without filter
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

  const fetchSubroles = async (roleFilter?: string) => {
    try {
      setSubrolesLoading(true)
      const url = roleFilter 
        ? `${API_BASE_URL}/api/subroles/public?role=${encodeURIComponent(roleFilter)}`
        : `${API_BASE_URL}/api/subroles/public`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setSubroles(data.subroles || [])
      } else {
        console.error("Failed to fetch subroles")
        setSubroles([])
      }
    } catch (error) {
      console.error("Error fetching subroles:", error)
      setSubroles([])
    } finally {
      setSubrolesLoading(false)
    }
  }

  // Refetch subroles when role changes
  useEffect(() => {
    if (formData.role) {
      fetchSubroles(formData.role)
    } else {
      setSubroles([]) // Clear subroles if no role selected
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role])

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
    setEmployeeIdError(null)
    setFormData({
      name: employee.name,
      employeeId: employee.employeeId || "",
      email: employee.email,
      personalEmail: employee.personalEmail || "",
      password: employee.password || "", // Pre-fill with decrypted password if available
      role: employee.role,
      subrole: employee.subrole || "",
      age: employee.age,
      location: employee.location || "",
      joinedDate: employee.joinedDate ? employee.joinedDate.split('T')[0] : new Date().toISOString().split('T')[0],
      salary: employee.salary,
      currency: employee.currency || "USD",
      videoProof: employee.videoProof,
      documentProof: employee.documentProof,
      isActive: employee.isActive,
      isBanned: employee.isBanned || false,
      isVerified: employee.isVerified || false,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setShowPassword(true) // Reset to showing password when creating new employee
    setEmployeeIdError(null)
    setFormData({
      name: "",
      employeeId: "",
      email: "",
      personalEmail: "",
      password: "",
      role: roles.length > 0 ? roles[0].name : "",
      subrole: "",
      age: undefined,
      location: "",
      joinedDate: new Date().toISOString().split('T')[0],
      salary: undefined,
      currency: "USD",
      isActive: true,
      isBanned: false,
      isVerified: false,
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

      // Validate employee ID
      if (!formData.employeeId || !formData.employeeId.trim()) {
        setMessage({ type: "error", text: "EMPLOYEE ID IS REQUIRED" })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      if (!validateEmployeeIdFormat(formData.employeeId.toUpperCase())) {
        setMessage({ type: "error", text: "EMPLOYEE ID MUST BE EXACTLY 4 CAPITAL LETTERS" })
        setEmployeeIdError("MUST BE EXACTLY 4 CAPITAL LETTERS")
        setTimeout(() => setMessage(null), 3000)
        return
      }

      // Check for duplicate employee ID
      const isDuplicate = await checkEmployeeIdDuplicate(formData.employeeId.toUpperCase(), editingId || undefined)
      if (isDuplicate) {
        setMessage({ type: "error", text: "EMPLOYEE ID ALREADY EXISTS" })
        setEmployeeIdError("EMPLOYEE ID ALREADY EXISTS")
        setTimeout(() => setMessage(null), 3000)
        return
      }

      setEmployeeIdError(null)

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
        employeeId: formData.employeeId.toUpperCase(),
        name: formData.name.toUpperCase(),
        email: formData.email.toLowerCase(),
        personalEmail: formData.personalEmail || undefined,
        role: formData.role,
        subrole: formData.subrole || "",
        age: formData.age,
        location: formData.location || undefined,
        joinedDate: formData.joinedDate,
        salary: formData.salary,
        currency: formData.currency || "USD",
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

  const handleBan = async () => {
    if (!employeeToBan?._id) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/employees/${employeeToBan._id}/ban`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "EMPLOYEE BANNED" })
        setEmployeeToBan(null)
        fetchEmployees()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: "error", text: errorData.error || "FAILED TO BAN EMPLOYEE" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Ban error:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleUnban = async (employee: Employee) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/employees/${employee._id}/unban`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "EMPLOYEE UNBANNED" })
        fetchEmployees()
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Unban error:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleVerify = async (employee: Employee) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const endpoint = employee.isVerified ? 'unverify' : 'verify'
      const response = await fetch(`${API_BASE_URL}/api/admin/employees/${employee._id}/${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: employee.isVerified ? "EMPLOYEE UNVERIFIED" : "EMPLOYEE VERIFIED" })
        fetchEmployees()
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Verify error:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleSalaryHike = async () => {
    if (!selectedEmployeeForHike?._id) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      if (!salaryHikeData.amount || isNaN(parseFloat(salaryHikeData.amount))) {
        setMessage({ type: "error", text: "VALID AMOUNT IS REQUIRED" })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/employees/${selectedEmployeeForHike._id}/salary-hike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          amount: parseFloat(salaryHikeData.amount),
          currency: salaryHikeData.currency,
          reason: salaryHikeData.reason || "",
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "SALARY HIKE RECORDED" })
        setShowSalaryHikeModal(false)
        setSelectedEmployeeForHike(null)
        setSalaryHikeData({ amount: "", currency: "USD", reason: "" })
        fetchEmployees()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: "error", text: errorData.error || "FAILED TO RECORD SALARY HIKE" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Salary hike error:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleFileUpload = async (employeeId: string, file: File, type: 'video' | 'document') => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      if (type === 'video') {
        setUploadingVideo(employeeId)
      } else {
        setUploadingDocument(employeeId)
      }

      const formData = new FormData()
      formData.append(type === 'video' ? 'video' : 'document', file)

      const response = await fetch(
        `${API_BASE_URL}/api/admin/employees/${employeeId}/upload-${type}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          body: formData,
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: "success", text: `${type.toUpperCase()} UPLOADED SUCCESSFULLY` })
        
        // Update formData if we're currently editing this employee
        if (editingId === employeeId) {
          if (type === 'video' && data.videoProof) {
            setFormData(prev => ({ ...prev, videoProof: data.videoProof }))
          } else if (type === 'document' && data.documentProof) {
            setFormData(prev => ({ ...prev, documentProof: data.documentProof }))
          }
        }
        
        // Refresh the employees list to show updated data
        fetchEmployees()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: "error", text: errorData.error || `FAILED TO UPLOAD ${type.toUpperCase()}` })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error(`Upload ${type} error:`, error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      if (type === 'video') {
        setUploadingVideo(null)
      } else {
        setUploadingDocument(null)
      }
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

          {/* Employee ID - Manual Input */}
          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"EMPLOYEE ID * (4 CAPITAL LETTERS)"}
            </label>
            <Input
              value={formData.employeeId || ""}
              onChange={async (e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)
                setFormData({ ...formData, employeeId: value })
                setEmployeeIdError(null)
                
                if (value.length === 4) {
                  const isDuplicate = await checkEmployeeIdDuplicate(value, editingId || undefined)
                  if (isDuplicate) {
                    setEmployeeIdError("EMPLOYEE ID ALREADY EXISTS")
                  }
                }
              }}
              placeholder="ABCD"
              maxLength={4}
              style={{
                textTransform: "uppercase",
                ...(employeeIdError ? { borderColor: "#FF0000" } : {})
              }}
            />
            {employeeIdError && (
              <p className="aeonik-mono" style={{ fontSize: "10px", color: "#FF0000", marginTop: "5px" }}>
                {employeeIdError}
              </p>
            )}
            {formData.employeeId && formData.employeeId.length === 4 && !employeeIdError && (
              <p className="aeonik-mono" style={{ fontSize: "10px", color: "#39FF14", marginTop: "5px" }}>
                {"✓ VALID"}
              </p>
            )}
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
                {"PERSONAL EMAIL"}
              </label>
              <Input
                type="email"
                value={formData.personalEmail || ""}
                onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value.toLowerCase() })}
                placeholder="personal@example.com"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"AGE"}
                </label>
              <Input
                type="number"
                value={formData.age || ""}
                onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="25"
                min="18"
                max="100"
              />
            </div>

            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"LOCATION"}
              </label>
              <Input
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="New York, USA"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"JOINED DATE"}
              </label>
              <Input
                type="date"
                value={formData.joinedDate || ""}
                onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
              />
            </div>

          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"SALARY"}
              </label>
              <Input
                type="number"
                value={formData.salary || ""}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="50000"
                min="0"
                step="0.01"
              />
              {formData.salary && formData.salary > 0 && (
                <p className="aeonik-mono" style={{ fontSize: "10px", color: "#39FF14", marginTop: "5px" }}>
                  {numberToWords(Math.floor(formData.salary))} {formData.currency || "USD"}
                </p>
              )}
            </div>

            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"CURRENCY"}
              </label>
              <select
                value={formData.currency || "USD"}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
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
                {currencies.map((curr) => (
                  <option key={curr} value={curr} style={{ background: "#000" }}>
                    {curr}
                  </option>
                ))}
              </select>
              </div>
            </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
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
                  onChange={(e) => {
                    setFormData({ ...formData, role: e.target.value, subrole: "" }) // Clear subrole when role changes
                  }}
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

          <div style={{ marginBottom: "20px" }}>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"SUBROLE"}
              </label>
              {!formData.role ? (
                <div className="aeonik-mono" style={{ padding: "8px 12px", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                  {"SELECT A ROLE FIRST TO SEE AVAILABLE SUBROLES"}
                </div>
              ) : subrolesLoading ? (
                <div className="aeonik-mono" style={{ padding: "8px 12px", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                  {"LOADING SUBROLES..."}
                </div>
              ) : subroles.length === 0 ? (
                <div className="aeonik-mono" style={{ padding: "8px 12px", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                  {"NO SUBROLES AVAILABLE FOR THIS ROLE. CREATE SUBROLES IN SUBROLES PANEL."}
                </div>
              ) : (
                <select
                  value={formData.subrole || ""}
                  onChange={(e) => setFormData({ ...formData, subrole: e.target.value })}
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
                    {"NONE"}
                  </option>
                  {subroles.map((subrole) => (
                    <option key={subrole._id} value={subrole.name} style={{ background: "#000" }}>
                      {subrole.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {editingId && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                  {"VIDEO PROOF"}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && editingId) {
                      handleFileUpload(editingId, file, 'video')
                    }
                  }}
                  className="aeonik-mono"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFF",
                    fontSize: "12px",
                    cursor: "pointer",
                    marginBottom: "8px",
                  }}
                  disabled={uploadingVideo === editingId}
                />
                {uploadingVideo === editingId && (
                  <p className="aeonik-mono" style={{ fontSize: "10px", color: "#39FF14", marginBottom: "8px" }}>
                    {"UPLOADING..."}
                  </p>
                )}
                {formData.videoProof && (
                  <div style={{ marginTop: "8px" }}>
                    <p className="aeonik-mono" style={{ fontSize: "10px", color: "#39FF14", marginBottom: "8px" }}>
                      {"CURRENT: "}{formData.videoProof.split('/').pop() || "Video File"}
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          playClickSound()
                          setPreviewUrl({ type: 'video', url: formData.videoProof! })
                        }}
                        className="aeonik-mono"
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          border: "1px solid #39FF14",
                          color: "#39FF14",
                          fontSize: "9px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                        }}
                      >
                        {"PREVIEW"}
                      </button>
                      <a
                        href={formData.videoProof}
                        download
                        className="aeonik-mono"
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          color: "#FFF",
                          fontSize: "9px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        {"DOWNLOAD"}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                  {"DOCUMENT PROOF"}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && editingId) {
                      handleFileUpload(editingId, file, 'document')
                    }
                  }}
                  className="aeonik-mono"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFF",
                    fontSize: "12px",
                    cursor: "pointer",
                    marginBottom: "8px",
                  }}
                  disabled={uploadingDocument === editingId}
                />
                {uploadingDocument === editingId && (
                  <p className="aeonik-mono" style={{ fontSize: "10px", color: "#39FF14", marginBottom: "8px" }}>
                    {"UPLOADING..."}
                  </p>
                )}
                {formData.documentProof && (
                  <div style={{ marginTop: "8px" }}>
                    <p className="aeonik-mono" style={{ fontSize: "10px", color: "#39FF14", marginBottom: "8px" }}>
                      {"CURRENT: "}{formData.documentProof.split('/').pop() || "Document File"}
                    </p>
                    {/* Show image thumbnail if it's an image */}
                    {(() => {
                      const url = formData.documentProof.toLowerCase()
                      const hasImageExt = url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i)
                      const isCloudinaryImage = url.includes('cloudinary.com') && (url.includes('/image/upload/') || hasImageExt)
                      const isImage = hasImageExt || isCloudinaryImage
                      
                      if (isImage) {
                        // For Cloudinary images, ensure proper format
                        let imageUrl = formData.documentProof
                        if (url.includes('cloudinary.com')) {
                          // If it's a raw upload but has image extension, convert to image
                          if (url.includes('/raw/upload/') && hasImageExt) {
                            imageUrl = formData.documentProof.replace('/raw/upload/', '/image/upload/f_auto,q_auto/')
                          } else if (url.includes('/image/upload/') && !url.includes('/f_')) {
                            imageUrl = formData.documentProof.replace('/upload/', '/upload/f_auto,q_auto/')
                          }
                        }
                        
                        return (
                          <div style={{ marginBottom: "8px" }}>
                            <img
                              src={imageUrl}
                              alt="Document Preview"
                              style={{
                                maxWidth: "200px",
                                maxHeight: "150px",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius: "4px",
                                objectFit: "contain",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                playClickSound()
                                setPreviewUrl({ type: 'document', url: formData.documentProof! })
                              }}
                              onError={(e) => {
                                // If image fails, try original URL
                                if (formData.documentProof && e.currentTarget.src !== formData.documentProof) {
                                  e.currentTarget.src = formData.documentProof
                                }
                              }}
                            />
                            <p className="aeonik-mono" style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", marginTop: "4px", textAlign: "center" }}>
                              {"CLICK TO PREVIEW FULL SIZE"}
                            </p>
                          </div>
                        )
                      }
                      return null
                    })()}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          playClickSound()
                          setPreviewUrl({ type: 'document', url: formData.documentProof! })
                        }}
                        className="aeonik-mono"
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          border: "1px solid #39FF14",
                          color: "#39FF14",
                          fontSize: "9px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                        }}
                      >
                        {"PREVIEW"}
                      </button>
                      <a
                        href={formData.documentProof}
                        download={formData.documentProof ? formData.documentProof.split('/').pop()?.split('?')[0] || 'document' : 'document'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aeonik-mono"
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          color: "#FFF",
                          fontSize: "9px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        {"DOWNLOAD"}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* Email and Password at Bottom */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px", marginTop: "20px", marginBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              <div>
                <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                  {"ADMIN EMAIL * (FOR LOGIN)"}
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                  placeholder="admin@example.com"
                />
              </div>

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
            </div>
          </div>

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

      {/* Employees Table */}
      {loading ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"LOADING..."}
        </p>
      ) : employees.length === 0 ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"NO EMPLOYEES FOUND"}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            className="aeonik-mono"
              style={{
              width: "100%",
              borderCollapse: "collapse",
                background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <thead>
              <tr style={{ background: "rgba(57, 255, 20, 0.1)", borderBottom: "2px solid #39FF14" }}>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"ID"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"NAME"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"EMAIL"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"PASSWORD"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"ROLE"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"SUBROLE"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"AGE"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"LOCATION"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"JOINED"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"SALARY"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"PROOFS"}
                </th>
                <th style={{ padding: "15px", textAlign: "left", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"STATUS"}
                </th>
                <th style={{ padding: "15px", textAlign: "center", color: "#39FF14", fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>
                  {"ACTIONS"}
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr
                  key={employee._id}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    background: index % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                  }}
                >
                  <td style={{ padding: "12px 15px", color: "#FFF", fontSize: "11px" }}>
                    {employee.employeeId || "N/A"}
                  </td>
                  <td style={{ padding: "12px 15px", color: "#FFF", fontSize: "12px", fontWeight: 600 }}>
                    {employee.name}
                  </td>
                  <td style={{ padding: "12px 15px", color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
                    <div>{employee.email}</div>
                    {employee.personalEmail && (
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "3px" }}>
                        {employee.personalEmail}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 15px", color: "#39FF14", fontSize: "10px", wordBreak: "break-all", maxWidth: "150px" }}>
                    {employee.password || "—"}
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                  <span
                    className="aeonik-mono"
                    style={{
                      display: "inline-block",
                        padding: "4px 8px",
                      fontSize: "10px",
                      color: "#39FF14",
                      background: "rgba(57, 255, 20, 0.1)",
                      border: "1px solid #39FF14",
                      letterSpacing: "1px",
                    }}
                  >
                    {employee.role}
                  </span>
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    {employee.subrole ? (
                      <span
                  className="aeonik-mono"
                  style={{
                          display: "inline-block",
                          padding: "4px 8px",
                    fontSize: "10px",
                          color: "rgba(255, 255, 255, 0.7)",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          letterSpacing: "1px",
                        }}
                      >
                        {employee.subrole}
                      </span>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{"—"}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 15px", color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
                    {employee.age || "—"}
                  </td>
                  <td style={{ padding: "12px 15px", color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
                    {employee.location || "—"}
                  </td>
                  <td style={{ padding: "12px 15px", color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
                    {employee.joinedDate ? new Date(employee.joinedDate).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ padding: "12px 15px", color: "#39FF14", fontSize: "11px", fontWeight: 600 }}>
                    {employee.salary ? `${employee.salary.toLocaleString()} ${employee.currency || "USD"}` : "—"}
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
                      {employee.videoProof && (
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            onClick={() => {
                              playClickSound()
                              setPreviewUrl({ type: 'video', url: employee.videoProof! })
                            }}
                            className="aeonik-mono"
                            style={{
                              padding: "3px 6px",
                              background: "transparent",
                              border: "1px solid #39FF14",
                              color: "#39FF14",
                              fontSize: "8px",
                              cursor: "pointer",
                            }}
                          >
                            {"PREVIEW"}
                          </button>
                          <a
                            href={employee.videoProof}
                            download={employee.videoProof.split('/').pop()?.split('?')[0] || 'video'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aeonik-mono"
                            style={{
                              padding: "3px 6px",
                              background: "transparent",
                              border: "1px solid rgba(255,255,255,0.3)",
                              color: "#FFF",
                              fontSize: "8px",
                              cursor: "pointer",
                              textDecoration: "none",
                            }}
                          >
                            {"DOWNLOAD"}
                          </a>
                </div>
                      )}
                      {employee.documentProof && (
                        <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={() => {
                    playClickSound()
                              setPreviewUrl({ type: 'document', url: employee.documentProof! })
                  }}
                  className="aeonik-mono"
                  style={{
                              padding: "3px 6px",
                              background: "transparent",
                              border: "1px solid #39FF14",
                              color: "#39FF14",
                              fontSize: "8px",
                    cursor: "pointer",
                            }}
                          >
                            {"PREVIEW"}
                          </button>
                          <a
                            href={employee.documentProof}
                            download={employee.documentProof.split('/').pop()?.split('?')[0] || 'document'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aeonik-mono"
                            style={{
                              padding: "3px 6px",
                              background: "transparent",
                              border: "1px solid rgba(255,255,255,0.3)",
                              color: "#FFF",
                              fontSize: "8px",
                              cursor: "pointer",
                              textDecoration: "none",
                            }}
                          >
                            {"DOWNLOAD"}
                          </a>
                        </div>
                      )}
                      {!employee.videoProof && !employee.documentProof && (
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{"—"}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <span
                        className="aeonik-mono"
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          fontSize: "9px",
                          color: employee.isActive ? "#39FF14" : "#FF0000",
                          background: employee.isActive ? "rgba(57, 255, 20, 0.1)" : "rgba(255, 0, 0, 0.1)",
                          border: `1px solid ${employee.isActive ? "#39FF14" : "#FF0000"}`,
                    letterSpacing: "1px",
                          width: "fit-content",
                  }}
                >
                  {employee.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                      {employee.isBanned && (
                        <span
                          className="aeonik-mono"
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            fontSize: "9px",
                            color: "#FF0000",
                            background: "rgba(255, 0, 0, 0.1)",
                            border: "1px solid #FF0000",
                            letterSpacing: "1px",
                            width: "fit-content",
                          }}
                        >
                          {"BANNED"}
                        </span>
                      )}
                      {employee.isVerified && (
                        <span
                          className="aeonik-mono"
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            fontSize: "9px",
                            color: "#39FF14",
                            background: "rgba(57, 255, 20, 0.1)",
                            border: "1px solid #39FF14",
                            letterSpacing: "1px",
                            width: "fit-content",
                          }}
                        >
                          {"VERIFIED"}
                        </span>
                      )}
              </div>
                  </td>
                  <td style={{ padding: "12px 15px" }}>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleEdit(employee)}
                  className="aeonik-mono"
                  style={{
                          padding: "5px 10px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#FFF",
                          fontSize: "9px",
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
                          toggleActive(employee)
                        }}
                        className="aeonik-mono"
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          border: `1px solid ${employee.isActive ? "rgba(255, 0, 0, 0.5)" : "rgba(57, 255, 20, 0.5)"}`,
                          color: employee.isActive ? "#FF0000" : "#39FF14",
                          fontSize: "9px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                        }}
                      >
                        {employee.isActive ? "DEACTIVATE" : "ACTIVATE"}
                      </button>
                      {employee.isBanned ? (
                        <button
                          onClick={() => {
                            playClickSound()
                            handleUnban(employee)
                          }}
                          className="aeonik-mono"
                          style={{
                            padding: "5px 10px",
                            background: "transparent",
                            border: "1px solid #39FF14",
                            color: "#39FF14",
                            fontSize: "9px",
                            cursor: "pointer",
                            letterSpacing: "1px",
                          }}
                        >
                          {"UNBAN"}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            playClickSound()
                            setEmployeeToBan(employee)
                          }}
                          className="aeonik-mono"
                          style={{
                            padding: "5px 10px",
                            background: "transparent",
                            border: "1px solid rgba(255, 0, 0, 0.5)",
                            color: "#FF0000",
                            fontSize: "9px",
                            cursor: "pointer",
                            letterSpacing: "1px",
                          }}
                        >
                          {"BAN"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          playClickSound()
                          handleVerify(employee)
                        }}
                        className="aeonik-mono"
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          border: `1px solid ${employee.isVerified ? "rgba(255, 0, 0, 0.5)" : "rgba(57, 255, 20, 0.5)"}`,
                          color: employee.isVerified ? "#FF0000" : "#39FF14",
                          fontSize: "9px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                        }}
                      >
                        {employee.isVerified ? "UNVERIFY" : "VERIFY"}
                      </button>
                      <button
                        onClick={() => {
                          playClickSound()
                          setSelectedEmployeeForHike(employee)
                          setSalaryHikeData({
                            amount: employee.salary?.toString() || "",
                            currency: employee.currency || "USD",
                            reason: "",
                          })
                          setShowSalaryHikeModal(true)
                        }}
                        className="aeonik-mono"
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          border: "1px solid rgba(255, 215, 0, 0.5)",
                          color: "#FFD700",
                          fontSize: "9px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                        }}
                      >
                        {"HIKE"}
                </button>
                <button
                  onClick={() => {
                    playClickSound()
                    setEmployeeToDelete(employee)
                  }}
                  className="aeonik-mono"
                  style={{
                          padding: "5px 10px",
                    background: "transparent",
                          border: "1px solid rgba(255, 0, 0, 0.5)",
                          color: "#FF0000",
                          fontSize: "9px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                        }}
                      >
                        {"DELETE"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {employeeToBan && (
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
          onClick={() => setEmployeeToBan(null)}
        >
          <div
            style={{
              background: "#111",
                    border: "1px solid rgba(255, 0, 0, 0.3)",
              padding: "30px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="aeonik-mono" style={{ fontSize: "16px", color: "#FF0000", marginBottom: "15px" }}>
              {"BAN EMPLOYEE?"}
            </h3>
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "25px" }}>
              {`ARE YOU SURE YOU WANT TO BAN "${employeeToBan.name}"? THIS WILL DEACTIVATE THEIR ACCOUNT.`}
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => {
                  playClickSound()
                  setEmployeeToBan(null)
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
                  handleBan()
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
                {"BAN"}
                </button>
              </div>
            </div>
        </div>
      )}

      {/* Salary Hike Modal */}
      {showSalaryHikeModal && selectedEmployeeForHike && (
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
          onClick={() => {
            setShowSalaryHikeModal(false)
            setSelectedEmployeeForHike(null)
            setSalaryHikeData({ amount: "", currency: "USD", reason: "" })
          }}
        >
          <div
            style={{
              background: "#111",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="aeonik-mono" style={{ fontSize: "16px", color: "#FFD700", marginBottom: "15px" }}>
              {"ADD SALARY HIKE"}
            </h3>
            <p className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "20px" }}>
              {`EMPLOYEE: ${selectedEmployeeForHike.name}`}
              {selectedEmployeeForHike.salary && (
                <span style={{ display: "block", marginTop: "5px" }}>
                  {`CURRENT: ${selectedEmployeeForHike.salary.toLocaleString()} ${selectedEmployeeForHike.currency || "USD"}`}
                </span>
              )}
            </p>

            <div style={{ marginBottom: "15px" }}>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"NEW SALARY AMOUNT *"}
              </label>
              <Input
                type="number"
                value={salaryHikeData.amount}
                onChange={(e) => setSalaryHikeData({ ...salaryHikeData, amount: e.target.value })}
                placeholder="60000"
                min="0"
                step="0.01"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"CURRENCY *"}
              </label>
              <select
                value={salaryHikeData.currency}
                onChange={(e) => setSalaryHikeData({ ...salaryHikeData, currency: e.target.value })}
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
                {currencies.map((curr) => (
                  <option key={curr} value={curr} style={{ background: "#000" }}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"REASON (OPTIONAL)"}
              </label>
              <textarea
                value={salaryHikeData.reason}
                onChange={(e) => setSalaryHikeData({ ...salaryHikeData, reason: e.target.value })}
                placeholder="Performance review, promotion, etc."
                className="aeonik-mono"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFF",
                  fontSize: "12px",
                  minHeight: "60px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => {
                  playClickSound()
                  setShowSalaryHikeModal(false)
                  setSelectedEmployeeForHike(null)
                  setSalaryHikeData({ amount: "", currency: "USD", reason: "" })
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
                  handleSalaryHike()
                }}
                className="aeonik-mono"
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1px solid #FFD700",
                  color: "#FFD700",
                  fontSize: "12px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 215, 0, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                {"RECORD HIKE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
          }}
          onClick={() => setPreviewUrl(null)}
        >
          <div
            style={{
              background: "#111",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "20px",
              maxWidth: "90%",
              maxHeight: "90%",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                playClickSound()
                setPreviewUrl(null)
              }}
              className="aeonik-mono"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#FFF",
                fontSize: "11px",
                cursor: "pointer",
                letterSpacing: "1px",
                zIndex: 1,
              }}
            >
              {"CLOSE"}
            </button>
            {previewUrl.type === 'video' ? (
              <video
                src={previewUrl.url}
                controls
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  display: "block",
                }}
              />
            ) : (() => {
              // Check if it's an image by file extension or Cloudinary URL
              const url = previewUrl.url.toLowerCase()
              // Check for image extensions (including in query params)
              const hasImageExt = url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i)
              // Check if Cloudinary URL is for image (raw uploads can be images too)
              const isCloudinaryImage = url.includes('cloudinary.com') && (url.includes('/image/upload/') || hasImageExt)
              const isImage = hasImageExt || isCloudinaryImage
              const isPdf = url.match(/\.pdf(\?|$)/i) || url.includes('.pdf')
              
              if (isImage) {
                // For images, use img tag with proper Cloudinary URL if needed
                let imageUrl = previewUrl.url
                // If it's a Cloudinary URL, ensure it's optimized for display
                if (url.includes('cloudinary.com')) {
                  // If it's a raw upload but has image extension, convert to image
                  if (url.includes('/raw/upload/') && hasImageExt) {
                    imageUrl = previewUrl.url.replace('/raw/upload/', '/image/upload/f_auto,q_auto/')
                  } else if (url.includes('/image/upload/') && !url.includes('/f_')) {
                    // Add format parameter to ensure it's treated as an image
                    imageUrl = previewUrl.url.replace('/upload/', '/upload/f_auto,q_auto/')
                  }
                }
                return (
                  <img
                    src={imageUrl}
                    alt="Document Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "80vh",
                      display: "block",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      // If image fails to load, try the original URL
                      if (e.currentTarget.src !== previewUrl.url) {
                        e.currentTarget.src = previewUrl.url
                      } else {
                        // If still fails, show error message
                        e.currentTarget.style.display = 'none'
                        const errorDiv = document.createElement('div')
                        errorDiv.className = 'aeonik-mono'
                        errorDiv.style.cssText = 'color: #FFF; text-align: center; padding: 40px;'
                        errorDiv.textContent = 'IMAGE COULD NOT BE LOADED'
                        e.currentTarget.parentElement?.appendChild(errorDiv)
                      }
                    }}
                  />
                )
              } else if (isPdf) {
                // For PDFs, use embed with proper URL
                // Cloudinary PDFs can be viewed directly
                return (
                  <embed
                    src={previewUrl.url}
                    type="application/pdf"
                    style={{
                      width: "800px",
                      height: "600px",
                      maxWidth: "100%",
                      maxHeight: "80vh",
                      border: "none",
                    }}
                  />
                )
              } else {
                // For other document types, try to open in new tab or show download
                return (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p className="aeonik-mono" style={{ color: "#FFF", fontSize: "14px", marginBottom: "20px" }}>
                      {"PREVIEW NOT AVAILABLE FOR THIS FILE TYPE"}
                    </p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <a
                        href={previewUrl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aeonik-mono"
                        style={{
                          padding: "10px 20px",
                          background: "transparent",
                          border: "1px solid #39FF14",
                          color: "#39FF14",
                          fontSize: "12px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        {"OPEN IN NEW TAB"}
                      </a>
                      <a
                        href={previewUrl.url}
                        download
                        className="aeonik-mono"
                        style={{
                          padding: "10px 20px",
                          background: "transparent",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          color: "#FFF",
                          fontSize: "12px",
                          cursor: "pointer",
                          letterSpacing: "1px",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        {"DOWNLOAD FILE"}
                      </a>
                    </div>
                  </div>
                )
              }
            })()}
          </div>
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


