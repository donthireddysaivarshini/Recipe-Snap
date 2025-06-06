
"use client";

import RecipeList from '@/components/recipe/RecipeList';
import { useSavedRecipes } from '@/contexts/SavedRecipesContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookHeart, PlusCircle } from 'lucide-react';
import { slugify } from '@/lib/utils'; // Import slugify

export default function SavedRecipesPage() {
  const { savedRecipes } = useSavedRecipes();

  const recipesToDisplay = savedRecipes.map(r => {
    // Ensure there's always an image URL.
    // Prefer user's uploaded sourceImage, then the recipe's imageUrl, then a final fallback.
    const recipeNameForImage = r.name || "Recipe";
    const displayImage = r.sourceImage || r.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(recipeNameForImage)}`;
    
    return {
      name: r.name,
      sourceImage: displayImage
    };
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-b">
        <div className="flex items-center gap-3">
          <BookHeart size={36} className="text-primary" />
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            Your Saved Recipes
          </h1>
        </div>
        <Button asChild>
          <Link href="/app/generator">
            <PlusCircle className="mr-2 h-5 w-5" /> Find New Recipes
          </Link>
        </Button>
      </section>
      
      {savedRecipes.length > 0 ? (
        <RecipeList recipes={recipesToDisplay} title="" />
      ) : (
        <div className="text-center py-16 bg-card rounded-lg shadow-sm">
          <BookHeart size={64} className="mx-auto mb-6 text-muted-foreground/50" />
          <h2 className="text-2xl font-headline font-semibold mb-3 text-foreground">
            No Saved Recipes Yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Looks like your recipe book is empty. Start exploring and save your favorites!
          </p>
          <Button size="lg" asChild>
            <Link href="/app/generator">Discover Recipes</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
