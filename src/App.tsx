import { useState } from 'react';
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
import type { Step, ReservationState, Menu } from './types/index';

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
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedId, setCompletedId] = useState('');
  const { withLoading } = useLoading();

  if (!isReady || (!isLoggedIn && !error)) return <LoadingSpinner />;
  if (error)   return <div className="error-screen">エラー: {error}</div>;
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
    setStep(isFirstVisit ? 'form' : 'confirm');
  }

  async function handleConfirm() {
    if (!state.selectedMenu || !state.selectedDate || !state.selectedTime) return;
    const menu = state.selectedMenu;
    const date = state.selectedDate;
    const time = state.selectedTime;
    setSubmitting(true);

    await withLoading(async () => { try {
      const { data: user, error: ue } = await supabase
        .from('users')
        .upsert(
          { line_user_id: userId, name },
          { onConflict: 'line_user_id' }
        )
        .select()
        .single();
      if (ue || !user) throw new Error('ユーザー登録に失敗しました');

      const { data: existing } = await supabase
        .from('reservations')
        .select('id')
        .eq('date', state.selectedDate)
        .eq('time', state.selectedTime)
        .eq('status', 'confirmed')
        .maybeSingle();
      if (existing) throw new Error('この時間はすでに予約されています。別の時間をお選びください。');

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

      if (isFirstVisit) {
        await supabase
          .from('users')
          .update({ is_first_visit: false })
          .eq('line_user_id', userId);
      }

      setCompletedId(reservation.id as string);
      setStep('complete');
    } catch (err) {
      alert(err instanceof Error ? err.message : '予約に失敗しました');
    } finally {
      setSubmitting(false);
    } });
  }

  const backFromConfirm = () => setStep(isFirstVisit ? 'form' : 'time');

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">カウンセリング予約</h1>
        <p className="app-subtitle">ゆかカウンセラー</p>
      </header>

      {step !== 'complete' && <StepIndicator currentStep={step} />}

      <main className="app-main">
        {step === 'menu' && (
          <MenuSelect onSelect={handleMenuSelect} />
        )}
        {step === 'calendar' && (
          <CalendarPicker
            onSelect={date => { update({ selectedDate: date }); setStep('time'); }}
            onBack={() => setStep('menu')}
          />
        )}
        {step === 'time' && state.selectedDate && (
          <TimePicker
            date={state.selectedDate}
            onSelect={handleTimeSelect}
            onBack={() => setStep('calendar')}
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
            onCancel={backFromConfirm}
            isLoading={submitting}
          />
        )}
        {step === 'complete' && (
          <Complete
            reservationId={completedId}
            onNewReservation={() => { setState(INITIAL_STATE); setStep('menu'); setCompletedId(''); }}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  if (window.location.hash === '#admin') return <AdminPage />;
  return <ReservationApp />;
}
