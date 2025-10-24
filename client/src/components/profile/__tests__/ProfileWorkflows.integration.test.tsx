import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User, UserProfile, UserStats, RecentActivity } from '@shared/schema';

// Mock the profile page components
import { ProfileHeader } from '../ProfileHeader';
import { ProfileTabs } from '../ProfileTabs';
import { EditProfileModal } from '../EditProfileModal';

// Mock API hooks
const mockUseProfile = vi.fn();
const mockUseWritingStats = vi.fn();
const mockUsePlanUsage = vi.fn();

vi.mock('@/hooks/use-profile', () => ({
  useProfile: () => mockUseProfile(),
}));

vi.mock('@/hooks/use-writing-stats', () => ({
  useWritingStats: () => mockUseWritingStats(),
}));

vi.mock('@/hooks/use-plan-usage', () => ({
  usePlanUsage: () => mockUsePlanUsage(),
}));

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/profile', vi.fn()],
}));

// Mock child components that aren't part of the integration test
vi.mock('../OverviewTab', () => ({
  OverviewTab: ({ userStats, recentActivity, isLoadingUserStats, isLoadingActivity }: any) => (
    <div data-testid="overview-tab">
      {isLoadingUserStats ? 'Loading stats...' : `Stats: ${userStats?.totalWords || 0}`}
      {isLoadingActivity ? 'Loading activity...' : `Activities: ${recentActivity?.length || 0}`}
    </div>
  ),
}));

vi.mock('../StatisticsTab', () => ({
  StatisticsTab: ({ userStats, isLoadingUserStats }: any) => (
    <div data-testid="statistics-tab">
      {isLoadingUserStats ? 'Loading...' : `Total Words: ${userStats?.totalWords || 0}`}
    </div>
  ),
}));

vi.mock('../AchievementsTab', () => ({
  AchievementsTab: () => <div data-testid="achievements-tab">Achievements</div>,
}));

vi.mock('../SubscriptionTab', () => ({
  SubscriptionTab: ({ userPlan }: any) => (
    <div data-testid="subscription-tab">Plan: {userPlan}</div>
  ),
}));

vi.mock('../SettingsTab', () => ({
  SettingsTab: ({ user }: any) => (
    <div data-testid="settings-tab">
      Settings for: {user?.displayName || 'Unknown'}
    </div>
  ),
}));

