# WSU Appointment System - Setup Guide

## Quick Start for Testing

### Test Accounts

To test the application, you'll need to create accounts for both students and lecturers.

#### Creating a Lecturer Account

1. Go to the application
2. Click "CREATE ACCOUNT"
3. Fill in:
   - Full Name: Dr. Sarah Johnson
   - Email: sarah.johnson@wsu.ac.za
   - Password: password123
   - Role: LECTURER
4. Click "SIGN UP"

#### Creating a Student Account

1. Click "CREATE ACCOUNT" (or log out if already logged in)
2. Fill in:
   - Full Name: John Doe
   - Email: john.doe@wsu.ac.za
   - Password: password123
   - Role: STUDENT
3. Click "SIGN UP"

### Testing Workflow

#### As a Lecturer

1. Log in with lecturer credentials
2. Go to "Profile" tab
3. Update your information:
   - Phone: +27 12 345 6789
   - Office: Building A, Room 204
   - Department: Computer Science
   - Status: Available
4. Click "Save Changes"

#### As a Student

1. Log in with student credentials
2. Go to "Find Lecturer" tab
3. Search for the lecturer you created
4. Click "Book Appointment"
5. Select a date and time
6. Add a purpose (optional)
7. Click "Request Now"

#### Back to Lecturer

1. Log in as lecturer
2. Go to "Appointments" tab
3. You should see the pending appointment request
4. Click "Confirm" or "Decline"

#### Student Receives Notification

1. Log in as student
2. Go to "Appointments" tab
3. View the updated appointment status

### Testing Messaging

1. As a student, go to "Messages" tab
2. The lecturer should appear in your conversations
3. Type a message and send
4. Log in as lecturer
5. Go to "Messages" tab
6. View and reply to the message

## Database Structure

The system uses Supabase with the following architecture:

### Authentication
- Uses Supabase Auth for user management
- Email/password authentication
- JWT tokens for session management

### Real-time Features
- PostgreSQL Change Data Capture (CDC) for real-time updates
- WebSocket connections for instant notifications
- Live message delivery

### Data Flow

1. **User Registration**
   - Creates auth user in Supabase Auth
   - Creates profile in profiles table
   - If lecturer, creates status entry

2. **Appointment Booking**
   - Student creates appointment request
   - Status set to "pending"
   - Notification sent to lecturer
   - Real-time update triggers

3. **Appointment Confirmation**
   - Lecturer confirms/declines
   - Status updated in database
   - Notification sent to student
   - Real-time update propagates

4. **Messaging**
   - Messages stored in messages table
   - Real-time subscription notifies receiver
   - Read status tracked

## Deployment

The application is ready for production deployment. Recommended platforms:

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Traditional Server
```bash
npm run build
# Serve the dist/ folder with any static file server
```

## Environment Variables

The application uses the following environment variables (already configured):

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Common Issues

### Issue: Can't see real-time updates
**Solution**: Make sure you're using the latest version of a modern browser (Chrome, Firefox, Safari, Edge)

### Issue: Login fails
**Solution**: Check that you're using a valid email format and password is at least 6 characters

### Issue: Appointments not showing
**Solution**: Make sure you've created appointments with the logged-in user account

## API Endpoints (Supabase)

The application uses Supabase's auto-generated REST API:

- `GET /profiles` - Fetch user profiles
- `POST /appointments` - Create appointment
- `PUT /appointments/:id` - Update appointment
- `GET /messages` - Fetch messages
- `POST /messages` - Send message
- `GET /notifications` - Fetch notifications

## Security Features

1. **Row Level Security (RLS)**
   - Enforced at database level
   - Users can only access their own data
   - Role-based access control

2. **Authentication**
   - Secure password hashing
   - JWT token validation
   - Session management

3. **Data Protection**
   - HTTPS enforced
   - XSS protection
   - CSRF protection

## Performance Optimizations

1. **Database Indexes**
   - Indexed on frequently queried columns
   - Optimized JOIN operations

2. **Caching**
   - React Query for client-side caching
   - Supabase connection pooling

3. **Code Splitting**
   - Lazy loading of components
   - Optimized bundle size

## Maintenance

### Regular Tasks

1. Monitor database growth
2. Review appointment history
3. Clean up old notifications
4. Update user profiles
5. Monitor system performance

### Database Maintenance

```sql
-- Clean up old notifications (older than 30 days)
DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '30 days';

-- Clean up completed appointments (older than 90 days)
DELETE FROM appointments
WHERE status = 'completed'
AND updated_at < NOW() - INTERVAL '90 days';
```

## Support

For technical support or feature requests, contact the development team.

## Future Enhancements

Potential features for future versions:

1. Calendar integration (Google Calendar, Outlook)
2. SMS notifications
3. Appointment reminders
4. Recurring appointments
5. Video call integration
6. Mobile applications (iOS/Android)
7. Analytics dashboard
8. Export functionality
9. Multi-language support
10. Advanced search and filters
