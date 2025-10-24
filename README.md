# 📝 SagaScript - Creative Writing Platform

A modern, full-stack creative writing platform built with React, TypeScript, Node.js, and Supabase. SagaScript helps writers organize their stories, track their progress, and collaborate with others.

![SagaScript Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=SagaScript+-+Your+Creative+Writing+Companion)

## ✨ Features

### 🔐 Authentication & User Management
- **Email/Password Authentication** with Supabase
- **Google OAuth Integration** for quick sign-up
- **Automatic Profile Creation** with user stats tracking
- **Secure Row Level Security (RLS)** for data protection

### 📊 User Profile & Analytics
- **Comprehensive User Profiles** with avatars, bio, and social links
- **Writing Statistics Dashboard** with charts and progress tracking
- **Achievement System** with badges and milestones
- **Subscription Management** with usage tracking
- **Performance Optimized** with code splitting and lazy loading

### 🎨 Modern UI/UX
- **Responsive Design** that works on all devices
- **Dark/Light Theme Support** with system preference detection
- **Accessibility First** with proper ARIA labels and keyboard navigation
- **Beautiful Animations** and smooth transitions
- **Optimized Images** with lazy loading and fallbacks

### 🚀 Performance Features
- **Code Splitting** for faster initial load times
- **Service Worker** for offline functionality
- **Image Optimization** with lazy loading
- **Smart Caching** with React Query
- **Performance Monitoring** with Core Web Vitals tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Supabase** for authentication and database

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Supabase** for database and auth
- **PostgreSQL** for data storage
- **Row Level Security** for data protection

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **Vitest** for testing
- **Playwright** for E2E testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase account
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/toidiputS/SagaScript.git
cd SagaScript
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Other services (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
XI_API_KEY=your_elevenlabs_api_key
```

### 4. Set Up Supabase Database
1. Create a new Supabase project
2. Go to SQL Editor in your Supabase dashboard
3. Run the schema from `supabase-schema.sql`
4. Configure authentication providers (Email + Google OAuth)

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5000` to see your app!

## 📖 Detailed Setup Guide

For complete setup instructions including Supabase configuration and Google OAuth setup, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## 🏗️ Project Structure

```
SagaScript/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (auth, theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main app component
│   └── public/             # Static assets
├── server/                 # Backend Express server
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
├── e2e/                    # End-to-end tests
└── docs/                   # Documentation
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Build Test
```bash
npm run build
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Other Platforms
The app can be deployed to any platform that supports Node.js:
- **Netlify** (with serverless functions)
- **Railway** 
- **Render**
- **DigitalOcean App Platform**

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options.

### Supabase Setup
1. **Database Schema**: Run `supabase-schema.sql` in your Supabase SQL editor
2. **Authentication**: Configure email and Google OAuth providers
3. **Row Level Security**: Policies are automatically created by the schema
4. **Storage**: Set up buckets for user avatars and file uploads

### Google OAuth Setup
1. Create a Google Cloud Console project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Configure in Supabase Auth settings

## 📊 Features in Detail

### User Profile System
- **Profile Management**: Users can update their display name, bio, location, and website
- **Avatar Upload**: Secure image upload with optimization
- **Social Links**: Connect social media profiles
- **Preferences**: Customizable user settings

### Writing Analytics
- **Statistics Dashboard**: Track words written, chapters completed, and writing streaks
- **Progress Charts**: Visual representation of writing progress over time
- **Achievement System**: Unlock badges for writing milestones
- **Goal Setting**: Set and track daily/weekly writing goals

### Performance Optimizations
- **Code Splitting**: Lazy load profile tabs to reduce initial bundle size
- **Image Optimization**: Automatic image compression and lazy loading
- **Caching Strategy**: Smart caching with React Query and service workers
- **Performance Monitoring**: Track Core Web Vitals and custom metrics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **React Query** for excellent server state management
- **Vite** for the lightning-fast build tool

## 📞 Support

- **Documentation**: Check our [setup guide](./SUPABASE_SETUP.md)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/toidiputS/SagaScript/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/toidiputS/SagaScript/discussions)

---

**Happy Writing!** 📝✨

Made with ❤️ by the SagaScript team