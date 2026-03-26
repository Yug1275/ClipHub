import { Link, useLocation } from 'react-router-dom'
import { Clipboard, GitBranch } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/clip', label: 'Clip' },
    { to: '/docs', label: 'Docs' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center group-hover:bg-blue-400 transition-colors duration-200">
            <Clipboard size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Clip<span className="text-blue-400">Hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
                (pathname === to
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5')
              }
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <GitBranch size={20} />
          </a>
          <Link to="/clip" className="btn-primary py-2 px-4 text-sm">
            Try it free
          </Link>
        </div>

        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <div className="space-y-1.5">
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-200 ${
                menuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-200 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-200 ${
                menuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden glass border-t border-white/10 px-4 py-3 space-y-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={
                'block px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ' +
                (pathname === to
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5')
              }
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}