
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-ingredients.ts';
import '@/ai/flows/generate-recipes-from-ingredients-flow.ts';
import '@/ai/flows/generate-simple-recipe-details-flow.ts';
