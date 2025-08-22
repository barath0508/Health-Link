import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/auth/AuthForm';
import Layout from './components/Layout';
import BloodDonation from './components/blood/BloodDonation';
import Hospitals from './components/hospitals/Hospitals';
import Assistance from './components/assistance/Assistance';
import Medicines from './components/medicines/Medicines';
import HealthRecords from './components/health/HealthRecords';
import Doctors from './components/doctors/Doctors';
import AIAssistant from './components/ai/AIAssistant';
import Emergency from './components/emergency/Emergency';
import Campaigns from './components/campaigns/Campaigns';
import NutritionChecker from './components/nutrition/NutritionChecker';
import Home from './components/home/Home';
import HealthCard from './components/healthcard/HealthCard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'blood':
        return <BloodDonation />;
      case 'hospitals':
        return <Hospitals />;
      case 'assistance':
        return <Assistance />;
      case 'medicines':
        return <Medicines />;
      case 'health':
        return <HealthRecords />;
      case 'doctors':
        return <Doctors />;
      case 'ai':
        return <AIAssistant />;
      case 'emergency':
        return <Emergency />;
      case 'campaigns':
        return <Campaigns />;
      case 'nutrition':
        return <NutritionChecker />;
      case 'healthcard':
        return <HealthCard />;
      default:
        return <Home />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveComponent()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;