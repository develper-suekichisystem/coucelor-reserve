import { useState, useEffect } from 'react';

interface LiffContextType {
  isReady: boolean;
  isLoggedIn: boolean;
  userId: string;
  displayName: string;
  pictureUrl: string;
  error: string | null;
}

export function useLiff(): LiffContextType {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liff = await import('@line/liff');
        await liff.default.init({ liffId: import.meta.env.VITE_LIFF_ID });
        setIsReady(true);

        if (liff.default.isLoggedIn()) {
          setIsLoggedIn(true);
          const profile = await liff.default.getProfile();
          setUserId(profile.userId);
          setDisplayName(profile.displayName);
          setPictureUrl(profile.pictureUrl || '');
        } else {
          liff.default.login();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize LIFF');
        setIsReady(true);
      }
    };

    initLiff();
  }, []);

  return {
    isReady,
    isLoggedIn,
    userId,
    displayName,
    pictureUrl,
    error,
  };
}
