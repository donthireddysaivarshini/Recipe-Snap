
'use server';
/**
 * @fileOverview An AI agent that suggests recipes based on a list of ingredients.
 *
 * - generateRecipesFromIngredients - A function that handles recipe suggestion from a list of ingredients.
 * - GenerateRecipesFromIngredientsInput - The input type for the function.
 * - GenerateRecipesFromIngredientsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipesFromIngredientsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required.")
    .describe('An array of ingredient names in basic English.'),
});
export type GenerateRecipesFromIngredientsInput = z.infer<typeof GenerateRecipesFromIngredientsInputSchema>;

const GenerateRecipesFromIngredientsOutputSchema = z.object({
  recipes: z
    .array(z.string())
    .describe('An array of recipe name suggestions in simple, easy-to-understand English, based on the provided ingredients.'),
});
export type GenerateRecipesFromIngredientsOutput = z.infer<typeof GenerateRecipesFromIngredientsOutputSchema>;

export async function generateRecipesFromIngredients(input: GenerateRecipesFromIngredientsInput): Promise<GenerateRecipesFromIngredientsOutput> {
  return generateRecipesFromIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipesFromIngredientsPrompt',
  input: {schema: GenerateRecipesFromIngredientsInputSchema},
  output: {schema: GenerateRecipesFromIngredientsOutputSchema},
  prompt: `You are a recipe suggestion AI. Your user understands basic English and is new to cooking.
  Given a list of ingredients, suggest 3-5 recipe names.
  Recipe names should be very simple, descriptive, and easy for a beginner to understand (e.g., "Easy Chicken Stir-fry", "Simple Tomato Soup", "Basic Potato Curry").
  Prioritize recipes that make good use of the provided ingredients.

  Ingredients available:
  {{#each ingredients}}
  - {{{this}}}
  {{/each}}

  Respond with an array of simple recipe name suggestions.`,
});

const generateRecipesFromIngredientsFlow = ai.defineFlow(
  {
    name: 'generateRecipesFromIngredientsFlow',
    inputSchema: GenerateRecipesFromIngredientsInputSchema,
    outputSchema: GenerateRecipesFromIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
