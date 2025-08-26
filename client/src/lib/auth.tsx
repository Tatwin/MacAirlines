import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import type { User, SignupData, LoginData } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check for existing token and get user
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: !!localStorage.getItem('token'),
    retry: false,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData.user);
    }
  }, [userData]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => apiClient.login(data),
    onSuccess: (response) => {
      apiClient.setToken(response.token);
      setUser(response.user);
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupData) => apiClient.signup(data),
    onSuccess: (response) => {
      apiClient.setToken(response.token);
      setUser(response.user);
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const signup = async (data: SignupData) => {
    await signupMutation.mutateAsync(data);
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
