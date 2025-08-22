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
  Calendar,
  Zap,
  Shield
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

      alert('Support request transmitted to network!');
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
      alert('Network error. Retry transmission.');
    }
  };

  const calculateProgress = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  const getUrgencyColor = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 7) return 'text-red-400 bg-red-900/50';
    if (daysLeft <= 30) return 'text-orange-400 bg-orange-900/50';
    return 'text-green-400 bg-green-900/50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-400 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <HandHeart className="h-10 sm:h-12 w-10 sm:w-12" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider">SUPPORT NET</h1>
              <p className="text-green-100 font-bold tracking-wide">Community neural assistance network</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">{requests.length}</div>
              <div className="text-green-100 text-xs sm:text-sm font-bold tracking-wider">ACTIVE CASES</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">
                ₹{requests.reduce((sum, req) => sum + req.raised_amount, 0).toLocaleString()}
              </div>
              <div className="text-green-100 text-xs sm:text-sm font-bold tracking-wider">CREDITS RAISED</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">1,247</div>
              <div className="text-green-100 text-xs sm:text-sm font-bold tracking-wider">SUPPORTERS</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">86%</div>
              <div className="text-green-100 text-xs sm:text-sm font-bold tracking-wider">SUCCESS RATE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 border border-green-500/30">
        <button
          onClick={() => setActiveView('browse')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-black tracking-wider transition-all ${
            activeView === 'browse'
              ? 'bg-green-500 text-black shadow-lg shadow-green-500/25'
              : 'text-green-400 hover:text-green-300'
          }`}
        >
          BROWSE CASES
        </button>
        <button
          onClick={() => setActiveView('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-black tracking-wider transition-all ${
            activeView === 'create'
              ? 'bg-green-500 text-black shadow-lg shadow-green-500/25'
              : 'text-green-400 hover:text-green-300'
          }`}
        >
          REQUEST SUPPORT
        </button>
      </div>

      {/* Browse Cases */}
      {activeView === 'browse' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-green-500/30 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                  STATUS
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="verified">Verified</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                  CATEGORY
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white"
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
                <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                  URGENCY
                </label>
                <select
                  value={filters.urgency}
                  onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white"
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
                <div key={request.id} className="bg-gray-800 rounded-xl shadow-lg border border-green-500/30 overflow-hidden backdrop-blur-sm">
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-4 space-y-4 sm:space-y-0">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/30">
                          <HandHeart className="h-6 sm:h-8 w-6 sm:w-8 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-white mb-1 tracking-wider">
                            {request.title}
                          </h3>
                          <p className="text-green-300 font-bold">
                            Patient: {request.patient_name}
                            {request.patient_age && ` (${request.patient_age} years)`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {request.is_verified && (
                          <div className="flex items-center space-x-1 bg-green-900/50 text-green-400 px-2 py-1 rounded-full text-xs border border-green-500/30">
                            <CheckCircle className="h-3 w-3" />
                            <span className="font-bold tracking-wider">VERIFIED</span>
                          </div>
                        )}
                        {request.deadline_date && (
                          <div className={`px-2 py-1 rounded-full text-xs font-bold tracking-wider border ${getUrgencyColor(request.deadline_date)}`}>
                            {Math.ceil((new Date(request.deadline_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} DAYS LEFT
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medical Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                        <h4 className="font-black text-blue-400 mb-1 tracking-wider">CONDITION</h4>
                        <p className="text-sm text-blue-300">{request.medical_condition}</p>
                      </div>
                      {request.hospital_name && (
                        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-500/30">
                          <h4 className="font-black text-gray-400 mb-1 tracking-wider">MED CENTER</h4>
                          <p className="text-sm text-gray-300">{request.hospital_name}</p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {request.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-black text-white tracking-wider">
                            ₹{request.raised_amount.toLocaleString()} / ₹{request.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-sm font-black text-green-400">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 border border-green-500/30">
                        <div
                          className="bg-gradient-to-r from-green-500 to-teal-400 h-3 rounded-full transition-all duration-300 shadow-lg shadow-green-500/25"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold tracking-wider">
                        <span>₹{remaining.toLocaleString()} REMAINING</span>
                        <span>127 SUPPORTERS</span>
                      </div>
                    </div>

                    {/* Treatment Details */}
                    {request.treatment_details && (
                      <div className="bg-yellow-900/30 rounded-lg p-3 mb-4 border border-yellow-500/30">
                        <h4 className="font-black text-yellow-400 mb-1 tracking-wider">TREATMENT PROTOCOL</h4>
                        <p className="text-sm text-yellow-300">{request.treatment_details}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button 
                        onClick={() => {
                          alert(`Support protocol coming soon! Contact requester directly to help ${request.patient_name}.`);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-400 text-black rounded-lg hover:from-green-400 hover:to-teal-300 transition-all font-black tracking-wider shadow-lg shadow-green-500/25 transform hover:scale-105"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>SUPPORT NOW</span>
                      </button>
                      <button 
                        onClick={() => {
                          const shareText = `Help ${request.patient_name} fight ${request.medical_condition}. Target: ₹${request.target_amount.toLocaleString()}. Every credit counts! #HealthLink #SupportNet`;
                          const shareUrl = window.location.href;
                          
                          if (navigator.share) {
                            navigator.share({
                              title: request.title,
                              text: shareText,
                              url: shareUrl
                            });
                          } else {
                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                            window.open(whatsappUrl, '_blank');
                          }
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all font-black tracking-wider border border-gray-500/30"
                      >
                        <Heart className="h-4 w-4" />
                        <span>SHARE</span>
                      </button>
                      <button 
                        onClick={() => {
                          const details = `
Patient: ${request.patient_name}${request.patient_age ? ` (${request.patient_age} years)` : ''}
Condition: ${request.medical_condition}
Med Center: ${request.hospital_name || 'Not specified'}
Target: ₹${request.target_amount.toLocaleString()}
Raised: ₹${request.raised_amount.toLocaleString()}
Remaining: ₹${(request.target_amount - request.raised_amount).toLocaleString()}
${request.deadline_date ? `Deadline: ${new Date(request.deadline_date).toLocaleDateString()}` : ''}

Description:
${request.description}

${request.treatment_details ? `Treatment Protocol:
${request.treatment_details}` : ''}`;
                          
                          alert(details);
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-500/30 text-gray-300 rounded-lg hover:bg-gray-700 transition-all font-black tracking-wider"
                      >
                        <FileText className="h-4 w-4" />
                        <span>DETAILS</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {requests.length === 0 && (
              <div className="text-center py-12">
                <HandHeart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-black text-white mb-2 tracking-wider">
                  NO SUPPORT REQUESTS FOUND
                </h3>
                <p className="text-gray-400 font-bold">
                  Be the first to create a request and get network support.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Request */}
      {activeView === 'create' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-green-500/30 p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 border border-green-500/30">
                <HandHeart className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-wider">
                REQUEST NETWORK SUPPORT
              </h2>
              <p className="text-green-300 font-bold">
                Get support from the neural community
              </p>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                  CAMPAIGN TITLE *
                </label>
                <input
                  type="text"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                  placeholder="Brief title for your support request"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                    PATIENT ID *
                  </label>
                  <input
                    type="text"
                    value={requestForm.patient_name}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, patient_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                    placeholder="Patient neural ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                    AGE CYCLE
                  </label>
                  <input
                    type="number"
                    value={requestForm.patient_age}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, patient_age: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                    placeholder="Age in cycles"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                  MEDICAL CONDITION *
                </label>
                <input
                  type="text"
                  value={requestForm.medical_condition}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, medical_condition: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                  placeholder="e.g., Neural Surgery, Bio Treatment"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                  DETAILED DESCRIPTION *
                </label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400 resize-none"
                  placeholder="Provide detailed information about the condition and why support is needed..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                    MED CENTER
                  </label>
                  <input
                    type="text"
                    value={requestForm.hospital_name}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, hospital_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                    placeholder="Medical facility name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                    TARGET CREDITS (₹) *
                  </label>
                  <input
                    type="number"
                    value={requestForm.target_amount}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, target_amount: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                    placeholder="Required credits"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                  TREATMENT PROTOCOL
                </label>
                <textarea
                  value={requestForm.treatment_details}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, treatment_details: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400 resize-none"
                  placeholder="Specific details about treatment plan, procedures, medications, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                  DEADLINE DATE
                </label>
                <input
                  type="date"
                  value={requestForm.deadline_date}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, deadline_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white"
                />
              </div>

              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                <h4 className="font-black text-blue-400 mb-2 tracking-wider">
                  VERIFICATION PROTOCOL
                </h4>
                <p className="text-sm text-blue-300 mb-2">
                  All support requests are verified by our neural team. Required data:
                </p>
                <ul className="text-sm text-blue-300 space-y-1">
                  <li>• Medical reports and neural prescriptions</li>
                  <li>• Med center bills and treatment estimates</li>
                  <li>• Identity verification protocols</li>
                  <li>• Credit transfer account details</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-400 text-black rounded-lg font-black tracking-wider hover:from-green-400 hover:to-teal-300 transition-all shadow-lg shadow-green-500/25 transform hover:scale-105"
              >
                TRANSMIT SUPPORT REQUEST
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistance;