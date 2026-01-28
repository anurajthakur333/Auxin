import { useState, useEffect } from "react"
import { API_BASE_URL, getAuthToken } from "../../../lib/apiConfig"

interface Notification {
  id: string
  message: string
  time: string
  read: boolean
  type: "project" | "meeting" | "payment" | "system" | "task" | "billing" | "custom"
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
      }
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    if (filter === "read") return notification.read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
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
        NOTIFICATIONS
      </h3>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "25px",
            borderRadius: "0px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#39FF14"
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
          }}
        >
          <div
            className="aeonik-mono"
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              color: "#39FF14",
              fontWeight: 600,
              marginBottom: "10px",
              letterSpacing: "-2px",
            }}
          >
            {notifications.length}
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", letterSpacing: "1px" }}
          >
            TOTAL NOTIFICATIONS
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "25px",
            borderRadius: "0px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#39FF14"
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
          }}
        >
          <div
            className="aeonik-mono"
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              color: "#39FF14",
              fontWeight: 600,
              marginBottom: "10px",
              letterSpacing: "-2px",
            }}
          >
            {unreadCount}
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", letterSpacing: "1px" }}
          >
            UNREAD
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <p
            className="aeonik-mono"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
              marginBottom: "10px",
              letterSpacing: "1px",
            }}
          >
            FILTER
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {(["all", "unread", "read"] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className="aeonik-mono"
                style={{
                  fontSize: "12px",
                  color: filter === filterType ? "#000" : "#FFF",
                  background: filter === filterType ? "#39FF14" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${filter === filterType ? "#39FF14" : "rgba(255, 255, 255, 0.2)"}`,
                  padding: "8px 16px",
                  borderRadius: "0px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (filter !== filterType) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                    e.currentTarget.style.borderColor = "#39FF14"
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== filterType) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                  }
                }}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="aeonik-mono"
            style={{
              fontSize: "11px",
              color: "#39FF14",
              background: "transparent",
              border: "1px solid #39FF14",
              padding: "8px 16px",
              borderRadius: "0px",
              cursor: "pointer",
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "all 0.3s ease",
              alignSelf: "flex-end",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(57, 255, 20, 0.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            MARK ALL AS READ
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "60px 40px",
              borderRadius: "0px",
              textAlign: "center",
            }}
          >
            <p className="aeonik-mono" style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.5)" }}>
              LOADING NOTIFICATIONS...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "60px 40px",
              borderRadius: "0px",
              textAlign: "center",
            }}
          >
            <p className="aeonik-mono" style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.5)" }}>
              NO NOTIFICATIONS FOUND
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.read) {
                  handleMarkAsRead(notification.id)
                }
              }}
              style={{
                background: notification.read ? "rgba(255, 255, 255, 0.02)" : "rgba(57, 255, 20, 0.05)",
                border: notification.read
                  ? "1px solid rgba(255, 255, 255, 0.05)"
                  : "1px solid rgba(57, 255, 20, 0.2)",
                padding: "20px 25px",
                borderRadius: "0px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = notification.read
                  ? "rgba(255, 255, 255, 0.02)"
                  : "rgba(57, 255, 20, 0.05)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                {!notification.read && (
                  <div style={{ width: "8px", height: "8px", background: "#39FF14", borderRadius: "0px" }} />
                )}
                <span className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>
                  {notification.message}
                </span>
              </div>
              <span className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)" }}>
                {notification.time}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default Notifications
