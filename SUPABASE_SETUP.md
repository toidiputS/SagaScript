# 🚀 Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your SagaScript application.

## 📋 Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- A Google Cloud Console account (for Google OAuth)

## 🔧 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `sagascript-app` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be created (2-3 minutes)

## 🗄️ Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` and paste it
4. Click "Run" to execute the schema
5. Verify tables were created in **Table Editor**

## 🔑 Step 3: Configure Authentication

### Enable Email Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email settings:
   - **Enable email confirmations**: ON (recommended)
   - **Enable email change confirmations**: ON (recommended)

### Set Up Google OAuth
1. Go to **Authentication** → **Settings** → **Auth Providers**
2. Find **Google** and click **Configure**
3. Enable Google provider
4. You'll need to set up Google OAuth credentials:

#### Google Cloud Console Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen first if prompted
6. For **Application type**, choose **Web application**
7. Add authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   (Replace `your-project-ref` with your actual Supabase project reference)
8. Copy **Client ID** and **Client Secret**

#### Back in Supabase:
1. Paste **Client ID** and **Client Secret** in Google provider settings
2. Click **Save**

## 🌐 Step 4: Configure Site URL and Redirects

1. In **Authentication** → **Settings** → **Site URL**
2. Set your site URL:
   - **Development**: `http://localhost:5173`
   - **Production**: `https://yourdomain.com`
3. Add redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

## 🔐 Step 5: Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**
   - **Project API Keys** → **anon public**

## 📝 Step 6: Update Environment Variables

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🧪 Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/auth`

3. Test the following:
   - ✅ Email signup (check your email for confirmation)
   - ✅ Email login
   - ✅ Google OAuth login
   - ✅ Profile creation after signup
   - ✅ Navigation to dashboard after login

## 🔒 Step 8: Security Configuration (Production)

### Row Level Security (RLS)
- RLS is already enabled in the schema
- Policies ensure users can only access their own data

### Additional Security Settings:
1. **Authentication** → **Settings** → **Security**
2. Configure:
   - **JWT expiry**: 3600 seconds (1 hour)
   - **Refresh token rotation**: Enabled
   - **Reuse interval**: 10 seconds

## 🚀 Step 9: Production Deployment

When deploying to production:

1. Update environment variables with production URLs
2. Configure your domain in Supabase settings
3. Set up proper CORS policies if needed
4. Enable email templates customization
5. Set up monitoring and logging

## 🛠️ Troubleshooting

### Common Issues:

**"Invalid login credentials"**
- Check if email confirmation is required
- Verify user exists in Authentication → Users

**Google OAuth not working**
- Verify redirect URLs match exactly
- Check Google Cloud Console credentials
- Ensure Google+ API is enabled

**Profile not created**
- Check if the trigger function executed
- Verify RLS policies allow profile creation
- Check Supabase logs for errors

**CORS errors**
- Verify site URL configuration
- Check redirect URLs
- Ensure proper environment variables

### Debug Steps:
1. Check Supabase logs in **Logs** section
2. Use browser developer tools to inspect network requests
3. Verify environment variables are loaded correctly
4. Test authentication flow step by step

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)

## 🎉 You're All Set!

Your SagaScript application now has:
- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ Automatic profile creation
- ✅ Secure database with RLS
- ✅ User stats and achievements system
- ✅ Subscription management ready

Happy writing! 📝✨