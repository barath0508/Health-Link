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
  Clock,
  Cpu,
  Zap,
  Target,
  Database,
  Wifi
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
    { value: 'government', label: 'GOVERNMENT' },
    { value: 'private', label: 'PRIVATE' },
    { value: 'semi-private', label: 'SEMI-PRIVATE' },
    { value: 'specialty', label: 'SPECIALTY' },
  ];

  const commonSpecializations = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 
    'Oncology', 'Emergency Medicine', 'General Surgery', 'Gynecology'
  ];

  const services = [
    { key: 'emergency_services', label: 'EMERGENCY OPS', icon: Shield },
    { key: 'ambulance_services', label: 'RAPID RESPONSE', icon: Ambulance },
    { key: 'blood_bank', label: 'BLOOD VAULT', icon: Heart },
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
        <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Cyberpunk Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-blue-500/30"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 100, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 100, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative px-8 py-12 text-white">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-800 border-2 border-blue-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                <HospitalIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                <Cpu className="h-3 w-3 text-gray-900" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                MED CENTERS
              </h1>
              <p className="text-blue-300 text-lg font-bold tracking-wider">Healthcare Facility Network</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-800/40 border border-blue-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-blue-400 animate-pulse" />
                <div>
                  <p className="text-2xl font-black text-blue-400">{hospitals.length}</p>
                  <p className="text-sm text-gray-300 font-bold">VERIFIED CENTERS</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-red-400 animate-pulse" />
                <div>
                  <p className="text-2xl font-black text-red-400">
                    {hospitals.filter(h => h.emergency_services).length}
                  </p>
                  <p className="text-sm text-gray-300 font-bold">EMERGENCY NODES</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-green-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-green-400 animate-pulse" />
                <div>
                  <p className="text-2xl font-black text-green-400">
                    {hospitals.filter(h => h.blood_bank).length}
                  </p>
                  <p className="text-sm text-gray-300 font-bold">BLOOD VAULTS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-gray-800/60 border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/10 p-6">
        <div className="space-y-6">
          {/* Search */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medical centers by name or location..."
              className="w-full px-6 py-4 bg-gray-900/80 border-2 border-gray-700 rounded-2xl text-cyan-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/25 focus:border-cyan-500 font-bold text-lg"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-black text-blue-400 mb-2 tracking-wider">
                CENTER TYPE
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 font-bold"
              >
                <option value="">ALL TYPES</option>
                {hospitalTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-purple-400 mb-2 tracking-wider">
                SPECIALIZATION
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-500/25 focus:border-purple-500 font-bold"
              >
                <option value="">ALL SPECIALIZATIONS</option>
                {commonSpecializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                SERVICES
              </label>
              <div className="space-y-3">
                {services.map((service) => (
                  <label key={service.key} className="flex items-center space-x-3">
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
                      className="w-4 h-4 rounded border-2 border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500/25"
                    />
                    <span className="text-sm text-gray-300 font-bold">{service.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ type: '', specialization: '', services: [] })}
            className="px-6 py-3 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-bold tracking-wider"
          >
            CLEAR ALL FILTERS
          </button>
        </div>
      </div>

      {/* Hospitals Grid */}
      <div className="grid gap-6">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="bg-gray-800/60 border border-blue-500/30 rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500 rounded-2xl flex items-center justify-center">
                    <HospitalIcon className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">
                      {hospital.hospital_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-400 font-bold tracking-wider">
                        {hospital.hospital_type?.replace('_', ' ').toUpperCase()} CENTER
                      </span>
                      {hospital.is_verified && (
                        <div className="flex items-center space-x-2 text-green-400">
                          <Shield className="h-4 w-4 animate-pulse" />
                          <span className="font-bold">VERIFIED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-black text-yellow-400">4.8</span>
                    </div>
                    <div className="text-xs text-gray-400 font-bold">156 REVIEWS</div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-3 mb-6">
                {hospital.emergency_services && (
                  <div className="flex items-center space-x-2 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl text-sm font-bold">
                    <Shield className="h-4 w-4" />
                    <span>EMERGENCY</span>
                  </div>
                )}
                {hospital.ambulance_services && (
                  <div className="flex items-center space-x-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-xl text-sm font-bold">
                    <Ambulance className="h-4 w-4" />
                    <span>RAPID RESPONSE</span>
                  </div>
                )}
                {hospital.blood_bank && (
                  <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-xl text-sm font-bold">
                    <Heart className="h-4 w-4" />
                    <span>BLOOD VAULT</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 px-4 py-2 rounded-xl text-sm font-bold">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span>24/7 ACTIVE</span>
                </div>
              </div>

              {/* Specializations */}
              {hospital.specializations && hospital.specializations.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-black text-purple-400 mb-3 tracking-wider">SPECIALIZATIONS</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-xl text-xs font-bold"
                      >
                        {spec.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="h-5 w-5 text-cyan-400" />
                  <span className="font-bold">{hospital.profiles?.address || 'ADDRESS NOT PROVIDED'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span className="font-bold">{hospital.profiles?.phone || 'PHONE NOT AVAILABLE'}</span>
                </div>
                {hospital.bed_capacity && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="font-bold">{hospital.bed_capacity} BEDS</span>
                  </div>
                )}
                {hospital.website_url && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Globe className="h-5 w-5 text-purple-400" />
                    <a
                      href={hospital.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 font-bold"
                    >
                      VISIT WEBSITE
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {hospital.description && (
                <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-gray-300 font-medium">{hospital.description}</p>
                </div>
              )}

              {/* Facilities */}
              {hospital.facilities && hospital.facilities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-black text-yellow-400 mb-3 tracking-wider">FACILITIES</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-xl text-xs font-bold"
                      >
                        {facility.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    if (hospital.profiles?.phone) {
                      window.open(`tel:${hospital.profiles.phone}`, '_self');
                    } else {
                      alert('Phone number not available for this hospital.');
                    }
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-2xl hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 font-black border-2 border-green-400 transform hover:scale-105"
                >
                  <Phone className="h-5 w-5" />
                  <span>CONTACT CENTER</span>
                </button>
                <button className="flex-1 px-6 py-4 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded-2xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-black transform hover:scale-105">
                  JOIN NETWORK
                </button>
                <button 
                  onClick={() => {
                    const address = hospital.profiles?.address || hospital.hospital_name;
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Chennai')}`;
                    window.open(url, '_blank');
                  }}
                  className="px-6 py-4 bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-400 rounded-2xl hover:bg-cyan-500/30 transition-all duration-300 font-black transform hover:scale-105"
                >
                  NAVIGATE
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredHospitals.length === 0 && (
          <div className="text-center py-12 bg-gray-800/40 border border-gray-700 rounded-3xl">
            <HospitalIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">
              NO MEDICAL CENTERS FOUND
            </h3>
            <p className="text-gray-400 font-bold">
              {searchQuery || filters.type || filters.specialization || filters.services.length > 0
                ? 'ADJUST SEARCH PARAMETERS OR FILTERS'
                : 'NO VERIFIED CENTERS AVAILABLE IN NETWORK'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hospitals;