
"use client";

import { useSearchParams } from 'next/navigation';
import RecipeDetailView from '@/components/recipe/RecipeDetailView';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { useEffect, useState } from 'react';
import { generateSimpleRecipeDetailsAction, type GenerateSimpleRecipeDetailsState } from '@/lib/actions';
import { getMockRecipeDetails } from '@/lib/utils'; // Keep for fallback/initial state

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userUploadedImage, setUserUploadedImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const recipeNameParam = searchParams.get('name');
    const directImageParam = searchParams.get('image');
    const tempImageKeyParam = searchParams.get('tempImageKey');
    const ingredientsParam = searchParams.get('ingredients'); // Get ingredients if passed

    if (!recipeNameParam) {
      setError("Recipe name not found. Please go back and select a recipe.");
      setIsLoading(false);
      return;
    }

    let sourceImg: string | undefined = directImageParam || undefined;
    if (tempImageKeyParam && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const storedImage = sessionStorage.getItem(`tempImage_${tempImageKeyParam}`);
        if (storedImage) {
          sourceImg = storedImage;
          // Clean up immediately
          // sessionStorage.removeItem(`tempImage_${tempImageKeyParam}`); // Let's not remove, user might refresh
        }
      } catch (e) {
        console.warn("Failed to access session storage for temp image.", e);
      }
    }
    setUserUploadedImage(sourceImg); // Store user-uploaded image separately

    const fetchRecipeDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the new server action to get AI-generated recipe details
        const result: GenerateSimpleRecipeDetailsState = await generateSimpleRecipeDetailsAction(recipeNameParam, ingredientsParam || undefined);

        if (result.recipe) {
          // Combine AI recipe with user-uploaded image
          const finalRecipe: Recipe = {
            ...result.recipe,
            id: params.id || result.recipe.id, // Ensure router slug is used for ID
            sourceImage: sourceImg, // Add the user-uploaded image here
          };
          setRecipe(finalRecipe);
        } else if (result.errors) {
          const errorMsg = result.errors.general?.join(', ') || result.errors.recipeName?.join(', ') || 'Error generating recipe details.';
          setError(`AI Error: ${errorMsg}. Displaying basic info.`);
          // Fallback to simplified mock details if AI fails
          const mockRecipe = getMockRecipeDetails(recipeNameParam, sourceImg);
          mockRecipe.id = params.id || mockRecipe.id;
          setRecipe(mockRecipe);
        } else {
          setError("Failed to generate recipe details from AI. Displaying basic info.");
          const mockRecipe = getMockRecipeDetails(recipeNameParam, sourceImg);
          mockRecipe.id = params.id || mockRecipe.id;
          setRecipe(mockRecipe);
        }
      } catch (e) {
        console.error("Error fetching AI recipe details:", e);
        setError(`Fetch Error: ${e instanceof Error ? e.message : String(e)}. Displaying basic info.`);
        const mockRecipe = getMockRecipeDetails(recipeNameParam, sourceImg);
        mockRecipe.id = params.id || mockRecipe.id;
        setRecipe(mockRecipe);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetails();

  }, [searchParams, params.id]);


  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Your recipe is cooking... please wait!</p>
            <p className="text-sm text-muted-foreground">Our AI chef is preparing simple instructions for you.</p>
        </div>
    );
  }

  if (error && !recipe) { // Show error only if no recipe could be loaded (even fallback)
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
  
  // If there was an AI error but we have a fallback recipe, show the error above the recipe
  return (
    <div>
      {error && recipe && ( // Show non-critical error above recipe
         <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {recipe ? (
        <RecipeDetailView recipe={recipe} />
      ) : (
         <div className="container mx-auto px-4 py-8">
         <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Recipe Not Found</AlertTitle>
            <AlertDescription>The recipe details could not be loaded.</AlertDescription>
        </Alert>
        </div>
      )}
    </div>
  );
}
