import type { Menu } from '../types';

interface Props {
  menus: Menu[];
  onSelect: (menu: Menu) => void;
  isLoading?: boolean;
}

export function MenuSelect({ menus, onSelect, isLoading }: Props) {
  if (isLoading) {
    return <div className="loading">メニューを読み込み中...</div>;
  }

  if (!menus || menus.length === 0) {
    return <div className="error">メニューが取得できませんでした</div>;
  }

  return (
    <div className="menu-select">
      <h2>カウンセリングメニューを選択してください</h2>
      <div className="menu-grid">
        {menus.map((menu) => (
          <button
            key={menu.id}
            className="menu-card"
            onClick={() => onSelect(menu)}
            disabled={!menu.is_active}
          >
            <div className="menu-name">{menu.name}</div>
            <div className="menu-description">{menu.description}</div>
            <div className="menu-duration">{menu.duration_minutes}分</div>
            <div className="menu-price">¥{menu.price.toLocaleString()}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
