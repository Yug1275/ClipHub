import { useState } from 'react';
import { useAuth } from './useAuth';

export const useClipboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authFetch } = useAuth();

  const saveClip = async (key, content, expiry = '1h', options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        key,
        content,
        expiry,
        ...options // password, maxViews
      };

      const response = await authFetch(`/api/clip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save clip');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getClip = async (key, password = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = new URL(`/api/clip/${key}`, window.location.origin);
      if (password) {
        url.searchParams.append('password', password);
      }

      const response = await authFetch(url.pathname + url.search);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get clip');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkClipExists = async (key) => {
    try {
      const response = await authFetch(`/api/clip/${key}/exists`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check clip');
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteClip = async (key) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/clip/${key}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete clip');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getClipInfo = async (key) => {
    try {
      const response = await authFetch(`/api/clip/${key}/info`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get clip info');
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    saveClip,
    getClip,
    checkClipExists,
    deleteClip,
    getClipInfo,
    loading,
    error,
  };
};