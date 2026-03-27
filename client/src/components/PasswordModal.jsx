import { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

export default function PasswordModal({ isOpen, onClose, onSubmit, title = "Password Required" }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(password);
      setPassword('');
      onClose();
    } catch (error) {
      // Error handling done by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md glass rounded-2xl p-5 sm:p-6 relative max-h-[calc(100svh-1.5rem)] sm:max-h-[calc(100svh-2rem)] overflow-y-auto">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <Lock size={32} className="mx-auto text-brand-400 mb-3" />
          <h3 className="font-display font-600 text-xl text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">
            This content is password protected
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input-base pl-10 pr-10"
              autoFocus
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Submit'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}