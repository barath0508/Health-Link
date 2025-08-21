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
    { value: 'symptom', label: 'Symptom', icon: Activity, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'diagnosis', label: 'Diagnosis', icon: FileText, color: 'bg-blue-100 text-blue-800' },
    { value: 'surgery', label: 'Surgery', icon: Shield, color: 'bg-red-100 text-red-800' },
    { value: 'prescription', label: 'Prescription', icon: Pill, color: 'bg-green-100 text-green-800' },
    { value: 'lab_result', label: 'Lab Result', icon: Activity, color: 'bg-purple-100 text-purple-800' },
    { value: 'vaccination', label: 'Vaccination', icon: Shield, color: 'bg-teal-100 text-teal-800' },
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

      alert('Health record added successfully!');
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
      alert('Error adding record. Please try again.');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this health record?')) return;

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

    // In a real app, this would generate a proper PDF
    console.log('Health Summary:', summary);
    alert('Health summary generated! (In a real app, this would download a PDF)');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <FileText className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Health Records</h1>
            <p className="text-indigo-100">Your complete digital health history</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{records.length}</div>
            <div className="text-indigo-100">Total Records</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {records.filter(r => r.record_type === 'prescription').length}
            </div>
            <div className="text-indigo-100">Prescriptions</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {records.filter(r => r.record_type === 'lab_result').length}
            </div>
            <div className="text-indigo-100">Lab Results</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {new Set(records.map(r => r.doctor_name).filter(Boolean)).size}
            </div>
            <div className="text-indigo-100">Doctors</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('records')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'records'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Records
          </button>
          <button
            onClick={() => setActiveView('add')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'add'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Add Record
          </button>
        </div>

        {activeView === 'records' && (
          <button
            onClick={generateHealthSummary}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Generate Summary</span>
          </button>
        )}
      </div>

      {/* Records View */}
      {activeView === 'records' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search records, symptoms, doctors..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  placeholder="Filter by doctor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 p-3 rounded-xl">
                        <Icon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {record.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${recordType?.color}`}>
                            {recordType?.label}
                          </span>
                          {record.is_private && (
                            <Shield className="h-4 w-4 text-gray-400" title="Private" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(record.record_date).toLocaleDateString()}</span>
                          </div>
                          {record.doctor_name && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>Dr. {record.doctor_name}</span>
                            </div>
                          )}
                          {record.hospital_name && (
                            <div className="flex items-center space-x-1">
                              <Hospital className="h-4 w-4" />
                              <span>{record.hospital_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {record.description && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">{record.description}</p>
                    </div>
                  )}

                  {record.tags && record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {record.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
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
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No health records found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filters.type || filters.doctor
                    ? 'Try adjusting your search criteria.'
                    : 'Start building your digital health history by adding your first record.'}
                </p>
                <button
                  onClick={() => setActiveView('add')}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Add Health Record
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Record View */}
      {activeView === 'add' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add Health Record
              </h2>
              <p className="text-gray-600">
                Keep track of your medical history and health events
              </p>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Record Type *
                  </label>
                  <select
                    value={recordForm.record_type}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, record_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {recordTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={recordForm.record_date}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, record_date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={recordForm.title}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brief title for this health record"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={recordForm.description}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Detailed description of symptoms, diagnosis, treatment, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    value={recordForm.doctor_name}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, doctor_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Dr. John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital/Clinic Name
                  </label>
                  <input
                    type="text"
                    value={recordForm.hospital_name}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, hospital_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="City General Hospital"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
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
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        recordForm.tags.includes(tag)
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_private" className="text-sm text-gray-700">
                  Keep this record private (only visible to you)
                </label>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Document Upload (Coming Soon)
                </h4>
                <p className="text-sm text-blue-800">
                  Soon you'll be able to upload medical reports, prescriptions, and lab results 
                  to attach to your health records for complete documentation.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
              >
                Add Health Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecords;