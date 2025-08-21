# Database Setup Instructions

The authentication errors you're seeing are because the database tables haven't been created yet. Follow these steps to set up your Supabase database:

## Step 1: Set up Database Tables

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `vkmazvcbntqhofvvzeey`
3. Go to the **SQL Editor** tab
4. Copy the contents of `setup-database.sql` file
5. Paste it into the SQL editor and click **Run**

This will create:
- `profiles` table with proper RLS policies
- `emergency_contacts` table with sample data
- Necessary security policies

## Step 2: Test the Application

After running the SQL script:
1. Restart your development server: `npm run dev`
2. Try creating a new account
3. The authentication should now work properly

## Step 3: Add More Tables (Optional)

If you want the full functionality, you can also run the complete migration:
1. Copy the contents of `supabase/migrations/20250821124458_pink_wind.sql`
2. Run it in the SQL Editor

This will add all tables for:
- Blood donation system
- Hospital directory
- Medical assistance
- Medicine reminders
- Health records
- Doctor profiles
- Appointments

## Troubleshooting

If you still get RLS policy errors:
1. Make sure you're using the correct Supabase URL and anon key
2. Check that the tables were created successfully
3. Verify the RLS policies are in place

The app will show helpful error messages if the database isn't set up correctly.