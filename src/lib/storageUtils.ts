/**
 * Sanitizes an object or string by replacing large Data URLs (> 1000 characters)
 * with lightweight placeholder references so localStorage quota (5MB) is never exceeded.
 */
export function sanitizeForStorage(value: any): any {
  if (value === null || value === undefined) return value;
  
  if (typeof value === 'string') {
    if (value.startsWith('data:') && value.length > 1000) {
      if (value.startsWith('data:image')) {
        return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';
      }
      return 'uploaded_document.pdf';
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeForStorage);
  }

  if (typeof value === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      cleaned[key] = sanitizeForStorage(value[key]);
    }
    return cleaned;
  }

  return value;
}

/**
 * Safe localStorage helper that handles QuotaExceededError gracefully
 * Truncates huge base64 strings and clears non-essential cache if storage exceeds limit
 */
export function safeSetItem(key: string, value: string): void {
  let cleanedValue = value;

  // If value contains a data URL or is very large, sanitize it first
  if (typeof value === 'string' && (value.includes('data:') || value.length > 20000)) {
    try {
      const parsed = JSON.parse(value);
      cleanedValue = JSON.stringify(sanitizeForStorage(parsed));
    } catch {
      if (value.startsWith('data:') && value.length > 1000) {
        cleanedValue = value.startsWith('data:image')
          ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'
          : 'uploaded_document.pdf';
      }
    }
  }

  try {
    localStorage.setItem(key, cleanedValue);
  } catch (err: any) {
    console.warn(`localStorage quota exceeded when writing '${key}'. Cleaning up storage...`, err);

    try {
      // 1. Remove non-critical caches
      localStorage.removeItem('festivo_cache');

      // Trim admin notifications if too long
      const notifsRaw = localStorage.getItem('festivo_admin_notifications');
      if (notifsRaw) {
        try {
          const notifs = JSON.parse(notifsRaw);
          if (Array.isArray(notifs) && notifs.length > 3) {
            localStorage.setItem('festivo_admin_notifications', JSON.stringify(notifs.slice(0, 3)));
          }
        } catch {}
      }

      // 2. Try saving sanitized value
      localStorage.setItem(key, cleanedValue);
    } catch (retryErr) {
      console.warn(`Unable to save '${key}' to localStorage even after cleanup:`, retryErr);
    }
  }
}

/**
 * Compact file reader URL helper — converts uploaded File to compact Data URL or Unsplash fallback
 */
export function compactFileUrl(url: string | null, fallback: string): string {
  if (!url) return fallback;
  if (url.startsWith('data:') && url.length > 20000) {
    return fallback;
  }
  return url;
}

/**
 * Reads an uploaded image file and compresses it to a lightweight data URL for responsive rendering.
 */
export function readAndCompressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

