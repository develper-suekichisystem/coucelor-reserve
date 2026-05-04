-- ============================================================
-- ゆか カウンセラー 予約システム — Supabase Schema（リンパと共用DB）
-- ============================================================

-- menus（メニューマスタ — リンパ・カウンセラー共用）
CREATE TABLE menus (
  id                         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type               TEXT        NOT NULL DEFAULT 'counselor'
                                         CHECK (service_type IN ('rinpa', 'counselor')),
  name                       TEXT        NOT NULL,
  price                      INTEGER     NOT NULL,
  duration_minutes           INTEGER     DEFAULT 60,
  customer_duration_minutes  INTEGER,
  provider_duration_minutes  INTEGER,
  description                TEXT,
  is_active                  BOOLEAN     DEFAULT true,
  sort_order                 INTEGER     DEFAULT 0,
  created_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- users（LINE連携ユーザー）
CREATE TABLE users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id  TEXT        UNIQUE NOT NULL,
  name          TEXT        NOT NULL,
  phone         TEXT,
  email         TEXT,
  is_first_visit BOOLEAN    DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- reservations（予約 — リンパ・カウンセラー共用で重複防止）
CREATE TABLE reservations (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES users(id)  NOT NULL,
  menu_id       UUID        REFERENCES menus(id)  NOT NULL,
  date          DATE        NOT NULL,
  time          TIME        NOT NULL,
  status        TEXT        DEFAULT 'confirmed'
                            CHECK (status IN ('confirmed', 'cancelled')),
  referrer_name TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 重複予約防止：confirmed状態での (date, time) を一意に（リンパ・カウンセラー横断）
CREATE UNIQUE INDEX reservations_no_overlap
  ON reservations(date, time)
  WHERE status = 'confirmed';

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE menus         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menus_select_all" ON menus FOR SELECT USING (true);
CREATE POLICY "menus_insert"     ON menus FOR INSERT WITH CHECK (true);
CREATE POLICY "menus_update"     ON menus FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "menus_delete"     ON menus FOR DELETE USING (true);

CREATE POLICY "users_all"        ON users        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "reservations_all" ON reservations FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- closed_dates（定休曜日・特定の休日 — 共用）
-- ============================================================
CREATE TABLE closed_dates (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type         TEXT        NOT NULL CHECK (type IN ('weekly', 'date')),
  day_of_week  INTEGER     CHECK (day_of_week BETWEEN 0 AND 6),
  date         DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE closed_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "closed_dates_all" ON closed_dates FOR ALL USING (true) WITH CHECK (true);

-- blocked_slots（対応不可日時 — 共用）
CREATE TABLE blocked_slots (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  date       DATE        NOT NULL,
  time       TIME        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, time)
);

ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocked_slots_all" ON blocked_slots FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 既存DBへのマイグレーション（初回のみ実行）
-- ============================================================
-- ALTER TABLE menus ADD COLUMN service_type TEXT NOT NULL DEFAULT 'rinpa'
--   CHECK (service_type IN ('rinpa', 'counselor'));
-- UPDATE menus SET service_type = 'counselor' WHERE name IN (
--   '初回カウンセリング', '通常カウンセリング（60分）', '深掘りカウンセリング（90分）',
--   '短時間相談（30分）', 'カウンセリング＋心理診断'
-- );

-- ============================================================
-- 初期データ（カウンセリングメニュー）
-- ============================================================
INSERT INTO menus (service_type, name, price, duration_minutes, description, sort_order) VALUES
  ('counselor', '初回カウンセリング', 5000, 60, 'あなたのお悩みをゆっくりお聞かせください。初回限定特別料金です', 1),
  ('counselor', '通常カウンセリング（60分）', 8000, 60, 'じっくりと向き合い、心身の不調に対応します', 2),
  ('counselor', '深掘りカウンセリング（90分）', 12000, 90, 'より深く、より丁寧にあなたの問題に向き合います', 3),
  ('counselor', '短時間相談（30分）', 4000, 30, 'ちょっとお話ししたい方向けの短時間プランです', 4),
  ('counselor', 'カウンセリング＋心理診断', 10000, 75, 'カウンセリングと心理診断を組み合わせたプレミアムコース', 5);
