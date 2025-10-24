import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditProfileModal } from '../EditProfileModal';
import { User, UserProfile } from '@shared/schema';

// Mock AvatarUpload component
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

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

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

describe('EditProfileModal', () => {
  const defaultProps = {
    user: mockUser,
    isOpen: true,
    onClose: vi.fn(),
    onUpdateProfile: vi.fn(),
    onUploadAvatar: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('renders modal when isOpen is true', () => {
    render(<EditProfileModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<EditProfileModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('populates form fields with user data', () => {
    render(<EditProfileModal {...defaultProps} profile={mockProfile} />);
    
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A passionate writer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New York, NY')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://testuser.com')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<EditProfileModal {...defaultProps} />);
    
    const displayNameInput = screen.getByLabelText(/display name/i);
    await user.clear(displayNameInput);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Display name is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<EditProfileModal {...defaultProps} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('validates website URL format', async () => {
    const user = userEvent.setup();
    render(<EditProfileModal {...defaultProps} />);
    
    const websiteInput = screen.getByLabelText(/website/i);
    await user.clear(websiteInput);
    await user.type(websiteInput, 'not-a-url');
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid website URL')).toBeInTheDocument();
    });
  });

  it('validates bio character limit', async () => {
    const user = userEvent.setup();
    render(<EditProfileModal {...defaultProps} />);
    
    const bioInput = screen.getByLabelText(/bio/i);
    const longBio = 'a'.repeat(501); // Exceeds 500 character limit
    await user.clear(bioInput);
    await user.type(bioInput, longBio);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Bio must be less than 500 characters')).toBeInTheDocument();
    });
  });

  it('calls onUpdateProfile with changed fields only', async () => {
    const user = userEvent.setup();
    const onUpdateProfile = vi.fn();
    
    render(
      <EditProfileModal 
        {...defaultProps} 
        profile={mockProfile}
        onUpdateProfile={onUpdateProfile}
      />
    );
    
    const displayNameInput = screen.getByLabelText(/display name/i);
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Updated Name');
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(onUpdateProfile).toHaveBeenCalledWith({
        displayName: 'Updated Name',
      });
    });
  });

  it('handles avatar upload', async () => {
    const user = userEvent.setup();
    const onUploadAvatar = vi.fn();
    
    render(
      <EditProfileModal 
        {...defaultProps} 
        onUploadAvatar={onUploadAvatar}
      />
    );
    
    const uploadButton = screen.getByText('Upload Avatar');
    await user.click(uploadButton);
    
    expect(onUploadAvatar).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test.jpg',
        type: 'image/jpeg',
      })
    );
  });

  it('shows uploading state for avatar', () => {
    render(
      <EditProfileModal 
        {...defaultProps} 
        isUploadingAvatar={true}
      />
    );
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('shows updating state for form submission', () => {
    render(
      <EditProfileModal 
        {...defaultProps} 
        isUpdating={true}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('disables save button when no changes are made', () => {
    render(<EditProfileModal {...defaultProps} profile={mockProfile} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when changes are made', async () => {
    const user = userEvent.setup();
    render(<EditProfileModal {...defaultProps} profile={mockProfile} />);
    
    const displayNameInput = screen.getByLabelText(/display name/i);
    await user.type(displayNameInput, ' Updated');
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeEnabled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<EditProfileModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('shows confirmation dialog when closing with unsaved changes', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<EditProfileModal {...defaultProps} onClose={onClose} />);
    
    // Make a change
    const displayNameInput = screen.getByLabelText(/display name/i);
    await user.type(displayNameInput, ' Updated');
    
    // Try to close
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockConfirm).toHaveBeenCalledWith(
      'You have unsaved changes. Are you sure you want to close without saving?'
    );
  });

  it('does not close when user cancels confirmation dialog', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mockConfirm.mockReturnValue(false);
    
    render(<EditProfileModal {...defaultProps} onClose={onClose} />);
    
    // Make a change
    const displayNameInput = screen.getByLabelText(/display name/i);
    await user.type(displayNameInput, ' Updated');
    
    // Try to close
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('resets form when user/profile data changes', () => {
    const { rerender } = render(<EditProfileModal {...defaultProps} />);
    
    const updatedUser = { ...mockUser, displayName: 'Updated User' };
    rerender(<EditProfileModal {...defaultProps} user={updatedUser} />);
    
    expect(screen.getByDisplayValue('Updated User')).toBeInTheDocument();
  });

  it('handles social links correctly', async () => {
    const user = userEvent.setup();
    const onUpdateProfile = vi.fn();
    
    render(
      <EditProfileModal 
        {...defaultProps} 
        onUpdateProfile={onUpdateProfile}
      />
    );
    
    const twitterInput = screen.getByLabelText(/twitter/i);
    await user.clear(twitterInput);
    await user.type(twitterInput, '@newhandle');
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(onUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          socialLinks: expect.objectContaining({
            twitter: '@newhandle',
          }),
        })
      );
    });
  });

  it('closes modal without confirmation when no changes are made', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<EditProfileModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});