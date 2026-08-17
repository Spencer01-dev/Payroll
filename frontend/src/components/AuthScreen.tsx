import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

interface AuthScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onShowToast }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusNotice(null);

    // Warm-up / cold-start notice timer for Render instances
    const timer = setTimeout(() => {
      setStatusNotice('Connecting to server (Render cold-start may take ~30s on first load)...');
    }, 3500);

    try {
      const endpoint = isLoginView ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = isLoginView 
        ? { email: email.trim(), password }
        : { email: email.trim(), password, organization_name: orgName.trim(), full_name: fullName.trim() };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      clearTimeout(timer);
      setStatusNotice(null);

      let data: any = {};
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(`Server returned invalid response (Status ${response.status}). Please check API URL.`);
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed. Please verify your credentials.');
      }

      onShowToast(isLoginView ? 'Welcome back!' : 'Account created successfully!', 'success');
      onLoginSuccess(data.access_token, data);
    } catch (err: any) {
      clearTimeout(timer);
      setStatusNotice(null);
      const msg = err.message || 'Unable to connect to server. Please check your internet connection or backend status.';
      setErrorMessage(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center font-sans p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 font-bold text-white text-3xl mx-auto mb-4">
            S
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SmartPay <span className="text-teal-400">Global</span></h1>
          <p className="text-xs text-slate-400 mt-1">
            {isLoginView ? 'Welcome back. Please enter your details.' : 'Create your organization account.'}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
            <span className="text-rose-400 text-sm">⚠️</span>
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {statusNotice && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-300 flex items-start gap-2.5 animate-in fade-in">
            <span className="text-amber-400 text-sm animate-spin">⏳</span>
            <div className="flex-1 leading-relaxed">{statusNotice}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-600/30 transition-all text-sm"
          >
            {isLoading ? 'Processing...' : isLoginView ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button 
            type="button" 
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-500">
          Kenya 🇰🇪 2026 Statutory Ruleset Active (PAYE, NSSF, SHIF, AHL)
        </p>
      </div>
    </div>
  );
};
