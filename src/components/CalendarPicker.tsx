import { useState, useEffect } from 'react';

interface Props {
  onSelect: (date: string) => void;
  selectedDate?: string;
}

export function CalendarPicker({ onSelect, selectedDate }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState<(number | null)[]>([]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= lastDate; i++) {
      days.push(i);
    }
    
    setDaysInMonth(days);
  }, [currentDate]);

  const handleDateSelect = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    onSelect(`${year}-${month}-${date}`);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthYear = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="calendar-picker">
      <h2>ご希望の日付をお選びください</h2>
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="nav-button">←</button>
          <span className="month-year">{monthYear}</span>
          <button onClick={handleNextMonth} className="nav-button">→</button>
        </div>
        
        <div className="weekday-header">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {daysInMonth.map((day, index) => (
            <div key={index} className="calendar-cell">
              {day !== null ? (
                <button
                  onClick={() => handleDateSelect(day)}
                  className={`date-button ${
                    selectedDate === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      ? 'selected'
                      : ''
                  }`}
                >
                  {day}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
