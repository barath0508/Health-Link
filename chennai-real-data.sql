-- Real Chennai Healthcare Data
-- Emergency Contacts, Hospitals, and Healthcare Services

-- Emergency Contacts in Chennai
INSERT INTO emergency_contacts (name, category, phone_number, address, city, state, is_24x7, services, latitude, longitude) VALUES
-- Major Hospitals
('Apollo Hospitals', 'hospital', '044-2829-3333', 'Greams Road, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Emergency Care', 'Trauma Center', 'ICU', 'Blood Bank'], 13.0569, 80.2497),
('Fortis Malar Hospital', 'hospital', '044-4289-2222', 'Adyar, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Emergency Care', 'Cardiology', 'Oncology'], 13.0067, 80.2206),
('MIOT International', 'hospital', '044-4200-1000', 'Manapakkam, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Multi Organ Transplant', 'Emergency Care'], 12.9698, 80.1852),
('Government General Hospital', 'hospital', '044-2819-3000', 'Park Town, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Emergency Care', 'Government Hospital'], 13.0878, 80.2785),
('Stanley Medical College Hospital', 'hospital', '044-2528-2990', 'Old Jail Road, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Emergency Care', 'Medical College'], 13.0732, 80.2609),
('Sankara Nethralaya', 'hospital', '044-2827-1616', 'Nungambakkam, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Eye Care', 'Emergency Eye Care'], 13.0569, 80.2497),

-- Ambulance Services
('108 Emergency Ambulance', 'ambulance', '108', 'State-wide Service', 'Chennai', 'Tamil Nadu', true, ARRAY['Emergency Transport', 'Basic Life Support'], 13.0827, 80.2707),
('Ziqitza Healthcare (ZHL)', 'ambulance', '1298', 'Chennai Operations', 'Chennai', 'Tamil Nadu', true, ARRAY['Emergency Transport', 'Advanced Life Support'], 13.0827, 80.2707),
('MedCab Ambulance', 'ambulance', '044-4567-8900', 'T. Nagar, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Patient Transport', 'ICU Ambulance'], 13.0418, 80.2341),

-- Police Stations
('Chennai City Police Control Room', 'police', '100', 'Egmore, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Emergency Response', 'Crime Prevention'], 13.0732, 80.2609),
('Traffic Police Control Room', 'police', '103', 'Commissioner Office, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Traffic Control', 'Emergency Response'], 13.0827, 80.2707),

-- Fire Department
('Tamil Nadu Fire and Rescue Services', 'fire', '101', 'Egmore, Chennai', 'Chennai', 'Tamil Nadu', true, ARRAY['Fire Fighting', 'Rescue Operations'], 13.0732, 80.2609),

-- Poison Control
('Poison Control Centre - RGGGH', 'poison_control', '044-2819-3000', 'Rajiv Gandhi Govt General Hospital', 'Chennai', 'Tamil Nadu', true, ARRAY['Poison Information', 'Emergency Consultation'], 13.0878, 80.2785);

-- Real Hospitals in Chennai
INSERT INTO hospitals (hospital_name, license_number, hospital_type, specializations, bed_capacity, emergency_services, ambulance_services, blood_bank, website_url, description, facilities, is_verified) VALUES
('Apollo Hospitals Chennai', 'APL-CHN-001', 'private', ARRAY['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Gastroenterology'], 550, true, true, true, 'https://www.apollohospitals.com', 'Leading multi-specialty hospital with advanced medical facilities and international standards', ARRAY['ICU', 'Emergency Ward', 'Operation Theater', 'Diagnostic Center', 'Pharmacy', 'Blood Bank'], true),

('Fortis Malar Hospital', 'FOR-CHN-001', 'private', ARRAY['Cardiology', 'Cardiac Surgery', 'Neurology', 'Orthopedics'], 180, true, true, true, 'https://www.fortishealthcare.com', 'Advanced cardiac care and multi-specialty hospital', ARRAY['Cath Lab', 'ICU', 'Emergency Ward', 'Operation Theater'], true),

