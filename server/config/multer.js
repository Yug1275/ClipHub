import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Documents
    'application/pdf', 'text/plain', 'text/csv',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Code
    'application/json', 'application/javascript', 'text/html', 'text/css',
    // Other
    'application/octet-stream'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Helper function to detect local network
export const isLocalIp = (ip) => {
  if (!ip) return false;
  return (
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('::ffff:127.0.0.1') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('::ffff:192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('::ffff:10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    /^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
  );
};

// Global config: 1.1GB limit and restricted file types
const globalUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1100 * 1024 * 1024, // 1.1GB limit (1GB 100MB)
    files: 1
  }
});

// Local config: Unlimited size and any file type
const localUpload = multer({
  storage,
  limits: {
    files: 1
  }
});

// Dynamic multer wrapper
const upload = {
  single: (fieldname) => {
    return (req, res, next) => {
      // Get the client IP
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const isForcedLocal = req.headers['x-upload-mode'] === 'local';
      
      if (isForcedLocal || isLocalIp(ip)) {
        req.isLocalMode = true; // Attach mode to request
        return localUpload.single(fieldname)(req, res, next);
      } else {
        req.isLocalMode = false;
        return globalUpload.single(fieldname)(req, res, (err) => {
          if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({ error: 'File size exceeds 1.1GB limit in Global Mode. Please switch to a local connection for unlimited sizes.' });
            }
            return res.status(400).json({ error: err.message });
          }
          next();
        });
      }
    };
  }
};

export default upload;