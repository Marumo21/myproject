import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LecturerAppointments } from './LecturerAppointments';
import { MessagesView } from '../shared/MessagesView';
import { LecturerProfile } from './LecturerProfile';
import { LogOut, Calendar, MessageSquare, User } from 'lucide-react';

export function LecturerDashboard() {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'appointments' | 'messages' | 'profile'>('appointments');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">WSU</div>
                <div className="text-xs text-gray-600">Walter Sisulu University</div>
              </div>
              <div className="text-sm font-medium text-gray-600 uppercase">Lecturer Portal</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium text-gray-900">{profile?.full_name}</div>
                <div className="text-sm text-gray-600">{profile?.email}</div>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentView('appointments')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                currentView === 'appointments'
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Appointments
            </button>
            <button
              onClick={() => setCurrentView('messages')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                currentView === 'messages'
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                currentView === 'profile'
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'appointments' && <LecturerAppointments />}
        {currentView === 'messages' && <MessagesView />}
        {currentView === 'profile' && <LecturerProfile />}
      </main>
    </div>
  );
}
