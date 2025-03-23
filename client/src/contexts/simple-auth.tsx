import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { User as SelectUser } from "@shared/schema";

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

interface AuthContextType {
  user: SelectUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[Auth] Checking current session...");
        const res = await fetch("/api/user", {
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          }
        });
        
        if (res.ok) {
          const userData = await res.json();
          console.log("[Auth] Session found, user:", userData);
          setUser(userData);
        } else {
          console.log("[Auth] No active session found");
          setUser(null);
        }
      } catch (error) {
        console.error("[Auth] Auth check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    setIsLoading(true);
    
    try {
      console.log("[Auth] Login attempt with:", data.username);
      
      // Make a direct fetch call with proper credentials and headers
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }
      
      const userData = await res.json();
      
      console.log("[Auth] Login successful:", userData);
      setUser(userData);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.displayName || userData.username}!`,
      });
      
      return userData;
    } catch (error) {
      console.error("[Auth] Login error:", error);
      
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    
    try {
      console.log("[Auth] Registration attempt with:", data.username);
      
      // Make a direct fetch call with proper credentials and headers
      const res = await fetch("/api/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }
      
      const userData = await res.json();
      
      console.log("[Auth] Registration successful:", userData);
      setUser(userData);
      
      toast({
        title: "Registration successful",
        description: `Welcome to Saga Scribe, ${userData.displayName || userData.username}!`,
      });
      
      return userData;
    } catch (error) {
      console.error("[Auth] Registration error:", error);
      
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      console.log("[Auth] Logging out user");
      
      // Make a direct fetch call with proper credentials and headers
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      setUser(null);
      
      // Clear query cache
      queryClient.clear();
      
      console.log("[Auth] Logout successful");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("[Auth] Logout error:", error);
      
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider");
  }
  
  return context;
}

// Add useAuth as an alias for backward compatibility
export function useAuth() {
  return useSimpleAuth();
}