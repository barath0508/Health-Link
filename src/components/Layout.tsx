import React, { useState } from 'react';
import { 
  Heart, 
  Building2, 
  HandHeart, 
  Pill, 
  FileText, 
  UserCheck,
  Phone,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  Apple,
  Home,
  CreditCard,
  Cpu,
  Zap,
  Shield,
  Brain
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Neural Hub', icon: Home, color: 'from-cyan-400 to-blue-500' },
    { id: 'blood', label: 'Blood Net', icon: Heart, color: 'from-red-400 to-pink-500' },
    { id: 'hospitals', label: 'Med Centers', icon: Building2, color: 'from-blue-400 to-indigo-500' },
    { id: 'assistance', label: 'Support Grid', icon: HandHeart, color: 'from-green-400 to-emerald-500' },
    { id: 'medicines', label: 'Pharma Core', icon: Pill, color: 'from-purple-400 to-violet-500' },
    { id: 'health', label: 'Data Vault', icon: FileText, color: 'from-indigo-400 to-purple-500' },
    { id: 'doctors', label: 'Expert Net', icon: UserCheck, color: 'from-teal-400 to-cyan-500' },
    { id: 'campaigns', label: 'Health Ops', icon: Calendar, color: 'from-orange-400 to-red-500' },
    { id: 'nutrition', label: 'Nutri AI', icon: Apple, color: 'from-lime-400 to-green-500' },
    { id: 'healthcard', label: 'Bio ID', icon: CreditCard, color: 'from-gray-400 to-slate-500' },
    { id: 'ai', label: 'Neural AI', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { id: 'emergency', label: 'Crisis Mode', icon: Phone, color: 'from-red-500 to-orange-500' },
  ];

  const handleSignOut = () => {
    signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Neon Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

      {/* Futuristic Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Cyberpunk Logo */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative group">
                <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-gray-800 border-2 border-cyan-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/50">
                  <Heart className="h-5 w-5 sm:h-7 sm:w-7 text-cyan-400" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-pink-500 rounded-full animate-ping"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  HealthLink
                </h1>
                <div className="flex items-center space-x-2">
                  <Cpu className="h-3 w-3 text-cyan-400 animate-pulse" />
                  <p className="text-sm text-gray-400 font-bold tracking-wider">NEURAL HEALTH SYSTEM</p>
                  <Zap className="h-3 w-3 text-yellow-400 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Cyberpunk Navigation */}
            <nav className="hidden md:flex space-x-1 overflow-x-auto max-w-4xl scrollbar-hide">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`group relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl font-bold transition-all duration-300 whitespace-nowrap border text-xs sm:text-sm ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-gray-900 shadow-lg border-transparent`
                        : 'bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700/80 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`p-1 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-black/20' : 'bg-gray-700 group-hover:bg-gray-600'
                    }`}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <span className="font-black hidden lg:inline tracking-wide">{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-white/10 rounded-lg sm:rounded-xl animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User Interface */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-white">{profile?.full_name}</p>
                  <p className="text-xs text-cyan-400 capitalize font-bold tracking-wider">{profile?.role}</p>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative h-8 w-8 sm:h-12 sm:w-12 bg-gray-800 border-2 border-cyan-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 sm:h-6 sm:w-6 text-cyan-400" />
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-red-500/25"
                  title="Disconnect"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-300 hover:scale-110"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-cyan-500/30">
            <div className="px-4 sm:px-6 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 sm:space-x-4 px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-left transition-all duration-300 border text-sm sm:text-base ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-gray-900 border-transparent shadow-xl`
                        : 'bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700/80 border-gray-700'
                    }`}
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${isActive ? 'bg-black/20' : 'bg-gray-700'}`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="font-black tracking-wide">{item.label}</span>
                  </button>
                );
              })}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="sm:hidden mb-4 p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                  <p className="text-sm font-bold text-white">{profile?.full_name}</p>
                  <p className="text-xs text-cyan-400 capitalize font-bold tracking-wider">{profile?.role}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 sm:space-x-4 px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/30">
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="font-black">DISCONNECT</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;