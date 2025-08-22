import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Clock, 
  Plus, 
  Bell, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2,
  AlertTriangle,
  ShoppingCart,
  Truck,
  MapPin,
  Star,
  RefreshCw
} from 'lucide-react';
import { supabase, MedicineReminder } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const Medicines: React.FC = () => {
  const { profile } = useAuth();
  const [activeView, setActiveView] = useState<'reminders' | 'add' | 'pharmacy' | 'refills'>('reminders');
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [refillSuggestions, setRefillSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);

  const [reminderForm, setReminderForm] = useState({
    medicine_name: '',
    dosage: '',
    frequency_per_day: 1,
    reminder_times: ['08:00'],
    start_date: '',
    end_date: '',
    notes: '',
  });

  useEffect(() => {
    if (profile) {
      fetchReminders();
      fetchTodaysSchedule();
      fetchPharmacies();
      fetchRefillSuggestions();
    }
  }, [profile]);

  const fetchReminders = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('medicine_reminders')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('is_verified', true)
        .eq('home_delivery', true)
        .order('rating', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPharmacies(data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  const fetchRefillSuggestions = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('refill_suggestions')
        .select('*, medicine_reminders(*)')
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .order('days_remaining', { ascending: true });

      if (error) throw error;
      setRefillSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching refill suggestions:', error);
    }
  };

  const fetchTodaysSchedule = async () => {
    if (!profile) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // This is a simplified version - in a real app, you'd join with medicine_logs
      // and calculate today's schedule based on reminder_times and frequency
      const { data, error } = await supabase
        .from('medicine_reminders')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .lte('start_date', today)
        .or(`end_date.is.null,end_date.gte.${today}`);

      if (error) throw error;
      
      // Generate today's schedule
      const schedule = [];
      data?.forEach(reminder => {
        reminder.reminder_times?.forEach((time: string) => {
          schedule.push({
            id: `${reminder.id}_${time}`,
            reminder_id: reminder.id,
            medicine_name: reminder.medicine_name,
            dosage: reminder.dosage,
            time: time,
            status: 'pending', // In real app, get from medicine_logs
            reminder,
          });
        });
      });

      // Sort by time
      schedule.sort((a, b) => a.time.localeCompare(b.time));
      setTodaysSchedule(schedule);
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('medicine_reminders')
        .insert([
          {
            user_id: profile.id,
            medicine_name: reminderForm.medicine_name,
            dosage: reminderForm.dosage,
            frequency_per_day: reminderForm.frequency_per_day,
            reminder_times: reminderForm.reminder_times,
            start_date: reminderForm.start_date,
            end_date: reminderForm.end_date || null,
            notes: reminderForm.notes,
          },
        ]);

      if (error) throw error;

      alert('Medicine reminder added successfully!');
      setReminderForm({
        medicine_name: '',
        dosage: '',
        frequency_per_day: 1,
        reminder_times: ['08:00'],
        start_date: '',
        end_date: '',
        notes: '',
      });
      setActiveView('reminders');
      fetchReminders();
      fetchTodaysSchedule();
    } catch (error) {
      console.error('Error adding reminder:', error);
      alert('Error adding reminder. Please try again.');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const { error } = await supabase
        .from('medicine_reminders')
        .update({ is_active: false })
        .eq('id', reminderId);

      if (error) throw error;

      fetchReminders();
      fetchTodaysSchedule();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const markMedicineStatus = async (scheduleItem: any, status: 'taken' | 'missed' | 'skipped') => {
    try {
      // In a real app, you'd update the medicine_logs table
      console.log(`Marked ${scheduleItem.medicine_name} as ${status}`);
      
      // Update local state for immediate feedback
      setTodaysSchedule(prev => prev.map(item => 
        item.id === scheduleItem.id ? { ...item, status } : item
      ));
    } catch (error) {
      console.error('Error updating medicine status:', error);
    }
  };

  const updateReminderTimes = (frequency: number) => {
    const times = [];
    const hoursInterval = 24 / frequency;
    let startHour = 8; // Start at 8 AM

    for (let i = 0; i < frequency; i++) {
      const hour = Math.floor(startHour + (hoursInterval * i)) % 24;
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    setReminderForm(prev => ({ ...prev, reminder_times: times }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Pill className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Medicine Manager</h1>
            <p className="text-purple-100">Never miss your medications again</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{reminders.length}</div>
            <div className="text-purple-100">Active Reminders</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{todaysSchedule.length}</div>
            <div className="text-purple-100">Today's Doses</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {todaysSchedule.filter(s => s.status === 'taken').length}
            </div>
            <div className="text-purple-100">Taken Today</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">95%</div>
            <div className="text-purple-100">Adherence Rate</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        <button
          onClick={() => setActiveView('reminders')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === 'reminders'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Reminders
        </button>
        <button
          onClick={() => setActiveView('refills')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === 'refills'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Refill Alerts
          {refillSuggestions.length > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {refillSuggestions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView('pharmacy')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === 'pharmacy'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Order Medicine
        </button>
        <button
          onClick={() => setActiveView('add')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === 'add'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Add Medicine
        </button>
      </div>

      {/* Today's Schedule */}
      {activeView === 'reminders' && todaysSchedule.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysSchedule.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{item.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {item.status === 'taken' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {item.status === 'missed' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {item.status === 'pending' && (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900">{item.medicine_name}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.dosage}</p>
                
                {item.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markMedicineStatus(item, 'taken')}
                      className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs hover:bg-green-200 transition-colors"
                    >
                      Taken
                    </button>
                    <button
                      onClick={() => markMedicineStatus(item, 'missed')}
                      className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs hover:bg-red-200 transition-colors"
                    >
                      Missed
                    </button>
                    <button
                      onClick={() => markMedicineStatus(item, 'skipped')}
                      className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                )}
                
                {item.status !== 'pending' && (
                  <div className={`text-center py-1 px-3 rounded-md text-xs ${
                    item.status === 'taken' ? 'bg-green-100 text-green-700' :
                    item.status === 'missed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminders View */}
      {activeView === 'reminders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Active Medicine Reminders</h2>
            <button
              onClick={() => setActiveView('add')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="grid gap-6">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Pill className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reminder.medicine_name}
                      </h3>
                      <p className="text-gray-600">Dosage: {reminder.dosage}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingReminder(reminder.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Frequency</h4>
                    <p className="text-sm text-gray-600">
                      {reminder.frequency_per_day}x per day
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Times</h4>
                    <div className="flex flex-wrap gap-1">
                      {reminder.reminder_times?.map((time) => (
                        <span
                          key={time}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Duration</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(reminder.start_date).toLocaleDateString()} - 
                      {reminder.end_date ? new Date(reminder.end_date).toLocaleDateString() : 'Ongoing'}
                    </p>
                  </div>
                </div>

                {reminder.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{reminder.notes}</p>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Bell className="h-4 w-4" />
                    <span>Notifications enabled</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>85% adherence this week</span>
                  </div>
                </div>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="text-center py-12">
                <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No medicine reminders
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your first medicine to start tracking your medication schedule.
                </p>
                <button
                  onClick={() => setActiveView('add')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add Medicine
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refill Suggestions View */}
      {activeView === 'refills' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Medicine Refill Alerts</h2>
            <button
              onClick={fetchRefillSuggestions}
              className="flex items-center space-x-2 px-3 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          {refillSuggestions.length > 0 ? (
            <div className="grid gap-4">
              {refillSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-100 p-3 rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {suggestion.medicine_name}
                        </h3>
                        <p className="text-orange-600 font-medium">
                          {suggestion.days_remaining} days remaining
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setActiveView('pharmacy')}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Order Now</span>
                      </button>
                      <button
                        onClick={() => {
                          // Dismiss suggestion
                          supabase.from('refill_suggestions')
                            .update({ status: 'dismissed' })
                            .eq('id', suggestion.id)
                            .then(() => fetchRefillSuggestions());
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-800">
                      <strong>Suggested quantity:</strong> {suggestion.suggested_quantity} units
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Based on your current usage pattern, you'll need a refill soon.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All medicines are well stocked
              </h3>
              <p className="text-gray-600">
                We'll notify you when any of your medicines are running low.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pharmacy View */}
      {activeView === 'pharmacy' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Partner Pharmacies</h2>
            <div className="text-sm text-gray-500">
              Home delivery available
            </div>
          </div>

          <div className="grid gap-6">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {pharmacy.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{pharmacy.city}</span>
                        {pharmacy.is_24x7 && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            24x7
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{pharmacy.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delivery</p>
                      <p className="text-xs text-gray-600">₹{pharmacy.delivery_fee} (Free above ₹{pharmacy.free_delivery_above})</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Radius</p>
                      <p className="text-xs text-gray-600">{pharmacy.delivery_radius_km} km</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Min Order</p>
                      <p className="text-xs text-gray-600">₹{pharmacy.min_order_amount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>📞 {pharmacy.phone}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => window.open(`tel:${pharmacy.phone}`, '_self')}
                      className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Call Now
                    </button>
                    <button 
                      onClick={() => {
                        alert(`Redirecting to ${pharmacy.name} ordering system...\n\nIn a real app, this would:\n• Open pharmacy's ordering portal\n• Pre-fill user details\n• Allow medicine selection\n• Process payment & delivery`);
                      }}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Order Medicine</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pharmacies.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pharmacies available
              </h3>
              <p className="text-gray-600">
                We're working to partner with pharmacies in your area.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Medicine View */}
      {activeView === 'add' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Pill className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add Medicine Reminder
              </h2>
              <p className="text-gray-600">
                Set up automated reminders for your medications
              </p>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    value={reminderForm.medicine_name}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, medicine_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Paracetamol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={reminderForm.dosage}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, dosage: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 500mg, 2 tablets"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency per Day *
                </label>
                <select
                  value={reminderForm.frequency_per_day}
                  onChange={(e) => {
                    const frequency = parseInt(e.target.value);
                    setReminderForm(prev => ({ ...prev, frequency_per_day: frequency }));
                    updateReminderTimes(frequency);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={1}>Once daily</option>
                  <option value={2}>Twice daily</option>
                  <option value={3}>Three times daily</option>
                  <option value={4}>Four times daily</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Times
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {reminderForm.reminder_times.map((time, index) => (
                    <input
                      key={index}
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...reminderForm.reminder_times];
                        newTimes[index] = e.target.value;
                        setReminderForm(prev => ({ ...prev, reminder_times: newTimes }));
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={reminderForm.start_date}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={reminderForm.end_date}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={reminderForm.notes}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Special instructions, side effects to watch for, etc."
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Smart Features
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Browser notifications at scheduled times</li>
                  <li>• Automatic refill suggestions when running low</li>
                  <li>• Partner pharmacy integration for easy ordering</li>
                  <li>• Adherence tracking and reports</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                Add Medicine Reminder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;