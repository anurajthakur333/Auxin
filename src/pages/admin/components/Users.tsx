import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"

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
            onClick={fetchUsers}
            className="aeonik-mono"
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFF",
              fontSize: "12px",
              cursor: "pointer",
              borderRadius: "4px",
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
            onClick={clearFilters}
            className="aeonik-mono"
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFF",
              fontSize: "12px",
              cursor: "pointer",
              borderRadius: "4px",
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
          
          {/* Banned Users Component */}
          <div
            style={{
              padding: "8px 16px",
              background: "rgba(255, 107, 107, 0.1)",
              border: "1px solid #FF6B6B",
              borderRadius: "4px",
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
          borderRadius: "8px",
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
            <input
              type="text"
              value={nameEmailSearch}
              onChange={(e) => setNameEmailSearch(e.target.value)}
              placeholder="Search..."
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "#FFF",
                fontSize: "12px",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#39FF14"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
              }}
            />
          </div>

          {/* Email Verified Filter */}
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              EMAIL VERIFIED
            </label>
            <select
              value={emailVerifiedFilter}
              onChange={(e) => setEmailVerifiedFilter(e.target.value as "all" | "true" | "false")}
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "#FFF",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all" style={{ background: "#000", color: "#FFF" }}>ALL</option>
              <option value="true" style={{ background: "#000", color: "#FFF" }}>VERIFIED</option>
              <option value="false" style={{ background: "#000", color: "#FFF" }}>NOT VERIFIED</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              STATUS
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive" | "banned")}
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "#FFF",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all" style={{ background: "#000", color: "#FFF" }}>ALL</option>
              <option value="active" style={{ background: "#000", color: "#FFF" }}>ACTIVE</option>
              <option value="inactive" style={{ background: "#000", color: "#FFF" }}>INACTIVE</option>
              <option value="banned" style={{ background: "#000", color: "#FFF" }}>BANNED</option>
            </select>
          </div>

          {/* Projects Filter - Number Input */}
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              PROJECTS (EXACT NUMBER)
            </label>
            <input
              type="number"
              value={projectsFilter}
              onChange={(e) => setProjectsFilter(e.target.value)}
              placeholder="Enter number..."
              min="0"
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "#FFF",
                fontSize: "12px",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#39FF14"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
              }}
            />
          </div>

          {/* Joined Date Start Filter */}
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              JOINED DATE START
            </label>
            <input
              type="date"
              value={joinedDateStart}
              onChange={(e) => setJoinedDateStart(e.target.value)}
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "#FFF",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#39FF14"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
              }}
            />
          </div>

          {/* Joined Date End Filter */}
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              JOINED DATE END
            </label>
            <input
              type="date"
              value={joinedDateEnd}
              onChange={(e) => setJoinedDateEnd(e.target.value)}
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "#FFF",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#39FF14"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
              }}
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
            borderRadius: "8px",
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
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1fr",
            padding: "20px 25px",
            background: "rgba(57, 255, 20, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "#39FF14", letterSpacing: "1px", fontWeight: 600 }}
          >
            NAME
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "#39FF14", letterSpacing: "1px", fontWeight: 600 }}
          >
            EMAIL
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "#39FF14", letterSpacing: "1px", fontWeight: 600 }}
          >
            STATUS
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "#39FF14", letterSpacing: "1px", fontWeight: 600 }}
          >
            PROJECTS
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "#39FF14", letterSpacing: "1px", fontWeight: 600 }}
          >
            JOINED AT
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "#39FF14", letterSpacing: "1px", fontWeight: 600 }}
          >
            EMAIL VERIFIED
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "#39FF14", letterSpacing: "1px", fontWeight: 600 }}
          >
            PASSWORD
          </div>
        </div>

        {/* Table Rows */}
        {activeUsers.map((user, index) => (
          <div
            key={user.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1fr",
              padding: "20px 25px",
              borderBottom: index < activeUsers.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>
                {user.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBan(user);
                }}
                disabled={updatingUserId === user.id}
                className="aeonik-mono"
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  padding: "4px 10px",
                  borderRadius: "4px",
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
            </div>
            <div className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
              {user.email}
            </div>
            <div>
              <span
                className="aeonik-mono"
                style={{
                  fontSize: "11px",
                  color: getStatusColor(user.status),
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  padding: "4px 8px",
                  border: `1px solid ${getStatusColor(user.status)}`,
                  borderRadius: "4px",
                }}
              >
                {user.status}
              </span>
            </div>
            <div className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14" }}>
              {user.projects}
            </div>
            <div className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.5)" }}>
              {new Date(user.joinDate).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
            <div className="aeonik-mono" style={{ fontSize: "12px", color: user.isEmailVerified ? "#39FF14" : "rgba(255,255,255,0.6)" }}>
              {user.isEmailVerified ? "TRUE" : "FALSE"}
            </div>
            <div className="aeonik-mono" style={{ fontSize: "12px", color: user.hasPassword ? "#39FF14" : "rgba(255,255,255,0.6)" }}>
              {user.password || "NONE"}
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
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* Banned Users Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1fr",
                padding: "20px 25px",
                background: "rgba(255, 107, 107, 0.1)",
                borderBottom: "1px solid rgba(255, 107, 107, 0.3)",
              }}
            >
              <div
                className="aeonik-mono"
                style={{ fontSize: "12px", color: "#FF6B6B", letterSpacing: "1px", fontWeight: 600 }}
              >
                NAME
              </div>
              <div
                className="aeonik-mono"
                style={{ fontSize: "12px", color: "#FF6B6B", letterSpacing: "1px", fontWeight: 600 }}
              >
                EMAIL
              </div>
              <div
                className="aeonik-mono"
                style={{ fontSize: "12px", color: "#FF6B6B", letterSpacing: "1px", fontWeight: 600 }}
              >
                STATUS
              </div>
              <div
                className="aeonik-mono"
                style={{ fontSize: "12px", color: "#FF6B6B", letterSpacing: "1px", fontWeight: 600 }}
              >
                PROJECTS
              </div>
              <div
                className="aeonik-mono"
                style={{ fontSize: "12px", color: "#FF6B6B", letterSpacing: "1px", fontWeight: 600 }}
              >
                JOINED AT
              </div>
              <div
                className="aeonik-mono"
                style={{ fontSize: "12px", color: "#FF6B6B", letterSpacing: "1px", fontWeight: 600 }}
              >
                EMAIL VERIFIED
              </div>
              <div
                className="aeonik-mono"
                style={{ fontSize: "12px", color: "#FF6B6B", letterSpacing: "1px", fontWeight: 600 }}
              >
                PASSWORD
              </div>
            </div>

            {/* Banned Users Table Rows */}
            {bannedUsers.map((user, index) => (
              <div
                key={user.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 1fr",
                  padding: "20px 25px",
                  borderBottom: index < bannedUsers.length - 1 ? "1px solid rgba(255, 107, 107, 0.1)" : "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 107, 0.05)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>
                    {user.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBan(user);
                    }}
                    disabled={updatingUserId === user.id}
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "4px 10px",
                      borderRadius: "4px",
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
                </div>
                <div className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
                  {user.email}
                </div>
                <div>
                  <span
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      color: "#FF6B6B",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "4px 8px",
                      border: "1px solid #FF6B6B",
                      borderRadius: "4px",
                    }}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FF6B6B" }}>
                  {user.projects}
                </div>
                <div className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.5)" }}>
                  {new Date(user.joinDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
                <div className="aeonik-mono" style={{ fontSize: "12px", color: user.isEmailVerified ? "#39FF14" : "rgba(255,255,255,0.6)" }}>
                  {user.isEmailVerified ? "TRUE" : "FALSE"}
                </div>
                <div className="aeonik-mono" style={{ fontSize: "12px", color: user.hasPassword ? "#39FF14" : "rgba(255,255,255,0.6)" }}>
                  {user.password || "NONE"}
                </div>
              </div>
            ))}
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
