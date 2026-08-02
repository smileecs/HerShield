import { TrustedContact, RouteOption, Journey, User } from '../types';

export const DEMO_USER: User | null = null;
export const DEFAULT_TRUSTED_CONTACTS: TrustedContact[] = [];
export const SAMPLE_ROUTES: RouteOption[] = [];
export const INITIAL_JOURNEYS_HISTORY: Journey[] = [];
export const SAMPLE_LOCATIONS = {
  start: {
    address: '',
    lat: 0,
    lng: 0,
  },
  destination: {
    address: '',
    lat: 0,
    lng: 0,
  },
};
