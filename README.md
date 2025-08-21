# HealthLink - Digital Health Platform

A comprehensive healthcare platform connecting patients, donors, doctors, and hospitals in one unified system.

## Features

- **Blood Donation Network** - Connect blood donors with those in need
- **Hospital Directory** - Find verified hospitals and healthcare facilities
- **Medical Assistance** - Community support for medical treatments
- **Medicine Manager** - Track medications and set reminders
- **Health Records** - Digital health history management
- **Doctor Directory** - Find and book appointments with verified doctors
- **Emergency Services** - Quick access to emergency contacts

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase Database
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open SQL Editor
3. Run `setup-database.sql` to create basic tables
4. Run `chennai-real-data.sql` to add sample data

### 3. Configure Environment
Update `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npm run dev
```

## Database Setup Files

- `setup-database.sql` - Essential tables and policies
- `chennai-real-data.sql` - Real Chennai healthcare data
- `supabase/migrations/` - Complete database schema

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication
│   ├── blood/          # Blood donation
│   ├── hospitals/      # Hospital directory
│   ├── assistance/     # Medical assistance
│   ├── medicines/      # Medicine management
│   ├── health/         # Health records
│   ├── doctors/        # Doctor directory
│   └── emergency/      # Emergency services
├── contexts/           # React contexts
├── lib/               # Utilities and Supabase client
└── App.tsx            # Main application

supabase/
└── migrations/        # Database migrations
```

## User Roles

- **Patient** - Access all services, manage health records
- **Donor** - Register as blood donor, view requests
- **Doctor** - Manage profile, appointments, reviews
- **Hospital** - Manage hospital profile, events, community
- **Admin** - Platform administration

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details