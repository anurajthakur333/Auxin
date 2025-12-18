import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, getAuthToken } from '../lib/apiConfig';

interface TimeSlot {
  id: string;
  time: string;
  time12: string;
  available: boolean;
}

interface MeetingDuration {
  _id: string;
  minutes: number;
  label: string;
  price: number;
  isActive: boolean;
}

interface TimeSlotsProps {
  selectedDate: Date;
  onTimeSelect: (time: string) => void;
  selectedTime: string;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ 
  selectedDate, 
  onTimeSelect, 
  selectedTime
}) => {
  const { user } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingNewDate, setFetchingNewDate] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [timeFormat, setTimeFormat] = useState<'12hr' | '24hr'>('24hr');
  const [meetingDurations, setMeetingDurations] = useState<MeetingDuration[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<MeetingDuration | null>(null);
  const [durationsLoading, setDurationsLoading] = useState(true);
  const [durationsError, setDurationsError] = useState<string | null>(null);

  // Detect user's timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
  }, []);

  // Fetch meeting durations from API
  useEffect(() => {
    const fetchMeetingDurations = async () => {
      try {
        setDurationsLoading(true);
        setDurationsError(null);
        const response = await fetch(`${API_BASE_URL}/api/meeting-durations/public`);
        if (response.ok) {
          const data = await response.json();
          const activeDurations = (data.durations || []).filter((d: MeetingDuration) => d.isActive);
          setMeetingDurations(activeDurations);
          // Auto-select first duration if available
          if (activeDurations.length > 0 && !selectedDuration) {
            setSelectedDuration(activeDurations[0]);
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch durations' }));
          setDurationsError(errorData.error || 'Failed to load meeting durations');
          console.error('Failed to fetch meeting durations:', response.status);
        }
      } catch (error) {
        console.error('Error fetching meeting durations:', error);
        setDurationsError('Network error. Please refresh the page.');
      } finally {
        setDurationsLoading(false);
      }
    };

    fetchMeetingDurations();
  }, []);

  // Update selected duration when durations are loaded
  useEffect(() => {
    if (meetingDurations.length > 0 && !selectedDuration) {
      setSelectedDuration(meetingDurations[0]);
    }
  }, [meetingDurations]);

  // Generate time slots (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({
          id: `${time}`,
          time: time,
          time12: time12,
          available: true
        });
      }
    }
    return slots;
  };

  // Calculate how many 30-minute slots are needed for the selected duration
  const getRequiredSlots = (durationMinutes: number): number => {
    return Math.ceil(durationMinutes / 30);
  };

  // Check if a time slot can accommodate the selected duration
  const canAccommodateDuration = (slotTime: string, durationMinutes: number): boolean => {
    if (!selectedDuration) return true;
    
    const requiredSlots = getRequiredSlots(durationMinutes);
    const slotIndex = availableSlots.findIndex(slot => slot.time === slotTime);
    
    if (slotIndex === -1) return false;
    
    // Check if we have enough consecutive available slots
    for (let i = 0; i < requiredSlots; i++) {
      const checkIndex = slotIndex + i;
      if (checkIndex >= availableSlots.length) return false;
      if (!availableSlots[checkIndex].available) return false;
    }
    
    return true;
  };

  // Get all time slots that would be booked for the selected duration
  const getSlotsForDuration = (startTime: string, durationMinutes: number): string[] => {
    const requiredSlots = getRequiredSlots(durationMinutes);
    const slotIndex = availableSlots.findIndex(slot => slot.time === startTime);
    
    if (slotIndex === -1) return [startTime];
    
    const slots: string[] = [];
    for (let i = 0; i < requiredSlots; i++) {
      const checkIndex = slotIndex + i;
      if (checkIndex < availableSlots.length) {
        slots.push(availableSlots[checkIndex].time);
      }
    }
    
    return slots;
  };

  // Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get available slots for selected date
  const fetchAvailableSlots = async (date: Date) => {
    try {
      // Only show loading for initial load, not for date changes
      if (availableSlots.length === 0) {
        setLoading(true);
      } else {
        // Show subtle loading indicator for date changes
        setFetchingNewDate(true);
      }
      
      // Format date as YYYY-MM-DD in local timezone (not UTC)
      const dateStr = formatDateLocal(date);
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/appointments/available?date=${dateStr}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        const slotsWith12hr = (data.slots || generateTimeSlots()).map((slot: any) => ({
          ...slot,
          time12: slot.time12 || new Date(`2000-01-01T${slot.time}:00`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        }));
        setAvailableSlots(slotsWith12hr);
      } else {
        setAvailableSlots(generateTimeSlots());
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots(generateTimeSlots());
    } finally {
      setLoading(false);
      setFetchingNewDate(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate]);

  // Re-check slot availability when duration changes (only if a time is selected)
  useEffect(() => {
    if (selectedTime && selectedDuration && availableSlots.length > 0) {
      const requiredSlots = getRequiredSlots(selectedDuration.minutes);
      const slotIndex = availableSlots.findIndex(slot => slot.time === selectedTime);
      
      if (slotIndex === -1) {
        onTimeSelect('');
        return;
      }
      
      // Check if we have enough consecutive available slots (not booked)
      let canAccommodate = true;
      for (let i = 0; i < requiredSlots; i++) {
        const checkIndex = slotIndex + i;
        if (checkIndex >= availableSlots.length || !availableSlots[checkIndex].available) {
          canAccommodate = false;
          break;
        }
      }
      
      if (!canAccommodate) {
        // Clear selection if current time can't accommodate new duration
        onTimeSelect('');
        setMessage({ type: 'error', text: `Selected time cannot accommodate ${selectedDuration.minutes} minutes. Please choose another time.` });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  }, [selectedDuration]);

  // Book appointment - Create PayPal order and redirect to PayPal
  const bookAppointment = async () => {
    if (!selectedTime || !user) return;

    try {
      setBookingLoading(true);
      setMessage(null);
      
      const token = getAuthToken();
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please log in again.' });
        setBookingLoading(false);
        return;
      }
      
      if (!selectedDuration) {
        setMessage({ type: 'error', text: 'Please select a meeting duration' });
        setBookingLoading(false);
        return;
      }

      // Get all time slots that need to be booked
      const slotsToBook = getSlotsForDuration(selectedTime, selectedDuration.minutes);
      
      // Create PayPal order
      const response = await fetch(`${API_BASE_URL}/api/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: formatDateLocal(selectedDate), // Use local date format, not UTC
          time: selectedTime,
          endTime: slotsToBook.length > 0 ? slotsToBook[slotsToBook.length - 1] : selectedTime,
          userEmail: user.email,
          userName: user.name,
          timezone: userTimezone,
          duration: selectedDuration.minutes,
          price: selectedDuration.price,
          slots: slotsToBook // Send all slots that will be booked
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        
        console.error('❌ Failed to create PayPal order:', response.status, errorData);
        if (response.status === 401) {
          setMessage({ type: 'error', text: 'Authentication failed. Please log in again.' });
          // Clear invalid tokens
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        } else {
          setMessage({ type: 'error', text: errorData.error || 'Failed to initiate payment' });
        }
        return;
      }

      const data = await response.json();

      if (data.approvalUrl) {
        // Show processing message
        setMessage({ type: 'success', text: 'Redirecting to PayPal...' });
        
        // Store appointment ID for later use
        localStorage.setItem('pendingAppointmentId', data.appointmentId);
        localStorage.setItem('pendingOrderId', data.orderId);
        
        // Redirect to PayPal for payment
        window.location.href = data.approvalUrl;
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to initiate payment' });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="time-slots-container">
      <style>{`
        .time-slots-container {
          background: #111;
          padding: 1rem;
          color: #fff;
          font-family: 'Aeonik', sans-serif;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .time-slots-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .time-slots-title {
          font-size: 1.3rem;
          color: #39FF14;
          margin: 0;
          font-weight: 600;
        }

        .time-format-toggle {
          display: flex;
          background: #222;
          padding: 2px;
          gap: 2px;
        }

        .toggle-btn {
          background: transparent;
          border: none;
          color: #888;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Aeonik', sans-serif;
          font-size: 0.9rem;
        }

        .toggle-btn.active {
          background: #39FF14;
          color: #000;
          font-weight: 600;
        }

        .toggle-btn:hover:not(.active) {
          color: #fff;
        }

        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          gap: 0.3rem;
          margin-bottom: 2rem;
          flex: 1;
          overflow-y: auto;
        }

        .time-slot {
          padding: 0.75rem 0.5rem;
          text-align: center;
          background: #222;
          border: 1px solid #333;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
        }

        .time-slot:hover {
          border-color: #39FF14;
          background: #333;
        }

        .time-slot.selected {
          background: #39FF14;
          color: #000;
          border-color: #39FF14;
          font-weight: 600;
        }

        .time-slot.selected-part {
          background: rgba(57, 255, 20, 0.3);
          border-color: #39FF14;
          border-style: dashed;
        }

        .time-slot.unavailable {
          opacity: 0.3;
          cursor: not-allowed;
          background: #333;
        }

        .time-display {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .booking-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .book-button {
          background: #39FF14;
          color: #000;
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Aeonik', sans-serif;
          width: 100%;
        }

        .book-button:hover {
          background: #2ecc11;
        }

        .book-button:disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
          transform: none;
        }

        .message {
          padding: 1rem;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .message.success {
          background: rgba(57, 255, 20, 0.1);
          border: 1px solid #39FF14;
          color: #39FF14;
        }

        .message.error {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid #ff6b6b;
          color: #ff6b6b;
        }

        .loading {
          text-align: center;
          color: #39FF14;
          padding: 2rem;
          font-size: 0.9rem;
        }

        .time-slots-container {
          position: relative;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(17, 17, 17, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          color: #39FF14;
          font-size: 0.9rem;
        }

 

        .selected-date-info {
          background: #222;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-left: 4px solid #39FF14;
        }

        .selected-date-info h3 {
          color: #39FF14;
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .selected-date-info p {
          margin: 0;
          font-size: 0.9rem;
          color: #ccc;
        }

        @media (max-width: 768px) {
          .time-slots-container {
            padding: 1.5rem;
          }
          
          .time-slots-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .time-slots-grid {
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 0.5rem;
          }
          
          .time-slot {
            padding: 0.6rem 0.4rem;
            min-height: 45px;
          }
          
          .time-display {
            font-size: 0.8rem;
          }
          
          .toggle-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .time-slots-container {
            padding: 1rem;
          }
          
          .time-slots-grid {
            grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
          }
          
          .time-slot {
            padding: 0.5rem 0.3rem;
            min-height: 40px;
          }
          
          .time-display {
            font-size: 0.75rem;
          }
        }
      `}</style>

      <div className="selected-date-info">
        <h3>SELECTED DATE</h3>
        <p>{selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }).toUpperCase()}</p>
        {selectedDuration && (
          <div style={{ 
            marginTop: '0.75rem', 
            paddingTop: '0.75rem', 
            borderTop: '1px solid rgba(57, 255, 20, 0.3)',
            fontSize: '1rem',
            color: '#39FF14',
            fontWeight: 600
          }}>
            {selectedDuration.minutes} MINUTES
          </div>
        )}
      </div>

      {/* Meeting Duration Selection - Always visible, placed before time slots */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ 
          fontSize: '0.9rem', 
          color: '#39FF14', 
          marginBottom: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          SELECT DURATION
        </h4>
        
        {durationsLoading && (
          <div style={{ 
            padding: '1rem', 
            textAlign: 'center', 
            color: '#888',
            fontSize: '0.85rem'
          }}>
            Loading durations...
          </div>
        )}
        
        {durationsError && (
          <div style={{ 
            padding: '1rem', 
            textAlign: 'center', 
            color: '#ff6b6b',
            fontSize: '0.85rem',
            border: '1px solid #ff6b6b',
            background: 'rgba(255, 107, 107, 0.1)'
          }}>
            {durationsError}
          </div>
        )}
        
        {!durationsLoading && !durationsError && meetingDurations.length === 0 && (
          <div style={{ 
            padding: '1rem', 
            textAlign: 'center', 
            color: '#888',
            fontSize: '0.85rem'
          }}>
            No meeting durations available. Please contact support.
          </div>
        )}
        
        {!durationsLoading && !durationsError && meetingDurations.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '0.5rem' 
          }}>
            {meetingDurations.map((duration) => (
              <button
                key={duration._id}
                onClick={() => setSelectedDuration(duration)}
                style={{
                  padding: '0.75rem 0.5rem',
                  background: selectedDuration?._id === duration._id ? '#39FF14' : '#222',
                  color: selectedDuration?._id === duration._id ? '#000' : '#fff',
                  border: `1px solid ${selectedDuration?._id === duration._id ? '#39FF14' : '#333'}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Aeonik, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: selectedDuration?._id === duration._id ? 600 : 400,
                  textAlign: 'center',
                  borderRadius: '0px'
                }}
                onMouseEnter={(e) => {
                  if (selectedDuration?._id !== duration._id) {
                    e.currentTarget.style.borderColor = '#39FF14';
                    e.currentTarget.style.background = '#333';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDuration?._id !== duration._id) {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.background = '#222';
                  }
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {duration.minutes} MIN
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="time-slots-header">
        <h3 className="time-slots-title">AVAILABLE TIME SLOTS</h3>
        <div className="time-format-toggle">
          <button
            className={`toggle-btn ${timeFormat === '24hr' ? 'active' : ''}`}
            onClick={() => setTimeFormat('24hr')}
          >
            24hr
          </button>
          <button
            className={`toggle-btn ${timeFormat === '12hr' ? 'active' : ''}`}
            onClick={() => setTimeFormat('12hr')}
          >
            12hr
          </button>
        </div>
      </div>

      <div className="time-slots-grid">
        {availableSlots.map(slot => {
          const isSelected = selectedTime === slot.time;
          // Check if slot is already booked - show ALL bookings regardless of selected duration
          const isBooked = !slot.available;
          
          // For available slots, check if they can accommodate the selected duration
          let canAccommodate = true;
          let cannotAccommodateReason = '';
          if (!isBooked && selectedDuration) {
            canAccommodate = canAccommodateDuration(slot.time, selectedDuration.minutes);
            if (!canAccommodate) {
              cannotAccommodateReason = `Not enough consecutive slots for ${selectedDuration.minutes} minutes`;
            }
          }
          
          // Get slots that would be part of the selected booking
          const slotsForDuration = selectedTime && selectedDuration && !isBooked ? getSlotsForDuration(selectedTime, selectedDuration.minutes) : [];
          const isPartOfSelected = slotsForDuration.includes(slot.time) && !isBooked && slot.time !== selectedTime;
          
          // Slot is unavailable if: already booked OR cannot accommodate selected duration
          const isUnavailable = isBooked || (!isBooked && selectedDuration && !canAccommodate);
          
          return (
            <div
              key={slot.id}
              className={`time-slot ${isSelected ? 'selected' : ''} ${isPartOfSelected ? 'selected-part' : ''} ${isUnavailable ? 'unavailable' : ''}`}
              onClick={() => {
                if (!isBooked && canAccommodate) {
                  onTimeSelect(slot.time);
                }
              }}
              title={
                isBooked 
                  ? 'This slot is already booked' 
                  : cannotAccommodateReason
              }
            >
              {timeFormat === '24hr' ? (
                <div className="time-display">{slot.time}</div>
              ) : (
                <div className="time-display">{slot.time12}</div>
              )}
            </div>
          );
        })}
      </div>
      
      {loading && (
        <div className="loading-overlay">
          Loading available slots...
        </div>
      )}
      
      {fetchingNewDate && (
        <div className="loading-overlay" style={{ background: 'rgba(17, 17, 17, 0.3)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: '#39FF14'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              border: '2px solid #39FF14',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Updating slots...
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="booking-section">
        {userTimezone && (
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#888', 
            marginBottom: '0.5rem',
            textAlign: 'center',
            textTransform: 'uppercase'
          }}>
            Your timezone: {userTimezone}
          </div>
        )}
        {selectedDuration && (
          <div style={{ 
            marginBottom: '0.75rem',
            padding: '0.75rem',
            background: 'rgba(57, 255, 20, 0.05)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            borderRadius: '0px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '1rem', 
              color: '#39FF14',
              fontWeight: 600
            }}>
              {selectedDuration.minutes} MINUTES
            </div>
          </div>
        )}
        <button
          className="book-button"
          onClick={bookAppointment}
          disabled={!selectedTime || !selectedDuration || bookingLoading}
        >
          {bookingLoading ? 'PROCESSING...' : (() => {
            if (!selectedTime) return 'SELECT TIME FIRST';
            if (!selectedDuration) return 'SELECT DURATION FIRST';
            const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
            if (selectedSlot) {
              const displayTime = timeFormat === '24hr' ? selectedSlot.time : selectedSlot.time12;
              return `BOOK & PAY $${Math.round(selectedDuration.price)} - ${displayTime}`;
            }
            return `BOOK & PAY $${Math.round(selectedDuration.price)} - ${selectedTime}`;
          })()}
        </button>
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#666', 
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          SECURE PAYMENT VIA PAYPAL
        </div>
      </div>
    </div>
  );
};

export default TimeSlots;
