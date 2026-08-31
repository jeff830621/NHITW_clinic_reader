// JWT decode helper that handles base64url + UTF-8 reliably.
// Returns parsed payload object, or null on failure.
// NHI's JWT often uses URL-safe base64 without `=` padding; the bare atob()
// throws InvalidCharacterError on it.
export function decodeJwtPayload(rawToken) {
  if (!rawToken) return null;
  try {
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';

    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
