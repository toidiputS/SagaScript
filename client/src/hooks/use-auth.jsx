import { createContext, useState, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => null,
});

export function AuthProvider({ children }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  // Use React Query to fetch the current user
  const { data: user, isLoading, refetch } = useQuery({
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
  const login = async (username, password) => {
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
    return data;
  };

  return (
    <AuthContext.Provider 
      value={{
        user: user || null,
        isLoading: isInitializing || isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);