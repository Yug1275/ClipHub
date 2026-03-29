import { useState } from 'react';
import { Copy, Check, Code, Play, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function APIExample({ example }) {
  const [activeTab, setActiveTab] = useState('postman');
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const tabs = [
    { id: 'postman', label: 'Postman', icon: Play },
    { id: 'request', label: 'Request Details', icon: Code },
    { id: 'response', label: 'Response', icon: ExternalLink }
  ];

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="font-semibold text-white text-lg">{example.title}</h3>
        <p className="text-gray-400 text-sm mt-1">{example.description}</p>
        
        <div className="flex items-center gap-4 mt-3">
          <span className={`
            px-2 py-1 rounded text-xs font-mono font-medium
            ${example.method === 'GET' ? 'bg-green-500/20 text-green-400' :
              example.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
              example.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'}
          `}>
            {example.method}
          </span>
          <code className="text-sm text-gray-300 font-mono">{example.endpoint}</code>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === id 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-0">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 🧪 POSTMAN TAB - New Default */}
          {activeTab === 'postman' && (
            <div className="p-6 space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-blue-400">
                    🧪 <span className="font-semibold">Postman Guide</span>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-white mb-1">Method:</p>
                    <p className="font-mono text-blue-400">{example.method}</p>
                  </div>

                  <div>
                    <p className="font-medium text-white mb-1">URL:</p>
                    <p className="font-mono bg-black/30 p-3 rounded text-gray-300 break-all">
                      https://cliphub-ksuf.onrender.com{example.endpoint}
                    </p>
                  </div>

                  {example.requestBody && (
                    <div>
                      <p className="font-medium text-white mb-2">Body → raw → JSON:</p>
                      <div className="relative">
                        <button
                          onClick={() => handleCopy(JSON.stringify(example.requestBody, null, 2))}
                          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white rounded hover:bg-white/10"
                        >
                          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                        <pre className="bg-black/40 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto pr-12">
                          <code>{JSON.stringify(example.requestBody, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {example.formData && (
                    <div>
                      <p className="font-medium text-white mb-2">Body → form-data:</p>
                      <div className="bg-black/40 rounded-lg p-4 text-sm">
                        {Object.entries(example.formData).map(([key, value]) => (
                          <div key={key} className="flex gap-3 py-1">
                            <span className="text-blue-400 font-medium w-24">{key}</span>
                            <span className="text-gray-400">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {example.headers && (
                    <div>
                      <p className="font-medium text-white mb-2">Headers:</p>
                      <div className="bg-black/40 rounded-lg p-4 text-sm space-y-1">
                        {Object.entries(example.headers).map(([key, value]) => (
                          <div key={key} className="flex gap-3">
                            <span className="text-purple-400">{key}:</span>
                            <span className="text-gray-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Request Details Tab */}
          {activeTab === 'request' && (
            <div className="p-6">
              {example.headers && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-white mb-2">Headers</h4>
                  <pre className="bg-black/30 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                    <code>{JSON.stringify(example.headers, null, 2)}</code>
                  </pre>
                </div>
              )}

              {example.requestBody && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-white mb-2">Request Body</h4>
                  <pre className="bg-black/30 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                    <code>{JSON.stringify(example.requestBody, null, 2)}</code>
                  </pre>
                </div>
              )}

              {example.formData && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Form Data</h4>
                  <div className="bg-black/30 rounded-lg p-4 text-sm">
                    {Object.entries(example.formData).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-4 py-1">
                        <code className="text-blue-400">{key}</code>
                        <code className="text-gray-300">{value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Response Tab */}
          {activeTab === 'response' && example.response && (
            <div className="p-6">
              <div className="relative">
                <button
                  onClick={() => handleCopy(JSON.stringify(example.response, null, 2))}
                  className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white rounded hover:bg-white/5"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <pre className="bg-black/30 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto pr-12">
                  <code>{JSON.stringify(example.response, null, 2)}</code>
                </pre>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}