import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Video, ExternalLink, UserPlus, Plus, X, Cpu, Zap, Target, Database, Shield } from 'lucide-react';
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
      
      fetchCampaigns();
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
      webinar: 'bg-blue-500/20 border-blue-500 text-blue-400',
      blood_drive: 'bg-red-500/20 border-red-500 text-red-400',
      yoga_session: 'bg-green-500/20 border-green-500 text-green-400',
      health_checkup: 'bg-purple-500/20 border-purple-500 text-purple-400',
      awareness_talk: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
      community_event: 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 border-gray-500 text-gray-400';
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
        <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* Cyberpunk Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl border border-orange-500/30"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 165, 0, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 165, 0, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}></div>
        <div className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 bg-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative px-4 sm:px-8 py-8 sm:py-12 text-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 border-2 border-orange-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/50">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Cpu className="h-2 w-2 sm:h-3 sm:w-3 text-gray-900" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  HEALTH OPS
                </h1>
                <p className="text-orange-300 text-sm sm:text-lg font-bold tracking-wider">Wellness Campaign Network</p>
              </div>
            </div>
            {profile?.role === 'hospital' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 rounded-xl sm:rounded-2xl hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 font-black text-sm sm:text-base border-2 border-orange-400 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>CREATE CAMPAIGN</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {[
          { id: 'all', label: 'ALL EVENTS' },
          { id: 'webinar', label: 'WEBINARS' },
          { id: 'blood_drive', label: 'BLOOD DRIVES' },
          { id: 'yoga_session', label: 'YOGA SESSIONS' },
          { id: 'health_checkup', label: 'HEALTH CHECKUPS' },
          { id: 'awareness_talk', label: 'AWARENESS TALKS' },
          { id: 'community_event', label: 'COMMUNITY EVENTS' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all duration-300 transform hover:scale-105 border-2 ${
              selectedType === tab.id
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 shadow-xl shadow-orange-500/25 border-orange-400'
                : 'bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700/80 border-gray-600 hover:border-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-gray-800/60 border border-orange-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-orange-500/10 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:scale-105">
            {campaign.is_featured && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 text-xs font-black px-4 py-2 tracking-wider">
                ⭐ FEATURED EVENT
              </div>
            )}
            
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <span className={`px-3 py-1 rounded-xl text-xs font-black border-2 ${getCampaignTypeColor(campaign.campaign_type)}`}>
                  {campaign.campaign_type.replace('_', ' ').toUpperCase()}
                </span>
                {campaign.is_online && (
                  <Video className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 animate-pulse" />
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white mb-2">{campaign.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3 font-medium">{campaign.description}</p>

              <div className="space-y-2 mb-4 sm:mb-6">
                <div className="flex items-center text-xs sm:text-sm text-gray-400">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-cyan-400" />
                  <span className="font-bold">{formatDate(campaign.start_date)}</span>
                </div>
                
                <div className="flex items-center text-xs sm:text-sm text-gray-400">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-400" />
                  <span className="font-bold">{campaign.is_online ? 'ONLINE EVENT' : campaign.location}</span>
                </div>

                {campaign.max_participants && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-400">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-purple-400" />
                    <span className="font-bold">{campaign.registered_count || 0} / {campaign.max_participants} REGISTERED</span>
                  </div>
                )}
              </div>

              {campaign.tags && campaign.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                  {campaign.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700/60 border border-gray-600 text-gray-300 text-xs rounded-lg font-bold">
                      #{tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                <div className="text-xs sm:text-sm text-gray-400 font-bold">
                  CONTACT: {campaign.contact_person}
                </div>
                
                {campaign.is_registered ? (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs sm:text-sm font-black rounded-lg text-center">
                    REGISTERED ✓
                  </span>
                ) : (
                  <button
                    onClick={() => registerForCampaign(campaign.id)}
                    className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 text-xs sm:text-sm font-black rounded-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 border-2 border-orange-400 transform hover:scale-105"
                  >
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>REGISTER</span>
                  </button>
                )}
              </div>

              {campaign.is_online && campaign.meeting_link && campaign.is_registered && (
                <div className="pt-3 border-t border-gray-700">
                  <a
                    href={campaign.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>JOIN MEETING</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-gray-800/40 border border-gray-700 rounded-2xl sm:rounded-3xl">
          <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-black text-white mb-2">
            NO CAMPAIGNS FOUND
          </h3>
          <p className="text-gray-400 font-bold px-4">
            Check back later for upcoming health awareness campaigns and events.
          </p>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateForm && profile?.role === 'hospital' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border-2 border-orange-500 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-orange-400">CREATE HEALTH CAMPAIGN</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 border-2 border-red-400 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <form onSubmit={createCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-orange-400 mb-2 tracking-wider">CAMPAIGN TITLE</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-orange-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/25 focus:border-orange-500 font-bold"
                    placeholder="Enter campaign title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-cyan-400 mb-2 tracking-wider">DESCRIPTION</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-cyan-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/25 focus:border-cyan-500 font-bold resize-none"
                    placeholder="Describe your campaign"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-purple-400 mb-2 tracking-wider">CAMPAIGN TYPE</label>
                    <select
                      value={formData.campaign_type}
                      onChange={(e) => setFormData({...formData, campaign_type: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-500/25 focus:border-purple-500 font-bold"
                    >
                      <option value="awareness_talk">AWARENESS TALK</option>
                      <option value="webinar">WEBINAR</option>
                      <option value="blood_drive">BLOOD DRIVE</option>
                      <option value="health_checkup">HEALTH CHECKUP</option>
                      <option value="yoga_session">YOGA SESSION</option>
                      <option value="community_event">COMMUNITY EVENT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">MAX PARTICIPANTS</label>
                    <input
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-green-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 font-bold"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-blue-400 mb-2 tracking-wider">START DATE & TIME</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-indigo-400 mb-2 tracking-wider">END DATE & TIME</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 focus:border-indigo-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="is_online"
                      checked={formData.is_online}
                      onChange={(e) => setFormData({...formData, is_online: e.target.checked})}
                      className="w-4 h-4 rounded border-2 border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500/25"
                    />
                    <label htmlFor="is_online" className="text-sm font-black text-yellow-400 tracking-wider">ONLINE EVENT</label>
                  </div>
                </div>

                {formData.is_online ? (
                  <div>
                    <label className="block text-sm font-black text-pink-400 mb-2 tracking-wider">MEETING LINK</label>
                    <input
                      type="url"
                      value={formData.meeting_link}
                      onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-pink-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-500/25 focus:border-pink-500 font-bold"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-black text-teal-400 mb-2 tracking-wider">LOCATION</label>
                    <input
                      type="text"
                      required={!formData.is_online}
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-teal-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-teal-500/25 focus:border-teal-500 font-bold"
                      placeholder="Enter venue address"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-red-400 mb-2 tracking-wider">CONTACT PERSON</label>
                    <input
                      type="text"
                      required
                      value={formData.contact_person}
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-red-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-500/25 focus:border-red-500 font-bold"
                      placeholder="Contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-lime-400 mb-2 tracking-wider">CONTACT PHONE</label>
                    <input
                      type="tel"
                      required
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-lime-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-lime-500/25 focus:border-lime-500 font-bold"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-amber-400 mb-2 tracking-wider">TAGS (COMMA-SEPARATED)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-amber-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-amber-500/25 focus:border-amber-500 font-bold"
                    placeholder="health, awareness, community"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 text-gray-300 bg-gray-700 border-2 border-gray-600 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-black"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 rounded-xl hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 font-black border-2 border-orange-400 transform hover:scale-105"
                  >
                    CREATE CAMPAIGN
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