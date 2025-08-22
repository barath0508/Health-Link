-- Sample Campaigns Data
-- Run this after creating the campaigns tables
-- Note: Replace the created_by UUIDs with actual hospital user IDs from your profiles table

-- Insert sample campaigns (created by hospital users)
INSERT INTO campaigns (
  created_by, title, description, campaign_type, start_date, end_date, 
  location, is_online, max_participants, contact_person, contact_phone, tags, is_featured
) VALUES
(
  (SELECT id FROM profiles WHERE role = 'hospital' LIMIT 1),
  'World Blood Donor Day - Community Drive',
  'Join us for a special blood donation camp in celebration of World Blood Donor Day. Help save lives by donating blood and spreading awareness about the importance of voluntary blood donation. Free health checkup and refreshments provided.',
  'blood_drive',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '8 hours',
  'Community Health Center, Main Street, Chennai',
  false,
  100,
  'Dr. Sarah Johnson',
  '+91-9876543210',
  ARRAY['blood donation', 'community service', 'health awareness'],
  true
),
(
  (SELECT id FROM profiles WHERE role = 'hospital' LIMIT 1),
  'International Yoga Day Celebration',
  'Celebrate International Yoga Day with a community yoga session. Learn basic yoga poses, breathing techniques, and meditation practices for better physical and mental health. Suitable for all ages and fitness levels.',
  'yoga_session',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '3 hours',
  'City Park, Central Garden, Chennai',
  false,
  50,
  'Yoga Instructor Priya Sharma',
  '+91-9876543211',
  ARRAY['yoga', 'mental health', 'wellness', 'community'],
  false
),
(
  (SELECT id FROM profiles WHERE role = 'hospital' LIMIT 1),
  'Diabetes Awareness Webinar',
  'Online webinar about diabetes prevention, management, and lifestyle changes. Expert doctors will share insights about early detection, diet management, exercise routines, and latest treatment options.',
  'webinar',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
  'Online Event',
  true,
  200,
  'Dr. Rajesh Kumar',
  '+91-9876543212',
  ARRAY['diabetes', 'prevention', 'health education', 'webinar'],
  true
),
(
  (SELECT id FROM profiles WHERE role = 'hospital' LIMIT 1),
  'Heart Health Awareness Talk',
  'Learn about cardiovascular health, risk factors, prevention strategies, and the importance of regular checkups. Interactive session with cardiologists and nutritionists.',
  'awareness_talk',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '10 days' + INTERVAL '2 hours',
  'Apollo Hospital Auditorium, Chennai',
  false,
  80,
  'Dr. Meera Patel',
  '+91-9876543213',
  ARRAY['heart health', 'cardiology', 'prevention', 'awareness'],
  false
),
(
  (SELECT id FROM profiles WHERE role = 'hospital' LIMIT 1),
  'Free Health Checkup Camp',
  'Comprehensive health screening including blood pressure, blood sugar, BMI, and basic health assessment. Free consultation with general physicians and health counseling.',
  'health_checkup',
  NOW() + INTERVAL '12 days',
  NOW() + INTERVAL '12 days' + INTERVAL '6 hours',
  'Government Hospital, T. Nagar, Chennai',
  false,
  150,
  'Dr. Arun Kumar',
  '+91-9876543214',
  ARRAY['health checkup', 'screening', 'free consultation', 'community health'],
  true
),
(
  (SELECT id FROM profiles WHERE role = 'hospital' LIMIT 1),
  'Mental Health Awareness Webinar',
  'Understanding mental health, recognizing signs of depression and anxiety, stress management techniques, and when to seek professional help. Open discussion with psychiatrists.',
  'webinar',
  NOW() + INTERVAL '8 days',
  NOW() + INTERVAL '8 days' + INTERVAL '90 minutes',
  'Online Event',
  true,
  300,
  'Dr. Kavitha Reddy',
  '+91-9876543215',
  ARRAY['mental health', 'depression', 'anxiety', 'stress management'],
  false
);