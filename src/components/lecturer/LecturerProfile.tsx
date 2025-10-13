import { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Building } from 'lucide-react';
import { supabase, LecturerStatusType } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function LecturerProfile() {
  const { profile, refreshProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<LecturerStatusType>('offline');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setPhoneNumber(profile.phone_number || '');
      setOfficeLocation(profile.office_location || '');
      setDepartment(profile.department || '');
      fetchStatus();
    }
  }, [profile]);

  const fetchStatus = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('lecturer_status')
      .select('*')
      .eq('lecturer_id', profile.id)
      .maybeSingle();

    if (data) {
      setStatus(data.status);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    setSuccess(false);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        phone_number: phoneNumber,
        office_location: officeLocation,
        department,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (!profileError) {
      const { data: existingStatus } = await supabase
        .from('lecturer_status')
        .select('id')
        .eq('lecturer_id', profile.id)
        .maybeSingle();

      if (existingStatus) {
        await supabase
          .from('lecturer_status')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('lecturer_id', profile.id);
      } else {
        await supabase.from('lecturer_status').insert({
          lecturer_id: profile.id,
          status,
        });
      }

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profile?.full_name || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border-none text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border-none text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., +27 12 345 6789"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Office Location
            </label>
            <input
              type="text"
              value={officeLocation}
              onChange={(e) => setOfficeLocation(e.target.value)}
              placeholder="e.g., Building A, Room 204"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Computer Science"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Availability Status</label>
            <div className="grid grid-cols-2 gap-3">
              {(['available', 'busy', 'in_meeting', 'offline'] as LecturerStatusType[]).map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => setStatus(statusOption)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    status === statusOption
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(statusOption)}`} />
                  <span className="font-medium text-gray-700 capitalize">
                    {statusOption.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 font-medium">Profile updated successfully!</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
