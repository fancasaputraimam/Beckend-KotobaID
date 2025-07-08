const express = require('express');
const vertexAIConfig = require('../config/vertexai');
const { ensureVertexAI, addVertexAIModel } = require('../middleware/vertexaiMiddleware');
const router = express.Router();

// Apply middleware to all routes
router.use(ensureVertexAI);
router.use(addVertexAIModel);

// Status endpoint - shows configuration and health
router.get('/status', async (req, res) => {
  try {
    const status = vertexAIConfig.getStatus();
    const permissions = await vertexAIConfig.checkPermissions();
    
    res.json({
      success: true,
      status: 'Vertex AI is running',
      ...status,
      permissions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      details: error.message
    });
  }
});

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    const prompt = 'Say "Hello from Vertex AI Gemini!" in Japanese and Indonesian.';
    
    const result = await req.vertexAIModel.generateContent(prompt);
    const response = await result.response;
    
    res.json({
      success: true,
      message: 'Vertex AI connection successful',
      response: response.text(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Vertex AI Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to Vertex AI',
      details: error.message
    });
  }
});

// Translate text to Indonesian
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'Indonesian' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for translation'
      });
    }

    const prompt = `Translate the following text to ${targetLanguage}. Only provide the translation, no additional explanation:

Text to translate: "${text}"

Translation:`;

    const result = await req.vertexAIModel.generateContent(prompt);
    const response = await result.response;
    const translation = response.text().trim();

    res.json({
      success: true,
      originalText: text,
      translation: translation,
      targetLanguage: targetLanguage,
      confidence: 0.9,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation failed',
      details: error.message
    });
  }
});

// Explain kanji
router.post('/explain-kanji', async (req, res) => {
  try {
    const { kanji, context } = req.body;
    
    if (!kanji) {
      return res.status(400).json({
        success: false,
        error: 'Kanji character is required'
      });
    }

    const prompt = `Explain the kanji "${kanji}" in Indonesian language. Include the following information:

1. Arti dan makna kanji
2. Cara baca (onyomi dan kunyomi) 
3. Penggunaan dalam kehidupan sehari-hari
4. Contoh kata yang menggunakan kanji ini
5. Sejarah atau asal-usul kanji (jika relevan)

${context ? `Additional context: ${context}` : ''}

Please provide a comprehensive but concise explanation in Indonesian:`;

    const result = await req.vertexAIModel.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text().trim();

    res.json({
      success: true,
      kanji: kanji,
      explanation: explanation,
      confidence: 0.9,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kanji Explanation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Kanji explanation failed',
      details: error.message
    });
  }
});

// Explain grammar
router.post('/explain-grammar', async (req, res) => {
  try {
    const { grammar, examples, context } = req.body;
    
    if (!grammar) {
      return res.status(400).json({
        success: false,
        error: 'Grammar pattern is required'
      });
    }

    const examplesText = examples && examples.length > 0 
      ? `\n\nContoh kalimat:\n${examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}`
      : '';

    const prompt = `Jelaskan pola tata bahasa Jepang "${grammar}" dalam bahasa Indonesia. Sertakan informasi berikut:

1. Struktur dan rumus tata bahasa
2. Kapan dan bagaimana menggunakannya
3. Nuansa makna yang terkandung
4. Perbedaan dengan pola tata bahasa serupa (jika ada)
5. Tips untuk mengingat dan menggunakan pola ini

${examplesText}

${context ? `Konteks tambahan: ${context}` : ''}

Berikan penjelasan yang komprehensif namun mudah dipahami dalam bahasa Indonesia:`;

    const result = await req.vertexAIModel.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text().trim();

    res.json({
      success: true,
      grammar: grammar,
      explanation: explanation,
      examples: examples || [],
      confidence: 0.9,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Grammar Explanation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Grammar explanation failed',
      details: error.message
    });
  }
});

// General AI chat/conversation
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const prompt = `You are a helpful Japanese language learning assistant. Respond in Indonesian language.

${context ? `Context: ${context}` : ''}

User question: ${message}

Please provide a helpful and educational response:`;

    const result = await req.vertexAIModel.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text().trim();

    res.json({
      success: true,
      userMessage: message,
      aiResponse: aiResponse,
      confidence: 0.9,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat response failed',
      details: error.message
    });
  }
});

// Generate vocabulary examples
router.post('/generate-examples', async (req, res) => {
  try {
    const { word, reading, meaning } = req.body;
    
    if (!word) {
      return res.status(400).json({
        success: false,
        error: 'Word is required'
      });
    }

    const prompt = `Generate 3 example sentences using the Japanese word "${word}" (reading: ${reading || 'unknown'}, meaning: ${meaning || 'unknown'}).

For each example, provide:
1. Japanese sentence
2. Romaji reading
3. Indonesian translation

Format the response as JSON array with objects containing: sentence, reading, meaning

Examples:`;

    const result = await req.vertexAIModel.generateContent(prompt);
    const response = await result.response;
    const examples = response.text().trim();

    res.json({
      success: true,
      word: word,
      examples: examples,
      confidence: 0.9,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Example Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Example generation failed',
      details: error.message
    });
  }
});

module.exports = router;