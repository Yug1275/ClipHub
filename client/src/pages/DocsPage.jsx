import { BookOpen, Terminal, Globe, Lock, Clock, Zap } from 'lucide-react'

const SECTIONS = [
  {
    icon: Zap,
    title: 'Quick start',
    desc: 'Get sharing in under 30 seconds. No account needed.',
  },
  {
    icon: Terminal,
    title: 'API reference',
    desc: 'REST endpoints for text and file operations.',
  },
  {
    icon: Globe,
    title: 'Local mode setup',
    desc: 'Run ClipHub on your own network.',
  },
  {
    icon: Lock,
    title: 'Authentication',
    desc: 'JWT-based auth for secure file transfers.',
  },
  {
    icon: Clock,
    title: 'Expiry and TTL',
    desc: 'How data lifecycle and auto-deletion works.',
  },
]

export default function DocsPage() {
  return (
    <main className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={22} className="text-blue-400" />
          <h1 className="font-bold text-3xl text-white">Documentation</h1>
        </div>
        <p className="text-gray-500 mb-10">
          Everything you need to know about ClipHub. Full docs coming in Phase 6.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SECTIONS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card glass-hover group cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition-colors duration-200">
                  <Icon size={17} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  <span className="inline-block mt-2 text-xs text-blue-400/60 font-mono">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
