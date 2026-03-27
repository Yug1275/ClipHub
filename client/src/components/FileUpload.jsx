import { useState, useRef } from 'react';
import { 
  Upload, File, X, Download, Trash2, AlertCircle, QrCode, 
  Lock, Eye, EyeOff, Shield, Users 
} from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './Toast';
import QRCodeModal from './QRCodeModal';
import PasswordModal from './PasswordModal';
import OverwriteWarning from './OverwriteWarning';

const FILE_EXPIRY_OPTIONS = [
  { label: '1 hour', value: '1h' },
  { label: '1 day', value: '1d' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'Never', value: 'never' }
];

const MAX_DOWNLOADS_OPTIONS = [
  { label: 'Unlimited', value: null },
  { label: '1 download', value: 1 },
  { label: '3 downloads', value: 3 },
  { label: '5 downloads', value: 5 },
  { label: '10 downloads', value: 10 },
  { label: '25 downloads', value: 25 },
];

export default function FileUpload({ fileKey, onKeyChange }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiry, setExpiry] = useState('1d');
  const [maxDownloads, setMaxDownloads] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [overwriteWarningOpen, setOverwriteWarningOpen] = useState(false);
  const [existingFileInfo, setExistingFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  const { uploadFile, downloadFile, deleteFile, checkFileExists, uploading, error } = useFileUpload();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const handleFileSelect = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setSelectedFile(file);
    } else {
      toast.error('File size must be less than 10MB');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!fileKey || !selectedFile) return;

    try {
      // Check if file exists first
      const existsResult = await checkFileExists(fileKey);
      if (existsResult.exists) {
        setExistingFileInfo(existsResult.info);
        setOverwriteWarningOpen(true);
        return;
      }

      await performUpload();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message);
    }
  };

  const performUpload = async () => {
    try {
      const options = {};
      if (password) options.password = password;
      if (maxDownloads) options.maxViews = maxDownloads; // Using maxViews for consistency

      await uploadFile(fileKey, selectedFile, expiry, options);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setSelectedFile(null);
      toast.success('File uploaded successfully!');
    } catch (err) {
      throw err;
    }
  };

  const handleDownload = async (inputPassword = null) => {
    if (!fileKey) return;
    
    try {
      await downloadFile(fileKey, inputPassword);
      toast.success('Download started!');
    } catch (err) {
      if (err.message.includes('password protected')) {
        setPasswordModalOpen(true);
        return;
      }
      toast.error(err.message);
    }
  };

  const handlePasswordSubmit = async (inputPassword) => {
    await handleDownload(inputPassword);
  };

  const handleDelete = async () => {
    if (!fileKey) return;
    
    try {
      await deleteFile(fileKey);
      setSelectedFile(null);
      toast.success('File deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message);
    }
  };

  const handleQRCode = () => {
    if (!fileKey) {
      toast.error('Please enter a file key first');
      return;
    }
    setQrModalOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isAuthenticated) {
    return (
      <div className="card border-2 border-dashed border-gray-600 text-center py-8">
        <AlertCircle size={32} className="mx-auto text-gray-500 mb-3" />
        <p className="text-gray-400 mb-2">File uploads require authentication</p>
        <p className="text-gray-500 text-sm">Sign in to upload and share files securely</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* File Key Input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <File size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={fileKey}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder="file-key"
            className="input-base pl-9"
          />
        </div>
        <button
          onClick={() => handleDownload()}
          disabled={!fileKey}
          className="btn-ghost text-sm py-2 px-4 disabled:opacity-40 flex items-center gap-1"
        >
          <Download size={14} /> Load
        </button>
        <button
          onClick={handleQRCode}
          disabled={!fileKey}
          className="btn-ghost text-sm py-2 px-4 disabled:opacity-40 flex items-center gap-1"
        >
          <QrCode size={14} /> QR
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
          <Upload size={16} className="text-green-400" />
          <span className="text-green-400 text-sm">File uploaded successfully!</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-brand-500 bg-brand-500/10' 
            : 'border-gray-600 hover:border-gray-500'
          }
        `}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.docx,.xlsx,.pptx,.zip,.json"
        />

        <Upload size={32} className="mx-auto text-gray-500 mb-3" />
        
        {selectedFile ? (
          <div className="space-y-2">
            <p className="text-white font-medium">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-red-400 text-sm"
            >
              <X size={14} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-1">
              {dragActive ? 'Drop your file here' : 'Click to select or drag & drop'}
            </p>
            <p className="text-gray-500 text-sm">
              Images, documents, archives up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Advanced Options (only show when file is selected) */}
      {selectedFile && (
        <>
          <div className="mb-4">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Shield size={14} />
              Advanced options
              <span className={`transition-transform duration-200 ${showAdvancedOptions ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>

          {showAdvancedOptions && (
            <div className="glass rounded-xl p-4 space-y-4">
              
              {/* Password Protection */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                  <Lock size={14} />
                  Password protection (optional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Set password to protect this file"
                    className="input-base pr-10"
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Download Limit */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                  <Users size={14} />
                  Download limit
                </label>
                <div className="flex gap-1 flex-wrap">
                  {MAX_DOWNLOADS_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setMaxDownloads(opt.value)}
                      className={`
                        text-xs px-3 py-1.5 rounded-lg transition-all duration-150 
                        ${maxDownloads === opt.value
                          ? 'bg-brand-500/25 text-brand-400 border border-brand-500/40'
                          : 'text-gray-500 hover:text-gray-300 glass-hover'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {maxDownloads && (
                  <p className="text-xs text-gray-500 mt-1">
                    File will be automatically deleted after {maxDownloads} download{maxDownloads !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

            </div>
          )}

          {/* Expiry & Upload */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Expires:</span>
              <div className="flex gap-1">
                {FILE_EXPIRY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExpiry(opt.value)}
                    className={`
                      text-xs px-2.5 py-1 rounded-lg transition-all duration-150 
                      ${expiry === opt.value
                        ? 'bg-brand-500/25 text-brand-400 border border-brand-500/40'
                        : 'text-gray-500 hover:text-gray-300 glass-hover'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={!fileKey}
                className="btn-ghost text-sm py-2 px-3 text-red-400 hover:text-red-300 disabled:opacity-40"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={handleUpload}
                disabled={!fileKey || uploading}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-40"
              >
                {uploading ? 'Uploading...' : 'Upload file'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {qrModalOpen && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          clipKey={fileKey}
          shareType="file"
          title="Share File Link"
        />
      )}

      <PasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        title="File Password Required"
      />

      <OverwriteWarning
        isOpen={overwriteWarningOpen}
        onClose={() => {
          setOverwriteWarningOpen(false)
          setExistingFileInfo(null)
        }}
        onConfirm={async () => {
          setOverwriteWarningOpen(false)
          setExistingFileInfo(null)
          await performUpload()
        }}
        existingInfo={existingFileInfo}
        type="file"
      />

    </div>
  );
}