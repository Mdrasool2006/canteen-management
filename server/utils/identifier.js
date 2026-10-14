// Detects whether the user typed an email or a phone number and normalizes it.
// Returns { type: 'email' | 'phone', value } or null when invalid.
export function parseIdentifier(raw = '') {
  const value = String(raw).trim();

  if (value.includes('@')) {
    const email = value.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return { type: 'email', value: email };
  }

  const digits = value.replace(/[\s()-]/g, '');
  if (!/^\+?\d{10,15}$/.test(digits)) return null;
  return { type: 'phone', value: digits };
}
