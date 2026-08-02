import { io, Socket } from 'socket.io-client';
import { User, TrustedContact, Journey, RouteOption } from '../types';
import { DEMO_USER, DEFAULT_TRUSTED_CONTACTS, INITIAL_JOURNEYS_HISTORY } from '../data/mockData';

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
const TOKEN_KEY = 'saferoute_token';
const USER_KEY = 'saferoute_user';
const CONTACTS_KEY = 'saferoute_contacts';
const JOURNEYS_KEY = 'saferoute_journeys';

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
  if (!raw) return DEMO_USER; // Default demo user for hackathon showcase
  try {
    return JSON.parse(raw);
  } catch {
    return DEMO_USER;
  }
};

export const setStoredUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

// Local Storage Contacts helper
export const getLocalContacts = (): TrustedContact[] => {
  const raw = localStorage.getItem(CONTACTS_KEY);
  if (!raw) return DEFAULT_TRUSTED_CONTACTS;
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TRUSTED_CONTACTS;
  }
};

export const setLocalContacts = (contacts: TrustedContact[]) => {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
};

// Local Storage Journeys helper
export const getLocalJourneys = (): Journey[] => {
  const raw = localStorage.getItem(JOURNEYS_KEY);
  if (!raw) return INITIAL_JOURNEYS_HISTORY;
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_JOURNEYS_HISTORY;
  }
};

export const setLocalJourneys = (journeys: Journey[]) => {
  localStorage.setItem(JOURNEYS_KEY, JSON.stringify(journeys));
};

// Helper for HTTP requests
async function authFetch(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || 'Server request error');
  }
  return res.json();
}

// Auth Services
export const apiRegister = async (name: string, email: string, pass: string): Promise<{ token: string; user: User }> => {
  try {
    const data = await authFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass }),
    });
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  } catch (err) {
    console.warn('Backend API unavailable, executing local signup mode:', err);
    const mockUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      settings: { locationSharingPreference: 'active_journey_only', saveJourneyHistory: true },
    };
    const token = 'local_demo_jwt_token';
    setStoredToken(token);
    setStoredUser(mockUser);
    return { token, user: mockUser };
  }
};

export const apiLogin = async (email: string, pass: string): Promise<{ token: string; user: User }> => {
  try {
    const data = await authFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  } catch (err) {
    console.warn('Backend API fallback for demo login:', err);
    const user = getStoredUser() || DEMO_USER;
    const token = 'local_demo_jwt_token';
    setStoredToken(token);
    setStoredUser(user);
    return { token, user };
  }
};

export const apiGetMe = async (): Promise<User> => {
  try {
    const data = await authFetch(`${API_BASE}/auth/me`);
    setStoredUser(data.user);
    return data.user;
  } catch {
    return getStoredUser() || DEMO_USER;
  }
};

// Trusted Contacts Services
export const apiGetContacts = async (): Promise<TrustedContact[]> => {
  try {
    return await authFetch(`${API_BASE}/contacts`);
  } catch {
    return getLocalContacts();
  }
};

