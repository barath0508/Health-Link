import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Share2, CreditCard, AlertTriangle, Heart, User } from 'lucide-react';
import QRCode from 'qrcode';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const HealthCard: React.FC = () => {
  const { user, profile } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user) {
      fetchHealthData();
    }
  }, [user]);

  const fetchHealthData = async () => {
    try {
      const [allergiesRes, healthRecordsRes, medicineRes] = await Promise.all([
        supabase.from('user_allergies').select('*').eq('user_id', user?.id),
        supabase.from('health_records').select('*').eq('user_id', user?.id).order('record_date', { ascending: false }).limit(10),
        supabase.from('medicine_reminders').select('*').eq('user_id', user?.id).eq('is_active', true)
      ]);

      const emergencyData = {
        id: user?.id,
        name: profile?.full_name,
        phone: profile?.phone,
        bloodGroup: 'O+', // This would come from profile in real app
        dateOfBirth: profile?.date_of_birth,
        emergencyContact: {
          name: profile?.emergency_contact_name,
          phone: profile?.emergency_contact_phone
        },
        allergies: allergiesRes.data?.map(a => ({
          name: a.allergen_name,
          severity: a.severity
        })) || [],
        medicalRecords: healthRecordsRes.data?.map(r => ({
          type: r.record_type,
          title: r.title,
          date: r.record_date,
          doctor: r.doctor_name,
          hospital: r.hospital_name
        })) || [],
        currentMedications: medicineRes.data?.map(m => ({
          name: m.medicine_name,
          dosage: m.dosage,
          frequency: m.frequency_per_day,
          startDate: m.start_date
        })) || [],
        lastUpdated: new Date().toISOString()
      };

      setHealthData(emergencyData);
      generateQRCode(emergencyData);
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (data: any) => {
    try {
      const qrData = JSON.stringify({
        type: 'healthlink_emergency',
        url: `${window.location.origin}/emergency/${user?.id}`,
        data: data
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadCard = () => {
    if (!canvasRef.current || !qrCodeUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, 80);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Digital Health Card', canvas.width / 2, 35);
    ctx.font = '14px Arial';
    ctx.fillText('HealthLink Platform', canvas.width / 2, 55);

    // User Info
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(profile?.full_name || 'User Name', 20, 120);

    ctx.font = '14px Arial';
    ctx.fillText(`Phone: ${profile?.phone || 'Not provided'}`, 20, 145);
    ctx.fillText(`Blood Group: O+`, 20, 165);
    ctx.fillText(`DOB: ${profile?.date_of_birth || 'Not provided'}`, 20, 185);

    // Emergency Contact
    if (profile?.emergency_contact_name) {
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Emergency Contact:', 20, 220);
      ctx.font = '14px Arial';
      ctx.fillText(profile.emergency_contact_name, 20, 240);
      ctx.fillText(profile?.emergency_contact_phone || '', 20, 260);
    }

    // QR Code
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, (canvas.width - 200) / 2, 300, 200, 200);
      
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Scan for Emergency Access', canvas.width / 2, 520);
      ctx.fillText('to Medical Records', canvas.width / 2, 535);

      // Download
      const link = document.createElement('a');
      link.download = 'health-card.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImg.src = qrCodeUrl;
  };

  const shareCard = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        await navigator.share({
          title: 'My Digital Health Card',
          text: 'Emergency access to my medical information',
          url: `${window.location.origin}/emergency/${user?.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/emergency/${user?.id}`);
      alert('Health card link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <CreditCard className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Digital Health Card</h1>
            <p className="text-purple-100">QR code for instant emergency access</p>
          </div>
        </div>
      </div>

      {/* Health Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Digital Health Card</h2>
              <p className="text-gray-300 text-sm">HealthLink Platform</p>
            </div>
            <Heart className="h-8 w-8 text-red-400" />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{profile?.full_name}</h3>
                  <p className="text-gray-600">{profile?.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-1">Blood Group</h4>
                  <p className="text-2xl font-bold text-red-600">O+</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Age</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {profile?.date_of_birth 
                      ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Emergency Contact */}
              {profile?.emergency_contact_name && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Emergency Contact</h4>
                  <p className="font-medium text-green-800">{profile.emergency_contact_name}</p>
                  <p className="text-green-700">{profile.emergency_contact_phone}</p>
                </div>
              )}

              {/* Allergies */}
              {healthData?.allergies?.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Allergies</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {healthData.allergies.map((allergy: any, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-200 text-yellow-800 text-sm rounded-full"
                      >
                        {allergy.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Records */}
              {healthData?.medicalRecords?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Recent Medical Records</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {healthData.medicalRecords.slice(0, 3).map((record: any, index: number) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium text-gray-800">{record.title}</p>
                        <p className="text-gray-600">{record.type} - {new Date(record.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Medications */}
              {healthData?.currentMedications?.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Current Medications</h4>
                  <div className="space-y-1">
                    {healthData.currentMedications.slice(0, 3).map((med: any, index: number) => (
                      <div key={index} className="text-sm text-blue-800">
                        <span className="font-medium">{med.name}</span> - {med.dosage}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center space-y-4 order-first xl:order-last">
              <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Health Card QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 mb-1">Scan for Emergency Access</p>
                <p className="text-xs text-gray-600">Instant access to medical records</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={downloadCard}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={shareCard}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Use Your Digital Health Card</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-2">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <p className="text-sm text-blue-800">Download or save the QR code to your phone</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-2">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <p className="text-sm text-blue-800">Show QR code to hospital staff during emergencies</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-2">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <p className="text-sm text-blue-800">Instant access to your medical information</p>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default HealthCard;