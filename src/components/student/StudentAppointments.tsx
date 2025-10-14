import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, RefreshCw } from 'lucide-react';
import { supabase, Appointment } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function StudentAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        lecturer:profiles!appointments_lecturer_id_fkey(*)
      `)
      .eq('student_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (data) {
      setAppointments(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);

    if (!error) {
      fetchAppointments();
    }
  };

  const handleReschedule = async (appointmentId: string) => {
    if (!newDate || !newTime) return;

    const { error } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (!error) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        await supabase.from('notifications').insert({
          user_id: appointment.lecturer_id,
          type: 'appointment',
          title: 'Appointment Rescheduled',
          content: `A student has rescheduled their appointment to ${newDate} at ${newTime}`,
        });
      }
      setReschedulingId(null);
      setNewDate('');
      setNewTime('');
      fetchAppointments();
    }
  };

  const availableTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Appointments</h2>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">You don't have any appointments yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.lecturer?.full_name}</h3>
                    <p className="text-sm text-gray-600">{appointment.lecturer?.email}</p>
                    {appointment.lecturer?.office_location && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {appointment.lecturer?.office_location}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.appointment_time}</span>
                </div>
              </div>

              {appointment.purpose && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{appointment.purpose}</p>
                </div>
              )}

              {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                <div className="space-y-3">
                  {reschedulingId === appointment.id ? (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">New Date</label>
                          <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-cyan-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">New Time</label>
                          <select
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-cyan-500 text-sm"
                          >
                            <option value="">Select time</option>
                            {availableTimes.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReschedule(appointment.id)}
                          disabled={!newDate || !newTime}
                          className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors text-sm disabled:opacity-50"
                        >
                          Confirm Reschedule
                        </button>
                        <button
                          onClick={() => {
                            setReschedulingId(null);
                            setNewDate('');
                            setNewTime('');
                          }}
                          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReschedulingId(appointment.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium transition-colors text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reschedule
                      </button>
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
