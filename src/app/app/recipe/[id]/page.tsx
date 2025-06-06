"use client";

import { useSearchParams } from 'next/navigation';
import RecipeDetailView from '@/components/recipe/RecipeDetailView';
import { getMockRecipeDetails } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const recipeName = searchParams.get('name');
  const recipeImage = searchParams.get('image');

  if (!recipeName) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Recipe name not found. Please go back and select a recipe.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Use the slugified ID from params if needed, but recipeName is primary from query
  const recipe = getMockRecipeDetails(recipeName, recipeImage || undefined);
  // Override ID if param.id is different, ensuring consistency
  recipe.id = params.id || recipe.id;


  return (
    <div>
      <RecipeDetailView recipe={recipe} />
    </div>
  );
}
