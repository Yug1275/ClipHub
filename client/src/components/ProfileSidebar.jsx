import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, LogOut, User, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { resolveMediaUrl } from '../utils/imageUrl'
import AuthModal from './AuthModal'

export default function ProfileSidebar({ isOpen, onClose }) {
  const { user, isAuthenticated, authFetch, getProfile, updateUser, logout } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageRetrying, setImageRetrying] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const fileInputRef = useRef(null)
  const authOpenTimeoutRef = useRef(null)

  const profileImageVersion = user?.updatedAt || user?.lastLogin || ''
  const imageUrl = imageError
    ? ''
    : resolveMediaUrl(user?.profileImage, profileImageVersion)

  useEffect(() => {
    setImageError(false)
    setImageRetrying(false)
  }, [user?.profileImage, profileImageVersion])

  useEffect(() => {
    return () => {
      if (authOpenTimeoutRef.current) {
        clearTimeout(authOpenTimeoutRef.current)
      }
    }
  }, [])

  const openAuthFromGuest = (mode) => {
    setAuthMode(mode)
    onClose()

    if (authOpenTimeoutRef.current) {
      clearTimeout(authOpenTimeoutRef.current)
    }

    authOpenTimeoutRef.current = setTimeout(() => {
      setAuthModalOpen(true)
    }, 20)
  }

  const handleImageError = async () => {
    if (!imageRetrying) {
      setImageRetrying(true)
      await getProfile()
      return
    }
    setImageError(true)
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await authFetch('/api/user/upload-profile', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload profile image')
      }

      if (data?.user) {
        updateUser(data.user)
      }
      await getProfile()
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        className={
          `fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`
        }
      />

      <aside
        className={
          `fixed right-0 top-0 h-[100svh] z-[70] w-[92vw] max-w-md glass border-l border-white/10 ` +
          `transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
        }
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="text-white font-semibold text-lg">Profile</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full glass-hover flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            {!isAuthenticated ? (
              <div className="glass rounded-2xl p-5 text-center">
                <User size={34} className="text-gray-400 mx-auto mb-3" />
                <p className="text-white font-medium">Guest Mode</p>
                <p className="text-gray-500 text-sm mt-1">Please sign in from the Clip page to enable profile uploads.</p>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => openAuthFromGuest('login')}
                    className="btn-primary py-2.5 text-sm"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => openAuthFromGuest('signup')}
                    className="btn-ghost py-2.5 text-sm"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <button
                      onClick={() => imageUrl && setPreviewOpen(true)}
                      className="w-44 h-44 rounded-full border border-blue-400/30 bg-slate-900 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.25)] flex items-center justify-center"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      ) : (
                        <User size={68} className="text-gray-500" />
                      )}
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute right-1 bottom-1 w-11 h-11 rounded-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 transition-colors duration-300 flex items-center justify-center text-white border border-blue-300/40"
                    >
                      {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <p className="text-white font-medium text-base">{user?.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                  <p className="text-gray-500 text-xs mt-4">Supported formats: JPG, PNG, WEBP, GIF (max 5MB)</p>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      logout()
                      onClose()
                    }}
                    className="mt-5 w-full btn-ghost py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {previewOpen && imageUrl && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <button className="absolute inset-0" onClick={() => setPreviewOpen(false)} aria-label="Close preview" />
          <div className="relative glass rounded-2xl p-3 border border-white/10 max-w-2xl w-full max-h-[calc(100svh-1.5rem)] sm:max-h-[calc(100svh-2rem)] overflow-y-auto">
            <img src={imageUrl} alt="Profile preview" className="w-full max-h-[72svh] object-contain rounded-xl" />
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute right-5 top-5 w-9 h-9 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <AuthModal
        key={authMode}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  )
}
