import { Link, useLocation } from 'react-router-dom'
import { Clipboard, User } from 'lucide-react'
import { FiGithub } from 'react-icons/fi'
import DarkModeToggle from './DarkModeToggle'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import ProfileSidebar from './ProfileSidebar'
import { resolveMediaUrl } from '../utils/imageUrl'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, isAuthenticated, getProfile, toast, setToast } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileImageError, setProfileImageError] = useState(false)
  const [profileRetrying, setProfileRetrying] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/clip', label: 'Clip' },
    { to: '/docs', label: 'Docs' },
  ]

  const profileImageVersion = user?.updatedAt || user?.lastLogin || ''
  const profileImage = profileImageError
    ? ''
    : resolveMediaUrl(user?.profileImage, profileImageVersion)

  useEffect(() => {
    setProfileImageError(false)
    setProfileRetrying(false)
  }, [user?.profileImage, profileImageVersion])

  const handleProfileImageError = async () => {
    if (!profileRetrying) {
      setProfileRetrying(true)
      await getProfile()
      return
    }
    setProfileImageError(true)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center group-hover:bg-blue-400 transition-colors duration-300">
              <Clipboard size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Clip<span className="text-blue-400">Hub</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ' +
                  (pathname === to
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5')
                }
              >
                {label}
              </Link>
            ))}

            <a
              href="https://github.com/Yug1275/ClipHub.git"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <FiGithub size={17} />
            </a>

            <DarkModeToggle />

            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 glass glass-hover px-3 py-2 rounded-xl transition-all duration-300"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-slate-800 flex items-center justify-center">
                {isAuthenticated && profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={handleProfileImageError}
                  />
                ) : (
                  <User size={14} className="text-gray-400" />
                )}
              </div>
              <span className="text-sm text-white">{isAuthenticated ? user?.name : 'Profile'}</span>
            </button>
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <div className="space-y-1.5">
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
              />
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'opacity-0' : ''
                  }`}
              />
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 md:hidden glass border-t border-white/10 px-4 py-3 space-y-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={
                'block px-4 py-2.5 rounded-lg text-sm transition-colors duration-300 ' +
                (pathname === to
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5')
              }
            >
              {label}
            </Link>
          ))}



          <button
            onClick={() => {
              setSidebarOpen(true)
              setMenuOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-slate-800 flex items-center justify-center">
              {isAuthenticated && profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={handleProfileImageError}
                />
              ) : (
                <User size={13} className="text-gray-400" />
              )}
            </div>
            {isAuthenticated ? user?.name : 'Profile'}
          </button>
        </div>
      )}

      <ProfileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {toast && (
        <div className="fixed top-20 right-4 z-[120]">
          <div
            className={
              'min-w-[220px] max-w-sm px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ' +
              (toast.type === 'success'
                ? 'bg-green-500/15 border-green-400/40 text-green-200'
                : 'bg-red-500/15 border-red-400/40 text-red-200')
            }
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => setToast(null)}
                className="text-current/70 hover:text-current transition-colors"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}