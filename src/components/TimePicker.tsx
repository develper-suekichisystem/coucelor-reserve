import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLoading } from '../contexts/LoadingContext';
import type { Menu } from '../types/index';

interface Props {
  date: string;
  selectedMenu: Menu;
  onSelect: (time: string) => void;
  onBack: () => void;
}

export function TimePicker({ date, selectedMenu, onSelect, onBack }: Props) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const { withLoading } = useLoading();

  const providerMinutes = selectedMenu.provider_duration_minutes ?? selectedMenu.duration_minutes;
  const customerMinutes = selectedMenu.customer_duration_minutes ?? selectedMenu.duration_minutes;
  const slotsNeeded = Math.ceil(providerMinutes / 60);
  const customerHours = Math.ceil(customerMinutes / 60);

  useEffect(() => {
    withLoading(async () => {
      const [{ data: slotData }, { data: reservData }] = await Promise.all([
        supabase
          .from('available_slots')
          .select('time')
          .eq('date', date),
        supabase
          .from('reservations')
          .select('time, menus(provider_duration_minutes, duration_minutes)')
          .eq('date', date)
          .eq('status', 'confirmed'),
      ]);

      setAvailableTimes(slotData?.map(r => (r.time as string).slice(0, 5)) ?? []);

      const blocked = new Set<string>();
      reservData?.forEach((r: any) => {
        const startH = parseInt((r.time as string).slice(0, 2));
        const rMenu = r.menus;
        const duration = rMenu?.provider_duration_minutes ?? rMenu?.duration_minutes ?? 60;
        const slots = Math.ceil(duration / 60);
        for (let i = 0; i < slots; i++) {
          blocked.add(`${String(startH + i).padStart(2, '0')}:00`);
        }
      });
      setBlockedSlots(blocked);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const availableSet = new Set(availableTimes);

  return (
    <div className="time-picker">
      <h2 className="section-title">時間を選択</h2>
      <p className="date-label">{date.replace(/-/g, '/')}</p>
      {availableTimes.length === 0 ? (
        <p className="schedule-empty">この日の受付可能な時間帯はありません</p>
      ) : (
        <div className="time-grid">
          {availableTimes.map(time => {
            const h = parseInt(time.slice(0, 2));
            const canBook = Array.from({ length: slotsNeeded }, (_, i) =>
              `${String(h + i).padStart(2, '0')}:00`
            ).every(t => availableSet.has(t) && !blockedSlots.has(t));

            return (
              <button
                key={time}
                className={`time-slot ${canBook ? 'available' : 'booked'}`}
                disabled={!canBook}
                onClick={() => onSelect(time)}
              >
                <span>{h}:00〜{h + customerHours}:00</span>
                <span className="slot-status">{canBook ? '○' : '×'}</span>
              </button>
            );
          })}
        </div>
      )}
      <button className="btn-back" onClick={onBack}>← 戻る</button>
    </div>
  );
}
