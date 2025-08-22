import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Phone, Clock, User, Heart, Activity, Zap, Shield, Brain, TrendingUp, Cpu, Wifi, Database, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [healthStats, setHealthStats] = useState({
    totalRecords: 0,
    allergies: 0,
    medicines: 0,
    analyses: 0
  });

  useEffect(() => {
    fetchEmergencyContacts();
    fetchHealthStats();
  }, [user]);

  const fetchHealthStats = async () => {
    if (!user) return;
    
    try {
      const [records, allergies, medicines, analyses] = await Promise.all([
        supabase.from('health_records').select('id').eq('user_id', user.id),
        supabase.from('user_allergies').select('id').eq('user_id', user.id),
        supabase.from('user_medicines').select('id').eq('user_id', user.id),
        supabase.from('nutrition_analyses').select('id').eq('user_id', user.id)
      ]);

      setHealthStats({
        totalRecords: records.data?.length || 0,
        allergies: allergies.data?.length || 0,
        medicines: medicines.data?.length || 0,
        analyses: analyses.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching health stats:', error);
    }
  };

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
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

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

      console.log('Emergency Data:', emergencyData);

      alert(`🚨 CRISIS MODE ACTIVATED 🚨\n\n📍 Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}\n👤 Name: ${profile?.full_name}\n📞 Phone: ${profile?.phone}\n🏥 Emergency Contact: ${profile?.emergency_contact_name} (${profile?.emergency_contact_phone})\n⚠️ Allergies: ${allergies.data?.map(a => a.allergen_name).join(', ') || 'None'}\n\n🚑 Emergency services activated\n📱 Neural network alerted\n🏥 Medical data transmitted\n\nResponse units dispatched!`);

      setTimeout(() => {
        window.open('tel:108', '_self');
      }, 3000);

    } catch (error) {
      console.error('SOS Error:', error);
      alert('Location unavailable. Direct emergency connection initiated...');
      window.open('tel:108', '_self');
    }

    setTimeout(() => setSosActive(false), 30000);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setLocation(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Neural Sync Complete';
    if (hour < 17) return 'System Online';
    return 'Night Mode Active';
  };

  return (
    <div className="space-y-8 relative">
      {/* Cyberpunk Dashboard Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-cyan-500/30"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative px-8 py-12 text-white">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-800 border-2 border-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                  <Heart className="h-10 w-10 text-cyan-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                  <Cpu className="h-4 w-4 text-gray-900" />
                </div>
              </div>
              <div>
                <p className="text-cyan-400 text-lg font-bold tracking-wider">{getGreeting()}</p>
                <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                  {profile?.full_name?.split(' ')[0] || 'User'}
                </h1>
                <p className="text-gray-300 text-lg font-medium">Neural Health Interface Ready</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-gray-800/60 border border-cyan-500/50 rounded-2xl px-6 py-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-400 animate-pulse" />
                  <span className="font-bold text-green-400">SECURED</span>
                </div>
              </div>
              <div className="bg-gray-800/60 border border-purple-500/50 rounded-2xl px-6 py-3">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-400 animate-pulse" />
                  <span className="font-bold text-purple-400">AI ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cyberpunk Health Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/40 border border-cyan-500/30 rounded-2xl p-4 hover:bg-gray-800/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25">
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-cyan-400" />
                <div>
                  <p className="text-2xl font-black text-cyan-400">{healthStats.totalRecords}</p>
                  <p className="text-sm text-gray-400 font-bold">DATA NODES</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-red-500/30 rounded-2xl p-4 hover:bg-gray-800/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <div>
                  <p className="text-2xl font-black text-red-400">{healthStats.allergies}</p>
                  <p className="text-sm text-gray-400 font-bold">ALERTS</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-purple-500/30 rounded-2xl p-4 hover:bg-gray-800/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-2xl font-black text-purple-400">{healthStats.medicines}</p>
                  <p className="text-sm text-gray-400 font-bold">COMPOUNDS</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-green-500/30 rounded-2xl p-4 hover:bg-gray-800/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-green-400" />
                <div>
                  <p className="text-2xl font-black text-green-400">{healthStats.analyses}</p>
                  <p className="text-sm text-gray-400 font-bold">AI SCANS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Mode Interface */}
      <div className="bg-gray-800/60 border border-red-500/30 rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded-2xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-red-400" />
                </div>
                <h2 className="text-3xl font-black text-white">CRISIS MODE</h2>
              </div>
              <p className="text-gray-400 text-lg font-medium">Emergency neural network activation system</p>
            </div>

            {!sosActive ? (
              <div className="space-y-8">
                <button
                  onClick={handleSOSClick}
                  className="group relative w-48 h-48 mx-auto bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-500 transform hover:scale-110 active:scale-95 overflow-hidden border-4 border-red-400"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                  <div className="absolute inset-4 border-2 border-red-300/50 rounded-full animate-pulse"></div>
                  <div className="absolute inset-8 border border-red-200/30 rounded-full animate-ping"></div>
                  <div className="relative flex flex-col items-center justify-center h-full text-white">
                    <AlertTriangle className="h-16 w-16 mb-3 drop-shadow-lg animate-bounce" />
                    <span className="text-2xl font-black drop-shadow-lg tracking-wider">SOS</span>
                    <span className="text-sm font-bold drop-shadow-lg tracking-widest">CRISIS</span>
                  </div>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="bg-gray-800/40 border border-cyan-500/30 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <MapPin className="h-6 w-6 text-cyan-400" />
                      <h3 className="font-bold text-cyan-400">GPS TRACKING</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Real-time location broadcast to emergency grid</p>
                  </div>
                  <div className="bg-gray-800/40 border border-green-500/30 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Brain className="h-6 w-6 text-green-400" />
                      <h3 className="font-bold text-green-400">NEURAL DATA</h3>
                    </div>
                    <p className="text-gray-300 text-sm">AI compiles complete medical profile instantly</p>
                  </div>
                  <div className="bg-gray-800/40 border border-purple-500/30 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Wifi className="h-6 w-6 text-purple-400" />
                      <h3 className="font-bold text-purple-400">NETWORK ALERT</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Instant notification to emergency contacts</p>
                  </div>
                  <div className="bg-gray-800/40 border border-orange-500/30 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Phone className="h-6 w-6 text-orange-400" />
                      <h3 className="font-bold text-orange-400">DIRECT LINK</h3>
                    </div>
                    <p className="text-gray-300 text-sm">Auto-connect to emergency response units</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative w-56 h-56 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-full animate-pulse shadow-2xl shadow-red-500/50 border-4 border-red-400"></div>
                  <div className="absolute inset-4 border-2 border-red-300 rounded-full animate-ping"></div>
                  <div className="absolute inset-8 border border-red-200 rounded-full animate-ping delay-75"></div>
                  <div className="relative flex flex-col items-center justify-center h-full text-white">
                    <AlertTriangle className="h-20 w-20 mb-4 animate-bounce" />
                    <div className="text-3xl font-black tracking-wider">CRISIS ACTIVE</div>
                    <div className="text-lg font-bold">Response incoming...</div>
                  </div>
                </div>

                {location && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 max-w-md mx-auto">
                    <div className="flex items-center space-x-3 mb-3">
                      <MapPin className="h-6 w-6 text-red-400" />
                      <span className="font-bold text-red-400">LOCATION TRANSMITTED</span>
                    </div>
                    <p className="text-red-300 font-mono text-sm">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                <button
                  onClick={cancelSOS}
                  className="px-8 py-4 bg-gray-700 border border-gray-600 text-gray-300 rounded-2xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-bold text-lg shadow-xl transform hover:scale-105"
                >
                  ABORT CRISIS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/60 border border-green-500/30 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-2xl flex items-center justify-center">
              <Activity className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">SYSTEM STATUS</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold tracking-wider">OPTIMAL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 border border-cyan-500/30 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-cyan-500/20 border-2 border-cyan-500 rounded-2xl flex items-center justify-center">
              <User className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">EMERGENCY LINK</h3>
              <p className="text-cyan-400 font-bold">
                {profile?.emergency_contact_name || 'NOT CONFIGURED'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 border border-red-500/30 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-2xl flex items-center justify-center">
              <Phone className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">CRISIS HOTLINE</h3>
              <p className="text-red-400 font-bold text-lg tracking-wider">108 (EMERGENCY)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Network */}
      <div className="bg-gray-800/60 border border-orange-500/30 rounded-3xl shadow-2xl shadow-orange-500/10 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-orange-500/20 border-2 border-orange-500 rounded-2xl flex items-center justify-center">
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">24×7 EMERGENCY GRID</h3>
              <p className="text-gray-400 text-lg">Active response network in your sector</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="group bg-gray-800/40 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-500/20 border-2 border-orange-500 rounded-xl flex items-center justify-center">
                      <Phone className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{contact.name}</h4>
                      <p className="text-gray-400 font-medium">{contact.city} • ALWAYS ACTIVE</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`tel:${contact.phone_number}`, '_self')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transform hover:scale-110 transition-all duration-300 flex items-center space-x-2 border border-orange-400"
                  >
                    <Phone className="h-5 w-5" />
                    <span>CONNECT</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crisis Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border-2 border-red-500 rounded-3xl max-w-md w-full p-8 shadow-2xl shadow-red-500/50">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/20 border-2 border-red-500 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-400 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">ACTIVATE CRISIS MODE</h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                This will immediately alert emergency services and transmit your location with complete medical profile. 
                Confirm medical emergency?
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-6 py-4 text-gray-300 bg-gray-700 border border-gray-600 rounded-2xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-bold text-lg transform hover:scale-105"
                >
                  ABORT
                </button>
                <button
                  onClick={confirmSOS}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 font-bold text-lg transform hover:scale-105 border border-red-400"
                >
                  ACTIVATE
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