const BROWSER_ID_KEY = 'skylandly_browser_id';

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `browser_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function getBrowserId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const existing = localStorage.getItem(BROWSER_ID_KEY);
    if (existing) {
      return existing;
    }

    const newId = generateId();
    localStorage.setItem(BROWSER_ID_KEY, newId);
    return newId;
  } catch {
    return null;
  }
}
