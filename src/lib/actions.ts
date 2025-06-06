
'use server';

import { analyzeIngredients as analyzeIngredientsFlowInternal, type AnalyzeIngredientsInput, type AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients';
import { generateRecipesFromIngredients as generateRecipesFromIngredientsFlowInternal, type GenerateRecipesFromIngredientsInput, type GenerateRecipesFromIngredientsOutput } from '@/ai/flows/generate-recipes-from-ingredients-flow';
import { z } from 'zod';

const AnalyzeIngredientsSchema = z.object({
  photoDataUri: z.string().min(1, "Photo data URI is required."),
});

export type AnalyzeIngredientsState = {
  message?: string | null;
  ingredients?: string[] | null;
  errors?: {
    photoDataUri?: string[];
    general?: string[];
  } | null;
  timestamp?: number;
};

export async function analyzeIngredientsAction(
  prevState: AnalyzeIngredientsState | undefined,
  formData: FormData
): Promise<AnalyzeIngredientsState> {
  const validatedFields = AnalyzeIngredientsSchema.safeParse({
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
    const result: AnalyzeIngredientsOutput = await analyzeIngredientsFlowInternal(aiInput);
    
    if (result.ingredients && result.ingredients.length > 0) {
      return {
        message: 'Ingredients analyzed successfully!',
        ingredients: result.ingredients,
        errors: null,
        timestamp: Date.now(),
      };
    } else {
      return {
        message: 'No ingredients could be identified from the image. Try a different photo or add ingredients manually.',
        ingredients: [],
        errors: null,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    let errorMessage = 'An unexpected error occurred while analyzing ingredients.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return {
      message: `Error: ${errorMessage}`,
      errors: { general: [errorMessage] },
      ingredients: null,
      timestamp: Date.now(),
    };
  }
}

const GenerateRecipesFromListSchema = z.object({
  ingredients: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',') : []),
    z.array(z.string().min(1, "Ingredient name cannot be empty.")).min(1, "At least one ingredient is required.")
  )
});

export type GenerateRecipesState = {
  message?: string | null;
  recipes?: string[] | null;
  errors?: {
    ingredients?: string[];
    general?: string[];
  } | null;
  timestamp?: number;
};

export async function generateRecipesFromIngredientsListAction(
  prevState: GenerateRecipesState | undefined,
  formData: FormData
): Promise<GenerateRecipesState> {
  const validatedFields = GenerateRecipesFromListSchema.safeParse({
    ingredients: formData.get('ingredients'), // Expecting a comma-separated string
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please provide a valid list of ingredients.',
      timestamp: Date.now(),
    };
  }

  const { ingredients } = validatedFields.data;

  try {
    const aiInput: GenerateRecipesFromIngredientsInput = { ingredients };
    const result: GenerateRecipesFromIngredientsOutput = await generateRecipesFromIngredientsFlowInternal(aiInput);
    
    if (result.recipes && result.recipes.length > 0) {
      return {
        message: 'Recipes generated successfully!',
        recipes: result.recipes,
        errors: null,
        timestamp: Date.now(),
      };
    } else {
      return {
        message: 'No recipes found for the provided ingredients. Try adjusting your list.',
        recipes: [],
        errors: null,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.error('Error generating recipes from list:', error);
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
