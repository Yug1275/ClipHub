import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Search, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserSearch({ onSelect, selectedUser, onClear }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { authFetch } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await authFetch(`/api/user/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.users);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, authFetch]);

  if (selectedUser) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 mb-4">
        <div className="flex items-center gap-3">
          {selectedUser.profileImage ? (
            <img src={selectedUser.profileImage} alt={selectedUser.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User size={16} className="text-blue-400" />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-white">{selectedUser.name}</div>
            <div className="text-xs text-blue-300">{selectedUser.email}</div>
          </div>
        </div>
        <button 
          onClick={onClear}
          type="button"
          className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Share with user (optional)..."
          className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto"
          >
            {results.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => {
                  onSelect(user);
                  setQuery('');
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <User size={16} className="text-blue-400" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="text-sm font-medium text-white truncate">{user.name}</div>
                  <div className="text-xs text-gray-400 truncate">{user.email}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
