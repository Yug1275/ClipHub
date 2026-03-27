import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Copy, Check, Save, Clock, Trash2, Key, Download, AlertCircle,
  FileText, Upload, QrCode, Lock, Eye, EyeOff, Shield, Users
} from 'lucide-react'
import { useClipboard } from '../hooks/useClipboard'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import FileUpload from '../components/FileUpload'
import AuthModal from '../components/AuthModal'
import QRCodeModal from '../components/QRCodeModal'
import PasswordModal from '../components/PasswordModal'
import OverwriteWarning from '../components/OverwriteWarning'
import { useSocket } from '../hooks/useSocket'
import { motion, AnimatePresence } from 'framer-motion'
import StatusIndicator from '../components/StatusIndicator'
import AnimatedCard from '../components/AnimatedCard'
import { LoadingSpinner } from '../components/LoadingSpinner'

const EXPIRY_OPTIONS = [
  { label: '1 min', value: '1m' },
  { label: '10 min', value: '10m' },
  { label: '1 hour', value: '1h' },
  { label: '1 day', value: '1d' },
  { label: 'One-time', value: 'once' },
]

const MAX_VIEWS_OPTIONS = [
  { label: 'Unlimited', value: null },
  { label: '1 view', value: 1 },
  { label: '3 views', value: 3 },
  { label: '5 views', value: 5 },
  { label: '10 views', value: 10 },
  { label: '25 views', value: 25 },
]

