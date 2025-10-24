import { useState } from "react";
import { User, UserProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OptimizedAvatar } from "@/components/ui/optimized-image";

interface ProfileHeaderProps {
  user: User;
  profile?: UserProfile;
  isLoading?: boolean;
  onEditProfile?: () => void;
  onUploadAvatar?: (file: File) => void;
  isUploadingAvatar?: boolean;
}

export function ProfileHeader({
  user,
  profile,
  isLoading = false,
  onEditProfile,
  onUploadAvatar,
  isUploadingAvatar = false,
}: ProfileHeaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAvatarClick = () => {
    if (!onUploadAvatar) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onUploadAvatar(file);
      }
    };
    input.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!onUploadAvatar) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onUploadAvatar(imageFile);
    }
  };

  const getInitials = (displayName: string) => {
    return displayName
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanDisplayName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'apprentice':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scribe':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'chronicler':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-[30px] bg-card text-card-foreground shadow-[15px_15px_30px_rgba(59,130,246,0.15),-15px_-15px_30px_rgba(147,197,253,0.1)]">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Skeleton */}
            <div className="w-24 h-24 rounded-full bg-muted animate-pulse flex-shrink-0" />
            
            {/* User Info Skeleton */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="h-8 bg-muted rounded animate-pulse w-48 mx-auto md:mx-0" />
              <div className="h-5 bg-muted rounded animate-pulse w-32 mx-auto md:mx-0" />
              <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                <div className="h-6 bg-muted rounded animate-pulse w-24" />
                <div className="h-5 bg-muted rounded animate-pulse w-36" />
              </div>
            </div>
            
            {/* Quick Actions Skeleton */}
            <div className="flex gap-3">
              <div className="h-9 bg-muted rounded animate-pulse w-24" />
              <div className="h-9 bg-muted rounded animate-pulse w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[20px] sm:rounded-[30px] bg-card text-card-foreground shadow-[15px_15px_30px_rgba(59,130,246,0.15),-15px_-15px_30px_rgba(147,197,253,0.1)] hover:shadow-[20px_20px_40px_rgba(59,130,246,0.2),-20px_-20px_40px_rgba(147,197,253,0.15)] transition-shadow duration-300">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`relative cursor-pointer group touch-manipulation ${
                isDragOver ? 'ring-4 ring-primary ring-opacity-50' : ''
              }`}
              onClick={handleAvatarClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={onUploadAvatar ? 0 : -1}
              aria-label={onUploadAvatar ? "Upload new avatar" : undefined}
              onKeyDown={(e) => {
                if (onUploadAvatar && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleAvatarClick();
                }
              }}
            >
              {(profile?.avatar || user.avatar) ? (
                <OptimizedAvatar
                  src={profile?.avatar || user.avatar || ''}
                  alt={`${user.displayName}'s avatar`}
                  size={96}
                  className="w-20 h-20 sm:w-24 sm:h-24 border-2 sm:border-4 border-background shadow-lg"
                  priority={true}
                />
              ) : (
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 sm:border-4 border-background shadow-lg">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl font-bold">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {/* Upload Overlay */}
              {onUploadAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  {isUploadingAvatar ? (
                    <i className="ri-loader-line text-white text-lg sm:text-xl animate-spin" />
                  ) : (
                    <i className="ri-camera-line text-white text-lg sm:text-xl" />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-1 sm:mb-2" id="profile-name">
              {user.displayName}
            </h1>
            <p className="text-muted-foreground mb-3 sm:mb-4 text-base sm:text-lg" aria-label={`Username: ${user.username}`}>
              @{user.username}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center md:items-start">
              {/* Subscription Plan Badge */}
              <div className="flex items-center gap-2" role="group" aria-label="Subscription information">
                <span className="text-xs sm:text-sm text-muted-foreground" id="plan-label">Plan:</span>
                <Badge 
                  variant="outline" 
                  className={`${getPlanColor(user.plan)} font-medium text-xs sm:text-sm`}
                  aria-labelledby="plan-label"
                  role="status"
                >
                  <i className="ri-vip-crown-line mr-1" aria-hidden="true" />
                  {getPlanDisplayName(user.plan)}
                </Badge>
              </div>
              
              {/* Join Date */}
              <div className="flex items-center gap-2" role="group" aria-label="Membership information">
                <span className="text-xs sm:text-sm text-muted-foreground" id="join-date-label">Member since:</span>
                <time 
                  className="text-xs sm:text-sm font-medium"
                  dateTime={new Date(user.createdAt).toISOString()}
                  aria-labelledby="join-date-label"
                >
                  {formatJoinDate(user.createdAt)}
                </time>
              </div>
            </div>
            
            {/* Bio */}
            {profile?.bio && (
              <p className="text-muted-foreground mt-3 sm:mt-4 max-w-md text-sm sm:text-base">
                {profile.bio}
              </p>
            )}
            
            {/* Location and Website */}
            {(profile?.location || profile?.website) && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-3 items-center md:items-start">
                {profile.location && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <i className="ri-map-pin-line" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <i className="ri-link text-muted-foreground" aria-hidden="true" />
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      aria-label={`Visit ${user.displayName}'s website: ${profile.website}`}
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <nav className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto" aria-label="Profile actions">
            {onEditProfile && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEditProfile}
                className="min-h-[44px] touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-describedby="profile-name"
              >
                <i className="ri-edit-line mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="min-h-[44px] touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Open profile settings"
            >
              <i className="ri-settings-3-line mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </Button>
          </nav>
        </div>
      </CardContent>
    </Card>
  );
}