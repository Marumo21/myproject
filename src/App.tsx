import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LecturerDashboard } from './components/lecturer/LecturerDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">WSU</div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return showSignUp ? (
      <SignUpScreen onSwitchToLogin={() => setShowSignUp(false)} />
    ) : (
      <LoginScreen onSwitchToSignUp={() => setShowSignUp(true)} />
    );
  }

  if (profile.user_type === 'student') {
    return <StudentDashboard />;
  }

  if (profile.user_type === 'lecturer') {
    return <LecturerDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Invalid user type</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
