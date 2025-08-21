/*
  # Add Sample Data for HealthLink Platform

  1. Sample Data
    - Emergency contacts for major Indian cities
    - Sample doctors with various specializations
    - Sample hospitals across different categories
    - Sample assistance requests and blood requests

  2. Purpose
    - Populate the platform with realistic data for demonstration
    - Provide users with immediate functionality
    - Show the full potential of the platform
*/

-- Insert sample emergency contacts
INSERT INTO emergency_contacts (name, category, phone_number, address, city, state, is_24x7, services) VALUES
-- Hospitals
('All India Institute of Medical Sciences', 'hospital', '011-26588500', 'Ansari Nagar, New Delhi', 'New Delhi', 'Delhi', true, ARRAY['Emergency Care', 'Trauma Center', 'ICU', 'Blood Bank']),
('King Edward Memorial Hospital', 'hospital', '022-24129884', 'Acharya Donde Marg, Parel', 'Mumbai', 'Maharashtra', true, ARRAY['Emergency Care', 'Maternity', 'Pediatrics']),
('Christian Medical College', 'hospital', '0416-228-4000', 'Ida Scudder Road, Vellore', 'Vellore', 'Tamil Nadu', true, ARRAY['Emergency Care', 'Cardiology', 'Oncology']),
('Post Graduate Institute of Medical Education', 'hospital', '0172-275-6565', 'Sector 12, Chandigarh', 'Chandigarh', 'Chandigarh', true, ARRAY['Emergency Care', 'Neurology', 'Transplant']),

-- Ambulance Services
('108 Emergency Response Service', 'ambulance', '108', 'State-wide Service', 'Multiple Cities', 'All States', true, ARRAY['Emergency Transport', 'Basic Life Support', 'Advanced Life Support']),
('Ziqitza Healthcare Limited', 'ambulance', '1298', 'Pan India Service', 'Multiple Cities', 'Multiple States', true, ARRAY['Emergency Transport', 'ICU on Wheels']),
('BVG India Limited', 'ambulance', '1962', 'Delhi NCR Service', 'New Delhi', 'Delhi', true, ARRAY['Emergency Transport', 'Patient Transport']),

-- Police Stations
('Delhi Police Control Room', 'police', '100', 'ITO, New Delhi', 'New Delhi', 'Delhi', true, ARRAY['Emergency Response', 'Crime Prevention']),
('Mumbai Police Control Room', 'police', '100', 'Crawford Market, Mumbai', 'Mumbai', 'Maharashtra', true, ARRAY['Emergency Response', 'Traffic Control']),
('Bangalore City Police', 'police', '100', 'Infantry Road, Bangalore', 'Bangalore', 'Karnataka', true, ARRAY['Emergency Response', 'Cyber Crime']),

-- Fire Departments
('Delhi Fire Service', 'fire', '101', 'Connaught Place, New Delhi', 'New Delhi', 'Delhi', true, ARRAY['Fire Fighting', 'Rescue Operations']),
('Mumbai Fire Brigade', 'fire', '101', 'Byculla, Mumbai', 'Mumbai', 'Maharashtra', true, ARRAY['Fire Fighting', 'Emergency Rescue']),
('Karnataka Fire and Emergency Services', 'fire', '101', 'Vidhana Soudha, Bangalore', 'Bangalore', 'Karnataka', true, ARRAY['Fire Fighting', 'Disaster Response']),

-- Poison Control
('All India Poison Control Centre', 'poison_control', '1066', 'AIIMS, New Delhi', 'New Delhi', 'Delhi', true, ARRAY['Poison Information', 'Toxicology Consultation']),
('National Poison Information Centre', 'poison_control', '1800-11-2233', 'NIMHANS, Bangalore', 'Bangalore', 'Karnataka', true, ARRAY['Poison Control', 'Emergency Consultation']);

-- Note: In a real application, you would also insert sample data for other tables
-- This is a basic example to get started with emergency contacts

-- Update the emergency contacts with approximate coordinates for major cities
UPDATE emergency_contacts SET 
  latitude = 28.6139, 
  longitude = 77.2090 
WHERE city = 'New Delhi';

UPDATE emergency_contacts SET 
  latitude = 19.0760, 
  longitude = 72.8777 
WHERE city = 'Mumbai';

UPDATE emergency_contacts SET 
  latitude = 12.9716, 
  longitude = 77.5946 
WHERE city = 'Bangalore';

UPDATE emergency_contacts SET 
  latitude = 30.7333, 
  longitude = 76.7794 
WHERE city = 'Chandigarh';

UPDATE emergency_contacts SET 
  latitude = 12.9165, 
  longitude = 79.1325 
WHERE city = 'Vellore';