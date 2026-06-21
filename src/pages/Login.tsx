import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Heart, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (resetMode) {
      const ok = await resetPassword(email);
      if (ok) {
        setResetSent(true);
      } else {
        setError('Email not found');
      }
      setLoading(false);
      return;
    }

    const ok = await login(email, password);
    if (ok) {
      navigate('/admin');
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Prime Health Consult</p>
        </div>

        <div className="card p-6">
          {resetSent ? (
            <div className="text-center py-4">
              <span className="text-4xl block mb-3">📧</span>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Password has been reset to:</p>
              <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm font-mono">reset123</code>
              <button onClick={() => { setResetMode(false); setResetSent(false); }} className="btn-primary w-full mt-4">
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="admin@primehealthconsult.com"
                  />
                </div>
              </div>

              {!resetMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Please wait...' : resetMode ? 'Reset Password' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => { setResetMode(!resetMode); setError(''); }}
                className="w-full text-center text-sm text-primary-600 hover:underline"
              >
                {resetMode ? 'Back to Login' : 'Forgot Password?'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
