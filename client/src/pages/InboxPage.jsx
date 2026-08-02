import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { FileText, File, Clock, Lock, ArrowRight, Inbox } from 'lucide-react';
import AnimatedCard from '../components/AnimatedCard';

export default function InboxPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authFetch, isAuthenticated, user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const fetchInbox = async () => {
    try {
      const [clipsRes, filesRes] = await Promise.all([
        authFetch('/api/clip/inbox'),
        authFetch('/api/file/inbox')
      ]);

      const clipsData = await clipsRes.json();
      const filesData = await filesRes.json();

      let combined = [];
      if (clipsData.success) combined = [...combined, ...clipsData.clips];
      if (filesData.success) {
        combined = [...combined, ...filesData.files.map(f => ({
          ...f,
          type: 'file',
          contentPreview: f.originalName
        }))];
      }

      combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setItems(combined);
    } catch (err) {
      console.error('Failed to fetch inbox', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInbox();
    }
  }, [isAuthenticated, authFetch]);

  useEffect(() => {
    if (socket.isConnected && user) {
      const s = socket.socket;
      s.emit('join-user-room', user._id);
      
      const handleNewItem = (data) => {
        fetchInbox();
      };
      
      s.on('newSharedItem', handleNewItem);
      return () => {
        s.off('newSharedItem', handleNewItem);
      };
    }
  }, [socket.isConnected, user]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <Inbox size={48} className="mx-auto text-gray-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Inbox Locked</h2>
          <p className="text-gray-400">Please sign in to view items shared with you.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Inbox className="text-brand-400" /> Shared with me
          </h1>
          <p className="text-gray-400">Clips and files sent directly to you.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 glass rounded-xl border border-white/5">
            <Inbox size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">Your inbox is empty</h3>
            <p className="text-gray-500 text-sm">When someone shares a clip or file directly with you, it will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <AnimatedCard key={item.key + i} delay={i * 0.05} className="glass rounded-xl p-4 hover:border-brand-500/30 transition-colors cursor-pointer group" onClick={() => navigate(`/clip?key=${item.key}&type=${item.type === 'file' ? 'file' : 'text'}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${item.type === 'file' ? 'bg-purple-500/10 text-purple-400' : 'bg-brand-500/10 text-brand-400'}`}>
                      {item.type === 'file' ? <File size={16} /> : <FileText size={16} />}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">/{item.key}</h3>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {item.hasPassword && <Lock size={14} className="text-gray-500" title="Password protected" />}
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                  {item.contentPreview || 'No preview available'}
                </p>
                <div className="flex items-center text-brand-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight size={14} className="ml-1" />
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
