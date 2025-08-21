/*
  # HealthLink Platform Database Schema

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `blood_donors` - Blood donor information and availability
    - `blood_requests` - Blood donation requests
    - `hospitals` - Verified hospital profiles
    - `hospital_communities` - Hospital community members
    - `hospital_events` - Events and drives posted by hospitals
    - `assistance_requests` - Medical/financial assistance cases
    - `assistance_donations` - Donations to assistance cases
    - `medicine_reminders` - Personal medicine schedules
    - `medicine_logs` - Medication adherence tracking
    - `health_records` - Personal health history
    - `doctors` - Verified doctor profiles
    - `doctor_reviews` - Patient reviews for doctors
    - `appointments` - Appointment booking system
    - `emergency_contacts` - Emergency services directory

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure sensitive health data
*/

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

-- Blood donors
CREATE TABLE IF NOT EXISTS blood_donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  blood_group text NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  weight numeric CHECK (weight >= 45),
  last_donated_date date,
  is_available boolean DEFAULT true,
  medical_conditions text,
  preferred_contact text DEFAULT 'phone' CHECK (preferred_contact IN ('phone', 'email', 'both')),
  donation_count integer DEFAULT 0,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blood requests
CREATE TABLE IF NOT EXISTS blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  blood_group text NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_needed integer NOT NULL CHECK (units_needed > 0),
  urgency_level text DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  hospital_name text NOT NULL,
  hospital_address text NOT NULL,
  contact_person text NOT NULL,
  contact_phone text NOT NULL,
  required_by date NOT NULL,
  additional_notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_name text NOT NULL,
  license_number text UNIQUE NOT NULL,
  hospital_type text CHECK (hospital_type IN ('government', 'private', 'semi-private', 'specialty')),
  specializations text[],
  bed_capacity integer,
  emergency_services boolean DEFAULT false,
  ambulance_services boolean DEFAULT false,
  blood_bank boolean DEFAULT false,
  website_url text,
  description text,
  facilities text[],
  is_verified boolean DEFAULT false,
  verification_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Hospital communities
CREATE TABLE IF NOT EXISTS hospital_communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member', 'volunteer', 'admin')),
  joined_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(hospital_id, user_id)
);

-- Hospital events
CREATE TABLE IF NOT EXISTS hospital_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES hospitals(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  event_type text CHECK (event_type IN ('blood_drive', 'health_camp', 'awareness', 'vaccination', 'other')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text NOT NULL,
  max_participants integer,
  registration_required boolean DEFAULT false,
  contact_info text,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assistance requests
CREATE TABLE IF NOT EXISTS assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  patient_name text NOT NULL,
  patient_age integer,
  medical_condition text NOT NULL,
  hospital_name text,
  treatment_details text,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  raised_amount numeric DEFAULT 0 CHECK (raised_amount >= 0),
  document_urls text[],
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'verified')),
  is_verified boolean DEFAULT false,
  verification_date timestamptz,
  deadline_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assistance donations
CREATE TABLE IF NOT EXISTS assistance_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES assistance_requests(id) ON DELETE CASCADE,
  donor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  donor_name text,
  is_anonymous boolean DEFAULT false,
  payment_id text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  donated_at timestamptz DEFAULT now()
);

-- Medicine reminders
CREATE TABLE IF NOT EXISTS medicine_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  dosage text NOT NULL,
  frequency_per_day integer NOT NULL CHECK (frequency_per_day > 0),
  reminder_times time[],
  start_date date NOT NULL,
  end_date date,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medicine logs
CREATE TABLE IF NOT EXISTS medicine_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id uuid REFERENCES medicine_reminders(id) ON DELETE CASCADE,
  scheduled_time timestamptz NOT NULL,
  taken_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Health records
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  record_type text CHECK (record_type IN ('symptom', 'diagnosis', 'surgery', 'prescription', 'lab_result', 'vaccination')),
  title text NOT NULL,
  description text,
  record_date date NOT NULL,
  doctor_name text,
  hospital_name text,
  document_urls text[],
  tags text[],
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text UNIQUE NOT NULL,
  specialization text NOT NULL,
  qualification text NOT NULL,
  experience_years integer DEFAULT 0,
  hospital_affiliations text[],
  consultation_fee numeric,
  available_days text[],
  available_hours text,
  languages_spoken text[],
  bio text,
  is_verified boolean DEFAULT false,
  verification_date timestamptz,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doctor reviews
