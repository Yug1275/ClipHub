import { useState } from 'react';
import { useAuth } from './useAuth';
import { API_URL } from '../utils/api';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ loaded: 0, total: 0, speed: 0, timeRemaining: 0 });
  const { authFetch, token } = useAuth();

  const uploadFile = async (key, file, expiry = '1d', options = {}) => {
    setUploading(true);
    setError(null);
    setUploadProgress({ loaded: 0, total: file.size, speed: 0, timeRemaining: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);
      formData.append('expiry', expiry);
      
      // Add optional parameters
      if (options.password) formData.append('password', options.password);
      if (options.maxViews) formData.append('maxViews', options.maxViews.toString());

      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let startTime = Date.now();
        let lastLoaded = 0;

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const currentTime = Date.now();
            const timeElapsed = (currentTime - startTime) / 1000; // in seconds
            
            if (timeElapsed > 0.5) { // Update speed every 0.5 seconds
              const bytesLoaded = event.loaded;
              const bytesDiff = bytesLoaded - lastLoaded;
              const speedBytesPerSec = bytesDiff / timeElapsed; // bytes per second
              
              const remainingBytes = event.total - bytesLoaded;
              const timeRemainingSecs = speedBytesPerSec > 0 ? remainingBytes / speedBytesPerSec : 0;

              setUploadProgress({
                loaded: bytesLoaded,
                total: event.total,
                speed: speedBytesPerSec,
                timeRemaining: timeRemainingSecs
              });

              lastLoaded = bytesLoaded;
              startTime = currentTime;
            } else {
              // Just update the loaded amount if not enough time has passed to calculate speed accurately
              setUploadProgress(prev => ({
                ...prev,
                loaded: event.loaded,
                total: event.total
              }));
            }
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.error) {
                reject(new Error(data.error));
              } else {
                resolve(data);
              }
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error || 'Upload failed'));
            } catch (e) {
              reject(new Error('Upload failed'));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        xhr.open('POST', `${API_URL}/api/file`, true);

        const headers = {};
        if (options.uploadMode) {
          headers['x-upload-mode'] = options.uploadMode;
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        for (const [key, value] of Object.entries(headers)) {
          xhr.setRequestHeader(key, value);
        }

        xhr.send(formData);
      });
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
    uploadProgress,
    error
  };
};
