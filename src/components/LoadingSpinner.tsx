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

function CrystalVesselSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 160" className="crystal-vessel-svg" xmlns="http://www.w3.org/2000/svg">
      {/* 壺/水晶の上部（結晶状） */}
      <polygon points="40,10 35,20 45,25 55,20 60,10 50,15" fill={color} opacity="0.8" />
      <polygon points="38,15 32,28 48,32 62,28 68,15 50,20" fill={color} opacity="0.7" />
      
      {/* メインの壺型ボディ */}
      <path d="M35,28 Q30,45 32,65 Q35,80 50,85 Q65,80 68,65 Q70,45 65,28 Z" fill={color} opacity="0.9" stroke={color} strokeWidth="1" />
      
      {/* 壺の中の液体（アニメーション予定） */}
      <ellipse cx="50" cy="75" rx="14" ry="6" fill={color} opacity="0.5" />
      <path d="M36,70 Q38,75 50,77 Q62,75 64,70" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
      
      {/* 壺の取手（左） */}
      <path d="M35,40 Q20,45 22,55" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
      
      {/* 壺の取手（右） */}
      <path d="M65,40 Q80,45 78,55" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
      
      {/* 壺の口部分 */}
      <ellipse cx="50" cy="28" rx="16" ry="4" fill={color} opacity="0.7" stroke={color} strokeWidth="1" />
      <ellipse cx="50" cy="27" rx="14" ry="3" fill={color} opacity="0.4" />
      
      {/* 底部の装飾 */}
      <ellipse cx="50" cy="85" rx="15" ry="5" fill={color} opacity="0.6" />
      <path d="M35,85 Q40,90 50,92 Q60,90 65,85" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      
      {/* 水晶のきらめき効果 */}
      <line x1="42" y1="35" x2="44" y2="60" stroke={color} strokeWidth="1" opacity="0.4" strokeDasharray="2,2" />
      <line x1="56" y1="35" x2="54" y2="60" stroke={color} strokeWidth="1" opacity="0.4" strokeDasharray="2,2" />
    </svg>
  );
}

export function LoadingSpinner({ variant = 'full' }: Props) {
  const isFull = variant === 'full';

  return (
    <div className={isFull ? 'spinner-overlay' : 'spinner-overlay-api'}>
      {/* スパークル（full のみ） */}
      {isFull && SPARKLES.map((s, i) => (
        <div
          key={i}
          className="sparkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay, fontSize: s.size }}
        ></div>
      ))}
      <div className="spinner-container">
        <CrystalVesselSvg color="#9966CC" />
      </div>
      <p className="loading-text">カウンセリング情報を準備中...</p>
    </div>
  );
}
