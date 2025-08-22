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
      text: 'Neural connection established! I\'m your AI Health Assistant. I can analyze symptoms, provide health recommendations, medication protocols, and answer your health queries. How can I assist your neural network today?',
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
    { id: 'chat', label: 'Neural Chat', icon: MessageCircle },
    { id: 'symptoms', label: 'Symptom Scan', icon: Stethoscope },
    { id: 'health', label: 'Health Matrix', icon: Target },
    { id: 'medication', label: 'Med Analysis', icon: Pill },
    { id: 'prescription', label: 'Script OCR', icon: FileText },
    { id: 'emergency', label: 'Crisis AI', icon: Shield },
    { id: 'wellness', label: 'Wellness Core', icon: Heart },
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
        text: 'Neural connection disrupted. Please retry or consult with a healthcare specialist.',
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
    <div className="bg-gray-800 rounded-xl shadow-lg border border-purple-500/30 h-96 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-purple-500' : 'bg-gray-700 border border-purple-500/30'}`}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-purple-400" />
                )}
              </div>
              <div className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-200 border border-purple-500/30'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
              <div className="p-2 rounded-full bg-gray-700 border border-purple-500/30">
                <Bot className="h-4 w-4 text-purple-400" />
              </div>
              <div className="p-3 rounded-lg bg-gray-700 text-gray-200 border border-purple-500/30">
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin text-purple-400" />
                  <span className="text-sm">Neural processing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-purple-500/30">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isLoading}
            placeholder="Ask about your health neural network..."
            className="flex-1 px-3 py-2 bg-gray-900 border border-purple-500/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all disabled:opacity-50 flex items-center space-x-2 font-black tracking-wider shadow-lg shadow-purple-500/25"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSymptomChecker = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl shadow-lg border border-green-500/30 p-6">
        <h3 className="text-lg font-black text-green-400 mb-4 tracking-wider">DESCRIBE SYMPTOMS</h3>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms in detail for neural analysis..."
          className="w-full h-32 px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-white placeholder-gray-400"
        />
        <button
          onClick={handleAnalyzeSymptoms}
          disabled={isAnalyzing}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-teal-400 text-black rounded-lg hover:from-green-400 hover:to-teal-300 transition-all disabled:opacity-50 flex items-center space-x-2 font-black tracking-wider shadow-lg shadow-green-500/25"
        >
          {isAnalyzing && <Loader className="h-4 w-4 animate-spin" />}
          <span>{isAnalyzing ? 'ANALYZING...' : 'ANALYZE SYMPTOMS'}</span>
        </button>
      </div>

      {analysisResult && (
        <div className="bg-gray-800 rounded-xl shadow-lg border border-green-500/30 p-6">
          <h3 className="text-lg font-black text-green-400 mb-4 tracking-wider">ANALYSIS RESULTS</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <span className="font-black text-white tracking-wider">RISK LEVEL: {analysisResult.riskLevel}</span>
            </div>
            
            <div>
              <h4 className="font-black text-gray-300 mb-2 tracking-wider">POSSIBLE CONDITIONS:</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.possibleConditions.map((condition: string) => (
                  <span key={condition} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-sm font-bold tracking-wider border border-blue-500/30">
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-black text-gray-300 mb-2 tracking-wider">RECOMMENDATIONS:</h4>
              <ul className="space-y-1">
                {analysisResult.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-300">• {rec}</li>
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
      <div className="bg-gray-800 rounded-xl shadow-lg border border-purple-500/30 p-6">
        <h3 className="text-lg font-black text-purple-400 mb-4 tracking-wider">CREATE PERSONALIZED HEALTH MATRIX</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            placeholder="Age Cycle"
            value={userProfile.age}
            onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
            className="px-3 py-2 bg-gray-900 border border-purple-500/50 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
          />
          <select
            value={userProfile.gender}
            onChange={(e) => setUserProfile(prev => ({ ...prev, gender: e.target.value }))}
            className="px-3 py-2 bg-gray-900 border border-purple-500/50 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Health Goals (e.g., weight optimization, fitness)"
            value={userProfile.goals}
            onChange={(e) => setUserProfile(prev => ({ ...prev, goals: e.target.value }))}
            className="px-3 py-2 bg-gray-900 border border-purple-500/50 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Current Conditions (optional)"
            value={userProfile.conditions}
            onChange={(e) => setUserProfile(prev => ({ ...prev, conditions: e.target.value }))}
            className="px-3 py-2 bg-gray-900 border border-purple-500/50 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
          />
        </div>
        <button
          onClick={handleGenerateHealthPlan}
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all disabled:opacity-50 flex items-center space-x-2 font-black tracking-wider shadow-lg shadow-purple-500/25"
        >
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          <span>GENERATE AI HEALTH MATRIX</span>
        </button>
      </div>

      {healthPlan && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-purple-500/30 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-black text-purple-400 tracking-wider">DAILY PROTOCOLS</h3>
            </div>
            <div className="space-y-2">
              {healthPlan.dailyRecommendations?.map((rec: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg border border-purple-500/30 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-black text-green-400 tracking-wider">HEALTH SCORE: {healthPlan.healthScore}/100</h3>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4 border border-green-500/30">
              <div className="bg-gradient-to-r from-green-500 to-teal-400 h-3 rounded-full shadow-lg shadow-green-500/25" style={{ width: `${healthPlan.healthScore}%` }}></div>
            </div>
            <div className="space-y-2">
              {healthPlan.weeklyGoals?.map((goal: string, index: number) => (
                <div key={index} className="p-2 bg-green-900/30 rounded text-sm text-green-300 border border-green-500/30">{goal}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMedicationAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl shadow-lg border border-orange-500/30 p-6">
        <h3 className="text-lg font-black text-orange-400 mb-4 tracking-wider">MEDICATION ANALYSIS</h3>
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
              className="w-full px-3 py-2 bg-gray-900 border border-orange-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
            />
          ))}
          <button
            onClick={() => setMedications([...medications, ''])}
            className="text-orange-400 text-sm hover:text-orange-300 font-black tracking-wider"
          >
            + ADD ANOTHER MEDICATION
          </button>
        </div>
        <button
          onClick={handleAnalyzeMedications}
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-400 hover:to-red-400 transition-all disabled:opacity-50 flex items-center space-x-2 font-black tracking-wider shadow-lg shadow-orange-500/25"
        >
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          <span>ANALYZE MEDICATIONS</span>
        </button>
      </div>

      {medicationAnalysis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-orange-500/30 p-6">
            <h4 className="font-black text-orange-400 mb-3 tracking-wider">TIMING & INTERACTIONS</h4>
            <div className="space-y-2">
              {medicationAnalysis.timingAdvice?.map((advice: string, index: number) => (
                <div key={index} className="p-2 bg-blue-900/30 rounded text-sm text-blue-300 border border-blue-500/30">{advice}</div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl shadow-lg border border-orange-500/30 p-6">
            <h4 className="font-black text-orange-400 mb-3 tracking-wider">SAFETY PROTOCOLS</h4>
            <div className="space-y-2">
              {medicationAnalysis.reminders?.map((reminder: string, index: number) => (
                <div key={index} className="p-2 bg-green-900/30 rounded text-sm text-green-300 border border-green-500/30">{reminder}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEmergencyAI = () => (
    <div className="space-y-6">
      <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-black text-red-400 tracking-wider">CRISIS AI GUIDANCE</h3>
        </div>
        <p className="text-sm text-red-300 mb-4 font-bold">For life-threatening emergencies, call 112/911 immediately!</p>
        <textarea
          value={emergencySituation}
          onChange={(e) => setEmergencySituation(e.target.value)}
          placeholder="Describe the crisis situation..."
          className="w-full h-24 px-3 py-2 bg-gray-900 border border-red-500/50 rounded-lg focus:ring-2 focus:ring-red-500 resize-none text-white placeholder-gray-400"
        />
        <button
          onClick={handleEmergencyGuidance}
          disabled={isLoading}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-400 hover:to-orange-400 transition-all disabled:opacity-50 flex items-center space-x-2 font-black tracking-wider shadow-lg shadow-red-500/25"
        >
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          <span>GET CRISIS GUIDANCE</span>
        </button>
      </div>

      {emergencyGuidance && (
        <div className="bg-gray-800 rounded-xl shadow-lg border border-red-500/30 p-6">
          <h4 className="font-black text-red-400 mb-3 tracking-wider">CRISIS INSTRUCTIONS</h4>
          <div className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-900/50 p-4 rounded-lg border border-red-500/30">
            {emergencyGuidance}
          </div>
        </div>
      )}
    </div>
  );

  const renderWellnessCoach = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="bg-gray-800 rounded-xl shadow-lg border border-pink-500/30 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-pink-400" />
          <h3 className="text-lg font-black text-pink-400 tracking-wider">WELLNESS INSIGHTS</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-pink-900/30 rounded-lg border border-pink-500/30">
            <p className="text-sm text-pink-300">Your stress levels seem elevated. Try 10 minutes of neural meditation.</p>
          </div>
          <div className="p-3 bg-green-900/30 rounded-lg border border-green-500/30">
            <p className="text-sm text-green-300">Great job on your hydration intake! Keep it optimized.</p>
          </div>
          <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-300">Consider adding more protein to your morning fuel.</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg border border-yellow-500/30 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-black text-yellow-400 tracking-wider">DAILY CHALLENGES</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
            <span className="text-sm text-yellow-300 font-bold">Take 5000 steps</span>
            <span className="text-yellow-400 font-black">3200/5000</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-900/30 rounded-lg border border-green-500/30">
            <span className="text-sm text-green-300 font-bold">Drink 8 glasses of water</span>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
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
              <Brain className="h-10 sm:h-12 w-10 sm:w-12" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider">AI NEURAL ASSISTANT</h1>
              <p className="text-purple-100 font-bold tracking-wide">Powered by Gemini AI - Intelligent health neural network</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">24/7</div>
              <div className="text-purple-100 text-xs sm:text-sm font-bold tracking-wider">AVAILABLE</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">GEMINI</div>
              <div className="text-purple-100 text-xs sm:text-sm font-bold tracking-wider">AI POWERED</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">SMART</div>
              <div className="text-purple-100 text-xs sm:text-sm font-bold tracking-wider">ANALYSIS</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black">SECURE</div>
              <div className="text-purple-100 text-xs sm:text-sm font-bold tracking-wider">& SAFE</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg border border-purple-500/30 p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 mb-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`p-3 sm:p-4 rounded-lg text-center transition-all ${
                  activeFeature === feature.id
                    ? 'bg-purple-500/30 text-purple-300 border-2 border-purple-500/50 shadow-lg shadow-purple-500/25'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 border border-gray-500/30'
                }`}
              >
                <Icon className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2" />
                <div className="text-xs sm:text-sm font-black tracking-wider">{feature.label}</div>
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
              <div className="bg-gray-800 rounded-xl shadow-lg border border-indigo-500/30 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-black text-indigo-400 tracking-wider">PRESCRIPTION NEURAL ANALYZER</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Upload a photo of your handwritten prescription to extract medication details using AI.
                </p>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
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
                    <FileText className="h-12 w-12 text-gray-500" />
                    <span className="text-sm text-gray-400">
                      {prescriptionFile ? prescriptionFile.name : 'Click to upload prescription image'}
                    </span>
                    <span className="text-xs text-gray-500">Supports JPG, PNG, HEIC formats</span>
                  </label>
                </div>
                
                {prescriptionFile && (
                  <div className="mt-4 space-y-4">
                    {imagePreview && (
                      <div className="border border-gray-600 rounded-lg p-4">
                        <h4 className="text-sm font-black text-gray-300 mb-2 tracking-wider">IMAGE PREVIEW:</h4>
                        <img 
                          src={imagePreview} 
                          alt="Prescription preview" 
                          className="max-w-full h-auto max-h-64 rounded-lg border border-gray-600"
                        />
                      </div>
                    )}
                    <button
                      onClick={handleAnalyzePrescription}
                      disabled={isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all disabled:opacity-50 flex items-center space-x-2 font-black tracking-wider shadow-lg shadow-indigo-500/25"
                    >
                      {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                      <span>{isLoading ? 'ANALYZING...' : 'ANALYZE PRESCRIPTION'}</span>
                    </button>
                  </div>
                )}
              </div>

              {prescriptionAnalysis && (
                <div className="bg-gray-800 rounded-xl shadow-lg border border-indigo-500/30 p-6">
                  <h4 className="font-black text-indigo-400 mb-4 tracking-wider">PRESCRIPTION ANALYSIS RESULTS</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="font-black text-gray-300 mb-2 tracking-wider">PATIENT INFORMATION</h5>
                      <div className="space-y-1 text-sm">
                        <p><strong>Patient:</strong> {prescriptionAnalysis.patientName}</p>
                        <p><strong>Specialist:</strong> {prescriptionAnalysis.doctorName}</p>
                        <p><strong>Date:</strong> {prescriptionAnalysis.date}</p>
                        <p><strong>Diagnosis:</strong> {prescriptionAnalysis.diagnosis}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-black text-gray-300 mb-2 tracking-wider">ANALYSIS CONFIDENCE</h5>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-black tracking-wider ${
                        prescriptionAnalysis.confidence === 'High' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                        prescriptionAnalysis.confidence === 'Medium' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-900/50 text-red-400 border border-red-500/30'
                      }`}>
                        {prescriptionAnalysis.confidence} CONFIDENCE
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h5 className="font-black text-gray-300 mb-3 tracking-wider">MEDICATIONS</h5>
                    <div className="space-y-3">
                      {prescriptionAnalysis.medications?.map((med: any, index: number) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="font-black text-white">{med.name}</p>
                              <p className="text-sm text-gray-400">Dosage: {med.dosage}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Frequency: {med.frequency}</p>
                              <p className="text-sm text-gray-400">Duration: {med.duration}</p>
                            </div>
                          </div>
                          {med.instructions && (
                            <p className="text-sm text-blue-300 mt-2">Instructions: {med.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {prescriptionAnalysis.warnings && prescriptionAnalysis.warnings.length > 0 && (
                    <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-4">
                      <h5 className="font-black text-amber-400 mb-2 tracking-wider">IMPORTANT WARNINGS</h5>
                      <ul className="space-y-1">
                        {prescriptionAnalysis.warnings.map((warning: string, index: number) => (
                          <li key={index} className="text-sm text-amber-300">• {warning}</li>
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

      <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-black text-amber-400 tracking-wider">MEDICAL DISCLAIMER</h3>
        </div>
        <p className="text-sm text-amber-300">
          This AI assistant provides general health information and should not replace professional medical advice. 
          Always consult with qualified healthcare specialists for medical concerns.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;