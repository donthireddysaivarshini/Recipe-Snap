
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Recipe } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-');          // Replace multiple - with single -
}


// Mock function to generate recipe details - SIMPLIFIED LANGUAGE
export function getMockRecipeDetails(name: string, sourceImage?: string): Recipe {
  const slug = slugify(name);
  return {
    id: slug,
    name: name,
    description: `This is a simple and yummy ${name.toLowerCase()}. Easy to make at home.`,
    imageUrl: `https://placehold.co/800x600.png`, // Generic placeholder, text removed
    sourceImage: sourceImage, // This is the user-uploaded ingredients image
    ingredients: [
      { name: 'Main food (like Chicken or Potato)', quantity: '2', unit: 'pieces (medium size)' },
      { name: 'Vegetable (like Onion or Tomato)', quantity: '1', unit: 'medium size' },
      { name: 'Garlic', quantity: '2', unit: 'small pieces (cloves)' },
      { name: 'Green leaf (like Coriander or Parsley)', quantity: 'A little bit', unit: 'chopped' },
      { name: 'Powder masala (like Turmeric or Chilli powder)', quantity: '1', unit: 'small spoon (teaspoon)' },
      { name: 'Oil (like Sunflower or Groundnut oil)', quantity: '2', unit: 'big spoons (tablespoons)' },
      { name: 'Salt', quantity: 'A little bit', unit: 'for taste' },
      { name: 'Black Pepper powder', quantity: 'A little bit', unit: 'for taste (optional)' },
    ],
    instructions: [
      `Get all your food items ready for making ${name.toLowerCase()}. Cut the vegetables into small pieces.`,
      'Put a cooking pan on the stove. Turn the stove to medium heat.',
      'Add the oil to the pan. Wait for 1 minute for the oil to get warm.',
      'Put the garlic in the pan. Cook for 1 minute until it smells good.',
      `Add the main food (like chicken or potato). Cook for 5-7 minutes. If it's chicken, cook until it turns white. Stir it sometimes.`,
      'Now, add the vegetables and powder masala. Mix everything well. Cook for 3-4 minutes until vegetables are a little soft.',
      `Add salt and pepper if you like. Mix well.`,
      `Put the green leaves on top. Your ${name.toLowerCase()} is ready! Eat it while it's hot.`,
    ],
    prepTime: 'About 15 minutes',
    cookTime: 'About 25 minutes',
    servings: 'For 2-3 people',
  };
}
