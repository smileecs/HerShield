import React, { useState } from 'react';
import { Users, UserPlus, ShieldCheck, Edit2, Trash2, CheckCircle2, Clock, Lock, X, HeartHandshake } from 'lucide-react';
import { TrustedContact } from '../types';
import { apiAddContact, apiDeleteContact } from '../services/api';

interface TrustedCirclePageProps {
  contacts: TrustedContact[];
  onContactsUpdated: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const TrustedCirclePage: React.FC<TrustedCirclePageProps> = ({
  contacts,
  onContactsUpdated,
  showToast,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [sharingPref, setSharingPref] = useState<'Live Location' | 'Status Only'>('Live Location');
  const [saving, setSaving] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactInfo.trim()) {
      showToast('Please provide both name and contact information', 'warning');
      return;
    }

    setSaving(true);
    try {
      await apiAddContact({
        name: name.trim(),
        contact: contactInfo.trim(),
        relationship,
        sharingPreference: sharingPref,
      });
      showToast(`Added ${name} to your Trusted Circle`, 'success');
      setName('');
      setContactInfo('');
      setModalOpen(false);
      onContactsUpdated();
    } catch (err) {
      showToast('Failed to add contact', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, contactName: string) => {
    if (confirm(`Remove ${contactName} from your trusted circle?`)) {
      await apiDeleteContact(id);
      showToast(`Removed ${contactName}`, 'info');
      onContactsUpdated();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-rose-600" />
            <span>Trusted Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">My Trusted Circle</h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Choose people you trust to receive your journey status when you start a trip. They will be notified automatically when you begin and complete your journey.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-600/20 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Trusted Contact</span>
        </button>
      </section>

      {/* PRIVACY NOTICE BANNER */}
      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 text-xs flex items-center gap-3">
        <Lock className="w-5 h-5 text-teal-700 shrink-0" />
        <div className="space-y-0.5">
          <span className="font-bold block">Strict Privacy Protection</span>
          <p className="text-slate-600">
            Your location is shared only when you start an active journey and according to your selected sharing settings. Location history is never retained publicly.
          </p>
        </div>
      </div>

      {/* CONTACTS LIST */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Trusted Contacts ({contacts.length})</span>
        </h2>

        {contacts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-3">
            <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800">No Trusted Contacts Added Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add family members or close friends so they can receive updates when you travel.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 text-white"
            >
              Add First Contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 font-extrabold flex items-center justify-center text-sm">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                        <span className="text-[11px] font-semibold text-slate-500">{c.relationship}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        c.verificationStatus === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.verificationStatus === 'Verified' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Contact:</span>
                      <span className="font-bold text-slate-800">{c.contact}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Sharing Mode:</span>
                      <span className="font-bold text-teal-800">{c.sharingPreference}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sharing Enabled</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ADD CONTACT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Add Trusted Contact</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mom, Priya, Sneha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number or Email</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210 or email@domain.com"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="Mom">Mom</option>
                  <option value="Sister">Sister</option>
                  <option value="Friend">Friend</option>
                  <option value="Partner">Partner</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Sharing Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSharingPref('Live Location')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      sharingPref === 'Live Location'
                        ? 'bg-pink-50 border-pink-500 text-pink-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Live Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setSharingPref('Status Only')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      sharingPref === 'Status Only'
                        ? 'bg-pink-50 border-pink-500 text-pink-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Status Only
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-pink-600 text-white hover:bg-pink-700 shadow-md shadow-pink-600/20"
                >
                  {saving ? 'Adding...' : 'Save Trusted Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
