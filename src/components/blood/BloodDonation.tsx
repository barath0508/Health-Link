import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Phone, Mail, Plus, Search, Filter, Clock, Award } from 'lucide-react';
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
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Heart className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Blood Donation Network</h1>
            <p className="text-red-100">Connecting life savers with those in need</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{bloodRequests.length}</div>
            <div className="text-red-100">Active Requests</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{bloodDonors.length}</div>
            <div className="text-red-100">Available Donors</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">500+</div>
            <div className="text-red-100">Lives Saved</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'requests', label: 'Blood Requests' },
          { id: 'donors', label: 'Find Donors' },
          { id: 'register', label: 'Register as Donor' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === tab.id
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      {(activeView === 'requests' || activeView === 'donors') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group
              </label>
              <select
                value={searchFilters.bloodGroup}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, bloodGroup: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Blood Groups</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {activeView === 'requests' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={searchFilters.urgency}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Urgencies</option>
                  {urgencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter city or area"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setSearchFilters({ bloodGroup: '', urgency: '', location: '' })}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blood Requests View */}
      {activeView === 'requests' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Active Blood Requests</h2>
            <button
              onClick={() => setActiveView('register')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Request</span>
            </button>
          </div>

          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.patient_name}
                      </h3>
                      <p className="text-gray-600">
                        Needs {request.units_needed} unit(s) of {request.blood_group} blood
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      urgencyLevels.find(u => u.value === request.urgency_level)?.color
                    }`}>
                      {urgencyLevels.find(u => u.value === request.urgency_level)?.label}
                    </span>
                    <span className="text-xl font-bold text-red-600">
                      {request.blood_group}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{request.hospital_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Required by: {new Date(request.required_by).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{request.contact_phone}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Contact: {request.contact_person}
                  </div>
                </div>

                {request.additional_notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">{request.additional_notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => window.open(`tel:${request.contact_phone}`, '_self')}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Now</span>
                  </button>
                  <button 
                    onClick={() => {
                      const message = `Hi, I saw your blood request for ${request.patient_name} (${request.blood_group}). I would like to help.`;
                      window.open(`sms:${request.contact_phone}?body=${encodeURIComponent(message)}`, '_self');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>SMS</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No blood requests found
                </h3>
                <p className="text-gray-600">
                  {searchFilters.bloodGroup || searchFilters.urgency || searchFilters.location
                    ? 'Try adjusting your filters to see more results.'
                    : 'Be the first to register as a donor and help save lives.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blood Donors View */}
      {activeView === 'donors' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Available Blood Donors</h2>
            <button
              onClick={() => setActiveView('register')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Become a Donor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor) => (
              <div key={donor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {donor.profiles?.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">{donor.profiles?.city}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {donor.blood_group}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">
                      {donor.donation_count} donation(s)
                    </span>
                  </div>
                  
                  {donor.last_donated_date && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        Last donated: {new Date(donor.last_donated_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-gray-600">
                    {donor.preferred_contact === 'phone' || donor.preferred_contact === 'both' ? (
                      <Phone className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      Contact via {donor.preferred_contact}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => window.open(`tel:${donor.profiles?.phone}`, '_self')}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </button>
                  <button 
                    onClick={() => {
                      const message = `Hi, I need ${donor.blood_group} blood. Can you help?`;
                      window.open(`sms:${donor.profiles?.phone}?body=${encodeURIComponent(message)}`, '_self');
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>SMS</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredDonors.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No donors found
                </h3>
                <p className="text-gray-600">
                  {searchFilters.bloodGroup || searchFilters.location
                    ? 'Try adjusting your filters to find more donors.'
                    : 'Be the first to register as a donor in your area.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register as Donor View */}
      {activeView === 'register' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Become a Life Saver
              </h2>
              <p className="text-gray-600">
                Register as a blood donor and help save lives in your community
              </p>
            </div>

            <form onSubmit={handleDonorRegistration} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group *
                  </label>
                  <select
                    value={donorForm.blood_group}
                    onChange={(e) => setDonorForm(prev => ({ ...prev, blood_group: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={donorForm.weight}
                    onChange={(e) => setDonorForm(prev => ({ ...prev, weight: e.target.value }))}
                    required
                    min="45"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your weight"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum weight requirement: 45 kg
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <select
                  value={donorForm.preferred_contact}
                  onChange={(e) => setDonorForm(prev => ({ ...prev, preferred_contact: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="both">Both Phone & Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions (if any)
                </label>
                <textarea
                  value={donorForm.medical_conditions}
                  onChange={(e) => setDonorForm(prev => ({ ...prev, medical_conditions: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Please mention any medical conditions that might affect blood donation"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Blood Donation Eligibility Guidelines
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Age: 18-65 years</li>
                  <li>• Weight: Minimum 45 kg</li>
                  <li>• Hemoglobin: Minimum 12.5 g/dL</li>
                  <li>• Must be free from infectious diseases</li>
                  <li>• Minimum gap of 3 months between donations</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Register as Blood Donor
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already registered?{' '}
                <button
                  onClick={() => setActiveView('donors')}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  View donors list
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