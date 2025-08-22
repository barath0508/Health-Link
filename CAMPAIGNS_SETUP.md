# Health Awareness Campaigns Setup

## Database Setup

1. **Create Tables**: Copy and paste the contents of `campaigns-setup.sql` into your Supabase SQL Editor and run it.

2. **Add Sample Data**: Copy and paste the contents of `campaigns-sample-data.sql` into your Supabase SQL Editor and run it.

## Features

### For Hospital Users
- **Create Campaigns**: Only hospital users can create health awareness campaigns
- **Manage Events**: Hospitals can organize webinars, blood drives, yoga sessions, health checkups, and community events
- **Track Registrations**: View who has registered for their campaigns

### For All Users
- **Browse Campaigns**: View all upcoming health awareness campaigns
- **Filter by Type**: Filter campaigns by type (webinars, blood drives, yoga sessions, etc.)
- **Register for Events**: Register for campaigns that interest them
- **Online/Offline Events**: Support for both online webinars and physical events

## Campaign Types

1. **Webinars** - Online health education sessions
2. **Blood Drives** - Community blood donation camps
3. **Yoga Sessions** - Wellness and mental health activities
4. **Health Checkups** - Free health screening camps
5. **Awareness Talks** - Educational sessions on specific health topics
6. **Community Events** - General health and wellness community gatherings

## Navigation

The Campaigns feature is accessible through the main navigation menu with a calendar icon.

## Security

- Only users with the 'hospital' role can create campaigns
- All users can view and register for active campaigns
- Row Level Security (RLS) policies ensure data protection