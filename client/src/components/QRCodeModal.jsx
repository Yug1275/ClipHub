import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Share2, Check } from 'lucide-react';
import { useToast } from './Toast';
import { isLocal as isLocalMode } from '../utils/api';

const LOCAL_PORT = '5173';
const DEFAULT_LOCAL_IP = '10.110.48.205';
const GLOBAL_BASE_URL = 'https://cliphub.app';
const LOCAL_IP_STORAGE_KEY = 'cliphub_last_local_ip';

const isValidIPv4 = (value) => {
  const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  return ipRegex.test(value);
};

export default function QRCodeModal({
  isOpen,
  onClose,
  url,
  clipKey,
  shareType,
  title = 'Share QR Code'
}) {
  const [copied, setCopied] = useState(false);
  const mode = isLocalMode ? 'local' : 'global';
  const [localIP, setLocalIP] = useState(() => localStorage.getItem(LOCAL_IP_STORAGE_KEY) || DEFAULT_LOCAL_IP);
  const localInputRef = useRef(null);
  const toast = useToast();

  const parsedUrlContext = useMemo(() => {
    if (!url) {
      return { fallbackKey: '', fallbackType: '' };
    }

    try {
      const parsed = new URL(url);
      return {
        fallbackKey: parsed.searchParams.get('key') || '',
        fallbackType: parsed.searchParams.get('type') || ''
      };
    } catch {
      return { fallbackKey: '', fallbackType: '' };
    }
  }, [url]);

  const resolvedKey = clipKey || parsedUrlContext.fallbackKey;
  const resolvedType = shareType || parsedUrlContext.fallbackType;
  const hasValidLocalIP = isValidIPv4(localIP.trim());

  const qrUrl = useMemo(() => {
    const query = new URLSearchParams({ key: resolvedKey || '' });
    if (resolvedType) {
      query.set('type', resolvedType);
    }

    if (mode === 'local') {
      const trimmedIP = localIP.trim();
      if (!trimmedIP || !isValidIPv4(trimmedIP)) {
        return '';
      }

      return `http://${trimmedIP}:${LOCAL_PORT}/clip?${query.toString()}`;
    }

    return `${GLOBAL_BASE_URL}/clip?${query.toString()}`;
  }, [localIP, mode, resolvedKey, resolvedType]);

  useEffect(() => {
    if (mode === 'local' && isOpen) {
      localInputRef.current?.focus();
      localInputRef.current?.select();
    }
  }, [mode, isOpen]);

  useEffect(() => {
    const trimmedIP = localIP.trim();
    if (isValidIPv4(trimmedIP)) {
      localStorage.setItem(LOCAL_IP_STORAGE_KEY, trimmedIP);
    }
  }, [localIP]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!qrUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: 'Open this ClipHub link',
          url: qrUrl
        });
      } else {
        await navigator.clipboard.writeText(qrUrl);
      }
      setCopied(true);
      toast.success(navigator.share ? 'Link shared successfully!' : 'Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to share link');
    }
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;

    const canvas = document.getElementById('qr-canvas');
    if (!canvas) {
      toast.error('QR canvas not found');
      return;
    }

    const link = document.createElement('a');
    link.download = `cliphub-qr-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('QR code downloaded!');
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

        <div className="text-center">
          <h3 className="font-display font-600 text-xl text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-6">
            {mode === 'local' ? 'Scan to open on your local network' : 'Scan to open instantly'}
          </p>

          {/* Local IP Input */}
          {mode === 'local' && (
            <div className="glass rounded-lg p-3 mb-4 text-left">
              <label className="block text-xs text-gray-400 mb-2">Local IP Address</label>
              <div className="flex items-center gap-2">
                <input
                  ref={localInputRef}
                  type="text"
                  value={localIP}
                  onChange={(e) => setLocalIP(e.target.value)}
                  placeholder="192.168.1.10"
                  className="input-base flex-1 py-2"
                />
                <span className="text-sm text-gray-400">:{LOCAL_PORT}</span>
              </div>
              {!hasValidLocalIP && (
                <p className="mt-2 text-xs text-red-400">Enter a valid IPv4 address (example: 10.0.0.5)</p>
              )}
              <p className="mt-2 text-xs text-gray-500">Examples: 192.168.1.x, 10.0.0.x</p>
            </div>
          )}

          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl inline-block mb-6">
            <QRCodeCanvas
              id="qr-canvas"
              value={qrUrl || 'about:blank'}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>

          {/* URL Display */}
          <div className="glass rounded-lg p-3 mb-4 break-all">
            <p className="text-gray-300 text-sm font-mono">{qrUrl || 'Enter a valid IP to generate the local link'}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownloadQR}
              disabled={!qrUrl}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 disabled:opacity-40"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={handleShare}
              disabled={!qrUrl}
              className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2 disabled:opacity-40"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
              {copied ? 'Shared!' : 'Share'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}