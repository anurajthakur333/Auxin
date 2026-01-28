import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"
import Input from "../../../components/ui/Input"

interface Client {
  id: string
  name: string
  email: string
  clientCode: string
}

interface Notification {
  id: string
  userId: {
    id: string
    name: string
    email: string
  }
  message: string
  type: string
  read: boolean
  createdAt: string
}

const NotificationsAdmin = () => {
  const playClickSound = useSound(clickSound, { volume: 0.3 })
  const [clients, setClients] = useState<Client[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [notificationType, setNotificationType] = useState<"custom" | "project" | "meeting" | "payment" | "system" | "task" | "billing">("custom")
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchClients()
    fetchNotifications()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/clients`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch clients")
      }

      const data = await response.json()
      setClients(data.clients || [])
    } catch (err) {
      console.error("Error fetching clients:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch clients")
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!message.trim()) {
      setError("Message is required")
      return
    }

    if (selectedClientIds.length === 0) {
      setError("Please select at least one client")
      return
    }

    try {
      setSubmitting(true)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          userIds: selectedClientIds,
          message: message.trim(),
          type: notificationType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to send notification" }))
        throw new Error(errorData.error || "Failed to send notification")
      }

      setSuccess(`Notification sent to ${selectedClientIds.length} client(s) successfully!`)
      setMessage("")
      setSelectedClientIds([])
      fetchNotifications()
    } catch (err) {
      console.error("Error sending notification:", err)
      setError(err instanceof Error ? err.message : "Failed to send notification")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleClientSelection = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    )
    playClickSound()
  }

  const removeClient = (clientId: string) => {
    setSelectedClientIds((prev) => prev.filter((id) => id !== clientId))
    playClickSound()
  }

  const filteredClients = clients.filter((client) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.clientCode.toLowerCase().includes(query)
    )
  })

  const selectedClients = clients.filter((client) => selectedClientIds.includes(client.id))

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    if (filter === "read") return notification.read
    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "JUST NOW"
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? "MINUTE" : "MINUTES"} AGO`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "HOUR" : "HOURS"} AGO`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? "DAY" : "DAYS"} AGO`
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? "WEEK" : "WEEKS"} AGO`
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths} ${diffInMonths === 1 ? "MONTH" : "MONTHS"} AGO`
  }

  return (
    <div style={{ color: "#FFF" }}>
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
        SEND NOTIFICATION
      </h3>

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

      <form onSubmit={handleSendNotification}>
        {/* Notification Type */}
        <div style={{ marginBottom: "30px" }}>
          <label className="aeonik-mono" style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            NOTIFICATION TYPE
          </label>
          <select
            value={notificationType}
            onChange={(e) => {
              setNotificationType(e.target.value as any)
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
            <option value="custom">CUSTOM</option>
            <option value="project">PROJECT</option>
            <option value="meeting">MEETING</option>
            <option value="payment">PAYMENT</option>
            <option value="system">SYSTEM</option>
            <option value="task">TASK</option>
            <option value="billing">BILLING</option>
          </select>
        </div>

        {/* Select Clients */}
        <div style={{ marginBottom: "30px" }}>
          <label className="aeonik-mono" style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            SELECT CLIENTS *
          </label>
          <p
            className="aeonik-mono"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.6)",
              marginBottom: "15px",
              lineHeight: "1.5",
            }}
          >
            SEARCH FOR CLIENTS BY NAME, EMAIL, OR CLIENT CODE. SELECT ONE OR MORE CLIENTS TO SEND THE NOTIFICATION TO.
          </p>

          {/* Search Input */}
          <div style={{ marginBottom: "15px" }}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH BY NAME, EMAIL, OR CLIENT CODE..."
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Selected Clients */}
          {selectedClients.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <p
                className="aeonik-mono"
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.6)",
                  marginBottom: "10px",
                  letterSpacing: "1px",
                }}
              >
                SELECTED CLIENTS ({selectedClients.length})
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {selectedClients.map((client) => (
                  <div
                    key={client.id}
                    className="aeonik-mono"
                    style={{
                      padding: "8px 12px",
                      background: "rgba(57, 255, 20, 0.1)",
                      border: "1px solid #39FF14",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div style={{ color: "#39FF14", marginBottom: "2px" }}>{client.name}</div>
                      <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "10px" }}>
                        {client.email} ({client.clientCode})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeClient(client.id)
                      }}
                      className="aeonik-mono"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#FF6B6B",
                        fontSize: "14px",
                        cursor: "pointer",
                        padding: "0",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#FF0000"
                        e.currentTarget.style.transform = "scale(1.2)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#FF6B6B"
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client List */}
          {loading ? (
            <div className="aeonik-mono" style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px" }}>
              LOADING CLIENTS...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "15px",
                maxHeight: "300px",
                overflowY: "auto",
                padding: "15px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {filteredClients.length === 0 ? (
                <div
                  className="aeonik-mono"
                  style={{
                    gridColumn: "1 / -1",
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: "14px",
                    textAlign: "center",
                    padding: "40px",
                  }}
                >
                  {searchQuery ? "NO CLIENTS FOUND MATCHING YOUR SEARCH" : "NO CLIENTS AVAILABLE"}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => toggleClientSelection(client.id)}
                    className="aeonik-mono"
                    style={{
                      padding: "12px",
                      background: selectedClientIds.includes(client.id)
                        ? "rgba(57, 255, 20, 0.1)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: selectedClientIds.includes(client.id)
                        ? "1px solid #39FF14"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      fontSize: "12px",
                      opacity: selectedClientIds.includes(client.id) ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedClientIds.includes(client.id)) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedClientIds.includes(client.id)) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                      }
                    }}
                  >
                    <div style={{ color: "#FFF", marginBottom: "5px" }}>{client.name}</div>
                    <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "11px" }}>
                      {client.email} ({client.clientCode})
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Message */}
        <div style={{ marginBottom: "30px" }}>
          <label className="aeonik-mono" style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            MESSAGE *
          </label>
          <p
            className="aeonik-mono"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.6)",
              marginBottom: "10px",
              lineHeight: "1.5",
            }}
          >
            ENTER THE NOTIFICATION MESSAGE (MAX 500 CHARACTERS).
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="aeonik-mono"
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFF",
              fontSize: "14px",
              borderRadius: "0px",
              minHeight: "120px",
              resize: "vertical",
            }}
            placeholder="ENTER YOUR MESSAGE HERE..."
            maxLength={500}
            required
          />
          <div
            className="aeonik-mono"
            style={{
              marginTop: "5px",
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.5)",
              textAlign: "right",
            }}
          >
            {message.length}/500
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || selectedClientIds.length === 0 || !message.trim()}
          className="aeonik-mono"
          style={{
            padding: "15px 30px",
            background: submitting || selectedClientIds.length === 0 || !message.trim() ? "rgba(57, 255, 20, 0.3)" : "transparent",
            border: "1px solid #39FF14",
            color: "#39FF14",
            fontSize: "14px",
            cursor: submitting || selectedClientIds.length === 0 || !message.trim() ? "not-allowed" : "pointer",
            borderRadius: "0px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!submitting && selectedClientIds.length > 0 && message.trim()) {
              e.currentTarget.style.background = "rgba(57, 255, 20, 0.1)"
            }
          }}
          onMouseLeave={(e) => {
            if (!submitting && selectedClientIds.length > 0 && message.trim()) {
              e.currentTarget.style.background = "transparent"
            }
          }}
        >
          {submitting ? "SENDING..." : "SEND NOTIFICATION"}
        </button>
      </form>

      {/* Recent Notifications */}
      <div style={{ marginTop: "60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3
            className="aeonik-mono"
            style={{
              fontSize: "clamp(18px, 2vw, 24px)",
              color: "#FFF",
              letterSpacing: "-1px",
              fontWeight: 600,
            }}
          >
            RECENT NOTIFICATIONS
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            {(["all", "unread", "read"] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => {
                  setFilter(filterType)
                  playClickSound()
                }}
                className="aeonik-mono"
                style={{
                  fontSize: "11px",
                  color: filter === filterType ? "#000" : "#FFF",
                  background: filter === filterType ? "#39FF14" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${filter === filterType ? "#39FF14" : "rgba(255, 255, 255, 0.2)"}`,
                  padding: "6px 12px",
                  borderRadius: "0px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                }}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifications.length === 0 ? (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "40px",
                borderRadius: "0px",
                textAlign: "center",
              }}
            >
              <p className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.5)" }}>
                NO NOTIFICATIONS FOUND
              </p>
            </div>
          ) : (
            filteredNotifications.slice(0, 20).map((notification) => (
              <div
                key={notification.id}
                style={{
                  background: notification.read ? "rgba(255, 255, 255, 0.02)" : "rgba(57, 255, 20, 0.05)",
                  border: notification.read
                    ? "1px solid rgba(255, 255, 255, 0.05)"
                    : "1px solid rgba(57, 255, 20, 0.2)",
                  padding: "15px 20px",
                  borderRadius: "0px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "5px" }}>
                    {!notification.read && (
                      <div style={{ width: "6px", height: "6px", background: "#39FF14", borderRadius: "0px" }} />
                    )}
                    <span className="aeonik-mono" style={{ fontSize: "13px", color: "#FFF" }}>
                      {notification.message}
                    </span>
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", marginLeft: "21px" }}>
                    TO: {notification.userId?.name || notification.userId?.email || "UNKNOWN"} | TYPE: {notification.type.toUpperCase()} | {formatDate(notification.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsAdmin
