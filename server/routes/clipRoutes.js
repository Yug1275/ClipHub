import express from 'express';
import { saveClip, getClip, deleteClip, getClipInfo, checkClipExists, getInbox } from '../controllers/clipController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Save a clip
router.post('/', saveClip);

// Get inbox clips
router.get('/inbox', authenticateToken, getInbox);

// Check if clip exists (for overwrite warning)
router.get('/:key/exists', checkClipExists);

// Get a clip by key
router.get('/:key', optionalAuth, getClip);

// Get clip info (metadata only)
router.get('/:key/info', optionalAuth, getClipInfo);

// Delete a clip
router.delete('/:key', deleteClip);

export default router;