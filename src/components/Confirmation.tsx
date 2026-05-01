import type { Menu } from '../types';

interface Props {
  menu: Menu;
  date: string;
  time: string;
  userName: string;
  referrerName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function Confirmation({
  menu,
  date,
  time,
  userName,
  referrerName,
  onConfirm,
  onCancel,
  isLoading,
}: Props) {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="confirmation">
      <h2>予約内容をご確認ください</h2>
      
      <div className="confirmation-details">
        <div className="detail-item">
          <span className="detail-label">メニュー</span>
          <span className="detail-value">{menu.name}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">日付</span>
          <span className="detail-value">{formattedDate}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">時間</span>
          <span className="detail-value">{time}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">所要時間</span>
          <span className="detail-value">{menu.duration_minutes}分</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">料金</span>
          <span className="detail-value">¥{menu.price.toLocaleString()}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">ご予約者名</span>
          <span className="detail-value">{userName}</span>
        </div>
        
        {referrerName && (
          <div className="detail-item">
            <span className="detail-label">ご紹介者</span>
            <span className="detail-value">{referrerName}</span>
          </div>
        )}
      </div>

      <div className="confirmation-actions">
        <button
          onClick={onCancel}
          className="cancel-button"
          disabled={isLoading}
        >
          戻る
        </button>
        <button
          onClick={onConfirm}
          className="confirm-button"
          disabled={isLoading}
        >
          {isLoading ? '予約中...' : '予約を確定する'}
        </button>
      </div>
    </div>
  );
}
