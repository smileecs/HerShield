import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, ShieldCheck, Trash2, CheckCircle2, Clock, Lock, X, HeartHandshake, Mail } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [sharingPref, setSharingPref] = useState<'Live Location' | 'Status Only'>('Live Location');
  const [saving, setSaving] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      showToast('Please provide both a name and an email address', 'warning');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      showToast('Please enter a valid email address (e.g., person@domain.com)', 'warning');
      return;
    }

    setSaving(true);
    try {
      await apiAddContact({
        name: cleanName,
        contact: cleanEmail,
        relationship,
        sharingPreference: sharingPref,
      });
      showToast(`Added ${cleanName} (${cleanEmail}) to your Trusted Circle!`, 'success');
      setName('');
      setEmail('');
      setModalOpen(false);
      onContactsUpdated();
    } catch (err) {
      showToast('Failed to add trusted contact', 'error');
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F6FC] text-[#6C4AB6] border border-[#6C4AB6]/20 text-xs font-extrabold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-[#6C4AB6]" />
            <span>Trusted Circle Email Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#24202B]">My Trusted Circle</h1>
          <p className="text-xs sm:text-sm text-[#756D82] leading-relaxed">
            Add trusted contacts with their email addresses. Whenever you start a journey, HerShield automatically emails them with your trip route, estimated arrival time, and a live tracking link.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary-glow flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Trusted Contact</span>
        </button>
      </section>

      {/* PRIVACY NOTICE BANNER */}
      <div className="p-4 rounded-2xl bg-[#F8F6FC] border border-[#6C4AB6]/20 text-[#24202B] text-xs flex items-center gap-3">
        <Lock className="w-5 h-5 text-[#6C4AB6] shrink-0" />
        <div className="space-y-0.5">
          <span className="font-bold text-[#6C4AB6] block">Direct & Secure Email Dispatch</span>
          <p className="text-[#756D82]">
            Your contacts receive journey notification emails only when you start a trip. They do not need to install any app or register to track your journey.
          </p>
        </div>
      </div>

      {/* CONTACTS LIST */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#24202B] flex items-center gap-2">
          <span>Trusted Contacts ({contacts.length})</span>
        </h2>

        {contacts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-3">
            <div className="w-12 h-12 bg-[#F8F6FC] text-[#6C4AB6] rounded-2xl flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#24202B]">No Trusted Contacts Added Yet</h3>
            <p className="text-xs text-[#756D82] max-w-sm mx-auto">
              Add email addresses of family members or friends so they automatically receive your journey alerts and safe arrival updates.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary-glow px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Add First Contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {contacts.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#F8F6FC] text-[#6C4AB6] border border-[#6C4AB6]/20 font-extrabold flex items-center justify-center text-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#24202B] text-sm">{c.name}</h3>
                          <span className="text-[11px] font-semibold text-[#756D82]">{c.relationship}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          c.verificationStatus === 'Verified'
                            ? 'bg-[#EBF7F1] text-[#2E9B67]'
                            : 'bg-[#FEF8EC] text-[#D99A24]'
                        }`}
                      >
                        {c.verificationStatus === 'Verified' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#2E9B67]" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-[#D99A24]" />
                            <span>Ready</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F8F6FC] border border-slate-100 space-y-1.5 text-xs text-[#756D82]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 shrink-0">
                          <Mail className="w-3.5 h-3.5 text-[#6C4AB6]" />
                          <span>Email:</span>
                        </span>
                        <span className="font-bold text-[#24202B] truncate" title={c.contact}>
                          {c.contact}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sharing Mode:</span>
                        <span className="font-bold text-[#6C4AB6]">{c.sharingPreference}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-[#2E9B67] font-semibold text-[11px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2E9B67] animate-pulse" />
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2E9B67]" />
                      <span>Email Alerts Active</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#D9535B] hover:bg-[#FDF2F2] transition-colors cursor-pointer"
                        title="Remove contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ADD CONTACT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24202B]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#6C4AB6]" />
                  <h3 className="text-lg font-black text-[#24202B]">Add Trusted Contact</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#24202B] mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mom, Priya, Sneha, Rohan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F6FC] border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#6C4AB6] outline-none text-[#24202B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24202B] mb-1">
                    Contact's Email Address <span className="text-[#6C4AB6] font-normal">(for trip alerts)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="contact@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F6FC] border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#6C4AB6] outline-none text-[#24202B]"
                    required
                  />
                  <span className="text-[11px] text-[#756D82] mt-1 block">
                    We will email journey details and the real-time tracking link to this address.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24202B] mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F6FC] border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#6C4AB6] outline-none text-[#24202B]"
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
                  <label className="block text-xs font-bold text-[#24202B] mb-1">Sharing Preference</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSharingPref('Live Location')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        sharingPref === 'Live Location'
                          ? 'bg-[#F8F6FC] border-[#6C4AB6] text-[#6C4AB6]'
                          : 'bg-slate-50 border-slate-200 text-[#756D82]'
                      }`}
                    >
                      Live GPS Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setSharingPref('Status Only')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        sharingPref === 'Status Only'
                          ? 'bg-[#F8F6FC] border-[#6C4AB6] text-[#6C4AB6]'
                          : 'bg-slate-50 border-slate-200 text-[#756D82]'
                      }`}
                    >
                      Status Updates Only
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary-glow w-full py-3 rounded-xl font-bold text-sm cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Trusted Contact'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

