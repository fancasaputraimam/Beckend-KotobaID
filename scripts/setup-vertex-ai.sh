#!/bin/bash

# KotobaID Vertex AI Setup Script
# This script helps setup Google Cloud Vertex AI for KotobaID backend

set -e

echo "🤖 KotobaID Vertex AI Setup Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PROJECT_ID="dark-pipe-465302-g3"
LOCATION="us-central1"
SERVICE_ACCOUNT_NAME="kotobaid-backend"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is not installed."
        echo "Please install it from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_success "Google Cloud CLI is installed"
}

# Check if user is logged in
check_auth() {
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_warning "You are not logged in to Google Cloud"
        print_status "Logging in..."
        gcloud auth login
    fi
    
    CURRENT_USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
    print_success "Logged in as: $CURRENT_USER"
}

# Set project
set_project() {
    print_status "Setting project to: $PROJECT_ID"
    gcloud config set project $PROJECT_ID
    
    # Verify project exists and user has access
    if ! gcloud projects describe $PROJECT_ID &> /dev/null; then
        print_error "Cannot access project: $PROJECT_ID"
        print_status "Available projects:"
        gcloud projects list
        exit 1
    fi
    
    print_success "Project set to: $PROJECT_ID"
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required APIs..."
    
    APIS=(
        "aiplatform.googleapis.com"
        "vertexai.googleapis.com"
        "ml.googleapis.com"
    )
    
    for api in "${APIS[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable $api
    done
    
    print_success "All required APIs enabled"
}

# Create service account
create_service_account() {
    print_status "Creating service account: $SERVICE_ACCOUNT_NAME"
    
    # Check if service account already exists
    if gcloud iam service-accounts describe "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" &> /dev/null; then
        print_warning "Service account already exists: $SERVICE_ACCOUNT_NAME"
    else
        gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
            --description="KotobaID Backend Service Account for Vertex AI" \
            --display-name="KotobaID Backend"
        print_success "Service account created: $SERVICE_ACCOUNT_NAME"
    fi
}

# Grant permissions
grant_permissions() {
    print_status "Granting permissions to service account..."
    
    SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    ROLES=(
        "roles/aiplatform.user"
        "roles/ml.developer"
        "roles/vertexai.user"
    )
    
    for role in "${ROLES[@]}"; do
        print_status "Granting role: $role"
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
            --role="$role"
    done
    
    print_success "All permissions granted"
}

# Create and download service account key
create_key() {
    print_status "Creating service account key..."
    
    SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    KEY_FILE="./service-account.json"
    
    # Remove existing key file if it exists
    if [ -f "$KEY_FILE" ]; then
        print_warning "Existing key file found, backing up..."
        mv "$KEY_FILE" "${KEY_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SERVICE_ACCOUNT_EMAIL
    
    # Set proper permissions
    chmod 600 $KEY_FILE
    
    print_success "Service account key created: $KEY_FILE"
}

# Test Vertex AI connection
test_vertex_ai() {
    print_status "Testing Vertex AI connection..."
    
    # Set environment variable for test
    export GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
    
    # Create test script
    cat > test_vertex_ai.js << 'EOF'
const { VertexAI } = require('@google-cloud/vertexai');

async function testVertexAI() {
    try {
        const vertexAI = new VertexAI({
            project: process.env.GOOGLE_CLOUD_PROJECT_ID || 'dark-pipe-465302-g3',
            location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
        });

        const model = vertexAI.preview.getGenerativeModel({
            model: 'gemini-pro'
        });

        const result = await model.generateContent('Say hello in Japanese');
        const response = await result.response;
        
        console.log('✅ Vertex AI test successful!');
        console.log('Response:', response.text().substring(0, 100) + '...');
        process.exit(0);
    } catch (error) {
        console.error('❌ Vertex AI test failed:', error.message);
        process.exit(1);
    }
}

testVertexAI();
EOF

    # Run test if Node.js is available
    if command -v node &> /dev/null; then
        if [ -f "package.json" ]; then
            print_status "Running Vertex AI connection test..."
            node test_vertex_ai.js
            rm test_vertex_ai.js
        else
            print_warning "No package.json found, skipping connection test"
            rm test_vertex_ai.js
        fi
    else
        print_warning "Node.js not found, skipping connection test"
        rm test_vertex_ai.js
    fi
}

# Create environment file template
create_env_template() {
    print_status "Creating environment file template..."
    
    ENV_FILE=".env.vertex-ai"
    
    cat > $ENV_FILE << EOF
# Google Cloud Configuration for Vertex AI
GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID
GOOGLE_CLOUD_LOCATION=$LOCATION
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Vertex AI Configuration
VERTEX_AI_MODEL=gemini-pro
VERTEX_AI_MAX_TOKENS=1000
VERTEX_AI_TEMPERATURE=0.7

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration (update with your frontend URL)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

    print_success "Environment template created: $ENV_FILE"
    print_status "Copy this to your .env file and update as needed"
}

# Display summary
show_summary() {
    echo ""
    echo "🎉 Vertex AI Setup Complete!"
    echo "============================"
    echo ""
    echo "📋 Summary:"
    echo "  • Project ID: $PROJECT_ID"
    echo "  • Location: $LOCATION"
    echo "  • Service Account: ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    echo "  • Key File: ./service-account.json"
    echo "  • Environment Template: .env.vertex-ai"
    echo ""
    echo "📝 Next Steps:"
    echo "  1. Copy .env.vertex-ai to .env and update as needed"
    echo "  2. Install backend dependencies: npm install"
    echo "  3. Start the backend server: npm run dev"
    echo "  4. Test the API: curl http://localhost:3001/api/vertexai/status"
    echo ""
    echo "🔒 Security Notes:"
    echo "  • Keep service-account.json secure and never commit to git"
    echo "  • The key file has been set to 600 permissions"
    echo "  • Add service-account.json to your .gitignore"
    echo ""
    echo "🆘 Troubleshooting:"
    echo "  • Check logs: npm run dev"
    echo "  • Test API: curl http://localhost:3001/api/vertexai/test"
    echo "  • Verify permissions: gcloud projects get-iam-policy $PROJECT_ID"
    echo ""
}

# Main execution
main() {
    echo "Starting Vertex AI setup for KotobaID..."
    echo ""
    
    # Allow user to override defaults
    read -p "Project ID [$PROJECT_ID]: " input_project
    PROJECT_ID=${input_project:-$PROJECT_ID}
    
    read -p "Location [$LOCATION]: " input_location
    LOCATION=${input_location:-$LOCATION}
    
    read -p "Service Account Name [$SERVICE_ACCOUNT_NAME]: " input_sa
    SERVICE_ACCOUNT_NAME=${input_sa:-$SERVICE_ACCOUNT_NAME}
    
    echo ""
    print_status "Configuration:"
    echo "  Project ID: $PROJECT_ID"
    echo "  Location: $LOCATION"
    echo "  Service Account: $SERVICE_ACCOUNT_NAME"
    echo ""
    
    read -p "Continue with setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
    
    echo ""
    
    # Run setup steps
    check_gcloud
    check_auth
    set_project
    enable_apis
    create_service_account
    grant_permissions
    create_key
    create_env_template
    test_vertex_ai
    show_summary
}

# Run main function
main "$@"