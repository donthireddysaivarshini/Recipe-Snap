'use server';

import { analyzeIngredients as analyzeIngredientsFlow, type AnalyzeIngredientsInput, type AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients';
import { z } from 'zod';

const GenerateRecipesInputSchema = z.object({
  photoDataUri: z.string().min(1, "Photo data URI is required."),
});

export type GenerateRecipesState = {
  message?: string | null;
  recipes?: string[] | null;
  errors?: {
    photoDataUri?: string[];
    general?: string[];
  } | null;
  timestamp?: number; // To help trigger re-renders if needed
};

export async function generateRecipesAction(
  prevState: GenerateRecipesState | undefined,
  formData: FormData
): Promise<GenerateRecipesState> {
  const validatedFields = GenerateRecipesInputSchema.safeParse({
    photoDataUri: formData.get('photoDataUri'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please provide a valid image.',
      timestamp: Date.now(),
    };
  }

  const { photoDataUri } = validatedFields.data;

  try {
    const aiInput: AnalyzeIngredientsInput = { photoDataUri };
    const result: AnalyzeIngredientsOutput = await analyzeIngredientsFlow(aiInput);
    
    if (result.recipes && result.recipes.length > 0) {
      return {
        message: 'Recipes generated successfully!',
        recipes: result.recipes,
        errors: null,
        timestamp: Date.now(),
      };
    } else {
      return {
        message: 'No recipes found for the ingredients. Try a different image.',
        recipes: [],
        errors: null,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.error('Error generating recipes:', error);
    let errorMessage = 'An unexpected error occurred while generating recipes.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return {
      message: `Error: ${errorMessage}`,
      errors: { general: [errorMessage] },
      recipes: null,
      timestamp: Date.now(),
    };
  }
}

// Placeholder for saving a recipe
export async function saveRecipeAction(recipeName: string, sourceImage?: string) {
  // This would interact with a database in a real application
  console.log('Attempting to save recipe:', recipeName, 'from image:', sourceImage ? sourceImage.substring(0,30) + "..." : "N/A");
  // For now, this is handled client-side via SavedRecipesContext and localStorage
  // Returning a success message for potential UI feedback
  return { success: true, message: `${recipeName} saved (mocked).` };
}
