import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Globe, Lock, Clock, Copy, Upload } from 'lucide-react'

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant sharing',
    desc: 'Paste text and share in seconds. No signup, no friction.',
  },
  {
    icon: Globe,
    title: 'Local & global',
    desc: 'Works on your WiFi hotspot or across the internet.',
  },
  {
    icon: Lock,
    title: 'Secure files',
    desc: 'File uploads protected with JWT authentication.',
  },
  {
    icon: Clock,
    title: 'Auto-expiry',
    desc: 'Set TTL from 1 min to 1 day. Data auto-deletes.',
  },
  {
    icon: Copy,
    title: 'Key-based access',
    desc: 'Use any custom key. Share the key, share the content.',
  },
  {
    icon: Upload,
    title: 'Drag and drop',
    desc: 'Upload images, PDFs, docs and retrieve anywhere.',
  },
]

export default function HomePage() {
  const [key, setKey] = useState('')
  const navigate = useNavigate()

  const handleGo = (e) => {
    e.preventDefault()
    if (key.trim()) navigate('/clip?key=' + encodeURIComponent(key.trim()))
  }

  return (
    <main className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-[350px] h-[350px] bg-blue-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-xs text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" />
          Universal clipboard and file transfer
        </div>

        <h1 className="font-bold text-5xl md:text-7xl text-white leading-tight tracking-tight mb-6">
          Share anything,
          <br />
          <span
            style={{
              backgroundImage:
                'linear-gradient(135deg, #5b9bff 0%, #93c5fd 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            anywhere
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          ClipHub is a universal clipboard bridge. Share text instantly with no
          login needed. Transfer files securely across any device, any network.
        </p>

        <form
          onSubmit={handleGo}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-16"
        >
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter a key (e.g. my-notes)"
            className="input-base flex-1 text-base"
            autoFocus
          />
          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Open Clip <ArrowRight size={16} />
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card glass-hover group">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center mb-3 group-hover:bg-blue-500/25 transition-colors duration-200">
                <Icon size={17} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-10">
          {[
            ['Zero friction', 'No login for text'],
            ['Key-based', 'Custom access keys'],
            ['Auto-delete', 'TTL on all data'],
          ].map(([label, sub]) => (
            <div key={label} className="text-center">
              <div className="font-bold text-2xl text-white">{label}</div>
              <div className="text-gray-500 text-sm mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}