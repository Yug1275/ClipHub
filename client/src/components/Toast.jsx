import { createContext, useContext, useState } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2);
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <Check size={16} />;
      case 'error': return <AlertCircle size={16} />;
      case 'warning': return <AlertCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              glass border rounded-xl p-4 min-w-[300px] max-w-md pointer-events-auto
              transform translate-x-0 transition-all duration-300 ease-out
              ${getColors(toast.type)}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getIcon(toast.type)}
              </div>
              <p className="flex-1 text-sm font-body">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};