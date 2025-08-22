-- Health Awareness Campaigns Tables
-- Copy and paste this into your Supabase SQL Editor

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
CREATE POLICY "Only hospitals can create campaigns" ON campaigns FOR INSERT WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'hospital')
);
CREATE POLICY "Campaign creators can update their campaigns" ON campaigns FOR UPDATE USING (
  auth.uid() = created_by AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'hospital')
);

CREATE POLICY "Users can view their registrations" ON campaign_registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can register for campaigns" ON campaign_registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their registrations" ON campaign_registrations FOR UPDATE USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_date ON campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaign_registrations_user ON campaign_registrations(user_id);