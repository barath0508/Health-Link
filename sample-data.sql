-- Sample Data for HealthLink Platform
-- Run this after setting up the basic database structure

-- Insert sample hospitals
INSERT INTO hospitals (hospital_name, license_number, hospital_type, specializations, bed_capacity, emergency_services, ambulance_services, blood_bank, description, facilities, is_verified) VALUES
('Apollo Hospital', 'APL001', 'private', ARRAY['Cardiology', 'Oncology', 'Neurology'], 500, true, true, true, 'Leading multi-specialty hospital with advanced medical facilities', ARRAY['ICU', 'Emergency Ward', 'Operation Theater', 'Diagnostic Center'], true),
('AIIMS Delhi', 'AIIMS001', 'government', ARRAY['All Specialties'], 2500, true, true, true, 'Premier medical institute and hospital', ARRAY['Trauma Center', 'Research Labs', 'Medical College'], true),
('Fortis Hospital', 'FOR001', 'private', ARRAY['Orthopedics', 'Gastroenterology'], 300, true, false, true, 'Advanced healthcare with personalized treatment', ARRAY['Robotic Surgery', 'Rehabilitation Center'], true);

-- Insert sample doctors
INSERT INTO doctors (license_number, specialization, qualification, experience_years, consultation_fee, available_days, available_hours, languages_spoken, bio, is_verified, rating, total_reviews) VALUES
('DOC001', 'Cardiology', 'MBBS, MD Cardiology', 15, 1500, ARRAY['Monday', 'Wednesday', 'Friday'], '9:00 AM - 5:00 PM', ARRAY['English', 'Hindi'], 'Experienced cardiologist specializing in heart diseases', true, 4.8, 150),
('DOC002', 'Pediatrics', 'MBBS, MD Pediatrics', 10, 800, ARRAY['Tuesday', 'Thursday', 'Saturday'], '10:00 AM - 6:00 PM', ARRAY['English', 'Hindi', 'Tamil'], 'Child specialist with expertise in pediatric care', true, 4.9, 200),
('DOC003', 'Orthopedics', 'MBBS, MS Orthopedics', 12, 1200, ARRAY['Monday', 'Tuesday', 'Thursday'], '8:00 AM - 4:00 PM', ARRAY['English', 'Hindi'], 'Orthopedic surgeon specializing in joint replacement', true, 4.7, 120);

-- Insert sample blood requests
INSERT INTO blood_requests (patient_name, blood_group, units_needed, urgency_level, hospital_name, hospital_address, contact_person, contact_phone, required_by, additional_notes, status) VALUES
('Rajesh Kumar', 'O+', 2, 'critical', 'Apollo Hospital', 'Sarita Vihar, Delhi', 'Dr. Sharma', '9876543210', '2024-02-15', 'Patient undergoing emergency surgery', 'active'),
('Priya Singh', 'B-', 1, 'high', 'AIIMS Delhi', 'Ansari Nagar, Delhi', 'Dr. Gupta', '9876543211', '2024-02-20', 'Required for cancer treatment', 'active'),
('Amit Patel', 'AB+', 3, 'medium', 'Fortis Hospital', 'Sector 62, Noida', 'Dr. Verma', '9876543212', '2024-02-25', 'Scheduled surgery patient', 'active');

-- Insert sample assistance requests
INSERT INTO assistance_requests (title, description, patient_name, patient_age, medical_condition, hospital_name, treatment_details, target_amount, raised_amount, status, is_verified) VALUES
('Help Ravi Fight Cancer', 'Ravi is a 45-year-old father of two who has been diagnosed with stage 3 lung cancer. He needs immediate chemotherapy treatment.', 'Ravi Sharma', 45, 'Lung Cancer Stage 3', 'Tata Memorial Hospital', 'Chemotherapy sessions and radiation therapy', 500000, 125000, 'active', true),
('Support Baby Aisha Heart Surgery', 'Baby Aisha was born with a congenital heart defect and needs urgent surgery to save her life.', 'Aisha Khan', 1, 'Congenital Heart Disease', 'Fortis Escorts Heart Institute', 'Open heart surgery and post-operative care', 800000, 200000, 'active', true),
('Help Elderly Man Walk Again', 'Mr. Krishnan needs hip replacement surgery after a severe accident. Family cannot afford the treatment.', 'K. Krishnan', 68, 'Hip Fracture', 'Apollo Hospital', 'Hip replacement surgery and physiotherapy', 300000, 75000, 'active', true);

-- Insert sample blood donors
INSERT INTO blood_donors (blood_group, weight, is_available, medical_conditions, preferred_contact, donation_count) VALUES
('O+', 70, true, 'None', 'phone', 5),
('A+', 65, true, 'None', 'both', 3),
('B+', 75, true, 'Hypertension (controlled)', 'email', 8),
('AB-', 60, true, 'None', 'phone', 2),
('O-', 68, true, 'None', 'both', 12);

-- Insert sample medicine reminders
INSERT INTO medicine_reminders (medicine_name, dosage, frequency_per_day, reminder_times, start_date, end_date, notes, is_active) VALUES
('Metformin', '500mg', 2, ARRAY['08:00', '20:00'], '2024-01-01', '2024-12-31', 'Take with meals for diabetes management', true),
('Lisinopril', '10mg', 1, ARRAY['09:00'], '2024-01-01', NULL, 'Blood pressure medication', true),
('Vitamin D3', '1000 IU', 1, ARRAY['08:00'], '2024-01-01', '2024-06-30', 'Vitamin supplement', true);

-- Insert sample health records
INSERT INTO health_records (record_type, title, description, record_date, doctor_name, hospital_name, tags, is_private) VALUES
('diagnosis', 'Type 2 Diabetes Diagnosis', 'Patient diagnosed with Type 2 Diabetes Mellitus. HbA1c: 8.5%. Recommended lifestyle changes and medication.', '2024-01-15', 'Dr. Rajesh Kumar', 'Apollo Hospital', ARRAY['Diabetes', 'Chronic'], true),
('prescription', 'Blood Pressure Medication', 'Prescribed Lisinopril 10mg once daily for hypertension management.', '2024-01-20', 'Dr. Priya Sharma', 'Fortis Hospital', ARRAY['Hypertension', 'Medication'], true),
('lab_result', 'Complete Blood Count', 'CBC results showing normal values. Hemoglobin: 13.5 g/dL, WBC: 7000/μL', '2024-01-25', 'Dr. Amit Gupta', 'Max Hospital', ARRAY['Lab Test', 'Routine'], true);