import React, { useState } from 'react';

interface AuthScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onShowToast }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('admin@smartpay.io');
  const [password, setPassword] = useState('admin123');
  const [orgName, setOrgName] = useState('SafariTech Solutions Kenya Ltd');
  const [fullName, setFullName] = useState('Faith Wanjiku');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLoginView ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = isLoginView 
        ? { email, password }
        : { email, password, organization_name: orgName, full_name: fullName };

      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      onShowToast(isLoginView ? 'Welcome back!' : 'Account created successfully!', 'success');
      onLoginSuccess(data.access_token, data);
    } catch (err: any) {
      onShowToast(err.message, 'error');
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
