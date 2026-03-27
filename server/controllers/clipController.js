import { getRedisClient } from '../config/redis.js';
import { getSecondsFromExpiry, isOneTimeExpiry } from '../utils/ttl.js';

export const saveClip = async (req, res) => {
  try {
    const { key, content, expiry = '1h' } = req.body;

    if (!key || !content) {
      return res.status(400).json({ 
        error: 'Key and content are required' 
      });
    }

    // Validate key format (alphanumeric, dash, underscore only)
    const keyRegex = /^[a-zA-Z0-9_-]+$/;
    if (!keyRegex.test(key)) {
      return res.status(400).json({ 
        error: 'Key can only contain letters, numbers, hyphens, and underscores' 
      });
    }

    const redis = getRedisClient();
    const ttlSeconds = getSecondsFromExpiry(expiry);

    // Check if key already exists
    const exists = await redis.exists(`clip:${key}`);
    
    // Create clip data
    const clipData = {
      content,
      createdAt: new Date().toISOString(),
      expiry,
      viewCount: 0,
      oneTime: isOneTimeExpiry(expiry),
      type: 'text'
    };

    // Save to Redis with TTL
    await redis.setEx(`clip:${key}`, ttlSeconds, JSON.stringify(clipData));

    res.json({
      success: true,
      message: exists ? 'Clip updated successfully' : 'Clip saved successfully',
      key,
      expiresIn: ttlSeconds,
      overwritten: exists === 1,
      url: `${req.protocol}://${req.get('host')}/api/clip/${key}`
    });

  } catch (error) {
    console.error('Error saving clip:', error);
    res.status(500).json({ error: 'Failed to save clip' });
  }
};

export const getClip = async (req, res) => {
  try {
    const { key } = req.params;
    const redis = getRedisClient();

    const clipDataString = await redis.get(`clip:${key}`);
    
    if (!clipDataString) {
      return res.status(404).json({ 
        error: 'Clip not found or has expired' 
      });
    }

    const clipData = JSON.parse(clipDataString);

    // Increment view count
    clipData.viewCount += 1;

    // Check if it's a one-time clip
    if (clipData.oneTime && clipData.viewCount > 1) {
      // Delete the clip after first view
      await redis.del(`clip:${key}`);
      return res.status(410).json({ 
        error: 'This clip was set to expire after one view and has already been accessed' 
      });
    }

    // If it's one-time, delete it now
    if (clipData.oneTime) {
      await redis.del(`clip:${key}`);
    } else {
      // Otherwise, update the view count
      const ttl = await redis.ttl(`clip:${key}`);
      await redis.setEx(`clip:${key}`, ttl, JSON.stringify(clipData));
    }

    // Get remaining TTL
    const remainingTTL = clipData.oneTime ? 0 : await redis.ttl(`clip:${key}`);

    res.json({
      success: true,
      data: {
        content: clipData.content,
        createdAt: clipData.createdAt,
        viewCount: clipData.viewCount,
        expiresIn: remainingTTL,
        oneTime: clipData.oneTime,
        type: clipData.type
      }
    });

  } catch (error) {
    console.error('Error retrieving clip:', error);
    res.status(500).json({ error: 'Failed to retrieve clip' });
  }
};

export const deleteClip = async (req, res) => {
  try {
    const { key } = req.params;
    const redis = getRedisClient();

    const deleted = await redis.del(`clip:${key}`);
    
    if (deleted === 0) {
      return res.status(404).json({ 
        error: 'Clip not found' 
      });
    }

    res.json({
      success: true,
      message: 'Clip deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting clip:', error);
    res.status(500).json({ error: 'Failed to delete clip' });
  }
};

export const getClipInfo = async (req, res) => {
  try {
    const { key } = req.params;
    const redis = getRedisClient();

    const clipDataString = await redis.get(`clip:${key}`);
    
    if (!clipDataString) {
      return res.status(404).json({ 
        error: 'Clip not found or has expired' 
      });
    }

    const clipData = JSON.parse(clipDataString);
    const remainingTTL = await redis.ttl(`clip:${key}`);

    res.json({
      success: true,
      info: {
        exists: true,
        createdAt: clipData.createdAt,
        viewCount: clipData.viewCount,
        expiresIn: remainingTTL,
        oneTime: clipData.oneTime,
        type: clipData.type,
        contentLength: clipData.content.length
      }
    });

  } catch (error) {
    console.error('Error getting clip info:', error);
    res.status(500).json({ error: 'Failed to get clip info' });
  }
};