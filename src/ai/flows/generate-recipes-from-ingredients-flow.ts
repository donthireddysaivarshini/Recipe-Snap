
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

const RecipeIdeaSchema = z.object({
  name: z.string().describe("The recipe name in simple, descriptive English."),
  description: z.string().describe("A very short (1 sentence) and simple description of the recipe idea using basic English, suitable for a card display."),
});

const GenerateRecipesFromIngredientsOutputSchema = z.object({
  recipes: z
    .array(RecipeIdeaSchema)
    .describe('An array of recipe ideas, each with a simple name and a very short description, based on the provided ingredients.'),
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
  Given a list of ingredients, suggest 3-5 recipe ideas.
  For each recipe idea:
  1.  Provide a 'name' that is very simple, descriptive, and easy for a beginner to understand (e.g., "Easy Chicken Stir-fry", "Simple Tomato Soup", "Basic Potato Curry").
  2.  Provide a 'description' that is a single, very short sentence explaining what the dish is in basic English. This description will be shown on a small card. (e.g., "A quick and tasty chicken dish with vegetables.", "A warm and comforting soup made with fresh tomatoes.", "An easy potato curry for a simple meal.").
  Prioritize recipes that make good use of the provided ingredients.

  Ingredients available:
  {{#each ingredients}}
  - {{{this}}}
  {{/each}}

  Respond with an array of recipe ideas, each being an object with 'name' and 'description'.`,
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

