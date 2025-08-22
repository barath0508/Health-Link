import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Video, ExternalLink, UserPlus, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Campaign {
  id: string;
  title: string;
  description: string;
  campaign_type: string;
  start_date: string;
  end_date: string;
  location: string;
  is_online: boolean;
  meeting_link?: string;
  max_participants?: number;
  contact_person: string;
  contact_phone: string;
  tags: string[];
  status: string;
  is_featured: boolean;
  registered_count?: number;
  is_registered?: boolean;
}

const Campaigns: React.FC = () => {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campaign_type: 'awareness_talk',
    start_date: '',
    end_date: '',
    location: '',
    is_online: false,
    meeting_link: '',
    max_participants: '',
    contact_person: '',
    contact_phone: '',
    tags: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_registrations(count)
        `)
        .eq('status', 'upcoming')
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Get user registrations
      const { data: userRegistrations } = await supabase
        .from('campaign_registrations')
        .select('campaign_id')
        .eq('user_id', user?.id);

      const registeredCampaignIds = userRegistrations?.map(r => r.campaign_id) || [];

      const campaignsWithRegistration = data?.map(campaign => ({
        ...campaign,
        registered_count: campaign.campaign_registrations?.length || 0,
        is_registered: registeredCampaignIds.includes(campaign.id)
      })) || [];

      setCampaigns(campaignsWithRegistration);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerForCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_registrations')
        .insert({
          campaign_id: campaignId,
          user_id: user?.id,
          payment_status: 'free'
        });

      if (error) throw error;
      
      fetchCampaigns(); // Refresh data
    } catch (error) {
      console.error('Error registering for campaign:', error);
    }
  };

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          ...formData,
          created_by: user?.id,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        });

      if (error) throw error;
      
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        campaign_type: 'awareness_talk',
        start_date: '',
        end_date: '',
        location: '',
        is_online: false,
        meeting_link: '',
        max_participants: '',
        contact_person: '',
        contact_phone: '',
        tags: ''
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const getCampaignTypeColor = (type: string) => {
    const colors = {
      webinar: 'bg-blue-100 text-blue-800',
      blood_drive: 'bg-red-100 text-red-800',
      yoga_session: 'bg-green-100 text-green-800',
      health_checkup: 'bg-purple-100 text-purple-800',
      awareness_talk: 'bg-yellow-100 text-yellow-800',
      community_event: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCampaigns = selectedType === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.campaign_type === selectedType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Health Awareness Campaigns</h1>
            <p className="text-blue-100">Join our community events, webinars, and health drives to promote wellness and awareness</p>
          </div>
          {profile?.role === 'hospital' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'webinar', label: 'Webinars' },
          { id: 'blood_drive', label: 'Blood Drives' },
          { id: 'yoga_session', label: 'Yoga Sessions' },
          { id: 'health_checkup', label: 'Health Checkups' },
          { id: 'awareness_talk', label: 'Awareness Talks' },
          { id: 'community_event', label: 'Community Events' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {campaign.is_featured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-medium px-3 py-1">
                ⭐ Featured Event
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCampaignTypeColor(campaign.campaign_type)}`}>
                  {campaign.campaign_type.replace('_', ' ').toUpperCase()}
                </span>
                {campaign.is_online && (
                  <Video className="h-4 w-4 text-blue-500" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{campaign.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(campaign.start_date)}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {campaign.is_online ? 'Online Event' : campaign.location}
                </div>

                {campaign.max_participants && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {campaign.registered_count || 0} / {campaign.max_participants} registered
                  </div>
                )}
              </div>

              {campaign.tags && campaign.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {campaign.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Contact: {campaign.contact_person}
                </div>
                
                {campaign.is_registered ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                    Registered ✓
                  </span>
                ) : (
                  <button
                    onClick={() => registerForCampaign(campaign.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </button>
                )}
              </div>

              {campaign.is_online && campaign.meeting_link && campaign.is_registered && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a
                    href={campaign.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Join Meeting</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-500">Check back later for upcoming health awareness campaigns and events.</p>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateForm && profile?.role === 'hospital' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Health Campaign</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={createCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter campaign title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your campaign"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                    <select
                      value={formData.campaign_type}
                      onChange={(e) => setFormData({...formData, campaign_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="awareness_talk">Awareness Talk</option>
                      <option value="webinar">Webinar</option>
                      <option value="blood_drive">Blood Drive</option>
                      <option value="health_checkup">Health Checkup</option>
                      <option value="yoga_session">Yoga Session</option>
                      <option value="community_event">Community Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                    <input
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="is_online"
                      checked={formData.is_online}
                      onChange={(e) => setFormData({...formData, is_online: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_online" className="text-sm font-medium text-gray-700">Online Event</label>
                  </div>
                </div>

                {formData.is_online ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                    <input
                      type="url"
                      value={formData.meeting_link}
                      onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      required={!formData.is_online}
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter venue address"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      required
                      value={formData.contact_person}
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="health, awareness, community"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;