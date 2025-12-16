const Settings = () => {
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
        SYSTEM SETTINGS
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {[
          {
            title: "Email Notifications",
            description: "Configure system email notifications",
            status: "enabled",
          },
          { title: "Payment Gateway", description: "Manage PayPal and Stripe integration", status: "active" },
          { title: "API Access", description: "Control API access and rate limits", status: "active" },
          {
            title: "Backup & Security",
            description: "Database backups and security settings",
            status: "enabled",
          },
        ].map((setting, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "25px",
              borderRadius: "0px",
              transition: "all 0.3s ease",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
              e.currentTarget.style.borderColor = "#39FF14"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
            }}
          >
            <div>
              <div
                className="aeonik-mono"
                style={{ fontSize: "18px", color: "#FFF", fontWeight: 600, marginBottom: "5px", textTransform: "uppercase" }}
              >
                {setting.title}
              </div>
              <div className="aeonik-mono" style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>
                {setting.description}
              </div>
            </div>
            <div
              className="aeonik-mono"
              style={{
                fontSize: "11px",
                color: "#39FF14",
                textTransform: "uppercase",
                letterSpacing: "1px",
                padding: "6px 12px",
                border: "1px solid #39FF14",
                borderRadius: "0px",
              }}
            >
              {setting.status}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Settings
