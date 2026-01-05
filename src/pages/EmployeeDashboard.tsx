import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/apiConfig';
import '../styles/fonts.css';
import '../styles/Main.css';

interface Appointment {
  _id?: string;
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string;
  time: string;
  timezone?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentInfo?: {
    amount: string;
    currency: string;
    paypalOrderId?: string;
  };
  duration?: number;
  googleMeetLink?: string;
  createdAt: string;
  categoryName?: string;
  formAnswers?: Record<string, string>;
}

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState<any>(null);
  const appointmentsListRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollbarHeight, setScrollbarHeight] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScrollTop, setDragStartScrollTop] = useState(0);

  useEffect(() => {
    // Check if employee is logged in
    const employeeToken = localStorage.getItem('employeeToken');
    const storedEmployeeData = localStorage.getItem('employeeData');
    
    if (!employeeToken) {
      navigate('/employee/login', { replace: true });
      return;
    }

    if (storedEmployeeData) {
      try {
        setEmployeeData(JSON.parse(storedEmployeeData));
      } catch (e) {
        console.error('Failed to parse employee data:', e);
      }
    }

    fetchAllMeetings();
  }, [navigate]);

  // Update scrollbar height when appointments change
  useEffect(() => {
    if (appointmentsListRef.current) {
      const { scrollHeight, clientHeight } = appointmentsListRef.current;
      const thumbHeight = (clientHeight / scrollHeight) * 100;
      setScrollbarHeight(Math.max(10, thumbHeight));
    }
  }, [appointments]);

  const fetchAllMeetings = async () => {
    try {
      setLoading(true);
      setError('');
      const employeeToken = localStorage.getItem('employeeToken');
      
      if (!employeeToken) {
        setError('AUTHENTICATION REQUIRED');
        navigate('/employee/login', { replace: true });
        return;
      }

      // Try employee-specific endpoint first, fallback to admin endpoint
      let response = await fetch(`${API_BASE_URL}/api/appointments/employee/all`, {
        headers: {
          'Authorization': `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
      });

      // If employee endpoint doesn't exist, try admin endpoint
      if (response.status === 404) {
        response = await fetch(`${API_BASE_URL}/api/appointments/admin/all`, {
          headers: {
            'Authorization': `Bearer ${employeeToken}`,
            'Content-Type': 'application/json',
          },
        });
      }

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'FAILED TO FETCH MEETINGS' }));
        setError(errorData.error || 'FAILED TO FETCH MEETINGS');
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('NETWORK ERROR. PLEASE TRY AGAIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeData');
    navigate('/employee/login', { replace: true });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    // Convert 24h to 12h format
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string, paymentStatus?: string) => {
    if (paymentStatus === 'pending') return '#FFA500';
    if (paymentStatus === 'failed') return '#ff6b6b';
    
    switch (status) {
      case 'confirmed': return '#39FF14';
      case 'pending': return '#FFA500';
      case 'cancelled': return '#ff6b6b';
      default: return '#666';
    }
  };
  
  const getStatusText = (status: string, paymentStatus?: string) => {
    if (paymentStatus === 'pending') return 'AWAITING PAYMENT';
    if (paymentStatus === 'failed') return 'PAYMENT FAILED';
    return status.toUpperCase();
  };

  const isUpcoming = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime > new Date();
  };

  // Handle scroll to update custom scrollbar
  const handleScroll = () => {
    if (appointmentsListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = appointmentsListRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(progress);
      const thumbHeight = (clientHeight / scrollHeight) * 100;
      setScrollbarHeight(Math.max(10, thumbHeight));
    }
  };

  // Handle scrollbar track click
  const handleScrollbarTrackClick = (e: React.MouseEvent) => {
    if (appointmentsListRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const trackHeight = rect.height;
      const scrollHeight = appointmentsListRef.current.scrollHeight;
      const clientHeight = appointmentsListRef.current.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      const newScrollTop = (clickY / trackHeight) * maxScroll;
      appointmentsListRef.current.scrollTop = newScrollTop;
    }
  };

  // Handle scrollbar thumb drag start
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartY(e.clientY);
    if (appointmentsListRef.current) {
      setDragStartScrollTop(appointmentsListRef.current.scrollTop);
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && appointmentsListRef.current) {
      const deltaY = e.clientY - dragStartY;
      const trackHeight = appointmentsListRef.current.clientHeight;
      const scrollHeight = appointmentsListRef.current.scrollHeight;
      const maxScroll = scrollHeight - appointmentsListRef.current.clientHeight;
      
      const scrollDelta = (deltaY / trackHeight) * maxScroll;
      const newScrollTop = Math.max(0, Math.min(maxScroll, dragStartScrollTop + scrollDelta));
      appointmentsListRef.current.scrollTop = newScrollTop;
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add/remove global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStartY, dragStartScrollTop]);

  // Sort appointments: upcoming first, then by date
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh", 
      background: "#000",
      position: "relative",
      zIndex: 1
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 className="aeonik-mono" style={{
            fontSize: 'clamp(32px, 8vw, 80px)',
            lineHeight: '0.9',
            letterSpacing: '-5px',
            fontWeight: 600,
            color: '#FFF',
            marginBottom: '0.5rem'
          }}>
            EMPLOYEE DASHBOARD
          </h1>
          {employeeData && (
            <p className="aeonik-mono" style={{
              fontSize: '14px',
              color: '#39FF14',
              letterSpacing: '1px'
            }}>
              WELCOME, {employeeData.name?.toUpperCase() || 'EMPLOYEE'}
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="aeonik-mono"
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FFF',
            fontSize: '12px',
            cursor: 'pointer',
            letterSpacing: '1px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ff6b6b';
            e.currentTarget.style.color = '#ff6b6b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.color = '#FFF';
          }}
        >
          LOGOUT
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '3rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Stats Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div className="aeonik-mono" style={{ fontSize: '32px', color: '#39FF14', fontWeight: 600 }}>
              {appointments.length}
            </div>
            <div className="aeonik-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
              TOTAL MEETINGS
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div className="aeonik-mono" style={{ fontSize: '32px', color: '#39FF14', fontWeight: 600 }}>
              {appointments.filter(a => a.status === 'confirmed' && isUpcoming(a.date, a.time)).length}
            </div>
            <div className="aeonik-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
              UPCOMING
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div className="aeonik-mono" style={{ fontSize: '32px', color: '#FFA500', fontWeight: 600 }}>
              {appointments.filter(a => a.status === 'pending').length}
            </div>
            <div className="aeonik-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
              PENDING
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div className="aeonik-mono" style={{ fontSize: '32px', color: '#ff6b6b', fontWeight: 600 }}>
              {appointments.filter(a => a.status === 'cancelled').length}
            </div>
            <div className="aeonik-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
              CANCELLED
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 className="aeonik-mono" style={{
              fontSize: '24px',
              color: '#39FF14',
              fontWeight: 600,
              letterSpacing: '-1px'
            }}>
              ALL MEETINGS
            </h2>
            <button
              onClick={fetchAllMeetings}
              className="aeonik-mono"
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #39FF14',
                color: '#39FF14',
                fontSize: '12px',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#39FF14';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#39FF14';
              }}
            >
              REFRESH
            </button>
          </div>

          {error && (
            <div className="aeonik-mono" style={{
              padding: '15px 20px',
              marginBottom: '2rem',
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid #FF0000',
              color: '#FF0000',
              fontSize: '12px',
              letterSpacing: '1px'
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="aeonik-mono" style={{
              textAlign: 'center',
              color: '#39FF14',
              padding: '3rem',
              fontSize: '14px'
            }}>
              LOADING MEETINGS...
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="aeonik-mono" style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              padding: '3rem',
              fontSize: '14px'
            }}>
              NO MEETINGS FOUND
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div
                ref={appointmentsListRef}
                onScroll={handleScroll}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  paddingRight: '8px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                className="employee-meetings-list"
              >
              {sortedAppointments.map((appointment) => {
                const appointmentId = appointment._id || appointment.id || appointment.date + appointment.time;
                return (
                  <div
                    key={appointmentId}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${getStatusColor(appointment.status, appointment.paymentStatus)}40`,
                      borderLeft: `4px solid ${getStatusColor(appointment.status, appointment.paymentStatus)}`,
                      padding: '1.5rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div className="aeonik-mono" style={{
                          fontSize: '18px',
                          color: '#FFF',
                          fontWeight: 600,
                          marginBottom: '0.5rem'
                        }}>
                          {formatDate(appointment.date)}
                        </div>
                        <div className="aeonik-mono" style={{
                          fontSize: '16px',
                          color: '#39FF14',
                          fontWeight: 500,
                          marginBottom: '0.5rem'
                        }}>
                          {formatTime(appointment.time)}
                          {appointment.duration && ` • ${appointment.duration} MINUTES`}
                        </div>
                        <div className="aeonik-mono" style={{
                          fontSize: '14px',
                          color: 'rgba(255,255,255,0.7)',
                          marginTop: '0.5rem'
                        }}>
                          <div style={{ marginBottom: '0.25rem' }}>
                            <strong>CLIENT:</strong> {appointment.userName || appointment.userEmail}
                          </div>
                          <div>
                            <strong>EMAIL:</strong> {appointment.userEmail}
                          </div>
                          {appointment.categoryName && (
                            <div style={{ marginTop: '0.25rem' }}>
                              <strong>CATEGORY:</strong> {appointment.categoryName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.5rem'
                      }}>
                        <span
                          className="aeonik-mono"
                          style={{
                            padding: '0.25rem 0.75rem',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            backgroundColor: getStatusColor(appointment.status, appointment.paymentStatus),
                            color: '#000',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {getStatusText(appointment.status, appointment.paymentStatus)}
                        </span>
                        {appointment.googleMeetLink && isUpcoming(appointment.date, appointment.time) && (
                          <a
                            href={appointment.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aeonik-mono"
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#39FF14',
                              color: '#000',
                              fontSize: '11px',
                              textDecoration: 'none',
                              fontWeight: 600,
                              letterSpacing: '0.5px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#2ecc11';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#39FF14';
                            }}
                          >
                            JOIN MEETING
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="aeonik-mono" style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.5)',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      BOOKED ON {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                );
              })}
              </div>
              {/* Custom Scrollbar */}
              {sortedAppointments.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    bottom: '0',
                    width: '6px',
                    background: '#222',
                    cursor: 'pointer'
                  }}
                  onClick={handleScrollbarTrackClick}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: '0',
                      width: '6px',
                      background: '#39FF14',
                      height: `${scrollbarHeight}%`,
                      top: `${scrollProgress * 100}%`,
                      transition: 'background 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseDown={handleThumbMouseDown}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2ecc11';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#39FF14';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .employee-meetings-list::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;

