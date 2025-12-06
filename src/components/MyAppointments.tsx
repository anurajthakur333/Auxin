import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/apiConfig';

interface Appointment {
  _id?: string;
  id?: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const appointmentsListRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScrollTop, setDragStartScrollTop] = useState(0);

  // Helper function to get appointment ID safely
  const getAppointmentId = (appointment: Appointment): string | null => {
    return appointment._id || appointment.id || null;
  };

  const fetchAppointments = async () => {
    try {
      console.log('🔄 Fetching appointments...');
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/appointments/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Fetched appointments:', data.appointments?.length || 0, 'appointments');
        console.log('📋 Appointments data:', data.appointments);
        console.log('📋 First appointment structure:', data.appointments?.[0]);
        setAppointments(data.appointments || []);
      } else {
        console.error('❌ Failed to fetch appointments, status:', response.status);
      }
    } catch (error) {
      console.error('💥 Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      console.log('🚀 Starting cancellation for appointment:', appointmentId);
      console.log('🌐 API Base URL:', API_BASE_URL);
      console.log('🔍 Appointment ID type:', typeof appointmentId);
      console.log('🔍 Appointment ID length:', appointmentId.length);
      console.log('🔍 Appointment ID value:', appointmentId);
      console.log('🔍 Full appointment object:', appointments.find(apt => getAppointmentId(apt) === appointmentId));
      setCancellingId(appointmentId);
      
      // First, test if backend is reachable
      try {
        const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
        console.log('🏥 Health check status:', healthResponse.status);
      } catch (healthError) {
        console.error('💥 Backend not reachable:', healthError);
        console.error('💥 Make sure backend is running on:', API_BASE_URL);
        return;
      }
      
      const url = `${API_BASE_URL}/api/appointments/${appointmentId}/cancel`;
      console.log('📡 Making request to:', url);
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      // Try PUT method first
      let response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If PUT fails, try DELETE method
      if (!response.ok) {
        console.log('🔄 PUT method failed, trying DELETE method...');
        const deleteUrl = `${API_BASE_URL}/api/appointments/${appointmentId}`;
        console.log('📡 Making DELETE request to:', deleteUrl);
        
        response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Appointment cancelled successfully:', data);
        // Force refresh the appointments list
        await fetchAppointments();
        console.log('🔄 Appointments list refreshed');
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          const errorText = await response.text();
          console.error('❌ Failed to parse error response:', errorText);
          errorData = { error: 'Unknown error occurred' };
        }
        console.error('❌ Failed to cancel appointment:', errorData);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
      }
    } catch (error) {
      console.error('💥 Error cancelling appointment:', error);
      console.error('💥 Error details:', error);
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  // Handle wheel scrolling on appointments list
  const handleWheel = (e: React.WheelEvent) => {
    if (appointmentsListRef.current) {
      e.preventDefault();
      e.stopPropagation();
      appointmentsListRef.current.scrollTop += e.deltaY;
    }
  };

  // Handle scroll to update custom scrollbar
  const handleScroll = () => {
    if (appointmentsListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = appointmentsListRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(progress);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string, paymentStatus?: string) => {
    // If payment is pending, show orange regardless of appointment status
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
  
  // Filter out pending appointments that are awaiting payment (older than 15 mins)
  const displayAppointments = appointments.filter(apt => {
    if (apt.status === 'pending' && apt.paymentStatus === 'pending') {
      const createdAt = new Date(apt.createdAt);
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      return createdAt > fifteenMinutesAgo; // Only show if created within last 15 mins
    }
    return true;
  });

  const isUpcoming = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime > new Date();
  };

  if (loading) {
    return (
      <div className="appointments-container">
        <div className="loading">Loading your appointments...</div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <style>{`
        .appointments-container {
          background: #111;
     
          padding: 1rem;
          color: #fff;
          font-family: 'Aeonik', sans-serif;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .appointments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .appointments-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #39FF14;
        }

        .refresh-button {
          background: #222;
          border: 1px solid #39FF14;
          color: #39FF14;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Aeonik', sans-serif;
        }

        .refresh-button:hover {
          background: #39FF14;
          color: #000;
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
          overflow-y: auto;
          max-height: 500px;
          padding-right: 8px;
          overscroll-behavior: contain;
        }

        /* Ensure scroll works on hover */
        .appointments-list:hover {
          overflow-y: auto;
        }

        /* Hide default scrollbar and create custom one */
        .appointments-list {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }

        .appointments-list::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        /* Custom scrollbar container */
        .appointments-container {
          position: relative;
        }

        .custom-scrollbar {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          background: #222;
          z-index: 10;
        }

        .custom-scrollbar-thumb {
          position: absolute;
          right: 0;
          width: 6px;
          background: #39FF14;
          border-radius: 0;
          transition: background 0.2s ease;
          cursor: pointer;
          user-select: none;
        }

        .custom-scrollbar-thumb:hover {
          background: #2ecc11;
        }

        .custom-scrollbar {
          cursor: pointer;
        }

        .appointment-card {
          background: #222;
          padding: 1.2rem;
          border-left: 4px solid #39FF14;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .appointment-card:hover {
          background: #333;
        }

        .appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .appointment-date-time {
          flex: 1;
        }

        .appointment-date {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .appointment-time {
          font-size: 1rem;
          color: #39FF14;
          font-weight: 500;
        }

        .appointment-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .appointment-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .cancel-button {
          background: transparent;
          border: 1px solid #ff6b6b;
          color: #ff6b6b;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Aeonik', sans-serif;
          font-size: 0.9rem;
        }

        .cancel-button:hover {
          background: #ff6b6b;
          color: #fff;
        }

        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .no-appointments {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .no-appointments h3 {
          color: #39FF14;
          margin-bottom: 1rem;
        }

        .loading {
          text-align: center;
          color: #39FF14;
          padding: 2rem;
        }

        .appointment-meta {
          font-size: 0.85rem;
          color: #888;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .appointments-container {
            padding: 1.5rem;
          }
          
          .appointment-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .appointment-actions {
            justify-content: flex-start;
          }
          
          .appointment-card {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .appointments-container {
            padding: 1rem;
          }
          
          .appointments-title {
            font-size: 1.1rem;
          }
          
          .appointment-card {
            padding: 0.8rem;
          }
        }
      `}</style>

      <div className="appointments-header">
        <h2 className="appointments-title">My Appointments</h2>
        <button className="refresh-button" onClick={fetchAppointments}>
          Refresh
        </button>
      </div>

      {displayAppointments.length === 0 ? (
        <div className="no-appointments">
          <h3>No appointments yet</h3>
          <p>Book your first meeting using the calendar above!</p>
        </div>
      ) : (
        <div 
          className="appointments-list" 
          ref={appointmentsListRef}
          onWheel={handleWheel}
          onScroll={handleScroll}
        >
          {displayAppointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <div className="appointment-date-time">
                  <div className="appointment-date">
                    {formatDate(appointment.date)}
                  </div>
                  <div className="appointment-time">
                    {appointment.time}
                  </div>
                </div>
                <div className="appointment-status">
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusColor(appointment.status, appointment.paymentStatus),
                      color: '#000'
                    }}
                  >
                    {getStatusText(appointment.status, appointment.paymentStatus)}
                  </span>
                </div>
              </div>
              
              <div className="appointment-meta">
                Booked on {new Date(appointment.createdAt).toLocaleDateString()}
              </div>

              {appointment.status !== 'cancelled' && isUpcoming(appointment.date, appointment.time) && (
                <div className="appointment-actions">
                  <button
                    className="cancel-button"
                    onClick={() => {
                      const appointmentId = getAppointmentId(appointment);
                      if (appointmentId) {
                        cancelAppointment(appointmentId);
                      } else {
                        console.error('❌ No valid appointment ID found');
                      }
                    }}
                    disabled={cancellingId === getAppointmentId(appointment)}
                  >
                    {cancellingId === getAppointmentId(appointment) ? 'Cancelling...' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
       {/* Custom scrollbar - only show when there are appointments */}
       {displayAppointments.length > 0 && (
         <div 
           className="custom-scrollbar"
           onClick={handleScrollbarTrackClick}
         >
           <div 
             className="custom-scrollbar-thumb"
             style={{
               height: `${Math.max(0, 100 * (1 - scrollProgress))}px`,
               top: `${scrollProgress * 100}%`
             }}
             onMouseDown={handleThumbMouseDown}
           />
         </div>
       )}
    </div>
  );
};

export default MyAppointments;
