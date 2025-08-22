import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Share2, CreditCard, AlertTriangle, Heart, User, Cpu, Zap, Shield, Database } from 'lucide-react';
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
        bloodGroup: 'O+',
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

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, 80);

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DIGITAL HEALTH ID', canvas.width / 2, 35);
    ctx.font = '14px Arial';
    ctx.fillText('HEALTHLINK NEURAL SYSTEM', canvas.width / 2, 55);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(profile?.full_name || 'USER NAME', 20, 120);

    ctx.font = '14px Arial';
    ctx.fillText(`PHONE: ${profile?.phone || 'NOT PROVIDED'}`, 20, 145);
    ctx.fillText(`BLOOD TYPE: O+`, 20, 165);
    ctx.fillText(`DOB: ${profile?.date_of_birth || 'NOT PROVIDED'}`, 20, 185);

    if (profile?.emergency_contact_name) {
      ctx.font = 'bold 16px Arial';
      ctx.fillText('EMERGENCY CONTACT:', 20, 220);
      ctx.font = '14px Arial';
      ctx.fillText(profile.emergency_contact_name, 20, 240);
      ctx.fillText(profile?.emergency_contact_phone || '', 20, 260);
    }

    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, (canvas.width - 200) / 2, 300, 200, 200);
      
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ffff';
      ctx.fillText('SCAN FOR EMERGENCY ACCESS', canvas.width / 2, 520);
      ctx.fillText('TO MEDICAL RECORDS', canvas.width / 2, 535);

      const link = document.createElement('a');
      link.download = 'health-id-card.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImg.src = qrCodeUrl;
  };

  const shareCard = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        await navigator.share({
          title: 'My Digital Health ID',
          text: 'Emergency access to my medical information',
          url: `${window.location.origin}/emergency/${user?.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/emergency/${user?.id}`);
      alert('Health ID link copied to clipboard!');
    }
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
        <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative px-4 sm:px-8 py-8 sm:py-12 text-white">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 border-2 border-purple-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                <Cpu className="h-2 w-2 sm:h-3 sm:w-3 text-gray-900" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                BIO ID
              </h1>
              <p className="text-purple-300 text-sm sm:text-lg font-bold tracking-wider">Digital Health Identity System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health ID Card */}
      <div className="bg-gray-800/60 border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6 text-white border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-purple-400">DIGITAL HEALTH ID</h2>
              <p className="text-gray-400 text-xs sm:text-sm font-bold tracking-wider">HEALTHLINK NEURAL SYSTEM</p>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 animate-pulse" />
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* User Information */}
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-500/20 border-2 border-cyan-500 rounded-2xl flex items-center justify-center">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">{profile?.full_name}</h3>
                  <p className="text-gray-400 font-bold text-sm sm:text-base">{profile?.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-red-500/20 border border-red-500/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <h4 className="font-black text-red-400 mb-1 text-sm tracking-wider">BLOOD TYPE</h4>
                  <p className="text-xl sm:text-2xl font-black text-red-300">O+</p>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <h4 className="font-black text-blue-400 mb-1 text-sm tracking-wider">AGE</h4>
                  <p className="text-xl sm:text-2xl font-black text-blue-300">
                    {profile?.date_of_birth 
                      ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Emergency Contact */}
              {profile?.emergency_contact_name && (
                <div className="bg-green-500/20 border border-green-500/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <h4 className="font-black text-green-400 mb-2 text-sm tracking-wider">EMERGENCY CONTACT</h4>
                  <p className="font-black text-green-300 text-sm sm:text-base">{profile.emergency_contact_name}</p>
                  <p className="text-green-400 font-bold text-sm">{profile.emergency_contact_phone}</p>
                </div>
              )}

              {/* Allergies */}
              {healthData?.allergies?.length > 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 animate-pulse" />
                    <h4 className="font-black text-yellow-400 text-sm tracking-wider">THREAT ALERTS</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {healthData.allergies.map((allergy: any, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 text-xs font-bold rounded-lg"
                      >
                        {allergy.name.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Records */}
              {healthData?.medicalRecords?.length > 0 && (
                <div className="bg-indigo-500/20 border border-indigo-500/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <h4 className="font-black text-indigo-400 mb-2 sm:mb-3 text-sm tracking-wider">RECENT MEDICAL DATA</h4>
                  <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                    {healthData.medicalRecords.slice(0, 3).map((record: any, index: number) => (
                      <div key={index} className="text-xs sm:text-sm">
                        <p className="font-black text-indigo-300">{record.title}</p>
                        <p className="text-indigo-400 font-bold">{record.type} - {new Date(record.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Medications */}
              {healthData?.currentMedications?.length > 0 && (
                <div className="bg-pink-500/20 border border-pink-500/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <h4 className="font-black text-pink-400 mb-2 sm:mb-3 text-sm tracking-wider">ACTIVE MEDICATIONS</h4>
                  <div className="space-y-1">
                    {healthData.currentMedications.slice(0, 3).map((med: any, index: number) => (
                      <div key={index} className="text-xs sm:text-sm text-pink-300">
                        <span className="font-black">{med.name}</span> - {med.dosage}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 order-1 lg:order-2">
              <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-purple-500/50">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Health ID QR Code" className="w-32 h-32 sm:w-48 sm:h-48" />
                ) : (
                  <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-100 flex items-center justify-center">
                    <QrCode className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm sm:text-base font-black text-purple-400 mb-1">SCAN FOR EMERGENCY ACCESS</p>
                <p className="text-xs sm:text-sm text-gray-400 font-bold">INSTANT MEDICAL DATA RETRIEVAL</p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button
                  onClick={downloadCard}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 rounded-xl sm:rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 font-black text-sm sm:text-base border-2 border-blue-400 transform hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                  <span>DOWNLOAD</span>
                </button>
                <button
                  onClick={shareCard}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 rounded-xl sm:rounded-2xl hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 font-black text-sm sm:text-base border-2 border-green-400 transform hover:scale-105"
                >
                  <Share2 className="h-4 w-4" />
                  <span>SHARE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Protocol */}
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-black text-blue-400 mb-4 sm:mb-6 tracking-wider">DIGITAL HEALTH ID PROTOCOL</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 border-2 border-blue-500 rounded-2xl mx-auto mb-3 flex items-center justify-center">
              <span className="text-blue-400 font-black text-lg">1</span>
            </div>
            <p className="text-sm text-blue-300 font-bold">DOWNLOAD OR SAVE QR CODE TO DEVICE</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 border-2 border-blue-500 rounded-2xl mx-auto mb-3 flex items-center justify-center">
              <span className="text-blue-400 font-black text-lg">2</span>
            </div>
            <p className="text-sm text-blue-300 font-bold">PRESENT QR CODE TO MEDICAL PERSONNEL</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 border-2 border-blue-500 rounded-2xl mx-auto mb-3 flex items-center justify-center">
              <span className="text-blue-400 font-black text-lg">3</span>
            </div>
            <p className="text-sm text-blue-300 font-bold">INSTANT ACCESS TO MEDICAL INFORMATION</p>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default HealthCard;