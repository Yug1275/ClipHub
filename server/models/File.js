import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    index: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  maxDownloads: {
    type: Number,
    default: null
  },
  expiry: {
    type: String,
    enum: ['1h', '1d', '7d', '30d', 'never'],
    default: '1d'
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  hasPassword: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Set expiry date before saving
fileSchema.pre('save', function() {
  if (this.isNew && this.expiry !== 'never') {
    const expiryMap = {
      '1h': 1000 * 60 * 60,
      '1d': 1000 * 60 * 60 * 24,
      '7d': 1000 * 60 * 60 * 24 * 7,
      '30d': 1000 * 60 * 60 * 24 * 30
    };
    
    if (expiryMap[this.expiry]) {
      this.expiresAt = new Date(Date.now() + expiryMap[this.expiry]);
    }
  }
});

export default mongoose.model('File', fileSchema);