export default function ClipPage() {
  const [params] = useSearchParams()
  const [key, setKey] = useState(params.get('key') || '')
  const [linkType] = useState((params.get('type') || '').toLowerCase())
  const [content, setContent] = useState('')
  const [expiry, setExpiry] = useState('1h')
  const [maxViews, setMaxViews] = useState(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [apiError, setApiError] = useState('')
  const [activeTab, setActiveTab] = useState(linkType === 'file' ? 'file' : 'text')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  // Real-time features
  const socket = useSocket()
  const [lastContentUpdate, setLastContentUpdate] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [overwriteWarningOpen, setOverwriteWarningOpen] = useState(false)
  const [existingClipInfo, setExistingClipInfo] = useState(null)
  const [pendingPassword, setPendingPassword] = useState('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  const { saveClip, getClip, deleteClip, checkClipExists, loading, error } = useClipboard()
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()

  useEffect(() => {
    setCharCount(content.length)
  }, [content])

  useEffect(() => {
    if (error) {
      setApiError(error)
      setTimeout(() => setApiError(''), 5000)
    }
  }, [error])

  // Socket connection and real-time updates
  useEffect(() => {
    if (key && socket.isConnected && user?.name) {
      socket.joinClip(key, user.name)

      const cleanup = socket.onContentUpdate((data) => {
        if (data.socketId !== socket.socket?.id) {
          setLastContentUpdate(data)
          // Don't automatically update content to avoid conflicts
          // Instead, show a notification that content was updated
        }
      })

      return () => {
        cleanup?.()
        socket.leaveClip()
      }
    }
  }, [key, socket.isConnected, user?.name])

  // Typing indicator
  useEffect(() => {
    if (isTyping) {
      socket.emitTypingStart()

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        socket.emitTypingStop()
      }, 2000)
    } else {
      socket.emitTypingStop()
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [isTyping])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Content copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy content')
    }
  }

  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)

    // Real-time updates
    if (key && socket.isConnected && user?.name) {
      socket.emitContentChange(key, newContent)
      setIsTyping(true)
    }
  }

  const handleSave = async () => {
    if (!key || !content) return

    try {
      // Check if clip exists first
      const existsResult = await checkClipExists(key)
      if (existsResult.exists) {
        setExistingClipInfo(existsResult.info)
        setOverwriteWarningOpen(true)
        return
      }

      await performSave()
    } catch (err) {
      console.error('Save error:', err)
      toast.error(err.message)
    }
  }

  const performSave = async () => {
    try {
      const options = {}
      if (password) options.password = password
      if (maxViews) options.maxViews = maxViews

      const result = await saveClip(key, content, expiry, options)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setApiError('')
      toast.success(result.overwritten ? 'Clip updated successfully!' : 'Clip saved successfully!')
    } catch (err) {
      throw err
    }
  }

  const handleLoad = async (inputPassword = null) => {
    if (!key) return

    try {
      const result = await getClip(key, inputPassword)
      setContent(result.data.content)
      setApiError('')
      toast.success('Clip loaded successfully!')

      if (result.data.willExpireAfterView) {
        toast.warning('This clip will be deleted after this view', 6000)
      }
    } catch (err) {
      if (err.message.includes('password protected')) {
        setPasswordModalOpen(true)
        return
      }
      console.error('Load error:', err)
      toast.error(err.message)
    }
  }

  const handlePasswordSubmit = async (inputPassword) => {
    setPendingPassword(inputPassword)
    await handleLoad(inputPassword)
  }

  const handleDelete = async () => {
    if (!key) return

    try {
      await deleteClip(key)
      setContent('')
      setApiError('')
      toast.success('Clip deleted successfully!')
    } catch (err) {
      console.error('Delete error:', err)
      toast.error(err.message)
    }
  }

  const handleQRCode = () => {
    if (!key) {
      toast.error('Please enter a key first')
      return
    }
    setQrModalOpen(true)
  }

  return (
    <main className="relative min-h-screen pt-24 pb-16 px-4">

      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
                        bg-brand-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-700 text-2xl text-white mb-1">Clipboard</h1>
          <p className="text-gray-500 text-sm font-body">Share text instantly or upload files securely</p>
        </div>

        {/* User Status */}
        {isAuthenticated ? (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-gray-400">Signed in as <span className="text-white">{user.name}</span></span>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-blue-400" />
            <span className="text-blue-400 text-sm">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="underline hover:no-underline"
              >
                Sign in
              </button> to upload files and access advanced features
            </span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-6">
          <button
            onClick={() => setActiveTab('text')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-body font-medium text-sm transition-all duration-200
              ${activeTab === 'text'
                ? 'bg-brand-500/20 text-brand-400'
                : 'text-gray-400 hover:text-white hover:bg-surface-hover'
              }
            `}
          >
            <FileText size={14} /> Text
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-body font-medium text-sm transition-all duration-200
              ${activeTab === 'file'
                ? 'bg-brand-500/20 text-brand-400'
                : 'text-gray-400 hover:text-white hover:bg-surface-hover'
              }
            `}
          >
            <Upload size={14} /> File
          </button>
        </div>

        {/* Error display */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-400 text-sm">{apiError}</span>
          </div>
        )}

        {/* Real-time update notification */}
        <AnimatePresence>
          {lastContentUpdate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <LoadingSpinner size={16} />
                <span className="text-blue-400 text-sm">
                  {lastContentUpdate.userName} updated this clip
                </span>
              </div>
              <button
                onClick={() => {
                  setContent(lastContentUpdate.content)
                  setLastContentUpdate(null)
                }}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Refresh
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        {activeTab === 'text' ? (
          <>
            {/* Key input row */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="your-key"
                  className="input-base pl-9"
                />
              </div>
              <button
                onClick={() => handleLoad()}
                disabled={!key || loading}
                className="btn-ghost text-sm py-2 px-4 disabled:opacity-40 flex items-center gap-1"
              >
                {loading ? 'Loading...' : <><Download size={14} /> Load</>}
              </button>
              <button
                onClick={handleQRCode}
                disabled={!key}
                className="btn-ghost text-sm py-2 px-4 disabled:opacity-40 flex items-center gap-1"
              >
                <QrCode size={14} /> QR
              </button>
            </div>

            {/* Editor */}
            <div className="card mb-4 p-0 overflow-hidden glow-blue">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border/60">
                <span className="text-xs font-mono text-gray-500">
                  {key ? <span className="text-brand-400">/{key}</span> : 'no key set'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-mono">{charCount} chars</span>
                  <button
                    onClick={handleCopy}
                    disabled={!content}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white
                               glass-hover px-2.5 py-1.5 rounded-lg transition-all duration-200
                               disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setContent('')}
                    disabled={!content}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400
                               glass-hover px-2.5 py-1.5 rounded-lg transition-all duration-200
                               disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} /> Clear
                  </button>
                </div>
              </div>
              <textarea
                value={content}
                onChange={handleContentChange} // Changed from e => setContent(e.target.value)
                placeholder="Paste your text, code, or notes here..."
                className="w-full bg-transparent text-gray-200 font-mono text-sm px-4 py-4
             resize-none focus:outline-none placeholder-gray-600 leading-relaxed"
                rows={16}
              />
            </div>

            {/* Advanced Options Toggle */}
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

            {/* Advanced Options */}
            {showAdvancedOptions && (
              <div className="glass rounded-xl p-4 mb-4 space-y-4">

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
                      placeholder="Set password to protect this clip"
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

                {/* View Limit */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                    <Users size={14} />
                    View limit
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {MAX_VIEWS_OPTIONS.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => setMaxViews(opt.value)}
                        className={`
                          text-xs px-3 py-1.5 rounded-lg transition-all duration-150 
                          ${maxViews === opt.value
                            ? 'bg-brand-500/25 text-brand-400 border border-brand-500/40'
                            : 'text-gray-500 hover:text-gray-300 glass-hover'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {maxViews && (
                    <p className="text-xs text-gray-500 mt-1">
                      Clip will be automatically deleted after {maxViews} view{maxViews !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* Footer row */}
            <div className="flex flex-wrap items-center justify-between gap-3">

              {/* Expiry selector */}
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-500" />
                <span className="text-xs text-gray-500 font-body">Expires:</span>
                <div className="flex gap-1">
                  {EXPIRY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setExpiry(opt.value)}
                      className={
                        'text-xs px-2.5 py-1 rounded-lg font-body transition-all duration-150 ' +
                        (expiry === opt.value
                          ? 'bg-brand-500/25 text-brand-400 border border-brand-500/40'
                          : 'text-gray-500 hover:text-gray-300 glass-hover')
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {key && content && (
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="btn-ghost text-sm py-2 px-3 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!key || !content || loading}
                  className="btn-primary flex items-center gap-2 py-2 text-sm
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>Saving...</>
                  ) : saved ? (
                    <><Check size={15} /> Saved!</>
                  ) : (
                    <><Save size={15} /> Save clip</>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* File Upload Tab */
          <FileUpload
            fileKey={key}
            onKeyChange={setKey}
          />
        )}

      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {qrModalOpen && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          clipKey={key}
          title="Share ClipHub Link"
        />
      )}

      <PasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
      />

      <OverwriteWarning
        isOpen={overwriteWarningOpen}
        onClose={() => {
          setOverwriteWarningOpen(false)
          setExistingClipInfo(null)
        }}
        onConfirm={async () => {
          setOverwriteWarningOpen(false)
          setExistingClipInfo(null)
          await performSave()
        }}
        existingInfo={existingClipInfo}
        type="clip"
      />

      {/* Status Indicator */}
      <StatusIndicator
        isConnected={socket.isConnected}
        activeUsers={socket.activeUsers}
        typingUsers={socket.typingUsers}
        isVisible={!!key}
      />

    </main>
  )
}