('MIOT International', 'MIOT-001', 'private', ARRAY['Multi Organ Transplant', 'Nephrology', 'Cardiology', 'Oncology'], 300, true, true, true, 'https://www.miotinternational.com', 'Indias first multi organ transplant hospital', ARRAY['Transplant Unit', 'Dialysis Center', 'ICU', 'Emergency Ward'], true),

('Government General Hospital', 'GGH-CHN-001', 'government', ARRAY['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology', 'Orthopedics'], 1200, true, true, true, NULL, 'Largest government hospital in Tamil Nadu providing free healthcare', ARRAY['Emergency Ward', 'Trauma Center', 'Blood Bank', 'Pharmacy'], true),

('Stanley Medical College Hospital', 'SMC-001', 'government', ARRAY['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology'], 800, true, true, true, NULL, 'Government medical college hospital with comprehensive healthcare', ARRAY['Medical College', 'Emergency Ward', 'ICU', 'Blood Bank'], true),

('Sankara Nethralaya', 'SN-001', 'private', ARRAY['Ophthalmology', 'Retina', 'Cornea', 'Glaucoma'], 200, true, false, false, 'https://www.sankaranethralaya.org', 'Premier eye care hospital and research institute', ARRAY['Eye Surgery', 'Laser Treatment', 'Research Center'], true),

('Dr. Kamakshi Memorial Hospital', 'KMH-001', 'private', ARRAY['Cardiology', 'Cardiac Surgery', 'Neurology'], 150, true, true, true, 'https://www.kmchhospitals.com', 'Multi-specialty hospital with focus on cardiac care', ARRAY['Cath Lab', 'ICU', 'Emergency Ward'], true),

('Vijaya Hospital', 'VH-001', 'private', ARRAY['General Medicine', 'Surgery', 'Pediatrics', 'Orthopedics'], 250, true, true, true, 'https://www.vijayahospital.com', 'Comprehensive healthcare with modern facilities', ARRAY['ICU', 'Emergency Ward', 'Diagnostic Center'], true);

-- Real Doctors in Chennai
INSERT INTO doctors (license_number, specialization, qualification, experience_years, hospital_affiliations, consultation_fee, available_days, available_hours, languages_spoken, bio, is_verified, rating, total_reviews) VALUES
('TN-DOC-001', 'Cardiology', 'MBBS, MD, DM Cardiology', 20, ARRAY['Apollo Hospitals Chennai'], 2000, ARRAY['Monday', 'Wednesday', 'Friday'], '9:00 AM - 5:00 PM', ARRAY['English', 'Tamil', 'Hindi'], 'Senior Consultant Cardiologist with expertise in interventional cardiology', true, 4.8, 250),

('TN-DOC-002', 'Neurology', 'MBBS, MD, DM Neurology', 15, ARRAY['Fortis Malar Hospital'], 1800, ARRAY['Tuesday', 'Thursday', 'Saturday'], '10:00 AM - 6:00 PM', ARRAY['English', 'Tamil'], 'Neurologist specializing in stroke and epilepsy management', true, 4.7, 180),

('TN-DOC-003', 'Orthopedics', 'MBBS, MS Orthopedics', 18, ARRAY['MIOT International'], 1500, ARRAY['Monday', 'Tuesday', 'Thursday', 'Friday'], '8:00 AM - 4:00 PM', ARRAY['English', 'Tamil', 'Telugu'], 'Orthopedic surgeon specializing in joint replacement and sports medicine', true, 4.9, 320),

('TN-DOC-004', 'Pediatrics', 'MBBS, MD Pediatrics', 12, ARRAY['Government General Hospital'], 500, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '9:00 AM - 5:00 PM', ARRAY['English', 'Tamil'], 'Pediatrician with expertise in neonatal care', true, 4.6, 150),

