-- Health Awareness Campaigns Tables

-- Campaigns table for webinars and community events
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  campaign_type text CHECK (campaign_type IN ('webinar', 'blood_drive', 'yoga_session', 'health_checkup', 'awareness_talk', 'community_event')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  is_online boolean DEFAULT false,
  meeting_link text,
  max_participants integer,
  registration_required boolean DEFAULT true,
  registration_fee numeric DEFAULT 0,
  contact_person text,
  contact_phone text,
  contact_email text,
  image_url text,
  tags text[],
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaign registrations
CREATE TABLE IF NOT EXISTS campaign_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  registration_date timestamptz DEFAULT now(),
  attendance_status text DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'free')),
  notes text,
  UNIQUE(campaign_id, user_id)
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active campaigns" ON campaigns FOR SELECT USING (status IN ('upcoming', 'ongoing'));
CREATE POLICY "Verified users can create campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Campaign creators can update their campaigns" ON campaigns FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view their registrations" ON campaign_registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can register for campaigns" ON campaign_registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their registrations" ON campaign_registrations FOR UPDATE USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_date ON campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaign_registrations_user ON campaign_registrations(user_id);

-- Insert sample campaigns
INSERT INTO campaigns (
  created_by, title, description, campaign_type, start_date, end_date, 
  location, is_online, max_participants, contact_person, contact_phone, tags
) VALUES
(
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'World Blood Donor Day - Community Drive',
  'Join us for a special blood donation camp in celebration of World Blood Donor Day. Help save lives by donating blood and spreading awareness about the importance of voluntary blood donation.',
  'blood_drive',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '8 hours',
  'Community Health Center, Main Street',
  false,
  100,
  'Dr. Sarah Johnson',
  '+91-9876543210',
  ARRAY['blood donation', 'community service', 'health awareness']
),
(
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'International Yoga Day Celebration',
  'Celebrate International Yoga Day with a community yoga session. Learn basic yoga poses, breathing techniques, and meditation practices for better physical and mental health.',
  'yoga_session',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '3 hours',
  'City Park, Central Garden',
  false,
  50,
  'Yoga Instructor Priya Sharma',
  '+91-9876543211',
  ARRAY['yoga', 'mental health', 'wellness', 'community']
),
(
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'Diabetes Awareness Webinar',
  'Online webinar about diabetes prevention, management, and lifestyle changes. Expert doctors will share insights about early detection, diet management, and exercise routines.',
  'webinar',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
  'Online Event',
  true,
  200,
  'Dr. Rajesh Kumar',
  '+91-9876543212',
  ARRAY['diabetes', 'prevention', 'health education', 'webinar']
);