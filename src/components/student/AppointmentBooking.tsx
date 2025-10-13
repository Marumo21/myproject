import { useState } from 'react';
import { ChevronLeft, Calendar, Clock, CheckCircle, MapPin } from 'lucide-react';
import { supabase, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AppointmentBookingProps {
  lecturer: Profile;
  onBack: () => void;
}

export function AppointmentBooking({ lecturer, onBack }: AppointmentBookingProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !user) return;

    setLoading(true);

    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        student_id: user.id,
        lecturer_id: lecturer.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        purpose,
        status: 'pending',
      });

    if (!appointmentError) {
      await supabase.from('notifications').insert({
        user_id: lecturer.id,
        type: 'appointment',
        title: 'New Appointment Request',
        content: `You have a new appointment request for ${selectedDate} at ${selectedTime}`,
      });

      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
          <p className="text-gray-600 mb-2">Successfully Requested</p>
          <p className="text-sm text-gray-500">You will receive booking confirmation via email</p>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">{lecturer.full_name}</div>
                <div className="text-sm text-gray-600">{lecturer.email}</div>
                {lecturer.office_location && (
                  <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {lecturer.office_location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Search
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{lecturer.full_name}</h2>
            <p className="text-sm text-gray-600">{lecturer.email}</p>
            {lecturer.phone_number && <p className="text-sm text-gray-600">{lecturer.phone_number}</p>}
            {lecturer.office_location && (
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {lecturer.office_location}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Select Date and Time
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Available Time Slots
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedTime === time
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purpose (Optional)</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Brief description of appointment purpose..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleBooking}
        disabled={!selectedDate || !selectedTime || loading}
        className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Requesting...' : 'Request Now'}
      </button>
    </div>
  );
}
