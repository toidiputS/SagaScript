import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileTabs } from '../ProfileTabs';
import { User, UserStats, RecentActivity } from '@shared/schema';

// Mock wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => ['/profile', mockSetLocation],
}));

// Mock child components
vi.mock('../OverviewTab', () => ({
  OverviewTab: ({ userStats, recentActivity }: any) => (
    <div data-testid="overview-tab">
      Overview Tab - Stats: {userStats?.totalWords || 0}
    </div>
  ),
}));

vi.mock('../StatisticsTab', () => ({
  StatisticsTab: ({ userStats }: any) => (
    <div data-testid="statistics-tab">
      Statistics Tab - Words: {userStats?.totalWords || 0}
    </div>
  ),
}));

vi.mock('../AchievementsTab', () => ({
  AchievementsTab: () => <div data-testid="achievements-tab">Achievements Tab</div>,
}));

vi.mock('../SubscriptionTab', () => ({
  SubscriptionTab: ({ userPlan }: any) => (
    <div data-testid="subscription-tab">Subscription Tab - Plan: {userPlan}</div>
  ),
}));

vi.mock('../SettingsTab', () => ({
  SettingsTab: ({ user }: any) => (
    <div data-testid="settings-tab">Settings Tab - User: {user?.username || 'none'}</div>
  ),
}));

vi.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children, title, onRetry }: any) => (
    <div data-testid="error-boundary" data-title={title}>
      {children}
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
}));

const mockUser: User = {
  id: 1,
  username: 'testuser',
  displayName: 'Test User',
  email: 'test@example.com',
  plan: 'scribe',
  createdAt: new Date('2023-01-01'),
  avatar: null,
};

const mockUserStats: UserStats = {
  totalWords: 10000,
  totalChapters: 25,
  totalBooks: 3,
  totalSeries: 1,
  currentStreak: 5,
  longestStreak: 15,
  averageWordsPerDay: 500,
  totalWritingDays: 20,
  joinDate: '2023-01-01',
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: 1,
    type: 'chapter',
    title: 'Chapter 1',
    bookTitle: 'My Book',
    lastModified: new Date('2023-12-01'),
    wordCount: 1500,
  },
];

