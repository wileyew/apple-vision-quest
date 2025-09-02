#!/bin/bash

# AWS Amplify Deployment Script with Supabase Configuration
# This script helps you deploy your app to AWS Amplify with proper Supabase configuration

echo "🚀 AWS Amplify Deployment Script"
echo "================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if user is logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ You are not logged in to AWS. Please run:"
    echo "   aws configure"
    exit 1
fi

echo "✅ AWS CLI is configured"

# Check if .env file exists and has Supabase variables
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with your Supabase credentials."
    exit 1
fi

# Check for Supabase environment variables
if ! grep -q "VITE_SUPABASE_URL" .env || ! grep -q "VITE_SUPABASE_ANON_KEY" .env; then
    echo "❌ Supabase environment variables not found in .env file."
    echo "Please add:"
    echo "VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "VITE_SUPABASE_ANON_KEY=your-anon-key-here"
    exit 1
fi

echo "✅ Environment variables found"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found. Build may have failed."
    exit 1
fi

echo "📁 Build artifacts created in dist/ directory"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo ""
echo "2. Create a new app or connect your existing repository"
echo ""
echo "3. In your Amplify app settings, add these environment variables:"
echo "   - VITE_SUPABASE_URL = (your Supabase project URL)"
echo "   - VITE_SUPABASE_ANON_KEY = (your Supabase anon key)"
echo ""
echo "4. Configure your Supabase project:"
echo "   - Go to https://supabase.com"
echo "   - Create a new project"
echo "   - Add your Amplify domain to the allowed sites"
echo "   - Add redirect URLs for authentication"
echo ""
echo "5. Deploy your app by pushing to your repository"
echo ""
echo "📖 For detailed instructions, see SUPABASE_SETUP.md"
echo ""
echo "🔗 Useful Links:"
echo "   - Supabase Dashboard: https://supabase.com/dashboard"
echo "   - AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "   - Supabase Auth Settings: https://supabase.com/docs/guides/auth/auth-overview"
