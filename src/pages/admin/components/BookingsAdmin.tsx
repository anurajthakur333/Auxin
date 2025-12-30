import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import DatePicker from "../../../components/ui/DatePicker"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Appointment {
  id: string
  _id?: string
  userId: string
  userEmail: string
  userName: string
  date: string
  time: string
  timezone?: string
  status: "pending" | "confirmed" | "cancelled"
  paymentStatus: "pending" | "completed" | "failed" | "refunded"
  paymentInfo?: {
    amount: string
    currency: string
    paypalOrderId?: string
  }
  duration?: number
  googleMeetLink?: string
  createdAt: string
}

interface Summary {
  confirmed: number
  pending: number
  cancelled: number
  paidCount: number
  unpaidCount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const BookingsAdmin = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all")
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "completed" | "failed" | "refunded">("all")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchAppointments()
  }, [currentPage, statusFilter, paymentFilter, dateFilter, searchQuery])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setMessage({ type: "error", text: "ADMIN AUTHENTICATION REQUIRED" })
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      params.append("limit", "20")
      
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (paymentFilter !== "all") params.append("paymentStatus", paymentFilter)
      if (dateFilter) params.append("date", dateFilter)
      if (searchQuery.trim()) params.append("search", searchQuery.trim())

      const response = await fetch(`${API_BASE_URL}/api/appointments/admin/all?${params}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
        setSummary(data.summary || null)
        setPagination(data.pagination || null)
      } else {
        const errorData = await response.json().catch(() => ({ error: "FAILED TO FETCH BOOKINGS" }))
        setMessage({ type: "error", text: errorData.error || `HTTP ERROR! STATUS: ${response.status}` })
        setAppointments([])
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      setMessage({ type: "error", text: error instanceof Error ? error.message : "NETWORK ERROR" })
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPaymentFilter("all")
    setDateFilter("")
    setCurrentPage(1)
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).toUpperCase()
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).toUpperCase()
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#39FF14"
      case "pending":
        return "#FFA500"
      case "cancelled":
        return "#FF0000"
      default:
        return "#FFF"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#39FF14"
      case "pending":
        return "#FFA500"
      case "failed":
        return "#FF0000"
      case "refunded":
        return "#3B82F6"
      default:
        return "#FFF"
    }
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2
          className="aeonik-mono"
          style={{
            fontSize: "24px",
            color: "#FFF",
            fontWeight: 600,
            letterSpacing: "-1px",
          }}
        >
          {"CLIENT BOOKINGS"}
        </h2>
        <button
          onClick={() => {
            playClickSound()
            fetchAppointments()
          }}
          className="aeonik-mono"
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid #39FF14",
            color: "#39FF14",
            fontSize: "12px",
            cursor: "pointer",
            letterSpacing: "1px",
            transition: "all 0.3s ease",
          }}
        >
          {"REFRESH"}
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              background: "rgba(57, 255, 20, 0.1)",
              border: "1px solid #39FF14",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <p className="aeonik-mono" style={{ fontSize: "28px", color: "#39FF14", fontWeight: 600 }}>
              {summary.confirmed}
            </p>
            <p className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>
              {"CONFIRMED"}
            </p>
          </div>
          <div
            style={{
              background: "rgba(255, 165, 0, 0.1)",
              border: "1px solid #FFA500",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <p className="aeonik-mono" style={{ fontSize: "28px", color: "#FFA500", fontWeight: 600 }}>
              {summary.pending}
            </p>
            <p className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>
              {"PENDING"}
            </p>
          </div>
          <div
            style={{
              background: "rgba(255, 0, 0, 0.1)",
              border: "1px solid #FF0000",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <p className="aeonik-mono" style={{ fontSize: "28px", color: "#FF0000", fontWeight: 600 }}>
              {summary.cancelled}
            </p>
            <p className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>
              {"CANCELLED"}
            </p>
          </div>
          <div
            style={{
              background: "rgba(57, 255, 20, 0.1)",
              border: "1px solid #39FF14",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <p className="aeonik-mono" style={{ fontSize: "28px", color: "#39FF14", fontWeight: 600 }}>
              {summary.paidCount}
            </p>
            <p className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>
              {"PAID"}
            </p>
          </div>
          <div
            style={{
              background: "rgba(255, 165, 0, 0.1)",
              border: "1px solid #FFA500",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <p className="aeonik-mono" style={{ fontSize: "28px", color: "#FFA500", fontWeight: 600 }}>
              {summary.unpaidCount}
            </p>
            <p className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>
              {"UNPAID"}
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className="aeonik-mono"
          style={{
            padding: "15px 20px",
            marginBottom: "20px",
            background: message.type === "success" ? "rgba(57, 255, 20, 0.1)" : "rgba(255, 0, 0, 0.1)",
            border: `1px solid ${message.type === "success" ? "#39FF14" : "#FF0000"}`,
            color: message.type === "success" ? "#39FF14" : "#FF0000",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "20px",
          marginBottom: "25px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <span className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px" }}>
            {"FILTERS"}
          </span>
          <button
            onClick={() => {
              playClickSound()
              clearFilters()
            }}
            className="aeonik-mono"
            style={{
              padding: "6px 12px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFF",
              fontSize: "11px",
              cursor: "pointer",
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
            {"CLEAR"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              {"SEARCH NAME/EMAIL"}
            </label>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="SEARCH..."
            />
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              {"STATUS"}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter)
                setCurrentPage(1)
              }}
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFF",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <option value="all" style={{ background: "#000" }}>{"ALL"}</option>
              <option value="confirmed" style={{ background: "#000" }}>{"CONFIRMED"}</option>
              <option value="pending" style={{ background: "#000" }}>{"PENDING"}</option>
              <option value="cancelled" style={{ background: "#000" }}>{"CANCELLED"}</option>
            </select>
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              {"PAYMENT STATUS"}
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value as typeof paymentFilter)
                setCurrentPage(1)
              }}
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFF",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <option value="all" style={{ background: "#000" }}>{"ALL"}</option>
              <option value="completed" style={{ background: "#000" }}>{"COMPLETED"}</option>
              <option value="pending" style={{ background: "#000" }}>{"PENDING"}</option>
              <option value="failed" style={{ background: "#000" }}>{"FAILED"}</option>
              <option value="refunded" style={{ background: "#000" }}>{"REFUNDED"}</option>
            </select>
          </div>

          <div>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
              {"DATE"}
            </label>
            <DatePicker
              value={dateFilter}
              onChange={(value) => {
                setDateFilter(value)
                setCurrentPage(1)
              }}
              placeholder="SELECT DATE"
            />
          </div>
        </div>

        {/* Results count */}
        {pagination && (
          <div style={{ marginTop: "15px" }}>
            <span className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
              {`SHOWING ${appointments.length} OF ${pagination.total} BOOKINGS`}
            </span>
          </div>
        )}
      </div>

      {/* Bookings List */}
      {loading ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"LOADING..."}
        </p>
      ) : appointments.length === 0 ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"NO BOOKINGS FOUND"}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {appointments.map((appointment) => (
            <div
              key={appointment.id || appointment._id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                {/* Client Info */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <h3 className="aeonik-mono" style={{ fontSize: "16px", color: "#FFF", fontWeight: 600, marginBottom: "5px" }}>
                    {appointment.userName}
                  </h3>
                  <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>
                    {appointment.userEmail}
                  </p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <span
                      className="aeonik-mono"
                      style={{
                        padding: "4px 10px",
                        fontSize: "10px",
                        color: getStatusColor(appointment.status),
                        background: `${getStatusColor(appointment.status)}20`,
                        border: `1px solid ${getStatusColor(appointment.status)}`,
                        letterSpacing: "1px",
                      }}
                    >
                      {appointment.status.toUpperCase()}
                    </span>
                    <span
                      className="aeonik-mono"
                      style={{
                        padding: "4px 10px",
                        fontSize: "10px",
                        color: getPaymentStatusColor(appointment.paymentStatus),
                        background: `${getPaymentStatusColor(appointment.paymentStatus)}20`,
                        border: `1px solid ${getPaymentStatusColor(appointment.paymentStatus)}`,
                        letterSpacing: "1px",
                      }}
                    >
                      {`PAYMENT: ${appointment.paymentStatus.toUpperCase()}`}
                    </span>
                  </div>
                </div>

                {/* Appointment Details */}
                <div style={{ textAlign: "right", minWidth: "180px" }}>
                  <p className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF", fontWeight: 600 }}>
                    {formatDate(appointment.date)}
                  </p>
                  <p className="aeonik-mono" style={{ fontSize: "20px", color: "#39FF14", fontWeight: 600 }}>
                    {appointment.time}
                  </p>
                  {appointment.duration && (
                    <p className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                      {`${appointment.duration} MIN`}
                    </p>
                  )}
                  {appointment.paymentInfo?.amount && (
                    <p className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14", marginTop: "5px" }}>
                      {`$${appointment.paymentInfo.amount} ${appointment.paymentInfo.currency || "USD"}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <p className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                    {`BOOKED: ${formatDateTime(appointment.createdAt)}`}
                  </p>
                  {appointment.googleMeetLink && (
                    <a
                      href={appointment.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aeonik-mono"
                      style={{
                        padding: "6px 12px",
                        fontSize: "10px",
                        color: "#39FF14",
                        background: "rgba(57, 255, 20, 0.1)",
                        border: "1px solid #39FF14",
                        textDecoration: "none",
                        letterSpacing: "1px",
                      }}
                    >
                      {"JOIN MEETING"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                onClick={() => {
                  playClickSound()
                  setCurrentPage(1)
                }}
                disabled={currentPage === 1}
                className="aeonik-mono"
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: currentPage === 1 ? "rgba(255,255,255,0.3)" : "#FFF",
                  fontSize: "11px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"«"}
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }}
                disabled={currentPage === 1}
                className="aeonik-mono"
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: currentPage === 1 ? "rgba(255,255,255,0.3)" : "#FFF",
                  fontSize: "11px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"‹ PREV"}
              </button>

              <span
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  color: "#FFF",
                  letterSpacing: "1px",
                }}
              >
                {`PAGE ${currentPage} OF ${pagination.pages}`}
              </span>

              <button
                onClick={() => {
                  playClickSound()
                  setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))
                }}
                disabled={currentPage === pagination.pages}
                className="aeonik-mono"
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: currentPage === pagination.pages ? "rgba(255,255,255,0.3)" : "#FFF",
                  fontSize: "11px",
                  cursor: currentPage === pagination.pages ? "not-allowed" : "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"NEXT ›"}
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  setCurrentPage(pagination.pages)
                }}
                disabled={currentPage === pagination.pages}
                className="aeonik-mono"
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: currentPage === pagination.pages ? "rgba(255,255,255,0.3)" : "#FFF",
                  fontSize: "11px",
                  cursor: currentPage === pagination.pages ? "not-allowed" : "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"»"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BookingsAdmin

