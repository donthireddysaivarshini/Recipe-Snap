
import RecipeCard from './RecipeCard';
import type { LocalSavedRecipe } from '@/lib/types';

interface RecipeListProps {
  recipes: LocalSavedRecipe[];
  title?: string;
  hideCardImage?: boolean;
  ingredientsForCards?: string; // Optional: comma-separated ingredients list
}

export default function RecipeList({ recipes, title = "Recipe Ideas", hideCardImage = false, ingredientsForCards }: RecipeListProps) {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-lg">{title === "Recipe Ideas" ? "No recipe ideas yet. Try uploading an image and adding ingredients!" : "No saved recipes found."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {title && <h2 className="text-2xl md:text-3xl font-headline font-semibold text-foreground">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <RecipeCard 
            key={`${recipe.name}-${index}`} 
            recipe={recipe} 
            hideImage={hideCardImage} 
            ingredientsForLink={ingredientsForCards} // Pass ingredients for the link
          />
        ))}
      </div>
    </div>
  );
}
