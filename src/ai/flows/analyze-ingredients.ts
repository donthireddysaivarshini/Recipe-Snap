
'use server';

/**
 * @fileOverview An AI agent that analyzes ingredients from a photo.
 *
 * - analyzeIngredients - A function that handles the ingredient analysis.
 * - AnalyzeIngredientsInput - The input type for the analyzeIngredients function.
 * - AnalyzeIngredientsOutput - The return type for the analyzeIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeIngredientsInput = z.infer<typeof AnalyzeIngredientsInputSchema>;

const AnalyzeIngredientsOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('An array of identified ingredient names from the photo, using very common and basic English terms.'),
});
export type AnalyzeIngredientsOutput = z.infer<typeof AnalyzeIngredientsOutputSchema>;

export async function analyzeIngredients(input: AnalyzeIngredientsInput): Promise<AnalyzeIngredientsOutput> {
  return analyzeIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeIngredientsPrompt',
  input: {schema: AnalyzeIngredientsInputSchema},
  output: {schema: AnalyzeIngredientsOutputSchema},
  prompt: `You are an ingredient recognition AI. Your user understands basic English.
  Given a photo of ingredients, identify all visible food ingredients.
  Use only very common, simple English names for ingredients. For example, if you see a 'Granny Smith apple', return 'apple'.
  If you see 'boneless, skinless chicken thighs', return 'chicken'.
  If you see 'capsicum', return 'bell pepper' or 'pepper'.
  Return a list of unique ingredient names.

  Ingredients Photo: {{media url=photoDataUri}}`,
});

const analyzeIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzeIngredientsFlow',
    inputSchema: AnalyzeIngredientsInputSchema,
    outputSchema: AnalyzeIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
