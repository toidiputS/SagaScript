
import { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: number;
  username: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) return null;
        return response.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    }
  });

  const register = async (username: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      await queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error) {
      throw error instanceof Error ? error : new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      await queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      register,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
