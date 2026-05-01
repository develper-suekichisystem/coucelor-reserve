import { useState, useEffect } from 'react';
import { useLoading } from './contexts/LoadingContext';
import { useLiff } from './hooks/useLiff';
import { StepIndicator } from './components/StepIndicator';
import { MenuSelect } from './components/MenuSelect';
import { CalendarPicker } from './components/CalendarPicker';
import { TimePicker } from './components/TimePicker';
import { ReservationForm } from './components/ReservationForm';
import { Confirmation } from './components/Confirmation';
import { Complete } from './components/Complete';
import { AdminPage } from './components/admin/AdminPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { supabase } from './lib/supabase';
import type { Step, ReservationState, Menu, Reservation } from './types';
import './App.css';

const INITIAL_STATE: ReservationState = {
  selectedMenu: null,
  selectedDate: null,
  selectedTime: null,
  referrerName: '',
};

function ReservationApp() {
  const { isReady, isLoggedIn, userId, displayName, pictureUrl, error } = useLiff();
  const [step, setStep] = useState<Step>('menu');
  const [state, setState] = useState<ReservationState>(INITIAL_STATE);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedId, setCompletedId] = useState('');
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const { withLoading } = useLoading();

  // メニューを読み込み
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setIsMenuLoading(true);
        const { data, error } = await supabase
          .from('menus')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setMenus(data || []);
      } catch (err) {
        console.error('Failed to fetch menus:', err);
      } finally {
        setIsMenuLoading(false);
      }
    };

    if (isReady && isLoggedIn) {
      fetchMenus();
    }
  }, [isReady, isLoggedIn]);

  // 予約を読み込み
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('status', 'confirmed');

        if (error) throw error;
        setReservations(data || []);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
      }
    };

    if (isReady && isLoggedIn) {
      fetchReservations();
    }
  }, [isReady, isLoggedIn]);

  if (!isReady || (!isLoggedIn && !error)) return <LoadingSpinner />;
  if (error) return <div className="error-screen">エラー: {error}</div>;
  if (!userId) return <LoadingSpinner />;

  const name = displayName ?? 'ゲスト';

  function update(updates: Partial<ReservationState>) {
    setState(prev => ({ ...prev, ...updates }));
  }

  async function handleMenuSelect(menu: Menu) {
    update({ selectedMenu: menu });
    await withLoading(async () => {
      const { data } = await supabase
        .from('users')
        .select('is_first_visit')
        .eq('line_user_id', userId)
        .maybeSingle();
      setIsFirstVisit(data ? (data.is_first_visit as boolean) : true);
    });
    setStep('calendar');
  }

  function handleTimeSelect(time: string) {
    update({ selectedTime: time });
    // 初回以外は入力フォームをスキップして確認へ
    setStep(isFirstVisit ? 'form' : 'confirm');
  }

  async function handleConfirm() {
    if (!state.selectedMenu || !state.selectedDate || !state.selectedTime) return;
    const menu = state.selectedMenu;
    const date = state.selectedDate;
    const time = state.selectedTime;
    setSubmitting(true);

    await withLoading(async () => {
      try {
        // ユーザーをupsert（LINEの名前を保存）
        const { data: user, error: ue } = await supabase
          .from('users')
          .upsert(
            { line_user_id: userId, name },
            { onConflict: 'line_user_id' }
          )
          .select()
          .single();
        if (ue || !user) throw new Error('ユーザー登録に失敗しました');

        // 二重予約チェック
        const { data: existing } = await supabase
          .from('reservations')
          .select('id')
          .eq('date', state.selectedDate)
          .eq('time', state.selectedTime)
          .eq('status', 'confirmed')
          .maybeSingle();
        if (existing) throw new Error('この時間はすでに予約されています。別の時間をお選びください。');

        // 予約作成
        const { data: reservation, error: re } = await supabase
          .from('reservations')
          .insert({
            user_id: user.id,
            menu_id: menu.id,
            date,
            time,
            referrer_name: state.referrerName || null,
          })
          .select()
          .single();

        if (re || !reservation) throw new Error('予約の作成に失敗しました');

        // 初回訪問フラグを更新
        await supabase
          .from('users')
          .update({ is_first_visit: false })
          .eq('id', user.id);

        setCompletedId(reservation.id);
        setStep('complete');
      } catch (err) {
        alert(err instanceof Error ? err.message : '予約に失敗しました');
      } finally {
        setSubmitting(false);
      }
    });
  }

  function handleReset() {
    setState(INITIAL_STATE);
    setStep('menu');
    setCompletedId('');
  }

  // 管理画面判定（URLパラメータで判定、本来はより堅牢な方法が必要）
  const isAdminMode = window.location.hash === '#admin';

  if (isAdminMode) {
    return <AdminPage />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>カウンセリング予約</h1>
        {pictureUrl && <img src={pictureUrl} alt={name} className="profile-pic" />}
      </header>

      <StepIndicator currentStep={step} />

      <main className="app-main">
        {step === 'menu' && (
          <MenuSelect
            menus={menus}
            onSelect={handleMenuSelect}
            isLoading={isMenuLoading}
          />
        )}

        {step === 'calendar' && state.selectedMenu && (
          <CalendarPicker
            onSelect={(date) => {
              update({ selectedDate: date });
              setStep('time');
            }}
            selectedDate={state.selectedDate || undefined}
          />
        )}

        {step === 'time' && state.selectedDate && (
          <TimePicker
            date={state.selectedDate}
            onSelect={handleTimeSelect}
            selectedTime={state.selectedTime || undefined}
            reservations={reservations}
          />
        )}

        {step === 'form' && (
          <ReservationForm
            defaultName={name}
            onSubmit={(data) => {
              update({ referrerName: data.referrerName });
              setStep('confirm');
            }}
          />
        )}

        {step === 'confirm' && state.selectedMenu && state.selectedDate && state.selectedTime && (
          <Confirmation
            menu={state.selectedMenu}
            date={state.selectedDate}
            time={state.selectedTime}
            userName={name}
            referrerName={state.referrerName}
            onConfirm={handleConfirm}
            onCancel={() => setStep(isFirstVisit ? 'form' : 'time')}
            isLoading={submitting}
          />
        )}

        {step === 'complete' && (
          <Complete
            reservationId={completedId}
            onNewReservation={handleReset}
          />
        )}
      </main>
    </div>
  );
}

export default ReservationApp;
