import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/apiConfig';

interface TimeSlot {
  id: string;
  time: string;
  time12: string;
  available: boolean;
}

interface TimeSlotsProps {
  selectedDate: Date;
  onTimeSelect: (time: string) => void;
  selectedTime: string;
  onBookingSuccess?: () => void;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ 
  selectedDate, 
  onTimeSelect, 
  selectedTime, 
  onBookingSuccess 
}) => {
  const { user } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [timeFormat, setTimeFormat] = useState<'12hr' | '24hr'>('24hr');

  // Detect user's timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
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
          available: true
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
        onTimeSelect('');
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
        <h3>Selected Date</h3>
        <p>{selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

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
              onClick={() => slot.available && onTimeSelect(slot.time)}
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
            if (!selectedTime) return 'Select Time First';
            const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
            if (selectedSlot) {
              const displayTime = timeFormat === '24hr' ? selectedSlot.time : selectedSlot.time12;
              return `Book Meeting - ${displayTime}`;
            }
            return `Book Meeting - ${selectedTime}`;
          })()}
        </button>
      </div>
    </div>
  );
};

export default TimeSlots;
