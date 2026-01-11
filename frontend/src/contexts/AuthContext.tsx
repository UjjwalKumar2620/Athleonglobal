import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'athlete' | 'coach' | 'organizer' | 'viewer' | 'creator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  sport?: string;
  location?: string;
  bio?: string;
  followers?: number;
  following?: number;
  credits?: number;
  subscription?: 'free' | 'athlete_pro' | 'organizer_pro' | 'coach_pro';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('athleon_token');
      const storedUser = localStorage.getItem('athleon_user');

      // If we have a stored user, use it immediately (don't block on API)
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('athleon_user');
          localStorage.removeItem('athleon_token');
        }
      }

      // Only try to verify with backend if we have a token
      // Use AbortController for timeout
      if (token && storedUser) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const userData = await response.json();
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role as UserRole,
              avatar: userData.avatar,
              credits: userData.credits,
              subscription: userData.subscription,
            });
          }
          // If response is not ok, we already set from storedUser above
        } catch {
          // Backend not available or timeout, user is already set from storedUser
          console.log('Backend not available, using stored user data');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Try backend API first
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('athleon_token', data.token);
          localStorage.setItem('athleon_user', JSON.stringify(data.user));
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role as UserRole,
            credits: data.user.credits,
            subscription: data.user.subscription,
          });
          return;
        } else {
          throw new Error('Backend returned error');
        }
      } catch {
        // Backend not available, fallback to mock auth
        console.log('Backend not available, using mock authentication');
      }

      // Mock authentication fallback
      const storedUsers = JSON.parse(localStorage.getItem('athleon_users') || '[]');
      const foundUser = storedUsers.find((u: { email: string; password: string }) =>
        u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      const mockToken = `mock_token_${Date.now()}`;
      localStorage.setItem('athleon_token', mockToken);
      localStorage.setItem('athleon_user', JSON.stringify(foundUser));

      setUser({
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role as UserRole,
        credits: foundUser.credits || 20,
        subscription: foundUser.subscription || 'free',
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      // Try backend API first
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name, role }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('athleon_token', data.token);
          localStorage.setItem('athleon_user', JSON.stringify(data.user));
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role as UserRole,
            credits: 20,
            subscription: 'free',
          });
          return;
        } else {
          throw new Error('Backend returned error');
        }
      } catch {
        // Backend not available, fallback to mock auth
        console.log('Backend not available, using mock authentication');
      }

      // Mock signup fallback
      const storedUsers = JSON.parse(localStorage.getItem('athleon_users') || '[]');

      // Check if user already exists
      if (storedUsers.some((u: { email: string }) => u.email === email)) {
        throw new Error('Email already registered');
      }

      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password,
        name,
        role,
        credits: 20,
        subscription: 'free' as const,
      };

      storedUsers.push(newUser);
      localStorage.setItem('athleon_users', JSON.stringify(storedUsers));

      const mockToken = `mock_token_${Date.now()}`;
      localStorage.setItem('athleon_token', mockToken);
      localStorage.setItem('athleon_user', JSON.stringify(newUser));

      setUser({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        credits: newUser.credits,
        subscription: newUser.subscription,
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('athleon_token');
    localStorage.removeItem('athleon_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('athleon_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