CREATE TABLE IF NOT EXISTS doctor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id, patient_id, appointment_id)
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  duration_minutes integer DEFAULT 30,
  consultation_type text DEFAULT 'in_person' CHECK (consultation_type IN ('in_person', 'video', 'phone')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  reason text,
  notes text,
  fee_paid numeric,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Emergency contacts
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Blood donors policies
CREATE POLICY "Anyone can view available blood donors" ON blood_donors FOR SELECT USING (is_available = true);
CREATE POLICY "Users can manage own donor profile" ON blood_donors FOR ALL USING (user_id = auth.uid());

-- Blood requests policies
CREATE POLICY "Anyone can view active blood requests" ON blood_requests FOR SELECT USING (status = 'active');
CREATE POLICY "Users can manage own blood requests" ON blood_requests FOR ALL USING (requester_id = auth.uid());

-- Hospitals policies
CREATE POLICY "Anyone can view verified hospitals" ON hospitals FOR SELECT USING (is_verified = true);
CREATE POLICY "Hospital users can manage own hospital" ON hospitals FOR ALL USING (user_id = auth.uid());

-- Hospital communities policies
CREATE POLICY "Community members can view their communities" ON hospital_communities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can join/leave communities" ON hospital_communities FOR ALL USING (user_id = auth.uid());

-- Hospital events policies
CREATE POLICY "Anyone can view upcoming events" ON hospital_events FOR SELECT USING (status IN ('upcoming', 'ongoing'));
CREATE POLICY "Hospital admins can manage events" ON hospital_events FOR ALL USING (created_by = auth.uid());

-- Assistance requests policies
CREATE POLICY "Anyone can view verified assistance requests" ON assistance_requests FOR SELECT USING (is_verified = true);
CREATE POLICY "Users can manage own assistance requests" ON assistance_requests FOR ALL USING (requester_id = auth.uid());

-- Assistance donations policies
CREATE POLICY "Donors can view own donations" ON assistance_donations FOR SELECT USING (donor_id = auth.uid());
CREATE POLICY "Users can make donations" ON assistance_donations FOR INSERT WITH CHECK (donor_id = auth.uid());

-- Medicine reminders policies
CREATE POLICY "Users can manage own medicine reminders" ON medicine_reminders FOR ALL USING (user_id = auth.uid());

-- Medicine logs policies
CREATE POLICY "Users can manage own medicine logs" ON medicine_logs 
FOR ALL USING (reminder_id IN (SELECT id FROM medicine_reminders WHERE user_id = auth.uid()));

-- Health records policies
CREATE POLICY "Users can manage own health records" ON health_records FOR ALL USING (user_id = auth.uid());

-- Doctors policies
CREATE POLICY "Anyone can view verified doctors" ON doctors FOR SELECT USING (is_verified = true);
CREATE POLICY "Doctor users can manage own profile" ON doctors FOR ALL USING (user_id = auth.uid());

-- Doctor reviews policies
CREATE POLICY "Anyone can view doctor reviews" ON doctor_reviews FOR SELECT USING (true);
CREATE POLICY "Verified patients can create reviews" ON doctor_reviews FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON appointments 
FOR SELECT USING (patient_id = auth.uid() OR doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own appointments" ON appointments FOR ALL USING (patient_id = auth.uid());

-- Emergency contacts policies
CREATE POLICY "Anyone can view emergency contacts" ON emergency_contacts FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blood_donors_blood_group ON blood_donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_donors_location ON blood_donors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_assistance_requests_status ON assistance_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_category ON emergency_contacts(category);