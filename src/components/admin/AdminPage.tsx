import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Reservation } from '../../types';

export function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select('*, user:users(*), menu:menus(*)')
        .order('date', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="admin-page">読み込み中...</div>;
  }

  return (
    <div className="admin-page">
      <h1>管理画面</h1>
      <h2>予約一覧</h2>
      
      {reservations.length === 0 ? (
        <p>予約がありません</p>
      ) : (
        <table className="reservation-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>時間</th>
              <th>メニュー</th>
              <th>ご予約者</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(res => (
              <tr key={res.id}>
                <td>{res.date}</td>
                <td>{res.time}</td>
                <td>{res.menu?.name}</td>
                <td>{res.user?.name}</td>
                <td>{res.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
