export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt: string;
  settings?: {
    locationSharingPreference: 'active_journey_only' | 'never_auto';
    saveJourneyHistory: boolean;
  };
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  contact: string; // phone or email
  relationship: 'Mom' | 'Sister' | 'Friend' | 'Partner' | 'Colleague' | 'Other' | string;
  verificationStatus: 'Verified' | 'Pending';
  sharingPreference: 'Live Location' | 'Status Only';
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface SafetyMarker {
  id: string;
  type: 'police' | 'hospital' | 'lighting' | 'transit' | 'store' | 'incident';
  title: string;
  description: string;
  lat: number;
  lng: number;
}

export interface RouteOption {
  id: string;
  name: string;
  tag?: 'Recommended' | 'Fastest' | 'Well Lit' | 'Main Roads';
  distanceKm: number;
  durationMin: number;
  safetyScore: number; // e.g. 86
  safetyStatus: 'Higher available safety information' | 'Moderate available safety information' | 'Limited available safety information';
  safetyBadgeColor: 'green' | 'amber' | 'red';
  publicFacilitiesCount: number;
  mainRoadPercentage: number;
  lightingRating: 'Excellent' | 'Moderate' | 'Poor';
  reportedIncidentsNearby: 'Low' | 'Moderate' | 'High';
  path: Coordinate[];
  safetyMarkers: SafetyMarker[];
}

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
}

export interface Journey {
  id: string;
  userId: string;
  shareToken: string;
  startLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  selectedRoute: RouteOption;
  trustedContacts: TrustedContact[];
  startTime: string; // ISO string
  expectedArrival: string; // ISO string
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled' | 'delayed';
  sharingPreference: 'Live Location' | 'Status Only';
  currentLocation?: Coordinate;
  progressPercent: number;
  locationHistory: LocationPoint[];
  lastUpdateNote?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
