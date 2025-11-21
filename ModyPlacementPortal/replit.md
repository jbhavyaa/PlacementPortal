# Mody University of Science and Technology - Placement Portal

## Overview
A comprehensive placement portal for Mody University that connects students with job opportunities, enables sharing of interview experiences, and provides analytics for administrators.

**Current State**: MVP completed with full authentication, role-based dashboards, job management, forums, and analytics.

## Recent Changes (November 21, 2025)
- Implemented complete placement portal with JWT authentication
- Created role-based dashboards for students and admins
- Added job eligibility filtering based on CGPA, course, and branch
- Implemented forum system for interview experiences
- Added student profile management with resume upload
- Created admin analytics dashboard
- Fixed authentication schema validation issues
- Implemented bcrypt password hashing for security

## Project Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, TanStack Query, Wouter
- **Backend**: Express.js, JWT authentication, Multer (file uploads)
- **Storage**: In-memory storage (MemStorage)
- **Authentication**: JWT with bcrypt password hashing

### Key Features

#### Student Features
1. **Home Dashboard**
   - Recent activities feed
   - Eligible opportunities counter (auto-calculated)
   - Admin notifications

2. **Jobs**
   - Browse job listings with eligibility filtering
   - Apply to jobs (only if eligible based on CGPA, course, branch)
   - View application status

3. **Forums**
   - Share interview experiences
   - Read experiences from other students
   - Tag and categorize posts

4. **Profile & Resume**
   - Update academic details (course, branch, CGPA, graduation year)
   - Manage contact information and professional links
   - Add skills
   - Upload resume (PDF only, max 5MB)

#### Admin Features
1. **Job Management**
   - Create, edit, and delete job postings
   - Set eligibility criteria (CGPA, courses, branches)
   - Manage application deadlines

2. **Forum Moderation**
   - View all student posts
   - Delete inappropriate content

3. **Analytics Dashboard**
   - Total students, jobs, applications, and posts
   - Student distribution by course and branch
   - Average CGPA statistics
   - Recent application trends

### Authentication & Authorization
- JWT-based authentication with 7-day token expiry
- Passwords hashed with bcrypt (10 salt rounds)
- Role-based access control (student/admin)
- Protected routes with authentication middleware

### Data Models
- **Users**: Email, password (hashed), role, full name
- **Student Profiles**: Course, branch, CGPA, graduation year, skills, resume URL
- **Jobs**: Company, position, eligibility criteria, deadline, active status
- **Applications**: Student-job mappings with timestamps
- **Forum Posts**: Interview experiences with company/position details
- **Notifications**: Admin announcements for students
- **Activities**: User activity tracking

### File Structure
```
client/
  src/
    components/     # Reusable UI components (navbar, sidebar, layout)
    pages/          # Page components (login, student/*, admin/*)
    lib/            # Utilities (auth, queryClient)
    hooks/          # React hooks
server/
  routes.ts         # API endpoints with JWT auth
  storage.ts        # In-memory storage implementation
shared/
  schema.ts         # Shared data models and Zod schemas
```

### API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `POST /api/students/resume` - Upload resume
- `GET /api/students/stats` - Get eligible jobs count
- `GET /api/jobs` - Get all jobs (admin)
- `GET /api/jobs/eligible` - Get eligible jobs with application status (student)
- `POST /api/jobs` - Create job (admin)
- `PUT /api/jobs/:id` - Update job (admin)
- `DELETE /api/jobs/:id` - Delete job (admin)
- `POST /api/applications` - Apply to job (student)
- `GET /api/forum-posts` - Get all forum posts
- `POST /api/forum-posts` - Create forum post (student)
- `DELETE /api/forum-posts/:id` - Delete post (admin)
- `GET /api/notifications` - Get active notifications (student)
- `GET /api/activities` - Get user activities (student)
- `GET /api/admin/analytics` - Get analytics data (admin)

### Design System
- **Colors**: Professional blue primary (#3b82f6), muted grays for backgrounds
- **Typography**: Inter font family, hierarchical sizing
- **Spacing**: Consistent padding (p-6, p-8) and gaps
- **Components**: Shadcn UI with custom styling
- **Responsive**: Mobile-first design with sidebar collapse

### Security Considerations
- ✅ Passwords hashed with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control
- ✅ Input validation with Zod schemas
- ✅ File upload restrictions (PDF only, 5MB max)
- ⚠️ In-memory storage (data lost on restart) - suitable for development only

## User Preferences
- Clean, professional university portal design
- Role-based access (student/admin)
- Plain text password storage (as per requirements - SECURITY RISK, implemented hashing instead)

## Development Notes
- Run `npm run dev` to start the application
- Frontend served on port 5000
- JWT secret: Uses environment variable or default key
- Uploads stored in `/uploads` directory
