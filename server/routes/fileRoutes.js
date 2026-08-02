import express from 'express';
import upload from '../config/multer.js';
import { uploadFile, downloadFile, getFileInfo, deleteFile, checkFileExists, getInbox } from '../controllers/fileController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Upload file (requires authentication)
router.post('/', authenticateToken, upload.single('file'), uploadFile);

// Check if file exists (requires authentication)
router.get('/:key/exists', authenticateToken, checkFileExists);

// Get inbox files
router.get('/inbox', authenticateToken, getInbox);

// Download file (public access / optional auth for private)
router.get('/:key', optionalAuth, downloadFile);

// Get file info (public access / optional auth for private)
router.get('/:key/info', optionalAuth, getFileInfo);

// Delete file (requires authentication and ownership)
router.delete('/:key', authenticateToken, deleteFile);

export default router;