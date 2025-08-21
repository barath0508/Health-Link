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
  X
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
    { value: 'hospital', label: 'Hospitals', icon: Heart, color: 'bg-red-100 text-red-700', urgency: 'critical' },
    { value: 'ambulance', label: 'Ambulance', icon: Ambulance, color: 'bg-blue-100 text-blue-700', urgency: 'critical' },
    { value: 'police', label: 'Police', icon: Shield, color: 'bg-indigo-100 text-indigo-700', urgency: 'high' },
    { value: 'fire', label: 'Fire Department', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700', urgency: 'critical' },
    { value: 'poison_control', label: 'Poison Control', icon: Phone, color: 'bg-green-100 text-green-700', urgency: 'critical' },
    { value: 'other', label: 'Other Services', icon: Phone, color: 'bg-gray-100 text-gray-700', urgency: 'medium' },
  ];

  const quickDialNumbers = [
    { name: 'Emergency Services', number: '112', description: 'All emergency services' },
    { name: 'Police', number: '100', description: 'Police emergency' },
    { name: 'Fire', number: '101', description: 'Fire emergency' },
    { name: 'Ambulance', number: '108', description: 'Medical emergency' },
    { name: 'Women Helpline', number: '1091', description: 'Women in distress' },
    { name: 'Child Helpline', number: '1098', description: 'Child emergency' },
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Phone className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Emergency Services</h1>
            <p className="text-red-100">Quick access to emergency contacts and services</p>
          </div>
        </div>
        
        {/* Quick Dial */}
        <div className="bg-white/20 rounded-xl p-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Quick Dial Emergency Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickDialNumbers.map((emergency) => (
              <button
                key={emergency.number}
                onClick={() => handleCall(emergency.number)}
                className="bg-white/20 hover:bg-white/30 rounded-lg p-3 text-center transition-colors"
              >
                <div className="text-xl font-bold">{emergency.number}</div>
                <div className="text-xs">{emergency.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Emergency Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setSelectedCategory('')}
            className={`p-4 rounded-lg text-center transition-colors ${
              selectedCategory === ''
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Phone className="h-6 w-6 mx-auto mb-2" />
            <div className="text-sm font-medium">All Services</div>
          </button>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`p-4 rounded-lg text-center transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-gray-900 text-white'
                    : `${category.color} hover:opacity-80`
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">{category.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emergency services by name, location, or service type..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Emergency Contacts List */}
      <div className="grid gap-4">
        {filteredContacts.map((contact) => {
          const category = categories.find(c => c.value === contact.category);
          const Icon = category?.icon || Phone;
          const distance = userLocation && contact.latitude && contact.longitude
            ? calculateDistance(userLocation.lat, userLocation.lng, contact.latitude, contact.longitude)
            : null;

          return (
            <div key={contact.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${category?.color || 'bg-gray-100 text-gray-700'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {contact.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{contact.city}, {contact.state}</span>
                      </div>
                      {distance && (
                        <div className="flex items-center space-x-1">
                          <Navigation className="h-4 w-4" />
                          <span>{distance.toFixed(1)} km away</span>
                        </div>
                      )}
                      {contact.is_24x7 && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Clock className="h-4 w-4" />
                          <span>24/7 Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {contact.phone_number}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {contact.category.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {contact.address && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span>{contact.address}</span>
                  </div>
                </div>
              )}

              {/* Services */}
              {contact.services && contact.services.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {contact.services.map((service) => (
                      <span
                        key={service}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleCall(contact.phone_number)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Now</span>
                </button>
                <button
                  onClick={() => handleGetDirections(contact)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Directions</span>
                </button>
                <button 
                  onClick={() => handleShowDetails(contact)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Phone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No emergency contacts found
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory
                ? 'Try adjusting your search criteria or category filter.'
                : 'Emergency contacts will be displayed here when available.'}
            </p>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedContact.name}</h3>
                  <p className="text-gray-600 capitalize">{selectedContact.category.replace('_', ' ')} Service</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedContact.phone_number}</span>
                      </div>
                      {selectedContact.address && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span>{selectedContact.address}, {selectedContact.city}, {selectedContact.state}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{selectedContact.is_24x7 ? '24/7 Available' : 'Limited Hours'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedContact.services && selectedContact.services.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Services Offered</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedContact.services.map((service) => (
                          <span
                            key={service}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleCall(selectedContact.phone_number)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Now</span>
                  </button>
                  <button
                    onClick={() => handleGetDirections(selectedContact)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-900">Emergency Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
          <div>
            <h4 className="font-medium mb-2">Before Calling Emergency Services:</h4>
            <ul className="space-y-1">
              <li>• Stay calm and speak clearly</li>
              <li>• Know your exact location</li>
              <li>• Describe the emergency briefly</li>
              <li>• Follow the operator's instructions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Medical Emergency Checklist:</h4>
            <ul className="space-y-1">
              <li>• Check if person is conscious</li>
              <li>• Look for medical alert bracelets</li>
              <li>• Don't move injured person unless necessary</li>
              <li>• Apply pressure to bleeding wounds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;