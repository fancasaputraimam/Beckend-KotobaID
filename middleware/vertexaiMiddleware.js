const vertexAIConfig = require('../config/vertexai');

// Middleware to ensure Vertex AI is initialized
const ensureVertexAI = async (req, res, next) => {
  try {
    if (!vertexAIConfig.isInitialized) {
      await vertexAIConfig.initialize();
    }
    next();
  } catch (error) {
    console.error('Vertex AI initialization failed:', error);
    
    // Return helpful error response
    res.status(503).json({
      success: false,
      error: 'AI service unavailable',
      details: error.message,
      suggestions: [
        'Check if service account file exists',
        'Verify Google Cloud project ID is correct',
        'Ensure Vertex AI API is enabled',
        'Check service account permissions'
      ],
      status: vertexAIConfig.getStatus()
    });
  }
};

// Middleware to add Vertex AI model to request
const addVertexAIModel = (req, res, next) => {
  try {
    req.vertexAIModel = vertexAIConfig.getModel();
    req.vertexAIConfig = vertexAIConfig;
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'AI model unavailable',
      details: error.message
    });
  }
};

module.exports = {
  ensureVertexAI,
  addVertexAIModel
};