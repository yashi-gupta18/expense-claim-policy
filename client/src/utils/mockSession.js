const SESSION_KEY = 'expenseClaimMockSession';

export function getMockSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!['claimant', 'reviewer'].includes(session.role) || !session.name) return null;
    return session;
  } catch {
    return null;
  }
}

export function saveMockSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ role: session.role, name: session.name.trim() }));
}

export function clearMockSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function sessionIdFromName(name = '') {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mock-user';
}
