import { apiRequest } from "./queryClient";

/**
 * Helper function to register a new user
 */
export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}) {
  return apiRequest("POST", "/api/register", userData);
}

/**
 * Helper function to login a user
 */
export async function loginUser(credentials: {
  username: string;
  password: string;
}) {
  return apiRequest("POST", "/api/login", credentials);
}

/**
 * Helper function to logout a user
 */
export async function logoutUser() {
  return apiRequest("POST", "/api/logout", {});
}

/**
 * Helper function to get the current user
 */
export async function getCurrentUser() {
  try {
    const response = await fetch("/api/me", {
      credentials: "include",
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error(`Error fetching user: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Helper function to update user profile
 */
export async function updateUserProfile(userData: {
  displayName?: string;
  email?: string;
}) {
  return apiRequest("PATCH", "/api/me", userData);
}

/**
 * Helper function to change password
 */
export async function changePassword(passwordData: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiRequest("POST", "/api/change-password", passwordData);
}
