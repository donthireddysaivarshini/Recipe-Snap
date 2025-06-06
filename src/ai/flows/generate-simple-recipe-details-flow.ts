
'use server';
/**
 * @fileOverview An AI agent that generates simple, detailed recipes for beginners.
 *
 * - generateSimpleRecipeDetails - A function that generates full recipe details in simple English.
 * - GenerateSimpleRecipeDetailsInput - The input type for the function.
 * - GenerateSimpleRecipeDetailsOutput - The return type for the function (conforming to Recipe type).
 */

import {ai}from '@/ai/genkit';
import {z} from 'genkit';
import { slugify } from '@/lib/utils'; // Assuming slugify is in utils

// Define Zod schemas for ingredients and the full recipe
const IngredientSchema = z.object({
  name: z.string().describe("Name of the ingredient in simple English."),
  quantity: z.string().describe("Quantity of the ingredient (e.g., '1', '200', 'a pinch'). Use simple terms."),
  unit: z.string().describe("Unit for the quantity (e.g., 'small onion', 'ml', 'grams', 'cup', 'spoon', 'piece'). Use simple terms."),
});

const GenerateSimpleRecipeDetailsOutputSchema = z.object({
  id: z.string().describe("A unique ID for the recipe, can be a slug of the name."),
  name: z.string().describe("The recipe name in simple, descriptive English."),
  description: z.string().describe("A very short (1-2 sentences) and simple description of the recipe using basic English."),
  ingredients: z.array(IngredientSchema).describe("List of ingredients with simple names, quantities, and units."),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions in very basic English, explaining actions clearly, specifying heat levels (low, medium, high) and cooking times."),
  prepTime: z.string().describe("Estimated preparation time (e.g., '10 minutes', 'about 15 minutes')."),
  cookTime: z.string().describe("Estimated cooking time (e.g., '20 minutes', 'around 30 minutes')."),
  servings: z.string().describe("Number of servings the recipe makes (e.g., '2 people', 'serves 3-4')."),
  imageUrl: z.string().optional().describe("Optional: A URL to a placeholder image for the recipe (e.g., using placehold.co). Example: https://placehold.co/600x400.png"),
});
export type GenerateSimpleRecipeDetailsOutput = z.infer<typeof GenerateSimpleRecipeDetailsOutputSchema>;

const GenerateSimpleRecipeDetailsInputSchema = z.object({
  recipeName: z.string().describe("The name of the recipe for which to generate details."),
  ingredientsList: z.array(z.string()).optional().describe("Optional: List of main ingredients available, for context."),
});
export type GenerateSimpleRecipeDetailsInput = z.infer<typeof GenerateSimpleRecipeDetailsInputSchema>;


export async function generateSimpleRecipeDetails(input: GenerateSimpleRecipeDetailsInput): Promise<GenerateSimpleRecipeDetailsOutput> {
  return generateSimpleRecipeDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSimpleRecipeDetailsPrompt',
  input: {schema: GenerateSimpleRecipeDetailsInputSchema},
  output: {schema: GenerateSimpleRecipeDetailsOutputSchema},
  prompt: `You are a friendly cooking assistant for absolute beginners who understand only very basic English.
Your goal is to provide a complete recipe that is extremely easy to follow.

Recipe Name: {{{recipeName}}}
{{#if ingredientsList}}
Main Ingredients Available (for context, you can add more common ingredients if needed for a complete recipe):
{{#each ingredientsList}}
- {{{this}}}
{{/each}}
{{/if}}

Please generate the full recipe details based on the recipe name and available ingredients.

Follow these instructions VERY CAREFULLY:

1.  **id**: Create a unique ID for the recipe by making the recipe name lowercase and replacing spaces with hyphens (a slug).
2.  **name**: Use the provided "{{recipeName}}".
3.  **description**: Write a 1-2 sentence description of what the dish is, using very simple words.
4.  **ingredients**:
    *   List all necessary ingredients.
    *   For each ingredient, specify the 'name' in basic English.
    *   For 'quantity' and 'unit', use common household terms or simple standard units. Examples:
        *   Quantity: "1", Unit: "small onion"
        *   Quantity: "2", Unit: "spoons" (for sugar, oil, etc.)
        *   Quantity: "1/2", Unit: "cup" (for water, flour etc.)
        *   Quantity: "A little bit of", Unit: "salt" (or "Pinch of salt")
        *   Quantity: "1", Unit: "piece" (for chicken, fish etc.)
        *   If using grams or ml, keep numbers simple (e.g., "100 grams flour", "200 ml water").
5.  **instructions**:
    *   Provide clear, numbered, step-by-step instructions.
    *   Use very simple English, short sentences.
    *   Explain every action (e.g., "Cut the onion into small pieces," "Put a pan on the stove," "Turn the heat to medium," "Wait for the oil to get hot").
    *   Specify heat levels: "low heat," "medium heat," or "high heat."
    *   Mention cooking times for steps when important (e.g., "Cook for 5 minutes," "Stir for 1 minute until it turns brown").
    *   Be explicit about the order of adding ingredients.
    *   Example instruction: "1. Cut the chicken into small pieces. 2. Put 2 spoons of oil in a pan. 3. Turn the stove to medium heat. 4. When the oil is hot, add the chicken pieces. 5. Cook for 5-7 minutes until chicken is white. Stir sometimes."
6.  **prepTime**: Estimate preparation time in simple terms (e.g., "About 10 minutes").
7.  **cookTime**: Estimate cooking time in simple terms (e.g., "Around 20 minutes").
8.  **servings**: State how many people the recipe serves (e.g., "For 2 people," "Makes 3 servings").
9.  **imageUrl**: Provide a placeholder image URL using placehold.co, like "https://placehold.co/600x400.png". Do not add text to the placeholder URL.

Ensure the output strictly follows the defined JSON schema structure.
`,
});

const generateSimpleRecipeDetailsFlow = ai.defineFlow(
  {
    name: 'generateSimpleRecipeDetailsFlow',
    inputSchema: GenerateSimpleRecipeDetailsInputSchema,
    outputSchema: GenerateSimpleRecipeDetailsOutputSchema,
  },
  async (input: GenerateSimpleRecipeDetailsInput) => {
    const filledInput = {
        ...input,
        id: slugify(input.recipeName), // Pre-fill id if not directly generated by LLM as per schema
    };
    const {output} = await prompt(filledInput);
    // Ensure the ID from input (slugified name) is used if LLM doesn't populate it or overwrites.
    // The prompt now asks LLM to generate it based on slug logic.
    // However, it's safer to ensure it here too.
    if (output && !output.id) {
        output.id = slugify(input.recipeName);
    } else if (output && output.id !== slugify(input.recipeName)) {
        // If LLM generates a different ID, prioritize the slugified one for consistency
        // output.id = slugify(input.recipeName); 
        // Decided to let LLM fill it as per prompt, but schema requires it.
        // If it is critical to override, uncomment above.
    }
    return output!;
  }
);
