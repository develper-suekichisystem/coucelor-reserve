import type { Step } from '../types';

interface Props {
  currentStep: Step;
}

export function StepIndicator({ currentStep }: Props) {
  const steps: Step[] = ['menu', 'calendar', 'time', 'form', 'confirm', 'complete'];
  const stepLabels: Record<Step, string> = {
    menu: 'メニュー選択',
    calendar: 'カレンダー',
    time: '時間選択',
    form: '情報入力',
    confirm: '確認',
    complete: '完了',
  };

  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="step-indicator">
      {steps.slice(0, -1).map((step, index) => (
        <div key={step} className="step-group">
          <div
            className={`step-circle ${
              index < currentIndex ? 'completed' : index === currentIndex ? 'active' : ''
            }`}
          >
            {index < currentIndex ? '✓' : index + 1}
          </div>
          <span className="step-label">{stepLabels[step]}</span>
          {index < steps.length - 2 && <div className="step-connector"></div>}
        </div>
      ))}
    </div>
  );
}
