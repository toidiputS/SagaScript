import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileHeader } from '../ProfileHeader';
import { User, UserProfile } from '@shared/schema';

// Mock user data
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
  socialLinks: {
    twitter: '@testuser',
    instagram: '@testuser',
  },
};

describe('ProfileHeader', () => {
  it('renders user information correctly', () => {
    render(<ProfileHeader user={mockUser} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('Scribe')).toBeInTheDocument();
    // Date formatting might be different due to timezone, so check for the year at least
    expect(screen.getByText(/2022|2023/)).toBeInTheDocument();
  });

  it('displays user initials when no avatar is provided', () => {
    render(<ProfileHeader user={mockUser} />);
    
    const avatar = screen.getByText('TU');
    expect(avatar).toBeInTheDocument();
  });

  it('displays avatar image when provided', () => {
    const userWithAvatar = { ...mockUser, avatar: 'https://example.com/avatar.jpg' };
    render(<ProfileHeader user={userWithAvatar} />);
    
    // The avatar image might be inside the Avatar component, so check for img element
    const avatarImage = document.querySelector('img');
    expect(avatarImage).toBeInTheDocument();
    if (avatarImage) {
      expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    }
  });

  it('renders profile information when profile is provided', () => {
    render(<ProfileHeader user={mockUser} profile={mockProfile} />);
    
    expect(screen.getByText('A passionate writer')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('testuser.com')).toBeInTheDocument();
  });

  it('calls onEditProfile when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEditProfile = vi.fn();
    
    render(<ProfileHeader user={mockUser} onEditProfile={onEditProfile} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    expect(onEditProfile).toHaveBeenCalledTimes(1);
  });

  it('handles avatar upload when onUploadAvatar is provided', async () => {
    const user = userEvent.setup();
    const onUploadAvatar = vi.fn();
    
    render(<ProfileHeader user={mockUser} onUploadAvatar={onUploadAvatar} />);
    
    // Mock file input creation and click
    const createElementSpy = vi.spyOn(document, 'createElement');
    const mockInput = {
      type: '',
      accept: '',
      onchange: null as any,
      click: vi.fn(),
    };
    createElementSpy.mockReturnValue(mockInput as any);
    
    const avatarButton = screen.getByRole('button', { name: /upload new avatar/i });
    await user.click(avatarButton);
    
    expect(mockInput.type).toBe('file');
    expect(mockInput.accept).toBe('image/*');
    expect(mockInput.click).toHaveBeenCalled();
    
    createElementSpy.mockRestore();
  });

  it('handles drag and drop for avatar upload', async () => {
    const onUploadAvatar = vi.fn();
    
    render(<ProfileHeader user={mockUser} onUploadAvatar={onUploadAvatar} />);
    
    const avatarButton = screen.getByRole('button', { name: /upload new avatar/i });
    
    // Create a mock file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Simulate drag and drop
    fireEvent.dragOver(avatarButton);
    fireEvent.drop(avatarButton, {
      dataTransfer: {
        files: [file],
      },
    });
    
    expect(onUploadAvatar).toHaveBeenCalledWith(file);
  });

  it('displays loading skeleton when isLoading is true', () => {
    render(<ProfileHeader user={mockUser} isLoading={true} />);
    
    // Check for skeleton elements (they should have animate-pulse class)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows uploading state when isUploadingAvatar is true', () => {
    render(
      <ProfileHeader 
        user={mockUser} 
        onUploadAvatar={vi.fn()} 
        isUploadingAvatar={true} 
      />
    );
    
    const uploadingIcon = document.querySelector('.ri-loader-line');
    expect(uploadingIcon).toBeInTheDocument();
  });

  it('displays correct plan badge colors', () => {
    const apprenticeUser = { ...mockUser, plan: 'apprentice' };
    const { rerender } = render(<ProfileHeader user={apprenticeUser} />);
    
    let planBadge = screen.getByText('Apprentice');
    expect(planBadge).toHaveClass('bg-gray-100', 'text-gray-800');
    
    const chroniclerUser = { ...mockUser, plan: 'chronicler' };
    rerender(<ProfileHeader user={chroniclerUser} />);
    
    planBadge = screen.getByText('Chronicler');
    expect(planBadge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('handles keyboard navigation for avatar upload', async () => {
    const user = userEvent.setup();
    const onUploadAvatar = vi.fn();
    
    render(<ProfileHeader user={mockUser} onUploadAvatar={onUploadAvatar} />);
    
    const avatarButton = screen.getByRole('button', { name: /upload new avatar/i });
    
    // Mock file input creation
    const createElementSpy = vi.spyOn(document, 'createElement');
    const mockInput = {
      type: '',
      accept: '',
      onchange: null as any,
      click: vi.fn(),
    };
    createElementSpy.mockReturnValue(mockInput as any);
    
    // Test Enter key
    avatarButton.focus();
    await user.keyboard('{Enter}');
    expect(mockInput.click).toHaveBeenCalled();
    
    // Reset mock
    mockInput.click.mockClear();
    
    // Test Space key
    await user.keyboard(' ');
    expect(mockInput.click).toHaveBeenCalled();
    
    createElementSpy.mockRestore();
  });

  it('formats join date correctly', () => {
    const userWithDate = { ...mockUser, createdAt: new Date('2023-06-15') };
    render(<ProfileHeader user={userWithDate} />);
    
    // Date formatting might be different due to timezone, check for the year and month
    expect(screen.getByText(/June.*2023|2023.*June/)).toBeInTheDocument();
  });

  it('handles missing optional profile fields gracefully', () => {
    const minimalProfile = { ...mockProfile, bio: undefined, location: undefined, website: undefined };
    render(<ProfileHeader user={mockUser} profile={minimalProfile} />);
    
    expect(screen.queryByText('A passionate writer')).not.toBeInTheDocument();
    expect(screen.queryByText('New York, NY')).not.toBeInTheDocument();
    expect(screen.queryByText('testuser.com')).not.toBeInTheDocument();
  });
});