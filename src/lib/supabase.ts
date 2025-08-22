import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;



export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  profile_image_url?: string;
  role: 'patient' | 'donor' | 'doctor' | 'hospital' | 'admin';
  is_verified: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
};

export type BloodDonor = {
  id: string;
  user_id: string;
  blood_group: string;
  weight?: number;
  last_donated_date?: string;
  is_available: boolean;
  medical_conditions?: string;
  preferred_contact: 'phone' | 'email' | 'both';
  donation_count: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type BloodRequest = {
  id: string;
  requester_id: string;
  patient_name: string;
  blood_group: string;
  units_needed: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  hospital_name: string;
  hospital_address: string;
  contact_person: string;
  contact_phone: string;
  required_by: string;
  additional_notes?: string;
  status: 'active' | 'fulfilled' | 'expired';
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Hospital = {
  id: string;
  user_id: string;
  hospital_name: string;
  license_number: string;
  hospital_type?: string;
  specializations?: string[];
  bed_capacity?: number;
  emergency_services: boolean;
  ambulance_services: boolean;
  blood_bank: boolean;
  website_url?: string;
  description?: string;
  facilities?: string[];
  is_verified: boolean;
  verification_date?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type AssistanceRequest = {
  id: string;
  requester_id: string;
  title: string;
  description: string;
  patient_name: string;
  patient_age?: number;
  medical_condition: string;
  hospital_name?: string;
  treatment_details?: string;
  target_amount: number;
  raised_amount: number;
  document_urls?: string[];
  status: 'active' | 'completed' | 'expired' | 'verified';
  is_verified: boolean;
  verification_date?: string;
  deadline_date?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Doctor = {
  id: string;
  user_id: string;
  license_number: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  hospital_affiliations?: string[];
  consultation_fee?: number;
  available_days?: string[];
  available_hours?: string;
  languages_spoken?: string[];
  bio?: string;
  is_verified: boolean;
  verification_date?: string;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type MedicineReminder = {
  id: string;
  user_id: string;
  medicine_name: string;
  dosage: string;
  frequency_per_day: number;
  reminder_times: string[];
  start_date: string;
  end_date?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HealthRecord = {
  id: string;
  user_id: string;
  record_type: 'symptom' | 'diagnosis' | 'surgery' | 'prescription' | 'lab_result' | 'vaccination';
  title: string;
  description?: string;
  record_date: string;
  doctor_name?: string;
  hospital_name?: string;
  document_urls?: string[];
  tags?: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
};