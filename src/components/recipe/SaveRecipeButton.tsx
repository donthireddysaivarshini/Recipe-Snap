"use client";

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Recipe } from '@/lib/types';
import { useSavedRecipes } from '@/contexts/SavedRecipesContext';

interface SaveRecipeButtonProps {
  recipe: Recipe; // Full recipe details for saving
}

export default function SaveRecipeButton({ recipe }: SaveRecipeButtonProps) {
  const { toast } = useToast();
  const { savedRecipes, addRecipe, removeRecipe } = useSavedRecipes();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(savedRecipes.some(r => r.id === recipe.id));
  }, [savedRecipes, recipe.id]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if button is inside a link
    e.stopPropagation();
    
    if (isSaved) {
      removeRecipe(recipe.id);
      toast({
        title: "Recipe Unsaved",
        description: `${recipe.name} has been removed from your saved recipes.`,
      });
    } else {
      addRecipe(recipe);
      toast({
        title: "Recipe Saved!",
        description: `${recipe.name} has been added to your saved recipes.`,
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleSave}
      aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
      className="rounded-full hover:bg-destructive/10 text-destructive data-[saved=true]:bg-destructive/10 data-[saved=true]:text-destructive"
      data-saved={isSaved}
    >
      <Heart fill={isSaved ? "currentColor" : "none"} className="h-6 w-6" />
    </Button>
  );
}
