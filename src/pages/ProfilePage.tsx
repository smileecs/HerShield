import React, { useState } from 'react';
import { User as UserType, TrustedContact } from '../types';
import { User, Mail, Shield, Lock, Trash2, Check, SlidersHorizontal, LogOut } from 'lucide-react';
import { setStoredUser } from '../services/api';

interface ProfilePageProps {
  user: UserType;
  contacts: TrustedContact[];
  onLogout: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, contacts, onLogout, showToast }) => {
  const [sharingPref, setSharingPref] = useState<'active_journey_only' | 'never_auto'>(
    user.settings?.locationSharingPreference || 'active_journey_only'
  );
  const [saveHistory, setSaveHistory] = useState<boolean>(
    user.settings?.saveJourneyHistory ?? true
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveSettings = () => {
    const updatedUser: UserType = {
      ...user,
      settings: {
        locationSharingPreference: sharingPref,
        saveJourneyHistory: saveHistory,
      },
    };
    setStoredUser(updatedUser);
    showToast('Privacy & location settings updated successfully!', 'success');
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    showToast('Account data deleted successfully.', 'info');
    onLogout();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* HEADER CARD */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
          alt={user.name}
          className="w-20 h-20 rounded-3xl object-cover ring-4 ring-teal-600/20 shadow-md shrink-0"
        />

        <div className="space-y-1 text-center sm:text-left flex-1">
          <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{user.email}</span>
          </p>
          <p className="text-[11px] text-teal-800 font-bold pt-1">
            Verified HerShield Member
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </section>

      {/* PRIVACY SETTINGS */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-teal-800">
          <Lock className="w-4 h-4 text-teal-700" />
          <span>Privacy & Sharing Controls</span>
        </div>

        <div className="space-y-4 text-xs text-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Location Sharing Preference</h3>
            <div className="space-y-2">
              <label
                onClick={() => setSharingPref('active_journey_only')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer font-bold ${
                  sharingPref === 'active_journey_only'
                    ? 'bg-teal-50 border-teal-600 text-teal-950'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span>Only during active journey (Recommended)</span>
                {sharingPref === 'active_journey_only' && <Check className="w-4 h-4 text-teal-700" />}
              </label>

              <label
                onClick={() => setSharingPref('never_auto')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer font-bold ${
                  sharingPref === 'never_auto'
                    ? 'bg-teal-50 border-teal-600 text-teal-950'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span>Never share automatically</span>
                {sharingPref === 'never_auto' && <Check className="w-4 h-4 text-teal-700" />}
              </label>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Journey History Retention</h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold block">Save Journey History</span>
                <span className="text-[11px] text-slate-500">Allow reviewing past trips & safety scores in My Journeys.</span>
              </div>
              <button
                onClick={() => setSaveHistory(!saveHistory)}
                className={`w-12 h-6 rounded-full transition-colors p-1 ${
                  saveHistory ? 'bg-teal-700' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    saveHistory ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full py-3 rounded-xl font-bold text-xs bg-teal-700 text-white hover:bg-teal-800 shadow-md shadow-teal-700/20"
        >
          Save Settings
        </button>
      </section>

      {/* DANGER ZONE */}
      <section className="bg-rose-50/60 p-6 rounded-3xl border border-rose-200/80 space-y-3">
        <h3 className="text-sm font-bold text-rose-900">Danger Zone</h3>
        <p className="text-xs text-rose-700">
          Permanently delete your user profile, saved trusted contacts, and local journey logs.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
        >
          Delete My Account
        </button>
      </section>

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 text-center">
            <h3 className="text-lg font-black text-slate-900">Confirm Account Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure? This action cannot be undone and will erase all trusted contacts and journey logs.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
