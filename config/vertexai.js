const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');
const fs = require('fs');

class VertexAIConfig {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'dark-pipe-465302-g3';
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    this.model = process.env.VERTEX_AI_MODEL || 'gemini-pro';
    this.maxTokens = parseInt(process.env.VERTEX_AI_MAX_TOKENS) || 1000;
    this.temperature = parseFloat(process.env.VERTEX_AI_TEMPERATURE) || 0.7;
    
    this.vertexAI = null;
    this.isInitialized = false;
    this.initError = null;
  }

  async initialize() {
    try {
      console.log('🤖 Initializing Vertex AI Gemini...');
      console.log(`📍 Project: ${this.projectId}`);
      console.log(`🌍 Location: ${this.location}`);
      console.log(`🧠 Model: ${this.model}`);

      // Check if service account file exists
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!serviceAccountPath) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
      }

      const fullPath = path.resolve(serviceAccountPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Service account file not found: ${fullPath}`);
      }

      console.log(`🔑 Service Account: ${fullPath}`);

      // Initialize Vertex AI
      this.vertexAI = new VertexAI({
        project: this.projectId,
        location: this.location
      });

      // Test connection
      await this.testConnection();
      
      this.isInitialized = true;
      console.log('✅ Vertex AI Gemini initialized successfully!');
      
    } catch (error) {
      this.initError = error;
      console.error('❌ Failed to initialize Vertex AI:', error.message);
      console.error('💡 Please check your Google Cloud configuration');
      throw error;
    }
  }

  async testConnection() {
    try {
      const model = this.getModel();
      const testPrompt = 'Say "Hello from Vertex AI Gemini!" in one sentence.';
      
      const result = await model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🧪 Test Response:', text.substring(0, 100) + '...');
      return text;
    } catch (error) {
      console.error('❌ Vertex AI test failed:', error.message);
      throw new Error(`Vertex AI connection test failed: ${error.message}`);
    }
  }

  getModel() {
    if (!this.isInitialized) {
      throw new Error('Vertex AI not initialized. Call initialize() first.');
    }

    return this.vertexAI.preview.getGenerativeModel({
      model: this.model,
      generationConfig: {
        maxOutputTokens: this.maxTokens,
        temperature: this.temperature,
      },
    });
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      error: this.initError?.message || null,
      config: {
        projectId: this.projectId,
        location: this.location,
        model: this.model,
        maxTokens: this.maxTokens,
        temperature: this.temperature
      }
    };
  }

  // Helper method to check if service account has proper permissions
  async checkPermissions() {
    try {
      // This will fail if the service account doesn't have proper permissions
      const model = this.getModel();
      await model.generateContent('Test permissions');
      return { hasPermissions: true, error: null };
    } catch (error) {
      return { 
        hasPermissions: false, 
        error: error.message,
        suggestions: [
          'Ensure service account has "Vertex AI User" role',
          'Ensure service account has "AI Platform Developer" role',
          'Check if Vertex AI API is enabled in your project',
          'Verify the service account key file is valid'
        ]
      };
    }
  }
}

// Create singleton instance
const vertexAIConfig = new VertexAIConfig();

module.exports = vertexAIConfig;