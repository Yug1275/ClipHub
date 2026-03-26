import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Copy, Check, Save, Clock, Trash2, Key } from 'lucide-react'

const EXPIRY_OPTIONS = [
  { label: '1 min', value: '1m' },
  { label: '10 min', value: '10m' },
  { label: '1 hour', value: '1h' },
  { label: '1 day', value: '1d' },
  { label: 'One-time', value: 'once' },
]

export default function ClipPage() {
  const [params] = useSearchParams()
  const [key, setKey] = useState(params.get('key') || '')
  const [content, setContent] = useState('')
  const [expiry, setExpiry] = useState('1h')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    setCharCount(content.length)
  }, [content])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-white mb-1">Clipboard</h1>
          <p className="text-gray-500 text-sm">
            Enter a key to save or retrieve content
          </p>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Key
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="your-key"
              className="input-base pl-9"
            />
          </div>
          <button className="btn-ghost text-sm py-2 px-4">Load</button>
        </div>

        <div className="card mb-4 p-0 overflow-hidden glow-blue">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <span className="text-xs font-mono text-gray-500">
              {key ? (
                <span className="text-blue-400">/{key}</span>
              ) : (
                'no key set'
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-mono">
                {charCount} chars
              </span>
              <button
                onClick={handleCopy}
                disabled={!content}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white glass-hover px-2.5 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <Check size={13} className="text-green-400" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => setContent('')}
                disabled={!content}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 glass-hover px-2.5 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text, code, or notes here..."
            className="w-full bg-transparent text-gray-200 font-mono text-sm px-4 py-4 resize-none focus:outline-none placeholder-gray-600 leading-relaxed"
            rows={16}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500">Expires:</span>
            <div className="flex gap-1">
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setExpiry(opt.value)}
                  className={
                    'text-xs px-2.5 py-1 rounded-lg transition-all duration-150 ' +
                    (expiry === opt.value
                      ? 'bg-blue-500/25 text-blue-400 border border-blue-500/40'
                      : 'text-gray-500 hover:text-gray-300 glass-hover')
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!key || !content}
            className="btn-primary flex items-center gap-2 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved ? (
              <>
                <Check size={15} /> Saved!
              </>
            ) : (
              <>
                <Save size={15} /> Save clip
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}