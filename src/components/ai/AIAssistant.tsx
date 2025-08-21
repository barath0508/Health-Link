import React, { useState } from 'react';
import { 
  Brain, 
  MessageCircle, 
  Stethoscope, 
  Activity, 
  Pill, 
  Send,
  Bot,
  User,
  AlertCircle,
  TrendingUp,
  Calendar,
  Loader,
  Target,
  Shield,
  Zap,
  Heart,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import { generateHealthResponse, analyzeSymptoms, generateHealthPlan, analyzeMedication, generateEmergencyGuidance, analyzePrescriptionImage } from '../../lib/gemini';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI Health Assistant. I can help you with symptom analysis, health recommendations, medication reminders, and answer your health-related questions. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [healthPlan, setHealthPlan] = useState<any>(null);
  const [medicationAnalysis, setMedicationAnalysis] = useState<any>(null);
  const [emergencyGuidance, setEmergencyGuidance] = useState('');
  const [userProfile, setUserProfile] = useState({ age: '', gender: '', goals: '', conditions: '', activity: '' });
  const [medications, setMedications] = useState(['']);
  const [emergencySituation, setEmergencySituation] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionAnalysis, setPrescriptionAnalysis] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const features = [
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'symptoms', label: 'Symptom Checker', icon: Stethoscope },
    { id: 'health', label: 'Health Plan', icon: Target },
    { id: 'medication', label: 'Med Analysis', icon: Pill },
    { id: 'prescription', label: 'Prescription OCR', icon: FileText },
    { id: 'emergency', label: 'Emergency AI', icon: Shield },
    { id: 'wellness', label: 'Wellness Coach', icon: Heart },
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateHealthResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble responding right now. Please try again or consult with a healthcare professional.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSymptoms(symptoms);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateHealthPlan = async () => {
    setIsLoading(true);
    try {
      const plan = await generateHealthPlan(userProfile);
      setHealthPlan(plan);
    } catch (error) {
      console.error('Error generating health plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeMedications = async () => {
    const validMeds = medications.filter(med => med.trim());
    if (validMeds.length === 0) return;
    
    setIsLoading(true);
    try {
      const analysis = await analyzeMedication(validMeds);
      setMedicationAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyGuidance = async () => {
    if (!emergencySituation.trim()) return;
    
    setIsLoading(true);
    try {
      const guidance = await generateEmergencyGuidance(emergencySituation);
      setEmergencyGuidance(guidance);
    } catch (error) {
      console.error('Error getting emergency guidance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrescriptionUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPrescriptionFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzePrescription = async () => {
    if (!prescriptionFile) return;
    
    setIsLoading(true);
    try {
      const analysis = await analyzePrescriptionImage(prescriptionFile);
      setPrescriptionAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing prescription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChatInterface = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
              <div className="p-2 rounded-full bg-gray-200">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isLoading}
            placeholder="Ask me about your health concerns..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSymptomChecker = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Describe Your Symptoms</h3>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms in detail..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
        <button
          onClick={handleAnalyzeSymptoms}
          disabled={isAnalyzing}
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isAnalyzing && <Loader className="h-4 w-4 animate-spin" />}
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}</span>
        </button>
      </div>

      {analysisResult && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Risk Level: {analysisResult.riskLevel}</span>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Possible Conditions:</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.possibleConditions.map((condition: string) => (
                  <span key={condition} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {analysisResult.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHealthPlan = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Your Personalized Health Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            placeholder="Age"
            value={userProfile.age}
            onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={userProfile.gender}
            onChange={(e) => setUserProfile(prev => ({ ...prev, gender: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Health Goals (e.g., weight loss, fitness)"
            value={userProfile.goals}
            onChange={(e) => setUserProfile(prev => ({ ...prev, goals: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Current Conditions (optional)"
            value={userProfile.conditions}
            onChange={(e) => setUserProfile(prev => ({ ...prev, conditions: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={handleGenerateHealthPlan}
          disabled={isLoading}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          <span>Generate AI Health Plan</span>
        </button>
      </div>

      {healthPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Daily Goals</h3>
            </div>
            <div className="space-y-2">
              {healthPlan.dailyRecommendations?.map((rec: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Health Score: {healthPlan.healthScore}/100</h3>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${healthPlan.healthScore}%` }}></div>
            </div>
            <div className="space-y-2">
              {healthPlan.weeklyGoals?.map((goal: string, index: number) => (
                <div key={index} className="p-2 bg-green-50 rounded text-sm text-green-800">{goal}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMedicationAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication Analysis</h3>
        <div className="space-y-3 mb-4">
          {medications.map((med, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Medication ${index + 1}`}
              value={med}
              onChange={(e) => {
                const newMeds = [...medications];
                newMeds[index] = e.target.value;
                setMedications(newMeds);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          ))}
          <button
            onClick={() => setMedications([...medications, ''])}
            className="text-orange-600 text-sm hover:text-orange-700"
          >
            + Add Another Medication
          </button>
        </div>
        <button
          onClick={handleAnalyzeMedications}
          disabled={isLoading}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          <span>Analyze Medications</span>
        </button>
      </div>

      {medicationAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Timing & Interactions</h4>
            <div className="space-y-2">
              {medicationAnalysis.timingAdvice?.map((advice: string, index: number) => (
                <div key={index} className="p-2 bg-blue-50 rounded text-sm text-blue-800">{advice}</div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Safety Reminders</h4>
            <div className="space-y-2">
              {medicationAnalysis.reminders?.map((reminder: string, index: number) => (
                <div key={index} className="p-2 bg-green-50 rounded text-sm text-green-800">{reminder}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEmergencyAI = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Emergency AI Guidance</h3>
        </div>
        <p className="text-sm text-red-800 mb-4">For life-threatening emergencies, call 112/911 immediately!</p>
        <textarea
          value={emergencySituation}
          onChange={(e) => setEmergencySituation(e.target.value)}
          placeholder="Describe the emergency situation..."
          className="w-full h-24 px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
        />
        <button
          onClick={handleEmergencyGuidance}
          disabled={isLoading}
          className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          <span>Get Emergency Guidance</span>
        </button>
      </div>

      {emergencyGuidance && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Emergency Instructions</h4>
          <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
            {emergencyGuidance}
          </div>
        </div>
      )}
    </div>
  );

  const renderWellnessCoach = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-gray-900">Wellness Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-pink-50 rounded-lg">
            <p className="text-sm text-pink-800">Your stress levels seem elevated. Try 10 minutes of meditation.</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">Great job on your water intake! Keep it up.</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">Consider adding more protein to your breakfast.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Challenges</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-sm text-yellow-800">Take 5000 steps</span>
            <span className="text-yellow-600">3200/5000</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-green-800">Drink 8 glasses of water</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Brain className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">AI Health Assistant</h1>
            <p className="text-purple-100">Powered by Google Gemini AI - Intelligent health insights and personalized recommendations</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-purple-100 text-sm">Available</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">Gemini</div>
            <div className="text-purple-100 text-sm">AI Powered</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">Smart</div>
            <div className="text-purple-100 text-sm">Analysis</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">Safe</div>
            <div className="text-purple-100 text-sm">& Secure</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`p-4 rounded-lg text-center transition-colors ${
                  activeFeature === feature.id
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">{feature.label}</div>
              </button>
            );
          })}
        </div>

        <div>
          {activeFeature === 'chat' && renderChatInterface()}
          {activeFeature === 'symptoms' && renderSymptomChecker()}
          {activeFeature === 'health' && renderHealthPlan()}
          {activeFeature === 'medication' && renderMedicationAnalysis()}
          {activeFeature === 'prescription' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Prescription Image Analyzer</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a photo of your handwritten prescription to extract medication details using AI.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrescriptionUpload}
                    className="hidden"
                    id="prescription-upload"
                  />
                  <label
                    htmlFor="prescription-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <FileText className="h-12 w-12 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {prescriptionFile ? prescriptionFile.name : 'Click to upload prescription image'}
                    </span>
                    <span className="text-xs text-gray-500">Supports JPG, PNG, HEIC formats</span>
                  </label>
                </div>
                
                {prescriptionFile && (
                  <div className="mt-4 space-y-4">
                    {imagePreview && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Image Preview:</h4>
                        <img 
                          src={imagePreview} 
                          alt="Prescription preview" 
                          className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    <button
                      onClick={handleAnalyzePrescription}
                      disabled={isLoading}
                      className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                      <span>{isLoading ? 'Analyzing...' : 'Analyze Prescription'}</span>
                    </button>
                  </div>
                )}
              </div>

              {prescriptionAnalysis && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Prescription Analysis Results</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Patient Information</h5>
                      <div className="space-y-1 text-sm">
                        <p><strong>Patient:</strong> {prescriptionAnalysis.patientName}</p>
                        <p><strong>Doctor:</strong> {prescriptionAnalysis.doctorName}</p>
                        <p><strong>Date:</strong> {prescriptionAnalysis.date}</p>
                        <p><strong>Diagnosis:</strong> {prescriptionAnalysis.diagnosis}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Analysis Confidence</h5>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                        prescriptionAnalysis.confidence === 'High' ? 'bg-green-100 text-green-800' :
                        prescriptionAnalysis.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {prescriptionAnalysis.confidence} Confidence
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-700 mb-3">Medications</h5>
                    <div className="space-y-3">
                      {prescriptionAnalysis.medications?.map((med: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium text-gray-900">{med.name}</p>
                              <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Frequency: {med.frequency}</p>
                              <p className="text-sm text-gray-600">Duration: {med.duration}</p>
                            </div>
                          </div>
                          {med.instructions && (
                            <p className="text-sm text-blue-700 mt-2">Instructions: {med.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {prescriptionAnalysis.warnings && prescriptionAnalysis.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h5 className="font-medium text-amber-900 mb-2">Important Warnings</h5>
                      <ul className="space-y-1">
                        {prescriptionAnalysis.warnings.map((warning: string, index: number) => (
                          <li key={index} className="text-sm text-amber-800">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeFeature === 'emergency' && renderEmergencyAI()}
          {activeFeature === 'wellness' && renderWellnessCoach()}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-amber-900">Medical Disclaimer</h3>
        </div>
        <p className="text-sm text-amber-800">
          This AI assistant provides general health information and should not replace professional medical advice. 
          Always consult with qualified healthcare providers for medical concerns.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;