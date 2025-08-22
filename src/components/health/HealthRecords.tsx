import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Eye, Edit3, Trash2, Calendar, User, Building2 as Hospital, Pill, Activity, Shield, Search, Filter, Upload } from 'lucide-react';
import { supabase, HealthRecord } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const HealthRecords: React.FC = () => {
  const { profile } = useAuth();
  const [activeView, setActiveView] = useState<'records' | 'add'>('records');
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    dateRange: '',
    doctor: '',
  });

  const [recordForm, setRecordForm] = useState({
    record_type: 'diagnosis' as const,
    title: '',
    description: '',
    record_date: '',
    doctor_name: '',
    hospital_name: '',
    tags: [] as string[],
    is_private: true,
  });

  const recordTypes = [
    { value: 'symptom', label: 'Symptom', icon: Activity, color: 'bg-yellow-900/50 text-yellow-400 border-yellow-500/30' },
    { value: 'diagnosis', label: 'Diagnosis', icon: FileText, color: 'bg-blue-900/50 text-blue-400 border-blue-500/30' },
    { value: 'surgery', label: 'Surgery', icon: Shield, color: 'bg-red-900/50 text-red-400 border-red-500/30' },
    { value: 'prescription', label: 'Prescription', icon: Pill, color: 'bg-green-900/50 text-green-400 border-green-500/30' },
    { value: 'lab_result', label: 'Lab Result', icon: Activity, color: 'bg-purple-900/50 text-purple-400 border-purple-500/30' },
    { value: 'vaccination', label: 'Vaccination', icon: Shield, color: 'bg-teal-900/50 text-teal-400 border-teal-500/30' },
  ];

  const commonTags = [
    'Chronic', 'Acute', 'Follow-up', 'Emergency', 'Routine', 'Preventive',
    'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics'
  ];

  useEffect(() => {
    if (profile) {
      fetchHealthRecords();
    }
  }, [profile]);

  const fetchHealthRecords = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', profile.id)
        .order('record_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('health_records')
        .insert([
          {
            user_id: profile.id,
            record_type: recordForm.record_type,
            title: recordForm.title,
            description: recordForm.description,
            record_date: recordForm.record_date,
            doctor_name: recordForm.doctor_name,
            hospital_name: recordForm.hospital_name,
            tags: recordForm.tags,
            is_private: recordForm.is_private,
          },
        ]);

      if (error) throw error;

      alert('Bio record uploaded to neural database!');
      setRecordForm({
        record_type: 'diagnosis',
        title: '',
        description: '',
        record_date: '',
        doctor_name: '',
        hospital_name: '',
        tags: [],
        is_private: true,
      });
      setActiveView('records');
      fetchHealthRecords();
    } catch (error) {
      console.error('Error adding health record:', error);
      alert('Upload failed. Retry neural connection.');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Delete this bio record from neural database?')) return;

    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      fetchHealthRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const generateHealthSummary = () => {
    const summary = {
      patient: profile?.full_name,
      generatedOn: new Date().toLocaleDateString(),
      totalRecords: records.length,
      recordsByType: recordTypes.map(type => ({
        type: type.label,
        count: records.filter(r => r.record_type === type.value).length
      })),
      recentRecords: records.slice(0, 10),
      chronicConditions: records.filter(r => r.tags?.includes('Chronic')),
      medications: records.filter(r => r.record_type === 'prescription'),
    };

    console.log('Bio Summary:', summary);
    alert('Bio summary generated! (Neural PDF export coming soon)');
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !filters.type || record.record_type === filters.type;
    const matchesDoctor = !filters.doctor || 
      record.doctor_name?.toLowerCase().includes(filters.doctor.toLowerCase());

    return matchesSearch && matchesType && matchesDoctor;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
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
              <FileText className="h-10 sm:h-12 w-10 sm:w-12" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider">BIO RECORDS</h1>
              <p className="text-indigo-100 font-bold tracking-wide">Your complete neural health archive</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">{records.length}</div>
              <div className="text-indigo-100 text-xs sm:text-sm font-bold tracking-wider">TOTAL RECORDS</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">
                {records.filter(r => r.record_type === 'prescription').length}
              </div>
              <div className="text-indigo-100 text-xs sm:text-sm font-bold tracking-wider">PRESCRIPTIONS</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">
                {records.filter(r => r.record_type === 'lab_result').length}
              </div>
              <div className="text-indigo-100 text-xs sm:text-sm font-bold tracking-wider">LAB RESULTS</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">
                {new Set(records.map(r => r.doctor_name).filter(Boolean)).size}
              </div>
              <div className="text-indigo-100 text-xs sm:text-sm font-bold tracking-wider">SPECIALISTS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 border border-indigo-500/30">
          <button
            onClick={() => setActiveView('records')}
            className={`py-2 px-4 rounded-md text-sm font-black tracking-wider transition-all ${
              activeView === 'records'
                ? 'bg-indigo-500 text-black shadow-lg shadow-indigo-500/25'
                : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            MY RECORDS
          </button>
          <button
            onClick={() => setActiveView('add')}
            className={`py-2 px-4 rounded-md text-sm font-black tracking-wider transition-all ${
              activeView === 'add'
                ? 'bg-indigo-500 text-black shadow-lg shadow-indigo-500/25'
                : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            ADD RECORD
          </button>
        </div>

        {activeView === 'records' && (
          <button
            onClick={generateHealthSummary}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all font-black tracking-wider shadow-lg shadow-indigo-500/25 transform hover:scale-105"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">GENERATE SUMMARY</span>
            <span className="sm:hidden">EXPORT</span>
          </button>
        )}
      </div>

      {/* Records View */}
      {activeView === 'records' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-indigo-500/30 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search records, symptoms, specialists..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-indigo-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-indigo-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                >
                  <option value="">All Types</option>
                  {recordTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  value={filters.doctor}
                  onChange={(e) => setFilters(prev => ({ ...prev, doctor: e.target.value }))}
                  placeholder="Filter by specialist"
                  className="w-full px-3 py-2 bg-gray-900 border border-indigo-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const recordType = recordTypes.find(t => t.value === record.record_type);
              const Icon = recordType?.icon || FileText;

              return (
                <div key={record.id} className="bg-gray-800 rounded-xl shadow-lg border border-indigo-500/30 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 space-y-4 sm:space-y-0">
                    <div className="flex items-start space-x-4">
                      <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30">
                        <Icon className="h-6 w-6 text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-1">
                          <h3 className="text-lg font-black text-white tracking-wider">
                            {record.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-black tracking-wider border ${recordType?.color}`}>
                            {recordType?.label}
                          </span>
                          {record.is_private && (
                            <Shield className="h-4 w-4 text-gray-400" title="Private" />
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-bold">{new Date(record.record_date).toLocaleDateString()}</span>
                          </div>
                          {record.doctor_name && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span className="font-bold">Dr. {record.doctor_name}</span>
                            </div>
                          )}
                          {record.hospital_name && (
                            <div className="flex items-center space-x-1">
                              <Hospital className="h-4 w-4" />
                              <span className="font-bold">{record.hospital_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-indigo-400 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-indigo-400 transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {record.description && (
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-500/30">
                      <p className="text-sm text-gray-300">{record.description}</p>
                    </div>
                  )}

                  {record.tags && record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {record.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-bold tracking-wider border border-gray-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-black text-white mb-2 tracking-wider">
                  NO BIO RECORDS FOUND
                </h3>
                <p className="text-gray-400 mb-4 font-bold">
                  {searchQuery || filters.type || filters.doctor
                    ? 'Try adjusting your search parameters.'
                    : 'Start building your neural health archive by adding your first record.'}
                </p>
                <button
                  onClick={() => setActiveView('add')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all font-black tracking-wider shadow-lg shadow-indigo-500/25 transform hover:scale-105"
                >
                  ADD BIO RECORD
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Record View */}
      {activeView === 'add' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-indigo-500/30 p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="bg-indigo-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 border border-indigo-500/30">
                <FileText className="h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-wider">
                ADD BIO RECORD
              </h2>
              <p className="text-indigo-300 font-bold">
                Upload medical data to neural archive
              </p>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-indigo-400 mb-2 tracking-wider">
                    RECORD TYPE *
                  </label>
                  <select
                    value={recordForm.record_type}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, record_type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-900 border border-indigo-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                  >
                    {recordTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-indigo-400 mb-2 tracking-wider">
                    DATE *
                  </label>
                  <input
                    type="date"
                    value={recordForm.record_date}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, record_date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-gray-900 border border-indigo-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-indigo-400 mb-2 tracking-wider">
                  TITLE *
                </label>
                <input
                  type="text"
                  value={recordForm.title}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-indigo-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                  placeholder="Brief title for this bio record"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-indigo-400 mb-2 tracking-wider">
                  DESCRIPTION
                </label>
                <textarea
                  value={recordForm.description}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-900 border border-indigo-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400 resize-none"
                  placeholder="Detailed description of symptoms, diagnosis, treatment, etc."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-indigo-400 mb-2 tracking-wider">
                    SPECIALIST NAME
                  </label>
                  <input
                    type="text"
                    value={recordForm.doctor_name}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, doctor_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-900 border border-indigo-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                    placeholder="Dr. Neural Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-indigo-400 mb-2 tracking-wider">
                    MED CENTER NAME
                  </label>
                  <input
                    type="text"
                    value={recordForm.hospital_name}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, hospital_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-900 border border-indigo-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                    placeholder="Neural Medical Center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-indigo-400 mb-2 tracking-wider">
                  TAGS
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (recordForm.tags.includes(tag)) {
                          setRecordForm(prev => ({
                            ...prev,
                            tags: prev.tags.filter(t => t !== tag)
                          }));
                        } else {
                          setRecordForm(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag]
                          }));
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all ${
                        recordForm.tags.includes(tag)
                          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-500/30'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={recordForm.is_private}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, is_private: e.target.checked }))}
                  className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-gray-900"
                />
                <label htmlFor="is_private" className="text-sm text-gray-300 font-bold">
                  Keep this record private (neural encryption enabled)
                </label>
              </div>

              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                <h4 className="font-black text-blue-400 mb-2 tracking-wider">
                  DOCUMENT UPLOAD (COMING SOON)
                </h4>
                <p className="text-sm text-blue-300">
                  Soon you'll be able to upload medical reports, prescriptions, and lab results 
                  to attach to your bio records for complete neural documentation.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-black tracking-wider hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/25 transform hover:scale-105"
              >
                UPLOAD BIO RECORD
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecords;