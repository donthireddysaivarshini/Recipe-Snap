export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: string; // Could be slugified name or a generated ID
  name: string;
  description: string;
  imageUrl?: string; // URL for the recipe image (can be the uploaded one or a stock photo)
  sourceImage?: string; // Data URI of the user-uploaded ingredient image
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  // Additional fields as needed
}

// For Recipe Snap, the AI currently only returns recipe names.
// This type represents the data we'll actually work with post-AI and for saved recipes.
export interface SuggestedRecipe {
  name: string;
  // We might add a temporary ID if needed before full details are fetched/mocked
}

export interface SavedRecipe extends Recipe {
  userId: string; // To associate with a user
  savedAt: string; // ISO date string
}

// Structure for what's stored in localStorage for saved recipes (simplified)
export interface LocalSavedRecipe {
  name: string;
  sourceImage?: string; // Data URI of the user-uploaded ingredient image
  // We'll use mocked details for display, so only name and source image are essential for "saving"
}
