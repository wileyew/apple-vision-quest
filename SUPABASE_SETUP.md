# Supabase Setup for AWS Amplify

## Current Issue
The existing Supabase project `vwfjuypesbnnezdpfsul` is no longer accessible. We need to create a new Supabase project and configure it properly for AWS Amplify deployment.

## Step 1: Create New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `apple-vision-quest`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"

## Step 2: Get Project Credentials

Once your project is created:

1. Go to Project Settings > API
2. Copy the following values:
   - Project URL (e.g., `https://your-new-project-id.supabase.co`)
   - Anon/Public Key (starts with `eyJ...`)

## Step 3: Update Environment Variables

Replace the values in your `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-new-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key-here
```

## Step 4: Configure Supabase Auth Settings

1. Go to Authentication > Settings
2. Add your site URLs:
   - Site URL: `https://your-amplify-domain.amplifyapp.com`
   - Redirect URLs: 
     - `https://your-amplify-domain.amplifyapp.com/auth/callback`
     - `http://localhost:5173/auth/callback` (for local development)

## Step 5: AWS Amplify Configuration

### Environment Variables in Amplify Console

Add these environment variables in your AWS Amplify app settings:

1. Go to AWS Amplify Console
2. Select your app
3. Go to Environment Variables
4. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

### Build Settings

Ensure your `amplify.yml` includes:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Step 6: Database Schema (Optional)

If you need database tables, create them in Supabase:

1. Go to SQL Editor in Supabase
2. Create tables as needed for your app
3. Update the `src/integrations/supabase/types.ts` file with your schema

## Step 7: Test Locally

1. Update your `.env` file with new credentials
2. Run `npm run dev`
3. Test signup/signin functionality
4. Check browser console for any errors

## Step 8: Deploy to Amplify

1. Commit your changes
2. Push to your repository
3. Amplify will automatically build and deploy
4. Test the deployed version

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your Supabase project allows your Amplify domain
2. **Environment Variables**: Ensure they're set correctly in Amplify Console
3. **Redirect URLs**: Verify all redirect URLs are configured in Supabase
4. **Database Connection**: Check if your database is paused (free tier limitation)

### Testing Connection:

Use the "Test Connection" button in the signup/login forms to verify connectivity.

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate your Supabase API keys
- Monitor your Supabase usage to avoid hitting limits
