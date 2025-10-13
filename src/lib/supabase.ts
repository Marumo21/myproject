import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserType = 'student' | 'lecturer' | 'hod' | 'secretary';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  user_type: UserType;
  phone_number?: string;
  office_location?: string;
  department?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  id: string;
  lecturer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'declined' | 'rescheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  student_id: string;
  lecturer_id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  purpose?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: Profile;
  lecturer?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'appointment' | 'message' | 'system';
  title: string;
  content: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

export type LecturerStatusType = 'available' | 'busy' | 'in_meeting' | 'offline';

export interface LecturerStatus {
  id: string;
  lecturer_id: string;
  status: LecturerStatusType;
  status_message?: string;
  updated_at: string;
}
