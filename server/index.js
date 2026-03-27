import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import corsMiddleware from './middleware/cors.js';
import rateLimiter from './middleware/rateLimiter.js';
import { connectRedis } from './config/redis.js';
import clipRoutes from './routes/clipRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
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
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimiter(60000, 100)); // 100 requests per minute

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ClipHub API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      clips: '/api/clip',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/clip', clipRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
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
    
    console.log('📝 Using Redis for data storage (Phase 2)');
    console.log('🔄 MongoDB integration coming in Phase 3');
    
    app.listen(PORT, HOST, () => {
      console.log(`🚀 ClipHub server running on http://${HOST}:${PORT}`);
      console.log(`📡 API endpoint: http://${HOST}:${PORT}/api`);
      console.log(`🔍 Health check: http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();