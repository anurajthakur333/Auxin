interface SystemStat {
  label: string
  value: string | number
  change: string
  positive: boolean
}

const Analytics = () => {
  const systemStats: SystemStat[] = [
    { label: "TOTAL USERS", value: 156, change: "+12%", positive: true },
    { label: "ACTIVE PROJECTS", value: 28, change: "+8%", positive: true },
    { label: "MONTHLY REVENUE", value: "$285K", change: "+23%", positive: true },
    { label: "COMPLETION RATE", value: "94%", change: "-2%", positive: false },
  ]

  return (
    <>
      {/* System Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "25px",
          marginBottom: "50px",
        }}
      >
        {systemStats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "30px",
              borderRadius: "0px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(57, 255, 20, 0.05)"
              e.currentTarget.style.borderColor = "#39FF14"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
            }}
          >
            <div
              className="aeonik-mono"
              style={{
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.5)",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              {stat.label}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div
                className="aeonik-mono"
                style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "#39FF14", fontWeight: 600, lineHeight: "1" }}
              >
                {stat.value}
              </div>
              <div
                className="aeonik-mono"
                style={{
                  fontSize: "14px",
                  color: stat.positive ? "#39FF14" : "#FF6B6B",
                  fontWeight: 600,
                }}
              >
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
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
        RECENT ACTIVITY
      </h3>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "30px",
          borderRadius: "0px",
        }}
      >
        {[
          { action: "New user registration", user: "alice@example.com", time: "5 minutes ago" },
          { action: "Project completed", user: "TechCorp Project", time: "1 hour ago" },
          { action: "Payment received", user: "$12,500", time: "2 hours ago" },
          { action: "Meeting scheduled", user: "Design Review", time: "3 hours ago" },
        ].map((activity, index) => (
          <div
            key={index}
            style={{
              padding: "15px 0",
              borderBottom: index < 3 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className="aeonik-mono" style={{ fontSize: "15px", color: "#FFF", marginBottom: "5px", textTransform: "uppercase" }}>
                {activity.action}
              </div>
              <div className="aeonik-mono" style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>
                {activity.user}
              </div>
            </div>
            <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>
              {activity.time}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Analytics
