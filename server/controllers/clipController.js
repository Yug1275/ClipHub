import { getRedisClient } from '../config/redis.js';
import { getSecondsFromExpiry, isOneTimeExpiry } from '../utils/ttl.js';
import bcrypt from 'bcryptjs';
import { broadcastToUser } from '../config/socket.js';

const APP_MODE = process.env.APP_MODE || 'global';
const localStore = new Map();
const localInbox = new Map();

// Auto cleanup for local store
if (APP_MODE === 'local') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of localStore) {
      if (value.expiryTime && value.expiryTime < now) {
        localStore.delete(key);
      }
    }
  }, 5000);
}

export const saveClip = async (req, res) => {
  try {
    const { key, content, expiry = '1h', password, maxViews, recipientId, encrypted, burnAfterReading } = req.body;

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

    const ttlSeconds = getSecondsFromExpiry(expiry);

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
      createdBy: req.ip,
      recipient: recipientId || null,
      visibility: recipientId ? 'private-user' : 'public-key',
      encrypted: !!encrypted,
      burnAfterReading: !!burnAfterReading
    };

    let exists = false;

    if (APP_MODE === 'local') {
      exists = localStore.has(key);
      const storedData = { ...clipData };
      storedData.expiryTime = Date.now() + (ttlSeconds * 1000);
      localStore.set(key, storedData);

      if (recipientId) {
        if (!localInbox.has(recipientId)) localInbox.set(recipientId, new Set());
        localInbox.get(recipientId).add(key);
      }
    } else {
      const redis = getRedisClient();
      exists = await redis.exists(`clip:${key}`);
      await redis.setEx(`clip:${key}`, ttlSeconds, JSON.stringify(clipData));
      
      if (recipientId) {
        await redis.sAdd(`user:${recipientId}:inbox_clips`, key);
        // We set expire on the set member implicitly via the clip expiring.
        // The getInbox method cleans up expired ones.
      }
    }

    // Emit event if it's for a specific user
    if (recipientId) {
      broadcastToUser(recipientId, 'newSharedItem', { type: 'clip', key });
    }

    res.json({
      success: true,
      message: exists ? 'Clip updated successfully' : 'Clip saved successfully',
      key,
      expiresIn: ttlSeconds,
      overwritten: !!exists,
      hasPassword: !!password,
      encrypted: !!encrypted,
      burnAfterReading: !!burnAfterReading,
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

    let clipData = null;
    let remainingTTL = 0;

    if (APP_MODE === 'local') {
      const data = localStore.get(key);
      if (!data) return res.status(404).json({ error: 'Clip not found or has expired' });
      
      if (data.expiryTime < Date.now()) {
        localStore.delete(key);
        return res.status(404).json({ error: 'Clip not found or has expired' });
      }
      clipData = data;
      remainingTTL = Math.floor((data.expiryTime - Date.now()) / 1000);
    } else {
      const redis = getRedisClient();
      const clipDataString = await redis.get(`clip:${key}`);
      if (!clipDataString) return res.status(404).json({ error: 'Clip not found or has expired' });
      
      clipData = JSON.parse(clipDataString);
      remainingTTL = await redis.ttl(`clip:${key}`);
    }

    // Check visibility
    if (clipData.visibility === 'private-user') {
      if (!req.user || req.user._id.toString() !== clipData.recipient) {
        return res.status(403).json({ error: 'Access denied. This clip is private.' });
      }
    }

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
      if (APP_MODE === 'local') localStore.delete(key);
      else await getRedisClient().del(`clip:${key}`);
      return res.status(410).json({
        error: 'This clip has reached its maximum view limit and has been deleted'
      });
    }

    // Increment view count
    clipData.viewCount += 1;

    // Check if it's a one-time clip, reached max views, or burn after reading
    const shouldDelete = clipData.oneTime || 
                        clipData.burnAfterReading ||
                        (clipData.maxViews && clipData.viewCount >= clipData.maxViews);

    if (shouldDelete) {
      if (APP_MODE === 'local') localStore.delete(key);
      else await getRedisClient().del(`clip:${key}`);
      remainingTTL = 0;
    } else {
      if (APP_MODE === 'local') {
        localStore.set(key, clipData);
      } else {
        const redis = getRedisClient();
        await redis.setEx(`clip:${key}`, remainingTTL, JSON.stringify(clipData));
      }
    }

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
        encrypted: clipData.encrypted,
        burnAfterReading: clipData.burnAfterReading,
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
    let deleted = false;

    if (APP_MODE === 'local') {
      deleted = localStore.delete(key);
    } else {
      const redis = getRedisClient();
      deleted = (await redis.del(`clip:${key}`)) > 0;
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Clip not found' });
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
    let clipData = null;
    let remainingTTL = 0;

    if (APP_MODE === 'local') {
      clipData = localStore.get(key);
      if (clipData && clipData.expiryTime < Date.now()) {
        localStore.delete(key);
        clipData = null;
      }
      if (clipData) {
        remainingTTL = Math.floor((clipData.expiryTime - Date.now()) / 1000);
      }
    } else {
      const redis = getRedisClient();
      const clipDataString = await redis.get(`clip:${key}`);
      if (clipDataString) {
        clipData = JSON.parse(clipDataString);
        remainingTTL = await redis.ttl(`clip:${key}`);
      }
    }

    if (!clipData) {
      return res.status(404).json({ error: 'Clip not found or has expired' });
    }

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
        encrypted: clipData.encrypted,
        burnAfterReading: clipData.burnAfterReading,
        willExpireAfterNextView: clipData.oneTime || clipData.burnAfterReading ||
          (clipData.maxViews && clipData.viewCount >= clipData.maxViews - 1)
      }
    });

  } catch (error) {
    console.error('Error getting clip info:', error);
    res.status(500).json({ error: 'Failed to get clip info' });
  }
};

