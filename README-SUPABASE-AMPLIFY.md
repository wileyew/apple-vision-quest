# Supabase + AWS Amplify Setup Guide

## 🚨 Current Status

Your Supabase project `vwfjuypesbnnezdpfsul` is no longer accessible. This guide will help you set up a new Supabase project and configure it properly with AWS Amplify.

## ✅ What's Been Fixed

1. **Permission Issues**: Fixed node_modules permissions
2. **Build Process**: Verified the app builds successfully
3. **Error Handling**: Added comprehensive error handling and debugging
4. **Configuration**: Updated to use environment variables properly
5. **Testing**: Added connection testing functionality

## 🎯 Next Steps

### Step 1: Create New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `apple-vision-quest`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### Step 2: Get Project Credentials

Once your project is created:

1. Go to **Project Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://your-new-project-id.supabase.co`
   - **Anon/Public Key**: Starts with `eyJ...`

### Step 3: Update Local Environment

Edit your `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-new-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key-here
```

### Step 4: Configure Supabase Auth Settings

1. Go to **Authentication** > **Settings**
2. Add your site URLs:
   - **Site URL**: `https://your-amplify-domain.amplifyapp.com`
   - **Redirect URLs**: 
     - `https://your-amplify-domain.amplifyapp.com/auth/callback`
     - `http://localhost:5173/auth/callback` (for local development)

### Step 5: AWS Amplify Configuration

#### Environment Variables in Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app
3. Go to **Environment Variables**
4. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

#### Build Settings

Your `amplify.yml` is already configured correctly:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - npm ci
    build:
      commands:
        - echo "Building application..."
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .npm-cache/**/*
```

### Step 6: Test Locally

1. Update your `.env` file with new credentials
2. Run `npm run dev`
3. Test signup/signin functionality
4. Use the "Test Connection" button to verify connectivity

### Step 7: Deploy to Amplify

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Configure Supabase with AWS Amplify"
   git push
   ```

2. Amplify will automatically build and deploy
3. Test the deployed version

## 🔧 Testing Your Setup

### Local Testing

```bash
# Start development server
npm run dev

# Test build
npm run build

# Run deployment script
./deploy-amplify.sh
```

### Connection Testing

Use the "Test Connection" button in the signup/login forms to verify Supabase connectivity.

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure your Supabase project allows your Amplify domain
   - Check Authentication > Settings > Site URL

2. **Environment Variables**
   - Ensure they're set correctly in Amplify Console
   - Verify they're in your local `.env` file

3. **Redirect URLs**
   - Verify all redirect URLs are configured in Supabase
   - Include both localhost and production URLs

4. **Database Connection**
   - Check if your database is paused (free tier limitation)
   - Verify your project is active in Supabase dashboard

### Debug Commands

```bash
# Test Supabase connection
curl -I https://your-project-id.supabase.co

# Check build
npm run build

# Verify environment variables
cat .env | grep SUPABASE
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth/auth-overview)
- [Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate your Supabase API keys
- Monitor your Supabase usage to avoid hitting limits

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Ensure environment variables are set correctly
4. Check the Supabase dashboard for any service issues

---

**Ready to deploy?** Follow the steps above and your app will be running with Supabase authentication on AWS Amplify! 🚀
