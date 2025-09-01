# Islamic Learning Platform - File Tree

```
islamicproj/
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore file
├── FILE_TREE.md                    # This file
├── README.md                       # Project documentation
├── middleware.ts                   # Next.js middleware for auth
├── next.config.js                  # Next.js configuration
├── package.json                    # Dependencies and scripts
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
│
├── app/                            # Next.js App Router
│   ├── globals.css                 # Global styles and Tailwind
│   ├── layout.tsx                  # Root layout component
│   ├── page.tsx                    # Home page
│   │
│   ├── about/                      # About page
│   │   └── page.tsx
│   │
│   ├── auth/                       # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register-student/
│   │   │   └── page.tsx
│   │   ├── apply-teacher/
│   │   │   └── page.tsx
│   │   └── awaiting-approval/
│   │       └── page.tsx
│   │
│   ├── quran/                      # Quran pages
│   │   ├── page.tsx                # Surahs list
│   │   └── [surahId]/
│   │       └── page.tsx            # Individual surah
│   │
│   ├── dashboard/                  # Dashboard pages
│   │   ├── student/
│   │   │   ├── page.tsx            # Student dashboard
│   │   │   ├── assignments/
│   │   │   │   └── page.tsx
│   │   │   ├── certificates/
│   │   │   │   └── page.tsx
│   │   │   ├── meetings/
│   │   │   │   └── page.tsx
│   │   │   ├── materials/
│   │   │   │   └── page.tsx
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx
│   │   │   └── progress/
│   │   │       └── page.tsx
│   │   │
│   │   ├── teacher/
│   │   │   ├── page.tsx            # Teacher dashboard
│   │   │   ├── students/
│   │   │   │   └── page.tsx
│   │   │   ├── assignments/
│   │   │   │   └── page.tsx
│   │   │   ├── materials/
│   │   │   │   └── page.tsx
│   │   │   ├── meetings/
│   │   │   │   └── page.tsx
│   │   │   ├── certificates/
│   │   │   │   └── page.tsx
│   │   │   └── schedule/
│   │   │       └── page.tsx
│   │   │
│   │   └── admin/
│   │       ├── page.tsx            # Admin dashboard
│   │       ├── users/
│   │       │   └── page.tsx
│   │       ├── teachers/
│   │       │   └── page.tsx
│   │       ├── students/
│   │       │   └── page.tsx
│   │       ├── certificates/
│   │       │   └── page.tsx
│   │       ├── complaints/
│   │       │   └── page.tsx
│   │       ├── toasts/
│   │       │   └── page.tsx
│   │       └── reports/
│   │           └── page.tsx
│   │
│   ├── chat/                       # Chat page
│   │   └── page.tsx
│   │
│   ├── components/                 # Shared components
│   │   └── DashboardLayout.tsx     # Dashboard layout wrapper
│   │
│   └── api/                        # API routes
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts
│       │   ├── register/
│       │   │   └── route.ts
│       │   ├── apply-teacher/
│       │   │   └── route.ts
│       │   ├── me/
│       │   │   └── route.ts
│       │   ├── set-cookie/
│       │   │   └── route.ts
│       │   └── clear-cookie/
│       │       └── route.ts
│       │
│       ├── quran/
│       │   ├── daily-ayah/
│       │   │   └── route.ts
│       │   ├── surahs/
│       │   │   ├── route.ts
│       │   │   └── [surahId]/
│       │   │       ├── route.ts
│       │   │       └── ayahs/
│       │   │           └── route.ts
│       │
│       ├── toasts/
│       │   └── active/
│       │       └── route.ts
│       │
│       ├── notifications/
│       │   └── route.ts
│       │
│       ├── student/
│       │   └── stats/
│       │       └── route.ts
│       │
│       ├── teacher/
│       │   └── stats/
│       │       └── route.ts
│       │
│       └── admin/
│           └── stats/
│               └── route.ts
│
├── lib/                            # Utility libraries
│   ├── db.ts                       # Database connection
│   ├── auth-server.ts              # Server-side auth utilities
│   └── auth-client.ts              # Client-side auth utilities
│
└── sql/                            # Database files
    ├── 01_schema.sql               # Database schema
    ├── 02_logic.sql                # Stored procedures and triggers
    └── 03_seed.sql                 # Initial data
```

## Key Files Summary

### Configuration Files
- **package.json**: Dependencies and npm scripts
- **next.config.js**: Next.js configuration
- **tailwind.config.js**: Tailwind CSS with custom branding colors
- **tsconfig.json**: TypeScript configuration
- **.env.example**: Environment variables template

### Core Application Files
- **app/layout.tsx**: Root layout with RTL support and Cairo font
- **app/page.tsx**: Home page with hero section and daily ayah
- **middleware.ts**: Authentication middleware for route protection

### Authentication System
- **lib/auth-server.ts**: Server-side authentication (JWT, cookies, database)
- **lib/auth-client.ts**: Client-side authentication utilities
- **app/auth/**: Login, registration, and approval pages
- **app/api/auth/**: Authentication API endpoints

### Database Layer
- **lib/db.ts**: MySQL connection pool and query utilities
- **sql/01_schema.sql**: 20 tables with relationships and constraints
- **sql/02_logic.sql**: Views, functions, procedures, and triggers
- **sql/03_seed.sql**: Initial data including sample users

### Dashboard System
- **app/components/DashboardLayout.tsx**: Reusable dashboard layout
- **app/dashboard/**: Role-specific dashboard pages
- **app/api/**: Stats and data API endpoints

### Quran Module
- **app/quran/**: Quran browsing pages
- **app/api/quran/**: Quran data API endpoints

### Styling
- **app/globals.css**: Global styles with Tailwind directives and custom CSS
- Custom branding colors and RTL support throughout

## Database Schema Overview

### Core Tables (20 total)
- **users**: User accounts and authentication
- **teachers**: Teacher-specific data
- **students**: Student-specific data and progress
- **stages**: Educational stages/programs
- **groups**: Student groups for targeted assignments
- **assignments**: Educational assignments
- **submissions**: Student assignment submissions
- **materials**: Educational materials
- **meetings**: Scheduled meetings
- **certificates**: Student certificates
- **notifications**: User notifications
- **complaints**: User complaints system
- **quran_surahs**: Quran surah metadata
- **quran_ayahs**: Quran ayah text (Uthmani)

### Database Logic
- **v_user_access**: View for user access control
- **trg_students_default_level**: Trigger for default student stage
- **stage_total_pages**: Function to calculate stage pages
- **record_rating_and_advance**: Procedure for progress tracking
- **notify_scope**: Procedure for notification management
- Multiple triggers for automatic notifications

## Features Implemented

✅ **Complete Features**
- Next.js 14 App Router setup
- TypeScript configuration
- Tailwind CSS with RTL support
- MySQL database integration
- JWT authentication system
- Role-based access control (ADMIN, TEACHER, STUDENT)
- Home page with hero section
- Authentication pages (login, register, apply)
- Quran browsing (surahs and ayahs)
- Dashboard layouts for all roles
- Basic statistics API endpoints
- Notification system
- Responsive design with Arabic UI

🔄 **Partially Implemented**
- Dashboard pages (basic structure with placeholders)
- API endpoints for core functionality
- Database schema and logic

⏳ **Pending Implementation**
- Assignment creation and submission
- Voice recording functionality
- Certificate generation
- Meeting scheduling
- Material upload/management
- Advanced admin tools
- Real-time notifications
- File upload system
