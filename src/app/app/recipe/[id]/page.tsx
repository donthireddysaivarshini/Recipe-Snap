
"use client";

import { useSearchParams } from 'next/navigation';
import RecipeDetailView from '@/components/recipe/RecipeDetailView';
import { getMockRecipeDetails } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { useEffect, useState, use } from 'react'; // Import 'use'

export default function RecipeDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise); // Unwrap the promise
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const recipeNameParam = searchParams.get('name');
    const directImageParam = searchParams.get('image'); // For regular image URLs
    const tempImageKeyParam = searchParams.get('tempImageKey'); // For images from sessionStorage

    if (!recipeNameParam) {
      setError("Recipe name not found. Please go back and select a recipe.");
      setIsLoading(false);
      return;
    }

    let finalRecipeImage: string | undefined = directImageParam || undefined;

    if (tempImageKeyParam && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const storedImage = sessionStorage.getItem(`tempImage_${tempImageKeyParam}`);
        if (storedImage) {
          finalRecipeImage = storedImage;
          // Clean up sessionStorage immediately after retrieval to prevent it from growing
          sessionStorage.removeItem(`tempImage_${tempImageKeyParam}`);
        }
      } catch (e) {
        console.warn("Failed to access session storage for temp image.", e);
        // Fallback to directImageParam or placeholder if session storage fails
      }
    }
    
    const currentRecipe = getMockRecipeDetails(recipeNameParam, finalRecipeImage);
    // Ensure the ID from the route param (slug) is used, as getMockRecipeDetails might generate its own based on name
    currentRecipe.id = params.id || currentRecipe.id; // Use resolved params.id
    setRecipe(currentRecipe);
    setIsLoading(false);

  }, [searchParams, params.id]); // Use resolved params.id in dependency array


  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading recipe details...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!recipe) {
    // Should ideally be covered by isLoading or error state, but as a fallback:
    return (
        <div className="container mx-auto px-4 py-8">
         <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Recipe Not Found</AlertTitle>
            <AlertDescription>The recipe details could not be loaded.</AlertDescription>
        </Alert>
        </div>
    );
  }

  return (
    <div>
      <RecipeDetailView recipe={recipe} />
    </div>
  );
}
