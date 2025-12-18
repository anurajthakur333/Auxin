import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

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
    minutes: 30,
    label: "",
    price: 0,
    isActive: true,
  })
  const [priceInput, setPriceInput] = useState<string>("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [durationToDelete, setDurationToDelete] = useState<MeetingDuration | null>(null)
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  useEffect(() => {
    fetchDurations()
  }, [])

  const fetchDurations = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setMessage({ type: "error", text: "ADMIN AUTHENTICATION REQUIRED" })
        setLoading(false)
        return
      }

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
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch durations" }))
        setMessage({ type: "error", text: errorData.error || `HTTP error! status: ${response.status}` })
        setDurations([])
      }
    } catch (error) {
      console.error("Failed to fetch durations:", error)
      setMessage({ type: "error", text: error instanceof Error ? error.message : "NETWORK ERROR" })
      setDurations([])
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
          price: Math.round(formData.price || 0), // Round to integer, ensure it's a number
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: editingId ? "DURATION UPDATED" : "DURATION CREATED" })
        setEditingId(null)
        setFormData({ minutes: 30, label: "", price: 0, isActive: true })
        setPriceInput("")
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

  const handleDelete = async (duration: MeetingDuration) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      setDeletingId(duration._id || null)

      const response = await fetch(`${API_BASE_URL}/api/admin/meeting-durations/${duration._id}`, {
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
    } finally {
      setDeletingId(null)
    }
  }

  const openDeleteDialog = (duration: MeetingDuration) => {
    setDurationToDelete(duration)
  }

  const cancelDeleteDialog = () => {
    setDurationToDelete(null)
  }

  const confirmDeleteDialog = async () => {
    if (!durationToDelete) return
    await handleDelete(durationToDelete)
    setDurationToDelete(null)
  }

  const handleEdit = (duration: MeetingDuration) => {
    setEditingId(duration._id || null)
    setFormData(duration)
    setPriceInput(Math.round(duration.price).toString())
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ minutes: 30, label: "", price: 0, isActive: true })
    setPriceInput("")
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
          MEETING DURATIONS
        </h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => {
              playClickSound()
              fetchDurations()
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
        </div>
      </div>

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
          borderRadius: "0px",
          padding: "20px",
          marginBottom: "25px",
        }}
      >
        <div
          className="aeonik-mono"
          style={{ fontSize: "16px", color: "#FFF", marginBottom: "20px", fontWeight: 600, letterSpacing: "1px" }}
        >
          {editingId ? "EDIT DURATION" : "ADD NEW DURATION"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block", letterSpacing: "1px" }}>
              DURATION (MINUTES)
            </label>
            <Input
              type="number"
              value={formData.minutes}
              onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
              placeholder="30"
              min="30"
              step="30"
              style={{ textTransform: "none" }}
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block", letterSpacing: "1px" }}>
              LABEL
            </label>
            <Input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="E.G. 1.5 HOURS"
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block", letterSpacing: "1px" }}>
              PRICE ($)
            </label>
            <Input
              type="number"
              value={priceInput || formData.price || ""}
              onChange={(e) => {
                const value = e.target.value;
                setPriceInput(value);
                // Update formData with rounded value
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue >= 0) {
                  setFormData({ ...formData, price: Math.round(numValue) });
                } else if (value === '' || value === '-') {
                  setFormData({ ...formData, price: 0 });
                }
              }}
              onBlur={(e) => {
                // Round on blur and sync input
                const value = parseFloat(e.target.value) || 0;
                const rounded = Math.round(value);
                setFormData({ ...formData, price: rounded });
                setPriceInput(rounded.toString());
              }}
              placeholder="0"
              min="0"
              step="1"
              style={{ textTransform: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
          <button
            onClick={() => {
              playClickSound()
              handleSave()
            }}
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
              borderRadius: "0px",
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
              onClick={() => {
                playClickSound()
                handleCancel()
              }}
              className="aeonik-mono"
              style={{
                padding: "12px 24px",
                background: "transparent",
                color: "#FFF",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "1px",
                transition: "all 0.3s ease",
                borderRadius: "0px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#FFF"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
              }}
            >
              CANCEL
            </button>
          )}
        </div>
      </div>

      {/* Durations List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {durations.map((duration, index) => (
          <div
            key={duration._id || duration.minutes}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: index === 0 && duration.isActive ? "1px solid #39FF14" : "1px solid rgba(255, 255, 255, 0.1)",
              padding: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 0.3s ease",
              borderRadius: "0px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
              if (index !== 0 || !duration.isActive) {
                e.currentTarget.style.borderColor = "#39FF14"
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
              e.currentTarget.style.borderColor = index === 0 && duration.isActive ? "#39FF14" : "rgba(255, 255, 255, 0.1)"
            }}
          >
            <div style={{ flex: 1 }}>
              <div className="aeonik-mono" style={{ fontSize: "clamp(18px, 2vw, 24px)", color: "#FFF", fontWeight: 600, marginBottom: "5px", letterSpacing: "-1px" }}>
                {duration.label || `${duration.minutes} MINUTES`}
              </div>
              <div className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)" }}>
                {duration.minutes} MINUTES • ${Math.round(duration.price)}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={() => {
                  playClickSound()
                  toggleActive(duration._id || "", duration.isActive)
                }}
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  background: duration.isActive ? "#39FF14" : "transparent",
                  color: duration.isActive ? "#000" : "#FFF",
                  border: `1px solid ${duration.isActive ? "#39FF14" : "rgba(255, 255, 255, 0.2)"}`,
                  fontSize: "11px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderRadius: "0px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!duration.isActive) {
                    e.currentTarget.style.borderColor = "#39FF14"
                    e.currentTarget.style.color = "#39FF14"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!duration.isActive) {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                    e.currentTarget.style.color = "#FFF"
                  }
                }}
              >
                ACTIVE
              </button>

              <button
                onClick={() => {
                  playClickSound()
                  handleEdit(duration)
                }}
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "#39FF14",
                  border: "1px solid #39FF14",
                  fontSize: "11px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderRadius: "0px",
                  transition: "all 0.2s ease",
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
                onClick={() => {
                  playClickSound()
                  openDeleteDialog(duration)
                }}
                disabled={deletingId === duration._id}
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "#FF0000",
                  border: "1px solid #FF0000",
                  fontSize: "11px",
                  cursor: deletingId === duration._id ? "default" : "pointer",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderRadius: "0px",
                  opacity: deletingId === duration._id ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (deletingId !== duration._id) {
                    e.currentTarget.style.background = "#FF0000"
                    e.currentTarget.style.color = "#FFF"
                  }
                }}
                onMouseLeave={(e) => {
                  if (deletingId !== duration._id) {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.color = "#FF0000"
                  }
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && durations.length === 0 && (
        <div
          className="aeonik-mono"
          style={{
            padding: "40px",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
          }}
        >
          No meeting durations found. Add a new duration to get started.
        </div>
      )}

      {/* Delete Duration Confirmation Dialog */}
      {durationToDelete && (
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
                THIS ACTION CANNOT BE UNDONE. THIS WILL PERMANENTLY DELETE{" "}
                <span style={{ color: "#FF0000" }}>
                  {durationToDelete.label || `${durationToDelete.minutes} MINUTES`}
                </span>{" "}
                AND REMOVE IT FROM OUR SERVERS.
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
                disabled={deletingId === durationToDelete._id}
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  borderRadius: "0px",
                  border: "1px solid #FF0000",
                  background: "transparent",
                  color: "#FF0000",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: deletingId === durationToDelete._id ? "default" : "pointer",
                  opacity: deletingId === durationToDelete._id ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (deletingId !== durationToDelete._id) {
                    e.currentTarget.style.background = "rgba(255, 0, 0, 0.1)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                DELETE DURATION
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MeetingDurations

