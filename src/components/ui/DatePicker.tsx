import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  className = '',
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} style={{ width: '100%', aspectRatio: '1' }}></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isSelected = value && date.toISOString().split('T')[0] === value;
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    days.push(
      <button
        key={day}
        type="button"
        onClick={() => handleDateSelect(day)}
        className="aeonik-mono"
        style={{
          width: '100%',
          aspectRatio: '1',
          background: isSelected ? 'rgba(57, 255, 20, 0.2)' : (isToday ? 'rgba(255, 255, 255, 0.1)' : 'transparent'),
          border: isSelected ? '1px solid #39FF14' : (isToday ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent'),
          color: isSelected ? '#39FF14' : '#FFF',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textTransform: 'uppercase',
          fontWeight: isToday ? 600 : 400,
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }
        }}
      >
        {day}
      </button>
    );
  }

  return (
    <div
      ref={datePickerRef}
      className={`date-picker-container ${className}`}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="aeonik-mono"
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0px',
          color: value ? '#FFF' : 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
          outline: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          textTransform: 'uppercase',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#39FF14';
          e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.currentTarget) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }
        }}
      >
        <span>{value ? formatDate(value) : placeholder}</span>
        <img 
          src="/Calendar.svg" 
          alt="Calendar" 
          style={{ 
            width: '16px', 
            height: '16px', 
            marginLeft: '8px',
            filter: 'brightness(0) invert(1)',
            opacity: 0.8
          }} 
        />
      </button>

      {isOpen && (
        <div
          className="aeonik-mono"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0px',
            marginTop: '2px',
            padding: '20px',
            minWidth: '280px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Calendar Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              className="aeonik-mono"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                padding: '4px 8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#39FF14';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#FFF';
              }}
            >
              ← PREV
            </button>
            <div
              className="aeonik-mono"
              style={{
                color: '#FFF',
                fontSize: '12px',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="aeonik-mono"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                padding: '4px 8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#39FF14';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#FFF';
              }}
            >
              NEXT →
            </button>
          </div>

          {/* Week Days */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '8px',
            }}
          >
            {weekDays.map((day) => (
              <div
                key={day}
                className="aeonik-mono"
                style={{
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  padding: '4px 0',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
            }}
          >
            {days}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;

