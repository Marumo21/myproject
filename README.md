# WSU Appointment System

A real-time, full-stack web application for Walter Sisulu University's appointment scheduling system. This application connects students with lecturers for appointment booking and management.

## Features

### Student Portal
- Search and browse available lecturers
- View lecturer availability status (Available, Busy, In Meeting, Offline)
- Book appointments with lecturers
- View appointment history and status
- Real-time messaging with lecturers
- Email notifications for appointment updates

### Lecturer Portal
- Manage appointment requests (Confirm/Decline)
- Update availability status
- Real-time notifications for new appointments
- Messaging system with students
- Profile management (office location, phone, department)
- View appointment calendar

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. The Supabase configuration is already set up in `.env`

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Database Schema

The application uses the following database tables:

- **profiles** - User profiles (students and lecturers)
- **appointments** - Appointment bookings and their status
- **availability_slots** - Lecturer availability schedules
- **messages** - Direct messaging between users
- **notifications** - System notifications
- **lecturer_status** - Real-time lecturer availability status

All tables have Row Level Security (RLS) enabled for data protection.

## Usage

### Creating an Account

1. Click "CREATE ACCOUNT" on the login screen
2. Enter your full name, email, and password
3. Select your role (STUDENT or LECTURER)
4. Click "SIGN UP"

### For Students

1. **Find a Lecturer**: Use the search bar to find lecturers by name, email, or department
2. **Book Appointment**: Click on a lecturer, select date and time, and submit request
3. **Track Appointments**: View all your appointments and their status in the Appointments tab
4. **Message Lecturers**: Send direct messages through the Messages tab

### For Lecturers

1. **Manage Profile**: Update your phone number, office location, and department
2. **Set Status**: Change your availability status (Available, Busy, In Meeting, Offline)
3. **Handle Requests**: Confirm or decline appointment requests
4. **Communicate**: Message students directly through the Messages tab

## Key Features

### Real-time Updates
- Instant notification of new appointments
- Live message delivery
- Automatic status synchronization

### Security
- Secure authentication with Supabase Auth
- Row Level Security policies on all database operations
- Protected API endpoints
- Role-based access control

### User Experience
- Responsive design for mobile and desktop
- Clean, modern interface following WSU branding
- Intuitive navigation
- Clear status indicators

## Database Security

All database tables implement Row Level Security (RLS) with the following policies:

- Users can only view and edit their own profile
- Students can only view their own appointments
- Lecturers can only view appointments assigned to them
- Messages are only visible to sender and receiver
- Notifications are only visible to the intended user

## Support

For issues or questions, please contact the WSU IT Department.

## License

Proprietary - Walter Sisulu University
