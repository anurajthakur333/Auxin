import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/apiConfig';

interface TimeSlot {
  id: string;
  time: string;
  time12: string;
  available: boolean;
}

interface CalendarProps {
  onBookingSuccess?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ onBookingSuccess }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [timeFormat, setTimeFormat] = useState<'12hr' | '24hr'>('24hr');

  // Detect user's timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
    console.log('User timezone detected:', timezone);
  }, []);

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
          available: true // Will be updated from backend
        });
      }
    }
    return slots;
  };

  // Get available slots for selected date
  const fetchAvailableSlots = async (date: Date) => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/api/appointments/available?date=${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure all slots have time12 property
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
        // Fallback to all slots available if backend doesn't have this endpoint yet
        setAvailableSlots(generateTimeSlots());
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots(generateTimeSlots());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate]);

  // Book appointment
  const bookAppointment = async () => {
    if (!selectedTime || !user) return;

    try {
      setBookingLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          userEmail: user.email,
          userName: user.name,
          timezone: userTimezone
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Appointment booked successfully!' });
        setSelectedTime('');
        fetchAvailableSlots(selectedDate);
        onBookingSuccess?.();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to book appointment' });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  // Calendar navigation
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isSameDay(date, selectedDate);
      const isPast = isPastDate(date);
      const todayClass = isToday(date) ? 'today' : '';

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''} ${todayClass}`}
          onClick={() => !isPast && setSelectedDate(date)}
          style={{ cursor: isPast ? 'not-allowed' : 'pointer' }}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-container">
      <style>{`
        .calendar-container {
          background: #111;
          border-radius: 12px;
          padding: 2rem;
          color: #fff;
          font-family: 'Aeonik', sans-serif;
          max-width: 800px;
          margin: 0 auto;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .calendar-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #39FF14;
        }

        .calendar-nav {
          display: flex;
          gap: 1rem;
        }

        .nav-button {
          background: #222;
          border: 1px solid #39FF14;
          color: #39FF14;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-button:hover {
          background: #39FF14;
          color: #000;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 2rem;
        }

        .calendar-weekday {
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          color: #39FF14;
          background: #222;
        }

        .calendar-day {
          padding: 1rem;
          text-align: center;
          background: #222;
          transition: all 0.3s ease;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calendar-day:not(.empty):not(.past):hover {
          background: #333;
        }

        .calendar-day.selected {
          background: #39FF14;
          color: #000;
          font-weight: 600;
        }

        .calendar-day.today {
          border: 2px solid #39FF14;
        }

        .calendar-day.past {
          opacity: 0.3;
          color: #666;
        }

        .calendar-day.empty {
          background: transparent;
        }

        .time-slots-container {
          margin-bottom: 2rem;
        }

        .time-slots-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .time-slots-title {
          font-size: 1.2rem;
          color: #39FF14;
          margin: 0;
        }

        .time-format-toggle {
          display: flex;
          background: #222;
          border-radius: 6px;
          padding: 2px;
          gap: 2px;
        }

        .toggle-btn {
          background: transparent;
          border: none;
          color: #888;
          padding: 0.5rem 1rem;
          border-radius: 4px;
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
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .time-slot {
          padding: 0.75rem;
          text-align: center;
          background: #222;
          border: 1px solid #333;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .time-slot:hover {
          border-color: #39FF14;
        }

        .time-slot.selected {
          background: #39FF14;
          color: #000;
          border-color: #39FF14;
        }

        .time-slot.unavailable {
          opacity: 0.3;
          cursor: not-allowed;
          background: #333;
        }

        .time-display {
          font-size: 1rem;
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
          border-radius: 6px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Aeonik', sans-serif;
        }

        .book-button:hover {
          background: #2ecc11;
          transform: translateY(-2px);
        }

        .book-button:disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
          transform: none;
        }

        .message {
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          text-align: center;
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
        }

        .selected-date-info {
          background: #222;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .selected-date-info h3 {
          color: #39FF14;
          margin: 0 0 0.5rem 0;
        }

        @media (max-width: 768px) {
          .calendar-container {
            padding: 1rem;
          }
          
          .calendar-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .time-slots-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .time-slots-grid {
            grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          }
          
          .time-slot {
            padding: 0.5rem;
          }
          
          .time-display {
            font-size: 0.9rem;
          }
          
          .toggle-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }
      `}</style>

      <div className="calendar-header">
        <h2 className="calendar-title">
          {currentMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h2>
        <div className="calendar-nav">
          <button
            className="nav-button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            ← Prev
          </button>
          <button
            className="nav-button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
        {renderCalendarDays()}
      </div>

      <div className="selected-date-info">
        <h3>Selected Date</h3>
        <p>{selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <div className="time-slots-container">
        <div className="time-slots-header">
          <h3 className="time-slots-title">Available Time Slots</h3>
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
        {loading ? (
          <div className="loading">Loading available slots...</div>
        ) : (
          <div className="time-slots-grid">
            {availableSlots.map(slot => (
              <div
                key={slot.id}
                className={`time-slot ${selectedTime === slot.time ? 'selected' : ''} ${!slot.available ? 'unavailable' : ''}`}
                onClick={() => slot.available && setSelectedTime(slot.time)}
              >
                {timeFormat === '24hr' ? (
                  <div className="time-display">{slot.time}</div>
                ) : (
                  <div className="time-display">{slot.time12}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="booking-section">
        {userTimezone && (
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#888', 
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            Your timezone: {userTimezone}
          </div>
        )}
        <button
          className="book-button"
          onClick={bookAppointment}
          disabled={!selectedTime || bookingLoading}
        >
          {bookingLoading ? 'Booking...' : (() => {
            if (!selectedTime) return 'Select Time';
            const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
            if (selectedSlot) {
              const displayTime = timeFormat === '24hr' ? selectedSlot.time : selectedSlot.time12;
              const formattedDate = selectedDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              return `Confirm Meeting - ${formattedDate} · ${displayTime}`;
            }
            return `Confirm Meeting - ${selectedDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })} · ${selectedTime}`;
          })()}
        </button>
      </div>
    </div>
  );
};

export default Calendar;
