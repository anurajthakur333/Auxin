import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import DropdownMenu from "../../../components/ui/DropdownMenu"
import DatePicker from "../../../components/ui/DatePicker"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface User {
  id: string
  name: string
  email: string
  status: "active" | "inactive" | "banned"
  joinDate: string
  projects: number
  isEmailVerified: boolean
  hasPassword: boolean
  password: string | null
  isBanned: boolean
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const playClickSound = useSound(clickSound, { volume: 0.3 })
  
  // Filter states
  const [nameEmailSearch, setNameEmailSearch] = useState("")
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<"all" | "true" | "false">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "banned">("all")
  const [projectsFilter, setProjectsFilter] = useState<string>("")
  const [joinedDateStart, setJoinedDateStart] = useState<string>("")
  const [joinedDateEnd, setJoinedDateEnd] = useState<string>("")

  useEffect(() => {
    fetchUsers()
  }, [])
  
  // Filter users based on all filter criteria
  const filteredUsers = users.filter(user => {
    // Name/Email search
    if (nameEmailSearch) {
      const searchLower = nameEmailSearch.toLowerCase()
      const matchesSearch = 
        user.name.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }
    
    // Email verified filter
    if (emailVerifiedFilter !== "all") {
      if (emailVerifiedFilter === "true" && !user.isEmailVerified) return false
      if (emailVerifiedFilter === "false" && user.isEmailVerified) return false
    }
    
    // Status filter
    if (statusFilter !== "all" && user.status !== statusFilter) return false
    
    // Projects filter - exact number match
    if (projectsFilter.trim() !== "") {
      const filterProjects = parseInt(projectsFilter, 10)
      if (!isNaN(filterProjects) && user.projects !== filterProjects) return false
    }
    
    // Joined date filter - date range
    if (joinedDateStart || joinedDateEnd) {
      const joinDate = new Date(user.joinDate)
      joinDate.setHours(0, 0, 0, 0) // Reset time to start of day for comparison
      
      if (joinedDateStart) {
        const startDate = new Date(joinedDateStart)
        startDate.setHours(0, 0, 0, 0)
        if (joinDate < startDate) return false
      }
      
      if (joinedDateEnd) {
        const endDate = new Date(joinedDateEnd)
        endDate.setHours(23, 59, 59, 999) // End of day
        if (joinDate > endDate) return false
      }
    }
    
    return true
  })
  
  // Separate banned users
  const bannedUsers = filteredUsers.filter(user => user.isBanned)
  const activeUsers = filteredUsers.filter(user => !user.isBanned)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setError('Admin authentication required')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch users' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

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

  const toggleBan = async (user: User) => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setError('Admin authentication required')
        return
      }

      setUpdatingUserId(user.id)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ banned: !user.isBanned })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || `Failed to update ban status (${response.status})`)
      }

      // Update local list optimistically
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, isBanned: !user.isBanned, status: !user.isBanned ? "banned" : (u.isEmailVerified ? "active" : "inactive") } : u))
      )
    } catch (err) {
      console.error('Error updating ban status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update ban status')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const clearFilters = () => {
    setNameEmailSearch("")
    setEmailVerifiedFilter("all")
    setStatusFilter("all")
    setProjectsFilter("")
    setJoinedDateStart("")
    setJoinedDateEnd("")
  }

  const deleteUser = async (user: User) => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setError('Admin authentication required')
        return
      }

      setDeletingUserId(user.id)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || `Failed to delete user (${response.status})`)
      }

      // Remove user from local list
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch (err) {
      console.error('Error deleting user:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user)
  }

  const cancelDeleteDialog = () => {
    setUserToDelete(null)
  }

  const confirmDeleteDialog = async () => {
    if (!userToDelete) return
    await deleteUser(userToDelete)
    setUserToDelete(null)
  }

  const exportToCSV = async () => {
    try {
      playClickSound()
      const adminToken = localStorage.getItem('adminToken')
      if (!adminToken) {
        setError('Admin authentication required')
        return
      }

      // Call backend CSV export endpoint
      const response = await fetch(`${API_BASE_URL}/api/admin/users/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to export CSV')
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting CSV:', err)
      // Fallback: Generate CSV client-side
      const csvContent = generateCSV(filteredUsers)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  const generateCSV = (usersToExport: User[]): string => {
    const headers = ['Name', 'Email', 'Status', 'Projects', 'Joined At', 'Email Verified', 'Password']
    const rows = usersToExport.map(user => [
      user.name,
      user.email,
      user.status.toUpperCase(),
      user.projects.toString(),
      new Date(user.joinDate).toLocaleString(),
      user.isEmailVerified ? 'TRUE' : 'FALSE',
      user.password || 'NONE'
    ])

    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ]

    return csvRows.join('\n')
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
          USER MANAGEMENT
        </h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => {
              playClickSound()
              fetchUsers()
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
              e.currentTarget.style.borderColor = "#39FF14"
              e.currentTarget.style.color = "#39FF14"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
              e.currentTarget.style.color = "#FFF"
            }}
          >
            CLEAR
          </button>

          <button
            onClick={exportToCSV}
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
            EXPORT CSV
          </button>
          
          {/* Banned Users Component */}
          <div
            style={{
              padding: "8px 16px",
              background: "rgba(255, 107, 107, 0.1)",
              border: "1px solid #FF6B6B",
              borderRadius: "0px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span className="aeonik-mono" style={{ fontSize: "12px", color: "#FF6B6B", letterSpacing: "1px" }}>
              BANNED: {bannedUsers.length}
            </span>
          </div>
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
          {/* Name/Email Search */}
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

          {/* Email Verified Filter */}
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

          {/* Status Filter */}
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

          {/* Projects Filter - Number Input */}
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

          {/* Joined Date Start Filter */}
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              JOINED DATE START
            </label>
            <DatePicker
              value={joinedDateStart}
              onChange={setJoinedDateStart}
              placeholder="dd/mm/yyyy"
            />
          </div>

          {/* Joined Date End Filter */}
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              JOINED DATE END
            </label>
            <DatePicker
              value={joinedDateEnd}
              onChange={setJoinedDateEnd}
              placeholder="dd/mm/yyyy"
            />
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
          Loading users...
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

      {!loading && !error && users.length === 0 && (
        <div
          className="aeonik-mono"
          style={{
            padding: "40px",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
          }}
        >
          No users found
        </div>
      )}

      {!loading && !error && activeUsers.length > 0 && (
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
            gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1fr 1.5fr",
            padding: "20px 25px",
            background: "rgba(57, 255, 20, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            alignItems: "start",
          }}
        >
          <div
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
              whiteSpace: "normal"
            }}
          >
            NAME
          </div>
          <div
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
              whiteSpace: "normal"
            }}
          >
            EMAIL
          </div>
          <div
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
              whiteSpace: "normal"
            }}
          >
            STATUS
          </div>
          <div
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
              whiteSpace: "normal"
            }}
          >
            PROJECTS
          </div>
          <div
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
              whiteSpace: "normal"
            }}
          >
            JOINED AT
          </div>
          <div
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
              whiteSpace: "normal"
            }}
          >
            EMAIL VERIFIED
          </div>
          <div
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
              whiteSpace: "normal"
            }}
          >
            PASSWORD
          </div>
          <div
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
              whiteSpace: "normal"
            }}
          >
            ACTIONS
          </div>
        </div>

        {/* Table Rows */}
        {activeUsers.map((user, index) => (
          <div
            key={user.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1fr 1.5fr",
              padding: "20px 25px",
              borderBottom: index < activeUsers.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
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
            <div style={{ 
              display: "flex", 
              alignItems: "flex-start", 
              minWidth: 0,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal"
            }}>
              <span className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255, 255, 255)" ,paddingLeft: "20px" ,paddingRight: "20px" }}>
                {user.name}
              </span>
            </div>
            <div className="aeonik-mono" style={{ 
              fontSize: "14px", 
              color: "rgba(255, 255, 255)",
              paddingLeft: "20px",
              paddingRight: "20px",
              minWidth: 0,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal"
            }}>
              {user.email}
            </div>
            <div style={{
              minWidth: 0,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal",
              paddingLeft: "20px",
              paddingRight: "20px",
            }}>
              <span
                className="aeonik-mono"
                style={{
                  fontSize: "11px",
                  color: getStatusColor(user.status),
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  padding: "4px 8px",
                  border: `1px solid ${getStatusColor(user.status)}`,
                  borderRadius: "0px",
                  display: "inline-block",
                }}
              >
                {user.status}
              </span>
            </div>
            <div className="aeonik-mono" style={{ 
              fontSize: "14px", 
              color: "#39FF14",
              paddingLeft: "20px",
              paddingRight: "20px",
              minWidth: 0,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal"
            }}>
              {user.projects}
            </div>
            <div className="aeonik-mono" style={{ 
              fontSize: "14px", 
              color: "#FFF",
              paddingLeft: "20px",
              paddingRight: "20px",
              minWidth: 0,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal"
            }}>
              {new Date(user.joinDate).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
            <div className="aeonik-mono" style={{ 
              fontSize: "12px", 
              color: user.isEmailVerified ? "#39FF14" : "rgba(255,255,255,0.6)",
              paddingLeft: "20px",
              paddingRight: "20px",
              minWidth: 0,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal"
            }}>
              {user.isEmailVerified ? "TRUE" : "FALSE"}
            </div>
            <div className="aeonik-mono" style={{ 
              fontSize: "12px", 
              color: user.hasPassword ? "#39FF14" : "rgba(255,255,255,0.6)",
              paddingLeft: "20px",
              paddingRight: "20px",
              minWidth: 0,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal"
            }}>
              {user.password || "NONE"}
            </div>
            <div style={{ 
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
              whiteSpace: "normal"
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  toggleBan(user);
                }}
                disabled={updatingUserId === user.id}
                className="aeonik-mono"
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  padding: "4px 10px",
                  borderRadius: "0px",
                  cursor: updatingUserId === user.id ? "default" : "pointer",
                  border: `1px solid ${user.isBanned ? "#FF6B6B" : "#39FF14"}`,
                  color: user.isBanned ? "#FF6B6B" : "#39FF14",
                  background: "transparent",
                  opacity: updatingUserId === user.id ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
              >
                {user.isBanned ? "UNBAN" : "BAN"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  openDeleteDialog(user);
                }}
                disabled={deletingUserId === user.id}
                className="aeonik-mono"
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  padding: "4px 10px",
                  borderRadius: "0px",
                  cursor: deletingUserId === user.id ? "default" : "pointer",
                  border: "1px solid #FF6B6B",
                  color: "#FF6B6B",
                  background: "transparent",
                  opacity: deletingUserId === user.id ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Banned Users Section */}
      {!loading && !error && bannedUsers.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h4
            className="aeonik-mono"
            style={{
              fontSize: "clamp(18px, 2vw, 24px)",
              color: "#FF6B6B",
              letterSpacing: "-1px",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            BANNED USERS ({bannedUsers.length})
          </h4>
          
          <div
            style={{
              background: "rgba(255, 107, 107, 0.05)",
              border: "1px solid rgba(255, 107, 107, 0.3)",
              borderRadius: "0px",
              overflow: "hidden",
            }}
          >
            {/* Banned Users Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1fr 1.5fr",
                padding: "20px 25px",
                background: "rgba(255, 107, 107, 0.1)",
                borderBottom: "1px solid rgba(255, 107, 107, 0.3)",
                alignItems: "start",
              }}
            >
              <div
                className="aeonik-mono"
                style={{ 
                  fontSize: "12px", 
                  color: "#FF6B6B", 
                  letterSpacing: "1px", 
                  fontWeight: 600,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}
              >
                NAME
              </div>
              <div
                className="aeonik-mono"
                style={{ 
                  fontSize: "12px", 
                  color: "#FF6B6B", 
                  letterSpacing: "1px", 
                  fontWeight: 600,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}
              >
                EMAIL
              </div>
              <div
                className="aeonik-mono"
                style={{ 
                  fontSize: "12px", 
                  color: "#FF6B6B", 
                  letterSpacing: "1px", 
                  fontWeight: 600,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}
              >
                STATUS
              </div>
              <div
                className="aeonik-mono"
                style={{ 
                  fontSize: "12px", 
                  color: "#FF6B6B", 
                  letterSpacing: "1px", 
                  fontWeight: 600,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}
              >
                PROJECTS
              </div>
              <div
                className="aeonik-mono"
                style={{ 
                  fontSize: "12px", 
                  color: "#FF6B6B", 
                  letterSpacing: "1px", 
                  fontWeight: 600,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}
              >
                JOINED AT
              </div>
              <div
                className="aeonik-mono"
                style={{ 
                  fontSize: "12px", 
                  color: "#FF6B6B", 
                  letterSpacing: "1px", 
                  fontWeight: 600,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}
              >
                EMAIL VERIFIED
              </div>
              <div
                className="aeonik-mono"
                style={{ 
                  fontSize: "12px", 
                  color: "#FF6B6B", 
                  letterSpacing: "1px", 
                  fontWeight: 600,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}
              >
                PASSWORD
              </div>
              <div
                className="aeonik-mono"
                style={{ 
                  fontSize: "12px", 
                  color: "#FF6B6B", 
                  letterSpacing: "1px", 
                  fontWeight: 600,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}
              >
                ACTIONS
              </div>
            </div>

            {/* Banned Users Table Rows */}
            {bannedUsers.map((user, index) => (
              <div
                key={user.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1fr 1.5fr",
                  padding: "20px 25px",
                  borderBottom: index < bannedUsers.length - 1 ? "1px solid rgba(255, 107, 107, 0.1)" : "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  alignItems: "start",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 107, 0.05)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}>
                  <span className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" ,paddingLeft: "20px" ,paddingRight: "20px" }}>
                    {user.name}
                  </span>
                </div>
                <div className="aeonik-mono" style={{ 
                  fontSize: "14px", 
                  color: "rgba(255, 255, 255, 0.7)",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}>
                  {user.email}
                </div>
                <div style={{
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}>
                  <span
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      color: "#FF6B6B",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "4px 8px",
                      border: "1px solid #FF6B6B",
                      borderRadius: "0px",
                      display: "inline-block",
        
                    }}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="aeonik-mono" style={{ 
                  fontSize: "14px", 
                  color: "rgba(255, 255, 255)",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}>
                  {user.projects}
                </div>
                <div className="aeonik-mono" style={{ 
                  fontSize: "14px", 
                  color: "rgba(255, 255, 255)",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}>
                  {new Date(user.joinDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
                <div className="aeonik-mono" style={{ 
                  fontSize: "12px", 
                  color: user.isEmailVerified ? "#39FF14" : "rgba(255,255,255,0.6)",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}>
                  {user.isEmailVerified ? "TRUE" : "FALSE"}
                </div>
                <div className="aeonik-mono" style={{ 
                  fontSize: "12px", 
                  color: user.hasPassword ? "#39FF14" : "rgba(255,255,255,0.6)",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  minWidth: 0,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal"
                }}>
                  {user.password || "NONE"}
                </div>
                <div style={{ 
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
                  whiteSpace: "normal"
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound();
                      toggleBan(user);
                    }}
                    disabled={updatingUserId === user.id}
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "4px 10px",
                      borderRadius: "0px",
                      cursor: updatingUserId === user.id ? "default" : "pointer",
                      border: "1px solid #39FF14",
                      color: "#39FF14",
                      background: "transparent",
                      opacity: updatingUserId === user.id ? 0.6 : 1,
                      transition: "all 0.2s ease",
                      flexShrink: 0
                    }}
                  >
                    UNBAN
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound();
                      openDeleteDialog(user);
                    }}
                    disabled={deletingUserId === user.id}
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "4px 10px",
                      borderRadius: "0px",
                      cursor: deletingUserId === user.id ? "default" : "pointer",
                      border: "1px solid #FF6B6B",
                      color: "#FF6B6B",
                      background: "transparent",
                      opacity: deletingUserId === user.id ? 0.6 : 1,
                      transition: "all 0.2s ease",
                      flexShrink: 0
                    }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {userToDelete && (
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
              maxWidth: "420px",
              backgroundColor: "#000000",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "24px 24px 20px",
              borderRadius: "0px",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h3
                className="aeonik-mono"
                style={{
                  fontSize: "16px",
                  color: "#FFFFFF",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                ARE YOU ABSOLUTELY SURE?
              </h3>
              <p
                className="aeonik-mono"
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                THIS ACTION CANNOT BE UNDONE. THIS WILL PERMANENTLY DELETE USER{" "}
                <span style={{ color: "#FF6B6B" }}>
                  {userToDelete.name.toUpperCase()} ({userToDelete.email.toUpperCase()})
                </span>{" "}
                AND REMOVE THEIR DATA FROM OUR SERVERS.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <button
                onClick={() => {
                  playClickSound()
                  cancelDeleteDialog()
                }}
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  borderRadius: "0px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "transparent",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FFFFFF"
                  e.currentTarget.style.color = "#FFFFFF"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                  e.currentTarget.style.color = "#FFFFFF"
                }}
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  confirmDeleteDialog()
                }}
                disabled={deletingUserId === userToDelete.id}
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  borderRadius: "0px",
                  border: "1px solid #FF6B6B",
                  background: "transparent",
                  color: "#FF6B6B",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: deletingUserId === userToDelete.id ? "default" : "pointer",
                  opacity: deletingUserId === userToDelete.id ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (deletingUserId === userToDelete.id) return
                  e.currentTarget.style.background = "rgba(255, 107, 107, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                DELETE USER
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && users.length > 0 && (
        <div
          className="aeonik-mono"
          style={{
            padding: "40px",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
          }}
        >
          No users match the current filters
        </div>
      )}
    </>
  )
}

export default Users
