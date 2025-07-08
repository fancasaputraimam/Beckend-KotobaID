#!/usr/bin/env node

/**
 * KotobaID Vertex AI Test Script
 * Tests the Vertex AI Gemini integration
 */

require('dotenv').config();
const vertexAIConfig = require('../config/vertexai');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConfiguration() {
  colorLog('blue', '🔧 Testing Configuration...');
  
  const requiredEnvVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_LOCATION',
    'GOOGLE_APPLICATION_CREDENTIALS'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    colorLog('red', `❌ Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  colorLog('green', '✅ All required environment variables are set');
  
  // Check if service account file exists
  const fs = require('fs');
  const path = require('path');
  const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  
  if (!fs.existsSync(serviceAccountPath)) {
    colorLog('red', `❌ Service account file not found: ${serviceAccountPath}`);
    return false;
  }
  
  colorLog('green', `✅ Service account file found: ${serviceAccountPath}`);
  return true;
}

async function testVertexAIInitialization() {
  colorLog('blue', '🤖 Testing Vertex AI Initialization...');
  
  try {
    await vertexAIConfig.initialize();
    colorLog('green', '✅ Vertex AI initialized successfully');
    return true;
  } catch (error) {
    colorLog('red', `❌ Vertex AI initialization failed: ${error.message}`);
    return false;
  }
}

async function testBasicGeneration() {
  colorLog('blue', '💬 Testing Basic Text Generation...');
  
  try {
    const model = vertexAIConfig.getModel();
    const prompt = 'Say "Hello from Vertex AI Gemini!" in one sentence.';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    colorLog('green', '✅ Basic generation test passed');
    colorLog('cyan', `Response: ${text.substring(0, 100)}...`);
    return true;
  } catch (error) {
    colorLog('red', `❌ Basic generation test failed: ${error.message}`);
    return false;
  }
}

async function testTranslation() {
  colorLog('blue', '🌐 Testing Translation...');
  
  try {
    const model = vertexAIConfig.getModel();
    const prompt = 'Translate "Hello world" to Indonesian. Only provide the translation:';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    colorLog('green', '✅ Translation test passed');
    colorLog('cyan', `Translation: ${text.trim()}`);
    return true;
  } catch (error) {
    colorLog('red', `❌ Translation test failed: ${error.message}`);
    return false;
  }
}

async function testKanjiExplanation() {
  colorLog('blue', '🔤 Testing Kanji Explanation...');
  
  try {
    const model = vertexAIConfig.getModel();
    const prompt = 'Explain the kanji "学" (study/learn) in Indonesian in 2-3 sentences:';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    colorLog('green', '✅ Kanji explanation test passed');
    colorLog('cyan', `Explanation: ${text.substring(0, 150)}...`);
    return true;
  } catch (error) {
    colorLog('red', `❌ Kanji explanation test failed: ${error.message}`);
    return false;
  }
}

async function testPermissions() {
  colorLog('blue', '🔐 Testing Permissions...');
  
  try {
    const permissions = await vertexAIConfig.checkPermissions();
    
    if (permissions.hasPermissions) {
      colorLog('green', '✅ Service account has proper permissions');
      return true;
    } else {
      colorLog('red', `❌ Permission check failed: ${permissions.error}`);
      colorLog('yellow', 'Suggestions:');
      permissions.suggestions.forEach(suggestion => {
        colorLog('yellow', `  • ${suggestion}`);
      });
      return false;
    }
  } catch (error) {
    colorLog('red', `❌ Permission test failed: ${error.message}`);
    return false;
  }
}

async function testAPIEndpoints() {
  colorLog('blue', '🌐 Testing API Endpoints...');
  
  const axios = require('axios').default;
  const baseURL = `http://localhost:${process.env.PORT || 3001}`;
  
  try {
    // Test status endpoint
    const statusResponse = await axios.get(`${baseURL}/api/vertexai/status`);
    if (statusResponse.data.success) {
      colorLog('green', '✅ Status endpoint working');
    } else {
      colorLog('red', '❌ Status endpoint failed');
      return false;
    }
    
    // Test translation endpoint
    const translationResponse = await axios.post(`${baseURL}/api/vertexai/translate`, {
      text: 'Hello',
      targetLanguage: 'Indonesian'
    });
    
    if (translationResponse.data.success) {
      colorLog('green', '✅ Translation endpoint working');
      colorLog('cyan', `Translation: ${translationResponse.data.translation}`);
    } else {
      colorLog('red', '❌ Translation endpoint failed');
      return false;
    }
    
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      colorLog('yellow', '⚠️  Server not running, skipping API endpoint tests');
      colorLog('yellow', '   Start server with: npm run dev');
      return true; // Don't fail the test if server is not running
    } else {
      colorLog('red', `❌ API endpoint test failed: ${error.message}`);
      return false;
    }
  }
}

async function runAllTests() {
  colorLog('magenta', '🧪 KotobaID Vertex AI Test Suite');
  colorLog('magenta', '==================================');
  console.log('');
  
  const tests = [
    { name: 'Configuration', fn: testConfiguration },
    { name: 'Vertex AI Initialization', fn: testVertexAIInitialization },
    { name: 'Basic Generation', fn: testBasicGeneration },
    { name: 'Translation', fn: testTranslation },
    { name: 'Kanji Explanation', fn: testKanjiExplanation },
    { name: 'Permissions', fn: testPermissions },
    { name: 'API Endpoints', fn: testAPIEndpoints }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      colorLog('red', `❌ ${test.name} test crashed: ${error.message}`);
      failed++;
    }
    console.log('');
  }
  
  // Summary
  colorLog('magenta', '📊 Test Summary');
  colorLog('magenta', '===============');
  colorLog('green', `✅ Passed: ${passed}`);
  colorLog('red', `❌ Failed: ${failed}`);
  colorLog('blue', `📈 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('');
    colorLog('green', '🎉 All tests passed! Vertex AI is ready to use.');
    colorLog('cyan', '💡 You can now start the server with: npm run dev');
  } else {
    console.log('');
    colorLog('red', '⚠️  Some tests failed. Please check the configuration.');
    colorLog('yellow', '💡 Run the setup script: ./scripts/setup-vertex-ai.sh');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('KotobaID Vertex AI Test Script');
  console.log('');
  console.log('Usage: node test-vertex-ai.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --config       Test configuration only');
  console.log('  --init         Test initialization only');
  console.log('  --api          Test API endpoints only');
  console.log('');
  process.exit(0);
}

// Run specific tests based on arguments
if (args.includes('--config')) {
  testConfiguration().then(result => process.exit(result ? 0 : 1));
} else if (args.includes('--init')) {
  testVertexAIInitialization().then(result => process.exit(result ? 0 : 1));
} else if (args.includes('--api')) {
  testAPIEndpoints().then(result => process.exit(result ? 0 : 1));
} else {
  // Run all tests
  runAllTests();
}