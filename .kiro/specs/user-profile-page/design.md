# User Profile Page Design Document

## Overview

The User Profile Page serves as a comprehensive personal dashboard for SagaScript users, providing a centralized location to manage account information, track writing progress, view achievements, and customize application preferences. The design follows SagaScript's established neumorphic design system with rounded cards, soft shadows, and a cohesive color scheme.

## Architecture

### Component Structure
```
ProfilePage
├── ProfileHeader (user info, avatar, quick actions)
├── ProfileTabs
│   ├── OverviewTab (stats, recent activity, quick access)
│   ├── StatisticsTab (detailed writing analytics)
│   ├── AchievementsTab (earned badges, progress)
│   ├── SubscriptionTab (plan details, usage)
│   └── SettingsTab (preferences, privacy, account)
└── ProfileActions (export, delete account)
```

### Data Flow
- Profile data fetched from `/api/user` endpoint
- Writing statistics from `/api/writing-stats` with various period filters
- Achievement data from `/api/user-achievements` and `/api/achievements`
- Subscription information from `/api/subscriptions` and `/api/subscription-plans`
- Settings managed through dedicated endpoints for each preference category

## Components and Interfaces

### 1. ProfileHeader Component
**Purpose**: Display user's basic information and primary actions

**Props Interface**:
```typescript
interface ProfileHeaderProps {
  user: User;
  onEditProfile: () => void;
  onUploadAvatar: (file: File) => void;
}
```

**Features**:
- Large avatar display with upload functionality
- User display name and username
- Join date and current subscription plan badge
- Quick action buttons (Edit Profile, Settings)
- Responsive layout for mobile/desktop

### 2. ProfileTabs Component
**Purpose**: Organize profile content into logical sections

**Tab Structure**:
- **Overview**: Dashboard-style summary with key metrics
- **Statistics**: Detailed writing analytics with charts
- **Achievements**: Badge gallery and progress tracking
- **Subscription**: Plan details and usage metrics
- **Settings**: Preferences and account management

### 3. WritingStatsDisplay Component
**Purpose**: Visualize writing progress and patterns

**Props Interface**:
```typescript
interface WritingStatsDisplayProps {
  stats: WritingStats[];
  period: 'day' | 'week' | 'month' | 'year';
  onPeriodChange: (period: string) => void;
}
```

**Features**:
- Interactive charts using Chart.js or similar
- Multiple time period views
- Key metrics: words written, time spent, streak data
- Comparative analysis (current vs previous periods)

### 4. AchievementGallery Component
**Purpose**: Display earned achievements and progress

**Props Interface**:
```typescript
interface AchievementGalleryProps {
  userAchievements: UserAchievement[];
  allAchievements: Achievement[];
  showProgress?: boolean;
}
```

**Features**:
- Grid layout of achievement badges
- Progress bars for incomplete achievements
- Category filtering
- Achievement details modal

### 5. SubscriptionOverview Component
**Purpose**: Show current plan and usage statistics

**Props Interface**:
```typescript
interface SubscriptionOverviewProps {
  subscription: Subscription;
  plan: SubscriptionPlan;
  usage: PlanUsage;
}
```

**Features**:
- Current plan details and features
- Usage meters for plan limits
- Billing information and next payment
- Upgrade/downgrade options

### 6. ProfileSettings Component
**Purpose**: Manage user preferences and account settings

**Settings Categories**:
- **Account**: Email, password, display name
- **Preferences**: Theme, notifications, writing goals
- **Privacy**: Profile visibility, data sharing
- **Export/Delete**: Data export and account deletion

## Data Models

### Extended User Profile
```typescript
interface UserProfile extends User {
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  preferences: UserPreferences;
  stats: UserStats;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'spooky' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    writingReminders: boolean;
    achievementAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showStats: boolean;
    showAchievements: boolean;
  };
  writing: {
    defaultGoal: number;
    reminderTime?: string;
    autoSave: boolean;
  };
}

interface UserStats {
  totalWords: number;
  totalChapters: number;
  totalBooks: number;
  totalSeries: number;
  currentStreak: number;
  longestStreak: number;
  averageWordsPerDay: number;
  totalWritingDays: number;
  joinDate: string;
}
```

### Plan Usage Tracking
```typescript
interface PlanUsage {
  series: {
    used: number;
    limit: number;
  };
  aiPrompts: {
    used: number;
    limit: number;
    resetDate: string;
  };
  collaborators: {
    used: number;
    limit: number;
  };
  storage: {
    used: number; // in MB
    limit: number; // in MB
  };
}
```

