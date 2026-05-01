import { useState } from 'react';

interface Props {
  defaultName: string;
  onSubmit: (data: { referrerName: string }) => void;
}

export function ReservationForm({ defaultName, onSubmit }: Props) {
  const [referrerName, setReferrerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ referrerName });
  };

  return (
    <div className="reservation-form">
      <h2>カウンセリング情報をご入力ください</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">お名前</label>
          <input
            id="name"
            type="text"
            value={defaultName}
            disabled
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="referrer">ご紹介者（任意）</label>
          <input
            id="referrer"
            type="text"
            value={referrerName}
            onChange={(e) => setReferrerName(e.target.value)}
            placeholder="ご紹介いただいた方のお名前"
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-button">
          確認へ進む
        </button>
      </form>
    </div>
  );
}
