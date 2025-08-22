-- HealthLink Platform Database Setup
-- Copy and paste this into your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles with role-based access
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  address text,
  city text,
  state text,
  country text DEFAULT 'India',
  profile_image_url text,
  role text DEFAULT 'patient' CHECK (role IN ('patient', 'donor', 'doctor', 'hospital', 'admin')),
  is_verified boolean DEFAULT false,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Emergency contacts (public data)
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text CHECK (category IN ('hospital', 'ambulance', 'police', 'fire', 'poison_control', 'other')),
  phone_number text NOT NULL,
  address text,
  city text NOT NULL,
  state text NOT NULL,
  is_24x7 boolean DEFAULT true,
  services text[],
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view emergency contacts" ON emergency_contacts FOR SELECT USING (true);

-- Insert some sample emergency contacts
INSERT INTO emergency_contacts (name, category, phone_number, city, state, is_24x7, services) VALUES
('Emergency Services', 'hospital', '112', 'All Cities', 'All States', true, ARRAY['Emergency', 'All Services']),
('Police Emergency', 'police', '100', 'All Cities', 'All States', true, ARRAY['Police', 'Crime Reporting']),
('Fire Emergency', 'fire', '101', 'All Cities', 'All States', true, ARRAY['Fire', 'Rescue']),
('Ambulance Service', 'ambulance', '108', 'All Cities', 'All States', true, ARRAY['Medical Emergency', 'Ambulance']),
('Women Helpline', 'other', '1091', 'All Cities', 'All States', true, ARRAY['Women Safety', 'Distress']),
('Child Helpline', 'other', '1098', 'All Cities', 'All States', true, ARRAY['Child Safety', 'Emergency']),

-- Medical Shops for Emergency Medicine
('Apollo Pharmacy 24x7', 'other', '1860-500-0101', 'Multiple Locations', 'All Cities', 'All States', true, ARRAY['Medicine Delivery', '24x7 Pharmacy', 'Emergency Medicine']),
('MedPlus Pharmacy', 'other', '040-4444-5555', 'Multiple Locations', 'All Cities', 'All States', true, ARRAY['Medicine Delivery', 'Health Products']),
('Netmeds Online Pharmacy', 'other', '1800-123-1010', 'Online Service', 'All Cities', 'All States', true, ARRAY['Online Medicine', 'Home Delivery', 'Emergency Orders']),
('PharmEasy', 'other', '1800-102-0101', 'Online Service', 'All Cities', 'All States', true, ARRAY['Medicine Delivery', 'Lab Tests', '24x7 Support'])
ON CONFLICT DO NOTHING;