## Error Handling

### Profile Loading States
- **Loading**: Skeleton components for each section
- **Error**: Retry mechanisms with user-friendly error messages
- **Empty States**: Helpful guidance for new users

### Form Validation
- **Client-side**: Real-time validation with immediate feedback
- **Server-side**: Comprehensive validation with detailed error responses
- **File Upload**: Size limits, format validation, and progress indicators

### Network Resilience
- **Offline Support**: Cache critical profile data
- **Retry Logic**: Automatic retry for failed requests
- **Optimistic Updates**: Immediate UI updates with rollback on failure

## Testing Strategy

### Unit Tests
- Component rendering with various props
- User interaction handlers
- Data transformation utilities
- Form validation logic

### Integration Tests
- Profile data fetching and display
- Settings updates and persistence
- File upload functionality
- Tab navigation and state management

### E2E Tests
- Complete profile editing workflow
- Achievement viewing and filtering
- Subscription management flow
- Settings configuration and saving

### Performance Tests
- Large dataset rendering (many achievements)
- Image upload and processing
- Chart rendering with extensive data
- Mobile responsiveness across devices

## UI/UX Design Specifications

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Profile Header (Avatar, Name, Quick Actions)               │
├─────────────────────────────────────────────────────────────┤
│ Tab Navigation (Overview | Stats | Achievements | etc.)    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Tab Content Area                                            │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │   Card 1    │ │   Card 2    │ │   Card 3    │            │
│ │             │ │             │ │             │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              Full Width Card                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Design Elements

#### Color Scheme
- **Primary**: Consistent with SagaScript brand colors
- **Success**: Green tones for achievements and positive metrics
- **Warning**: Orange/yellow for limits and warnings
- **Error**: Red tones for errors and destructive actions
- **Neutral**: Gray tones for secondary information

#### Typography
- **Headers**: Font-serif for section titles
- **Body**: Font-sans for content and descriptions
- **Metrics**: Font-mono for numerical data
- **Emphasis**: Font-semibold for important information

#### Spacing and Layout
- **Card Padding**: 24px (p-6) for headers, 16px (p-4) for content
- **Grid Gaps**: 24px (gap-6) between cards
- **Section Margins**: 32px (mb-8) between major sections
- **Responsive Breakpoints**: Mobile-first with md: and lg: breakpoints

### Interactive Elements

#### Buttons
- **Primary Actions**: Solid primary buttons for main actions
- **Secondary Actions**: Outline buttons for secondary actions
- **Destructive Actions**: Red buttons with confirmation dialogs
- **Icon Buttons**: Ghost variant for utility actions

#### Forms
- **Input Fields**: Consistent with existing form components
- **File Upload**: Drag-and-drop with progress indicators
- **Toggles**: Switch components for boolean preferences
- **Selects**: Dropdown menus for option selection

#### Feedback
- **Loading States**: Skeleton loaders and spinners
- **Success Messages**: Toast notifications for successful actions
- **Error Messages**: Inline validation and error toasts
- **Progress Indicators**: Progress bars for achievements and usage

### Accessibility Considerations

#### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Focus Indicators**: Clear visual focus states
- **Keyboard Shortcuts**: Common shortcuts for frequent actions

#### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Alt Text**: Descriptive alt text for images and icons

#### Visual Accessibility
- **Color Contrast**: WCAG AA compliance for all text
- **Font Sizes**: Scalable text with minimum 16px base size
- **Focus States**: High contrast focus indicators

### Mobile Responsiveness

#### Breakpoint Strategy
- **Mobile (< 768px)**: Single column layout, stacked cards
- **Tablet (768px - 1024px)**: Two-column grid where appropriate
- **Desktop (> 1024px)**: Full multi-column layout

#### Touch Interactions
- **Button Sizes**: Minimum 44px touch targets
- **Gesture Support**: Swipe navigation for tabs on mobile
- **Scroll Behavior**: Smooth scrolling with momentum

#### Performance Optimization
- **Image Loading**: Lazy loading for non-critical images
- **Code Splitting**: Route-based code splitting for tab content
- **Caching**: Aggressive caching for static profile data
- **Bundle Size**: Minimize JavaScript bundle size for mobile

This design provides a comprehensive, user-friendly profile experience that aligns with SagaScript's existing design system while offering powerful functionality for writers to track their progress and manage their accounts.