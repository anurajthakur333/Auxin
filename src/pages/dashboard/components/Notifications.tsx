import { useState } from "react"

interface Notification {
  id: string
  message: string
  time: string
  read: boolean
  type: "project" | "meeting" | "payment" | "system"
}

const Notifications = () => {
  const [notifications] = useState<Notification[]>([
    { id: "1", message: "NEW PROJECT MILESTONE COMPLETED", time: "2 HOURS AGO", read: false, type: "project" },
    { id: "2", message: "MEETING SCHEDULED FOR TOMORROW", time: "5 HOURS AGO", read: false, type: "meeting" },
    { id: "3", message: "PAYMENT RECEIVED", time: "1 DAY AGO", read: true, type: "payment" },
    { id: "4", message: "SYSTEM UPDATE AVAILABLE", time: "2 DAYS AGO", read: true, type: "system" },
    { id: "5", message: "PROJECT DEADLINE APPROACHING", time: "3 DAYS AGO", read: false, type: "project" },
  ])

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

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
      <div style={{ marginBottom: "20px" }}>
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

      {/* Notifications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredNotifications.length === 0 ? (
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
