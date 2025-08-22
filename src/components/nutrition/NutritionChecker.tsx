import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, Utensils, Plus, X, Image } from 'lucide-react';
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

      // Save analysis
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Nutrition & Allergy Checker</h1>
        <p className="text-green-100">AI-powered food analysis for safe and healthy eating</p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'scanner', label: 'Food Scanner' },
          { id: 'allergies', label: 'My Allergies' },
          { id: 'history', label: 'Analysis History' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === tab.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Food Scanner */}
      {activeView === 'scanner' && (
        <div className="space-y-6">
          {/* User Allergies Display */}
          {allergies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-900">Your Allergies</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy) => (
                  <span
                    key={allergy.id}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      allergy.severity === 'life_threatening' ? 'bg-red-200 text-red-900' :
                      allergy.severity === 'severe' ? 'bg-orange-200 text-orange-900' :
                      allergy.severity === 'moderate' ? 'bg-yellow-200 text-yellow-900' :
                      'bg-green-200 text-green-900'
                    }`}
                  >
                    {allergy.allergen_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Analyze Food Item</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scan Food Image
                </label>
                <div className="flex space-x-2 mb-4">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Take Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Image</span>
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {imagePreview && (
                  <div className="relative mb-4">
                    <img
                      src={imagePreview}
                      alt="Selected food"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center text-gray-500 text-sm">
                OR
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Item or Ingredients
                </label>
                <textarea
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  placeholder="Enter food name, ingredients list, or describe the dish..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={analyzeFood}
                  disabled={loading || (!foodInput.trim() && !selectedImage)}
                  className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    {selectedImage ? <Image className="h-5 w-5" /> : <Utensils className="h-5 w-5" />}
                    <span>{selectedImage ? 'Analyze Image' : 'Analyze Food'}</span>
                  </>
                )}
                </button>
                
                <button
                  onClick={() => {
                    setFoodInput('Apple');
                    setTimeout(() => analyzeFood(), 100);
                  }}
                  disabled={loading}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
                >
                  Test with Apple
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Result */}
          {analysisResult && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
              
              {/* Health Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Health Score</span>
                  <span className="text-lg font-bold text-green-600">
                    {analysisResult.healthScore}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(analysisResult.healthScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Allergy Warnings */}
              {analysisResult.allergyWarnings?.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-900">Allergy Warnings</h4>
                  </div>
                  <ul className="text-sm text-red-800 space-y-1">
                    {analysisResult.allergyWarnings.map((warning: string, index: number) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutrition Info */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Nutritional Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {typeof analysisResult.nutrition === 'string' 
                      ? analysisResult.nutrition 
                      : JSON.stringify(analysisResult.nutrition, null, 2)}
                  </p>
                </div>
              </div>

              {/* Potential Allergens */}
              {analysisResult.potentialAllergens?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Potential Allergens Found</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.potentialAllergens.map((allergen: string, index: number) => {
                        const userHasAllergy = allergies.some(a => 
                          a.allergen_name.toLowerCase().includes(allergen.toLowerCase()) ||
                          allergen.toLowerCase().includes(a.allergen_name.toLowerCase())
                        );
                        return (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              userHasAllergy 
                                ? 'bg-red-200 text-red-900 border border-red-300' 
                                : 'bg-yellow-200 text-yellow-900'
                            }`}
                          >
                            {userHasAllergy && '⚠️ '}{allergen}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-yellow-700 mt-2">
                      Red items match your known allergies. Always check ingredient labels.
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {analysisResult.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Allergies Management */}
      {activeView === 'allergies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Food Allergies</h2>
            <button
              onClick={() => setShowAddAllergy(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Allergy</span>
            </button>
          </div>

          <div className="grid gap-4">
            {allergies.map((allergy) => (
              <div key={allergy.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{allergy.allergen_name}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        allergy.severity === 'life_threatening' ? 'bg-red-100 text-red-800' :
                        allergy.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                        allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {allergy.severity.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {allergy.symptoms?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Symptoms:</strong> {allergy.symptoms.join(', ')}
                        </p>
                      </div>
                    )}
                    {allergy.notes && (
                      <p className="text-sm text-gray-600 mt-1">{allergy.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allergies.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No allergies recorded</h3>
              <p className="text-gray-600 mb-4">Add your food allergies to get personalized warnings</p>
              <button
                onClick={() => setShowAddAllergy(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add First Allergy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analysis History */}
      {activeView === 'history' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Analysis History</h2>
          
          <div className="grid gap-4">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{analysis.food_item}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {analysis.nutrition_score}/10
                    </div>
                    <div className="text-xs text-gray-500">Health Score</div>
                  </div>
                </div>

                {analysis.allergy_warnings?.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Allergy Warnings</span>
                    </div>
                    <ul className="text-xs text-red-800">
                      {analysis.allergy_warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {analyses.length === 0 && (
            <div className="text-center py-12">
              <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analysis history</h3>
              <p className="text-gray-600">Start analyzing foods to see your history here</p>
            </div>
          )}
        </div>
      )}

      {/* Add Allergy Modal */}
      {showAddAllergy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Food Allergy</h3>
              <button
                onClick={() => setShowAddAllergy(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={addAllergy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergen Name
                </label>
                <input
                  type="text"
                  required
                  value={newAllergy.allergen_name}
                  onChange={(e) => setNewAllergy({...newAllergy, allergen_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Peanuts, Shellfish, Dairy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={newAllergy.severity}
                  onChange={(e) => setNewAllergy({...newAllergy, severity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="life_threatening">Life Threatening</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms (comma-separated)
                </label>
                <input
                  type="text"
                  value={newAllergy.symptoms}
                  onChange={(e) => setNewAllergy({...newAllergy, symptoms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Hives, Swelling, Difficulty breathing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newAllergy.notes}
                  onChange={(e) => setNewAllergy({...newAllergy, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddAllergy(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Allergy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take Photo</h3>
              <button
                onClick={stopCamera}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={stopCamera}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Capture</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default NutritionChecker;