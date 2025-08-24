import React, { useState } from 'react';
import { Heart, Eye, EyeOff, Loader, Pill, FileText, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'patient' as const,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created successfully! Please sign in.');
          setIsSignUp(false);
          setFormData({ ...formData, password: '' });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 p-4 rounded-xl shadow-lg shadow-cyan-500/25 animate-pulse">
              <Heart className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-wider">
                HEALTH-LINK
              </h1>
              <p className="text-sm text-cyan-400 font-bold tracking-widest">DIGITAL HEALTH PLATFORM</p>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-wider">
            {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </h2>
          <p className="text-cyan-300">
            {isSignUp 
              ? 'Join the digital health platform'
              : 'Access your health dashboard'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-cyan-500/30 backdrop-blur-sm">
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 backdrop-blur-sm">
              <p className="text-red-300 text-sm font-bold">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-6 backdrop-blur-sm">
              <p className="text-green-300 text-sm font-bold">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-black text-cyan-400 mb-2 tracking-wider">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-cyan-400 mb-2 tracking-wider">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-gray-400"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-cyan-400 mb-2 tracking-wider">
                    ROLE
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white"
                  >
                    <option value="patient">Patient</option>
                    <option value="donor">Blood Donor</option>
                    <option value="doctor">Doctor</option>
                    <option value="hospital">Hospital</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-black text-cyan-400 mb-2 tracking-wider">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-gray-400"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-cyan-400 mb-2 tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 bg-gray-900 border border-cyan-500/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-4 rounded-lg font-black tracking-wider hover:from-cyan-400 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>{isSignUp ? 'CREATING ACCOUNT...' : 'SIGNING IN...'}</span>
                </div>
              ) : (
                <span>{isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                  setFormData({ ...formData, password: '' });
                }}
                className="ml-2 text-cyan-400 hover:text-cyan-300 font-bold transition-colors tracking-wider"
              >
                {isSignUp ? 'SIGN IN' : 'SIGN UP'}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4 font-bold tracking-wider">TRUSTED HEALTHCARE PLATFORM</p>
          <div className="flex justify-center space-x-6 sm:space-x-8 text-xs text-gray-400">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-1">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="font-bold tracking-wider">BLOOD DONATION</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-1">
              <Pill className="h-4 w-4 text-purple-400" />
              <span className="font-bold tracking-wider">MEDICINES</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-1">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span className="font-bold tracking-wider">HEALTH RECORDS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;