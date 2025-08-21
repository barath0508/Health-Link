import React, { useState, useEffect } from 'react';
import { 
  HandHeart, 
  Target, 
  Clock, 
  Users, 
  FileText, 
  CreditCard,
  Heart,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { supabase, AssistanceRequest } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const Assistance: React.FC = () => {
  const { profile } = useAuth();
  const [activeView, setActiveView] = useState<'browse' | 'create'>('browse');
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'active',
    category: '',
    urgency: '',
  });

  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    patient_name: '',
    patient_age: '',
    medical_condition: '',
    hospital_name: '',
    treatment_details: '',
    target_amount: '',
    deadline_date: '',
  });

  useEffect(() => {
    fetchAssistanceRequests();
  }, [filters]);

  const fetchAssistanceRequests = async () => {
    try {
      let query = supabase
        .from('assistance_requests')
        .select(`
          *,
          profiles (full_name, phone, city)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching assistance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('assistance_requests')
        .insert([
          {
            requester_id: profile.id,
            title: requestForm.title,
            description: requestForm.description,
            patient_name: requestForm.patient_name,
            patient_age: requestForm.patient_age ? parseInt(requestForm.patient_age) : null,
            medical_condition: requestForm.medical_condition,
            hospital_name: requestForm.hospital_name,
            treatment_details: requestForm.treatment_details,
            target_amount: parseFloat(requestForm.target_amount),
            deadline_date: requestForm.deadline_date,
          },
        ]);

      if (error) throw error;

      alert('Assistance request created successfully!');
      setRequestForm({
        title: '',
        description: '',
        patient_name: '',
        patient_age: '',
        medical_condition: '',
        hospital_name: '',
        treatment_details: '',
        target_amount: '',
        deadline_date: '',
      });
      setActiveView('browse');
      fetchAssistanceRequests();
    } catch (error) {
      console.error('Error creating assistance request:', error);
      alert('Error creating request. Please try again.');
    }
  };

  const calculateProgress = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  const getUrgencyColor = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 7) return 'text-red-600 bg-red-50';
    if (daysLeft <= 30) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <HandHeart className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Medical Assistance</h1>
            <p className="text-green-100">Community support for medical treatments</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{requests.length}</div>
            <div className="text-green-100">Active Cases</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              ₹{requests.reduce((sum, req) => sum + req.raised_amount, 0).toLocaleString()}
            </div>
            <div className="text-green-100">Total Raised</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-green-100">Donors</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">86%</div>
            <div className="text-green-100">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveView('browse')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeView === 'browse'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Browse Cases
        </button>
        <button
          onClick={() => setActiveView('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeView === 'create'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Request Assistance
        </button>
      </div>

      {/* Browse Cases */}
      {activeView === 'browse' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="verified">Verified</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="surgery">Surgery</option>
                  <option value="cancer">Cancer Treatment</option>
                  <option value="emergency">Emergency</option>
                  <option value="chronic">Chronic Disease</option>
                  <option value="transplant">Organ Transplant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={filters.urgency}
                  onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Urgencies</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cases Grid */}
          <div className="grid gap-6">
            {requests.map((request) => {
              const progress = calculateProgress(request.raised_amount, request.target_amount);
              const remaining = request.target_amount - request.raised_amount;

              return (
                <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-xl">
                          <HandHeart className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {request.title}
                          </h3>
                          <p className="text-gray-600">
                            Patient: {request.patient_name}
                            {request.patient_age && ` (${request.patient_age} years)`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {request.is_verified && (
                          <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                            <CheckCircle className="h-3 w-3" />
                            <span>Verified</span>
                          </div>
                        )}
                        {request.deadline_date && (
                          <div className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(request.deadline_date)}`}>
                            {Math.ceil((new Date(request.deadline_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medical Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-medium text-blue-900 mb-1">Medical Condition</h4>
                        <p className="text-sm text-blue-800">{request.medical_condition}</p>
                      </div>
                      {request.hospital_name && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 mb-1">Hospital</h4>
                          <p className="text-sm text-gray-700">{request.hospital_name}</p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {request.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            ₹{request.raised_amount.toLocaleString()} raised of ₹{request.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>₹{remaining.toLocaleString()} remaining</span>
                        <span>127 donors</span>
                      </div>
                    </div>

                    {/* Treatment Details */}
                    {request.treatment_details && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                        <h4 className="font-medium text-yellow-900 mb-1">Treatment Details</h4>
                        <p className="text-sm text-yellow-800">{request.treatment_details}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        <CreditCard className="h-4 w-4" />
                        <span>Donate Now</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="h-4 w-4" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {requests.length === 0 && (
              <div className="text-center py-12">
                <HandHeart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No assistance requests found
                </h3>
                <p className="text-gray-600">
                  Be the first to create a request and get community support.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Request */}
      {activeView === 'create' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <HandHeart className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Request Medical Assistance
              </h2>
              <p className="text-gray-600">
                Get support from the community for medical treatments
              </p>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief title for your assistance request"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={requestForm.patient_name}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, patient_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Age
                  </label>
                  <input
                    type="number"
                    value={requestForm.patient_age}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, patient_age: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Condition *
                </label>
                <input
                  type="text"
                  value={requestForm.medical_condition}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, medical_condition: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Heart Surgery, Cancer Treatment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Provide detailed information about the medical condition and why assistance is needed..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name
                  </label>
                  <input
                    type="text"
                    value={requestForm.hospital_name}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, hospital_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={requestForm.target_amount}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, target_amount: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment Details
                </label>
                <textarea
                  value={requestForm.treatment_details}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, treatment_details: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Specific details about the treatment plan, surgeries, medications, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline Date
                </label>
                <input
                  type="date"
                  value={requestForm.deadline_date}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, deadline_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Verification Process
                </h4>
                <p className="text-sm text-blue-800">
                  All assistance requests are reviewed by our verification team. You'll need to provide:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Medical reports and doctor's prescription</li>
                  <li>• Hospital bills and treatment estimates</li>
                  <li>• Identity verification documents</li>
                  <li>• Bank account details for fund transfer</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Submit Assistance Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistance;