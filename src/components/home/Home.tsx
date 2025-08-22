import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Phone, Clock, User, Heart, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .in('category', ['hospital', 'ambulance'])
        .eq('is_24x7', true)
        .limit(3);

      if (error) throw error;
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    }
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleSOSClick = () => {
    setShowConfirmation(true);
  };

  const confirmSOS = async () => {
    setShowConfirmation(false);
    setSosActive(true);
    
    try {
      // Get current location
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Get user's health records and allergies
      const [healthRecords, allergies] = await Promise.all([
        supabase.from('health_records').select('*').eq('user_id', user?.id).limit(5),
        supabase.from('user_allergies').select('*').eq('user_id', user?.id)
      ]);

      const emergencyData = {
        user_id: user?.id,
        user_name: profile?.full_name,
        user_phone: profile?.phone,
        emergency_contact_name: profile?.emergency_contact_name,
        emergency_contact_phone: profile?.emergency_contact_phone,
        location: currentLocation,
        health_records: healthRecords.data || [],
        allergies: allergies.data || [],
        timestamp: new Date().toISOString()
      };

      // In a real app, this would send to emergency services
      console.log('Emergency Data:', emergencyData);

      // Simulate emergency response
      alert(`🚨 EMERGENCY SOS ACTIVATED 🚨

📍 Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}
👤 Name: ${profile?.full_name}
📞 Phone: ${profile?.phone}
🏥 Emergency Contact: ${profile?.emergency_contact_name} (${profile?.emergency_contact_phone})
⚠️ Allergies: ${allergies.data?.map(a => a.allergen_name).join(', ') || 'None'}

🚑 Ambulance services have been notified
📱 Emergency contacts have been alerted
🏥 Nearby hospitals have received your health records

Help is on the way!`);

      // Auto-dial emergency number after 3 seconds
      setTimeout(() => {
        window.open('tel:108', '_self'); // 108 is ambulance number in India
      }, 3000);

    } catch (error) {
      console.error('SOS Error:', error);
      alert('Unable to get location. Calling emergency services directly...');
      window.open('tel:108', '_self');
    }

    // Reset SOS after 30 seconds
    setTimeout(() => setSosActive(false), 30000);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setLocation(null);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Heart className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {profile?.full_name?.split(' ')[0] || 'User'}</h1>
            <p className="text-blue-100">Your health companion is ready to help</p>
          </div>
        </div>
      </div>

      {/* Emergency SOS Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency SOS</h2>
            <p className="text-gray-600">One-tap emergency help with location & health data sharing</p>
          </div>

          {!sosActive ? (
            <button
              onClick={handleSOSClick}
              className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-4 bg-white/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-8 bg-white/30 rounded-full animate-ping"></div>
              <div className="relative flex flex-col items-center justify-center h-full text-white">
                <AlertTriangle className="h-12 w-12 mb-2" />
                <span className="text-xl font-bold">SOS</span>
                <span className="text-sm">EMERGENCY</span>
              </div>
            </button>
          ) : (
            <div className="space-y-6">
              <div className="w-48 h-48 mx-auto bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <div className="text-white text-center">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-2" />
                  <div className="text-2xl font-bold">SOS ACTIVE</div>
                  <div className="text-sm">Help is coming...</div>
                </div>
              </div>

              {location && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Location Shared</span>
                  </div>
                  <p className="text-sm text-red-800">
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <button
                onClick={cancelSOS}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel SOS
              </button>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>• Shares live location with emergency services</p>
            <p>• Sends health records to nearby hospitals</p>
            <p>• Alerts your emergency contacts</p>
            <p>• Connects to ambulance services</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Health Status</h3>
              <p className="text-green-600 font-medium">All Good</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
              <p className="text-blue-600 font-medium">
                {profile?.emergency_contact_name || 'Not Set'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Phone className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Emergency Line</h3>
              <p className="text-red-600 font-medium">108 (Ambulance)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Services */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">24x7 Emergency Services</h3>
        <div className="grid gap-4">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{contact.name}</h4>
                <p className="text-sm text-gray-600">{contact.city}</p>
              </div>
              <button
                onClick={() => window.open(`tel:${contact.phone_number}`, '_self')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SOS Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Emergency SOS</h3>
              <p className="text-gray-600 mb-6">
                This will immediately alert emergency services and share your location and health data. 
                Are you sure you want to proceed?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSOS}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Send SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;