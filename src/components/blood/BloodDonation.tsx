import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Phone, Mail, Plus, Search, Filter, Clock, Award, Droplets, Zap, Shield, Target, Database, Cpu } from 'lucide-react';
import { supabase, BloodDonor, BloodRequest } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const BloodDonation: React.FC = () => {
  const { profile } = useAuth();
  const [activeView, setActiveView] = useState<'requests' | 'donors' | 'register'>('requests');
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    bloodGroup: '',
    urgency: '',
    location: '',
  });

  const [donorForm, setDonorForm] = useState({
    blood_group: '',
    weight: '',
    medical_conditions: '',
    preferred_contact: 'phone' as const,
  });

  const [requestForm, setRequestForm] = useState({
    patient_name: '',
    blood_group: '',
    units_needed: 1,
    urgency_level: 'medium' as const,
    hospital_name: '',
    hospital_address: '',
    contact_person: '',
    contact_phone: '',
    required_by: '',
    additional_notes: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'low', label: 'LOW', color: 'bg-green-500/20 border-green-500 text-green-400' },
    { value: 'medium', label: 'MEDIUM', color: 'bg-yellow-500/20 border-yellow-500 text-yellow-400' },
    { value: 'high', label: 'HIGH', color: 'bg-orange-500/20 border-orange-500 text-orange-400' },
    { value: 'critical', label: 'CRITICAL', color: 'bg-red-500/20 border-red-500 text-red-400' },
  ];

  useEffect(() => {
    fetchBloodRequests();
    fetchBloodDonors();
  }, []);

  const fetchBloodRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select(`
          *,
          profiles (full_name, phone, city)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBloodRequests(data || []);
    } catch (error) {
      console.error('Error fetching blood requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_donors')
        .select(`
          *,
          profiles (full_name, phone, city, email)
        `)
        .eq('is_available', true)
        .order('donation_count', { ascending: false });

      if (error) throw error;
      setBloodDonors(data || []);
    } catch (error) {
      console.error('Error fetching blood donors:', error);
    }
  };

  const handleDonorRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('blood_donors')
        .insert([
          {
            user_id: profile.id,
            blood_group: donorForm.blood_group,
            weight: parseFloat(donorForm.weight),
            medical_conditions: donorForm.medical_conditions,
            preferred_contact: donorForm.preferred_contact,
          },
        ]);

      if (error) throw error;

      alert('Donor registration successful!');
      setDonorForm({
        blood_group: '',
        weight: '',
        medical_conditions: '',
        preferred_contact: 'phone',
      });
      fetchBloodDonors();
    } catch (error) {
      console.error('Error registering donor:', error);
      alert('Error registering as donor. Please try again.');
    }
  };

  const handleRequestSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('blood_requests')
        .insert([
          {
            requester_id: profile.id,
            ...requestForm,
          },
        ]);

      if (error) throw error;

      alert('Blood request submitted successfully!');
      setRequestForm({
        patient_name: '',
        blood_group: '',
        units_needed: 1,
        urgency_level: 'medium',
        hospital_name: '',
        hospital_address: '',
        contact_person: '',
        contact_phone: '',
        required_by: '',
        additional_notes: '',
      });
      fetchBloodRequests();
    } catch (error) {
      console.error('Error submitting blood request:', error);
      alert('Error submitting request. Please try again.');
    }
  };

  const filteredRequests = bloodRequests.filter((request) => {
    return (
      (!searchFilters.bloodGroup || request.blood_group === searchFilters.bloodGroup) &&
      (!searchFilters.urgency || request.urgency_level === searchFilters.urgency) &&
      (!searchFilters.location || 
        request.hospital_address.toLowerCase().includes(searchFilters.location.toLowerCase()))
    );
  });

  const filteredDonors = bloodDonors.filter((donor) => {
    return (
      (!searchFilters.bloodGroup || donor.blood_group === searchFilters.bloodGroup) &&
      (!searchFilters.location || 
        donor.profiles?.city?.toLowerCase().includes(searchFilters.location.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Cyberpunk Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-red-500/30"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 0, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 0, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative px-8 py-12 text-white">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-800 border-2 border-red-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/50">
                <Droplets className="h-8 w-8 text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="h-3 w-3 text-gray-900" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                BLOOD NET
              </h1>
              <p className="text-red-300 text-lg font-bold tracking-wider">Life Support Network System</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-800/40 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-red-400 animate-pulse" />
                <div>
                  <p className="text-2xl font-black text-red-400">{bloodRequests.length}</p>
                  <p className="text-sm text-gray-300 font-bold">ACTIVE REQUESTS</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-green-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-400 animate-pulse" />
                <div>
                  <p className="text-2xl font-black text-green-400">{bloodDonors.length}</p>
                  <p className="text-sm text-gray-300 font-bold">ACTIVE DONORS</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-cyan-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-cyan-400 animate-pulse" />
                <div>
                  <p className="text-2xl font-black text-cyan-400">500+</p>
                  <p className="text-sm text-gray-300 font-bold">LIVES SAVED</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cyberpunk Navigation */}
      <div className="flex space-x-2 bg-gray-800/60 border border-gray-700 rounded-2xl p-2 shadow-2xl">
        {[
          { id: 'requests', label: 'BLOOD REQUESTS', icon: Target },
          { id: 'donors', label: 'DONOR NETWORK', icon: Shield },
          { id: 'register', label: 'JOIN NETWORK', icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-black transition-all duration-300 transform hover:scale-105 border ${
                isActive
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-gray-900 shadow-xl shadow-red-500/25 border-red-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/80 border-gray-600 hover:border-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Interface */}
      {(activeView === 'requests' || activeView === 'donors') && (
        <div className="bg-gray-800/60 border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/10 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-black text-cyan-400 mb-2 tracking-wider">
                BLOOD TYPE
              </label>
              <select
                value={searchFilters.bloodGroup}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, bloodGroup: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/25 focus:border-cyan-500 font-bold"
              >
                <option value="">ALL TYPES</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {activeView === 'requests' && (
              <div>
                <label className="block text-sm font-black text-red-400 mb-2 tracking-wider">
                  THREAT LEVEL
                </label>
                <select
                  value={searchFilters.urgency}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-red-400 focus:outline-none focus:ring-4 focus:ring-red-500/25 focus:border-red-500 font-bold"
                >
                  <option value="">ALL LEVELS</option>
                  {urgencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-black text-purple-400 mb-2 tracking-wider">
                LOCATION
              </label>
              <input
                type="text"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter sector..."
                className="w-full px-3 py-2 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-purple-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/25 focus:border-purple-500 font-bold"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setSearchFilters({ bloodGroup: '', urgency: '', location: '' })}
                className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-bold tracking-wider"
              >
                CLEAR FILTERS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blood Requests View */}
      {activeView === 'requests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white">ACTIVE BLOOD REQUESTS</h2>
            <button
              onClick={() => setActiveView('register')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-gray-900 rounded-xl hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 font-black border-2 border-red-400 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>NEW REQUEST</span>
            </button>
          </div>

          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-gray-800/60 border border-red-500/30 rounded-3xl shadow-2xl shadow-red-500/10 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-2xl flex items-center justify-center">
                      <Heart className="h-8 w-8 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {request.patient_name}
                      </h3>
                      <p className="text-gray-400 font-bold">
                        REQUIRES {request.units_needed} UNIT(S) OF {request.blood_group} BLOOD
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-xl text-sm font-black border-2 ${
                      urgencyLevels.find(u => u.value === request.urgency_level)?.color
                    }`}>
                      {urgencyLevels.find(u => u.value === request.urgency_level)?.label}
                    </span>
                    <span className="text-3xl font-black text-red-400 bg-gray-900/60 px-4 py-2 rounded-xl border-2 border-red-500/50">
                      {request.blood_group}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    <span className="font-bold">{request.hospital_name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Clock className="h-5 w-5 text-yellow-400" />
                    <span className="font-bold">
                      REQUIRED BY: {new Date(request.required_by).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Phone className="h-5 w-5 text-green-400" />
                    <span className="font-bold">{request.contact_phone}</span>
                  </div>
                  <div className="text-gray-300 font-bold">
                    CONTACT: {request.contact_person}
                  </div>
                </div>

                {request.additional_notes && (
                  <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-4 mb-6">
                    <p className="text-gray-300 font-medium">{request.additional_notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button 
                    onClick={() => window.open(`tel:${request.contact_phone}`, '_self')}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-xl hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 font-black border-2 border-green-400 transform hover:scale-105"
                  >
                    <Phone className="h-5 w-5" />
                    <span>CALL NOW</span>
                  </button>
                  <button 
                    onClick={() => {
                      const message = `Hi, I saw your blood request for ${request.patient_name} (${request.blood_group}). I would like to help.`;
                      window.open(`sms:${request.contact_phone}?body=${encodeURIComponent(message)}`, '_self');
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-black transform hover:scale-105"
                  >
                    <Mail className="h-5 w-5" />
                    <span>MESSAGE</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="text-center py-12 bg-gray-800/40 border border-gray-700 rounded-3xl">
                <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-black text-white mb-2">
                  NO BLOOD REQUESTS FOUND
                </h3>
                <p className="text-gray-400 font-bold">
                  {searchFilters.bloodGroup || searchFilters.urgency || searchFilters.location
                    ? 'ADJUST FILTERS TO SEE MORE RESULTS'
                    : 'BE THE FIRST TO JOIN THE NETWORK'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blood Donors View */}
      {activeView === 'donors' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white">DONOR NETWORK</h2>
            <button
              onClick={() => setActiveView('register')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-xl hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 font-black border-2 border-green-400 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>JOIN NETWORK</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor) => (
              <div key={donor.id} className="bg-gray-800/60 border border-green-500/30 rounded-3xl shadow-2xl shadow-green-500/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500/20 border-2 border-green-500 rounded-2xl flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-white">
                        {donor.profiles?.full_name}
                      </h3>
                      <p className="text-sm text-gray-400 font-bold">{donor.profiles?.city}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-green-400 bg-gray-900/60 px-3 py-1 rounded-xl border-2 border-green-500/50">
                    {donor.blood_group}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Award className="h-5 w-5 text-cyan-400" />
                    <span className="font-bold">
                      {donor.donation_count} DONATIONS
                    </span>
                  </div>
                  
                  {donor.last_donated_date && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <span className="font-bold">
                        LAST: {new Date(donor.last_donated_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 text-gray-300">
                    {donor.preferred_contact === 'phone' || donor.preferred_contact === 'both' ? (
                      <Phone className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Mail className="h-5 w-5 text-purple-400" />
                    )}
                    <span className="font-bold">
                      CONTACT: {donor.preferred_contact.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => window.open(`tel:${donor.profiles?.phone}`, '_self')}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-xl hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 font-black border-2 border-green-400 transform hover:scale-105"
                  >
                    <Phone className="h-4 w-4" />
                    <span>CALL</span>
                  </button>
                  <button 
                    onClick={() => {
                      const message = `Hi, I need ${donor.blood_group} blood. Can you help?`;
                      window.open(`sms:${donor.profiles?.phone}?body=${encodeURIComponent(message)}`, '_self');
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-black transform hover:scale-105"
                  >
                    <Mail className="h-4 w-4" />
                    <span>MSG</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredDonors.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-800/40 border border-gray-700 rounded-3xl">
                <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-black text-white mb-2">
                  NO DONORS FOUND
                </h3>
                <p className="text-gray-400 font-bold">
                  {searchFilters.bloodGroup || searchFilters.location
                    ? 'ADJUST FILTERS TO FIND MORE DONORS'
                    : 'BE THE FIRST TO JOIN THE NETWORK'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register Interface */}
      {activeView === 'register' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/60 border border-green-500/30 rounded-3xl shadow-2xl shadow-green-500/10 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <Heart className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">
                JOIN THE NETWORK
              </h2>
              <p className="text-gray-400 font-bold text-lg">
                Register as a blood donor and become a life saver
              </p>
            </div>

            <form onSubmit={handleDonorRegistration} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-red-400 mb-2 tracking-wider">
                    BLOOD TYPE *
                  </label>
                  <select
                    value={donorForm.blood_group}
                    onChange={(e) => setDonorForm(prev => ({ ...prev, blood_group: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-red-400 focus:outline-none focus:ring-4 focus:ring-red-500/25 focus:border-red-500 font-bold"
                  >
                    <option value="">SELECT TYPE</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-cyan-400 mb-2 tracking-wider">
                    WEIGHT (KG) *
                  </label>
                  <input
                    type="number"
                    value={donorForm.weight}
                    onChange={(e) => setDonorForm(prev => ({ ...prev, weight: e.target.value }))}
                    required
                    min="45"
                    className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-cyan-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/25 focus:border-cyan-500 font-bold"
                    placeholder="Enter weight"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-bold">
                    MINIMUM: 45 KG
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-purple-400 mb-2 tracking-wider">
                  CONTACT METHOD
                </label>
                <select
                  value={donorForm.preferred_contact}
                  onChange={(e) => setDonorForm(prev => ({ ...prev, preferred_contact: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-500/25 focus:border-purple-500 font-bold"
                >
                  <option value="phone">PHONE</option>
                  <option value="email">EMAIL</option>
                  <option value="both">BOTH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-yellow-400 mb-2 tracking-wider">
                  MEDICAL CONDITIONS
                </label>
                <textarea
                  value={donorForm.medical_conditions}
                  onChange={(e) => setDonorForm(prev => ({ ...prev, medical_conditions: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-yellow-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/25 focus:border-yellow-500 font-bold resize-none"
                  placeholder="List any medical conditions..."
                />
              </div>

              <div className="bg-gray-900/60 border border-blue-500/50 rounded-2xl p-6">
                <h4 className="font-black text-blue-400 mb-4 tracking-wider">
                  ELIGIBILITY REQUIREMENTS
                </h4>
                <ul className="text-sm text-blue-300 space-y-2 font-bold">
                  <li>• AGE: 18-65 YEARS</li>
                  <li>• WEIGHT: MINIMUM 45 KG</li>
                  <li>• HEMOGLOBIN: MINIMUM 12.5 G/DL</li>
                  <li>• NO INFECTIOUS DISEASES</li>
                  <li>• 3 MONTH GAP BETWEEN DONATIONS</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 border-2 border-green-400 transform hover:scale-105 tracking-wider"
              >
                JOIN BLOOD NETWORK
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 font-bold">
                ALREADY REGISTERED?{' '}
                <button
                  onClick={() => setActiveView('donors')}
                  className="text-green-400 hover:text-green-300 font-black"
                >
                  VIEW NETWORK
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonation;