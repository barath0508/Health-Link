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
  GraduationCap,
  Cpu,
  Zap,
  Target,
  Database,
  Shield
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
    { value: '0-5', label: '0-5 YEARS' },
    { value: '5-10', label: '5-10 YEARS' },
    { value: '10-15', label: '10-15 YEARS' },
    { value: '15+', label: '15+ YEARS' },
  ];

  const feeRanges = [
    { value: '0-500', label: 'UNDER ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-2000', label: '₹1000 - ₹2000' },
    { value: '2000+', label: 'ABOVE ₹2000' },
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
        <div className="w-12 h-12 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* Cyberpunk Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl border border-teal-500/30"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}></div>
        <div className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 bg-teal-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative px-4 sm:px-8 py-8 sm:py-12 text-white">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 border-2 border-teal-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/50">
                <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-teal-400" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                <Cpu className="h-2 w-2 sm:h-3 sm:w-3 text-gray-900" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                EXPERT NET
              </h1>
              <p className="text-teal-300 text-sm sm:text-lg font-bold tracking-wider">Specialist Network System</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <div className="bg-gray-800/40 border border-teal-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Database className="h-4 w-4 sm:h-6 sm:w-6 text-teal-400 animate-pulse" />
                <div>
                  <p className="text-lg sm:text-2xl font-black text-teal-400">{doctors.length}</p>
                  <p className="text-xs sm:text-sm text-gray-300 font-bold">VERIFIED DOCS</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Target className="h-4 w-4 sm:h-6 sm:w-6 text-cyan-400 animate-pulse" />
                <div>
                  <p className="text-lg sm:text-2xl font-black text-cyan-400">{specializations.length}</p>
                  <p className="text-xs sm:text-sm text-gray-300 font-bold">SPECIALTIES</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Star className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400 animate-pulse" />
                <div>
                  <p className="text-lg sm:text-2xl font-black text-yellow-400">4.8</p>
                  <p className="text-xs sm:text-sm text-gray-300 font-bold">AVG RATING</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-green-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-green-400 animate-pulse" />
                <div>
                  <p className="text-lg sm:text-2xl font-black text-green-400">24/7</p>
                  <p className="text-xs sm:text-sm text-gray-300 font-bold">AVAILABLE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-gray-800/60 border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-cyan-500/10 p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 sm:left-6 top-3 sm:top-4 h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specialists by name, specialty, or location..."
              className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 bg-gray-900/80 border-2 border-gray-700 rounded-xl sm:rounded-2xl text-cyan-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/25 focus:border-cyan-500 font-bold text-sm sm:text-lg"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-black text-teal-400 mb-2 tracking-wider">
                SPECIALIZATION
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                className="w-full px-3 py-2 sm:py-3 bg-gray-900/80 border-2 border-gray-700 rounded-lg sm:rounded-xl text-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/25 focus:border-teal-500 font-bold text-sm"
              >
                <option value="">ALL SPECIALIZATIONS</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-purple-400 mb-2 tracking-wider">
                EXPERIENCE
              </label>
              <select
                value={filters.experience}
                onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-3 py-2 sm:py-3 bg-gray-900/80 border-2 border-gray-700 rounded-lg sm:rounded-xl text-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-500/25 focus:border-purple-500 font-bold text-sm"
              >
                <option value="">ANY EXPERIENCE</option>
                {experienceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-yellow-400 mb-2 tracking-wider">
                RATING
              </label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                className="w-full px-3 py-2 sm:py-3 bg-gray-900/80 border-2 border-gray-700 rounded-lg sm:rounded-xl text-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-500/25 focus:border-yellow-500 font-bold text-sm"
              >
                <option value="">ANY RATING</option>
                <option value="4.5">4.5+ STARS</option>
                <option value="4.0">4.0+ STARS</option>
                <option value="3.5">3.5+ STARS</option>
                <option value="3.0">3.0+ STARS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-green-400 mb-2 tracking-wider">
                CONSULTATION FEE
              </label>
              <select
                value={filters.consultationFee}
                onChange={(e) => setFilters(prev => ({ ...prev, consultationFee: e.target.value }))}
                className="w-full px-3 py-2 sm:py-3 bg-gray-900/80 border-2 border-gray-700 rounded-lg sm:rounded-xl text-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 font-bold text-sm"
              >
                <option value="">ANY FEE</option>
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
                className="w-full px-4 py-2 sm:py-3 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-bold text-sm tracking-wider"
              >
                CLEAR FILTERS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid gap-4 sm:gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-gray-800/60 border border-teal-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-teal-500/10 overflow-hidden">
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-500/20 border-2 border-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                      DR. {doctor.profiles?.full_name}
                    </h3>
                    <p className="text-teal-400 font-bold text-sm sm:text-base mb-1">
                      {doctor.specialization.toUpperCase()}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-bold">{doctor.experience_years} YEARS EXP</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-bold">{doctor.profiles?.city}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                    <span className="font-black text-yellow-400 text-sm sm:text-base">{doctor.rating.toFixed(1)}</span>
                    <span className="text-xs sm:text-sm text-gray-400 font-bold">({doctor.total_reviews} reviews)</span>
                  </div>
                  {doctor.consultation_fee && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-black text-sm sm:text-base">₹{doctor.consultation_fee}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualifications */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-black text-cyan-400 tracking-wider">QUALIFICATIONS</span>
                </div>
                <p className="text-sm text-gray-300 font-bold">{doctor.qualification}</p>
              </div>

              {/* Hospital Affiliations */}
              {doctor.hospital_affiliations && doctor.hospital_affiliations.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-sm font-black text-blue-400 mb-3 tracking-wider">HOSPITAL AFFILIATIONS</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.hospital_affiliations.map((hospital) => (
                      <span
                        key={hospital}
                        className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg text-xs font-bold"
                      >
                        {hospital.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {doctor.languages_spoken && doctor.languages_spoken.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-sm font-black text-purple-400 mb-3 tracking-wider">LANGUAGES</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages_spoken.map((language) => (
                      <span
                        key={language}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg text-xs font-bold"
                      >
                        {language.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {doctor.available_days && doctor.available_days.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-black text-green-400 tracking-wider">AVAILABLE DAYS</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {doctor.available_days.map((day) => (
                      <span
                        key={day}
                        className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-xs font-bold"
                      >
                        {day.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  {doctor.available_hours && (
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span className="font-bold">{doctor.available_hours}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bio */}
              {doctor.bio && (
                <div className="bg-gray-900/60 border border-gray-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-sm text-gray-300 font-medium">{doctor.bio}</p>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <button
                  onClick={() => handleBookAppointment(doctor.id)}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-gray-900 rounded-lg sm:rounded-xl hover:shadow-xl hover:shadow-teal-500/25 transition-all duration-300 font-black text-xs sm:text-sm border-2 border-teal-400 transform hover:scale-105"
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">BOOK</span>
                </button>
                <button 
                  onClick={() => alert('Video consultation feature coming soon!')}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-500/20 border-2 border-blue-500/50 text-blue-400 rounded-lg sm:rounded-xl hover:bg-blue-500/30 transition-all duration-300 font-black text-xs sm:text-sm transform hover:scale-105"
                >
                  <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">VIDEO</span>
                </button>
                <button 
                  onClick={() => handleChat(doctor.profiles?.full_name || 'Doctor', doctor.profiles?.phone)}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-purple-500/20 border-2 border-purple-500/50 text-purple-400 rounded-lg sm:rounded-xl hover:bg-purple-500/30 transition-all duration-300 font-black text-xs sm:text-sm transform hover:scale-105"
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">CHAT</span>
                </button>
                <button 
                  onClick={() => handleCall(doctor.profiles?.phone)}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-black text-xs sm:text-sm transform hover:scale-105"
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">CALL</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDoctors.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-gray-800/40 border border-gray-700 rounded-2xl sm:rounded-3xl">
            <UserCheck className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">
              NO SPECIALISTS FOUND
            </h3>
            <p className="text-gray-400 font-bold px-4">
              {searchQuery || Object.values(filters).some(f => f)
                ? 'ADJUST SEARCH CRITERIA OR FILTERS'
                : 'NO VERIFIED SPECIALISTS AVAILABLE IN NETWORK'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;