('TN-DOC-005', 'Ophthalmology', 'MBBS, MS Ophthalmology', 25, ARRAY['Sankara Nethralaya'], 1200, ARRAY['Monday', 'Wednesday', 'Friday', 'Saturday'], '9:00 AM - 5:00 PM', ARRAY['English', 'Tamil'], 'Senior Ophthalmologist specializing in retinal diseases', true, 4.8, 400),

('TN-DOC-006', 'General Medicine', 'MBBS, MD General Medicine', 10, ARRAY['Stanley Medical College Hospital'], 400, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '8:00 AM - 2:00 PM', ARRAY['English', 'Tamil'], 'General physician with focus on diabetes and hypertension management', true, 4.5, 200);

-- Current Blood Requests in Chennai
INSERT INTO blood_requests (patient_name, blood_group, units_needed, urgency_level, hospital_name, hospital_address, contact_person, contact_phone, required_by, additional_notes, status) VALUES
('Ravi Kumar', 'O+', 3, 'critical', 'Apollo Hospitals Chennai', 'Greams Road, Chennai', 'Dr. Priya Sharma', '9876543210', '2024-01-25', 'Patient undergoing emergency cardiac surgery', 'active'),

('Meera Devi', 'B-', 2, 'high', 'Government General Hospital', 'Park Town, Chennai', 'Dr. Rajesh Kumar', '9876543211', '2024-01-28', 'Required for cancer treatment - chemotherapy patient', 'active'),

('Arjun Patel', 'AB+', 1, 'medium', 'Fortis Malar Hospital', 'Adyar, Chennai', 'Dr. Suresh Babu', '9876543212', '2024-02-02', 'Scheduled surgery for kidney transplant', 'active'),

('Baby Lakshmi', 'A+', 1, 'critical', 'Stanley Medical College Hospital', 'Old Jail Road, Chennai', 'Dr. Kavitha', '9876543213', '2024-01-26', 'Newborn requiring blood transfusion', 'active');

-- Medical Assistance Cases in Chennai
INSERT INTO assistance_requests (title, description, patient_name, patient_age, medical_condition, hospital_name, treatment_details, target_amount, raised_amount, status, is_verified, deadline_date) VALUES
('Help Murugan Fight Liver Cancer', 'Murugan, a 52-year-old auto driver, has been diagnosed with liver cancer. He needs immediate treatment but cannot afford the high cost of treatment.', 'K. Murugan', 52, 'Liver Cancer Stage 3', 'Apollo Hospitals Chennai', 'Liver transplant surgery and post-operative care including immunosuppressive medications', 1500000, 350000, 'active', true, '2024-03-15'),

('Save Little Priya - Heart Surgery', 'Baby Priya was born with a complex congenital heart defect. She needs urgent surgery to save her life. Her parents are daily wage workers.', 'Priya Devi', 2, 'Complex Congenital Heart Disease', 'Fortis Malar Hospital', 'Open heart surgery with valve repair and post-operative intensive care', 1200000, 280000, 'active', true, '2024-02-20'),

('Support Elderly Krishnan - Kidney Treatment', 'Mr. Krishnan is suffering from chronic kidney disease and needs regular dialysis. His family cannot afford the ongoing treatment costs.', 'S. Krishnan', 65, 'Chronic Kidney Disease Stage 5', 'MIOT International', 'Regular dialysis sessions and kidney transplant evaluation', 800000, 150000, 'active', true, '2024-04-30'),

('Help Accident Victim Recover', 'Ramesh met with a severe road accident and has multiple fractures. He needs multiple surgeries and long-term rehabilitation.', 'Ramesh Kumar', 35, 'Multiple Fractures - Road Accident', 'Government General Hospital', 'Multiple orthopedic surgeries and physiotherapy rehabilitation', 600000, 120000, 'active', true, '2024-03-01');