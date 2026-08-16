import { io, Socket } from 'socket.io-client';
import { User, TrustedContact, Journey, RouteOption } from '../types';

const rawApiUrl = ((import.meta as any).env?.VITE_API_URL as string) || '';
const API_BASE = rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`) : '/api';

let socketClient: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketClient) {
    const socketOrigin = rawApiUrl || window.location.origin;
    socketClient = io(socketOrigin, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 5000,
      timeout: 6000,
      autoConnect: true,
    });

    socketClient.on('connect_error', () => {
      // Quiet failover on serverless environments (e.g. Vercel) where WebSockets are unsupported
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

// Helper for parsing HTTP responses safely without throwing JSON syntax errors
async function handleResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error(
          'Access forbidden (403). If deployed on Vercel, please disable "Deployment Protection" (Vercel Authentication) in Vercel Settings > Deployment Protection.'
        );
      }
      if (res.status === 404) {
        throw new Error('Unable to connect to the HerShield server. Please check the API configuration or server URL.');
      }
      if (res.status >= 500) {
        throw new Error('HerShield server is currently starting or encountered an issue. Please try again in a moment.');
      }
      const cleanSnippet = text.replace(/<[^>]*>?/gm, '').trim();
      throw new Error(`Server returned error (${res.status}): ${cleanSnippet.slice(0, 120) || 'Unexpected response'}`);
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    const errorObj = new Error(errorMsg);
    (errorObj as any).unverified = data?.unverified;
    (errorObj as any).email = data?.email;
    (errorObj as any).code = data?.code;
    (errorObj as any).verificationToken = data?.verificationToken;
    (errorObj as any).verifyUrl = data?.verifyUrl;
    throw errorObj;
  }

  return data;
}

// Helper for authenticated HTTP requests
async function authFetch(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  return await handleResponse(res);
}

// --- AUTH SERVICES ---
export const apiRegister = async (
  name: string,
  email: string,
  pass: string,
  confirmPass: string
): Promise<{
  success: boolean;
  message: string;
  email: string;
  token?: string;
  user?: User;
  verificationToken?: string;
  verifyUrl?: string;
  emailSimulated?: boolean;
  emailError?: string;
}> => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: pass, confirmPassword: confirmPass }),
  });
  const data = await handleResponse(res);
  if (data.token && data.user) {
    setStoredToken(data.token);
    setStoredUser(data.user);
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
  return await handleResponse(res);
};

export const apiResendVerification = async (
  email: string
): Promise<{
  success: boolean;
  message: string;
  verificationToken?: string;
  verifyUrl?: string;
  emailSimulated?: boolean;
  emailError?: string;
}> => {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return await handleResponse(res);
};

export const apiForgotPassword = async (
  email: string
): Promise<{ success: boolean; message: string; resetToken?: string; resetUrl?: string }> => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return await handleResponse(res);
};

export const apiResetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  return await handleResponse(res);
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

export const apiNotifyCircle = async (journeyId: string): Promise<{ success: boolean; message: string; count?: number }> => {
  return await authFetch(`${API_BASE}/journeys/${journeyId}/notify-circle`, { method: 'POST' });
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
  return await handleResponse(res);
};
