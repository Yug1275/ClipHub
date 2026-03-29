import { useState } from 'react'
import {
  BookOpen, Zap, FileText, Upload, Globe, Lock, Clock, Code, Search,
  ChevronRight, Terminal, Shield, Eye, QrCode,
  Play, Copy, Check, ExternalLink, Download, Smartphone
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useSearchParams } from 'react-router-dom'
import APIExample from '../components/docs/APIExample'
import SetupGuide from '../components/docs/SetupGuide'
import { useNavigate } from 'react-router-dom'


// Import the data we created earlier
import { API_EXAMPLES, SETUP_GUIDES } from '../data/apiExamples'
import { isLocal } from '../utils/api'

const sections = [
  {
    id: 'getting-started',
    icon: Zap,
    title: 'Getting Started',
    desc: 'Share your first clip in under 30 seconds',
    type: 'guide'
  },
  {
    id: 'text-sharing',
    icon: FileText,
    title: 'Text Sharing',
    desc: 'Instant, key-based clipboard with advanced features',
    type: 'demo'
  },
  {
    id: 'file-sharing',
    icon: Upload,
    title: 'File Sharing',
    desc: 'Secure drag & drop uploads with authentication',
    type: 'demo'
  },
  {
    id: 'api-reference',
    icon: Code,
    title: 'API Reference',
    desc: 'Complete REST API documentation with Postman examples',
    type: 'api'
  },
  {
    id: 'local-setup',
    icon: Terminal,
    title: 'Local Setup',
    desc: 'Run ClipHub on your local network',
    type: 'setup'
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security Features',
    desc: 'Password protection, view limits, and data expiry',
    type: 'feature'
  },
  {
    id: 'real-time',
    icon: Globe,
    title: 'Real-time Features',
    desc: 'Live collaboration and WebSocket integration',
    type: 'feature'
  }
]

