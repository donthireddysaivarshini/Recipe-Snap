
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface UserCredentials {
  username: string;
  password: string; // In a real app, this would be a hashed password
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: string | null; // Store username
  signup: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'recipeSnap_usersDB';
const CURRENT_USER_KEY = 'recipeSnap_currentUser';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    } catch (error) {
      console.warn("Could not access localStorage for current user", error);
      setCurrentUser(null);
    }
    setIsLoading(false);
  }, []);

  const getUsersFromStorage = (): UserCredentials[] => {
    try {
      const storedUsers = localStorage.getItem(USERS_DB_KEY);
      return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
      console.warn("Could not access localStorage for users DB", error);
      return [];
    }
  };

  const saveUsersToStorage = (users: UserCredentials[]) => {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (error) {
      console.warn("Could not save to localStorage for users DB", error);
      toast({
        variant: "destructive",
        title: "Storage Error",
        description: "Could not save user data. Your browser storage might be full or disabled.",
      });
    }
  };

  const signup = useCallback(async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const users = getUsersFromStorage();
    if (users.find(user => user.username === username)) {
      return { success: false, message: 'Username already exists. Please choose another.' };
    }
    const newUsers = [...users, { username, password }]; // Storing password directly for prototype
    saveUsersToStorage(newUsers);
    // Automatically log in after signup
    return login(username, password);
  }, [toast]); // Added toast to dependency array due to its usage in saveUsersToStorage

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const users = getUsersFromStorage();
    const user = users.find(u => u.username === username);

    if (user && user.password === password) { // Direct password comparison for prototype
      try {
        localStorage.setItem(CURRENT_USER_KEY, username);
      } catch (error) {
        console.warn("Could not save current user to localStorage", error);
        return { success: false, message: 'Login failed: Could not save session.' };
      }
      setCurrentUser(username);
      router.push('/app/generator');
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password.' };
  }, [router]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.warn("Could not remove current user from localStorage", error);
    }
    setCurrentUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    if (!isLoading && !currentUser && pathname?.startsWith('/app')) {
      router.push('/login');
    }
  }, [currentUser, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!currentUser, currentUser, signup, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