export const apiAddContact = async (contactData: Omit<TrustedContact, 'id' | 'userId' | 'verificationStatus'>): Promise<TrustedContact> => {
  try {
    return await authFetch(`${API_BASE}/contacts`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  } catch {
    const current = getLocalContacts();
    const newC: TrustedContact = {
      ...contactData,
      id: `tc_${Date.now()}`,
      userId: getStoredUser()?.id || 'usr_demo_1',
      verificationStatus: 'Verified',
    };
    const updated = [newC, ...current];
    setLocalContacts(updated);
    return newC;
  }
};

export const apiDeleteContact = async (id: string): Promise<void> => {
  try {
    await authFetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
  } catch {
    const current = getLocalContacts();
    setLocalContacts(current.filter((c) => c.id !== id));
  }
};

// Journey Services
export const apiGetJourneys = async (): Promise<Journey[]> => {
  try {
    return await authFetch(`${API_BASE}/journeys`);
  } catch {
    return getLocalJourneys();
  }
};

export const apiCreateJourney = async (payload: {
  startLocation: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  selectedRoute: RouteOption;
  trustedContacts: TrustedContact[];
  sharingPreference: 'Live Location' | 'Status Only';
}): Promise<Journey> => {
  try {
    return await authFetch(`${API_BASE}/journeys`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    const currentList = getLocalJourneys();
    const id = `jrn_${Date.now()}`;
    const shareToken = `st_${Math.random().toString(36).substring(2, 10)}`;
    const newJourney: Journey = {
      id,
      userId: getStoredUser()?.id || 'usr_demo_1',
      shareToken,
      startLocation: payload.startLocation,
      destination: payload.destination,
      selectedRoute: payload.selectedRoute,
      trustedContacts: payload.trustedContacts,
      startTime: new Date().toISOString(),
      expectedArrival: new Date(Date.now() + (payload.selectedRoute.durationMin || 15) * 60 * 1000).toISOString(),
      status: 'active',
      sharingPreference: payload.sharingPreference,
      currentLocation: { lat: payload.startLocation.lat, lng: payload.startLocation.lng },
      progressPercent: 0,
      locationHistory: [
        {
          lat: payload.startLocation.lat,
          lng: payload.startLocation.lng,
          timestamp: new Date().toISOString(),
        },
      ],
      lastUpdateNote: 'Journey started',
    };
    setLocalJourneys([newJourney, ...currentList]);
    return newJourney;
  }
};

export const apiCompleteJourney = async (journeyId: string): Promise<Journey> => {
  try {
    return await authFetch(`${API_BASE}/journeys/${journeyId}/complete`, { method: 'POST' });
  } catch {
    const currentList = getLocalJourneys();
    const idx = currentList.findIndex((j) => j.id === journeyId);
    if (idx !== -1) {
      currentList[idx].status = 'completed';
      currentList[idx].progressPercent = 100;
      currentList[idx].endTime = new Date().toISOString();
      currentList[idx].lastUpdateNote = 'Completed — User confirmed I\'m Safe';
      setLocalJourneys([...currentList]);
      return currentList[idx];
    }
    throw new Error('Journey not found');
  }
};

export const apiEndJourney = async (journeyId: string): Promise<Journey> => {
  try {
    return await authFetch(`${API_BASE}/journeys/${journeyId}/end`, { method: 'POST' });
  } catch {
    const currentList = getLocalJourneys();
    const idx = currentList.findIndex((j) => j.id === journeyId);
    if (idx !== -1) {
      currentList[idx].status = 'cancelled';
      currentList[idx].endTime = new Date().toISOString();
      currentList[idx].lastUpdateNote = 'Journey cancelled by user';
      setLocalJourneys([...currentList]);
      return currentList[idx];
    }
    throw new Error('Journey not found');
  }
};

export const apiUpdateLocation = async (journeyId: string, lat: number, lng: number, progressPercent: number): Promise<void> => {
  try {
    await authFetch(`${API_BASE}/journeys/${journeyId}/location`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng, progressPercent }),
    });
  } catch {
    const currentList = getLocalJourneys();
    const idx = currentList.findIndex((j) => j.id === journeyId);
    if (idx !== -1) {
      currentList[idx].currentLocation = { lat, lng };
      currentList[idx].progressPercent = progressPercent;
      currentList[idx].locationHistory.push({ lat, lng, timestamp: new Date().toISOString() });
      setLocalJourneys([...currentList]);
    }
  }
};

export const apiDeleteJourneyHistory = async (journeyId: string): Promise<void> => {
  try {
    await authFetch(`${API_BASE}/journeys/${journeyId}`, { method: 'DELETE' });
  } catch {
    const currentList = getLocalJourneys();
    setLocalJourneys(currentList.filter((j) => j.id !== journeyId));
  }
};

export const apiGetSharedJourney = async (shareToken: string): Promise<Journey & { userName?: string }> => {
  try {
    return await authFetch(`${API_BASE}/journeys/share/${shareToken}`);
  } catch {
    const currentList = getLocalJourneys();
    const match = currentList.find((j) => j.shareToken === shareToken || j.id === shareToken);
    if (match) {
      return { ...match, userName: DEMO_USER.name };
    }
    // Return sample active journey if token not matched
    return {
      ...currentList[0],
      userName: DEMO_USER.name,
    };
  }
};
