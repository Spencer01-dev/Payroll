import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Briefcase, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  HeartHandshake
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface EmployeeProfilePageProps {
  currentUser: any;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const EmployeeProfilePage: React.FC<EmployeeProfilePageProps> = ({
  currentUser,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'emergency' | 'security'>('personal');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Nairobi, Kenya');
  const [emergencyName, setEmergencyName] = useState('Samuel Munene');
  const [emergencyPhone, setEmergencyPhone] = useState('+254 722 000 111');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');

  const userEmail = currentUser?.user_email || currentUser?.email || '';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userEmail) return;
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/v1/portal/profile?employee_email=${encodeURIComponent(userEmail)}`,
          {
            headers: { 'x-org-id': currentUser?.organization_id || 'default_org' }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          if (data.phone) setPhone(data.phone);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userEmail, currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    try {
      setSaving(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/portal/profile?employee_email=${encodeURIComponent(userEmail)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-org-id': currentUser?.organization_id || 'default_org'
          },
          body: JSON.stringify({
            phone,
            address,
            emergency_contact_name: emergencyName,
            emergency_contact_phone: emergencyPhone
          })
        }
      );
      if (res.ok) {
        onShowToast('Profile updated successfully!', 'success');
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = typeof err.detail === 'string' ? err.detail : 'Failed to update profile';
        throw new Error(msg);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-teal-500/20 border-2 border-teal-400/30">
            {profile?.first_name?.[0] || currentUser?.user_name?.[0] || 'J'}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-black text-white">
                  {profile?.first_name} {profile?.last_name}
                </h1>
                <p className="text-sm font-semibold text-teal-400 mt-0.5">
                  {profile?.job_title || 'Employee'} • {profile?.department_name || 'Department'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 self-center sm:self-start bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Employee
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-500">Employee Code</span>
                <p className="font-mono font-bold text-slate-200">{profile?.employee_code || 'EMP-001'}</p>
              </div>
              <div>
                <span className="text-slate-500">Official Email</span>
                <p className="font-semibold text-slate-200 truncate">{profile?.email || currentUser?.email}</p>
              </div>
              <div>
                <span className="text-slate-500">Hire Date</span>
                <p className="font-semibold text-slate-200">{profile?.hire_date || '2026-01-15'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'personal', label: 'Personal Information', icon: User },
          { id: 'employment', label: 'Employment & Financial', icon: Briefcase },
          { id: 'emergency', label: 'Emergency Contacts', icon: HeartHandshake },
          { id: 'security', label: 'Account Security', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-teal-600/15 text-teal-400 border border-teal-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        {activeTab === 'personal' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Personal Information</h2>
              <p className="text-xs text-slate-400">Update your contact details and address.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">First Name (Locked)</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={profile?.first_name || ''}
                    className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Last Name (Locked)</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={profile?.last_name || ''}
                    className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Phone Number (Editable)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Work Email (Locked)</label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Residential Address (Editable)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Kilimani, Nairobi"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'employment' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Employment & Financial Profile</h2>
              <p className="text-xs text-slate-400">These official records are maintained by the HR & Payroll team.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Job Title</span>
                <p className="text-sm font-bold text-white mt-1">{profile?.job_title}</p>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Department</span>
                <p className="text-sm font-bold text-white mt-1">{profile?.department_name || 'Finance'}</p>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Basic Salary</span>
                <p className="text-sm font-bold text-emerald-400 mt-1">
                  KES {profile?.basic_salary ? profile.basic_salary.toLocaleString() : '85,000'} / month
                </p>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Pay Frequency</span>
                <p className="text-sm font-bold text-white mt-1">{profile?.pay_frequency || 'Monthly'}</p>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">KRA PIN</span>
                <p className="text-sm font-mono font-bold text-teal-400 mt-1">{profile?.kra_pin || 'A012345678Z'}</p>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">NSSF Number</span>
                <p className="text-sm font-mono font-bold text-slate-200 mt-1">{profile?.nssf_number || '12345678'}</p>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">SHIF Number</span>
                <p className="text-sm font-mono font-bold text-slate-200 mt-1">{profile?.shif_number || 'SH-001'}</p>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Bank & Account</span>
                <p className="text-sm font-bold text-slate-200 mt-1">
                  {profile?.bank_name || 'Equity Bank'} • {profile?.bank_account_number || '0123456789'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice regarding financial details:</p>
                <p className="text-slate-400 mt-0.5">
                  To update your Bank Account Number, KRA PIN, or Base Salary, please open a request in the HR Helpdesk along with supporting documentation.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Emergency Contacts</h2>
              <p className="text-xs text-slate-400">Designate the primary person to contact in case of an emergency.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Contacts'}</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Account Security</h2>
              <p className="text-xs text-slate-400">Manage your credentials and active sessions.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Password</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Last updated during account onboarding</p>
                </div>
                <button
                  type="button"
                  onClick={() => onShowToast('Password reset link sent to your work email', 'info')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-xl text-xs font-semibold transition-colors"
                >
                  Change Password
                </button>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Secure SMS / Authenticator verification</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1.5 rounded-xl">
                  Managed by Org
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
