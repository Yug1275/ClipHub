import express from 'express';
import { saveClip, getClip, deleteClip, getClipInfo, checkClipExists } from '../controllers/clipController.js';

const router = express.Router();

// Save a clip
router.post('/', saveClip);

// Check if clip exists (for overwrite warning)
router.get('/:key/exists', checkClipExists);

// Get a clip by key
router.get('/:key', getClip);

// Get clip info (metadata only)
router.get('/:key/info', getClipInfo);

// Delete a clip
router.delete('/:key', deleteClip);

export default router;