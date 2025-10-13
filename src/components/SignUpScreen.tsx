import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SignUpScreenProps {
  onSwitchToLogin: () => void;
}

export function SignUpScreen({ onSwitchToLogin }: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'student' | 'lecturer'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signUp(email, password, fullName, userType);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
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
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Create Account</h2>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="FULL NAME"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-cyan-500 transition-all"
                required
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="EMAIL"
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
                minLength={6}
              />
            </div>

            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center p-3 rounded-xl bg-gray-100 cursor-pointer border-2 transition-all hover:border-cyan-400">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === 'student'}
                  onChange={(e) => setUserType(e.target.value as 'student')}
                  className="mr-2"
                />
                <span className="font-medium text-gray-700">STUDENT</span>
              </label>
              <label className="flex-1 flex items-center justify-center p-3 rounded-xl bg-gray-100 cursor-pointer border-2 transition-all hover:border-cyan-400">
                <input
                  type="radio"
                  name="userType"
                  value="lecturer"
                  checked={userType === 'lecturer'}
                  onChange={(e) => setUserType(e.target.value as 'lecturer')}
                  className="mr-2"
                />
                <span className="font-medium text-gray-700">LECTURER</span>
              </label>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {success && (
              <div className="text-green-500 text-sm text-center">Account created successfully! Redirecting...</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-cyan-400 hover:bg-cyan-500 text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
            </button>

            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full text-gray-600 text-sm hover:text-gray-800"
            >
              Already have an account? LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
