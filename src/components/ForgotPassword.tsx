import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Login
          </button>

          <div className="mb-8 text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-gray-900">WSU</div>
              <div className="text-xs text-gray-600 mt-1">Walter Sisulu University</div>
              <div className="text-xs text-gray-500 mt-1">In pursuit of excellence</div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
            <p className="text-sm text-gray-600 mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
              <p className="text-green-700 font-medium text-center">
                Password reset link sent! Check your email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? 'SENDING...' : 'SEND RESET LINK'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