describe('ProfileTabs', () => {
  beforeEach(() => {
    mockSetLocation.mockClear();
  });

  it('renders all tab triggers correctly', () => {
    render(
      <ProfileTabs
        user={mockUser}
        userStats={mockUserStats}
        recentActivity={mockRecentActivity}
        userPlan="scribe"
        isLoadingUserStats={false}
        isLoadingActivity={false}
      />
    );

    expect(screen.getByRole('tab', { name: /overview tab/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /statistics tab/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /achievements tab/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /subscription tab/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /settings tab/i })).toBeInTheDocument();
  });

  it('displays overview tab by default', () => {
    render(
      <ProfileTabs
        user={mockUser}
        userStats={mockUserStats}
        recentActivity={mockRecentActivity}
        userPlan="scribe"
        isLoadingUserStats={false}
        isLoadingActivity={false}
      />
    );

    expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
    expect(screen.getByText('Overview Tab - Stats: 10000')).toBeInTheDocument();
  });

  it('switches tabs when tab triggers are clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ProfileTabs
        user={mockUser}
        userStats={mockUserStats}
        recentActivity={mockRecentActivity}
        userPlan="scribe"
        isLoadingUserStats={false}
        isLoadingActivity={false}
      />
    );

    // Click statistics tab
    const statisticsTab = screen.getByRole('tab', { name: /statistics tab/i });
    await user.click(statisticsTab);

    expect(mockSetLocation).toHaveBeenCalledWith('/profile?tab=statistics');
  });

  it('updates URL when tab changes', async () => {
    const user = userEvent.setup();
    
    render(
      <ProfileTabs
        user={mockUser}
        userStats={mockUserStats}
        recentActivity={mockRecentActivity}
        userPlan="scribe"
        isLoadingUserStats={false}
        isLoadingActivity={false}
      />
    );

    // Click achievements tab
    const achievementsTab = screen.getByRole('tab', { name: /achievements tab/i });
    await user.click(achievementsTab);

    expect(mockSetLocation).toHaveBeenCalledWith('/profile?tab=achievements');
  });

  it('removes tab parameter from URL when switching to overview', async () => {
    const user = userEvent.setup();
    
    // Mock location with existing tab parameter by re-mocking the module
    vi.doMock('wouter', () => ({
      useLocation: () => ['/profile?tab=statistics', mockSetLocation],
    }));
    
    render(
      <ProfileTabs
        user={mockUser}
        userStats={mockUserStats}
        recentActivity={mockRecentActivity}
        userPlan="scribe"
        isLoadingUserStats={false}
        isLoadingActivity={false}
      />
    );

    // Click overview tab
    const overviewTab = screen.getByRole('tab', { name: /overview tab/i });
    await user.click(overviewTab);

    expect(mockSetLocation).toHaveBeenCalledWith('/profile');
  });

  it('passes correct props to child components', () => {
    render(
      <ProfileTabs
        user={mockUser}
        userStats={mockUserStats}
        recentActivity={mockRecentActivity}
        userPlan="scribe"
        isLoadingUserStats={false}
        isLoadingActivity={false}
      />
    );

    // Check that overview tab receives correct props
    expect(screen.getByText('Overview Tab - Stats: 10000')).toBeInTheDocument();
  });

  it('wraps each tab content in ErrorBoundary', () => {
    render(
      <ProfileTabs
        user={mockUser}
        userStats={mockUserStats}
        recentActivity={mockRecentActivity}
        userPlan="scribe"
        isLoadingUserStats={false}
        isLoadingActivity={false}
      />
    );

    // Only the active tab content is rendered, so we should see 1 error boundary
    const errorBoundaries = screen.getAllByTestId('error-boundary');
    expect(errorBoundaries.length).toBeGreaterThan(0);
  });

  it('passes error handling props to child components', () => {
    const onRetryStats = vi.fn();
    const onRetryActivity = vi.fn();
    const onRetryUsage = vi.fn();
    const statsError = new Error('Stats error');

    render(
      <ProfileTabs
        user={mockUser}
        userStats={mockUserStats}
        recentActivity={mockRecentActivity}
        userPlan="scribe"
        isLoadingUserStats={false}
        isLoadingActivity={false}
        statsError={statsError}
        onRetryStats={onRetryStats}
        onRetryActivity={onRetryActivity}
        onRetryUsage={onRetryUsage}
      />
    );

    // Check that error boundary has retry functionality
    const retryButtons = screen.getAllByText('Retry');
    expect(retryButtons.length).toBeGreaterThan(0);
  });

  it('handles keyboard navigation between tabs', async () => {
    const user = userEvent.setup();
    
    render(
      <ProfileTabs
        user={mockUser}
        userStats={mockUserStats}
        recentActivity={mockRecentActivity}
        userPlan="scribe"
        isLoadingUserStats={false}
        isLoadingActivity={false}
      />
    );

    const overviewTab = screen.getByRole('tab', { name: /overview tab/i });
    const statisticsTab = screen.getByRole('tab', { name: /statistics tab/i });

    // Focus on overview tab and navigate with arrow keys
    overviewTab.focus();
    await user.keyboard('{ArrowRight}');
    
    expect(statisticsTab).toHaveFocus();
  });

  it('displays loading states correctly', () => {
    render(
      <ProfileTabs
        user={mockUser}
        userStats={undefined}
        recentActivity={undefined}
        userPlan="scribe"
        isLoadingUserStats={true}
        isLoadingActivity={true}
      />
    );

    // The child components should receive loading states
    expect(screen.getByText('Overview Tab - Stats: 0')).toBeInTheDocument();
  });

  it('handles missing user data gracefully', () => {
    render(
      <ProfileTabs
        user={undefined}
        userStats={undefined}
        recentActivity={undefined}
        userPlan="apprentice"
        isLoadingUserStats={false}
        isLoadingActivity={false}
      />
    );

    // Should still render tabs without crashing
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    // The overview tab should be active by default
    expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
  });
});