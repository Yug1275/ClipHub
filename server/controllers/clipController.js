import { getRedisClient } from '../config/redis.js';
import { getSecondsFromExpiry, isOneTimeExpiry } from '../utils/ttl.js';
import bcrypt from 'bcryptjs';

export const saveClip = async (req, res) => {
  try {
    const { key, content, expiry = '1h', password, maxViews } = req.body;

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

    // Validate maxViews if provided
    if (maxViews && (isNaN(maxViews) || maxViews < 1 || maxViews > 1000)) {
      return res.status(400).json({
        error: 'Max views must be between 1 and 1000'
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
      maxViews: maxViews ? parseInt(maxViews) : null,
      oneTime: isOneTimeExpiry(expiry),
      type: 'text',
      hasPassword: !!password,
      password: password ? await bcrypt.hash(password, 10) : null,
      createdBy: req.ip
    };

    // Save to Redis with TTL
    await redis.setEx(`clip:${key}`, ttlSeconds, JSON.stringify(clipData));

    res.json({
      success: true,
      message: exists ? 'Clip updated successfully' : 'Clip saved successfully',
      key,
      expiresIn: ttlSeconds,
      overwritten: exists === 1,
      hasPassword: !!password,
      maxViews: clipData.maxViews,
      url: `${req.protocol}://${req.get('host')}/clip?key=${key}`,
      apiUrl: `${req.protocol}://${req.get('host')}/api/clip/${key}`
    });

  } catch (error) {
    console.error('Error saving clip:', error);
    res.status(500).json({ error: 'Failed to save clip' });
  }
};

export const getClip = async (req, res) => {
  try {
    const { key } = req.params;
    const { password } = req.query;
    const redis = getRedisClient();

    const clipDataString = await redis.get(`clip:${key}`);
    
    if (!clipDataString) {
      return res.status(404).json({ 
        error: 'Clip not found or has expired' 
      });
    }

    const clipData = JSON.parse(clipDataString);

    // Check password protection
    if (clipData.hasPassword) {
      if (!password) {
        return res.status(401).json({
          error: 'This clip is password protected',
          requiresPassword: true
        });
      }

      const isValidPassword = await bcrypt.compare(password, clipData.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid password',
          requiresPassword: true
        });
      }
    }

    // Check view limit
    if (clipData.maxViews && clipData.viewCount >= clipData.maxViews) {
      await redis.del(`clip:${key}`);
      return res.status(410).json({
        error: 'This clip has reached its maximum view limit and has been deleted'
      });
    }

    // Increment view count
    clipData.viewCount += 1;

    // Check if it's a one-time clip or reached max views
    const shouldDelete = clipData.oneTime || 
                        (clipData.maxViews && clipData.viewCount >= clipData.maxViews);

    if (shouldDelete) {
      // Delete the clip after this view
      await redis.del(`clip:${key}`);
    } else {
      // Update the view count
      const ttl = await redis.ttl(`clip:${key}`);
      await redis.setEx(`clip:${key}`, ttl, JSON.stringify(clipData));
    }

    // Get remaining TTL
    const remainingTTL = shouldDelete ? 0 : await redis.ttl(`clip:${key}`);

    res.json({
      success: true,
      data: {
        content: clipData.content,
        createdAt: clipData.createdAt,
        viewCount: clipData.viewCount,
        maxViews: clipData.maxViews,
        expiresIn: remainingTTL,
        oneTime: clipData.oneTime,
        type: clipData.type,
        willExpireAfterView: shouldDelete
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
        maxViews: clipData.maxViews,
        expiresIn: remainingTTL,
        oneTime: clipData.oneTime,
        type: clipData.type,
        contentLength: clipData.content.length,
        hasPassword: clipData.hasPassword,
        willExpireAfterNextView: clipData.oneTime || 
          (clipData.maxViews && clipData.viewCount >= clipData.maxViews - 1)
      }
    });

  } catch (error) {
    console.error('Error getting clip info:', error);
    res.status(500).json({ error: 'Failed to get clip info' });
  }
};

// New endpoint for checking if clip exists before overwrite
export const checkClipExists = async (req, res) => {
  try {
    const { key } = req.params;
    const redis = getRedisClient();

    const exists = await redis.exists(`clip:${key}`);
    
    if (exists) {
      const clipDataString = await redis.get(`clip:${key}`);
      const clipData = JSON.parse(clipDataString);
      const remainingTTL = await redis.ttl(`clip:${key}`);

      res.json({
        exists: true,
        info: {
          createdAt: clipData.createdAt,
          viewCount: clipData.viewCount,
          maxViews: clipData.maxViews,
          expiresIn: remainingTTL,
          type: clipData.type,
          hasPassword: clipData.hasPassword,
          contentPreview: clipData.content.substring(0, 50) + (clipData.content.length > 50 ? '...' : '')
        }
      });
    } else {
      res.json({ exists: false });
    }

  } catch (error) {
    console.error('Error checking clip exists:', error);
    res.status(500).json({ error: 'Failed to check clip' });
  }
};