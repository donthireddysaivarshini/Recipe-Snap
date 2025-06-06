
"use client";

import { useSearchParams } from 'next/navigation';
import RecipeDetailView from '@/components/recipe/RecipeDetailView';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { useEffect, useState, use } from 'react'; // Added 'use'
import { generateSimpleRecipeDetailsAction, type GenerateSimpleRecipeDetailsState } from '@/lib/actions';
import { getMockRecipeDetails } from '@/lib/utils'; 

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) { // params is a Promise
  const resolvedParams = use(params); // Resolve the promise here
  const id = resolvedParams.id; // Get the id

  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // No longer need userUploadedImage state here as sourceImage is part of the Recipe object now

  useEffect(() => {
    const recipeNameParam = searchParams.get('name');
    const directImageParam = searchParams.get('image'); // For direct image URL (less common now)
    const tempImageKeyParam = searchParams.get('tempImageKey'); // For data URI from session storage
    const ingredientsParam = searchParams.get('ingredients'); 

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
          // sessionStorage.removeItem(`tempImage_${tempImageKeyParam}`); // Removed for now to allow refresh
        }
      } catch (e) {
        console.warn("Failed to access session storage for temp image.", e);
      }
    }

    const fetchRecipeDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result: GenerateSimpleRecipeDetailsState = await generateSimpleRecipeDetailsAction(recipeNameParam, ingredientsParam || undefined);

        if (result.recipe) {
          const finalRecipe: Recipe = {
            ...result.recipe,
            id: id || result.recipe.id, // Use resolved id from route
            sourceImage: sourceImg, // Add the user-uploaded image (or other source) here
          };
          setRecipe(finalRecipe);
        } else if (result.errors) {
          const errorMsg = result.errors.general?.join(', ') || result.errors.recipeName?.join(', ') || 'Error generating recipe details.';
          setError(`AI Error: ${errorMsg}. Displaying basic info.`);
          const mockRecipe = getMockRecipeDetails(recipeNameParam, sourceImg);
          mockRecipe.id = id || mockRecipe.id; // Use resolved id
          setRecipe(mockRecipe);
        } else {
          setError("Failed to generate recipe details from AI. Displaying basic info.");
          const mockRecipe = getMockRecipeDetails(recipeNameParam, sourceImg);
          mockRecipe.id = id || mockRecipe.id; // Use resolved id
          setRecipe(mockRecipe);
        }
      } catch (e) {
        console.error("Error fetching AI recipe details:", e);
        setError(`Fetch Error: ${e instanceof Error ? e.message : String(e)}. Displaying basic info.`);
        const mockRecipe = getMockRecipeDetails(recipeNameParam, sourceImg);
        mockRecipe.id = id || mockRecipe.id; // Use resolved id
        setRecipe(mockRecipe);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetails();

  }, [searchParams, id]); // Use resolved id in dependency array


  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Your recipe is cooking... please wait!</p>
            <p className="text-sm text-muted-foreground">Our AI chef is preparing simple instructions for you.</p>
        </div>
    );
  }

  if (error && !recipe) { 
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
  
  return (
    <div>
      {error && recipe && ( 
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
