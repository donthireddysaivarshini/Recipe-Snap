"use client";

import type React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SavedRecipesProvider } from '@/contexts/SavedRecipesContext';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <SavedRecipesProvider>
        {children}
      </SavedRecipesProvider>
    </AuthProvider>
  );
};

export default AppProviders;
