import { X, AlertTriangle, Clock, Eye } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function OverwriteWarning({ 
  isOpen, 
  onClose, 
  onConfirm, 
  existingInfo,
  type = 'clip' // 'clip' or 'file'
}) {
  if (!isOpen || !existingInfo) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'Expired';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md glass rounded-2xl p-5 sm:p-6 relative max-h-[calc(100svh-1.5rem)] sm:max-h-[calc(100svh-2rem)] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <AlertTriangle size={32} className="mx-auto text-yellow-400 mb-3" />
          <h3 className="font-display font-600 text-xl text-white mb-2">Replace existing {type}?</h3>
          <p className="text-gray-400 text-sm">
            This key already has content that will be permanently replaced
          </p>
        </div>

        {/* Existing Content Info */}
        <div className="glass rounded-lg p-4 mb-6 text-left">
          <h4 className="text-white font-medium text-sm mb-3">Existing {type}:</h4>
          
          {type === 'clip' ? (
            <>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Created {formatDate(existingInfo.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={12} />
                  <span>
                    {existingInfo.viewCount} view{existingInfo.viewCount !== 1 ? 's' : ''}
                    {existingInfo.maxViews && ` (max: ${existingInfo.maxViews})`}
                  </span>
                </div>
                {existingInfo.expiresIn > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    <span>Expires in {formatTimeRemaining(existingInfo.expiresIn)}</span>
                  </div>
                )}
                {existingInfo.hasPassword && (
                  <div className="text-yellow-400">🔒 Password protected</div>
                )}
              </div>
              
              {existingInfo.contentPreview && (
                <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-300 font-mono">
                  "{existingInfo.contentPreview}"
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2 text-xs text-gray-400">
              <div className="text-white text-sm">{existingInfo.originalName}</div>
              <div>{formatFileSize(existingInfo.size)}</div>
              <div className="flex items-center gap-2">
                <span>By {existingInfo.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  {existingInfo.downloadCount} download{existingInfo.downloadCount !== 1 ? 's' : ''}
                  {existingInfo.maxDownloads && ` (max: ${existingInfo.maxDownloads})`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={12} />
                <span>Uploaded {formatDate(existingInfo.createdAt)}</span>
              </div>
              {existingInfo.hasPassword && (
                <div className="text-yellow-400">🔒 Password protected</div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white font-body font-medium
                       px-6 py-3 rounded-xl transition-all duration-200 flex-1"
          >
            Replace {type}
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}