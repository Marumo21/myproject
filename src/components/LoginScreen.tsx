import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  onSwitchToSignUp: () => void;
}

export function LoginScreen({ onSwitchToSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-gray-900">WSU</div>
              <div className="text-xs text-gray-600 mt-1">Walter Sisulu University</div>
              <div className="text-xs text-gray-500 mt-1">In pursuit of excellence</div>
              <div className="text-xs text-gray-400 mt-2">DEPARTMENT OF MATHEMATICAL SCIENCES AND COMPUTING</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="USERNAME"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-cyan-500 transition-all"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-cyan-500 transition-all"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-cyan-400 hover:bg-cyan-500 text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>

            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="w-full py-3 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium transition-colors"
            >
              CREATE ACCOUNT
            </button>

            <button
              type="button"
              className="w-full text-gray-600 text-sm hover:text-gray-800"
            >
              FORGOT PASSWORD
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
