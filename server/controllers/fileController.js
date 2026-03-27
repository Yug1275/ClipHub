import File from '../models/File.js';
import { getRedisClient } from '../config/redis.js';
import { getSecondsFromExpiry } from '../utils/ttl.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req, res) => {
  try {
    const { key, expiry = '1d', password, maxViews } = req.body;
    const user = req.user;

    if (!key) {
      return res.status(400).json({
        error: 'Key is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // Validate key format
    const keyRegex = /^[a-zA-Z0-9_-]+$/;
    if (!keyRegex.test(key)) {
      return res.status(400).json({
        error: 'Key can only contain letters, numbers, hyphens, and underscores'
      });
    }

    // Validate maxViews if provided
    if (maxViews && (isNaN(maxViews) || maxViews < 1 || maxViews > 1000)) {
      return res.status(400).json({
        error: 'Max downloads must be between 1 and 1000'
      });
    }

    // Check if key already exists
    const existingFile = await File.findOne({ key });
    if (existingFile) {
      // Delete old file
      try {
        if (fs.existsSync(existingFile.path)) {
          fs.unlinkSync(existingFile.path);
        }
      } catch (err) {
        console.error('Error deleting old file:', err);
      }
      await File.findByIdAndDelete(existingFile._id);
    }

    // Create file record
    const fileRecord = new File({
      key,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: user._id,
      expiry,
      maxDownloads: maxViews ? parseInt(maxViews) : null,
      hasPassword: !!password,
      password: password ? await bcrypt.hash(password, 10) : null
    });

    await fileRecord.save();

    // Store metadata in Redis for quick access
    const redis = getRedisClient();
    const ttlSeconds = getSecondsFromExpiry(expiry);
    
    const fileMetadata = {
      id: fileRecord._id.toString(),
      key,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: user._id.toString(),
      createdAt: fileRecord.createdAt.toISOString(),
      type: 'file',
      hasPassword: !!password,
      maxDownloads: fileRecord.maxDownloads
    };

    await redis.setEx(`file:${key}`, ttlSeconds, JSON.stringify(fileMetadata));

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        key,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedBy: user.name,
        hasPassword: !!password,
        maxDownloads: fileRecord.maxDownloads,
        url: `${req.protocol}://${req.get('host')}/clip?key=${key}`,
        downloadUrl: `${req.protocol}://${req.get('host')}/api/file/${key}`
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Failed to upload file'
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { key } = req.params;
    const { password } = req.query;
    
    // First check Redis for quick access
    const redis = getRedisClient();
    const cachedMetadata = await redis.get(`file:${key}`);
    
    let fileRecord;
    
    if (cachedMetadata) {
      const metadata = JSON.parse(cachedMetadata);
      fileRecord = await File.findById(metadata.id);
    } else {
      fileRecord = await File.findOne({ key });
    }

    if (!fileRecord) {
      return res.status(404).json({
        error: 'File not found or has expired'
      });
    }

    // Check password protection
    if (fileRecord.hasPassword) {
      if (!password) {
        return res.status(401).json({
          error: 'This file is password protected',
          requiresPassword: true
        });
      }

      const isValidPassword = await bcrypt.compare(password, fileRecord.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid password',
          requiresPassword: true
        });
      }
    }

    // Check download limit
    if (fileRecord.maxDownloads && fileRecord.downloadCount >= fileRecord.maxDownloads) {
      // Delete the file
      if (fs.existsSync(fileRecord.path)) {
        try {
          fs.unlinkSync(fileRecord.path);
        } catch (err) {
          console.error('Error deleting file from disk:', err);
        }
      }
      await File.findByIdAndDelete(fileRecord._id);
      await redis.del(`file:${key}`);
      
      return res.status(410).json({
        error: 'This file has reached its maximum download limit and has been deleted'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(fileRecord.path)) {
      return res.status(404).json({
        error: 'File not found on server'
      });
    }

    // Increment download count
    fileRecord.downloadCount += 1;
    await fileRecord.save();

    // Check if should delete after this download
    const shouldDelete = fileRecord.maxDownloads && 
                        fileRecord.downloadCount >= fileRecord.maxDownloads;

    if (shouldDelete) {
      // Delete file after this download
      setTimeout(async () => {
        try {
          if (fs.existsSync(fileRecord.path)) {
            fs.unlinkSync(fileRecord.path);
          }
          await File.findByIdAndDelete(fileRecord._id);
          await redis.del(`file:${key}`);
        } catch (err) {
          console.error('Error in delayed file deletion:', err);
        }
      }, 1000); // 1 second delay to ensure download completes
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
    res.setHeader('Content-Type', fileRecord.mimetype);
    res.setHeader('Content-Length', fileRecord.size);

    // Stream the file
    const fileStream = fs.createReadStream(fileRecord.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      error: 'Failed to download file'
    });
  }
};

export const getFileInfo = async (req, res) => {
  try {
    const { key } = req.params;
    
    // Check Redis first
    const redis = getRedisClient();
    const cachedMetadata = await redis.get(`file:${key}`);
    
    let fileRecord;
    
    if (cachedMetadata) {
      const metadata = JSON.parse(cachedMetadata);
      fileRecord = await File.findById(metadata.id).populate('uploadedBy', 'name email');
    } else {
      fileRecord = await File.findOne({ key }).populate('uploadedBy', 'name email');
    }

    if (!fileRecord) {
      return res.status(404).json({
        error: 'File not found or has expired'
      });
    }

    res.json({
      success: true,
      file: {
        key: fileRecord.key,
        originalName: fileRecord.originalName,
        size: fileRecord.size,
        mimetype: fileRecord.mimetype,
        downloadCount: fileRecord.downloadCount,
        maxDownloads: fileRecord.maxDownloads,
        hasPassword: fileRecord.hasPassword,
        uploadedBy: fileRecord.uploadedBy.name,
        createdAt: fileRecord.createdAt,
        expiresAt: fileRecord.expiresAt,
        willExpireAfterNextDownload: fileRecord.maxDownloads && 
          fileRecord.downloadCount >= fileRecord.maxDownloads - 1
      }
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      error: 'Failed to get file info'
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { key } = req.params;
    const user = req.user;

    const fileRecord = await File.findOne({ key });

    if (!fileRecord) {
      return res.status(404).json({
        error: 'File not found'
      });
    }

    // Check if user owns the file
    if (fileRecord.uploadedBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: 'You can only delete your own files'
      });
    }

    // Delete file from disk
    if (fs.existsSync(fileRecord.path)) {
      try {
        fs.unlinkSync(fileRecord.path);
      } catch (err) {
        console.error('Error deleting file from disk:', err);
      }
    }

    // Delete from database
    await File.findByIdAndDelete(fileRecord._id);

    // Delete from Redis
    const redis = getRedisClient();
    await redis.del(`file:${key}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Failed to delete file'
    });
  }
};

// Check if file exists (for overwrite warning)
export const checkFileExists = async (req, res) => {
  try {
    const { key } = req.params;
    
    const fileRecord = await File.findOne({ key }).populate('uploadedBy', 'name');
    
    if (fileRecord) {
      res.json({
        exists: true,
        info: {
          originalName: fileRecord.originalName,
          size: fileRecord.size,
          uploadedBy: fileRecord.uploadedBy.name,
          createdAt: fileRecord.createdAt,
          downloadCount: fileRecord.downloadCount,
          maxDownloads: fileRecord.maxDownloads,
          hasPassword: fileRecord.hasPassword
        }
      });
    } else {
      res.json({ exists: false });
    }

  } catch (error) {
    console.error('Error checking file exists:', error);
    res.status(500).json({ error: 'Failed to check file' });
  }
};