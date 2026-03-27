import { useState } from 'react'
import { BookOpen, Zap, FileText, Upload, Globe, Lock, Clock, Code, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const sections = [
  {
    id: 'getting-started',
    icon: Zap,
    title: 'Getting Started',
    desc: 'Share your first clip in under 30 seconds',
    content: `
      1. Go to /clip page
      2. Enter any key (e.g. my-notes)
      3. Paste text → Save
      4. Share the key with anyone
      • No signup required for text clips
      • Works instantly on same WiFi or internet
    `
  },
  {
    id: 'text-sharing',
    icon: FileText,
    title: 'Text Sharing',
    desc: 'Instant, key-based clipboard',
    content: `
      • Custom keys (my-notes, project-v2, etc.)
      • Auto-expiry (1min → 1day or one-time)
      • Optional password protection
      • View limits (auto-delete after X views)
      • Real-time sync across devices
    `
  },
  {
    id: 'file-sharing',
    icon: Upload,
    title: 'File Sharing',
    desc: 'Secure drag & drop uploads',
    content: `
      • Requires login (JWT protected)
      • Local Mode: Unlimited size & any file type (use for large files!)
      • Global Mode: Max 10MB per file (use for small files)
      • Supported in Global: Images, PDFs, Docs, ZIP, Code files
      • Auto-expiry options (1h → Never)
      • Download count tracking
    `
  },
  {
    id: 'api-reference',
    icon: Code,
    title: 'API Reference',
    desc: 'REST + WebSocket endpoints',
    content: `
      POST /api/clip → Save text clip
      GET  /api/clip/:key → Retrieve clip
      POST /api/auth/login → Login
      POST /api/file → Upload file (auth required)
      WebSocket: Real-time editing & presence
    `
  },
  {
    id: 'local-global',
    icon: Globe,
    title: 'Local vs Global Mode',
    desc: 'How to run on your network or internet',
    content: `
      Local Mode (WiFi/Hotspot):
      • Run on your laptop
      • Other devices use your IP:5173
      • No internet needed
      
      Global Mode (Deployment):
      • Deploy frontend to Netlify
      • Backend to Railway/Render
      • Redis + MongoDB in cloud
      • Anyone in world can access
    `
  }
]

export default function DocsPage() {
  const { isAuthenticated } = useAuth()
  const [activeSection, setActiveSection] = useState('getting-started')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.desc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <BookOpen size={28} className="text-brand-400" />
          <h1 className="font-display font-700 text-4xl text-white">Documentation</h1>
        </motion.div>

        <p className="text-gray-400 mb-8 max-w-2xl">
          Everything you need to know about ClipHub. From quick start to advanced features and deployment.
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
          <div className="lg:col-span-4">
            <div className="glass rounded-2xl p-2 sticky top-24">
              {filteredSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isActive ? 'bg-brand-500/20 text-brand-400' : 'hover:bg-white/5 text-gray-300'}`}
                    whileHover={{ x: 4 }}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{section.title}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8">
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
                    <h2 className="font-display font-700 text-3xl text-white mb-2">
                      {sections.find(s => s.id === activeSection).title}
                    </h2>
                    <p className="text-gray-400 mb-8">
                      {sections.find(s => s.id === activeSection).desc}
                    </p>
                    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {sections.find(s => s.id === activeSection).content}
                    </div>

                    {/* Screenshot placeholder */}
                    <div className="mt-12 border border-white/10 rounded-2xl p-4 bg-black/30">
                      <div className="bg-surface-card rounded-xl h-64 flex items-center justify-center text-gray-500">
                        📸 Screenshot for {sections.find(s => s.id === activeSection).title}
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-3">Screenshot will be added in final deployment</p>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm mb-4">Need help?</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="/clip" className="text-brand-400 hover:text-brand-300">Try it now →</a>
            <a href="https://github.com/Yug1275/ClipHub.git" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300">GitHub Repo</a>
          </div>
        </div>
      </div>
    </main>
  )
}