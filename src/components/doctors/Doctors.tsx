import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Star, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  Award, 
  Search, 
  Filter,
  MessageCircle,
  Video,
  Stethoscope,
  GraduationCap
} from 'lucide-react';
import { supabase, Doctor } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const Doctors: React.FC = () => {
  const { profile } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    experience: '',
    rating: '',
    consultationFee: '',
    availability: '',
  });

  const specializations = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'General Medicine', 'Gynecology', 'Neurology', 'Oncology',
    'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology'
  ];

  const experienceRanges = [
    { value: '0-5', label: '0-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10-15', label: '10-15 years' },
    { value: '15+', label: '15+ years' },
  ];

  const feeRanges = [
    { value: '0-500', label: 'Under ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-2000', label: '₹1000 - ₹2000' },
    { value: '2000+', label: 'Above ₹2000' },
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profiles (full_name, phone, city, address, email)
        `)
        .eq('is_verified', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.profiles?.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialization = !filters.specialization || 
      doctor.specialization === filters.specialization;

    const matchesExperience = !filters.experience || (() => {
      const [min, max] = filters.experience.split('-').map(n => n === '+' ? Infinity : parseInt(n));
      return doctor.experience_years >= min && (max === undefined || doctor.experience_years <= max);
    })();

    const matchesRating = !filters.rating || doctor.rating >= parseFloat(filters.rating);

    const matchesFee = !filters.consultationFee || (() => {
      if (!doctor.consultation_fee) return true;
      const [min, max] = filters.consultationFee.split('-').map(n => n === '+' ? Infinity : parseInt(n));
      return doctor.consultation_fee >= min && (max === undefined || doctor.consultation_fee <= max);
    })();

    return matchesSearch && matchesSpecialization && matchesExperience && matchesRating && matchesFee;
  });

  const handleBookAppointment = (doctorId: string) => {
    // In a real app, this would open a booking modal or navigate to booking page
    alert('Appointment booking feature coming soon!');
  };

  const handleCall = (phone: string | null) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      alert('Phone number not available for this doctor.');
    }
  };

  const handleChat = (doctorName: string, phone: string | null) => {
    if (phone) {
      const message = `Hi Dr. ${doctorName}, I would like to consult with you. Can we schedule an appointment?`;
      const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Contact information not available for this doctor.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <UserCheck className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Find Doctors</h1>
            <p className="text-teal-100">Connect with verified healthcare professionals</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{doctors.length}</div>
            <div className="text-teal-100">Verified Doctors</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{specializations.length}</div>
            <div className="text-teal-100">Specializations</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">4.8</div>
            <div className="text-teal-100">Avg Rating</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-teal-100">Available</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors by name, specialization, or location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience
              </label>
              <select
                value={filters.experience}
                onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Any Experience</option>
                {experienceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Fee
              </label>
              <select
                value={filters.consultationFee}
                onChange={(e) => setFilters(prev => ({ ...prev, consultationFee: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Any Fee</option>
                {feeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  specialization: '',
                  experience: '',
                  rating: '',
                  consultationFee: '',
                  availability: '',
                })}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="grid gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-teal-100 p-4 rounded-xl">
                    <Stethoscope className="h-8 w-8 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Dr. {doctor.profiles?.full_name}
                    </h3>
                    <p className="text-teal-600 font-medium mb-1">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4" />
                        <span>{doctor.experience_years} years experience</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{doctor.profiles?.city}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({doctor.total_reviews} reviews)</span>
                  </div>
                  {doctor.consultation_fee && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">₹{doctor.consultation_fee}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualifications */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Qualifications</span>
                </div>
                <p className="text-sm text-gray-600">{doctor.qualification}</p>
              </div>

              {/* Hospital Affiliations */}
              {doctor.hospital_affiliations && doctor.hospital_affiliations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Hospital Affiliations</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.hospital_affiliations.map((hospital) => (
                      <span
                        key={hospital}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {hospital}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {doctor.languages_spoken && doctor.languages_spoken.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages_spoken.map((language) => (
                      <span
                        key={language}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {doctor.available_days && doctor.available_days.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Available Days</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.available_days.map((day) => (
                      <span
                        key={day}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                  {doctor.available_hours && (
                    <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{doctor.available_hours}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bio */}
              {doctor.bio && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">{doctor.bio}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleBookAppointment(doctor.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Appointment</span>
                </button>
                <button 
                  onClick={() => alert('Video consultation feature coming soon!')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </button>
                <button 
                  onClick={() => handleChat(doctor.profiles?.full_name || 'Doctor', doctor.profiles?.phone)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </button>
                <button 
                  onClick={() => handleCall(doctor.profiles?.phone)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600">
              {searchQuery || Object.values(filters).some(f => f)
                ? 'Try adjusting your search criteria or filters.'
                : 'No verified doctors are currently available in the system.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;