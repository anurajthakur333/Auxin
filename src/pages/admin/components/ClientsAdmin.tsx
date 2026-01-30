import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import DropdownMenu from "../../../components/ui/DropdownMenu"
import DatePicker from "../../../components/ui/DatePicker"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Client {
  id: string
  name: string
  email: string
  clientCode: string
  status: "active" | "inactive" | "banned"
  joinDate: string
  projects: number
  isEmailVerified: boolean
  isBanned: boolean
}

const ClientsAdmin = () => {
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [updatingClientId, setUpdatingClientId] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editingClientCode, setEditingClientCode] = useState("")
  const [clientCodeError, setClientCodeError] = useState<string | null>(null)
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)
  const [convertingClientId, setConvertingClientId] = useState<string | null>(null)
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  // Filter states
  const [nameEmailSearch, setNameEmailSearch] = useState("")
  const [codeSearch, setCodeSearch] = useState("")
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<"all" | "true" | "false">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "banned">("all")
  const [projectsFilter, setProjectsFilter] = useState<string>("")
  const [joinedDateStart, setJoinedDateStart] = useState<string>("")
  const [joinedDateEnd, setJoinedDateEnd] = useState<string>("")

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)

      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setError('Admin authentication required')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/clients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch clients' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setClients(data.clients || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const convertToUser = async (client: Client) => {
    const confirmed = window.confirm(
      `Are you sure you want to convert "${client.name}" (${client.clientCode}) to a regular user?\n\n` +
      `• They will LOSE dashboard access\n` +
      `• Their projects, invoices, and notifications will be KEPT\n` +
      `• This action can be reversed by assigning a new client code`
    )

    if (!confirmed) return

    try {
      setConvertingClientId(client.id)
      setError(null)

      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setError('Admin authentication required')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/clients/${client.id}/convert-to-user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to convert client' }))
        throw new Error(errorData.error || 'Failed to convert client to user')
      }

      setSuccess(`"${client.name}" has been converted to a regular user and removed from clients list`)
      fetchClients()
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      console.error('Error converting client:', err)
      setError(err instanceof Error ? err.message : 'Failed to convert client to user')
    } finally {
      setConvertingClientId(null)
    }
  }

  const deleteClient = async (client: Client) => {
    const confirmed = window.confirm(
      `⚠️ DANGER: Are you sure you want to DELETE "${client.name}" (${client.clientCode})?\n\n` +
      `This will PERMANENTLY delete:\n` +
      `• The user account\n` +
      `• All ${client.projects} projects\n` +
      `• All tasks within those projects\n` +
      `• All invoices\n` +
      `• All notifications\n` +
      `• All appointments\n\n` +
      `THIS ACTION CANNOT BE UNDONE!`
    )

    if (!confirmed) return

    // Double confirmation for safety
    const doubleConfirmed = window.confirm(
      `FINAL CONFIRMATION\n\n` +
      `Type "DELETE" in the next prompt to confirm deletion of "${client.name}"`
    )

    if (!doubleConfirmed) return

    const userInput = window.prompt(`Type "DELETE" to confirm deletion of ${client.name}:`)
    if (userInput !== "DELETE") {
      setError('Deletion cancelled - confirmation text did not match')
      return
    }

    try {
      setDeletingClientId(client.id)
      setError(null)

      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setError('Admin authentication required')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/clients/${client.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete client' }))
        throw new Error(errorData.error || 'Failed to delete client')
      }

      const data = await response.json()
      setSuccess(
        `Client "${client.name}" deleted successfully.\n` +
        `Deleted: ${data.deletedData?.projects || 0} projects, ` +
        `${data.deletedData?.tasks || 0} tasks, ` +
        `${data.deletedData?.invoices || 0} invoices, ` +
        `${data.deletedData?.notifications || 0} notifications`
      )
      fetchClients()
      setTimeout(() => setSuccess(null), 8000)
    } catch (err) {
      console.error('Error deleting client:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete client')
    } finally {
      setDeletingClientId(null)
    }
  }

  const filteredClients = clients.filter(client => {
    // Name/Email search
    if (nameEmailSearch) {
      const searchLower = nameEmailSearch.toLowerCase()
      const matchesSearch =
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Code search
    if (codeSearch) {
      const searchUpper = codeSearch.toUpperCase()
      if (!client.clientCode.toUpperCase().includes(searchUpper)) return false
    }

    // Email verified filter
    if (emailVerifiedFilter !== "all") {
      if (emailVerifiedFilter === "true" && !client.isEmailVerified) return false
      if (emailVerifiedFilter === "false" && client.isEmailVerified) return false
    }

    // Status filter
    if (statusFilter !== "all" && client.status !== statusFilter) return false

    // Projects filter - exact number match
    if (projectsFilter.trim() !== "") {
      const filterProjects = parseInt(projectsFilter, 10)
      if (!isNaN(filterProjects) && client.projects !== filterProjects) return false
    }

    // Joined date filter - date range
    if (joinedDateStart || joinedDateEnd) {
      const joinDate = new Date(client.joinDate)
      joinDate.setHours(0, 0, 0, 0)

      if (joinedDateStart) {
        const startDate = new Date(joinedDateStart)
        startDate.setHours(0, 0, 0, 0)
        if (joinDate < startDate) return false
      }

      if (joinedDateEnd) {
        const endDate = new Date(joinedDateEnd)
        endDate.setHours(23, 59, 59, 999)
        if (joinDate > endDate) return false
      }
    }

    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#39FF14"
      case "banned":
        return "#FF6B6B"
      case "inactive":
        return "#FF6B6B"
      default:
        return "#FFF"
    }
  }

  const validateClientCode = (code: string): boolean => {
    const codeRegex = /^[A-Z]{5}$/
    if (!codeRegex.test(code)) {
      setClientCodeError("CODE MUST BE EXACTLY 5 CAPITAL LETTERS (A-Z)")
      return false
    }
    setClientCodeError(null)
    return true
  }

  const checkClientCodeUnique = async (code: string, excludeClientId?: string): Promise<boolean> => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) return false

      const response = await fetch(`${API_BASE_URL}/api/admin/clients/check-code/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // If editing, allow the same code for the same client
        if (excludeClientId && data.clientId === excludeClientId) {
          return true
        }
        return !data.exists
      }
      return false
    } catch (err) {
      console.error('Error checking client code:', err)
      return false
    }
  }

  const openEditDialog = (client: Client) => {
    setEditingClient(client)
    setEditingClientCode(client.clientCode)
    setClientCodeError(null)
  }

  const cancelEditDialog = () => {
    setEditingClient(null)
    setEditingClientCode("")
    setClientCodeError(null)
  }

  const updateClientCode = async () => {
    if (!editingClient) return

    const trimmedCode = editingClientCode.trim().toUpperCase()

    if (!validateClientCode(trimmedCode)) {
      return
    }

    const isUnique = await checkClientCodeUnique(trimmedCode, editingClient.id)
    if (!isUnique) {
      setClientCodeError("THIS CODE IS ALREADY IN USE. PLEASE CHOOSE A DIFFERENT CODE.")
      return
    }

    try {
      setUpdatingClientId(editingClient.id)
      setClientCodeError(null)

      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setClientCodeError('ADMIN AUTHENTICATION REQUIRED')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/clients/${editingClient.id}/code`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ clientCode: trimmedCode })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || `Failed to update client code (${response.status})`)
      }

      // Update local list
      setClients(prev =>
        prev.map(c => (c.id === editingClient.id ? { ...c, clientCode: trimmedCode } : c))
      )

      cancelEditDialog()
      fetchClients() // Refresh to get updated data
    } catch (err) {
      console.error('Error updating client code:', err)
      setClientCodeError(err instanceof Error ? err.message : 'FAILED TO UPDATE CLIENT CODE')
    } finally {
      setUpdatingClientId(null)
    }
  }

  const toggleBan = async (client: Client) => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setError('Admin authentication required')
        return
      }

      setUpdatingClientId(client.id)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${client.id}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ banned: !client.isBanned })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || `Failed to update ban status (${response.status})`)
      }

      // Update local list
      setClients(prev =>
        prev.map(c =>
          c.id === client.id
            ? {
                ...c,
                isBanned: !client.isBanned,
                status: !client.isBanned ? "banned" : c.isEmailVerified ? "active" : "inactive",
              }
            : c
        )
      )
    } catch (err) {
      console.error('Error updating ban status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update ban status')
    } finally {
      setUpdatingClientId(null)
    }
  }

  const clearFilters = () => {
    setNameEmailSearch("")
    setCodeSearch("")
    setEmailVerifiedFilter("all")
    setStatusFilter("all")
    setProjectsFilter("")
    setJoinedDateStart("")
    setJoinedDateEnd("")
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h3
          className="aeonik-mono"
          style={{
            fontSize: "clamp(20px, 2.5vw, 28px)",
            color: "#FFF",
            letterSpacing: "-1px",
            fontWeight: 600,
          }}
        >
          CLIENT MANAGEMENT ({clients.length})
        </h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => {
              playClickSound()
              fetchClients()
            }}
            className="aeonik-mono"
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFF",
              fontSize: "12px",
              cursor: "pointer",
              borderRadius: "0px",
              letterSpacing: "1px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#39FF14"
              e.currentTarget.style.color = "#39FF14"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
              e.currentTarget.style.color = "#FFF"
            }}
          >
            REFRESH
          </button>

          <button
            onClick={() => {
              playClickSound()
              clearFilters()
            }}
            className="aeonik-mono"
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFF",
              fontSize: "12px",
              cursor: "pointer",
              borderRadius: "0px",
              letterSpacing: "1px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3B82F6"
              e.currentTarget.style.color = "#3B82F6"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
              e.currentTarget.style.color = "#FFF"
            }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "0px",
          padding: "20px",
          marginBottom: "25px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              SEARCH NAME/EMAIL
            </label>
            <Input
              type="text"
              value={nameEmailSearch}
              onChange={(e) => setNameEmailSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              SEARCH CLIENT CODE
            </label>
            <Input
              type="text"
              value={codeSearch}
              onChange={(e) => setCodeSearch(e.target.value.toUpperCase())}
              placeholder="ABCDE"
              maxLength={5}
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              EMAIL VERIFIED
            </label>
            <DropdownMenu
              value={emailVerifiedFilter}
              onChange={(value) => setEmailVerifiedFilter(value as "all" | "true" | "false")}
              options={[
                { value: "all", label: "ALL" },
                { value: "true", label: "VERIFIED" },
                { value: "false", label: "NOT VERIFIED" },
              ]}
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              STATUS
            </label>
            <DropdownMenu
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as "all" | "active" | "inactive" | "banned")}
              options={[
                { value: "all", label: "ALL" },
                { value: "active", label: "ACTIVE" },
                { value: "inactive", label: "INACTIVE" },
                { value: "banned", label: "BANNED" },
              ]}
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              PROJECTS (EXACT NUMBER)
            </label>
            <Input
              type="number"
              value={projectsFilter}
              onChange={(e) => setProjectsFilter(e.target.value)}
              placeholder="Enter number..."
              min="0"
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              JOINED DATE START
            </label>
            <DatePicker value={joinedDateStart} onChange={setJoinedDateStart} placeholder="dd/mm/yyyy" />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              JOINED DATE END
            </label>
            <DatePicker value={joinedDateEnd} onChange={setJoinedDateEnd} placeholder="dd/mm/yyyy" />
          </div>
        </div>
      </div>

      {loading && (
        <div
          className="aeonik-mono"
          style={{
            padding: "40px",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
          }}
        >
          Loading clients...
        </div>
      )}

      {error && (
        <div
          className="aeonik-mono"
          style={{
            padding: "20px",
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid #FF6B6B",
            borderRadius: "0px",
            color: "#FF6B6B",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          Error: {error}
        </div>
      )}

      {success && (
        <div
          className="aeonik-mono"
          style={{
            padding: "20px",
            background: "rgba(57, 255, 20, 0.1)",
            border: "1px solid #39FF14",
            borderRadius: "0px",
            color: "#39FF14",
            fontSize: "14px",
            marginBottom: "20px",
            whiteSpace: "pre-line",
          }}
        >
          {success}
        </div>
      )}

      {!loading && !error && clients.length === 0 && (
        <div
          className="aeonik-mono"
          style={{
            padding: "40px",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
          }}
        >
          No clients found
        </div>
      )}

      {!loading && !error && filteredClients.length > 0 && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "0px",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr",
              padding: "20px 25px",
              background: "rgba(57, 255, 20, 0.05)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              alignItems: "start",
            }}
          >
            {["NAME", "EMAIL", "CLIENT CODE", "STATUS", "PROJECTS", "JOINED AT", "EMAIL VERIFIED", "BANNED", "ACTIONS"].map((header) => (
              <div
                key={header}
                className="aeonik-mono"
                style={{
                  fontSize: "12px",
                  color: "#39FF14",
                  letterSpacing: "1px",
                  fontWeight: 600,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {header}
              </div>
            ))}
          </div>

          {/* Table Rows */}
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr",
                padding: "20px 25px",
                borderBottom: index < filteredClients.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
                alignItems: "start",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                <span className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255, 255, 255)", paddingLeft: "20px", paddingRight: "20px" }}>
                  {client.name}
                </span>
              </div>
              <div
                className="aeonik-mono"
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255)",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {client.email}
              </div>
              <div
                className="aeonik-mono"
                style={{
                  fontSize: "14px",
                  color: "#3B82F6",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {client.clientCode}
              </div>
              <div
                style={{
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                }}
              >
                <span
                  className="aeonik-mono"
                  style={{
                    fontSize: "11px",
                    color: getStatusColor(client.status),
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "4px 8px",
                    border: `1px solid ${getStatusColor(client.status)}`,
                    borderRadius: "0px",
                    display: "inline-block",
                  }}
                >
                  {client.status}
                </span>
              </div>
              <div
                className="aeonik-mono"
                style={{
                  fontSize: "14px",
                  color: "#39FF14",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {client.projects}
              </div>
              <div
                className="aeonik-mono"
                style={{
                  fontSize: "14px",
                  color: "#FFF",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {new Date(client.joinDate).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div
                className="aeonik-mono"
                style={{
                  fontSize: "12px",
                  color: client.isEmailVerified ? "#39FF14" : "rgba(255,255,255,0.6)",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {client.isEmailVerified ? "TRUE" : "FALSE"}
              </div>
              <div
                className="aeonik-mono"
                style={{
                  fontSize: "12px",
                  color: client.isBanned ? "#FF6B6B" : "#39FF14",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {client.isBanned ? "YES" : "NO"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  flexWrap: "wrap",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playClickSound()
                    openEditDialog(client)
                  }}
                  disabled={updatingClientId === client.id}
                  className="aeonik-mono"
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "4px 10px",
                    borderRadius: "0px",
                    cursor: updatingClientId === client.id ? "default" : "pointer",
                    border: "1px solid #3B82F6",
                    color: "#3B82F6",
                    background: "transparent",
                    opacity: updatingClientId === client.id ? 0.6 : 1,
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  EDIT CODE
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playClickSound()
                    navigate(`/admin/client-projects/${client.id}?name=${encodeURIComponent(client.name)}&code=${encodeURIComponent(client.clientCode)}`)
                  }}
                  disabled={updatingClientId === client.id}
                  className="aeonik-mono"
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "4px 10px",
                    borderRadius: "0px",
                    cursor: updatingClientId === client.id ? "default" : "pointer",
                    border: "1px solid #39FF14",
                    color: "#39FF14",
                    background: "transparent",
                    opacity: updatingClientId === client.id ? 0.6 : 1,
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  MANAGE
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playClickSound()
                    toggleBan(client)
                  }}
                  disabled={updatingClientId === client.id}
                  className="aeonik-mono"
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "4px 10px",
                    borderRadius: "0px",
                    cursor: updatingClientId === client.id ? "default" : "pointer",
                    border: `1px solid ${client.isBanned ? "#39FF14" : "#FF6B6B"}`,
                    color: client.isBanned ? "#39FF14" : "#FF6B6B",
                    background: "transparent",
                    opacity: updatingClientId === client.id ? 0.6 : 1,
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {client.isBanned ? "UNBAN" : "BAN"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playClickSound()
                    convertToUser(client)
                  }}
                  disabled={convertingClientId === client.id || deletingClientId === client.id}
                  className="aeonik-mono"
                  title="Convert to regular user - keeps data but removes dashboard access"
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "4px 10px",
                    borderRadius: "0px",
                    cursor: convertingClientId === client.id ? "default" : "pointer",
                    border: "1px solid #FFD700",
                    color: "#FFD700",
                    background: convertingClientId === client.id ? "rgba(255, 215, 0, 0.1)" : "transparent",
                    opacity: convertingClientId === client.id ? 0.6 : 1,
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {convertingClientId === client.id ? "..." : "REMOVE CLIENT"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playClickSound()
                    deleteClient(client)
                  }}
                  disabled={deletingClientId === client.id || convertingClientId === client.id}
                  className="aeonik-mono"
                  title="Delete client and ALL associated data (projects, invoices, notifications)"
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "4px 10px",
                    borderRadius: "0px",
                    cursor: deletingClientId === client.id ? "default" : "pointer",
                    border: "1px solid #FF0000",
                    color: "#FF0000",
                    background: deletingClientId === client.id ? "rgba(255, 0, 0, 0.1)" : "transparent",
                    opacity: deletingClientId === client.id ? 0.6 : 1,
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {deletingClientId === client.id ? "DELETING..." : "DELETE ALL"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredClients.length === 0 && clients.length > 0 && (
        <div
          className="aeonik-mono"
          style={{
            padding: "40px",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
          }}
        >
          No clients match the current filters
        </div>
      )}

      {/* Edit Client Code Dialog */}
      {editingClient && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "#000000",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "30px",
              borderRadius: "0px",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h3
                className="aeonik-mono"
                style={{
                  fontSize: "18px",
                  color: "#FFFFFF",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  margin: 0,
                  marginBottom: "10px",
                }}
              >
                EDIT CLIENT CODE
              </h3>
              <p
                className="aeonik-mono"
                style={{
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: "15px",
                }}
              >
                UPDATE CLIENT CODE FOR{" "}
                <span style={{ color: "#3B82F6" }}>
                  {editingClient.name.toUpperCase()} ({editingClient.email.toUpperCase()})
                </span>
              </p>

              <div style={{ marginBottom: "15px" }}>
                <label
                  className="aeonik-mono"
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  CURRENT CODE: <span style={{ color: "#3B82F6" }}>{editingClient.clientCode}</span>
                </label>
                <label
                  className="aeonik-mono"
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: "8px",
                    display: "block",
                    marginTop: "15px",
                  }}
                >
                  NEW CLIENT CODE (5 CAPITAL LETTERS)
                </label>
                <Input
                  type="text"
                  value={editingClientCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5)
                    setEditingClientCode(value)
                    setClientCodeError(null)
                  }}
                  placeholder="ABCDE"
                  style={{
                    fontSize: "16px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    fontFamily: "monospace",
                  }}
                />
                {clientCodeError && (
                  <p
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      color: "#FF6B6B",
                      marginTop: "8px",
                      marginBottom: 0,
                    }}
                  >
                    {clientCodeError}
                  </p>
                )}
                {editingClientCode.length === 5 && !clientCodeError && (
                  <p
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      color: "#39FF14",
                      marginTop: "8px",
                      marginBottom: 0,
                    }}
                  >
                    CODE FORMAT VALID
                  </p>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => {
                  playClickSound()
                  cancelEditDialog()
                }}
                disabled={updatingClientId === editingClient.id}
                className="aeonik-mono"
                style={{
                  padding: "10px 20px",
                  borderRadius: "0px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "transparent",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: updatingClientId === editingClient.id ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: updatingClientId === editingClient.id ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (updatingClientId !== editingClient.id) {
                    e.currentTarget.style.borderColor = "#FFFFFF"
                    e.currentTarget.style.color = "#FFFFFF"
                  }
                }}
                onMouseLeave={(e) => {
                  if (updatingClientId !== editingClient.id) {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                    e.currentTarget.style.color = "#FFFFFF"
                  }
                }}
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  updateClientCode()
                }}
                disabled={updatingClientId === editingClient.id || editingClientCode.length !== 5 || editingClientCode === editingClient.clientCode}
                className="aeonik-mono"
                style={{
                  padding: "10px 20px",
                  borderRadius: "0px",
                  border: "1px solid #3B82F6",
                  background: "transparent",
                  color: "#3B82F6",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: updatingClientId === editingClient.id || editingClientCode.length !== 5 || editingClientCode === editingClient.clientCode ? "default" : "pointer",
                  opacity: updatingClientId === editingClient.id || editingClientCode.length !== 5 || editingClientCode === editingClient.clientCode ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (updatingClientId !== editingClient.id && editingClientCode.length === 5 && editingClientCode !== editingClient.clientCode) {
                    e.currentTarget.style.background = "rgba(59,130,246,0.15)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                {updatingClientId === editingClient.id ? "UPDATING..." : "UPDATE CODE"}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default ClientsAdmin
