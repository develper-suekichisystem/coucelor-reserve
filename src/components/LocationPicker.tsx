import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLoading } from '../contexts/LoadingContext';
import type { Location } from '../types';

const OTHER_ID = '__other__';

interface Props {
  onSelect: (location: Location | null, note: string) => void;
  onBack: () => void;
}

export function LocationPicker({ onSelect, onBack }: Props) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [note, setNote] = useState('');
  const { withLoading } = useLoading();

  useEffect(() => {
    withLoading(async () => {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name');
      if (data) setLocations(data as Location[]);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOther = selectedId === OTHER_ID;
  const canProceed = selectedId !== '' && (!isOther || note.trim() !== '');

  function handleNext() {
    if (!canProceed) return;
    if (isOther) {
      onSelect(null, note.trim());
    } else {
      const loc = locations.find(l => l.id === selectedId) ?? null;
      onSelect(loc, '');
    }
  }

  return (
    <div className="location-picker">
      <h2 className="section-title">場所を選択</h2>
      <p className="location-hint">カウンセリングを受ける場所を選んでください</p>

      <div className="location-list">
        {locations.map(loc => (
          <button
            key={loc.id}
            className={`location-card${selectedId === loc.id ? ' selected' : ''}`}
            onClick={() => setSelectedId(loc.id)}
          >
            <span className="location-name">{loc.name}</span>
            <span className="location-address">{loc.address}</span>
          </button>
        ))}

        <button
          className={`location-card location-card-other${isOther ? ' selected' : ''}`}
          onClick={() => setSelectedId(OTHER_ID)}
        >
          <span className="location-name">その他</span>
          <span className="location-address">場所を自由に入力する</span>
        </button>
      </div>

      {isOther && (
        <textarea
          className="location-note-input"
          placeholder="場所・住所をご記入ください"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
        />
      )}

      <div className="btn-group">
        <button className="btn-next" onClick={handleNext} disabled={!canProceed}>
          次へ
        </button>
        <button className="btn-back" onClick={onBack}>← 戻る</button>
      </div>
    </div>
  );
}
