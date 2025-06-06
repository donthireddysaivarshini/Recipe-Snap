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


// Mock function to generate recipe details
export function getMockRecipeDetails(name: string, sourceImage?: string): Recipe {
  const slug = slugify(name);
  const commonHints = ["delicious food", "home cooking", "fresh ingredients", "tasty meal"];
  const randomHint = commonHints[Math.floor(Math.random() * commonHints.length)];
  return {
    id: slug,
    name: name,
    description: `A delicious and easy-to-make ${name.toLowerCase()} featuring fresh ingredients. Perfect for any occasion.`,
    imageUrl: `https://placehold.co/800x600.png?text=${encodeURIComponent(name)}`,
    sourceImage: sourceImage,
    ingredients: [
      { name: 'Main Ingredient (e.g., Chicken Breast)', quantity: '2', unit: 'pieces' },
      { name: 'Vegetable (e.g., Bell Pepper)', quantity: '1', unit: 'medium' },
      { name: 'Aromatic (e.g., Garlic)', quantity: '2', unit: 'cloves' },
      { name: 'Herb (e.g., Parsley)', quantity: '1/4', unit: 'cup, chopped' },
      { name: 'Spice (e.g., Paprika)', quantity: '1', unit: 'tsp' },
      { name: 'Olive Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to', unit: 'taste' },
      { name: 'Pepper', quantity: 'to', unit: 'taste' },
    ],
    instructions: [
      `Prepare all ingredients for ${name.toLowerCase()}. Chop vegetables and measure spices.`,
      'Heat olive oil in a pan over medium heat. Add aromatics and cook until fragrant.',
      `Add the main ingredient and cook until browned on all sides. For ${name.toLowerCase()}, ensure it's cooked through.`,
      'Stir in vegetables and spices. Cook until vegetables are tender-crisp.',
      `Garnish with fresh herbs. Serve your ${name.toLowerCase()} hot and enjoy!`,
    ],
    prepTime: '15 min',
    cookTime: '25 min',
    servings: '2-4 servings',
  };
}
