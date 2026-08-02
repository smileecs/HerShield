import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { SafeRoutePage } from './pages/SafeRoutePage';
import { TrustedCirclePage } from './pages/TrustedCirclePage';
import { StartJourneyPage } from './pages/StartJourneyPage';
import { ActiveJourneyPage } from './pages/ActiveJourneyPage';
import { MyJourneysPage } from './pages/MyJourneysPage';
import { AboutPage } from './pages/AboutPage';
import { ProfilePage } from './pages/ProfilePage';
import { SharedJourneyPage } from './pages/SharedJourneyPage';

import { User, TrustedContact, Journey, RouteOption } from './types';
import {
  getStoredUser,
  setStoredToken,
  setStoredUser,
  apiGetMe,
  apiGetContacts,
  apiGetJourneys,
} from './services/api';
import { DEFAULT_TRUSTED_CONTACTS, SAMPLE_ROUTES, SAMPLE_LOCATIONS } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [contacts, setContacts] = useState<TrustedContact[]>(DEFAULT_TRUSTED_CONTACTS);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);

  // Selected route state when navigating from SafeRoute -> StartJourney
  const [stagedRoute, setStagedRoute] = useState<RouteOption>(SAMPLE_ROUTES[0]);
  const [stagedStartLoc, setStagedStartLoc] = useState(SAMPLE_LOCATIONS.start);
  const [stagedDestLoc, setStagedDestLoc] = useState(SAMPLE_LOCATIONS.destination);

  // Share Token check if opened via /share/:token
  const [shareToken, setShareToken] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Boot Data Loading
  useEffect(() => {
    // Check if share path in URL
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      const token = path.replace('/share/', '');
      if (token) {
        setShareToken(token);
        setActiveTab('share');
      }
    }

    async function init() {
      try {
        const me = await apiGetMe();
        setUser(me);
      } catch {
        // Fall back to stored demo user
      }

      try {
        const cList = await apiGetContacts();
        setContacts(cList);
      } catch {
        setContacts(DEFAULT_TRUSTED_CONTACTS);
      }

      try {
        const jList = await apiGetJourneys();
        setJourneys(jList);
        const currentActive = jList.find((j) => j.status === 'active');
        if (currentActive) {
          setActiveJourney(currentActive);
        }
      } catch {
        // fallback
      }
    }

    init();
  }, []);

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  const handleSelectRouteForJourney = (route: RouteOption, startLoc: any, destLoc: any) => {
    setStagedRoute(route);
    setStagedStartLoc(startLoc);
    setStagedDestLoc(destLoc);
    setActiveTab('start_journey');
  };

  const handleJourneyStarted = (journey: Journey) => {
    setActiveJourney(journey);
    setJourneys((prev) => [journey, ...prev]);
    setActiveTab('active_journey');
  };

  const handleJourneyCompleted = () => {
    if (activeJourney) {
      setJourneys((prev) =>
        prev.map((j) => (j.id === activeJourney.id ? { ...j, status: 'completed', progressPercent: 100 } : j))
      );
    }
    setActiveJourney(null);
    setActiveTab('journeys');
  };

  const handleJourneyEnded = () => {
    if (activeJourney) {
      setJourneys((prev) =>
        prev.map((j) => (j.id === activeJourney.id ? { ...j, status: 'cancelled' } : j))
      );
    }
    setActiveJourney(null);
    setActiveTab('journeys');
  };

  const refreshContacts = async () => {
    try {
      const cList = await apiGetContacts();
      setContacts(cList);
    } catch {
      // fallback
    }
  };

  const refreshJourneys = async () => {
    try {
      const jList = await apiGetJourneys();
      setJourneys(jList);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-violet-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        activeJourneyId={activeJourney?.id}
      />

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <HomePage
            onStartRoute={() => setActiveTab('saferoute')}
            onGoToCircle={() => setActiveTab('circle')}
            onHowItWorks={() => setActiveTab('about')}
          />
        )}

        {activeTab === 'saferoute' && (
          <SafeRoutePage
            onSelectRouteForJourney={handleSelectRouteForJourney}
            showToast={showToast}
          />
        )}

        {activeTab === 'circle' && (
          <TrustedCirclePage
            contacts={contacts}
            onContactsUpdated={refreshContacts}
            showToast={showToast}
          />
        )}

        {activeTab === 'start_journey' && (
          <StartJourneyPage
            selectedRoute={stagedRoute}
            startLocation={stagedStartLoc}
            destination={stagedDestLoc}
            trustedContacts={contacts}
            onJourneyStarted={handleJourneyStarted}
            showToast={showToast}
          />
        )}

        {activeTab === 'active_journey' && (
          activeJourney ? (
            <ActiveJourneyPage
              journey={activeJourney}
              onJourneyCompleted={handleJourneyCompleted}
              onJourneyEnded={handleJourneyEnded}
              showToast={showToast}
            />
          ) : (
            <div className="py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200">
              <h2 className="text-xl font-extrabold text-slate-900">No Active Journey Right Now</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You can plan a new route and select trusted contacts to start location sharing.
              </p>
              <button
                onClick={() => setActiveTab('saferoute')}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-violet-600 text-white"
              >
                Plan a SafeRoute
              </button>
            </div>
          )
        )}

        {activeTab === 'journeys' && (
          <MyJourneysPage
            journeys={journeys}
            activeJourney={activeJourney}
            onViewActiveJourney={() => setActiveTab('active_journey')}
            onJourneysUpdated={refreshJourneys}
            showToast={showToast}
          />
        )}

        {activeTab === 'about' && <AboutPage />}

        {activeTab === 'profile' && user && (
          <ProfilePage
            user={user}
            contacts={contacts}
            onLogout={handleLogout}
            showToast={showToast}
          />
        )}

        {activeTab === 'share' && shareToken && (
          <SharedJourneyPage
            shareToken={shareToken}
            onGoHome={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Mobile Bottom Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeJourneyId={activeJourney?.id}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
        showToast={showToast}
      />
    </div>
  );
}
