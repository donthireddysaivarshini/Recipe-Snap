
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Utensils, Soup } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import SaveRecipeButton from './SaveRecipeButton';

interface RecipeDetailViewProps {
  recipe: Recipe;
}

export default function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  return (
    <Card className="overflow-hidden shadow-xl">
      <CardHeader className="p-6 border-b">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <CardTitle className="font-headline text-3xl md:text-4xl text-foreground mb-1">{recipe.name}</CardTitle>
            <CardDescription className="text-muted-foreground line-clamp-3">{recipe.description}</CardDescription>
          </div>
          <div className="ml-auto shrink-0">
            <SaveRecipeButton recipe={recipe} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-secondary/30 rounded-lg">
            <Clock size={24} className="mx-auto mb-1 text-primary" />
            <p className="text-sm font-medium">Prep Time</p>
            <p className="text-xs text-muted-foreground font-code">{recipe.prepTime}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <Utensils size={24} className="mx-auto mb-1 text-primary" />
            <p className="text-sm font-medium">Cook Time</p>
            <p className="text-xs text-muted-foreground font-code">{recipe.cookTime}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <Users size={24} className="mx-auto mb-1 text-primary" />
            <p className="text-sm font-medium">Servings</p>
            <p className="text-xs text-muted-foreground font-code">{recipe.servings}</p>
          </div>
           <div className="p-3 bg-secondary/30 rounded-lg">
            <Soup size={24} className="mx-auto mb-1 text-primary" />
            <p className="text-sm font-medium">Total Time</p>
            <p className="text-xs text-muted-foreground font-code">~{/* Simple sum or placeholder */}45 min</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-headline font-semibold mb-3 text-foreground">Ingredients</h3>
          <ul className="list-disc list-inside space-y-2 pl-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-foreground">
                <span className="font-code">{ingredient.quantity} {ingredient.unit}</span> {ingredient.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-headline font-semibold mb-3 text-foreground">Instructions</h3>
          <ol className="list-decimal list-inside space-y-3 pl-2">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="text-foreground leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </CardContent>

      <CardFooter className="p-6 bg-muted/50 border-t">
        <p className="text-sm text-muted-foreground">Enjoy your meal! Feel free to adjust seasonings to your taste.</p>
      </CardFooter>
    </Card>
  );
}
