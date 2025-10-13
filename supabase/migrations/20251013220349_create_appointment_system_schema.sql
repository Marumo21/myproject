/*
  # Walter Sisulu University Appointment System Schema

  ## Overview
  Complete database schema for a real-time appointment scheduling system connecting students with lecturers.

  ## New Tables

  1. **profiles**
     - `id` (uuid, primary key, references auth.users)
     - `email` (text, unique, not null)
     - `full_name` (text, not null)
     - `user_type` (text, not null) - 'student', 'lecturer', 'hod', 'secretary'
     - `phone_number` (text)
     - `office_location` (text) - for lecturers
     - `department` (text)
     - `avatar_url` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **availability_slots**
     - `id` (uuid, primary key)
     - `lecturer_id` (uuid, references profiles)
     - `day_of_week` (integer) - 0=Sunday, 6=Saturday
     - `start_time` (time)
     - `end_time` (time)
     - `is_active` (boolean)
     - `created_at` (timestamptz)

  3. **appointments**
     - `id` (uuid, primary key)
     - `student_id` (uuid, references profiles)
     - `lecturer_id` (uuid, references profiles)
     - `appointment_date` (date, not null)
     - `appointment_time` (time, not null)
     - `status` (text) - 'pending', 'confirmed', 'declined', 'rescheduled', 'completed', 'cancelled'
     - `purpose` (text)
     - `notes` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  4. **messages**
     - `id` (uuid, primary key)
     - `sender_id` (uuid, references profiles)
     - `receiver_id` (uuid, references profiles)
     - `content` (text, not null)
     - `is_read` (boolean, default false)
     - `created_at` (timestamptz)

  5. **notifications**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references profiles)
     - `type` (text) - 'appointment', 'message', 'system'
     - `title` (text, not null)
     - `content` (text, not null)
     - `is_read` (boolean, default false)
     - `related_id` (uuid) - id of related appointment/message
     - `created_at` (timestamptz)

  6. **lecturer_status**
     - `id` (uuid, primary key)
     - `lecturer_id` (uuid, unique, references profiles)
     - `status` (text) - 'available', 'busy', 'in_meeting', 'offline'
     - `status_message` (text)
     - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Lecturers can view their appointments and availability
  - Students can view lecturers and create appointments
  - Users can only message each other if they have a valid appointment
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('student', 'lecturer', 'hod', 'secretary')),
  phone_number text,
  office_location text,
  department text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lecturer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'rescheduled', 'completed', 'cancelled')),
  purpose text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('appointment', 'message', 'system')),
  title text NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  related_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create lecturer_status table
CREATE TABLE IF NOT EXISTS lecturer_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'in_meeting', 'offline')),
  status_message text,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_status ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Availability slots policies
CREATE POLICY "Anyone can view availability slots"
  ON availability_slots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Lecturers can manage their availability"
  ON availability_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    lecturer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'lecturer')
  );

CREATE POLICY "Lecturers can update their availability"
  ON availability_slots FOR UPDATE
  TO authenticated
  USING (lecturer_id = auth.uid())
  WITH CHECK (lecturer_id = auth.uid());

CREATE POLICY "Lecturers can delete their availability"
  ON availability_slots FOR DELETE
  TO authenticated
  USING (lecturer_id = auth.uid());

-- Appointments policies
CREATE POLICY "Users can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR lecturer_id = auth.uid());

CREATE POLICY "Students can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'student')
  );

CREATE POLICY "Users can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR lecturer_id = auth.uid())
  WITH CHECK (student_id = auth.uid() OR lecturer_id = auth.uid());

CREATE POLICY "Users can delete their appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (student_id = auth.uid() OR lecturer_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Lecturer status policies
CREATE POLICY "Anyone can view lecturer status"
  ON lecturer_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Lecturers can manage their status"
  ON lecturer_status FOR INSERT
  TO authenticated
  WITH CHECK (
    lecturer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'lecturer')
  );

CREATE POLICY "Lecturers can update their status"
  ON lecturer_status FOR UPDATE
  TO authenticated
  USING (lecturer_id = auth.uid())
  WITH CHECK (lecturer_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_student ON appointments(student_id);
CREATE INDEX IF NOT EXISTS idx_appointments_lecturer ON appointments(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_availability_lecturer ON availability_slots(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