export const checkClipExists = async (req, res) => {
  try {
    const { key } = req.params;
    let clipData = null;
    let remainingTTL = 0;

    if (APP_MODE === 'local') {
      clipData = localStore.get(key);
      if (clipData && clipData.expiryTime < Date.now()) {
        localStore.delete(key);
        clipData = null;
      }
      if (clipData) {
        remainingTTL = Math.floor((clipData.expiryTime - Date.now()) / 1000);
      }
    } else {
      const redis = getRedisClient();
      const exists = await redis.exists(`clip:${key}`);
      if (exists) {
        const clipDataString = await redis.get(`clip:${key}`);
        clipData = JSON.parse(clipDataString);
        remainingTTL = await redis.ttl(`clip:${key}`);
      }
    }

    if (clipData) {
      res.json({
        exists: true,
        info: {
          createdAt: clipData.createdAt,
          viewCount: clipData.viewCount,
          maxViews: clipData.maxViews,
          expiresIn: remainingTTL,
          type: clipData.type,
          hasPassword: clipData.hasPassword,
          encrypted: clipData.encrypted,
          burnAfterReading: clipData.burnAfterReading,
          contentPreview: clipData.encrypted ? '[Encrypted Content]' : clipData.content.substring(0, 50) + (clipData.content.length > 50 ? '...' : '')
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

export const getInbox = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const clips = [];
    
    if (APP_MODE === 'local') {
      const userClips = localInbox.get(userId);
      if (userClips) {
        for (const key of userClips) {
          const data = localStore.get(key);
          if (data && data.expiryTime > Date.now()) {
            clips.push({
              key,
              type: data.type,
              createdAt: data.createdAt,
              contentPreview: data.encrypted ? '[Encrypted Content]' : data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
              hasPassword: data.hasPassword,
              encrypted: data.encrypted
            });
          } else {
            userClips.delete(key);
          }
        }
      }
    } else {
      const redis = getRedisClient();
      const userSetKey = `user:${userId}:inbox_clips`;
      const keys = await redis.sMembers(userSetKey);
      
      for (const key of keys) {
        const clipDataString = await redis.get(`clip:${key}`);
        if (clipDataString) {
          const data = JSON.parse(clipDataString);
          clips.push({
            key,
            type: data.type,
            createdAt: data.createdAt,
            contentPreview: data.encrypted ? '[Encrypted Content]' : data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
            hasPassword: data.hasPassword,
            encrypted: data.encrypted
          });
        } else {
          // Clean up expired key from set
          await redis.sRem(userSetKey, key);
        }
      }
    }

    // Sort by createdAt descending
    clips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      clips
    });
  } catch (error) {
    console.error('Error getting inbox clips:', error);
    res.status(500).json({ error: 'Failed to retrieve inbox clips' });
  }
};
