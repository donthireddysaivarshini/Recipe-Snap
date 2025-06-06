
'use server';

import { analyzeIngredients as analyzeIngredientsFlowInternal, type AnalyzeIngredientsInput, type AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients';
import { generateRecipesFromIngredients as generateRecipesFromIngredientsFlowInternal, type GenerateRecipesFromIngredientsInput, type GenerateRecipesFromIngredientsOutput } from '@/ai/flows/generate-recipes-from-ingredients-flow';
import { generateSimpleRecipeDetails as generateSimpleRecipeDetailsFlowInternal, type GenerateSimpleRecipeDetailsInput, type GenerateSimpleRecipeDetailsOutput } from '@/ai/flows/generate-simple-recipe-details-flow';
import type { Recipe } from '@/lib/types';
import { z } from 'zod';

const AnalyzeIngredientsSchema = z.object({
  photoDataUri: z.string().min(1, "Photo data URI is required."),
  // photoDataUriUsedInAnalysis: z.string().optional(), // Internal use, not from form
});

export type AnalyzeIngredientsState = {
  message?: string | null;
  ingredients?: string[] | null;
  errors?: {
    photoDataUri?: string[];
    general?: string[];
  } | null;
  timestamp?: number;
  photoDataUriUsedInAnalysis?: string | null; // Store the URI used for this state
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
      photoDataUriUsedInAnalysis: null, // Explicitly null on validation failure
    };
  }

  const { photoDataUri } = validatedFields.data;

  try {
    const aiInput: AnalyzeIngredientsInput = { photoDataUri };
    const result: AnalyzeIngredientsOutput = await analyzeIngredientsFlowInternal(aiInput);
    
    if (result.ingredients && result.ingredients.length > 0) {
      return {
        message: 'Ingredients analyzed successfully! Please review them.',
        ingredients: result.ingredients,
        errors: null,
        timestamp: Date.now(),
        photoDataUriUsedInAnalysis: photoDataUri,
      };
    } else {
      return {
        message: 'No ingredients could be identified from the image. Try a different photo or add ingredients manually.',
        ingredients: [],
        errors: null,
        timestamp: Date.now(),
        photoDataUriUsedInAnalysis: photoDataUri,
      };
    }
  } catch (error)
 {
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
      photoDataUriUsedInAnalysis: photoDataUri, // Still note which photo caused error
    };
  }
}

const GenerateRecipesFromListSchema = z.object({
  ingredients: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(s => s) : []),
    z.array(z.string().min(1, "Ingredient name cannot be empty.")).min(1, "At least one ingredient is required.")
  ),
  photoDataUriForRecipeSource: z.string().optional(), // To carry over the source image for the recipes
});

export type GenerateRecipesState = {
  message?: string | null;
  recipes?: Array<{ name: string; description: string; }> | null; // Array of recipe ideas with names & descriptions
  errors?: {
    ingredients?: string[];
    general?: string[];
  } | null;
  timestamp?: number;
  photoDataUriUsedForIdeas?: string | null; // Store the URI used for generating these ideas
};

export async function generateRecipesFromIngredientsListAction(
  prevState: GenerateRecipesState | undefined,
  formData: FormData
): Promise<GenerateRecipesState> {
  const validatedFields = GenerateRecipesFromListSchema.safeParse({
    ingredients: formData.get('ingredients'), 
    photoDataUriForRecipeSource: formData.get('photoDataUriForRecipeSource'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please provide a valid list of ingredients.',
      timestamp: Date.now(),
      photoDataUriUsedForIdeas: String(formData.get('photoDataUriForRecipeSource') || null),
    };
  }

  const { ingredients, photoDataUriForRecipeSource } = validatedFields.data;

  try {
    const aiInput: GenerateRecipesFromIngredientsInput = { ingredients };
    // The AI output now includes { name: string, description: string } for each recipe
    const result: GenerateRecipesFromIngredientsOutput = await generateRecipesFromIngredientsFlowInternal(aiInput); 
    
    if (result.recipes && result.recipes.length > 0) {
      return {
        message: 'Recipe ideas generated successfully!',
        recipes: result.recipes, // This is now an array of objects
        errors: null,
        timestamp: Date.now(),
        photoDataUriUsedForIdeas: photoDataUriForRecipeSource || null,
      };
    } else {
      return {
        message: 'No recipe ideas found for the provided ingredients. Try adjusting your list.',
        recipes: [],
        errors: null,
        timestamp: Date.now(),
        photoDataUriUsedForIdeas: photoDataUriForRecipeSource || null,
      };
    }
  } catch (error) {
    console.error('Error generating recipes from list:', error);
    let errorMessage = 'An unexpected error occurred while generating recipe ideas.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return {
      message: `Error: ${errorMessage}`,
      errors: { general: [errorMessage] },
      recipes: null,
      timestamp: Date.now(),
      photoDataUriUsedForIdeas: photoDataUriForRecipeSource || null,
    };
  }
}


const GenerateSimpleRecipeDetailsSchema = z.object({
  recipeName: z.string().min(1, "Recipe name is required."),
  ingredientsListStr: z.string().optional(), // Comma-separated string
});

export type GenerateSimpleRecipeDetailsState = {
  message?: string | null;
  recipe?: Recipe | null; // Full Recipe object
  errors?: {
    recipeName?: string[];
    ingredientsList?: string[];
    general?: string[];
  } | null;
  timestamp?: number;
}

// This server action will be called from the RecipeDetailPage to fetch AI-generated details.
export async function generateSimpleRecipeDetailsAction(
  recipeName: string,
  ingredientsListStr?: string // Optional comma-separated string of ingredients for context
): Promise<GenerateSimpleRecipeDetailsState> {
  
  const validatedFields = GenerateSimpleRecipeDetailsSchema.safeParse({
    recipeName,
    ingredientsListStr,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Recipe name is required.',
      timestamp: Date.now(),
    };
  }

  const { recipeName: validatedRecipeName, ingredientsListStr: validatedIngredientsListStr } = validatedFields.data;
  
  const ingredientsList = validatedIngredientsListStr?.split(',').map(s => s.trim()).filter(s => s) || [];

  try {
    const aiInput: GenerateSimpleRecipeDetailsInput = { 
      recipeName: validatedRecipeName,
      ...(ingredientsList.length > 0 && { ingredientsList }), // only include if not empty
    };
    const result: GenerateSimpleRecipeDetailsOutput = await generateSimpleRecipeDetailsFlowInternal(aiInput);
    
    const recipeOutput: Recipe = {
        ...result,
        sourceImage: undefined, 
    };

    return {
      message: 'Recipe details generated successfully!',
      recipe: recipeOutput,
      errors: null,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error generating simple recipe details:', error);
    let errorMessage = 'An unexpected error occurred while generating recipe details.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return {
      message: `Error: ${errorMessage}`,
      errors: { general: [errorMessage] },
      recipe: null,
      timestamp: Date.now(),
    };
  }
}

