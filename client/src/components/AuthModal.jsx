import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score, label: '', color: 'bg-gray-700', textColor: 'text-gray-400' };
    
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score === 0 || score === 1) return { score, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' };
  };

  const strength = calculatePasswordStrength(formData.password);

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
      onClose();
      setFormData({ email: '', password: '', name: '' });
      setPasswordTouched(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setFormData({ email: '', password: '', name: '' });
    setPasswordTouched(false);
  };

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md glass rounded-2xl p-5 sm:p-6 relative max-h-[calc(100svh-1.5rem)] sm:max-h-[calc(100svh-2rem)] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="font-display font-700 text-2xl text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === 'login' 
              ? 'Sign in to upload and manage files' 
              : 'Join ClipHub to start sharing files securely'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-base pl-10"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-base pl-10"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => {
                handleChange(e);
                if (!passwordTouched) {
                  setPasswordTouched(true);
                }
              }}
              required
              minLength="6"
              className="input-base pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === 'signup' && (
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                passwordTouched ? 'opacity-100 max-h-[300px]' : 'opacity-0 max-h-0'
              }`}
            >
              <div className="mt-2 space-y-3 p-1">
                <div className="flex gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((level) => (
                    <div 
                      key={level} 
                      className={`flex-1 rounded-full transition-colors duration-300 ${
                        strength.score >= level ? strength.color : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Password strength</span>
                  <span className={`font-medium ${strength.textColor}`}>
                    {strength.label}
                  </span>
                </div>

                <ul className="text-xs space-y-2 mt-2">
                  <li className={`flex items-center gap-2 transition-colors duration-300 ${formData.password.length >= 8 ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${formData.password.length >= 8 ? 'bg-green-400' : 'bg-gray-600'}`} />
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-2 transition-colors duration-300 ${/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${/[A-Z]/.test(formData.password) ? 'bg-green-400' : 'bg-gray-600'}`} />
                    One uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 transition-colors duration-300 ${/[0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${/[0-9]/.test(formData.password) ? 'bg-green-400' : 'bg-gray-600'}`} />
                    One number
                  </li>
                  <li className={`flex items-center gap-2 transition-colors duration-300 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-400' : 'bg-gray-600'}`} />
                    One special character
                  </li>
                </ul>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center disabled:opacity-50"
          >
            {isLoading ? 'Please wait...' : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}