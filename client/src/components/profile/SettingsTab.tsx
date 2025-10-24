import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "../../hooks/use-user";
import { User, UserPreferences } from "@shared/schema";

interface SettingsTabProps {
  user?: User;
}

export function SettingsTab({ user }: SettingsTabProps) {
  const { toast } = useToast();
  const { updateUser } = useUser();
  
  // Account settings state
  const [accountData, setAccountData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>(
    user?.preferences as UserPreferences || {
      theme: "system",
      notifications: {
        email: true,
        push: true,
        writingReminders: true,
        achievementAlerts: true,
      },
      privacy: {
        profileVisibility: "public",
        showStats: true,
        showAchievements: true,
      },
      writing: {
        defaultGoal: 500,
        autoSave: true,
      },
    }
  );

  // Loading states
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Account deletion confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const handleAccountUpdate = async () => {
    setIsUpdatingAccount(true);
    try {
      await updateUser({
        displayName: accountData.displayName,
        email: accountData.email,
        bio: accountData.bio,
        location: accountData.location,
        website: accountData.website,
      });
      
      toast({
        title: "Account Updated",
        description: "Your account information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update account information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
    } catch (error) {
      toast({
        title: "Password Update Failed",
        description: "Failed to update password. Please check your current password.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setIsUpdatingPreferences(true);
    try {
      await updateUser({ preferences });
      
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been successfully saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmationText !== "DELETE MY ACCOUNT") {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE MY ACCOUNT' to confirm.",
        variant: "destructive",
      });
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });

      // Redirect to home page or login
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch("/api/user/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sagascript-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Data Exported",
        description: "Your data has been successfully exported and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <i className="ri-user-line text-primary"></i>
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={accountData.displayName}
                onChange={(e) => setAccountData({ ...accountData, displayName: e.target.value })}
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={accountData.bio}
              onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={accountData.location}
                onChange={(e) => setAccountData({ ...accountData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={accountData.website}
                onChange={(e) => setAccountData({ ...accountData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <Button 
            onClick={handleAccountUpdate} 
            disabled={isUpdatingAccount}
            className="w-full md:w-auto"
          >
            {isUpdatingAccount ? (
              <>
                <i className="ri-loader-line animate-spin mr-2"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="ri-save-line mr-2"></i>
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Password & Security */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <i className="ri-shield-line text-primary"></i>
            Password & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter your current password"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <i className="ri-shield-check-line text-2xl text-green-600"></i>
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>

          <Button 
            onClick={handlePasswordChange} 
            disabled={isUpdatingPassword || !passwordData.currentPassword || !passwordData.newPassword}
            className="w-full md:w-auto"
          >
            {isUpdatingPassword ? (
              <>
                <i className="ri-loader-line animate-spin mr-2"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="ri-key-line mr-2"></i>
                Change Password
              </>
            )}
          </Button>
        </CardContent>
      </Card> 
     {/* Application Preferences */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <i className="ri-palette-line text-primary"></i>
            Application Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value: 'light' | 'dark' | 'spooky' | 'system') =>
                setPreferences({ ...preferences, theme: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <i className="ri-computer-line"></i>
                    System Default
                  </div>
                </SelectItem>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <i className="ri-sun-line"></i>
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <i className="ri-moon-line"></i>
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="spooky">
                  <div className="flex items-center gap-2">
                    <i className="ri-ghost-line"></i>
                    Spooky
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Notifications</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, email: checked },
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Browser notifications for important updates</p>
                </div>
                <Switch
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, push: checked },
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Writing Reminders</Label>
                  <p className="text-xs text-muted-foreground">Daily reminders to keep your writing streak</p>
                </div>
                <Switch
                  checked={preferences.notifications.writingReminders}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, writingReminders: checked },
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Achievement Alerts</Label>
                  <p className="text-xs text-muted-foreground">Notifications when you earn new achievements</p>
                </div>
                <Switch
                  checked={preferences.notifications.achievementAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, achievementAlerts: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Writing Preferences */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Writing Settings</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultGoal">Default Daily Writing Goal (words)</Label>
                <Input
                  id="defaultGoal"
                  type="number"
                  min="50"
                  max="10000"
                  value={preferences.writing.defaultGoal}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      writing: { ...preferences.writing, defaultGoal: parseInt(e.target.value) || 500 },
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Daily Reminder Time</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={preferences.writing.reminderTime || ""}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      writing: { ...preferences.writing, reminderTime: e.target.value },
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Auto-save</Label>
                  <p className="text-xs text-muted-foreground">Automatically save your work while writing</p>
                </div>
                <Switch
                  checked={preferences.writing.autoSave}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      writing: { ...preferences.writing, autoSave: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handlePreferencesUpdate} 
            disabled={isUpdatingPreferences}
            className="w-full md:w-auto"
          >
            {isUpdatingPreferences ? (
              <>
                <i className="ri-loader-line animate-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="ri-save-line mr-2"></i>
                Save Preferences
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy & Data Controls */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <i className="ri-shield-user-line text-primary"></i>
            Privacy & Data Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Privacy Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Profile Visibility</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Profile Visibility</Label>
                  <p className="text-xs text-muted-foreground">Control who can see your profile</p>
                </div>
                <Select
                  value={preferences.privacy.profileVisibility}
                  onValueChange={(value: 'public' | 'private') =>
                    setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, profileVisibility: value },
                    })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Show Writing Statistics</Label>
                  <p className="text-xs text-muted-foreground">Display your writing stats on your profile</p>
                </div>
                <Switch
                  checked={preferences.privacy.showStats}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, showStats: checked },
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Show Achievements</Label>
                  <p className="text-xs text-muted-foreground">Display your achievements on your profile</p>
                </div>
                <Switch
                  checked={preferences.privacy.showAchievements}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, showAchievements: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Data Export */}
          <Separator />
          <div className="space-y-4">
            <Label className="text-base font-medium">Data Management</Label>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <i className="ri-download-line text-2xl text-blue-600"></i>
                <div>
                  <h4 className="font-medium">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground">Download all your writing content and data</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDataExport}>
                <i className="ri-download-line mr-2"></i>
                Export Data
              </Button>
            </div>
          </div>

          <Button 
            onClick={handlePreferencesUpdate} 
            disabled={isUpdatingPreferences}
            className="w-full md:w-auto"
          >
            {isUpdatingPreferences ? (
              <>
                <i className="ri-loader-line animate-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="ri-save-line mr-2"></i>
                Save Privacy Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(239,68,68,0.12),-10px_-10px_20px_rgba(252,165,165,0.08)] hover:shadow-[15px_15px_25px_rgba(239,68,68,0.18),-15px_-15px_25px_rgba(252,165,165,0.12)] transition-shadow duration-300 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-red-600 dark:text-red-400">
            <i className="ri-error-warning-line"></i>
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <i className="ri-alert-line text-red-600 dark:text-red-400 text-xl mt-0.5"></i>
              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-200">Delete Account</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirmation ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="mt-3"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-3 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirmation" className="text-red-800 dark:text-red-200">
                        Type "DELETE MY ACCOUNT" to confirm:
                      </Label>
                      <Input
                        id="deleteConfirmation"
                        value={deleteConfirmationText}
                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                        className="border-red-300 dark:border-red-700"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleAccountDeletion}
                        disabled={isDeletingAccount || deleteConfirmationText !== "DELETE MY ACCOUNT"}
                      >
                        {isDeletingAccount ? (
                          <>
                            <i className="ri-loader-line animate-spin mr-2"></i>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <i className="ri-delete-bin-line mr-2"></i>
                            Confirm Deletion
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirmation(false);
                          setDeleteConfirmationText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}