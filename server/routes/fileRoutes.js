import express from 'express';
import upload from '../config/multer.js';
import { uploadFile, downloadFile, getFileInfo, deleteFile, checkFileExists } from '../controllers/fileController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Upload file (requires authentication)
router.post('/', authenticateToken, upload.single('file'), uploadFile);

// Check if file exists (requires authentication)
router.get('/:key/exists', authenticateToken, checkFileExists);

// Download file (public access)
router.get('/:key', downloadFile);

// Get file info (public access)
router.get('/:key/info', getFileInfo);

// Delete file (requires authentication and ownership)
router.delete('/:key', authenticateToken, deleteFile);

export default router;