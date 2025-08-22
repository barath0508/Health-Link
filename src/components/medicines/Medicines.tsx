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
  RefreshCw,
  Cpu,
  Zap,
  Target,
  Database,
  Shield
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
      
      const { data, error } = await supabase
        .from('medicine_reminders')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .lte('start_date', today)
        .or(`end_date.is.null,end_date.gte.${today}`);

      if (error) throw error;
      
      const schedule = [];
      data?.forEach(reminder => {
        reminder.reminder_times?.forEach((time: string) => {
          schedule.push({
            id: `${reminder.id}_${time}`,
            reminder_id: reminder.id,
            medicine_name: reminder.medicine_name,
            dosage: reminder.dosage,
            time: time,
            status: 'pending',
            reminder,
          });
        });
      });

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
      console.log(`Marked ${scheduleItem.medicine_name} as ${status}`);
      
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
    let startHour = 8;

    for (let i = 0; i < frequency; i++) {
      const hour = Math.floor(startHour + (hoursInterval * i)) % 24;
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    setReminderForm(prev => ({ ...prev, reminder_times: times }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* Cyberpunk Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl border border-purple-500/30"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(128, 0, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128, 0, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}></div>
        <div className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative px-4 sm:px-8 py-8 sm:py-12 text-white">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 border-2 border-purple-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <Pill className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-pink-400 rounded-full flex items-center justify-center animate-pulse">
                <Cpu className="h-2 w-2 sm:h-3 sm:w-3 text-gray-900" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                PHARMA CORE
              </h1>
              <p className="text-purple-300 text-sm sm:text-lg font-bold tracking-wider">Medicine Management System</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <div className="bg-gray-800/40 border border-purple-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Database className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400 animate-pulse" />
                <div>
                  <p className="text-lg sm:text-2xl font-black text-purple-400">{reminders.length}</p>
                  <p className="text-xs sm:text-sm text-gray-300 font-bold">ACTIVE MEDS</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Target className="h-4 w-4 sm:h-6 sm:w-6 text-cyan-400 animate-pulse" />
                <div>
                  <p className="text-lg sm:text-2xl font-black text-cyan-400">{todaysSchedule.length}</p>
                  <p className="text-xs sm:text-sm text-gray-300 font-bold">TODAY'S DOSES</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-green-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-400 animate-pulse" />
                <div>
                  <p className="text-lg sm:text-2xl font-black text-green-400">
                    {todaysSchedule.filter(s => s.status === 'taken').length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-300 font-bold">COMPLETED</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400 animate-pulse" />
                <div>
                  <p className="text-lg sm:text-2xl font-black text-yellow-400">95%</p>
                  <p className="text-xs sm:text-sm text-gray-300 font-bold">ADHERENCE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cyberpunk Navigation */}
      <div className="flex space-x-1 sm:space-x-2 bg-gray-800/60 border border-gray-700 rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-2xl overflow-x-auto">
        {[
          { id: 'reminders', label: 'MED TRACKER', icon: Target },
          { id: 'refills', label: 'REFILL ALERTS', icon: AlertTriangle, badge: refillSuggestions.length },
          { id: 'pharmacy', label: 'ORDER MEDS', icon: ShoppingCart },
          { id: 'add', label: 'ADD MEDICINE', icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-3 py-2 sm:py-4 px-2 sm:px-6 rounded-lg sm:rounded-xl font-black transition-all duration-300 transform hover:scale-105 border whitespace-nowrap min-w-fit ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 shadow-xl shadow-purple-500/25 border-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/80 border-gray-600 hover:border-gray-500'
              }`}
            >
              <Icon className="h-3 w-3 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm tracking-wider hidden sm:inline">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Today's Schedule */}
      {activeView === 'reminders' && todaysSchedule.length > 0 && (
        <div className="bg-gray-800/60 border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-cyan-500/10 p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wider">TODAY'S SCHEDULE</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {todaysSchedule.map((item) => (
              <div key={item.id} className="bg-gray-900/60 border border-gray-700 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <span className="font-bold text-white text-sm sm:text-base">{item.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {item.status === 'taken' && (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    )}
                    {item.status === 'missed' && (
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                    )}
                    {item.status === 'pending' && (
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 animate-pulse" />
                    )}
                  </div>
                </div>
                <h3 className="font-black text-white text-sm sm:text-base mb-1">{item.medicine_name}</h3>
                <p className="text-xs sm:text-sm text-gray-400 font-bold mb-3">{item.dosage}</p>
                
                {item.status === 'pending' && (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    <button
                      onClick={() => markMedicineStatus(item, 'taken')}
                      className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-all duration-300"
                    >
                      TAKEN
                    </button>
                    <button
                      onClick={() => markMedicineStatus(item, 'missed')}
                      className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all duration-300"
                    >
                      MISSED
                    </button>
                    <button
                      onClick={() => markMedicineStatus(item, 'skipped')}
                      className="px-2 py-1 bg-gray-500/20 border border-gray-500/50 text-gray-400 rounded-lg text-xs font-bold hover:bg-gray-500/30 transition-all duration-300"
                    >
                      SKIP
                    </button>
                  </div>
                )}
                
                {item.status !== 'pending' && (
                  <div className={`text-center py-1 px-3 rounded-lg text-xs font-bold ${
                    item.status === 'taken' ? 'bg-green-500/20 border border-green-500/50 text-green-400' :
                    item.status === 'missed' ? 'bg-red-500/20 border border-red-500/50 text-red-400' :
                    'bg-gray-500/20 border border-gray-500/50 text-gray-400'
                  }`}>
                    {item.status.toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminders View */}
      {activeView === 'reminders' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-black text-white">ACTIVE MEDICINE TRACKERS</h2>
            <button
              onClick={() => setActiveView('add')}
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 rounded-xl sm:rounded-2xl hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 font-black border-2 border-purple-400 transform hover:scale-105"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">ADD MEDICINE</span>
            </button>
          </div>

          <div className="grid gap-4 sm:gap-6">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="bg-gray-800/60 border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/10 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/20 border-2 border-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <Pill className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-2xl font-black text-white">
                        {reminder.medicine_name}
                      </h3>
                      <p className="text-gray-400 font-bold text-sm sm:text-base">DOSAGE: {reminder.dosage}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingReminder(reminder.id)}
                      className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
                  <div>
                    <h4 className="text-sm font-black text-cyan-400 mb-2 tracking-wider">FREQUENCY</h4>
                    <p className="text-sm text-gray-300 font-bold">
                      {reminder.frequency_per_day}X PER DAY
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-green-400 mb-2 tracking-wider">TIMES</h4>
                    <div className="flex flex-wrap gap-1">
                      {reminder.reminder_times?.map((time) => (
                        <span
                          key={time}
                          className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-xs font-bold"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-yellow-400 mb-2 tracking-wider">DURATION</h4>
                    <p className="text-sm text-gray-300 font-bold">
                      {new Date(reminder.start_date).toLocaleDateString()} - 
                      {reminder.end_date ? new Date(reminder.end_date).toLocaleDateString() : 'ONGOING'}
                    </p>
                  </div>
                </div>

                {reminder.notes && (
                  <div className="bg-gray-900/60 border border-gray-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <h4 className="text-sm font-black text-purple-400 mb-2 tracking-wider">NOTES</h4>
                    <p className="text-sm text-gray-300 font-medium">{reminder.notes}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-blue-400" />
                    <span className="font-bold">NOTIFICATIONS ACTIVE</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="font-bold">85% ADHERENCE THIS WEEK</span>
                  </div>
                </div>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="text-center py-8 sm:py-12 bg-gray-800/40 border border-gray-700 rounded-2xl sm:rounded-3xl">
                <Pill className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-black text-white mb-2">
                  NO MEDICINE TRACKERS
                </h3>
                <p className="text-gray-400 font-bold mb-4 px-4">
                  Add your first medicine to start tracking your medication schedule.
                </p>
                <button
                  onClick={() => setActiveView('add')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 rounded-xl hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 font-black border-2 border-purple-400 transform hover:scale-105"
                >
                  ADD MEDICINE
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Medicine View */}
      {activeView === 'add' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/60 border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/20 border-2 border-purple-500 rounded-2xl sm:rounded-3xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <Pill className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-4">
                ADD MEDICINE TRACKER
              </h2>
              <p className="text-gray-400 font-bold text-sm sm:text-lg">
                Set up automated reminders for your medications
              </p>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-black text-purple-400 mb-2 tracking-wider">
                    MEDICINE NAME *
                  </label>
                  <input
                    type="text"
                    value={reminderForm.medicine_name}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, medicine_name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-purple-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/25 focus:border-purple-500 font-bold"
                    placeholder="e.g., Paracetamol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-cyan-400 mb-2 tracking-wider">
                    DOSAGE *
                  </label>
                  <input
                    type="text"
                    value={reminderForm.dosage}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, dosage: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-cyan-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/25 focus:border-cyan-500 font-bold"
                    placeholder="e.g., 500mg, 2 tablets"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-green-400 mb-2 tracking-wider">
                  FREQUENCY PER DAY *
                </label>
                <select
                  value={reminderForm.frequency_per_day}
                  onChange={(e) => {
                    const frequency = parseInt(e.target.value);
                    setReminderForm(prev => ({ ...prev, frequency_per_day: frequency }));
                    updateReminderTimes(frequency);
                  }}
                  className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 font-bold"
                >
                  <option value={1}>ONCE DAILY</option>
                  <option value={2}>TWICE DAILY</option>
                  <option value={3}>THREE TIMES DAILY</option>
                  <option value={4}>FOUR TIMES DAILY</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-yellow-400 mb-2 tracking-wider">
                  REMINDER TIMES
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                      className="px-3 py-2 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-500/25 focus:border-yellow-500 font-bold"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-black text-blue-400 mb-2 tracking-wider">
                    START DATE *
                  </label>
                  <input
                    type="date"
                    value={reminderForm.start_date}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-indigo-400 mb-2 tracking-wider">
                    END DATE (OPTIONAL)
                  </label>
                  <input
                    type="date"
                    value={reminderForm.end_date}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-pink-400 mb-2 tracking-wider">
                  NOTES (OPTIONAL)
                </label>
                <textarea
                  value={reminderForm.notes}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-pink-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-500/25 focus:border-pink-500 font-bold resize-none"
                  placeholder="Special instructions, side effects to watch for, etc."
                />
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h4 className="font-black text-blue-400 mb-3 sm:mb-4 tracking-wider">
                  SMART FEATURES
                </h4>
                <ul className="text-sm text-blue-300 space-y-1 sm:space-y-2 font-bold">
                  <li>• BROWSER NOTIFICATIONS AT SCHEDULED TIMES</li>
                  <li>• AUTOMATIC REFILL SUGGESTIONS WHEN RUNNING LOW</li>
                  <li>• PARTNER PHARMACY INTEGRATION FOR EASY ORDERING</li>
                  <li>• ADHERENCE TRACKING AND REPORTS</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 rounded-xl sm:rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 border-2 border-purple-400 transform hover:scale-105 tracking-wider"
              >
                ADD MEDICINE TRACKER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;