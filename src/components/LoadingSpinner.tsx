interface Props {
  variant?: 'full' | 'overlay';
}

const SPARKLES = [
  { top: '12%', left: '12%', delay: '0s',   size: '14px' },
  { top: '8%',  left: '68%', delay: '0.5s', size: '10px' },
  { top: '28%', left: '88%', delay: '0.9s', size: '16px' },
  { top: '55%', left: '6%',  delay: '0.3s', size: '12px' },
  { top: '72%', left: '82%', delay: '0.7s', size: '10px' },
  { top: '42%', left: '4%',  delay: '1.2s', size: '8px'  },
  { top: '18%', left: '50%', delay: '1.5s', size: '12px' },
];

function CrescentMoonSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" className="crystal-vessel-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="crescent-mask">
          <circle cx="50" cy="50" r="38" fill="white" />
          <circle cx="66" cy="38" r="30" fill="black" />
        </mask>
      </defs>
      <circle cx="50" cy="50" r="38" fill={color} mask="url(#crescent-mask)" />
    </svg>
  );
}

export function LoadingSpinner({ variant = 'full' }: Props) {
  const isFull = variant === 'full';

  return (
    <div className={isFull ? 'spinner-overlay' : 'spinner-overlay-api'}>
      {isFull && SPARKLES.map((s, i) => (
        <div
          key={i}
          className="sparkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay, fontSize: s.size }}
        ></div>
      ))}
      <div className="spinner-container">
        <CrescentMoonSvg color="#c4a8e0" />
      </div>
      <p className="loading-text">カウンセリング情報を準備中...</p>
    </div>
  );
}
