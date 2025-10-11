import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/apiConfig';

interface TimeSlot {
  id: string;
  time: string;
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

  // Generate time slots (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          id: `${time}`,
          time: time,
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
        setAvailableSlots(data.slots || generateTimeSlots());
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
          userName: user.name
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

        .time-slots-title {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: #39FF14;
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
          
          .time-slots-grid {
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          }
        }
      `}</style>

      <div className="calendar-header">
        <h2 className="calendar-title">Book Your Meeting</h2>
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
        <h3 className="time-slots-title">Available Time Slots</h3>
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
                {slot.time}
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
        <button
          className="book-button"
          onClick={bookAppointment}
          disabled={!selectedTime || bookingLoading}
        >
          {bookingLoading ? 'Booking...' : `Book Meeting for ${selectedTime || 'Select Time'}`}
        </button>
      </div>
    </div>
  );
};

export default Calendar;
