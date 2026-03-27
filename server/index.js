import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import corsMiddleware from './middleware/cors.js';
import rateLimiter from './middleware/rateLimiter.js';
import { connectRedis } from './config/redis.js';
import connectDB from './config/database.js';
import clipRoutes from './routes/clipRoutes.js';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { createServer } from 'http';
import { initializeSocket } from './config/socket.js';

// Load environment variables
dotenv.config();

// ES6 __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const ENABLE_HTTP_LOGS = process.env.ENABLE_HTTP_LOGS === 'true';

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(corsMiddleware);

// Request logging
if (ENABLE_HTTP_LOGS) {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimiter(60000, 100)); // 100 requests per minute

// Static file serving for uploads (public access)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ClipHub API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      clips: '/api/clip',
      auth: '/api/auth',
      files: '/api/file',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      redis: 'connected',
      mongodb: 'connected' // Will be dynamic later
    }
  });
});

// API routes
app.use('/api/clip', clipRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Only one file allowed.' });
    }
  }

  // File filter errors
  if (err.message.includes('File type') && err.message.includes('is not allowed')) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();

    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.io
    const io = initializeSocket(server);

    server.listen(PORT, HOST, () => {
      console.log(`🚀 ClipHub server running on http://${HOST}:${PORT}`);
      console.log(`📡 API endpoint: http://${HOST}:${PORT}/api`);
      console.log(`🔍 Health check: http://${HOST}:${PORT}/health`);
      console.log(`📁 File uploads: http://${HOST}:${PORT}/api/file`);
      console.log(`🔐 Authentication: http://${HOST}:${PORT}/api/auth`);
      console.log(`⚡ WebSocket server initialized`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();