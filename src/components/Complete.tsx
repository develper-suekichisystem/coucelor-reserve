interface Props {
  reservationId: string;
  onNewReservation: () => void;
}

export function Complete({ reservationId, onNewReservation }: Props) {
  return (
    <div className="complete">
      <div className="complete-message">
        <h2>✓ 予約が完了しました</h2>
        <p>ご予約ありがとうございます。</p>
      </div>

      <div className="reservation-id">
        <p>予約番号: <span>{reservationId}</span></p>
      </div>

      <div className="complete-notice">
        <p>ご予約の詳細はLINEでもご確認いただけます。<br />
        ご不明な点がございましたら、お気軽にお問い合わせください。</p>
      </div>

      <button onClick={onNewReservation} className="new-reservation-button">
        別の日時で予約する
      </button>
    </div>
  );
}
