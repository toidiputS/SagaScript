import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type User = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  tier: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  // Use React Query to fetch the current user
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ['/api/me'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 15, // 15 minutes
    throwOnError: false,
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch('/api/me', {
          credentials: 'include',
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error(`Error fetching user: ${res.statusText}`);
        }
        
        return res.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
  });

  // Initialize auth state
  useEffect(() => {
    if (!isLoading) {
      setIsInitializing(false);
    }
  }, [isLoading]);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      // Refetch user data
      await refetch();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear user from state
    queryClient.setQueryData(['/api/me'], null);
    
    // Clear all query cache to ensure sensitive data isn't retained
    queryClient.clear();
  };

  // Function to refresh user data
  const refreshUser = async () => {
    const { data } = await refetch();
    return data as User | null;
  };

  const value = {
    user: user || null,
    isLoading: isInitializing || isLoading,
    register,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
