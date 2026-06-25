import type { VercelRequest, VercelResponse } from '@vercel/node';

const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push';

interface NotifyPayload {
  userId: string;
  userName: string;
  menuName: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  customerDurationMinutes?: number;
  reservationId: string;
  locationName?: string;
  locationAddress?: string;
}

async function pushMessage(to: string, text: string): Promise<void> {
  const res = await fetch(LINE_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages: [{ type: 'text', text }] }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINE API error ${res.status}: ${body}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, userName, menuName, date, time, customerDurationMinutes, reservationId, locationName, locationAddress } =
    req.body as NotifyPayload;

  const formattedDate = date.replace(/-/g, '/');
  const customerHours = Math.ceil((customerDurationMinutes ?? 60) / 60);
  const endHour = parseInt(time.slice(0, 2)) + customerHours;
  const endTime = `${String(endHour).padStart(2, '0')}:00`;
  const shortId = reservationId.slice(0, 8).toUpperCase();

  const userMsg = `【ご予約確認】

${userName} 様

以下の内容でカウンセリングのご予約を承りました。

━━━━━━━━━━━━━━
メニュー：${menuName}
日　　時：${formattedDate} ${time}〜${endTime}
場　　所：${locationName ?? '未定'}${locationAddress ? `\n住　　所：${locationAddress}` : ''}
予約番号：${shortId}
━━━━━━━━━━━━━━

キャンセルの場合はLINEよりご連絡ください。

当日お会いできることを楽しみにしています 🌸`;

  const adminMsg = `【新規カウンセリング予約】

お客様：${userName}
メニュー：${menuName}
日　　時：${formattedDate} ${time}〜${endTime}
場　　所：${locationName ?? '未定'}${locationAddress ? `\n住　　所：${locationAddress}` : ''}
予約番号：${shortId}`;

  try {
    const tasks: Promise<void>[] = [pushMessage(userId, userMsg)];

    const adminId = process.env.ADMIN_LINE_USER_ID;
    if (adminId) tasks.push(pushMessage(adminId, adminMsg));

    await Promise.all(tasks);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('LINE notify error:', err);
    return res.status(500).json({ error: 'Notification failed' });
  }
}
