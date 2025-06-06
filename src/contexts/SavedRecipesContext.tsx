"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Recipe, LocalSavedRecipe } from '@/lib/types'; // Using full Recipe for context, LocalSavedRecipe for storage type
import { useToast } from '@/hooks/use-toast';

interface SavedRecipesContextType {
  savedRecipes: Recipe[]; // Store full Recipe objects if available, or adapt
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: string) => void;
  isRecipeSaved: (recipeId: string) => boolean;
}

const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(undefined);

const SAVED_RECIPES_KEY = 'recipeSnap_savedRecipes';

// Helper to create a slug from a recipe name for ID consistency if full Recipe object isn't available
const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');


export const SavedRecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedRecipes = localStorage.getItem(SAVED_RECIPES_KEY);
      if (storedRecipes) {
        setSavedRecipes(JSON.parse(storedRecipes) as Recipe[]);
      }
    } catch (error) {
      console.error("Failed to load saved recipes from localStorage", error);
      // Initialize with empty array if localStorage is not available or fails
      setSavedRecipes([]);
    }
  }, []);

  const updateLocalStorage = (recipes: Recipe[]) => {
    try {
      localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(recipes));
    } catch (error) {
      console.error("Failed to save recipes to localStorage", error);
      toast({
        variant: "destructive",
        title: "Storage Error",
        description: "Could not save recipes. Your browser storage might be full or disabled.",
      });
    }
  };

  const addRecipe = useCallback((recipe: Recipe) => {
    // Ensure recipe has an ID, if not, generate one (e.g. from name slug)
    const recipeWithId = { ...recipe, id: recipe.id || slugify(recipe.name) };
    
    setSavedRecipes(prevRecipes => {
      if (prevRecipes.some(r => r.id === recipeWithId.id)) {
        return prevRecipes; // Already saved
      }
      const updatedRecipes = [...prevRecipes, recipeWithId];
      updateLocalStorage(updatedRecipes);
      return updatedRecipes;
    });
  }, [toast]);

  const removeRecipe = useCallback((recipeId: string) => {
    setSavedRecipes(prevRecipes => {
      const updatedRecipes = prevRecipes.filter(r => r.id !== recipeId);
      updateLocalStorage(updatedRecipes);
      return updatedRecipes;
    });
  }, []);

  const isRecipeSaved = useCallback((recipeId: string): boolean => {
    return savedRecipes.some(r => r.id === recipeId);
  }, [savedRecipes]);

  return (
    <SavedRecipesContext.Provider value={{ savedRecipes, addRecipe, removeRecipe, isRecipeSaved }}>
      {children}
    </SavedRecipesContext.Provider>
  );
};

export const useSavedRecipes = (): SavedRecipesContextType => {
  const context = useContext(SavedRecipesContext);
  if (context === undefined) {
    throw new Error('useSavedRecipes must be used within a SavedRecipesProvider');
  }
  return context;
};
