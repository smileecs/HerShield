import { io, Socket } from 'socket.io-client';
import { User, TrustedContact, Journey, RouteOption } from '../types';

const API_BASE = '/api';

let socketClient: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketClient) {
    socketClient = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socketClient;
};

// Local storage key constants
const TOKEN_KEY = 'hershield_token';
const USER_KEY = 'hershield_user';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

// Helper for authenticated HTTP requests
async function authFetch(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({ error: 'Request failed' }));

  if (!res.ok) {
    const errorObj = new Error(data.error || 'Server error occurred');
    (errorObj as any).unverified = data.unverified;
    (errorObj as any).email = data.email;
    throw errorObj;
  }
  return data;
}

// --- AUTH SERVICES ---
export const apiRegister = async (
  name: string,
  email: string,
  pass: string,
  confirmPass: string
): Promise<{ message: string; email: string; verificationToken?: string }> => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: pass, confirmPassword: confirmPass }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
};

export const apiLogin = async (email: string, pass: string): Promise<{ token: string; user: User }> => {
  const data = await authFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password: pass }),
  });
  setStoredToken(data.token);
  setStoredUser(data.user);
  return data;
};

export const apiGetMe = async (): Promise<User> => {
  const data = await authFetch(`${API_BASE}/auth/me`);
  setStoredUser(data.user);
  return data.user;
};

export const apiVerifyEmail = async (token: string): Promise<{ success: boolean; message: string; email?: string }> => {
  const res = await fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Email verification failed');
  }
  return data;
};

export const apiResendVerification = async (email: string): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to resend verification email');
  }
  return data;
};

export const apiForgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Forgot password request failed');
  }
  return data;
};

export const apiResetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Password reset failed');
  }
  return data;
};

// --- ROUTING SERVICES ---
export const apiCalculateRoutes = async (
  start: string | { address: string; lat: number; lng: number },
  destination: string | { address: string; lat: number; lng: number }
): Promise<{
  startLocation: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  routes: RouteOption[];
}> => {
  return await authFetch(`${API_BASE}/routes/calculate`, {
    method: 'POST',
    body: JSON.stringify({ start, destination }),
  });
};

// --- TRUSTED CONTACTS SERVICES ---
export const apiGetContacts = async (): Promise<TrustedContact[]> => {
  return await authFetch(`${API_BASE}/contacts`);
};

export const apiAddContact = async (contactData: Omit<TrustedContact, 'id' | 'userId' | 'verificationStatus'>): Promise<TrustedContact> => {
  return await authFetch(`${API_BASE}/contacts`, {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
};

export const apiUpdateContact = async (id: string, updates: Partial<TrustedContact>): Promise<TrustedContact> => {
  return await authFetch(`${API_BASE}/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const apiDeleteContact = async (id: string): Promise<void> => {
  await authFetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
};

// --- JOURNEY SERVICES ---
export const apiGetJourneys = async (): Promise<Journey[]> => {
  return await authFetch(`${API_BASE}/journeys`);
};

export const apiCreateJourney = async (payload: {
  startLocation: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  selectedRoute: RouteOption;
  trustedContacts: TrustedContact[];
  sharingPreference: 'Live Location' | 'Status Only';
}): Promise<Journey> => {
  return await authFetch(`${API_BASE}/journeys`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const apiGetJourney = async (journeyId: string): Promise<Journey> => {
  return await authFetch(`${API_BASE}/journeys/${journeyId}`);
};

export const apiCompleteJourney = async (journeyId: string): Promise<Journey> => {
  return await authFetch(`${API_BASE}/journeys/${journeyId}/complete`, { method: 'POST' });
};

export const apiEndJourney = async (journeyId: string): Promise<Journey> => {
  return await authFetch(`${API_BASE}/journeys/${journeyId}/end`, { method: 'POST' });
};

export const apiUpdateLocation = async (journeyId: string, lat: number, lng: number, progressPercent: number): Promise<void> => {
  await authFetch(`${API_BASE}/journeys/${journeyId}/location`, {
    method: 'POST',
    body: JSON.stringify({ lat, lng, progressPercent }),
  });
};

export const apiDeleteJourneyHistory = async (journeyId: string): Promise<void> => {
  await authFetch(`${API_BASE}/journeys/${journeyId}`, { method: 'DELETE' });
};

export const apiGetSharedJourney = async (shareToken: string): Promise<Journey & { userName?: string }> => {
  const res = await fetch(`${API_BASE}/journeys/share/${shareToken}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Shared journey not found or link expired.');
  }
  return data;
};
