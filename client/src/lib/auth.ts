import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  displayName: string;
  plan: string;
}

export async function login(username: string, password: string): Promise<User> {
  try {
    const response = await apiRequest("POST", "/api/login", {
      username,
      password,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Login failed. Please try again.");
  }
}

export async function register(
  username: string,
  password: string,
  displayName: string
): Promise<User> {
  try {
    const response = await apiRequest("POST", "/api/register", {
      username,
      password,
      displayName,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }
    
    // After successful registration, automatically log the user in
    return login(username, password);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Registration failed. Please try again.");
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("POST", "/api/logout");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiRequest("GET", "/api/user");
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
