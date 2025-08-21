import React, { useState, useEffect } from 'react';
import { 
  Building2 as HospitalIcon, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Users, 
  Calendar,
  Heart,
  Ambulance,
  Shield,
  Clock
} from 'lucide-react';
import { supabase, Hospital } from '../../lib/supabase';

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    specialization: '',
    services: [] as string[],
  });

  const hospitalTypes = [
    { value: 'government', label: 'Government' },
    { value: 'private', label: 'Private' },
    { value: 'semi-private', label: 'Semi-Private' },
    { value: 'specialty', label: 'Specialty' },
  ];

  const commonSpecializations = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 
    'Oncology', 'Emergency Medicine', 'General Surgery', 'Gynecology'
  ];

  const services = [
    { key: 'emergency_services', label: 'Emergency Services', icon: Shield },
    { key: 'ambulance_services', label: 'Ambulance Services', icon: Ambulance },
    { key: 'blood_bank', label: 'Blood Bank', icon: Heart },
  ];

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select(`
          *,
          profiles (full_name, phone, city, address)
        `)
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.profiles?.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !filters.type || hospital.hospital_type === filters.type;

    const matchesSpecialization = !filters.specialization || 
      hospital.specializations?.includes(filters.specialization);

    const matchesServices = filters.services.length === 0 || 
      filters.services.every(service => hospital[service as keyof Hospital] === true);

    return matchesSearch && matchesType && matchesSpecialization && matchesServices;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <HospitalIcon className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Healthcare Institutions</h1>
            <p className="text-blue-100">Find verified hospitals and healthcare centers</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{hospitals.length}</div>
            <div className="text-blue-100">Verified Hospitals</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {hospitals.filter(h => h.emergency_services).length}
            </div>
            <div className="text-blue-100">Emergency Centers</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {hospitals.filter(h => h.blood_bank).length}
            </div>
            <div className="text-blue-100">Blood Banks</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals by name or location..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {hospitalTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {commonSpecializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services
              </label>
              <div className="space-y-2">
                {services.map((service) => (
                  <label key={service.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.services.includes(service.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            services: [...prev.services, service.key]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            services: prev.services.filter(s => s !== service.key)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{service.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ type: '', specialization: '', services: [] })}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Hospitals List */}
      <div className="grid gap-6">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <HospitalIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {hospital.hospital_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="capitalize">
                        {hospital.hospital_type?.replace('_', ' ')} Hospital
                      </span>
                      {hospital.is_verified && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Shield className="h-4 w-4" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                    <div className="text-xs text-gray-500">156 reviews</div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-2 mb-4">
                {hospital.emergency_services && (
                  <div className="flex items-center space-x-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs">
                    <Shield className="h-3 w-3" />
                    <span>Emergency</span>
                  </div>
                )}
                {hospital.ambulance_services && (
                  <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                    <Ambulance className="h-3 w-3" />
                    <span>Ambulance</span>
                  </div>
                )}
                {hospital.blood_bank && (
                  <div className="flex items-center space-x-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs">
                    <Heart className="h-3 w-3" />
                    <span>Blood Bank</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
                  <Clock className="h-3 w-3" />
                  <span>24/7 Open</span>
                </div>
              </div>

              {/* Specializations */}
              {hospital.specializations && hospital.specializations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{hospital.profiles?.address || 'Address not provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{hospital.profiles?.phone || 'Phone not available'}</span>
                </div>
                {hospital.bed_capacity && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{hospital.bed_capacity} beds</span>
                  </div>
                )}
                {hospital.website_url && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <a
                      href={hospital.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {hospital.description && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">{hospital.description}</p>
                </div>
              )}

              {/* Facilities */}
              {hospital.facilities && hospital.facilities.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-1">
                    {hospital.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Contact Hospital
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Join Community
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredHospitals.length === 0 && (
          <div className="text-center py-12">
            <HospitalIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hospitals found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filters.type || filters.specialization || filters.services.length > 0
                ? 'Try adjusting your search criteria or filters.'
                : 'No verified hospitals are currently available in the system.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hospitals;