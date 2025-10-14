import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase, Appointment } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function LecturerAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (user) {
      fetchAppointments();

      const subscription = supabase
        .channel('appointments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `lecturer_id=eq.${user.id}`,
          },
          () => {
            fetchAppointments();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        student:profiles!appointments_student_id_fkey(*)
      `)
      .eq('lecturer_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (data) {
      setAppointments(data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (appointmentId: string, status: 'confirmed' | 'declined') => {
    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId);

    if (!error) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        await supabase.from('notifications').insert({
          user_id: appointment.student_id,
          type: 'appointment',
          title: `Appointment ${status}`,
          content: `Your appointment has been ${status}`,
        });
      }
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
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (!error) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        await supabase.from('notifications').insert({
          user_id: appointment.student_id,
          type: 'appointment',
          title: 'Appointment Rescheduled',
          content: `Your appointment has been rescheduled to ${newDate} at ${newTime}`,
        });
      }
      setReschedulingId(null);
      setNewDate('');
      setNewTime('');
      fetchAppointments();
    }
  };

  const availableTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

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

  const filteredAppointments = appointments.filter(apt =>
    filter === 'all' || apt.status === filter
  );

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Appointment Requests</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'confirmed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No {filter !== 'all' ? filter : ''} appointments found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
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
                    <h3 className="font-semibold text-gray-900">{appointment.student?.full_name}</h3>
                    <p className="text-sm text-gray-600">{appointment.student?.email}</p>
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
                  <p className="text-sm font-medium text-gray-700 mb-1">Purpose:</p>
                  <p className="text-sm text-gray-600">{appointment.purpose}</p>
                </div>
              )}

              {appointment.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(appointment.id, 'declined')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              )}

              {appointment.status === 'confirmed' && (
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">This appointment is confirmed</span>
                      </div>
                      <button
                        onClick={() => setReschedulingId(appointment.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium transition-colors text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reschedule Appointment
                      </button>
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
