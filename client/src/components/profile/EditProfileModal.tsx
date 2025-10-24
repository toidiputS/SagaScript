import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, UserProfile } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "./AvatarUpload";

const editProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100, "Display name must be less than 100 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  socialLinks: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  user: User;
  profile?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onUploadAvatar: (file: File) => void;
  isUpdating?: boolean;
  isUploadingAvatar?: boolean;
}

export function EditProfileModal({
  user,
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  onUploadAvatar,
  isUpdating = false,
  isUploadingAvatar = false,
}: EditProfileModalProps) {
  const [hasChanges, setHasChanges] = useState(false);

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      email: user.email || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
      socialLinks: {
        twitter: (profile?.socialLinks as any)?.twitter || "",
        instagram: (profile?.socialLinks as any)?.instagram || "",
        website: (profile?.socialLinks as any)?.website || "",
      },
    },
  });

  // Reset form when user/profile data changes
  useEffect(() => {
    form.reset({
      displayName: user.displayName,
      email: user.email || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
      socialLinks: {
        twitter: (profile?.socialLinks as any)?.twitter || "",
        instagram: (profile?.socialLinks as any)?.instagram || "",
        website: (profile?.socialLinks as any)?.website || "",
      },
    });
    setHasChanges(false);
  }, [user, profile, form]);

  // Watch for form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (data: EditProfileFormData) => {
    // Clean up empty strings and undefined values
    const updates: Partial<UserProfile> = {};
    
    if (data.displayName !== user.displayName) {
      updates.displayName = data.displayName;
    }
    
    if (data.email !== (user.email || "")) {
      updates.email = data.email || null;
    }
    
    if (data.bio !== (profile?.bio || "")) {
      updates.bio = data.bio || null;
    }
    
    if (data.location !== (profile?.location || "")) {
      updates.location = data.location || null;
    }
    
    if (data.website !== (profile?.website || "")) {
      updates.website = data.website || null;
    }

    // Handle social links
    const socialLinks = {
      twitter: data.socialLinks?.twitter || null,
      instagram: data.socialLinks?.instagram || null,
      website: data.socialLinks?.website || null,
    };
    
    // Only include socialLinks if there are actual changes
    const currentSocialLinks = (profile?.socialLinks as any) || {};
    if (
      socialLinks.twitter !== (currentSocialLinks.twitter || null) ||
      socialLinks.instagram !== (currentSocialLinks.instagram || null) ||
      socialLinks.website !== (currentSocialLinks.website || null)
    ) {
      updates.socialLinks = socialLinks;
    }

    // Only submit if there are actual changes
    if (Object.keys(updates).length > 0) {
      onUpdateProfile(updates);
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    if (hasChanges && !isUpdating) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (!confirmClose) return;
    }
    
    form.reset();
    setHasChanges(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and avatar. Changes will be saved to your account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center space-y-4">
              <AvatarUpload
                currentAvatar={(profile?.avatar || user.avatar) ?? undefined}
                displayName={user.displayName}
                onUpload={onUploadAvatar}
                isUploading={isUploadingAvatar}
                size="lg"
              />
              <p className="text-sm text-muted-foreground text-center">
                Click or drag an image to update your avatar
              </p>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your display name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how your name will appear to other users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your email address for account notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a bit about yourself and your writing..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description about yourself (max 500 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location and Website */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your general location (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        type="url" 
                        placeholder="https://yourwebsite.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your personal website or blog (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Links</h3>
              
              <FormField
                control={form.control}
                name="socialLinks.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="@yourusername" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@yourusername" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!hasChanges || isUpdating}
                className="min-w-[100px]"
              >
                {isUpdating ? (
                  <>
                    <i className="ri-loader-line mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}