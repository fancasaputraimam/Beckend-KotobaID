const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const vertexAIConfig = require('./config/vertexai');
const vertexAIRoutes = require('./routes/vertexai');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const vertexAIStatus = vertexAIConfig.getStatus();
  
  res.status(200).json({
    status: 'OK',
    services: {
      server: 'running',
      vertexAI: vertexAIStatus.initialized ? 'ready' : 'not initialized'
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    vertexAI: vertexAIStatus
  });
});

// API routes
app.use('/api/vertexai', vertexAIRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 KotobaID Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  
  // Initialize Vertex AI
  try {
    await vertexAIConfig.initialize();
    console.log(`🤖 Vertex AI Project: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
    console.log(`📍 Vertex AI Location: ${process.env.GOOGLE_CLOUD_LOCATION}`);
  } catch (error) {
    console.error(`❌ Vertex AI initialization failed: ${error.message}`);
    console.log(`💡 Run setup script: npm run setup:vertex-ai`);
    console.log(`🧪 Test configuration: npm run test:vertex-ai`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});