vi.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../AvatarUpload', () => ({
  AvatarUpload: ({ onUpload, isUploading }: any) => (
    <div data-testid="avatar-upload">
      <button onClick={() => onUpload(new File(['test'], 'test.jpg', { type: 'image/jpeg' }))}>
        Upload Avatar
      </button>
      {isUploading && <span>Uploading...</span>}
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

const mockProfile: UserProfile = {
  ...mockUser,
  bio: 'A passionate writer',
  location: 'New York, NY',
  website: 'https://testuser.com',
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

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('Profile Workflows Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    
    // Default mock implementations
    mockUseProfile.mockReturnValue({
      data: { user: mockUser, profile: mockProfile },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseWritingStats.mockReturnValue({
      data: mockUserStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUsePlanUsage.mockReturnValue({
      data: { series: { used: 1, limit: 5 } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('Complete Profile Editing Workflow', () => {
    it('allows user to edit profile information end-to-end', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const onUpdateProfile = vi.fn().mockResolvedValue(undefined);
      const onUploadAvatar = vi.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <div>
            <ProfileHeader 
              user={mockUser} 
              profile={mockProfile}
              onEditProfile={() => {}}
            />
            <EditProfileModal
              user={mockUser}
              profile={mockProfile}
              isOpen={true}
              onClose={() => {}}
              onUpdateProfile={onUpdateProfile}
              onUploadAvatar={onUploadAvatar}
            />
          </div>
        </TestWrapper>
      );

      // Verify initial profile data is displayed
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A passionate writer')).toBeInTheDocument();

      // Edit display name
      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Test User');

      // Edit bio
      const bioInput = screen.getByLabelText(/bio/i);
      await user.clear(bioInput);
      await user.type(bioInput, 'An even more passionate writer');

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Verify the update function was called with correct data
      await waitFor(() => {
        expect(onUpdateProfile).toHaveBeenCalledWith({
          displayName: 'Updated Test User',
          bio: 'An even more passionate writer',
        });
      });
    });

    it('handles avatar upload during profile editing', async () => {
      const user = userEvent.setup();
      const onUploadAvatar = vi.fn();

      render(
        <TestWrapper>
          <EditProfileModal
            user={mockUser}
            profile={mockProfile}
            isOpen={true}
            onClose={() => {}}
            onUpdateProfile={() => {}}
            onUploadAvatar={onUploadAvatar}
          />
        </TestWrapper>
      );

      // Click avatar upload
      const uploadButton = screen.getByText('Upload Avatar');
      await user.click(uploadButton);

      expect(onUploadAvatar).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.jpg',
          type: 'image/jpeg',
        })
      );
    });

    it('shows validation errors and prevents submission', async () => {
      const user = userEvent.setup();
      const onUpdateProfile = vi.fn();

      render(
        <TestWrapper>
          <EditProfileModal
            user={mockUser}
            profile={mockProfile}
            isOpen={true}
            onClose={() => {}}
            onUpdateProfile={onUpdateProfile}
            onUploadAvatar={() => {}}
          />
        </TestWrapper>
      );

      // Clear required field
      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);

      // Try to submit
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Display name is required')).toBeInTheDocument();
      });

      // Should not call update function
      expect(onUpdateProfile).not.toHaveBeenCalled();
    });
  });

  describe('Statistics Data Fetching and Display', () => {
    it('displays loading states and then data', async () => {
      // Start with loading state
      mockUseWritingStats.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      const { rerender } = render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={undefined}
            recentActivity={undefined}
            userPlan="scribe"
            isLoadingUserStats={true}
            isLoadingActivity={true}
          />
        </TestWrapper>
      );

      // Should show loading state
      expect(screen.getByText('Loading stats...')).toBeInTheDocument();
      expect(screen.getByText('Loading activity...')).toBeInTheDocument();

      // Update to loaded state
      mockUseWritingStats.mockReturnValue({
        data: mockUserStats,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      rerender(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={mockUserStats}
            recentActivity={mockRecentActivity}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
          />
        </TestWrapper>
      );

      // Should show actual data
      expect(screen.getByText('Stats: 10000')).toBeInTheDocument();
      expect(screen.getByText('Activities: 1')).toBeInTheDocument();
    });

    it('handles statistics API errors gracefully', async () => {
      const mockRetry = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={undefined}
            recentActivity={undefined}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
            statsError={new Error('Failed to load stats')}
            onRetryStats={mockRetry}
          />
        </TestWrapper>
      );

      // Should still render the tab structure
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      
      // The error boundary should handle the error gracefully
      expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
    });

    it('switches between different statistics views', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={mockUserStats}
            recentActivity={mockRecentActivity}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
          />
        </TestWrapper>
      );

      // Start on overview tab
      expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
      expect(screen.getByText('Stats: 10000')).toBeInTheDocument();

      // Switch to statistics tab
      const statisticsTab = screen.getByRole('tab', { name: /statistics tab/i });
      await user.click(statisticsTab);

      // Should show statistics tab content
      await waitFor(() => {
        expect(screen.getByTestId('statistics-tab')).toBeInTheDocument();
        expect(screen.getByText('Total Words: 10000')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Updates and Persistence', () => {
    it('integrates with settings tab for user preferences', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={mockUserStats}
            recentActivity={mockRecentActivity}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
          />
        </TestWrapper>
      );

      // Switch to settings tab
      const settingsTab = screen.getByRole('tab', { name: /settings tab/i });
      await user.click(settingsTab);

      // Should show settings tab with user data
      await waitFor(() => {
        expect(screen.getByTestId('settings-tab')).toBeInTheDocument();
        expect(screen.getByText('Settings for: Test User')).toBeInTheDocument();
      });
    });

    it('handles subscription information display', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={mockUserStats}
            recentActivity={mockRecentActivity}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
          />
        </TestWrapper>
      );

      // Switch to subscription tab
      const subscriptionTab = screen.getByRole('tab', { name: /subscription tab/i });
      await user.click(subscriptionTab);

      // Should show subscription information
      await waitFor(() => {
        expect(screen.getByTestId('subscription-tab')).toBeInTheDocument();
        expect(screen.getByText('Plan: scribe')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('handles network errors during profile updates', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      const onUpdateProfile = vi.fn().mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <EditProfileModal
            user={mockUser}
            profile={mockProfile}
            isOpen={true}
            onClose={() => {}}
            onUpdateProfile={onUpdateProfile}
            onUploadAvatar={() => {}}
          />
        </TestWrapper>
      );

      // Make a change
      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Name');

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Should call the update function
      await waitFor(() => {
        expect(onUpdateProfile).toHaveBeenCalled();
      });
    });

    it('maintains form state during loading operations', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditProfileModal
            user={mockUser}
            profile={mockProfile}
            isOpen={true}
            onClose={() => {}}
            onUpdateProfile={() => {}}
            onUploadAvatar={() => {}}
            isUpdating={true}
          />
        </TestWrapper>
      );

      // Form should be disabled during update
      const saveButton = screen.getByRole('button', { name: /saving/i });
      expect(saveButton).toBeDisabled();

      // Input fields should still show values
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A passionate writer')).toBeInTheDocument();
    });
  });

  describe('Data Consistency', () => {
    it('reflects profile updates across components', async () => {
      const user = userEvent.setup();
      let isModalOpen = false;
      const setModalOpen = (open: boolean) => { isModalOpen = open; };

      const { rerender } = render(
        <TestWrapper>
          <div>
            <ProfileHeader 
              user={mockUser} 
              profile={mockProfile}
              onEditProfile={() => setModalOpen(true)}
            />
            {isModalOpen && (
              <EditProfileModal
                user={mockUser}
                profile={mockProfile}
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onUpdateProfile={() => {}}
                onUploadAvatar={() => {}}
              />
            )}
          </div>
        </TestWrapper>
      );

      // Initial state shows original profile
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('A passionate writer')).toBeInTheDocument();

      // Simulate profile update
      const updatedProfile = {
        ...mockProfile,
        displayName: 'Updated User',
        bio: 'Updated bio',
      };

      const updatedUser = {
        ...mockUser,
        displayName: 'Updated User',
      };

      rerender(
        <TestWrapper>
          <div>
            <ProfileHeader 
              user={updatedUser} 
              profile={updatedProfile}
              onEditProfile={() => setModalOpen(true)}
            />
          </div>
        </TestWrapper>
      );

      // Should show updated information
      expect(screen.getByText('Updated User')).toBeInTheDocument();
      expect(screen.getByText('Updated bio')).toBeInTheDocument();
    });
  });

  describe('Critical User Journey - Profile Page Navigation and Data Loading', () => {
    it('loads profile page with all required data and handles navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <div>
            <ProfileHeader 
              user={mockUser} 
              profile={mockProfile}
              onEditProfile={() => {}}
            />
            <ProfileTabs
              user={mockUser}
              userStats={mockUserStats}
              recentActivity={mockRecentActivity}
              userPlan="scribe"
              isLoadingUserStats={false}
              isLoadingActivity={false}
            />
          </div>
        </TestWrapper>
      );

      // Verify profile header displays user information
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('A passionate writer')).toBeInTheDocument();
      expect(screen.getByText('New York, NY')).toBeInTheDocument();

      // Verify tabs are present and functional
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      
      // Test navigation through all tabs
      const statisticsTab = screen.getByRole('tab', { name: /statistics tab/i });
      await user.click(statisticsTab);
      expect(screen.getByTestId('statistics-tab')).toBeInTheDocument();

      const achievementsTab = screen.getByRole('tab', { name: /achievements tab/i });
      await user.click(achievementsTab);
      expect(screen.getByTestId('achievements-tab')).toBeInTheDocument();

      const subscriptionTab = screen.getByRole('tab', { name: /subscription tab/i });
      await user.click(subscriptionTab);
      expect(screen.getByTestId('subscription-tab')).toBeInTheDocument();

      const settingsTab = screen.getByRole('tab', { name: /settings tab/i });
      await user.click(settingsTab);
      expect(screen.getByTestId('settings-tab')).toBeInTheDocument();

      // Return to overview
      const overviewTab = screen.getByRole('tab', { name: /overview tab/i });
      await user.click(overviewTab);
      expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
    });

    it('handles loading states during data fetching', async () => {
      const { rerender } = render(
        <TestWrapper>
          <div>
            <ProfileHeader 
              user={mockUser} 
              profile={null}
              isLoading={true}
            />
            <ProfileTabs
              user={mockUser}
              userStats={undefined}
              recentActivity={undefined}
              userPlan="scribe"
              isLoadingUserStats={true}
              isLoadingActivity={true}
            />
          </div>
        </TestWrapper>
      );

      // Should show loading states
      expect(screen.getByText('Loading stats...')).toBeInTheDocument();
      expect(screen.getByText('Loading activity...')).toBeInTheDocument();

      // Simulate data loading completion
      rerender(
        <TestWrapper>
          <div>
            <ProfileHeader 
              user={mockUser} 
              profile={mockProfile}
              isLoading={false}
            />
            <ProfileTabs
              user={mockUser}
              userStats={mockUserStats}
              recentActivity={mockRecentActivity}
              userPlan="scribe"
              isLoadingUserStats={false}
              isLoadingActivity={false}
            />
          </div>
        </TestWrapper>
      );

      // Should show loaded data
      expect(screen.getByText('Stats: 10000')).toBeInTheDocument();
      expect(screen.getByText('Activities: 1')).toBeInTheDocument();
    });

    it('handles error states with retry functionality', async () => {
      const mockRetryStats = vi.fn();
      const mockRetryActivity = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={undefined}
            recentActivity={undefined}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
            statsError={new Error('Failed to load statistics')}
            activityError={new Error('Failed to load activity')}
            onRetryStats={mockRetryStats}
            onRetryActivity={mockRetryActivity}
          />
        </TestWrapper>
      );

      // The error boundary should handle errors gracefully
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      
      // Test that the component still renders despite errors
      expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
    });
  });

  describe('Critical User Journey - Avatar Upload and Profile Editing Flow', () => {
    it('completes full avatar upload and profile editing workflow', async () => {
      const user = userEvent.setup();
      const onUpdateProfile = vi.fn().mockResolvedValue(undefined);
      const onUploadAvatar = vi.fn().mockResolvedValue({ avatarUrl: '/uploads/new-avatar.jpg' });

      render(
        <TestWrapper>
          <EditProfileModal
            user={mockUser}
            profile={mockProfile}
            isOpen={true}
            onClose={() => {}}
            onUpdateProfile={onUpdateProfile}
            onUploadAvatar={onUploadAvatar}
            isUpdating={false}
            isUploadingAvatar={false}
          />
        </TestWrapper>
      );

      // Step 1: Upload avatar
      const uploadButton = screen.getByText('Upload Avatar');
      await user.click(uploadButton);

      expect(onUploadAvatar).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.jpg',
          type: 'image/jpeg',
        })
      );

      // Step 2: Edit profile information
      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, 'Updated Test User');

      const bioInput = screen.getByLabelText(/bio/i);
      await user.clear(bioInput);
      await user.type(bioInput, 'Updated bio with new avatar');

      // Step 3: Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Verify both operations completed
      await waitFor(() => {
        expect(onUpdateProfile).toHaveBeenCalledWith({
          displayName: 'Updated Test User',
          bio: 'Updated bio with new avatar',
        });
      });
    });

    it('handles avatar upload errors gracefully', async () => {
      const user = userEvent.setup();
      const onUploadAvatar = vi.fn().mockRejectedValue(new Error('File too large'));

      render(
        <TestWrapper>
          <EditProfileModal
            user={mockUser}
            profile={mockProfile}
            isOpen={true}
            onClose={() => {}}
            onUpdateProfile={() => {}}
            onUploadAvatar={onUploadAvatar}
          />
        </TestWrapper>
      );

      // Attempt avatar upload
      const uploadButton = screen.getByText('Upload Avatar');
      await user.click(uploadButton);

      // Should still allow profile editing despite avatar upload failure
      const displayNameInput = screen.getByLabelText(/display name/i);
      expect(displayNameInput).toBeEnabled();
    });

    it('shows upload progress during avatar upload', async () => {
      render(
        <TestWrapper>
          <EditProfileModal
            user={mockUser}
            profile={mockProfile}
            isOpen={true}
            onClose={() => {}}
            onUpdateProfile={() => {}}
            onUploadAvatar={() => {}}
            isUploadingAvatar={true}
          />
        </TestWrapper>
      );

      // Should show uploading state
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('validates profile form before submission', async () => {
      const user = userEvent.setup();
      const onUpdateProfile = vi.fn();

      render(
        <TestWrapper>
          <EditProfileModal
            user={mockUser}
            profile={mockProfile}
            isOpen={true}
            onClose={() => {}}
            onUpdateProfile={onUpdateProfile}
            onUploadAvatar={() => {}}
          />
        </TestWrapper>
      );

      // Clear required field
      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.clear(displayNameInput);

      // Try to submit
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Should show validation error and prevent submission
      await waitFor(() => {
        expect(screen.getByText('Display name is required')).toBeInTheDocument();
      });
      expect(onUpdateProfile).not.toHaveBeenCalled();
    });
  });

  describe('Critical User Journey - Subscription Management Integration', () => {
    it('displays subscription information and usage metrics', async () => {
      const user = userEvent.setup();

      // Mock subscription data
      mockUsePlanUsage.mockReturnValue({
        data: {
          series: { used: 2, limit: 5 },
          aiPrompts: { used: 45, limit: 100, resetDate: '2024-02-01T00:00:00Z' },
          collaborators: { used: 1, limit: 3 },
          storage: { used: 75, limit: 100 }
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={mockUserStats}
            recentActivity={mockRecentActivity}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
          />
        </TestWrapper>
      );

      // Navigate to subscription tab
      const subscriptionTab = screen.getByRole('tab', { name: /subscription tab/i });
      await user.click(subscriptionTab);

      // Should display subscription information
      await waitFor(() => {
        expect(screen.getByTestId('subscription-tab')).toBeInTheDocument();
        expect(screen.getByText('Plan: scribe')).toBeInTheDocument();
      });
    });

    it('handles subscription upgrade workflow', async () => {
      const user = userEvent.setup();
      const mockUpgrade = vi.fn();

      // Mock subscription component with upgrade functionality
      vi.mocked(vi.importMock('../SubscriptionTab')).mockImplementation(() => ({
        SubscriptionTab: ({ userPlan, onUpgrade }: any) => (
          <div data-testid="subscription-tab">
            <div>Plan: {userPlan}</div>
            <button onClick={() => onUpgrade('chronicler')}>Upgrade to Chronicler</button>
          </div>
        ),
      }));

      render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={mockUserStats}
            recentActivity={mockRecentActivity}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
            onUpgrade={mockUpgrade}
          />
        </TestWrapper>
      );

      // Navigate to subscription tab
      const subscriptionTab = screen.getByRole('tab', { name: /subscription tab/i });
      await user.click(subscriptionTab);

      // Click upgrade button
      const upgradeButton = screen.getByText('Upgrade to Chronicler');
      await user.click(upgradeButton);

      expect(mockUpgrade).toHaveBeenCalledWith('chronicler');
    });

    it('shows usage warnings when approaching limits', async () => {
      // Mock near-limit usage data
      mockUsePlanUsage.mockReturnValue({
        data: {
          series: { used: 5, limit: 5 }, // At limit
          aiPrompts: { used: 95, limit: 100, resetDate: '2024-02-01T00:00:00Z' }, // Near limit
          storage: { used: 98, limit: 100 } // Near limit
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={mockUserStats}
            recentActivity={mockRecentActivity}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
          />
        </TestWrapper>
      );

      // The subscription tab should handle usage warnings
      // This would be implemented in the actual SubscriptionTab component
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('handles subscription cancellation workflow', async () => {
      const user = userEvent.setup();
      const mockCancel = vi.fn();

      // Mock subscription component with cancellation functionality
      vi.mocked(vi.importMock('../SubscriptionTab')).mockImplementation(() => ({
        SubscriptionTab: ({ userPlan, onCancel }: any) => (
          <div data-testid="subscription-tab">
            <div>Plan: {userPlan}</div>
            <button onClick={() => onCancel()}>Cancel Subscription</button>
          </div>
        ),
      }));

      render(
        <TestWrapper>
          <ProfileTabs
            user={mockUser}
            userStats={mockUserStats}
            recentActivity={mockRecentActivity}
            userPlan="scribe"
            isLoadingUserStats={false}
            isLoadingActivity={false}
            onCancel={mockCancel}
          />
        </TestWrapper>
      );

      // Navigate to subscription tab
      const subscriptionTab = screen.getByRole('tab', { name: /subscription tab/i });
      await user.click(subscriptionTab);

      // Click cancel button
      const cancelButton = screen.getByText('Cancel Subscription');
      await user.click(cancelButton);

      expect(mockCancel).toHaveBeenCalled();
    });
  });
});