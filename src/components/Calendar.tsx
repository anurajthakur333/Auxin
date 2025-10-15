import React, { useState } from 'react';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
          onClick={() => !isPast && onDateSelect(date)}
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
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .calendar-title {
          font-size: 1.8rem;
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
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Aeonik', sans-serif;
          font-weight: 500;
        }

        .nav-button:hover {
          background: #39FF14;
          color: #000;
          transform: translateY(-2px);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #333;
          border-radius: 8px;
          overflow: hidden;
          flex: 1;
        }

        .calendar-weekday {
          padding: 1.5rem 1rem;
          text-align: center;
          font-weight: 600;
          color: #39FF14;
          background: #222;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .calendar-day {
          padding: 1.5rem 1rem;
          text-align: center;
          background: #222;
          transition: all 0.3s ease;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 500;
        }

        .calendar-day:not(.empty):not(.past):hover {
          background: #333;
          transform: scale(1.05);
        }

        .calendar-day.selected {
          background: #39FF14;
          color: #000;
          font-weight: 700;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(57, 255, 20, 0.3);
        }

        .calendar-day.today {
          border: 2px solid #39FF14;
          background: #1a1a1a;
          color: #39FF14;
          font-weight: 600;
        }

        .calendar-day.past {
          opacity: 0.3;
          color: #666;
          background: #1a1a1a;
        }

        .calendar-day.empty {
          background: transparent;
        }

        .selected-date-info {
          background: #222;
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 2rem;
          border-left: 4px solid #39FF14;
        }

        .selected-date-info h3 {
          color: #39FF14;
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .selected-date-info p {
          margin: 0;
          font-size: 1rem;
          color: #ccc;
        }

        @media (max-width: 768px) {
          .calendar-container {
            padding: 1.5rem;
          }
          
          .calendar-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .calendar-title {
            font-size: 1.5rem;
          }
          
          .nav-button {
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
          }
          
          .calendar-weekday {
            padding: 1rem 0.5rem;
            font-size: 0.8rem;
          }
          
          .calendar-day {
            padding: 1rem 0.5rem;
            min-height: 50px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .calendar-container {
            padding: 1rem;
          }
          
          .calendar-title {
            font-size: 1.3rem;
          }
          
          .nav-button {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }
          
          .calendar-weekday {
            padding: 0.8rem 0.3rem;
            font-size: 0.75rem;
          }
          
          .calendar-day {
            padding: 0.8rem 0.3rem;
            min-height: 45px;
            font-size: 0.85rem;
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
    </div>
  );
};

export default Calendar;