import { useState, useEffect } from "react"
import { API_BASE_URL, getAuthToken } from "../../../lib/apiConfig"

interface Project {
  id: string
  name: string
  projectCode?: string
  status: "active" | "pending" | "completed"
  progress: number
  deadline: string
}

interface Appointment {
  _id?: string
  id?: string
  title?: string
  date: string
  time: string
  status?: 'confirmed' | 'pending' | 'cancelled'
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded'
  googleMeetLink?: string
  createdAt?: string
}

interface Notification {
  id: string
  message: string
  time: string
  read: boolean
}

const Overview = () => {

  const [projects, setProjects] = useState<Project[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [requestingLinkId, setRequestingLinkId] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
    fetchProjects()
    fetchNotifications()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/projects/my-projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        const formattedProjects = (data.projects || []).map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          projectCode: p.projectCode,
          status: p.status,
          progress: p.progress || 0,
          deadline: p.deadline ? new Date(p.deadline).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }))
        setProjects(formattedProjects.filter((p: Project) => p.status === "active").slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/appointments/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📋 Fetched appointments:', data.appointments?.length || 0, 'total')
        console.log('📋 First appointment:', data.appointments?.[0])
        console.log('📋 First appointment has googleMeetLink:', !!data.appointments?.[0]?.googleMeetLink)
        console.log('📋 First appointment googleMeetLink value:', data.appointments?.[0]?.googleMeetLink)
        console.log('📋 First appointment date:', data.appointments?.[0]?.date)
        console.log('📋 First appointment time:', data.appointments?.[0]?.time)
        console.log('📋 First appointment status:', data.appointments?.[0]?.status)
        console.log('📋 First appointment paymentStatus:', data.appointments?.[0]?.paymentStatus)
        
        // Filter only confirmed and upcoming appointments
        const upcomingAppointments = (data.appointments || []).filter((apt: Appointment) => {
          // Check status and payment
          if (apt.status !== 'confirmed' || apt.paymentStatus !== 'completed') {
            console.log('❌ Filtered out - status:', apt.status, 'paymentStatus:', apt.paymentStatus)
            return false
          }
          
          // Parse date correctly - handle both ISO strings and date strings
          let dateStr: string
          if (typeof apt.date === 'string') {
            // If it's an ISO string like "2025-12-30T00:00:00.000Z", extract just the date part
            dateStr = apt.date.includes('T') ? apt.date.split('T')[0] : apt.date
          } else {
            // If it's a Date object, convert to YYYY-MM-DD
            dateStr = new Date(apt.date).toISOString().split('T')[0]
          }
          
          // Combine date and time - ensure time is in HH:MM format
          const timeStr = apt.time.includes(':') ? apt.time : `${apt.time.slice(0, 2)}:${apt.time.slice(2)}`
          const [hours, minutes] = timeStr.split(':')
          const timeFormatted = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
          
          const appointmentDateTime = new Date(`${dateStr}T${timeFormatted}:00`)
          const now = new Date()
          
          // Check if appointment is in the future
          const isUpcoming = appointmentDateTime > now
          
          console.log('📅 Checking appointment:', {
            dateStr,
            time: apt.time,
            timeFormatted,
            appointmentDateTime: appointmentDateTime.toISOString(),
            now: now.toISOString(),
            isUpcoming,
            appointmentDate: appointmentDateTime.getTime(),
            nowTime: now.getTime(),
            diff: appointmentDateTime.getTime() - now.getTime()
          })
          
          return isUpcoming
        })
        
        console.log('📋 Upcoming appointments:', upcomingAppointments.length)
        const withLinks = upcomingAppointments.filter((apt: Appointment) => apt.googleMeetLink)
        console.log('📋 Appointments with Meet links:', withLinks.length)
        if (withLinks.length > 0) {
          console.log('📋 Sample Meet link:', withLinks[0].googleMeetLink)
        }
        
        // If no upcoming appointments, show all confirmed appointments (for debugging)
        if (upcomingAppointments.length === 0) {
          const confirmedAppointments = (data.appointments || []).filter((apt: Appointment) => {
            return apt.status === 'confirmed' && apt.paymentStatus === 'completed'
          })
          console.log('📋 Confirmed appointments (not filtered by date):', confirmedAppointments.length)
          if (confirmedAppointments.length > 0) {
            console.log('📋 Sample confirmed appointment:', {
              date: confirmedAppointments[0].date,
              time: confirmedAppointments[0].time,
              dateType: typeof confirmedAppointments[0].date
            })
          }
        }
        
        setAppointments(upcomingAppointments.slice(0, 5)) // Limit to 5 upcoming
      } else {
        console.error('❌ Failed to fetch appointments:', response.status)
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const requestNewMeetingLink = async (appointmentId: string) => {
    try {
      if (!appointmentId) {
        console.error('❌ No appointment ID provided')
        alert('ERROR: NO APPOINTMENT ID FOUND')
        return
      }

      setRequestingLinkId(appointmentId)
      const token = getAuthToken()
      if (!token) {
        alert('AUTHENTICATION REQUIRED. PLEASE LOG IN AGAIN.')
        setRequestingLinkId(null)
        return
      }

      console.log('🔄 Requesting new meeting link for appointment:', appointmentId)
      console.log('🌐 API URL:', `${API_BASE_URL}/api/appointments/${appointmentId}/request-meet-link`)

      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/request-meet-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📊 Response status:', response.status)
      console.log('📊 Response ok:', response.ok)

      const responseText = await response.text()
      console.log('📊 Response text:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError)
        alert(`SERVER ERROR: ${responseText || 'Invalid response format'}`)
        setRequestingLinkId(null)
        return
      }

      if (response.ok) {
        console.log('✅ New meeting link generated:', data)
        const meetLink = data.googleMeetLink || data.appointment?.googleMeetLink
        if (meetLink) {
          console.log('✅ Meet link received:', meetLink)
        } else {
          console.warn('⚠️ No Meet link in response:', data)
        }
        await fetchAppointments() // Refresh appointments
        alert('NEW MEETING LINK GENERATED SUCCESSFULLY')
      } else {
        console.error('❌ Failed to request new link:', data)
        const errorMessage = data.error || data.message || data.details || `HTTP ${response.status}: ${responseText}`
        const errorCode = data.code || 'UNKNOWN_ERROR'
        console.error('❌ Error code:', errorCode)
        console.error('❌ Error details:', data.details || errorMessage)
        alert(`FAILED TO GENERATE LINK: ${errorMessage}`)
      }
    } catch (error) {
      console.error('💥 Error requesting new meeting link:', error)
      alert(`NETWORK ERROR: ${error instanceof Error ? error.message : 'PLEASE TRY AGAIN'}`)
    } finally {
      setRequestingLinkId(null)
    }
  }

  const getAppointmentId = (appointment: Appointment): string | null => {
    return appointment._id || appointment.id || null
  }

  const formatDate = (dateStr: string | Date): string => {
    // Handle both string and Date object
    let date: Date
    if (typeof dateStr === 'string') {
      // If it's an ISO string, extract just the date part
      const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
      date = new Date(dateOnly)
    } else {
      date = dateStr
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string): string => {
    // If already formatted, return as is
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr
    }
    // Otherwise format from 24hr to 12hr
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const fetchNotifications = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/notifications?limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        const formattedNotifications = (data.notifications || []).map((n: any) => ({
          id: n.id || n._id,
          message: n.message,
          time: n.time || 'JUST NOW',
          read: n.read || false,
        }))
        setNotifications(formattedNotifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#39FF14"
      case "pending":
        return "#FFD700"
      case "completed":
        return "#00CED1"
      default:
        return "#FFF"
    }
  }

  return (
    <>
      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "25px",
          marginBottom: "50px",
        }}
      >
        {/* Active Projects Stat */}
        <div
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
            style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "#39FF14", fontWeight: 600, lineHeight: "1" }}
          >
            {projects.filter((p) => p.status === "active").length}
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "10px", letterSpacing: "1px" }}
          >
            ACTIVE PROJECTS
          </div>
        </div>

        {/* Upcoming Meetings Stat - hidden for now */}

        {/* Notifications Stat */}
        <div
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
            style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "#39FF14", fontWeight: 600, lineHeight: "1" }}
          >
            {notifications.filter((n) => !n.read).length}
          </div>
          <div
            className="aeonik-mono"
            style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "10px", letterSpacing: "1px" }}
          >
            NEW NOTIFICATIONS
          </div>
        </div>
      </div>

      {/* Main Content Grid - 2 Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "30px",
          marginBottom: "50px",
        }}
      >
        {/* Active Projects Section */}
        <div>
          <h2
            className="aeonik-mono"
            style={{
              fontSize: "clamp(20px, 2.5vw, 28px)",
              color: "#FFF",
              marginBottom: "25px",
              letterSpacing: "-1px",
              fontWeight: 600,
            }}
          >
            ACTIVE PROJECTS
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "20px",
                  borderRadius: "0px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                  e.currentTarget.style.borderColor = getStatusColor(project.status)
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <div
                      className="aeonik-mono"
                      style={{ fontSize: "15px", color: "#FFF", fontWeight: 600, marginBottom: "5px" }}
                    >
                      {project.name}
                    </div>
                    <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                      DUE: {new Date(project.deadline).toLocaleDateString().toUpperCase()}
                    </div>
                  </div>
                  <div
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      color: getStatusColor(project.status),
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "4px 10px",
                      border: `1px solid ${getStatusColor(project.status)}`,
                      borderRadius: "0px",
                    }}
                  >
                    {project.status}
                  </div>
                </div>

                {/* Progress Bar - segmented UI to match projects grid */}
                <div style={{ marginTop: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                      PROGRESS
                    </span>
                    <span className="aeonik-mono" style={{ fontSize: "12px", color: "#39FF14", fontWeight: 600 }}>
                      {project.progress}%
                    </span>
                  </div>
                  {(() => {
                    const totalSegments = 50;
                    const activeSegments = Math.round((project.progress / 100) * totalSegments);
                    return (
                      <div
                        style={{
                          width: "100%",
                          padding: "4px 0",
                          background: "transparent",
                          borderRadius: "0px",
                          border: "none",
                          display: "flex",
                          gap: "3px",
                        }}
                      >
                        {Array.from({ length: totalSegments }).map((_, index) => {
                          const filled = index < activeSegments;
                          return (
                            <div
                              key={index}
                              style={{
                                flex: 1,
                                height: "100px",
                                borderRadius: "0px",
                                background: filled ? "#39FF14" : "rgba(255, 255, 255, 0.25)",
                                opacity: filled ? 1 : 0.8,
                                transition: "background 0.3s ease, opacity 0.3s ease",
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings Section - hidden for now */}
        {false && (
        <div>
          <h2
            className="aeonik-mono"
            style={{
              fontSize: "clamp(20px, 2.5vw, 28px)",
              color: "#FFF",
              marginBottom: "25px",
              letterSpacing: "-1px",
              fontWeight: 600,
            }}
          >
            UPCOMING MEETINGS
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {appointments.length === 0 ? (
              <div className="aeonik-mono" style={{ color: "rgba(255, 255, 255, 0.5)", padding: "20px", textAlign: "center" }}>
                NO UPCOMING MEETINGS
              </div>
            ) : (
              appointments.map((appointment) => {
                const appointmentId = getAppointmentId(appointment)
                console.log('📅 Rendering appointment:', {
                  id: appointmentId,
                  date: appointment.date,
                  time: appointment.time,
                  hasLink: !!appointment.googleMeetLink,
                  link: appointment.googleMeetLink,
                  status: appointment.status,
                  paymentStatus: appointment.paymentStatus
                })
                return (
                  <div
                    key={appointmentId || appointment.date}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      padding: "20px",
                      borderRadius: "0px",
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
                    <div
                      className="aeonik-mono"
                      style={{ fontSize: "15px", color: "#FFF", fontWeight: 600, marginBottom: "10px" }}
                    >
                      {appointment.title || "MEETING"}
                    </div>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "10px" }}>
                      <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                        📅 {formatDate(appointment.date).toUpperCase()}
                      </div>
                      <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                        🕒 {formatTime(appointment.time).toUpperCase()}
                      </div>
                    </div>

                    {/* Google Meet Link Section */}
                    {appointment.status === 'confirmed' && appointment.paymentStatus === 'completed' && (
                      <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {appointment.googleMeetLink ? (
                          <>
                            <a
                              href={appointment.googleMeetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="aeonik-mono"
                              style={{
                                padding: "8px 16px",
                                background: "#39FF14",
                                color: "#000",
                                textDecoration: "none",
                                fontSize: "11px",
                                fontWeight: 600,
                                letterSpacing: "1px",
                                transition: "all 0.3s ease",
                                display: "inline-block",
                                border: "1px solid #39FF14",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#2ecc11"
                                e.currentTarget.style.borderColor = "#2ecc11"
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#39FF14"
                                e.currentTarget.style.borderColor = "#39FF14"
                              }}
                            >
                              JOIN MEETING
                            </a>
                            {appointmentId ? (
                              <button
                                onClick={() => {
                                  console.log('🖱️ Clicked REQUEST NEW LINK for appointment:', appointmentId)
                                  requestNewMeetingLink(appointmentId)
                                }}
                                disabled={requestingLinkId === appointmentId}
                                className="aeonik-mono"
                                style={{
                                  padding: "8px 16px",
                                  background: "transparent",
                                  border: "1px solid #39FF14",
                                  color: "#39FF14",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: requestingLinkId === appointmentId ? "not-allowed" : "pointer",
                                  opacity: requestingLinkId === appointmentId ? 0.5 : 1,
                                  letterSpacing: "1px",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (requestingLinkId !== appointmentId) {
                                    e.currentTarget.style.background = "#39FF14"
                                    e.currentTarget.style.color = "#000"
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (requestingLinkId !== appointmentId) {
                                    e.currentTarget.style.background = "transparent"
                                    e.currentTarget.style.color = "#39FF14"
                                  }
                                }}
                              >
                                {requestingLinkId === appointmentId ? "GENERATING..." : "REQUEST NEW LINK"}
                              </button>
                            ) : (
                              <div className="aeonik-mono" style={{ fontSize: "10px", color: "#FF6B6B", padding: "8px" }}>
                                ERROR: NO APPOINTMENT ID
                              </div>
                            )}
                          </>
                        ) : (
                          appointmentId ? (
                            <button
                              onClick={() => {
                                console.log('🖱️ Clicked REQUEST NEW LINK for appointment:', appointmentId)
                                requestNewMeetingLink(appointmentId)
                              }}
                              disabled={requestingLinkId === appointmentId}
                              className="aeonik-mono"
                              style={{
                                padding: "8px 16px",
                                background: "transparent",
                                border: "1px solid #39FF14",
                                color: "#39FF14",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: requestingLinkId === appointmentId ? "not-allowed" : "pointer",
                                opacity: requestingLinkId === appointmentId ? 0.5 : 1,
                                letterSpacing: "1px",
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (requestingLinkId !== appointmentId) {
                                  e.currentTarget.style.background = "#39FF14"
                                  e.currentTarget.style.color = "#000"
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (requestingLinkId !== appointmentId) {
                                  e.currentTarget.style.background = "transparent"
                                  e.currentTarget.style.color = "#39FF14"
                                }
                              }}
                            >
                              {requestingLinkId === appointmentId ? "GENERATING..." : "REQUEST NEW LINK"}
                            </button>
                          ) : (
                            <div className="aeonik-mono" style={{ fontSize: "10px", color: "#FF6B6B", padding: "8px" }}>
                              ERROR: NO APPOINTMENT ID
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
        )}
      </div>

      {/* Recent Notifications */}
      <div style={{ marginBottom: "50px" }}>
        <h2
          className="aeonik-mono"
          style={{
            fontSize: "clamp(20px, 2.5vw, 28px)",
            color: "#FFF",
            marginBottom: "25px",
            letterSpacing: "-1px",
            fontWeight: 600,
          }}
        >
          RECENT NOTIFICATIONS
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((notification) => (
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
          ))}
        </div>
      </div>
    </>
  )
}

export default Overview
