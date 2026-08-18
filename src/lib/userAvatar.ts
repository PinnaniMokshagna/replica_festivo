import { useState, useEffect } from 'react';

const AVATAR_KEY = 'festivo_user_avatar';

export function getUserAvatar(): string | null {
  try {
    return localStorage.getItem(AVATAR_KEY);
  } catch {
    return null;
  }
}

export function setUserAvatar(url: string | null): void {
  try {
    if (url) {
      localStorage.setItem(AVATAR_KEY, url);
    } else {
      localStorage.removeItem(AVATAR_KEY);
    }
    window.dispatchEvent(new Event('user-avatar-changed'));
  } catch (e) {
    console.error('Failed to set user avatar', e);
  }
}

export function useUserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => getUserAvatar());

  useEffect(() => {
    const handleUpdate = () => setAvatarUrl(getUserAvatar());
    window.addEventListener('user-avatar-changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('user-avatar-changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    avatarUrl,
    setAvatar: setUserAvatar,
    removeAvatar: () => setUserAvatar(null)
  };
}