export default function DocsPage() {
  const { isAuthenticated } = useAuth()
  const [key, setKey] = useState("")

  const [searchParams] = useSearchParams()

  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState(
    searchParams.get('section') || 'getting-started'
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [copied, setCopied] = useState(false)

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.desc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const renderContent = () => {
    const section = sections.find(s => s.id === activeSection)
    if (!section) return null

    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Start</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Smartphone size={18} className="text-blue-400" />
                    For Personal Use
                  </h4>
                  <ol className="space-y-2 text-gray-300">
                    <li>1. Go to <code className="bg-blue-500/20 px-2 py-1 rounded text-blue-300">/clip</code></li>
                    <li>2. Enter any key (e.g. "my-notes")</li>
                    <li>3. Paste your text and click Save</li>
                    <li>4. Share the key with others</li>
                  </ol>
                  <p className="text-sm text-gray-400 mt-4">✨ No signup required for text clips</p>
                </div>
                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Upload size={18} className="text-green-400" />
                    For File Sharing
                  </h4>
                  <ol className="space-y-2 text-gray-300">
                    <li>1. {isLocal ? "Switch to File tab (No signup required locally)" : "Create an account (sign up)"}</li>
                    <li>2. {isLocal ? "Drag & drop your file" : "Switch to File tab"}</li>
                    <li>3. {isLocal ? "Set expiry and upload" : "Drag & drop your file"}</li>
                    {!isLocal && <li>4. Set expiry and upload</li>}
                  </ol>
                  <p className="text-sm text-gray-400 mt-4">
                    {isLocal ? "✨ Local mode: Infinite uploads without auth" : "🔒 Authentication required for security"}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Demo */}
            <div className="card p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Play size={18} className="text-yellow-400" />
                Try it Now
              </h4>
              <div className="bg-black/30 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter a key (e.g. demo-123)"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                  <a
                    href={`/clip?key=${key}`} className="btn-primary py-2 px-4 text-sm"
                  >
                    Open Clip
                  </a>
                </div>
                <p className="text-xs text-gray-500">
                  This will open the clip page with your custom key pre-filled
                </p>
              </div>
            </div>
          </div>
        )

      case 'text-sharing':
        return (
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-white mb-6">Text Sharing Features</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Lock size={18} className="text-yellow-400" />
                    Password Protection
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Click "Advanced options"</li>
                    <li>• Set a password</li>
                    <li>• Recipients need key + password</li>
                    <li>• Protects sensitive content</li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye size={18} className="text-blue-400" />
                    View Limits
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Set maximum view count</li>
                    <li>• Auto-delete after limit reached</li>
                    <li>• Perfect for one-time shares</li>
                    <li>• Track access attempts</li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-green-400" />
                    Auto-Expiry
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• 1 minute to 30 days</li>
                    <li>• One-time access option</li>
                    <li>• Data auto-deletes</li>
                    <li>• No manual cleanup needed</li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <QrCode size={18} className="text-purple-400" />
                    QR Code Sharing
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Generate QR codes instantly</li>
                    <li>• Easy mobile device access</li>
                    <li>• Download or share QR image</li>
                    <li>• Works offline once scanned</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'file-sharing':
        return (
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">

              {!isLocal && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <p className="text-yellow-200 text-sm">
                    <strong>Authentication Required:</strong> File uploads require a user account for security and access control.
                  </p>
                </div>
              )}

              {/* File Types */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-4">Cloud Mode File Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card p-4">
                      <p className="font-medium text-blue-400 mb-2">Images</p>
                      <p className="text-gray-300">JPG, PNG, GIF, WebP</p>
                    </div>

                    <div className="card p-4">
                      <p className="font-medium text-green-400 mb-2">Documents</p>
                      <p className="text-gray-300">PDF, DOC, XLS, PPT</p>
                    </div>

                    <div className="card p-4">
                      <p className="font-medium text-purple-400 mb-2">Archives</p>
                      <p className="text-gray-300">ZIP, RAR, 7Z</p>
                    </div>

                    <div className="card p-4">
                      <p className="font-medium text-red-400 mb-2">Code</p>
                      <p className="text-gray-300">JSON, JS, HTML, CSS</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-4">Local Mode File Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="card p-4 border border-brand-500/30 bg-brand-500/5">
                      <p className="font-medium text-brand-400 mb-2">Everything in Global Mode</p>
                      <p className="text-gray-300">Images, Documents, Archives, Code</p>
                    </div>

                    <div className="card p-4">
                      <p className="font-medium text-yellow-400 mb-2">Video</p>
                      <p className="text-gray-300">MP4, WEBM, MKV, AVI</p>
                    </div>

                    <div className="card p-4">
                      <p className="font-medium text-pink-400 mb-2">Audio</p>
                      <p className="text-gray-300">MP3, WAV, OGG, M4A</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Local vs Cloud */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h4 className="font-semibold text-white mb-3">📱 Local Mode</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Unlimited file size</li>
                  <li>• Any file type supported</li>
                  <li>• Perfect for large files</li>
                  <li>• Works on your network only</li>
                  <li>
                    • Files are uploaded to the{" "}
                    <code className="bg-white/10 px-1 py-0.5 rounded">
                      /ClipHub/uploads
                    </code>
                  </li>
                </ul>
              </div>

              <div className="card p-6">
                <h4 className="font-semibold text-white mb-3">☁️ Cloud Mode</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• 10MB file size limit</li>
                  <li>• Specific file types only</li>
                  <li>• Global internet access</li>
                  <li>• Great for sharing anywhere</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'api-reference':
        return (
          <div className="space-y-8">
            
            {/* Text Clips API */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Text Clips</h4>
              <div className="space-y-8">
                <APIExample example={API_EXAMPLES.textClip.save} />
                <APIExample example={API_EXAMPLES.textClip.get} />
              </div>
            </div>

            {/* File Upload API */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">File Upload</h4>
              <div className="space-y-8">
                <APIExample example={API_EXAMPLES.fileUpload.upload} />
                <APIExample example={API_EXAMPLES.fileUpload.download} />
              </div>
            </div>

            {/* Authentication API */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Authentication</h4>
              <div className="space-y-8">
                <APIExample example={API_EXAMPLES.auth.signup} />
                <APIExample example={API_EXAMPLES.auth.login} />
              </div>
            </div>

            {/* WebSocket Events */}
            <div className="card p-6">
              <h4 className="text-lg font-semibold text-white mb-4">WebSocket Events</h4>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-blue-400 mb-2">Client → Server</h5>
                    <ul className="space-y-1 text-gray-300">
                      <li><code>join-clip</code> - Join a clip room</li>
                      <li><code>content-change</code> - Send content updates</li>
                      <li><code>typing-start</code> - Start typing indicator</li>
                      <li><code>typing-stop</code> - Stop typing indicator</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-400 mb-2">Server → Client</h5>
                    <ul className="space-y-1 text-gray-300">
                      <li><code>content-updated</code> - Content changed by others</li>
                      <li><code>user-joined</code> - User joined the clip</li>
                      <li><code>user-typing</code> - Someone is typing</li>
                      <li><code>active-users</code> - List of active users</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'local-setup':
        return (
          <div className="space-y-8">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <p className="text-green-200 text-sm">
                <strong>Zero Database Required!</strong> Runs instantly with purely in-memory storage for Local Mode. Data is cleared on server restart.
              </p>
            </div>

            <SetupGuide guide={SETUP_GUIDES.localMode} icon={Terminal} />

            <div className="card p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Terminal size={18} className="text-green-400" />
                Quick Commands
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-400 mb-2">Development</p>
                  <div className="bg-black/40 rounded p-3 space-y-1 font-mono text-xs">
                    <div>npm run dev</div>
                    <div>npm run server</div>
                    <div>npm run client</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-white mb-6">Security Features</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Lock size={18} className="text-yellow-400" />
                    Data Protection
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Password hashing with bcrypt</li>
                    <li>• JWT authentication tokens</li>
                    <li>• CORS protection configured</li>
                    <li>• Rate limiting on all endpoints</li>
                    <li>• Input validation and sanitization</li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye size={18} className="text-blue-400" />
                    Access Control
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• View limits with auto-deletion</li>
                    <li>• Time-based expiration (TTL)</li>
                    <li>• One-time access clips</li>
                    <li>• Password-protected content</li>
                    <li>• User-based file ownership</li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield size={18} className="text-green-400" />
                    Network Security
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• HTTPS enforced in production</li>
                    <li>• Helmet.js security headers</li>
                    <li>• File type validation</li>
                    <li>• Size limits enforced</li>
                    <li>• WebSocket origin validation</li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-red-400" />
                    Data Privacy
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Automatic data expiration</li>
                    <li>• No permanent storage by default</li>
                    <li>• User data isolation</li>
                    <li>• Minimal data collection</li>
                    <li>• Optional anonymous usage</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <h4 className="font-semibold text-red-200 mb-3">🔐 Security Best Practices</h4>
              <ul className="space-y-2 text-red-100 text-sm">
                <li>• Always use strong JWT secrets in production</li>
                <li>• Enable HTTPS with valid SSL certificates</li>
                <li>• Regularly update dependencies for security patches</li>
                <li>• Monitor and log failed authentication attempts</li>
                <li>• Use environment variables for all secrets</li>
                <li>• Consider implementing 2FA for sensitive deployments</li>
              </ul>
            </div>
          </div>
        )

      case 'real-time':
        return (
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-white mb-6">Real-time Collaboration</h3>
              <p className="text-gray-400 mb-8">
                ClipHub supports real-time features using WebSocket connections for live collaboration and updates.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Globe size={18} className="text-blue-400" />
                    Live Editing
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• See changes from other users instantly</li>
                    <li>• Typing indicators show who's editing</li>
                    <li>• Conflict resolution for simultaneous edits</li>
                    <li>• Real-time cursor positions</li>
                  </ul>
                </div>

                <div className="card p-6">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye size={18} className="text-green-400" />
                    User Presence
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Active user count display</li>
                    <li>• Join/leave notifications</li>
                    <li>• User identification by name</li>
                    <li>• Connection status indicators</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h4 className="font-semibold text-white mb-4">WebSocket Integration Example</h4>
              <div className="bg-black/40 rounded-lg p-4">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{`// Frontend WebSocket usage
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000')

// Join a clip room for real-time updates
socket.emit('join-clip', {
  key: 'my-clip',
  userName: 'John Doe'
})

// Listen for content updates from other users
socket.on('content-updated', (data) => {
  console.log('Content updated by:', data.userName)
  // Update UI with new content
})

// Send content changes to other users
socket.emit('content-change', {
  key: 'my-clip',
  content: 'Updated content',
  timestamp: Date.now()
})`}</code>
                </pre>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h4 className="font-semibold text-blue-200 mb-3">📡 Connection Status</h4>
              <p className="text-blue-100 text-sm mb-4">
                The status indicator in the bottom-right corner shows your real-time connection status:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-200">Connected - Real-time features active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-200">Disconnected - Working in offline mode</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-200">Connecting - Establishing connection</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div className="text-gray-400">Section not found</div>
    }
  }

  return (
    <main className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <BookOpen size={28} className="text-brand-400" />
          <h1 className="font-display font-700 text-4xl text-white">Documentation</h1>
        </motion.div>

        <p className="text-gray-400 mb-8 max-w-3xl">
          Complete guide to ClipHub. From quick start to advanced features, API reference, and local deployment.
        </p>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documentation..."
            className="input-base pl-11 w-full text-base"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-2 sticky top-24">
              {filteredSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isActive ? 'bg-brand-500/20 text-brand-400' : 'hover:bg-white/5 text-gray-300'
                      }`}
                    whileHover={{ x: 4 }}
                  >
                    <Icon size={18} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm block truncate">{section.title}</span>
                      <span className="text-xs text-gray-500 block truncate">{section.desc}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="flex-shrink-0" />}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-2xl p-8"
              >
                {sections.find(s => s.id === activeSection) && (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="font-display font-700 text-3xl text-white mb-2">
                          {sections.find(s => s.id === activeSection).title}
                        </h2>
                        <p className="text-gray-400">
                          {sections.find(s => s.id === activeSection).desc}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(window.location.href)}
                          className="btn-ghost py-2 px-3 text-sm"
                          title="Copy section URL"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <a
                          href={`#${activeSection}`}
                          className="btn-ghost py-2 px-3 text-sm"
                          title="Direct link"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                    {renderContent()}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm mb-6">Need help or found an issue?</p>
          <div className="flex justify-center gap-6 text-sm">
            <a
              href="/clip"
              className="text-brand-400 hover:text-brand-300 transition-colors"
            >
              Try ClipHub →
            </a>
            <a
              href="https://github.com/Yug1275/ClipHub.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 transition-colors"
            >
              GitHub Repository
            </a>
            <a
              href="https://github.com/Yug1275/ClipHub/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 transition-colors"
            >
              Report Issues
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}