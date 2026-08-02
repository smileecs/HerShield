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
  apiVerifyEmail,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [initialResetToken, setInitialResetToken] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);

  // Selected route state when navigating from SafeRoute -> StartJourney
  const [stagedRoute, setStagedRoute] = useState<RouteOption | null>(null);
  const [stagedStartLoc, setStagedStartLoc] = useState<any>(null);
  const [stagedDestLoc, setStagedDestLoc] = useState<any>(null);

  // Share Token check if opened via /share/:token
  const [shareToken, setShareToken] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Boot Data Loading & URL Parameters
  useEffect(() => {
    // Check path for /share/:token
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      const token = path.replace('/share/', '');
      if (token) {
        setShareToken(token);
        setActiveTab('share');
      }
    }

    // Check query params for verification or password reset
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verifyToken') || urlParams.get('token');
    const resetToken = urlParams.get('resetToken');

    if (verifyToken) {
      apiVerifyEmail(verifyToken)
        .then((res) => {
          showToast(res.message || 'Email verified successfully! You can now sign in.', 'success');
          setIsAuthModalOpen(true);
        })
        .catch((err) => {
          showToast(err.message || 'Email verification link invalid or expired.', 'error');
        });
      // Clean up search params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (resetToken) {
      setInitialResetToken(resetToken);
      setIsAuthModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    async function init() {
      try {
        const me = await apiGetMe();
        setUser(me);

        // Fetch contacts and journeys for authenticated user
        const cList = await apiGetContacts();
        setContacts(cList);

        const jList = await apiGetJourneys();
        setJourneys(jList);
        const currentActive = jList.find((j) => j.status === 'active');
        if (currentActive) {
          setActiveJourney(currentActive);
        }
      } catch {
        // Unauthenticated or stored token invalid
      }
    }

    init();
  }, []);

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setUser(null);
    setContacts([]);
    setJourneys([]);
    setActiveJourney(null);
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
      // Ignore
    }
  };

  const refreshJourneys = async () => {
    try {
      const jList = await apiGetJourneys();
      setJourneys(jList);
    } catch {
      // Ignore
    }
  };

  const handleAuthSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    try {
      const cList = await apiGetContacts();
      setContacts(cList);
      const jList = await apiGetJourneys();
      setJourneys(jList);
      const currentActive = jList.find((j) => j.status === 'active');
      if (currentActive) {
        setActiveJourney(currentActive);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#6C4AB6] selection:text-white">
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
          stagedRoute && stagedStartLoc && stagedDestLoc ? (
            <StartJourneyPage
              selectedRoute={stagedRoute}
              startLocation={stagedStartLoc}
              destination={stagedDestLoc}
              trustedContacts={contacts}
              onJourneyStarted={handleJourneyStarted}
              showToast={showToast}
            />
          ) : (
            <div className="py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200">
              <h2 className="text-xl font-extrabold text-slate-900">Please Select a Route First</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Calculate and choose a route from the SafeRoute safety planner before starting a journey.
              </p>
              <button
                onClick={() => setActiveTab('saferoute')}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#6C4AB6] text-white hover:bg-[#43266F]"
              >
                Go to SafeRoute Planner
              </button>
            </div>
          )
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
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#6C4AB6] text-white hover:bg-[#43266F]"
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
        onSuccess={handleAuthSuccess}
        showToast={showToast}
        initialResetToken={initialResetToken}
      />
    </div>
  );
}
