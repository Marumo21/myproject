import { useState, useEffect } from 'react';
import { Search, User, MapPin, Phone, Mail } from 'lucide-react';
import { supabase, Profile, LecturerStatus } from '../../lib/supabase';
import { AppointmentBooking } from './AppointmentBooking';

export function LecturerSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [lecturers, setLecturers] = useState<Profile[]>([]);
  const [lecturerStatuses, setLecturerStatuses] = useState<Record<string, LecturerStatus>>({});
  const [selectedLecturer, setSelectedLecturer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    setLoading(true);
    const { data: lecturerData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'lecturer')
      .order('full_name');

    if (lecturerData) {
      setLecturers(lecturerData);

      const { data: statusData } = await supabase
        .from('lecturer_status')
        .select('*');

      if (statusData) {
        const statusMap = statusData.reduce((acc, status) => {
          acc[status.lecturer_id] = status;
          return acc;
        }, {} as Record<string, LecturerStatus>);
        setLecturerStatuses(statusMap);
      }
    }
    setLoading(false);
  };

  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'in_meeting':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'in_meeting':
        return 'In Meeting';
      default:
        return 'Offline';
    }
  };

  if (selectedLecturer) {
    return (
      <AppointmentBooking
        lecturer={selectedLecturer}
        onBack={() => setSelectedLecturer(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Find a Lecturer</h2>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading lecturers...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLecturers.map((lecturer) => {
            const status = lecturerStatuses[lecturer.id];
            return (
              <div
                key={lecturer.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                        status?.status
                      )}`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{lecturer.full_name}</h3>
                        {lecturer.department && (
                          <p className="text-sm text-gray-600">{lecturer.department}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(status?.status)}`}>
                        {getStatusText(status?.status)}
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      {lecturer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{lecturer.email}</span>
                        </div>
                      )}
                      {lecturer.phone_number && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{lecturer.phone_number}</span>
                        </div>
                      )}
                      {lecturer.office_location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{lecturer.office_location}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedLecturer(lecturer)}
                      className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLecturers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-600">No lecturers found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
