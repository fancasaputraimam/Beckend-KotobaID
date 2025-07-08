# KotobaID Backend - Vertex AI Gemini Integration

Backend API server untuk aplikasi KotobaID yang mengintegrasikan Google Cloud Vertex AI Gemini untuk fitur AI seperti terjemahan dan penjelasan.

## 🚀 Quick Start

### Automated Setup (Recommended)

1. **Run the automated setup script:**
```bash
cd backend
npm run setup:vertex-ai
```

This script will:
- Check Google Cloud CLI installation
- Login to Google Cloud (if needed)
- Enable required APIs
- Create service account with proper permissions
- Generate and download service account key
- Create environment file template
- Test the connection

2. **Copy environment configuration:**
```bash
cp .env.vertex-ai .env
# Edit .env if needed
```

3. **Test the setup:**
```bash
npm run test:vertex-ai
```

4. **Start the server:**
```bash
npm run dev
```

### Manual Setup

### Prerequisites

1. **Node.js** (v18 atau lebih baru)
2. **Google Cloud Project** dengan Vertex AI API enabled
3. **Service Account** dengan permissions yang sesuai

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Setup environment variables:**
```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi Anda:
```env
GOOGLE_CLOUD_PROJECT_ID=dark-pipe-465302-g3
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
PORT=3001
FRONTEND_URL=http://localhost:5173
```

3. **Setup Service Account:**
   - Download service account key dari Google Cloud Console
   - Simpan sebagai `service-account.json` di folder backend
   - **JANGAN** commit file ini ke git!

4. **Start development server:**
```bash
npm run dev
```

## 🧪 Testing

### Test Vertex AI Configuration

```bash
# Test all components
npm run test:vertex-ai

# Test configuration only
npm run test:config

# Test API endpoints only (server must be running)
npm run test:api
```

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test Vertex AI status
curl http://localhost:3001/api/vertexai/status

# Test translation
curl -X POST http://localhost:3001/api/vertexai/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "targetLanguage": "Indonesian"}'
```

Server akan berjalan di `http://localhost:3001`

## 📋 API Endpoints

### Health Check
```
GET /health
```
Mengecek status server dan koneksi.

### Vertex AI Status
```
GET /api/vertexai/status
```
Mengecek status dan konfigurasi Vertex AI Gemini.

### Test Vertex AI
```
GET /api/vertexai/test
```
Test koneksi ke Vertex AI Gemini dengan prompt sederhana.

### Translate Text
```
POST /api/vertexai/translate
Content-Type: application/json

{
  "text": "Hello world",
  "targetLanguage": "Indonesian"
}
```

### Explain Kanji
```
POST /api/vertexai/explain-kanji
Content-Type: application/json

{
  "kanji": "学",
  "context": "optional context"
}
```

### Explain Grammar
```
POST /api/vertexai/explain-grammar
Content-Type: application/json

{
  "grammar": "です/である",
  "examples": ["これは本です", "彼は学生である"],
  "context": "optional context"
}
```

### AI Chat
```
POST /api/vertexai/chat
Content-Type: application/json

{
  "message": "Bagaimana cara menggunakan partikel は?",
  "context": "optional context"
}
```

### Generate Examples
```
POST /api/vertexai/generate-examples
Content-Type: application/json

{
  "word": "学校",
  "reading": "がっこう",
  "meaning": "school"
}
```

## 🔧 Configuration

### Automated Configuration

Gunakan script setup otomatis:
```bash
npm run setup:vertex-ai
```

### Manual Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud Project ID | `dark-pipe-465302-g3` |
| `GOOGLE_CLOUD_LOCATION` | Vertex AI location | `us-central1` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | `./service-account.json` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `VERTEX_AI_MODEL` | Gemini model to use | `gemini-pro` |
| `VERTEX_AI_MAX_TOKENS` | Max response tokens | `1000` |
| `VERTEX_AI_TEMPERATURE` | AI creativity level | `0.7` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `DEBUG_VERTEX_AI` | Enable debug logging | `false` |
| `LOG_LEVEL` | Logging level | `info` |

## 🛠️ Development Scripts

```bash
# Setup Vertex AI (automated)
npm run setup:vertex-ai

# Test Vertex AI configuration
npm run test:vertex-ai

# Test configuration only
npm run test:config

# Test API endpoints
npm run test:api

# Start development server
npm run dev

# Start production server
npm start
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Validate request data
- **Error Handling** - Secure error responses

## 📦 Deployment

### Google Cloud Run

1. **Build Docker image:**
```bash
docker build -t kotobaid-backend .
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy kotobaid-backend \
  --image kotobaid-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Railway

1. **Connect GitHub repository**
2. **Set environment variables**
3. **Deploy automatically**

### Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

## 🧪 Testing

### Test API endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Test Vertex AI
curl http://localhost:3001/api/vertexai/test

# Translate text
curl -X POST http://localhost:3001/api/vertexai/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "targetLanguage": "Indonesian"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **Setup Issues:**
   ```bash
   # Run automated setup
   npm run setup:vertex-ai
   
   # Test configuration
   npm run test:vertex-ai
   ```

2. **"Permission denied" errors:**
   - Check service account permissions
   - Ensure Vertex AI API is enabled
   - Verify project ID is correct

3. **"Model not found" errors:**
   - Check if model is available in your region
   - Try different model (gemini-1.5-flash)

4. **Rate limit errors:**
   - Adjust rate limiting settings
   - Check Google Cloud quotas

5. **CORS errors:**
   - Verify FRONTEND_URL in .env
   - Check CORS configuration

6. **Service account file not found:**
   ```bash
   # Check if file exists
   ls -la service-account.json
   
   # Re-run setup if missing
   npm run setup:vertex-ai
   ```

7. **API initialization failed:**
   ```bash
   # Check API status
   gcloud services list --enabled --filter="name:aiplatform.googleapis.com"
   
   # Enable if needed
   gcloud services enable aiplatform.googleapis.com
   ```

### Logs

Server logs include:
- Request/response details
- Error stack traces
- Performance metrics
- Security events
- Vertex AI initialization status
- API call success/failure rates

### Debug Mode

Enable debug logging:
```bash
# Set in .env
DEBUG_VERTEX_AI=true
LOG_LEVEL=debug

# Or run with debug
DEBUG=* npm run dev
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

Untuk bantuan dan pertanyaan:
- Create GitHub issue
- Check documentation
- Review error logs