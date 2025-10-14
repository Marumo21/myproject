import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LecturerSearch } from './LecturerSearch';
import { StudentAppointments } from './StudentAppointments';
import { MessagesView, MessagesViewRef } from '../shared/MessagesView';
import { LogOut, Calendar, MessageSquare, Search } from 'lucide-react';

export function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'search' | 'appointments' | 'messages'>('search');
  const messagesRef = useRef<MessagesViewRef>(null);

  const handleMessageLecturer = (lecturer: any) => {
    setCurrentView('messages');
    setTimeout(() => {
      messagesRef.current?.selectUser(lecturer);
    }, 100);
  };

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
              <div className="text-sm font-medium text-gray-600 uppercase">Student Portal</div>
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
              onClick={() => setCurrentView('search')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                currentView === 'search'
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-4 h-4" />
              Find Lecturer
            </button>
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'search' && <LecturerSearch onMessageLecturer={handleMessageLecturer} />}
        {currentView === 'appointments' && <StudentAppointments />}
        {currentView === 'messages' && <MessagesView ref={messagesRef} />}
      </main>
    </div>
  );
}
