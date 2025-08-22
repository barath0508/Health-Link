import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, Utensils, Plus, X, Image, Cpu, Brain, Zap, Shield, Star, TrendingUp, Scan, Target, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeFood as analyzeWithAI } from '../../lib/nutrition';

const NutritionChecker: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'scanner' | 'allergies' | 'history'>('scanner');
  const [allergies, setAllergies] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [foodInput, setFoodInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [newAllergy, setNewAllergy] = useState({
    allergen_name: '',
    severity: 'mild',
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchAllergies();
      fetchAnalyses();
    }
  }, [user]);

  const fetchAllergies = async () => {
    try {
      const { data, error } = await supabase
        .from('user_allergies')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllergies(data || []);
    } catch (error) {
      console.error('Error fetching allergies:', error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const analyzeFood = async () => {
    if (!foodInput.trim() && !selectedImage) return;
    
    setLoading(true);
    try {
      const allergenList = allergies.map(a => a.allergen_name);
      const inputText = selectedImage ? 'Analyze this food image for nutrition and allergies' : foodInput;
      const parsedResult = await analyzeWithAI(inputText, allergenList, selectedImage);

      const { error } = await supabase
        .from('nutrition_analyses')
        .insert({
          user_id: user?.id,
          food_item: selectedImage ? 'Food Image Analysis' : foodInput,
          analysis_result: parsedResult,
          allergy_warnings: parsedResult.allergyWarnings || [],
          nutrition_score: parsedResult.healthScore || 7,
          recommendations: parsedResult.recommendations || []
        });

      if (error) throw error;

      setAnalysisResult(parsedResult);
      setFoodInput('');
      setSelectedImage(null);
      setImagePreview(null);
      fetchAnalyses();
    } catch (error) {
      console.error('Error analyzing food:', error);
      alert('Error analyzing food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setSelectedImage(file);
          setImagePreview(canvas.toDataURL());
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const addAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('user_allergies')
        .insert({
          user_id: user?.id,
          allergen_name: newAllergy.allergen_name,
          severity: newAllergy.severity,
          symptoms: newAllergy.symptoms ? newAllergy.symptoms.split(',').map(s => s.trim()) : [],
          notes: newAllergy.notes
        });

      if (error) throw error;

      setNewAllergy({ allergen_name: '', severity: 'mild', symptoms: '', notes: '' });
      setShowAddAllergy(false);
      fetchAllergies();
    } catch (error) {
      console.error('Error adding allergy:', error);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Cyberpunk Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-green-500/30"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 0, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative px-8 py-12 text-white">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-800 border-2 border-green-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/50">
                <Brain className="h-8 w-8 text-green-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                <Cpu className="h-3 w-3 text-gray-900" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                NUTRI AI
              </h1>
              <p className="text-green-300 text-lg font-bold tracking-wider">Neural Food Analysis System</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-800/40 border border-cyan-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-cyan-400 animate-pulse" />
                <div>
                  <p className="font-bold text-cyan-400">QUANTUM SCAN</p>
                  <p className="text-sm text-gray-300">Instant molecular analysis</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-red-400 animate-pulse" />
                <div>
                  <p className="font-bold text-red-400">THREAT DETECT</p>
                  <p className="text-sm text-gray-300">Allergy defense system</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-purple-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-purple-400 animate-pulse" />
                <div>
                  <p className="font-bold text-purple-400">NEURAL INSIGHTS</p>
                  <p className="text-sm text-gray-300">AI-powered recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cyberpunk Navigation Tabs */}
      <div className="flex space-x-2 bg-gray-800/60 border border-gray-700 rounded-2xl p-2 shadow-2xl">
        {[
          { id: 'scanner', label: 'NEURAL SCANNER', icon: Scan },
          { id: 'allergies', label: 'THREAT PROFILE', icon: Shield },
          { id: 'history', label: 'DATA LOGS', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-black transition-all duration-300 transform hover:scale-105 border ${
                isActive
                  ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-gray-900 shadow-xl shadow-green-500/25 border-green-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/80 border-gray-600 hover:border-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Neural Scanner Interface */}
      {activeView === 'scanner' && (
        <div className="space-y-8">
          {/* Threat Alert Panel */}
          {allergies.length > 0 && (
            <div className="relative overflow-hidden bg-gray-800/60 border border-red-500/50 rounded-3xl shadow-2xl shadow-red-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-2xl"></div>
              <div className="relative p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-red-400">THREAT PROFILE ACTIVE</h3>
                    <p className="text-red-300 font-bold">Neural scanner will check against these threats</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {allergies.map((allergy) => (
                    <div
                      key={allergy.id}
                      className={`px-4 py-2 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-300 border-2 ${
                        allergy.severity === 'life_threatening' ? 'bg-red-500/20 border-red-500 text-red-400' :
                        allergy.severity === 'severe' ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                        allergy.severity === 'moderate' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
                        'bg-green-500/20 border-green-500 text-green-400'
                      }`}
                    >
                      {allergy.allergen_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Scanner Interface */}
          <div className="bg-gray-800/60 border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2">NEURAL FOOD SCANNER</h2>
                <p className="text-gray-400 text-lg font-bold">Quantum analysis of molecular composition</p>
              </div>
              
              {/* Scanner Controls */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visual Scanner */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-cyan-400 flex items-center space-x-2">
                      <Camera className="h-6 w-6" />
                      <span>VISUAL SCANNER</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-6 font-black shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-blue-400"
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <span className="block tracking-wider">CAPTURE</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-6 font-black shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-purple-400"
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <span className="block tracking-wider">UPLOAD</span>
                      </button>
                    </div>
                  </div>

                  {/* Text Input Scanner */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-green-400 flex items-center space-x-2">
                      <Utensils className="h-6 w-6" />
                      <span>TEXT SCANNER</span>
                    </h3>
                    <div className="relative">
                      <textarea
                        value={foodInput}
                        onChange={(e) => setFoodInput(e.target.value)}
                        placeholder="Describe food composition... (e.g., 'Grilled protein with carbohydrates and nutrients')"
                        className="w-full h-32 px-6 py-4 bg-gray-900/80 border-2 border-gray-700 rounded-2xl text-green-400 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 transition-all duration-300 resize-none font-bold"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Brain className="h-5 w-5 text-green-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <div className="bg-gray-900/60 border-2 border-cyan-500/50 rounded-2xl p-4">
                      <img
                        src={imagePreview}
                        alt="Scan target"
                        className="w-full max-w-md mx-auto rounded-xl shadow-lg border-2 border-cyan-400/30"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-6 right-6 w-10 h-10 bg-red-500 border-2 border-red-400 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Neural Analysis Button */}
                <button
                  onClick={analyzeFood}
                  disabled={loading || (!foodInput.trim() && !selectedImage)}
                  className="w-full bg-gradient-to-r from-green-600 via-cyan-600 to-green-600 text-gray-900 rounded-2xl py-6 px-8 font-black text-xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group border-2 border-green-400"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
                        <span className="tracking-wider">NEURAL ANALYSIS IN PROGRESS...</span>
                      </>
                    ) : (
                      <>
                        <Target className="h-6 w-6" />
                        <span className="tracking-wider">INITIATE NEURAL SCAN</span>
                        <Zap className="h-6 w-6" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="bg-gray-800/60 border border-green-500/30 rounded-3xl shadow-2xl shadow-green-500/10 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-green-400">SCAN COMPLETE</h3>
                    <p className="text-gray-400 font-bold">Neural analysis results</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Health Score */}
                  <div className="bg-gray-900/60 border border-blue-500/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-black text-blue-400">HEALTH RATING</h4>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor((analysisResult.healthScore || 0) / 2)
                                ? 'text-cyan-400 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-4xl font-black text-cyan-400 mb-2">
                      {analysisResult.healthScore || 'N/A'}/10
                    </div>
                    <p className="text-gray-300 font-medium">{analysisResult.summary}</p>
                  </div>

                  {/* Threat Warnings */}
                  {analysisResult.allergyWarnings && analysisResult.allergyWarnings.length > 0 && (
                    <div className="bg-gray-900/60 border border-red-500/50 rounded-2xl p-6">
                      <h4 className="text-xl font-black text-red-400 mb-4 flex items-center space-x-2">
                        <AlertTriangle className="h-6 w-6 animate-pulse" />
                        <span>THREAT DETECTED</span>
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.allergyWarnings.map((warning: string, index: number) => (
                          <div key={index} className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                            <p className="text-red-300 font-bold">{warning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Neural Recommendations */}
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div className="mt-8 bg-gray-900/60 border border-purple-500/50 rounded-2xl p-6">
                    <h4 className="text-xl font-black text-purple-400 mb-4 flex items-center space-x-2">
                      <Brain className="h-6 w-6 animate-pulse" />
                      <span>NEURAL RECOMMENDATIONS</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="bg-gray-800/60 border border-purple-500/30 rounded-xl p-4">
                          <p className="text-purple-300 font-bold">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border-2 border-cyan-500 rounded-3xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black text-cyan-400">VISUAL CAPTURE</h3>
              <button
                onClick={stopCamera}
                className="w-10 h-10 bg-red-500 border-2 border-red-400 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-2xl mb-4 border-2 border-cyan-500/50"
            />
            <button
              onClick={capturePhoto}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl py-4 font-black text-lg hover:shadow-xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-cyan-400"
            >
              CAPTURE TARGET
            </button>
          </div>
        </div>
      )}

      {/* Hidden Elements */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default NutritionChecker;