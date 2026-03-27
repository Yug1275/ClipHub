import { useState } from 'react';
import { useAuth } from './useAuth';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { authFetch } = useAuth();

  const uploadFile = async (key, file, expiry = '1d', options = {}) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);
      formData.append('expiry', expiry);
      
      // Add optional parameters
      if (options.password) formData.append('password', options.password);
      if (options.maxViews) formData.append('maxViews', options.maxViews.toString());

      const response = await authFetch('/api/file', {
        method: 'POST',
        body: formData,
        headers: {} // Don't set Content-Type for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (key, password = null) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let url = `${API_URL}/api/file/${key}`;
      
      if (password) {
        url += `?password=${encodeURIComponent(password)}`;
      }
      
      // For downloads, we need to handle the response differently
      const response = await fetch(url);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed');
      }
      
      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'download';
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) {
          filename = match[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteFile = async (key) => {
    setError(null);

    try {
      const response = await authFetch(`/api/file/${key}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const checkFileExists = async (key) => {
    try {
      const response = await authFetch(`/api/file/${key}/exists`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check file');
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    uploadFile,
    downloadFile,
    deleteFile,
    checkFileExists,
    uploading,
    error
  };
};