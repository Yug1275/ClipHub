import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Copy, Check, Save, Clock, Trash2, Key, Download, AlertCircle } from 'lucide-react'
import { useClipboard } from '../hooks/useClipboard'

const EXPIRY_OPTIONS = [
  { label: '1 min',   value: '1m'  },
  { label: '10 min',  value: '10m' },
  { label: '1 hour',  value: '1h'  },
  { label: '1 day',   value: '1d'  },
  { label: 'One-time',value: 'once'},
]

export default function ClipPage() {
  const [params] = useSearchParams()
  const [key, setKey] = useState(params.get('key') || '')
  const [content, setContent] = useState('')
  const [expiry, setExpiry] = useState('1h')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [apiError, setApiError] = useState('')
  
  const { saveClip, getClip, deleteClip, loading, error } = useClipboard()

  useEffect(() => { 
    setCharCount(content.length) 
  }, [content])

  useEffect(() => {
    if (error) {
      setApiError(error)
      setTimeout(() => setApiError(''), 5000)
    }
  }, [error])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!key || !content) return
    
    try {
      await saveClip(key, content, expiry)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setApiError('')
    } catch (err) {
      console.error('Save error:', err)
    }
  }

  const handleLoad = async () => {
    if (!key) return
    
    try {
      const result = await getClip(key)
      setContent(result.data.content)
      setApiError('')
    } catch (err) {
      console.error('Load error:', err)
    }
  }

  const handleDelete = async () => {
    if (!key) return
    
    try {
      await deleteClip(key)
      setContent('')
      setApiError('')
    } catch (err) {
      console.error('Delete error:', err)
    }
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
          <p className="text-gray-500 text-sm font-body">Enter a key to save or retrieve content</p>
        </div>

        {/* Error display */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-400 text-sm">{apiError}</span>
          </div>
        )}

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
            onClick={handleLoad} 
            disabled={!key || loading}
            className="btn-ghost text-sm py-2 px-4 disabled:opacity-40"
          >
            {loading ? 'Loading...' : <><Download size={14} /> Load</>}
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
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your text, code, or notes here..."
            className="w-full bg-transparent text-gray-200 font-mono text-sm px-4 py-4
                       resize-none focus:outline-none placeholder-gray-600 leading-relaxed"
            rows={16}
          />
        </div>

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
                <>Loading...</>
              ) : saved ? (
                <><Check size={15} /> Saved!</>
              ) : (
                <><Save size={15} /> Save clip</>
              )}
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}