import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '..', 'uploads');

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Profile image is required'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Convert file to Base64 to store directly in MongoDB
    // This avoids losing images when Render's free tier ephemeral file system restarts
    const fileData = fs.readFileSync(req.file.path);
    const base64String = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;

    if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
      const oldPath = path.join(uploadsRoot, user.profileImage.replace('/uploads/', ''));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profileImage = base64String;
    await user.save();

    // Clean up temporary local file since it's now in the database
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      error: 'Failed to upload profile image',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const regex = new RegExp(q, 'i');
    // Search by name or email (partial match, case-insensitive)
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
      isActive: true,
      _id: { $ne: req.user._id } // Don't return the current user
    })
    .select('_id name email profileImage')
    .limit(10)
    .lean();

    // Mask the email slightly for privacy if desired, or just return it. 
    // The prompt says "minimal public fields, never password hashes or emails in full."
    const maskedUsers = users.map(u => {
      const parts = u.email.split('@');
      const maskedEmail = parts[0].length > 2 
        ? `${parts[0].substring(0, 2)}***@${parts[1]}` 
        : `***@${parts[1]}`;
        
      return {
        _id: u._id,
        name: u.name,
        email: maskedEmail,
        profileImage: u.profileImage
      };
    });

    res.json({
      success: true,
      users: maskedUsers
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};
