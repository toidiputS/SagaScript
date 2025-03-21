import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  displayName: string;
  password: string;
  plan: string;
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<any>;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // User data query
  const {
    data: user,
    error,
    isLoading,
    refetch: refreshUser,
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login mutation executing with:", credentials.username);
      
      try {
        // Log the exact request details
        console.log("Login request details:", {
          url: "/api/login",
          method: "POST",
          body: JSON.stringify(credentials)
        });
        
        const res = await apiRequest("POST", "/api/login", credentials);
        console.log("Login response status:", res.status, res.statusText);
        
        // Always log the response body for debugging purposes
        const responseText = await res.text();
        console.log("Login response body:", responseText);
        
        // If not OK status, throw an error
        if (!res.ok) {
          let errorMessage = "Login failed";
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
          throw new Error(errorMessage);
        }
        
        // Parse the response as JSON
        try {
          const userData = JSON.parse(responseText);
          console.log("Parsed user data:", userData);
          return userData;
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Login request failed:", error);
        throw error;
      }
    },
    onSuccess: (userData: SelectUser) => {
      console.log("Login successful for:", userData.username);
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.displayName || userData.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      console.log("Register mutation executing with:", data.username);
      
      try {
        // Log the exact request details
        console.log("Register request details:", {
          url: "/api/register",
          method: "POST",
          body: JSON.stringify(data)
        });
        
        // Our apiRequest function now handles errors and logs, just use it directly
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include"
        });
        
        console.log("Register response status:", res.status, res.statusText);
        
        let responseText;
        try {
          responseText = await res.text();
          console.log("Register response body:", responseText);
        } catch (e) {
          console.error("Error reading response text:", e);
          throw new Error("Failed to read response");
        }
        
        // Handle non-200 responses
        if (!res.ok) {
          let errorMessage = "Registration failed";
          try {
            if (responseText) {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorMessage;
            }
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
          throw new Error(errorMessage);
        }
        
        // Parse the successful response as JSON
        try {
          if (!responseText) {
            throw new Error("Empty response received");
          }
          const userData = JSON.parse(responseText);
          console.log("Parsed user data:", userData);
          return userData;
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Registration request failed:", error);
        throw error;
      }
    },
    onSuccess: (userData: SelectUser) => {
      console.log("Registration successful for:", userData.username);
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome to Saga Scribe, ${userData.displayName || userData.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Logout mutation executing");
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      console.log("Logout successful");
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    },
  });

  // Make sure user is properly typed
  const authUser = user as SelectUser | null;
  
  const value: AuthContextType = {
    user: authUser,
    isLoading,
    error,
    refreshUser,
    loginMutation,
    logoutMutation,
    registerMutation,
    isAuthenticated: !!authUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}