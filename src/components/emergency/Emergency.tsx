import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Shield, 
  Ambulance, 
  Heart, 
  AlertTriangle,
  Navigation,
  Search,
  Star,
  ExternalLink,
  X,
  Zap,
  Target,
  Cpu,
  Wifi,
  Database
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmergencyContact {
  id: string;
  name: string;
  category: string;
  phone_number: string;
  address?: string;
  city: string;
  state: string;
  is_24x7: boolean;
  services?: string[];
  latitude?: number;
  longitude?: number;
}

const Emergency: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  const categories = [
    { value: 'hospital', label: 'MED CENTERS', icon: Heart, color: 'bg-red-500/20 border-red-500 text-red-400', urgency: 'critical' },
    { value: 'ambulance', label: 'RAPID RESPONSE', icon: Ambulance, color: 'bg-blue-500/20 border-blue-500 text-blue-400', urgency: 'critical' },
    { value: 'police', label: 'SECURITY', icon: Shield, color: 'bg-indigo-500/20 border-indigo-500 text-indigo-400', urgency: 'high' },
    { value: 'fire', label: 'FIRE CONTROL', icon: AlertTriangle, color: 'bg-orange-500/20 border-orange-500 text-orange-400', urgency: 'critical' },
    { value: 'poison_control', label: 'TOXIN CONTROL', icon: Phone, color: 'bg-green-500/20 border-green-500 text-green-400', urgency: 'critical' },
    { value: 'other', label: 'OTHER SERVICES', icon: Phone, color: 'bg-gray-500/20 border-gray-500 text-gray-400', urgency: 'medium' },
  ];

  const quickDialNumbers = [
    { name: 'ALL SERVICES', number: '112', description: 'Universal emergency' },
    { name: 'SECURITY', number: '100', description: 'Police emergency' },
    { name: 'FIRE CONTROL', number: '101', description: 'Fire emergency' },
    { name: 'MEDICAL', number: '108', description: 'Medical emergency' },
    { name: 'WOMEN HELP', number: '1091', description: 'Women in distress' },
    { name: 'CHILD HELP', number: '1098', description: 'Child emergency' },
  ];

  useEffect(() => {
    fetchEmergencyContacts();
    getUserLocation();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesCategory = !selectedCategory || contact.category === selectedCategory;
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.services?.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (userLocation && a.latitude && a.longitude && b.latitude && b.longitude) {
      const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distanceA - distanceB;
    }
    return 0;
  });

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleGetDirections = (contact: EmergencyContact) => {
    if (contact.latitude && contact.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${contact.latitude},${contact.longitude}`;
      window.open(url, '_blank');
    } else if (contact.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address + ', ' + contact.city)}`;
      window.open(url, '_blank');
    }
  };

  const handleShowDetails = (contact: EmergencyContact) => {
    setSelectedContact(contact);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Cyberpunk Emergency Header */}
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
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-orange-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative px-8 py-12 text-white">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-800 border-2 border-red-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/50">
                <Phone className="h-8 w-8 text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center animate-pulse">
                <Zap className="h-3 w-3 text-gray-900" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                CRISIS MODE
              </h1>
              <p className="text-red-300 text-lg font-bold tracking-wider">Emergency Response Network</p>
            </div>
          </div>
          
          {/* Quick Dial Grid */}
          <div className="bg-gray-800/40 border border-red-500/30 rounded-2xl p-6 mt-8">
            <h2 className="text-xl font-black text-red-400 mb-6 tracking-wider">RAPID DIAL NETWORK</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickDialNumbers.map((emergency) => (
                <button
                  key={emergency.number}
                  onClick={() => handleCall(emergency.number)}
                  className="group bg-gray-900/60 border-2 border-gray-700 hover:border-red-500 rounded-2xl p-4 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                >
                  <div className="text-2xl font-black text-red-400 mb-1">{emergency.number}</div>
                  <div className="text-xs text-gray-300 font-bold">{emergency.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{emergency.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-gray-800/60 border border-orange-500/30 rounded-3xl shadow-2xl shadow-orange-500/10 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="h-6 w-6 text-orange-400" />
          <h2 className="text-xl font-black text-white tracking-wider">EMERGENCY CATEGORIES</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <button
            onClick={() => setSelectedCategory('')}
            className={`p-4 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 border-2 ${
              selectedCategory === ''
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-gray-900 border-orange-400 shadow-xl shadow-orange-500/25'
                : 'bg-gray-700/60 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
            }`}
          >
            <Phone className="h-6 w-6 mx-auto mb-2" />
            <div className="text-sm font-black">ALL SERVICES</div>
          </button>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`p-4 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 border-2 ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-gray-900 border-orange-400 shadow-xl shadow-orange-500/25'
                    : `${category.color} hover:opacity-80`
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-black">{category.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-gray-800/60 border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/10 p-6">
        <div className="relative">
          <Search className="absolute left-6 top-4 h-6 w-6 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emergency services by name, location, or service type..."
            className="w-full pl-16 pr-6 py-4 bg-gray-900/80 border-2 border-gray-700 rounded-2xl text-cyan-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/25 focus:border-cyan-500 font-bold text-lg"
          />
        </div>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="grid gap-6">
        {filteredContacts.map((contact) => {
          const category = categories.find(c => c.value === contact.category);
          const Icon = category?.icon || Phone;
          const distance = userLocation && contact.latitude && contact.longitude
            ? calculateDistance(userLocation.lat, userLocation.lng, contact.latitude, contact.longitude)
            : null;

          return (
            <div key={contact.id} className="bg-gray-800/60 border border-red-500/30 rounded-3xl shadow-2xl shadow-red-500/10 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${category?.color || 'bg-gray-500/20 border-gray-500 text-gray-400'}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">
                      {contact.name}
                    </h3>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <MapPin className="h-4 w-4 text-cyan-400" />
                        <span className="font-bold">{contact.city}, {contact.state}</span>
                      </div>
                      {distance && (
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Navigation className="h-4 w-4 text-green-400" />
                          <span className="font-bold">{distance.toFixed(1)} KM AWAY</span>
                        </div>
                      )}
                      {contact.is_24x7 && (
                        <div className="flex items-center space-x-2 text-green-400">
                          <Clock className="h-4 w-4 animate-pulse" />
                          <span className="font-bold">24/7 ACTIVE</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-red-400 bg-gray-900/60 px-4 py-2 rounded-xl border-2 border-red-500/50">
                      {contact.phone_number}
                    </div>
                    <div className="text-xs text-gray-400 font-bold mt-1 tracking-wider">
                      {contact.category.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {contact.address && (
                <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-4 mb-6">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    <span className="font-bold">{contact.address}</span>
                  </div>
                </div>
              )}

              {/* Services */}
              {contact.services && contact.services.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-black text-blue-400 mb-3 tracking-wider">SERVICES</h4>
                  <div className="flex flex-wrap gap-2">
                    {contact.services.map((service) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-xl text-xs font-bold"
                      >
                        {service.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => handleCall(contact.phone_number)}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-gray-900 rounded-2xl hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 font-black border-2 border-red-400 transform hover:scale-105"
                >
                  <Phone className="h-5 w-5" />
                  <span>CALL NOW</span>
                </button>
                <button
                  onClick={() => handleGetDirections(contact)}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-blue-500/20 border-2 border-blue-500/50 text-blue-400 rounded-2xl hover:bg-blue-500/30 transition-all duration-300 font-black transform hover:scale-105"
                >
                  <Navigation className="h-5 w-5" />
                  <span>NAVIGATE</span>
                </button>
                <button 
                  onClick={() => handleShowDetails(contact)}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded-2xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-black transform hover:scale-105"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>DETAILS</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredContacts.length === 0 && (
          <div className="text-center py-12 bg-gray-800/40 border border-gray-700 rounded-3xl">
            <Phone className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">
              NO EMERGENCY CONTACTS FOUND
            </h3>
            <p className="text-gray-400 font-bold">
              {searchQuery || selectedCategory
                ? 'ADJUST SEARCH CRITERIA OR CATEGORY FILTER'
                : 'EMERGENCY CONTACTS WILL BE DISPLAYED WHEN AVAILABLE'}
            </p>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border-2 border-cyan-500 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-white">CONTACT DETAILS</h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="w-10 h-10 bg-red-500 border-2 border-red-400 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-cyan-400 mb-2">{selectedContact.name}</h3>
                  <p className="text-gray-400 font-bold tracking-wider">{selectedContact.category.replace('_', ' ').toUpperCase()} SERVICE</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-black text-green-400 mb-4 tracking-wider">CONTACT INFORMATION</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-red-400" />
                        <span className="text-white font-bold">{selectedContact.phone_number}</span>
                      </div>
                      {selectedContact.address && (
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-cyan-400 mt-0.5" />
                          <span className="text-white font-bold">{selectedContact.address}, {selectedContact.city}, {selectedContact.state}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-yellow-400" />
                        <span className="text-white font-bold">{selectedContact.is_24x7 ? '24/7 AVAILABLE' : 'LIMITED HOURS'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedContact.services && selectedContact.services.length > 0 && (
                    <div>
                      <h4 className="font-black text-purple-400 mb-4 tracking-wider">SERVICES OFFERED</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedContact.services.map((service) => (
                          <span
                            key={service}
                            className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-xl text-xs font-bold"
                          >
                            {service.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={() => handleCall(selectedContact.phone_number)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-gray-900 rounded-2xl hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 font-black border-2 border-red-400 transform hover:scale-105"
                  >
                    <Phone className="h-5 w-5" />
                    <span>CALL NOW</span>
                  </button>
                  <button
                    onClick={() => handleGetDirections(selectedContact)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-blue-500/20 border-2 border-blue-500/50 text-blue-400 rounded-2xl hover:bg-blue-500/30 transition-all duration-300 font-black transform hover:scale-105"
                  >
                    <Navigation className="h-5 w-5" />
                    <span>GET DIRECTIONS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Protocol */}
      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-3xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-yellow-400 animate-pulse" />
          <h3 className="text-2xl font-black text-yellow-400 tracking-wider">EMERGENCY PROTOCOL</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="font-black text-yellow-300 mb-4 tracking-wider">BEFORE CALLING EMERGENCY SERVICES:</h4>
            <ul className="space-y-2 text-yellow-200 font-bold">
              <li>• STAY CALM AND SPEAK CLEARLY</li>
              <li>• KNOW YOUR EXACT LOCATION</li>
              <li>• DESCRIBE THE EMERGENCY BRIEFLY</li>
              <li>• FOLLOW THE OPERATOR'S INSTRUCTIONS</li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-yellow-300 mb-4 tracking-wider">MEDICAL EMERGENCY CHECKLIST:</h4>
            <ul className="space-y-2 text-yellow-200 font-bold">
              <li>• CHECK IF PERSON IS CONSCIOUS</li>
              <li>• LOOK FOR MEDICAL ALERT BRACELETS</li>
              <li>• DON'T MOVE INJURED PERSON UNLESS NECESSARY</li>
              <li>• APPLY PRESSURE TO BLEEDING WOUNDS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;