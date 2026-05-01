import type { Reservation } from '../types';

interface Props {
  date: string;
  onSelect: (time: string) => void;
  selectedTime?: string;
  reservations?: Reservation[];
}

export function TimePicker({ date, onSelect, selectedTime, reservations = [] }: Props) {
  // 予約済みの時間を取得
  const bookedTimes = new Set(
    reservations
      .filter(r => r.date === date && r.status === 'confirmed')
      .map(r => r.time)
  );

  // 営業時間：10:00 ～ 19:00（1時間刻み）
  const timeSlots = [];
  for (let hour = 10; hour <= 19; hour++) {
    const time = `${String(hour).padStart(2, '0')}:00`;
    timeSlots.push(time);
  }

  return (
    <div className="time-picker">
      <h2>ご希望の時間をお選びください</h2>
      <div className="time-slots">
        {timeSlots.map(time => (
          <button
            key={time}
            onClick={() => onSelect(time)}
            className={`time-slot ${selectedTime === time ? 'selected' : ''} ${
              bookedTimes.has(time) ? 'booked' : ''
            }`}
            disabled={bookedTimes.has(time)}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
}
