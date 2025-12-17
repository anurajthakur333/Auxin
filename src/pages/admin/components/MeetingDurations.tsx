import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"

interface MeetingDuration {
  _id?: string
  minutes: number
  label: string
  price: number
  isActive: boolean
}

const MeetingDurations = () => {
  const [durations, setDurations] = useState<MeetingDuration[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<MeetingDuration>({
    minutes: 45,
    label: "",
    price: 0,
    isActive: true,
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchDurations()
  }, [])

  const fetchDurations = async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/meeting-durations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDurations(data.durations || [])
      } else {
        // If endpoint doesn't exist yet, use default durations
        setDurations([
          { minutes: 45, label: "45 MINUTES", price: 50, isActive: true },
          { minutes: 90, label: "1.5 HOURS", price: 90, isActive: true },
          { minutes: 120, label: "2 HOURS", price: 150, isActive: true },
          { minutes: 180, label: "3 HOURS", price: 200, isActive: true },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch durations:", error)
      // Use default durations on error
      setDurations([
        { minutes: 45, label: "45 MINUTES", price: 50, isActive: true },
        { minutes: 90, label: "1.5 HOURS", price: 90, isActive: true },
        { minutes: 120, label: "2 HOURS", price: 150, isActive: true },
        { minutes: 180, label: "3 HOURS", price: 200, isActive: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const url = editingId
        ? `${API_BASE_URL}/api/admin/meeting-durations/${editingId}`
        : `${API_BASE_URL}/api/admin/meeting-durations`

      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          ...formData,
          label: formData.label.toUpperCase(),
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: editingId ? "DURATION UPDATED" : "DURATION CREATED" })
        setEditingId(null)
        setFormData({ minutes: 45, label: "", price: 0, isActive: true })
        fetchDurations()
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

  const handleDelete = async (id: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS DURATION?")) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/meeting-durations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "DURATION DELETED" })
        fetchDurations()
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

  const handleEdit = (duration: MeetingDuration) => {
    setEditingId(duration._id || null)
    setFormData(duration)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ minutes: 45, label: "", price: 0, isActive: true })
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/meeting-durations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        fetchDurations()
      }
    } catch (error) {
      console.error("Toggle error:", error)
    }
  }

  if (loading) {
    return (
      <div className="aeonik-mono" style={{ color: "#39FF14", textAlign: "center", padding: "40px" }}>
        LOADING...
      </div>
    )
  }

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
        MEETING DURATIONS
      </h3>

      {message && (
        <div
          className="aeonik-mono"
          style={{
            padding: "15px 20px",
            marginBottom: "20px",
            background: message.type === "success" ? "rgba(57, 255, 20, 0.1)" : "rgba(255, 107, 107, 0.1)",
            border: `1px solid ${message.type === "success" ? "#39FF14" : "#FF6B6B"}`,
            color: message.type === "success" ? "#39FF14" : "#FF6B6B",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "25px",
          marginBottom: "30px",
        }}
      >
        <div
          className="aeonik-mono"
          style={{ fontSize: "16px", color: "#FFF", marginBottom: "20px", fontWeight: 600 }}
        >
          {editingId ? "EDIT DURATION" : "ADD NEW DURATION"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: "8px", letterSpacing: "1px" }}>
              DURATION (MINUTES)
            </label>
            <input
              type="number"
              value={formData.minutes}
              onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
              style={{
                width: "100%",
                padding: "10px",
                background: "#222",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFF",
                fontFamily: "Aeonik, sans-serif",
                fontSize: "14px",
              }}
              min="15"
              step="15"
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: "8px", letterSpacing: "1px" }}>
              LABEL
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="E.G. 1.5 HOURS"
              style={{
                width: "100%",
                padding: "10px",
                background: "#222",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFF",
                fontFamily: "Aeonik, sans-serif",
                fontSize: "14px",
                textTransform: "uppercase",
              }}
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: "8px", letterSpacing: "1px" }}>
              PRICE ($)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              style={{
                width: "100%",
                padding: "10px",
                background: "#222",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFF",
                fontFamily: "Aeonik, sans-serif",
                fontSize: "14px",
              }}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
          <button
            onClick={handleSave}
            className="aeonik-mono"
            style={{
              padding: "12px 24px",
              background: "#39FF14",
              color: "#000",
              border: "none",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "1px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2ecc11"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#39FF14"
            }}
          >
            {editingId ? "UPDATE" : "ADD"}
          </button>

          {editingId && (
            <button
              onClick={handleCancel}
              className="aeonik-mono"
              style={{
                padding: "12px 24px",
                background: "transparent",
                color: "#FFF",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "1px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#FFF"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"
              }}
            >
              CANCEL
            </button>
          )}
        </div>
      </div>

      {/* Durations List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {durations.map((duration) => (
          <div
            key={duration._id || duration.minutes}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 0.3s ease",
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
            <div style={{ flex: 1 }}>
              <div className="aeonik-mono" style={{ fontSize: "16px", color: "#FFF", fontWeight: 600, marginBottom: "5px" }}>
                {duration.label || `${duration.minutes} MINUTES`}
              </div>
              <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                {duration.minutes} MINUTES • ${duration.price.toFixed(2)}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={() => toggleActive(duration._id || "", duration.isActive)}
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  background: duration.isActive ? "rgba(57, 255, 20, 0.1)" : "rgba(255, 255, 255, 0.05)",
                  color: duration.isActive ? "#39FF14" : "rgba(255, 255, 255, 0.5)",
                  border: `1px solid ${duration.isActive ? "#39FF14" : "rgba(255, 255, 255, 0.2)"}`,
                  fontSize: "10px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
              >
                {duration.isActive ? "ACTIVE" : "INACTIVE"}
              </button>

              <button
                onClick={() => handleEdit(duration)}
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "#39FF14",
                  border: "1px solid #39FF14",
                  fontSize: "10px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#39FF14"
                  e.currentTarget.style.color = "#000"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#39FF14"
                }}
              >
                EDIT
              </button>

              <button
                onClick={() => duration._id && handleDelete(duration._id)}
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "#FF6B6B",
                  border: "1px solid #FF6B6B",
                  fontSize: "10px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FF6B6B"
                  e.currentTarget.style.color = "#FFF"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#FF6B6B"
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default MeetingDurations

